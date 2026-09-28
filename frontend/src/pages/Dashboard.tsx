import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Mic,
  FileAudio,
  AlertTriangle,
  Radio,
  Server,
  ArrowRight,
  TrendingUp,
  Download,
  User,
  Bot,
  Play,
  Headphones,
} from 'lucide-react';
import { fetchHealth, fetchIncidents, fetchAnalysisHistory, type CallShieldIncidentItem, type HealthResponse, type AudioAnalysisResult } from '../services/api';

interface DashboardProps {
  onStartLive: () => void;
  onAnalyzeRecording: () => void;
  onSelectCallShield: () => void;
  onSelectAttackSim?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartLive,
  onAnalyzeRecording,
  onSelectCallShield,
  onSelectAttackSim,
}) => {
  const [incidents, setIncidents] = useState<CallShieldIncidentItem[]>([]);
  const [demoNotice, setDemoNotice] = useState('PROTOTYPE METRICS & DEMO LOGS');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AudioAnalysisResult[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth().then((h) => setHealth(h));
    fetchIncidents().then((res) => {
      setIncidents(res.incidents);
      if (res.demo_notice) setDemoNotice(res.demo_notice);
    });
    fetchAnalysisHistory().then((history) => {
      if (history && history.length > 0) {
        setRecentAnalyses(history.slice(-5).reverse());
      }
    });
  }, []);

  const getModelBadge = (status?: string) => {
    switch (status) {
      case 'PRODUCTION_MODEL':
        return { label: '● PRODUCTION MODEL', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'BASELINE_MODEL':
        return { label: '● BASELINE ML MODEL', color: 'var(--accent-cyan)', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'DEMO_MODE':
        return { label: '● DEMO MODE', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'MODEL_UNAVAILABLE':
        return { label: '● CLASSIFIER UNAVAILABLE', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { label: '● BACKEND CONNECTING', color: 'var(--accent-cyan)', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  const badgeInfo = getModelBadge(health?.model_status);
  const totalAnalysesCount = recentAnalyses.length;
  const scoredAnalyses = recentAnalyses.filter((a) => a.risk?.score != null);
  const highRiskCount = scoredAnalyses.filter((a) => (a.risk?.score ?? 0) > 60).length;
  const avgRisk = scoredAnalyses.length > 0
    ? Math.round(scoredAnalyses.reduce((acc, a) => acc + (a.risk?.score ?? 0), 0) / scoredAnalyses.length)
    : null;

  const handlePlayAudio = (filename: string) => {
    if (playingAudio === filename) {
      setPlayingAudio(null);
      return;
    }
    setPlayingAudio(filename);
    const audio = new Audio(`/${filename}`);
    audio.onended = () => setPlayingAudio(null);
    audio.play().catch(() => setPlayingAudio(null));
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Heading style helper ── */
  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const sectionSubStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    fontWeight: 400,
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — Platform & Model Status
         ═══════════════════════════════════════════════════════ */}
      <div>
        <h1 style={{ ...sectionHeadingStyle, marginBottom: '16px' }}>
          <Server size={22} color="var(--accent-cyan)" />
          VoiceGuard AI — SOC Dashboard
        </h1>
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#e2e8f0',
            padding: '14px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>
              <strong style={{ color: '#fff' }}>Engine Status:</strong>{' '}
              {health?.api_online ? 'FastAPI API Online · Authenticity model unavailable' : 'Connecting to VoiceGuard API'} (
              {health?.model_version || 'v1.0.0-SIH2026'}).
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                background: badgeInfo.bg,
                color: badgeInfo.color,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {badgeInfo.label}
            </span>
            <span className="badge-demo">{demoNotice}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — Key Performance Indicators
         ═══════════════════════════════════════════════════════ */}
      <div>
        <h2 style={{ ...sectionHeadingStyle, fontSize: '1.15rem', marginBottom: '16px' }}>
          <Activity size={20} color="var(--accent-emerald)" />
          Key Threat Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Analyses</span>
              <span className="badge-demo">METRIC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {totalAnalysesCount}
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--accent-cyan)' }}>
                <FileAudio size={22} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>High-Risk Threats</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-rose)' }}>CRITICAL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                {scoredAnalyses.length === 0 ? 'N/A' : highRiskCount}
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)' }}>
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Risk Score</span>
              <span className="badge-demo">FUSION</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: avgRisk == null ? 'var(--text-muted)' : avgRisk > 50 ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {avgRisk ?? 'N/A'}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--accent-amber)' }}>
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Multi-Layer Pipelines</span>
              <span className="badge-live">ONLINE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                4 / 4
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — Sample Audio Downloads
         ═══════════════════════════════════════════════════════ */}
      <div>
        <h2 style={{ ...sectionHeadingStyle, fontSize: '1.15rem', marginBottom: '6px' }}>
          <Headphones size={20} color="var(--accent-violet)" />
          Sample Audio Files for Testing
        </h2>
        <p style={sectionSubStyle}>
          Download these pre-generated audio samples to test VoiceGuard AI's deepfake detection capabilities.
          Upload them via the <strong style={{ color: 'var(--accent-cyan)' }}>Audio Analysis</strong> page.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
          {/* Human Voice Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderLeft: '4px solid var(--accent-emerald)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={24} color="var(--accent-emerald)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Human Voice Sample
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                  Authentic human speech — natural pitch variation, jitter, and breathing pauses
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                WAV
              </span>
              <span>16 kHz • 16-bit PCM • Mono • 4 seconds</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handlePlayAudio('human_voice_sample.wav')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: playingAudio === 'human_voice_sample.wav' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Play size={16} />
                {playingAudio === 'human_voice_sample.wav' ? 'Playing...' : 'Preview'}
              </button>
              <button
                onClick={() => handleDownload('human_voice_sample.wav')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          {/* AI Cloned Voice Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderLeft: '4px solid var(--accent-rose)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={24} color="var(--accent-rose)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  AI Cloned Voice Sample
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                  Synthetic TTS output — monotone pitch, vocoder artifacts, and robotic cadence
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', fontWeight: 700 }}>
                WAV
              </span>
              <span>16 kHz • 16-bit PCM • Mono • 4 seconds</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handlePlayAudio('ai_cloned_voice_sample.wav')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: playingAudio === 'ai_cloned_voice_sample.wav' ? 'var(--accent-rose)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Play size={16} />
                {playingAudio === 'ai_cloned_voice_sample.wav' ? 'Playing...' : 'Preview'}
              </button>
              <button
                onClick={() => handleDownload('ai_cloned_voice_sample.wav')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(244, 63, 94, 0.25)',
                }}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — Active Threats & Rapid Actions
         ═══════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Active Threats Feed */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ ...sectionHeadingStyle, fontSize: '1.1rem' }}>
                <ShieldAlert size={18} color="var(--accent-rose)" /> Active Threat & Impersonation Incidents
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Multilingual suspicious call analysis & voice impersonation logs
              </p>
            </div>
            <button onClick={onSelectCallShield} style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Open Call Shield →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {inc.id}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      background: 'rgba(148, 163, 184, 0.15)',
                      color: 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {inc.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {inc.status === 'SIMULATION' ? 'SIMULATION' : `Language: ${inc.detected_language || 'N/A'}`}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inc.transcript_snippet || 'Fictional scenario record; no transcript or model result is available.'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    {inc.deepfake_risk == null ? 'N/A' : `${inc.deepfake_risk}%`}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Deepfake Risk</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ ...sectionHeadingStyle, fontSize: '1.1rem' }}>
            Rapid Detection Actions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              onClick={onStartLive}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mic size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div>Start Live Detection</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.9 }}>Near Real-Time Browser Mic</div>
                </div>
              </div>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onAnalyzeRecording}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color-glow)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileAudio size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div>Analyze Audio Recording</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>WAV, MP3, FLAC, M4A</div>
                </div>
              </div>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onSelectCallShield}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'var(--accent-violet)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div>Call Shield Module</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>Extortion & Fraud Scams</div>
                </div>
              </div>
              <ArrowRight size={18} />
            </button>

            {onSelectAttackSim && (
              <button
                onClick={onSelectAttackSim}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio size={20} />
                  <div style={{ textAlign: 'left' }}>
                    <div>Attack Simulation Demo</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>SIH 2026 Jury Presentation Flow</div>
                  </div>
                </div>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
