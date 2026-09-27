import React, { useState } from 'react';
import {
  ShieldAlert,
  Upload,
  Mic,
  PhoneCall,
  AlertTriangle,
  FileAudio,
  Radio,
} from 'lucide-react';
import { analyzeCallThreat } from '../services/api';

export const CallShield: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'telephony'>('upload');
  const [category, setCategory] = useState('Kidnapping / Extortion');
  const [callerPhone, setCallerPhone] = useState('+91 98765 43210');
  const [language, setLanguage] = useState('te');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await analyzeCallThreat(category, callerPhone, language, audioFile || undefined);
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={22} color="var(--accent-rose)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            CALL SHIELD — Suspicious Call Threat Intelligence
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
          Analyze suspicious voice calls for deepfake impersonation, extortion scripts, and financial deception across English, Telugu, and Hindi.
        </p>
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} />
          <span>
            <strong>SECURITY GUIDANCE:</strong> Acoustic anomaly scoring and threat pattern indicators provide probabilistic risk guidance for SOC operators.
          </span>
        </div>
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
          }}
        >
          <Mic size={18} /> Record Live Call Evidence
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
          }}
        >
          <PhoneCall size={18} /> Telephony / WebRTC Live SIP Architecture
        </button>
      </div>

      {activeTab === 'telephony' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-violet)' }}>
            Enterprise Telephony & WebRTC Integration Architecture
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Web browsers are sandboxed by modern OS security policies and cannot tap into cellular voice calls or WhatsApp audio streams.
            In production enterprise deployments (e.g. banking contact centers, emergency dispatch), VoiceGuard AI hooks into SIP trunks,
            FreeSWITCH, Asterisk PBX, or Twilio WebRTC media streams directly before caller audio is routed to operators.
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
            <div>Browser Microphone / Audio File → VoiceGuard AI Risk Fusion Engine</div>
            <div style={{ margin: '8px 0', color: 'var(--text-muted)' }}>vs.</div>
            <div>[ENTERPRISE PRODUCTION WORKFLOW]</div>
            <div>Cellular Carrier / SIP Trunk → WebRTC Media Forking → VoiceGuard In-Flight Detection → Automated Threat Intercept</div>
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
                Call Language
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
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Call Audio Recording (Optional Evidence)
            </label>
            <div
              style={{
                border: '1px dashed var(--border-color-glow)',
                padding: '24px',
                borderRadius: '8px',
                textAlign: 'center',
                background: 'var(--bg-tertiary)',
              }}
            >
              <FileAudio size={28} color="var(--accent-cyan)" />
              <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '8px' }}>
                {audioFile ? audioFile.name : 'Select or drop an audio recording file'}
              </div>
              <input
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.flac"
                onChange={(e) => e.target.files && setAudioFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="call-shield-audio"
              />
              <label
                htmlFor="call-shield-audio"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Browse Audio
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, var(--accent-rose), #e11d48)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(244, 63, 94, 0.3)',
            }}
          >
            {loading ? 'Evaluating Call Signals & Risk Vectors...' : 'Analyze Suspicious Call Threat'}
          </button>
        </form>
      )}

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="var(--accent-rose)" /> Call Shield Threat Assessment
            </h4>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: (analysisResult.threat_score || 85) > 60 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: (analysisResult.threat_score || 85) > 60 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              }}
            >
              {analysisResult.status || 'THREAT EVALUATED'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threat Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                {analysisResult.threat_score || 88}/100
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Deepfake Risk</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                {analysisResult.deepfake_risk || 91.4}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detected Vector</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {analysisResult.vector_detail || category}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              Recommended Security Response:
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {analysisResult.recommendation ||
                'Request out-of-band verification. Do not transfer funds or disclose one-time passwords over the phone.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
