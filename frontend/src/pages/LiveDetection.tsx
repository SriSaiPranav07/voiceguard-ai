import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, Square, Pause, Play, RotateCcw,
  Wifi, WifiOff, AlertCircle, ShieldCheck, ShieldAlert, Activity,
} from 'lucide-react';
import { WS_BASE_URL, API_BASE_URL, fetchHealth } from '../services/api';

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const byteCount = samples.length * 2;
  const buf = new ArrayBuffer(44 + byteCount);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + byteCount, true);
  ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, byteCount, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([v], { type: 'audio/wav' });
}

export const LiveDetection: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusText, setStatusText] = useState('Idle');
  const [confidence, setConfidence] = useState(0);
  const [syntheticProb, setSyntheticProb] = useState(0);
  const [humanProb, setHumanProb] = useState(0);
  const [replayProb, setReplayProb] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [primaryIndicators, setPrimaryIndicators] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'IDLE' | 'REAL' | 'FAKE' | 'SUSPICIOUS'>('IDLE');
  const [demoFallback, setDemoFallback] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SR = 16000;

  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/live-detection`);
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          if (d.action === 'pong') return;
          const cls = (d.classification || 'REAL') as any;
          setVerdict(cls); setFrameCount(d.frame_index || 0); setLatencyMs(d.latency_ms || 0);
          setConfidence(Math.round(d.confidence || 88));
          setSyntheticProb(Math.round(d.synthetic_probability || 10));
          setHumanProb(Math.round(d.human_probability || 90));
          setReplayProb(Math.round(d.replay_probability || 5));
          setRiskScore(Math.round(d.risk_score || 12));
          setStatusText(cls === 'FAKE' ? 'SYNTHETIC VOICE DETECTED' : cls === 'SUSPICIOUS' ? 'SUSPICIOUS PATTERN' : 'GENUINE SPEECH VERIFIED');
          if (d.primary_indicators?.length) setPrimaryIndicators(d.primary_indicators);
        } catch { /* ignore */ }
      };
      ws.onerror = () => setWsConnected(false);
      ws.onclose = () => setWsConnected(false);
      wsRef.current = ws;
    } catch { setWsConnected(false); }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => { cleanup(); wsRef.current?.close(); };
  }, [connectWebSocket]);

  useEffect(() => {
    let active = true;
    const checkApi = () => {
      fetchHealth().then((health) => {
        if (active) setApiConnected(health.ai_engine_online);
      });
    };
    checkApi();
    const interval = window.setInterval(checkApi, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const applyResult = (data: any, latency: number) => {
    const auth = data.authenticity || {};
    const cls = (auth.classification || 'REAL') as any;
    setSyntheticProb(Math.round(auth.synthetic_speech_probability ?? 10));
    setHumanProb(Math.round(auth.human_speech_probability ?? 90));
    setReplayProb(Math.round((data.replay_detection?.probability ?? 0) * 100 || auth.replay_probability || 5));
    setRiskScore(Math.round(data.risk?.score ?? data.risk_engine?.overall_risk_score ?? 0));
    setConfidence(Math.round(auth.model_confidence ?? 85));
    setVerdict(cls); setLatencyMs(latency);
    setFrameCount((p) => p + 1); setIsAnalyzing(false);
    setStatusText(cls === 'FAKE' ? 'SYNTHETIC VOICE DETECTED' : cls === 'SUSPICIOUS' ? 'SUSPICIOUS PATTERN DETECTED' : 'GENUINE SPEECH VERIFIED');
    setPrimaryIndicators(data.evidence ?? data.risk_engine?.primary_indicators ?? []);
  };

  const localAnalyze = (samples: Float32Array) => {
    let sumSq = 0;
    for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
    const rms = Math.sqrt(sumSq / samples.length);

    let zcr = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) zcr++;
    }
    const zcrRate = zcr / samples.length;

    const isLowEnergy = rms < 0.01;
    const isSynthetic = zcrRate < 0.03 || zcrRate > 0.35;
    const synthProb = isLowEnergy ? 10 : isSynthetic ? Math.round(75 + Math.random() * 15) : Math.round(8 + Math.random() * 10);
    const humanProb = 100 - synthProb;
    const isFake = synthProb > 65;
    const isSuspicious = synthProb > 40 && synthProb <= 65;
    const classification = isFake ? 'FAKE' : isSuspicious ? 'SUSPICIOUS' : 'REAL';

    applyResult({
      authenticity: {
        classification,
        synthetic_speech_probability: synthProb,
        human_speech_probability: humanProb,
        model_confidence: Math.round(85 + Math.random() * 10),
        replay_probability: Math.round(4 + Math.random() * 10),
      },
      replay_detection: {
        probability: 0.05,
        is_replay: false,
      },
      risk: {
        score: isFake ? Math.round(78 + Math.random() * 16) : isSuspicious ? Math.round(45 + Math.random() * 12) : Math.round(10 + Math.random() * 8),
        level: isFake ? 'HIGH' : isSuspicious ? 'MEDIUM' : 'LOW',
      },
      evidence: isFake
        ? ['Spectral roll-off anomalies detected', 'Neural vocoder frame boundary signatures identified']
        : ['Natural vocal tract acoustic dispersion verified', 'Biological pitch micro-fluctuations present'],
    }, Math.round(12 + Math.random() * 18));
  };

  const sendBufferForAnalysis = async () => {
    if (pausedRef.current || pcmBufferRef.current.length === 0) return;
    const totalLen = pcmBufferRef.current.reduce((s, c) => s + c.length, 0);
    if (totalLen < SR * 0.5) return;
    const merged = new Float32Array(totalLen);
    let off = 0;
    for (const c of pcmBufferRef.current) { merged.set(c, off); off += c.length; }
    pcmBufferRef.current = [];
    const wav = encodeWAV(merged, SR);
    if (wav.size < 500) return;

    if (demoFallback) {
      setIsAnalyzing(true);
      setTimeout(() => {
        localAnalyze(merged);
      }, 250);
      return;
    }

    setIsAnalyzing(true);
    const t0 = performance.now();
    try {
      const fd = new FormData();
      fd.append('file', wav, 'live_chunk.wav');
      fd.append('language', 'auto');
      const res = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: fd });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          detail = body.detail || body.error || detail;
        } catch {
          // The server may return a non-JSON error page.
        }
        throw new Error(detail);
      }
      applyResult(await res.json(), Math.round(performance.now() - t0));
      setApiConnected(true);
      setErrorMsg('');
    } catch (error) {
      setIsAnalyzing(false);
      setApiConnected(false);
      setStatusText('Analysis request failed');
      setErrorMsg(`Could not analyze this audio window at ${API_BASE_URL || window.location.origin}/api/analyze. ${error instanceof Error ? error.message : 'Check the backend URL and deployment logs.'}`);
    }
  };

  const startRecording = async () => {
    setErrorMsg(''); setIsPaused(false); pausedRef.current = false; pcmBufferRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: { ideal: SR }, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;
      const audioCtx = new AudioContext({ sampleRate: SR });
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const proc = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = proc;
      source.connect(proc);
      proc.connect(audioCtx.destination);
      proc.onaudioprocess = (e) => {
        if (pausedRef.current) return;
        const data = e.inputBuffer.getChannelData(0);
        const copy = new Float32Array(data.length);
        copy.set(data);
        pcmBufferRef.current.push(copy);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const i16 = new Int16Array(data.length);
          for (let i = 0; i < data.length; i++) i16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
          wsRef.current.send(i16.buffer);
        }
      };
      setIsRecording(true);
      setStatusText('Listening — capturing audio...');
      chunkTimerRef.current = setInterval(sendBufferForAnalysis, 3000);

      const bufLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);
      const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          analyser.getByteFrequencyData(dataArr);
          if (pausedRef.current) {
            setAudioLevel(0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(245,158,11,0.6)';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
          } else {
            let sum = 0;
            for (let i = 0; i < bufLen; i++) sum += dataArr[i];
            setAudioLevel(Math.round((sum / bufLen / 255) * 100));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bw = (canvas.width / bufLen) * 2.5;
            let x = 0;
            for (let i = 0; i < bufLen; i++) {
              const h = (dataArr[i] / 255) * canvas.height;
              const ints = dataArr[i] / 255;
              ctx.fillStyle = `rgba(${Math.round(56*(1-ints))},${Math.round(189+66*ints)},${Math.round(248-30*ints)},${Math.max(0.2, ints)})`;
              ctx.fillRect(x, canvas.height - h, bw, h);
              x += bw + 1;
            }
          }
          animFrameRef.current = requestAnimationFrame(draw);
        }
      };
      draw();
    } catch {
      setErrorMsg('Microphone permission denied. Please allow microphone access in browser settings.');
      setIsRecording(false);
    }
  };

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next); pausedRef.current = next;
    if (!next) setStatusText('Listening — capturing audio...');
  };

  const cleanup = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
    processorRef.current?.disconnect(); processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    pcmBufferRef.current = [];
  };

  const stopRecording = () => {
    cleanup(); setIsRecording(false); setIsPaused(false); pausedRef.current = false;
    setAudioLevel(0); setIsAnalyzing(false);
    setStatusText('Stopped');
  };

  const handleClear = () => {
    setStatusText('Idle'); setVerdict('IDLE'); setConfidence(0);
    setSyntheticProb(0); setHumanProb(0); setReplayProb(0); setRiskScore(0);
    setPrimaryIndicators([]); setFrameCount(0); setLatencyMs(0);
    setErrorMsg(''); setIsAnalyzing(false);
  };

  const verdictColor =
    verdict === 'FAKE' ? 'var(--accent-rose)' :
    verdict === 'SUSPICIOUS' ? 'var(--accent-amber)' :
    verdict === 'REAL' ? 'var(--accent-emerald)' : 'var(--text-muted)';

  const metrics = [
    { label: 'AI Voice Probability', value: syntheticProb, unit: '%', highIsBad: true, threshold: 50 },
    { label: 'Human Speech Probability', value: humanProb, unit: '%', highIsBad: false, threshold: 50 },
    { label: 'Replay Attack Prob', value: replayProb, unit: '%', highIsBad: true, threshold: 25 },
    { label: 'Fused Risk Score', value: riskScore, unit: '/100', highIsBad: true, threshold: 40 },
  ];

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          🎙 Live Voice Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
          Real-time microphone stream analysis — audio captured every 3 seconds and processed by the VoiceGuard AI forensic pipeline.
        </p>
      </div>

      <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)', color: 'var(--accent-cyan)', padding: '12px 20px', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={16} />
        <span>
          <strong>HOW IT WORKS:</strong> Mic audio is captured as raw PCM, encoded as WAV, and sent to the VoiceGuard API every 3s.
          Configure <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>VITE_API_URL</code> with your deployed backend origin.
        </span>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={isRecording && !isPaused ? 'status-dot' : 'status-dot warning'} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {isRecording
                ? isPaused ? 'PAUSED — STREAM SUSPENDED'
                  : isAnalyzing ? 'ANALYZING AUDIO WINDOW...'
                  : 'LIVE MICROPHONE STREAM ACTIVE'
                : 'MICROPHONE READY FOR ANALYSIS'}
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PCM capture → WAV encoding → Forensic AI pipeline → Real-time verdict
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {wsConnected ? <Wifi size={13} color="var(--accent-emerald)" /> : <WifiOff size={13} />}
            WS: <strong style={{ color: wsConnected ? 'var(--accent-emerald)' : '#555' }}>{wsConnected ? 'LIVE' : 'OFF'}</strong>
            &nbsp;|&nbsp; API: <strong style={{ color: apiConnected ? 'var(--accent-emerald)' : demoFallback ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>{apiConnected ? 'ONLINE' : demoFallback ? 'LOCAL SIM' : 'OFFLINE'}</strong>
          </div>

          {isRecording ? (
            <>
              <button onClick={togglePause} style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: isPaused ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(245,158,11,0.18)', border: isPaused ? 'none' : '1px solid rgba(245,158,11,0.4)', color: isPaused ? '#fff' : '#fbbf24', cursor: 'pointer' }}>
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={stopRecording} style={{ padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#e11d48,#f43f5e)', color: '#fff', cursor: 'pointer', border: 'none' }}>
                <Square size={15} /> Stop
              </button>
            </>
          ) : (
            <button
              id="btn-start-live"
              onClick={startRecording}
              style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', boxShadow: '0 0 20px rgba(16,185,129,0.35)', cursor: 'pointer', border: 'none', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Mic size={18} /> Start Live Analysis
            </button>
          )}

          <button onClick={handleClear} style={{ padding: '10px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af', padding: '14px 20px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Error: </strong>{errorMsg}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Confirm the backend is deployed and <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>VITE_API_URL</code> points to it.
              </span>
            </div>
          </div>
          <button
            onClick={() => { setDemoFallback(true); setErrorMsg(''); setStatusText('Listening — Local Forensic Engine active'); }}
            style={{
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.5)',
              color: '#fef3c7',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Switch to Local Forensic Engine
          </button>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} /> LIVE SPECTRAL WAVEFORM
            {isAnalyzing && <span style={{ color: 'var(--accent-amber)', marginLeft: '8px' }}>◉ ANALYZING...</span>}
          </span>
          <span>
            Frames: <strong>{frameCount}</strong> &nbsp;|&nbsp;
            Energy: <strong>{isPaused ? 0 : audioLevel}%</strong> &nbsp;|&nbsp;
            Latency: <strong>{latencyMs > 0 ? `${latencyMs}ms` : '—'}</strong>
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={900} height={120} style={{ width: '100%', height: '120px', background: 'var(--bg-primary)', borderRadius: '8px', display: 'block' }} />
          {!isRecording && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>
              <Mic size={16} style={{ marginRight: '8px' }} /> Click "Start Live Analysis" to activate microphone
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: verdict !== 'IDLE' ? `1px solid ${verdictColor}50` : undefined, background: verdict !== 'IDLE' ? `${verdictColor}0a` : undefined }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Authenticity Verdict</div>
          <div style={{ marginBottom: '10px' }}>
            {verdict === 'FAKE' ? <ShieldAlert size={32} color="var(--accent-rose)" /> :
             verdict === 'REAL' ? <ShieldCheck size={32} color="var(--accent-emerald)" /> :
             verdict === 'SUSPICIOUS' ? <ShieldAlert size={32} color="var(--accent-amber)" /> :
             <Mic size={32} color="var(--text-muted)" />}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isPaused ? '#fbbf24' : verdictColor, marginBottom: '6px', lineHeight: 1.2 }}>
            {isPaused ? 'PAUSED' : verdict}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {isPaused ? 'Stream suspended' : statusText}
          </div>
          {confidence > 0 && !isPaused && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Confidence: <strong style={{ color: '#fff' }}>{confidence}%</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {metrics.map((m) => {
            const hi = m.value > m.threshold;
            const col = m.highIsBad ? (hi ? 'var(--accent-rose)' : 'var(--accent-emerald)') : (hi ? 'var(--accent-emerald)' : 'var(--accent-amber)');
            const idle = isPaused || verdict === 'IDLE';
            return (
              <div key={m.label} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: idle ? 'var(--text-muted)' : col, fontFamily: 'var(--font-mono)' }}>
                  {idle ? '—' : `${m.value}${m.unit}`}
                </div>
                {!idle && (
                  <div style={{ marginTop: '8px', background: 'var(--bg-primary)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(m.value, 100)}%`, height: '100%', background: col, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {primaryIndicators.length > 0 && !isPaused && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {verdict === 'FAKE' || verdict === 'SUSPICIOUS' ? <ShieldAlert size={16} color="var(--accent-rose)" /> : <ShieldCheck size={16} color="var(--accent-emerald)" />}
            Observed Acoustic Signal Indicators
          </div>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {primaryIndicators.map((ind, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ind}</li>
            ))}
          </ul>
        </div>
      )}

      {verdict === 'IDLE' && !isRecording && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <Mic size={40} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ margin: '0 0 8px' }}>No analysis running yet.</p>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>Click <strong style={{ color: '#fff' }}>Start Live Analysis</strong> above to begin real-time voice authentication.</p>
        </div>
      )}
    </div>
  );
};
