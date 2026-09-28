import React, { useState } from 'react';
import {
  ShieldAlert,
  Upload,
  Mic,
  PhoneCall,
  AlertTriangle,
  FileAudio,
  Radio,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { analyzeCallThreat } from '../services/api';

export const CallShield: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'telephony'>('upload');
  const [category, setCategory] = useState('Kidnapping / Extortion');
  const [callerPhone, setCallerPhone] = useState('+91 98765 43210');
  const [language, setLanguage] = useState('en');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio duration detection via Web Audio
  const handleFileSelect = (file: File) => {
    setErrorMsg('');
    setAudioFile(file);
    setAnalysisResult(null);

    // Try reading duration via AudioContext
    try {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration)) {
          setFileDuration(Math.round(audio.duration * 10) / 10);
        }
      };
    } catch {
      setFileDuration(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile && activeTab === 'upload') {
      setErrorMsg('Please upload a recorded call audio file to perform Call Shield analysis.');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setErrorMsg('');

    try {
      const res = await analyzeCallThreat(category, callerPhone, language, audioFile || undefined);
      setAnalysisResult(res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Call Shield threat analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getFormatName = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'AUDIO';
    return ext;
  };

  const getRiskBadge = (level?: string, score?: number) => {
    if (level === 'HIGH' || (score && score >= 60)) {
      return { text: 'HIGH RISK', color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' };
    }
    if (level === 'MEDIUM' || (score && score >= 35)) {
      return { text: 'MEDIUM RISK', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { text: 'LOW RISK', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={24} color="var(--accent-rose)" />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            CALL SHIELD — Suspicious Call Threat Analysis
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
          Defensive audio forensics for incoming extortion calls, digital arrest threats, voice clone scams, and impersonation fraud.
        </p>
      </div>

      {/* Mode Navigation */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: '10px',
            background: activeTab === 'upload' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
            border: activeTab === 'upload' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            color: activeTab === 'upload' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Upload size={18} /> Upload Call Recording
        </button>

        <button
          onClick={() => setActiveTab('record')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: '10px',
            background: activeTab === 'record' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
            border: activeTab === 'record' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
            color: activeTab === 'record' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Mic size={18} /> Record Call Evidence
        </button>

        <button
          onClick={() => setActiveTab('telephony')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px',
            borderRadius: '10px',
            background: activeTab === 'telephony' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-secondary)',
            border: activeTab === 'telephony' ? '1px solid var(--accent-violet)' : '1px solid var(--border-color)',
            color: activeTab === 'telephony' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <PhoneCall size={18} /> Telephony / WebRTC Architecture
        </button>
      </div>

      {activeTab === 'telephony' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-violet)' }}>
            Enterprise Telephony & WebRTC Integration Architecture
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Web browsers operate in sandboxes and cannot intercept live GSM/cellular phone calls or WhatsApp VoIP media directly.
            In production enterprise deployments (banking contact centers, emergency dispatch, financial institutions), VoiceGuard AI hooks into SIP trunks,
            FreeSWITCH, Asterisk PBX, or Twilio media forking streams before caller audio connects to human agents.
          </p>

          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '24px',
              borderRadius: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              lineHeight: 1.8,
            }}
          >
            <div>[PROTOTYPE WORKFLOW]</div>
            <div>Browser Microphone / Audio File Upload → VoiceGuard AI Risk Fusion Engine</div>
            <div style={{ margin: '8px 0', color: 'var(--text-muted)' }}>vs.</div>
            <div>[ENTERPRISE PRODUCTION WORKFLOW]</div>
            <div>Cellular Carrier / SIP Trunk → WebRTC Media Forking → In-Flight Forensic Analysis → Real-Time Threat Intercept</div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-panel"
          style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Threat Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              >
                {[
                  'Kidnapping / Extortion',
                  'Voice Deepfake Scam / Fraud',
                  'Cyber Threat Impersonation',
                  'Digital Arrest Authority Scam',
                  'Emergency Relative Impersonation',
                  'OTP & Banking Credentials Theft',
                  'Unknown Suspicious Call',
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Caller Phone Number / ID
              </label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Call Spoken Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              >
                <option value="en">English (EN)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="auto">Auto Detect</option>
              </select>
            </div>
          </div>

          {/* Audio Upload Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Call Recording Audio File (Supported: WAV, MP3, M4A, FLAC, OGG, WEBM, AAC, OPUS)
            </label>
            <div
              style={{
                border: audioFile ? '2px solid var(--accent-cyan)' : '2px dashed var(--border-color-glow)',
                padding: '28px',
                borderRadius: '10px',
                textAlign: 'center',
                background: 'var(--bg-tertiary)',
                transition: 'all 0.2s',
              }}
            >
              <FileAudio size={36} color="var(--accent-cyan)" />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '10px' }}>
                {audioFile ? audioFile.name : 'Select or drop a recorded call audio file'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {audioFile
                  ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB • ${getFormatName(audioFile.name)} ${fileDuration ? `• ${fileDuration}s duration` : ''}`
                  : 'WAV, MP3, M4A, FLAC, OGG, WEBM up to 25 MB'}
              </div>

              <input
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm,.aac,.opus"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
                id="call-shield-audio-file"
              />
              <label
                htmlFor="call-shield-audio-file"
                style={{
                  display: 'inline-block',
                  marginTop: '14px',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {audioFile ? 'Change File' : 'Browse Audio Recording'}
              </label>
            </div>
          </div>

          {/* File Metadata Overview if selected */}
          {audioFile && (
            <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FILE NAME</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {audioFile.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FILE SIZE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AUDIO FORMAT</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {getFormatName(audioFile.name)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMATED DURATION</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {fileDuration ? `${fileDuration}s` : 'Analyzing upon upload'}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, var(--accent-rose), #e11d48)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: '8px',
              boxShadow: '0 0 18px rgba(244, 63, 94, 0.35)',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {loading ? 'Executing Multi-Modal Acoustic Forensic Analysis...' : 'ANALYZE CALL'}
          </button>
        </form>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af', padding: '16px 20px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CALL SHIELD REPORT */}
      {analysisResult && (
        <div className="glass-panel" style={{ padding: '32px', borderLeft: '6px solid var(--accent-rose)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Official Threat Intelligence Assessment
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={24} color="var(--accent-rose)" /> CALL SHIELD REPORT
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: getRiskBadge(analysisResult.risk_level, analysisResult.threat_score).bg,
                  color: getRiskBadge(analysisResult.risk_level, analysisResult.threat_score).color,
                  border: `1px solid ${getRiskBadge(analysisResult.risk_level, analysisResult.threat_score).border}`,
                }}
              >
                OVERALL RISK: {analysisResult.risk_level || 'EVALUATED'}
              </span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Overall Threat Score */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Threat Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {analysisResult.threat_score != null ? `${analysisResult.threat_score}/100` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fused multi-vector risk index
              </div>
            </div>

            {/* Synthetic Voice Risk */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Synthetic Voice Risk</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: analysisResult.deepfake_risk && analysisResult.deepfake_risk > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {analysisResult.deepfake_risk != null ? `${analysisResult.deepfake_risk}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {analysisResult.deepfake_risk != null ? (analysisResult.deepfake_risk > 60 ? 'High synthetic probability' : 'Low vocoder distortion') : 'Acoustic check pending'}
              </div>
            </div>

            {/* Replay Risk */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Replay Risk</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: analysisResult.replay_risk && analysisResult.replay_risk > 40 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {analysisResult.replay_risk != null ? `${analysisResult.replay_risk}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Physical channel crest factor
              </div>
            </div>

            {/* Speaker Verification Status */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Speaker Verification</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '8px' }}>
                NOT AVAILABLE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Reference voice not enrolled
              </div>
            </div>
          </div>

          {/* Threat Indicators */}
          {analysisResult.evidence && analysisResult.evidence.length > 0 && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="var(--accent-amber)" /> Detected Forensic Threat Indicators:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisResult.evidence.map((item: string, i: number) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Defensive Cyber Recommendation */}
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '20px 24px',
              borderRadius: '10px',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-rose)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> DEFENSIVE CYBER FRAUD RECOMMENDATION:
            </div>
            <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.5, fontWeight: 600 }}>
              {analysisResult.recommendation ||
                'Verify the caller through a trusted second channel. Do not share OTP, PIN or passwords. Pause sensitive transactions until identity is independently verified.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
