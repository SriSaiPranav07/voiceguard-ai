import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Square, Pause, Play, RotateCcw,
  Wifi, WifiOff, AlertCircle, ShieldCheck, ShieldAlert, Activity,
  Radio
} from 'lucide-react';
import { apiUrl, fetchHealth } from '../services/api';

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

type MicState = 'READY' | 'LISTENING' | 'ANALYZING' | 'STOPPED' | 'ERROR';

export const LiveDetection: React.FC = () => {
  const [micState, setMicState] = useState<MicState>('READY');
  const [isPaused, setIsPaused] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const [capturedSeconds, setCapturedSeconds] = useState(0);
  const [totalRecordedSeconds, setTotalRecordedSeconds] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusText, setStatusText] = useState('Microphone ready — click Start Live Analysis to begin');
  
  // Real-time forensic scores (with smoothing)
  const [syntheticProb, setSyntheticProb] = useState<number | null>(null);
  const [humanProb, setHumanProb] = useState<number | null>(null);
  const [replayProb, setReplayProb] = useState<number | null>(null);
  const [overallRiskScore, setOverallRiskScore] = useState<number | null>(null);
  const [primaryIndicators, setPrimaryIndicators] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'IDLE' | 'REAL' | 'FAKE' | 'SUSPICIOUS'>('IDLE');

  // Exponential smoothing state refs
  const smoothedSynthRef = useRef<number | null>(null);
  const smoothedReplayRef = useRef<number | null>(null);
  const smoothedRiskRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<AudioNode | null>(null);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureWatchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingActiveRef = useRef(false);
  const captureModeRef = useRef<'worklet' | 'script-processor' | 'none'>('none');
  const captureStartedAtRef = useRef(0);
  const receivedPcmBlocksRef = useRef(0);
  const analysisInFlightRef = useRef(false);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const lastCaptureUiUpdateRef = useRef(0);
  const lastLevelUiUpdateRef = useRef(0);
  const SR = 16000;

  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    let active = true;
    const checkApi = () => {
      fetchHealth().then((health) => {
        if (active) setApiConnected(health.api_online);
      });
    };
    checkApi();
    const interval = window.setInterval(checkApi, 12000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const applyResult = (data: any, latency: number) => {
    const auth = data.authenticity;
    const rawSynth = Number.isFinite(auth?.synthetic_speech_probability) ? Number(auth.synthetic_speech_probability) : 15.0;
    const rawReplay = Number.isFinite(data.replay_detection?.probability) ? Number(data.replay_detection.probability) * 100 : 8.0;
    const rawRisk = Number.isFinite(data.risk?.score) ? Number(data.risk.score) : 15.0;

    // Apply exponential smoothing: 65% previous + 35% new measurement
    const smoothFactor = 0.35;
    const smoothSynth = smoothedSynthRef.current === null
      ? rawSynth
      : Math.round(smoothedSynthRef.current * (1 - smoothFactor) + rawSynth * smoothFactor);
    smoothedSynthRef.current = smoothSynth;

    const smoothReplay = smoothedReplayRef.current === null
      ? rawReplay
      : Math.round(smoothedReplayRef.current * (1 - smoothFactor) + rawReplay * smoothFactor);
    smoothedReplayRef.current = smoothReplay;

    const smoothRisk = smoothedRiskRef.current === null
      ? rawRisk
      : Math.round(smoothedRiskRef.current * (1 - smoothFactor) + rawRisk * smoothFactor);
    smoothedRiskRef.current = smoothRisk;

    const smoothHuman = Math.round(100 - smoothSynth);

    setSyntheticProb(smoothSynth);
    setHumanProb(smoothHuman);
    setReplayProb(smoothReplay);
    setOverallRiskScore(smoothRisk);

    let cls: 'REAL' | 'FAKE' | 'SUSPICIOUS' = 'REAL';
    if (smoothSynth >= 60 || smoothRisk >= 65) {
      cls = 'FAKE';
    } else if (smoothSynth >= 35 || smoothRisk >= 35) {
      cls = 'SUSPICIOUS';
    } else {
      cls = 'REAL';
    }

    setVerdict(cls);
    setLatencyMs(latency);
    setChunksProcessed((p) => p + 1);
    if (recordingActiveRef.current && !pausedRef.current) {
      setMicState('LISTENING');
    }

    setStatusText(
      cls === 'FAKE'
        ? '⚠️ SYNTHETIC / CLONED VOICE ARTIFACTS DETECTED'
        : cls === 'SUSPICIOUS'
        ? '⚠️ SUSPICIOUS ACOUSTIC ANOMALIES DETECTED'
        : '✅ AUTHENTIC HUMAN SPEECH VERIFIED'
    );

    const evidence = data.evidence ?? data.risk_engine?.primary_indicators ?? auth?.evidence ?? [];
    setPrimaryIndicators(evidence);
  };

  const sendBufferForAnalysis = async () => {
    if (!recordingActiveRef.current || pausedRef.current || pcmBufferRef.current.length === 0) return;
    if (analysisInFlightRef.current) return;
    const totalLen = pcmBufferRef.current.reduce((s, c) => s + c.length, 0);
    const sampleRate = audioContextRef.current?.sampleRate ?? SR;
    // Require at least 0.4s of audio
    if (totalLen < sampleRate * 0.4) return;

    const merged = new Float32Array(totalLen);
    let off = 0;
    for (const c of pcmBufferRef.current) { merged.set(c, off); off += c.length; }
    pcmBufferRef.current = [];

    const wav = encodeWAV(merged, sampleRate);
    if (wav.size < 500) return;

    analysisInFlightRef.current = true;
    setMicState('ANALYZING');
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    const t0 = performance.now();

    try {
      const fd = new FormData();
      fd.append('file', wav, 'live_chunk.wav');
      fd.append('language', 'auto');
      const res = await fetch(apiUrl('/api/analyze-chunk'), { method: 'POST', body: fd, signal: controller.signal });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          detail = body.detail || body.error || detail;
        } catch {
          // ignore non-json
        }
        throw new Error(detail);
      }
      const data = await res.json();
      applyResult(data, Math.round(performance.now() - t0));
      setApiConnected(true);
      setErrorMsg('');
    } catch (error) {
      if (!recordingActiveRef.current) return;
      setMicState('ERROR');
      setApiConnected(false);
      setStatusText('Analysis request error');
      const reason = controller.signal.aborted ? 'Analysis timed out.' : error instanceof Error ? error.message : 'Backend unreachable.';
      setErrorMsg(`Live analysis error: ${reason}`);
    } finally {
      window.clearTimeout(timeoutId);
      analysisInFlightRef.current = false;
      if (analysisAbortRef.current === controller) analysisAbortRef.current = null;
      if (recordingActiveRef.current && !pausedRef.current && micState !== 'ERROR') {
        setMicState('LISTENING');
      }
    }
  };

  const startRecording = async () => {
    setErrorMsg('');
    setIsPaused(false);
    pausedRef.current = false;
    pcmBufferRef.current = [];
    setTotalRecordedSeconds(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser. Please use HTTPS on a modern browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: SR },
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      let audioCtx: AudioContext;
      try {
        audioCtx = new AudioContext({ sampleRate: SR });
      } catch {
        audioCtx = new AudioContext();
      }
      audioContextRef.current = audioCtx;
      await audioCtx.resume();

      if (audioCtx.state !== 'running') {
        throw new Error('AudioContext state suspended. Please grant microphone permission and try again.');
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const appendPcm = (samples: Float32Array) => {
        if (pausedRef.current) return;
        if (!samples.length) return;
        if (receivedPcmBlocksRef.current === 0) {
          setErrorMsg('');
          setStatusText('Listening — streaming voice audio to forensic analyzer...');
          setMicState('LISTENING');
        }
        receivedPcmBlocksRef.current += 1;
        pcmBufferRef.current.push(samples);
        const sampleRate = audioCtx.sampleRate || SR;
        const maxBufferedSamples = sampleRate * 10;
        let bufferedSamples = pcmBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
        while (bufferedSamples > maxBufferedSamples && pcmBufferRef.current.length > 1) {
          bufferedSamples -= pcmBufferRef.current.shift()!.length;
        }
        const now = performance.now();
        if (now - lastCaptureUiUpdateRef.current > 400) {
          lastCaptureUiUpdateRef.current = now;
          setCapturedSeconds(bufferedSamples / sampleRate);
        }
      };

      const silentOutput = audioCtx.createGain();
      silentOutput.gain.value = 0;

      const useScriptProcessorFallback = () => {
        if (captureModeRef.current === 'script-processor') return;
        processorRef.current?.disconnect();
        const proc = audioCtx.createScriptProcessor(4096, 1, 1);
        proc.onaudioprocess = (event) => {
          appendPcm(new Float32Array(event.inputBuffer.getChannelData(0)));
        };
        processorRef.current = proc;
        captureModeRef.current = 'script-processor';
        source.connect(proc);
        proc.connect(silentOutput);
      };

      if (audioCtx.audioWorklet) {
        try {
          await audioCtx.audioWorklet.addModule(new URL('/pcm-capture-processor.js', window.location.href));
          const captureNode = new AudioWorkletNode(audioCtx, 'voiceguard-pcm-capture', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
            processorOptions: { chunkSamples: Math.round(audioCtx.sampleRate * 0.5) },
          });
          captureNode.port.onmessage = (event: MessageEvent<Float32Array>) => appendPcm(event.data);
          captureNode.port.onmessageerror = () => useScriptProcessorFallback();
          captureNode.onprocessorerror = () => useScriptProcessorFallback();
          processorRef.current = captureNode;
          captureModeRef.current = 'worklet';
          source.connect(captureNode);
          captureNode.connect(silentOutput);
        } catch {
          useScriptProcessorFallback();
        }
      } else {
        useScriptProcessorFallback();
      }

      silentOutput.connect(audioCtx.destination);
      recordingActiveRef.current = true;
      captureStartedAtRef.current = performance.now();
      receivedPcmBlocksRef.current = 0;
      setMicState('LISTENING');
      setCapturedSeconds(0);
      lastCaptureUiUpdateRef.current = 0;
      setStatusText('Microphone active — analyzing voice stream...');

      // Chunk interval: 2.5s for snappy live feedback
      chunkTimerRef.current = setInterval(sendBufferForAnalysis, 2500);

      durationTimerRef.current = setInterval(() => {
        if (!pausedRef.current) {
          setTotalRecordedSeconds((prev) => prev + 1);
        }
      }, 1000);

      captureWatchdogRef.current = window.setInterval(() => {
        const elapsed = performance.now() - captureStartedAtRef.current;
        if (receivedPcmBlocksRef.current === 0 && captureModeRef.current === 'worklet' && elapsed > 1500) {
          useScriptProcessorFallback();
        }
        if (receivedPcmBlocksRef.current === 0 && elapsed > 5000) {
          setStatusText('No audio frames received from microphone');
          setMicState('ERROR');
          setErrorMsg('The microphone is connected but sending no audio frames. Check microphone volume and permissions.');
        }
      }, 1000);

      // Canvas real-time visualizer
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
            const now = performance.now();
            if (now - lastLevelUiUpdateRef.current > 120) {
              lastLevelUiUpdateRef.current = now;
              setAudioLevel(Math.round((sum / bufLen / 255) * 100));
            }
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
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
        : error instanceof DOMException && error.name === 'NotFoundError'
        ? 'No microphone found on this device.'
        : error instanceof Error
        ? error.message
        : 'Could not start microphone capture.';
      setErrorMsg(message);
      setMicState('ERROR');
      cleanup();
    }
  };

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    pausedRef.current = next;
    if (!next) {
      setStatusText('Listening — streaming voice audio...');
      setMicState('LISTENING');
    } else {
      setStatusText('Paused');
    }
  };

  const cleanup = () => {
    recordingActiveRef.current = false;
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (captureWatchdogRef.current) clearInterval(captureWatchdogRef.current);
    chunkTimerRef.current = null;
    durationTimerRef.current = null;
    captureWatchdogRef.current = null;
    captureModeRef.current = 'none';
    processorRef.current?.disconnect();
    processorRef.current = null;
    
    // Stop all microphone tracks cleanly to release hardware
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    pcmBufferRef.current = [];
  };

  const stopRecording = () => {
    cleanup();
    setIsPaused(false);
    pausedRef.current = false;
    setMicState('STOPPED');
    setAudioLevel(0);
    setCapturedSeconds(0);
    setStatusText('Microphone stopped — hardware released');
  };

  const handleClear = () => {
    stopRecording();
    setMicState('READY');
    setVerdict('IDLE');
    setSyntheticProb(null);
    setHumanProb(null);
    setReplayProb(null);
    setOverallRiskScore(null);
    smoothedSynthRef.current = null;
    smoothedReplayRef.current = null;
    smoothedRiskRef.current = null;
    setPrimaryIndicators([]);
    setChunksProcessed(0);
    setTotalRecordedSeconds(0);
    setLatencyMs(0);
    setErrorMsg('');
    setStatusText('Microphone ready — click Start Live Analysis to begin');
  };

  const verdictColor =
    verdict === 'FAKE' ? 'var(--accent-rose)' :
    verdict === 'SUSPICIOUS' ? 'var(--accent-amber)' :
    verdict === 'REAL' ? 'var(--accent-emerald)' : 'var(--text-muted)';

  const getRiskBadge = (score: number | null) => {
    if (score === null) return { text: '—', color: 'var(--text-muted)', bg: 'transparent' };
    if (score >= 60) return { text: 'HIGH RISK', color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.15)' };
    if (score >= 35) return { text: 'MEDIUM RISK', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.15)' };
    return { text: 'LOW RISK', color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.15)' };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isRecordingActive = micState === 'LISTENING' || micState === 'ANALYZING';

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mic size={28} color="var(--accent-cyan)" />
          LIVE VOICE DETECTION
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
          Real-time microphone stream analysis — continuous 2.5s acoustic feature chunk extraction & vocoder artifact verification.
        </p>
      </div>

      {/* Status Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Microphone Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background:
                  micState === 'LISTENING' ? 'var(--accent-emerald)' :
                  micState === 'ANALYZING' ? 'var(--accent-amber)' :
                  micState === 'ERROR' ? 'var(--accent-rose)' :
                  micState === 'STOPPED' ? 'var(--text-muted)' : 'var(--accent-cyan)',
                boxShadow:
                  isRecordingActive ? '0 0 10px var(--accent-emerald)' : 'none',
                display: 'inline-block',
                animation: isRecordingActive ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Microphone Status
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {micState === 'LISTENING' ? '● LISTENING' :
                 micState === 'ANALYZING' ? '◉ ANALYZING CHUNK' :
                 micState === 'STOPPED' ? '■ STOPPED' :
                 micState === 'ERROR' ? '⚠️ ERROR' : 'READY'}
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Duration</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {formatTime(totalRecordedSeconds)}
            </span>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chunks Processed</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {chunksProcessed}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {apiConnected ? <Wifi size={13} color="var(--accent-emerald)" /> : <WifiOff size={13} color="var(--accent-rose)" />}
            API: <strong style={{ color: apiConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{apiConnected ? 'ONLINE' : 'CONNECTING'}</strong>
          </div>

          {isRecordingActive || isPaused ? (
            <>
              <button
                onClick={togglePause}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isPaused ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(245,158,11,0.18)',
                  border: isPaused ? 'none' : '1px solid rgba(245,158,11,0.4)',
                  color: isPaused ? '#fff' : '#fbbf24',
                  cursor: 'pointer',
                }}
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopRecording}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg,#e11d48,#f43f5e)',
                  color: '#fff',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <Square size={15} /> Stop
              </button>
            </>
          ) : (
            <button
              id="btn-start-live"
              onClick={startRecording}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg,#059669,#10b981)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(16,185,129,0.35)',
                cursor: 'pointer',
                border: 'none',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Mic size={18} /> Start Live Detection
            </button>
          )}

          <button
            onClick={handleClear}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af', padding: '14px 20px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error: </strong>{errorMsg}
          </div>
        </div>
      )}

      {/* Live Waveform Canvas */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} color="var(--accent-cyan)" /> LIVE SPECTRAL WAVEFORM
            {micState === 'ANALYZING' && <span style={{ color: 'var(--accent-amber)', marginLeft: '8px' }}>◉ ANALYZING WINDOW...</span>}
          </span>
          <span>
            Buffered: <strong>{capturedSeconds.toFixed(1)}s</strong> &nbsp;|&nbsp;
            Signal Energy: <strong>{isPaused ? 0 : audioLevel}%</strong> &nbsp;|&nbsp;
            Latency: <strong>{latencyMs > 0 ? `${latencyMs}ms` : '—'}</strong>
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={900}
            height={110}
            style={{ width: '100%', height: '110px', background: 'var(--bg-primary)', borderRadius: '8px', display: 'block' }}
          />
          {!isRecordingActive && !isPaused && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>
              <Mic size={16} style={{ marginRight: '8px' }} /> Click "Start Live Detection" to activate microphone
            </div>
          )}
        </div>
      </div>

      {/* Main Forensic Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Main Verdict Card */}
        <div
          className="glass-panel"
          style={{
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            border: verdict !== 'IDLE' ? `1px solid ${verdictColor}50` : undefined,
            background: verdict !== 'IDLE' ? `${verdictColor}0a` : undefined,
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Live Authenticity Verdict
          </div>
          <div style={{ marginBottom: '10px' }}>
            {verdict === 'FAKE' ? <ShieldAlert size={36} color="var(--accent-rose)" /> :
             verdict === 'REAL' ? <ShieldCheck size={36} color="var(--accent-emerald)" /> :
             verdict === 'SUSPICIOUS' ? <ShieldAlert size={36} color="var(--accent-amber)" /> :
             <Radio size={36} color="var(--text-muted)" />}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isPaused ? '#fbbf24' : verdictColor, marginBottom: '6px', lineHeight: 1.2 }}>
            {isPaused ? 'PAUSED' : verdict === 'IDLE' ? 'AWAITING AUDIO' : `${verdict} SPEECH`}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {isPaused ? 'Stream suspended' : statusText}
          </div>
        </div>

        {/* 4 Risk Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {/* Synthetic Voice Risk */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Synthetic Voice Risk
              </div>
              {syntheticProb !== null && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: getRiskBadge(syntheticProb).bg, color: getRiskBadge(syntheticProb).color }}>
                  {getRiskBadge(syntheticProb).text}
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: syntheticProb === null ? 'var(--text-muted)' : (syntheticProb > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)'), fontFamily: 'var(--font-mono)' }}>
              {syntheticProb === null ? '—' : `${syntheticProb}%`}
            </div>
            {syntheticProb !== null && (
              <div style={{ marginTop: '8px', background: 'var(--bg-primary)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(syntheticProb, 100)}%`, height: '100%', background: syntheticProb > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            )}
          </div>

          {/* Replay Risk */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Replay Attack Risk
              </div>
              {replayProb !== null && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: getRiskBadge(replayProb).bg, color: getRiskBadge(replayProb).color }}>
                  {getRiskBadge(replayProb).text}
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: replayProb === null ? 'var(--text-muted)' : (replayProb > 40 ? 'var(--accent-rose)' : 'var(--accent-emerald)'), fontFamily: 'var(--font-mono)' }}>
              {replayProb === null ? '—' : `${replayProb}%`}
            </div>
            {replayProb !== null && (
              <div style={{ marginTop: '8px', background: 'var(--bg-primary)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(replayProb, 100)}%`, height: '100%', background: replayProb > 40 ? 'var(--accent-rose)' : 'var(--accent-emerald)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            )}
          </div>

          {/* Human Speech Probability */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Human Speech Authenticity
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: humanProb === null ? 'var(--text-muted)' : (humanProb > 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)'), fontFamily: 'var(--font-mono)' }}>
              {humanProb === null ? '—' : `${humanProb}%`}
            </div>
            {humanProb !== null && (
              <div style={{ marginTop: '8px', background: 'var(--bg-primary)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(humanProb, 100)}%`, height: '100%', background: humanProb > 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            )}
          </div>

          {/* Overall Fused Risk */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Overall Threat Score
              </div>
              {overallRiskScore !== null && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: getRiskBadge(overallRiskScore).bg, color: getRiskBadge(overallRiskScore).color }}>
                  {getRiskBadge(overallRiskScore).text}
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overallRiskScore === null ? 'var(--text-muted)' : (overallRiskScore > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)'), fontFamily: 'var(--font-mono)' }}>
              {overallRiskScore === null ? '—' : `${overallRiskScore}/100`}
            </div>
            {overallRiskScore !== null && (
              <div style={{ marginTop: '8px', background: 'var(--bg-primary)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(overallRiskScore, 100)}%`, height: '100%', background: overallRiskScore > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acoustic Evidence Findings */}
      {primaryIndicators.length > 0 && !isPaused && (
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {verdict === 'FAKE' || verdict === 'SUSPICIOUS' ? <ShieldAlert size={16} color="var(--accent-rose)" /> : <ShieldCheck size={16} color="var(--accent-emerald)" />}
            Real-Time Acoustic Evidence & Spectral Observations
          </div>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {primaryIndicators.map((ind, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ind}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cyber Fraud Defense Recommendation Box */}
      {verdict !== 'IDLE' && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            borderLeft: `4px solid ${verdictColor}`,
            background: 'var(--bg-tertiary)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Cyber Fraud Defense Protocol
          </div>
          <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}>
            {verdict === 'FAKE'
              ? '🚨 CRITICAL ADVISORY: High likelihood of voice clone / synthetic impersonation attack. PAUSE all action. DO NOT disclose OTP, UPI PIN, passwords, or initiate financial transactions. Verify caller identity through a separate trusted out-of-band channel.'
              : verdict === 'SUSPICIOUS'
              ? '⚠️ CAUTION ADVISORY: Acoustic anomalies detected. Exercise heightened vigilance and request callback on an official phone number before sharing sensitive information.'
              : '🛡️ STANDARD ADVISORY: Acoustic patterns align with genuine human vocalization. Continue standard security awareness.'}
          </div>
        </div>
      )}
    </div>
  );
};
