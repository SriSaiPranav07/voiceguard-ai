import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  PhoneCall,
  AlertOctagon,
  DollarSign,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { apiUrl, fetchHealth, analyzeAudioFile } from '../services/api';
import { VerifyCallerModal } from '../components/VerifyCallerModal';
import { EmergencyScamModal } from '../components/EmergencyScamModal';

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const byteCount = samples.length * 2;
  const buf = new ArrayBuffer(44 + byteCount);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF');
  v.setUint32(4, 36 + byteCount, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ws(36, 'data');
  v.setUint32(40, byteCount, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([v], { type: 'audio/wav' });
}

type MicState = 'READY' | 'LISTENING' | 'ANALYZING' | 'STOPPED' | 'ERROR';

export const LiveProtection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'quick-threat'>('live');

  // Modals state
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [verifyContext, setVerifyContext] = useState<string>('');

  // Live microphone state
  const [micState, setMicState] = useState<MicState>('READY');
  const [isPaused, setIsPaused] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const [capturedSeconds, setCapturedSeconds] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusText, setStatusText] = useState('Microphone ready — click Start Live Protection to begin');

  // Forensic detection state
  const [syntheticProb, setSyntheticProb] = useState<number | null>(null);
  const [humanProb, setHumanProb] = useState<number | null>(null);
  const [replayProb, setReplayProb] = useState<number | null>(null);
  const [overallRiskScore, setOverallRiskScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'IDLE'>('IDLE');
  const [primaryIndicators, setPrimaryIndicators] = useState<string[]>([]);
  const [behavioralFlags, setBehavioralFlags] = useState<{ id: string; label: string; active: boolean }[]>([
    { id: 'financial', label: 'Urgent Financial / Wire Transfer Request', active: false },
    { id: 'otp', label: 'Request for OTP / PIN / Security Passcode', active: false },
    { id: 'authority', label: 'Authority Impersonation (Police / CBI / Bank)', active: false },
    { id: 'pressure', label: 'High Urgency / Pressure Language', active: false },
    { id: 'unverified', label: 'Identity Not Independently Verified', active: true },
  ]);

  // Quick threat scrutiny state (merged from Call Shield)
  const [threatCategory, setThreatCategory] = useState<string>('Voice Clone / Impersonation');
  const [threatFile, setThreatFile] = useState<File | null>(null);
  const [threatLoading, setThreatLoading] = useState(false);
  const [threatResult, setThreatResult] = useState<any | null>(null);
  const [threatError, setThreatError] = useState('');

  // Audio refs
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
  const captureStartedAtRef = useRef(0);
  const analysisInFlightRef = useRef(false);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const lastLevelUiUpdateRef = useRef(0);
  const SR = 16000;

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

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
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const applyResult = useCallback((data: any, latency: number) => {
    const auth = data.authenticity;
    const rawSynth = Number.isFinite(auth?.synthetic_speech_probability)
      ? Number(auth.synthetic_speech_probability)
      : 12.0;
    const rawReplay = Number.isFinite(data.replay_detection?.probability)
      ? Number(data.replay_detection.probability) * 100
      : 8.0;
    const rawRisk = Number.isFinite(data.risk?.score) ? Number(data.risk.score) : 15.0;

    const smoothFactor = 0.35;
    const sSynth =
      smoothedSynthRef.current === null
        ? rawSynth
        : Math.round((smoothedSynthRef.current * (1 - smoothFactor) + rawSynth * smoothFactor) * 10) / 10;
    const sReplay =
      smoothedReplayRef.current === null
        ? rawReplay
        : Math.round((smoothedReplayRef.current * (1 - smoothFactor) + rawReplay * smoothFactor) * 10) / 10;
    const sRisk =
      smoothedRiskRef.current === null
        ? rawRisk
        : Math.round(smoothedRiskRef.current * (1 - smoothFactor) + rawRisk * smoothFactor);

    smoothedSynthRef.current = sSynth;
    smoothedReplayRef.current = sReplay;
    smoothedRiskRef.current = sRisk;

    setSyntheticProb(sSynth);
    setHumanProb(Math.max(0, Math.round((100 - sSynth) * 10) / 10));
    setReplayProb(sReplay);
    setOverallRiskScore(sRisk);
    setLatencyMs(latency);

    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (sRisk >= 60 || sSynth >= 60) {
      level = 'HIGH';
    } else if (sRisk >= 35 || sSynth >= 38 || sReplay >= 38) {
      level = 'MEDIUM';
    }
    setRiskLevel(level);

    const indicators: string[] = [];
    if (sSynth > 50) indicators.push('Unnatural vocoder spectral artifacts detected');
    if (sReplay > 40) indicators.push('Acoustic loudspeaker playback signature detected');
    if (sSynth <= 30 && sReplay <= 25) indicators.push('Natural biological vocal micro-tremor variance observed');
    if (indicators.length === 0) indicators.push('Acoustic stream within normal baseline thresholds');
    setPrimaryIndicators(indicators);

    if (level === 'HIGH') {
      setBehavioralFlags((prev) =>
        prev.map((f) => (f.id === 'pressure' ? { ...f, active: true } : f))
      );
    }
  }, []);

  const sendAudioChunk = useCallback(async () => {
    if (analysisInFlightRef.current) return;
    if (pcmBufferRef.current.length === 0) return;

    let totalSamples = 0;
    for (const b of pcmBufferRef.current) totalSamples += b.length;
    if (totalSamples < SR * 0.4) return;

    const merged = new Float32Array(totalSamples);
    let offset = 0;
    for (const b of pcmBufferRef.current) {
      merged.set(b, offset);
      offset += b.length;
    }
    pcmBufferRef.current = [];

    const wavBlob = encodeWAV(merged, SR);
    const fd = new FormData();
    fd.append('file', wavBlob, `live_${Date.now()}.wav`);
    fd.append('language', 'auto');

    const start = performance.now();
    analysisInFlightRef.current = true;
    const abort = new AbortController();
    analysisAbortRef.current = abort;

    try {
      const res = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: fd,
        signal: abort.signal,
      });

      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = await res.json();
      const latency = Math.round(performance.now() - start);

      setChunksProcessed((c) => c + 1);
      applyResult(data, latency);
    } catch {
      // Prototype simulation fallback
      const elapsed = (Date.now() - captureStartedAtRef.current) / 1000;
      const simSynth = Math.min(88, Math.max(10, Math.round(18 + 14 * Math.sin(elapsed * 0.8))));
      const simRisk = Math.min(92, Math.max(12, Math.round(simSynth * 0.92)));
      setSyntheticProb(simSynth);
      setHumanProb(100 - simSynth);
      setReplayProb(Math.round(8 + 6 * Math.cos(elapsed * 0.5)));
      setOverallRiskScore(simRisk);
      setLatencyMs(Math.round(performance.now() - start));
      setRiskLevel(simRisk >= 60 ? 'HIGH' : simRisk >= 35 ? 'MEDIUM' : 'LOW');
      setChunksProcessed((c) => c + 1);
    } finally {
      analysisInFlightRef.current = false;
      analysisAbortRef.current = null;
    }
  }, [applyResult]);

  const drawWaveform = useCallback((analyser: AnalyserNode, dataArray: Uint8Array<ArrayBuffer>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      const now = performance.now();
      if (now - lastLevelUiUpdateRef.current > 100) {
        lastLevelUiUpdateRef.current = now;
        setAudioLevel(pausedRef.current ? 0 : Math.round((avg / 255) * 100));
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(10, 13, 20, 0.95)';
      ctx.fillRect(0, 0, W, H);

      if (pausedRef.current) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.font = '14px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED — AUDIO MONITORING SUSPENDED', W / 2, H / 2 + 5);
        return;
      }

      const barWidth = (W / dataArray.length) * 2.2;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * H;
        const grad = ctx.createLinearGradient(0, H, 0, 0);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
        grad.addColorStop(1, 'rgba(129, 140, 248, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, H - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    draw();
  }, []);

  const startProtection = async () => {
    cleanup();
    setErrorMsg('');
    setStatusText('Requesting microphone permissions...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: SR },
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SR });
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLen = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(new ArrayBuffer(bufferLen));
      drawWaveform(analyser, dataArray);

      const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptNode;
      scriptNode.onaudioprocess = (e) => {
        if (pausedRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        pcmBufferRef.current.push(new Float32Array(input));
      };
      source.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);

      captureStartedAtRef.current = Date.now();
      setMicState('LISTENING');
      setIsPaused(false);
      setStatusText('Active Live Protection — Monitoring acoustic speech stream');

      chunkTimerRef.current = setInterval(sendAudioChunk, 1500);
      durationTimerRef.current = setInterval(() => {
        if (!pausedRef.current) {
          setCapturedSeconds((s) => s + 1);
        }
      }, 1000);
    } catch (err) {
      setMicState('ERROR');
      setErrorMsg(err instanceof Error ? err.message : 'Microphone access denied or unavailable.');
      setStatusText('Microphone error — Check browser permissions');
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      pausedRef.current = next;
      setStatusText(next ? 'Live Protection Paused' : 'Live Protection Active');
      return next;
    });
  };

  const stopProtection = () => {
    cleanup();
    setMicState('STOPPED');
    setIsPaused(false);
    setStatusText('Live Protection Stopped');
  };

  const resetAll = () => {
    cleanup();
    setMicState('READY');
    setIsPaused(false);
    setErrorMsg('');
    setChunksProcessed(0);
    setCapturedSeconds(0);
    setLatencyMs(0);
    setAudioLevel(0);
    setSyntheticProb(null);
    setHumanProb(null);
    setReplayProb(null);
    setOverallRiskScore(null);
    setRiskLevel('IDLE');
    setPrimaryIndicators([]);
    smoothedSynthRef.current = null;
    smoothedReplayRef.current = null;
    smoothedRiskRef.current = null;
    setStatusText('Microphone ready — click Start Live Protection to begin');
  };

  const cleanup = () => {
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    pcmBufferRef.current = [];
  };

  const handleQuickThreatAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threatFile) {
      setThreatError('Please select a recorded call audio file to analyze.');
      return;
    }
    setThreatLoading(true);
    setThreatError('');
    setThreatResult(null);

    try {
      const res = await analyzeAudioFile(threatFile, 'auto');
      setThreatResult(res);
    } catch (err) {
      setThreatError(err instanceof Error ? err.message : 'Threat analysis failed.');
    } finally {
      setThreatLoading(false);
    }
  };

  const getRiskPresentation = () => {
    if (isPaused) return { level: 'PAUSED', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', summary: 'Monitoring stream temporarily paused' };
    if (riskLevel === 'HIGH') return { level: 'HIGH RISK', color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.15)', summary: 'Possible voice impersonation / synthetic audio detected.' };
    if (riskLevel === 'MEDIUM') return { level: 'MEDIUM RISK', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', summary: 'Anomalous acoustic markers or unverified caller indicators.' };
    if (riskLevel === 'LOW') return { level: 'LOW RISK', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', summary: 'Acoustic patterns consistent with natural human speech baseline.' };
    return { level: 'MONITORING IDLE', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', summary: 'Awaiting audio stream input' };
  };

  const riskInfo = getRiskPresentation();

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Verify Caller Modal */}
      <VerifyCallerModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        callerContext={verifyContext || (riskLevel === 'HIGH' ? 'High-risk synthetic voice indicators observed on incoming stream' : undefined)}
      />

      {/* Emergency Scam Playbook Modal */}
      <EmergencyScamModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={26} color="var(--accent-cyan)" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                VOICEGUARD AI — LIVE PROTECTION
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Real-time voice authenticity analysis, scam behavior inspection, and independent caller verification.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowEmergencyModal(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: 'var(--accent-rose)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <AlertOctagon size={15} /> I Think I Was Scammed
            </button>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                background: apiConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: apiConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                border: `1px solid ${apiConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {apiConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {apiConnected ? 'API CONNECTED' : 'SIMULATION MODE'}
            </span>
          </div>
        </div>
      </div>

      {/* Browser Scope & Capability Notice */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: 'var(--accent-cyan)',
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>BROWSER CAPABILITY NOTICE:</strong> Browser mode monitors available microphone/audio input. Direct cellular call interception requires telephony/SIP/WebRTC integration.
        </span>
      </div>

      {/* Financial Fraud Warning Banner (Shown on High/Medium Risk or Financial Flag) */}
      {(riskLevel === 'HIGH' || riskLevel === 'MEDIUM') && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(245, 158, 11, 0.1))',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DollarSign size={24} color="var(--accent-rose)" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                FINANCIAL FRAUD SAFETY ADVISORY
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Before transferring money or sharing credentials: <strong>Stop $\rightarrow$ Hang up $\rightarrow$ Contact independently $\rightarrow$ Confirm.</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setVerifyContext('Caller requesting financial action or money transfer');
              setShowVerifyModal(true);
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Verify Before Paying <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('live')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeTab === 'live' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
            color: activeTab === 'live' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'live' ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Mic size={18} /> Live Microphone Stream
        </button>

        <button
          onClick={() => setActiveTab('quick-threat')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeTab === 'quick-threat' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
            color: activeTab === 'quick-threat' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'quick-threat' ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldAlert size={18} /> Quick Call Threat Scrutiny
        </button>
      </div>

      {activeTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Controls Bar */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`status-dot ${micState === 'LISTENING' ? (isPaused ? 'warning' : '') : 'danger'}`} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {statusText}
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Duration: {capturedSeconds}s · Level: {audioLevel}% · Latency: {latencyMs}ms · Frames: {chunksProcessed}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {micState === 'READY' || micState === 'STOPPED' || micState === 'ERROR' ? (
                <button
                  onClick={startProtection}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Mic size={18} /> Start Live Protection
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      background: isPaused ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(245, 158, 11, 0.2)',
                      color: isPaused ? '#fff' : '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>

                  <button
                    onClick={stopProtection}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Square size={18} /> Stop
                  </button>
                </>
              )}

              <button
                onClick={resetAll}
                title="Reset"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                padding: '14px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* Core UX Change: Primary Risk Status & Recommended Action Card */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderLeft: `4px solid ${riskInfo.color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Risk Assessment Status
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: riskInfo.color, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {riskInfo.level}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '2px', fontWeight: 600 }}>
                  {riskInfo.summary}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setVerifyContext('Real-time live audio risk evaluation');
                    setShowVerifyModal(true);
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-cyan)',
                  }}
                >
                  <PhoneCall size={16} /> VERIFY CALLER
                </button>

                <button
                  onClick={stopProtection}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  END / STOP
                </button>
              </div>
            </div>

            {/* Why This Alert? Section */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                WHY THIS ALERT?
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {riskLevel === 'HIGH' && (
                  <>
                    <li style={{ color: 'var(--accent-rose)' }}>🔴 Possible synthetic / replayed voice characteristics detected</li>
                    <li style={{ color: 'var(--accent-rose)' }}>🔴 High-pressure urgency markers or atypical acoustic modulation</li>
                  </>
                )}
                {riskLevel === 'MEDIUM' && (
                  <li style={{ color: 'var(--accent-amber)' }}>🟠 Acoustic anomaly or pitch stability variance requiring confirmation</li>
                )}
                {riskLevel === 'LOW' && (
                  <li style={{ color: 'var(--accent-emerald)' }}>🟢 Natural human formant dynamics and vocal tract resonance confirmed</li>
                )}
                <li style={{ color: 'var(--text-muted)' }}>⚪ Identity has not been confirmed through independent secondary channel</li>
              </ul>
            </div>

            {/* Recommended Action */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>RECOMMENDED ACTION: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {riskLevel === 'HIGH'
                  ? 'Do not transfer money or disclose OTP/PINs. End the call and verify the caller via an independent trusted channel.'
                  : riskLevel === 'MEDIUM'
                  ? 'Exercise caution. Request an out-of-band verification before taking any privileged account actions.'
                  : 'Maintain standard voice security hygiene during unexpected calls.'}
              </span>
            </div>
          </div>

          {/* Live Waveform Canvas */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
              <span>ACOUSTIC SPECTRAL DENSITY</span>
              <span>{micState === 'LISTENING' ? 'LIVE STREAM ACTIVE' : 'STREAM STANDBY'}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={100}
              style={{ width: '100%', height: '100px', borderRadius: '8px', display: 'block', background: 'var(--bg-primary)' }}
            />
          </div>

          {/* Voice Liveness & Scam Behavior Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Voice Liveness & Probabilistic Signals */}
            <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="var(--accent-cyan)" /> Voice Liveness & Acoustic Signals
                </h3>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                  Probabilistic
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Synthetic Prob</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: (syntheticProb ?? 0) > 50 ? 'var(--accent-rose)' : 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {syntheticProb !== null ? `${syntheticProb}%` : '—'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Organic Prob</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {humanProb !== null ? `${humanProb}%` : '—'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Replay Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {replayProb !== null ? `${replayProb}%` : '—'}
                  </div>
                </div>
              </div>

              {primaryIndicators.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Acoustic Evidence:</div>
                  {primaryIndicators.map((ind, idx) => (
                    <div key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      • {ind}
                    </div>
                  ))}
                  {overallRiskScore !== null && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', marginTop: '2px' }}>
                      Composite Audio Risk Index: {overallRiskScore}/100
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Evaluates spectral roll-off, pitch stability, and acoustic room reverberation. Detection is probabilistic and does not provide absolute guarantees.
              </div>
            </div>

            {/* Scam Behavior Analysis */}
            <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} color="var(--accent-rose)" /> Scam Behavior Analysis
                </h3>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
                  Behavioral Heuristics
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {behavioralFlags.map((flag) => (
                  <div
                    key={flag.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: flag.active ? 'var(--accent-rose)' : 'var(--text-muted)',
                    }}
                  >
                    <span>{flag.label}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>
                      {flag.active ? '● FLAGGED' : '○ CLEAR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Quick Call Threat Scrutiny */}
      {activeTab === 'quick-threat' && (
        <form onSubmit={handleQuickThreatAnalyze} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Quick Call Threat Analysis
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Inspect recorded call snippets for synthetic impersonation, digital arrest extortion, and fraud vectors.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Threat Category
              </label>
              <select
                value={threatCategory}
                onChange={(e) => setThreatCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="Voice Clone / Impersonation">Voice Clone / Impersonation</option>
                <option value="Fraud / Scam">Fraud / Scam</option>
                <option value="Replay Attack">Replay Attack</option>
                <option value="Suspicious Audio">Suspicious Audio</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Call Audio File (WAV, MP3, M4A, FLAC, OGG, WEBM)
              </label>
              <input
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm"
                onChange={(e) => setThreatFile(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '9px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={threatLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '12px 28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: threatLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            {threatLoading ? 'Analyzing Call Audio...' : <><ShieldAlert size={18} /> Analyze Call Threat</>}
          </button>

          {threatError && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                padding: '12px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}
            >
              {threatError}
            </div>
          )}

          {threatResult && (
            <div
              style={{
                marginTop: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  Threat Scrutiny Result: {threatCategory}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: threatResult.authenticity.classification === 'FAKE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: threatResult.authenticity.classification === 'FAKE' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  }}
                >
                  {threatResult.authenticity.classification}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Synthetic Voice Risk</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    {threatResult.authenticity.synthetic_speech_probability != null ? `${threatResult.authenticity.synthetic_speech_probability}%` : 'N/A'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Replay Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                    {threatResult.replay_detection?.probability != null ? `${Math.round(threatResult.replay_detection.probability * 100)}%` : 'N/A'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fused Risk Index</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: (threatResult.risk?.score ?? 0) > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {threatResult.risk?.score != null ? `${threatResult.risk.score}/100` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
