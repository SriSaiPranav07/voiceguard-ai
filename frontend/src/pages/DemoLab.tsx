import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  AlertCircle,
  FileAudio,
  ShieldAlert,
  Radio,
  UserX,
  PhoneCall,
  KeyRound,
  Building,
} from 'lucide-react';
import { analyzeAudioFile, type AudioAnalysisResult } from '../services/api';

interface DemoScenario {
  id: string;
  name: string;
  category: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  icon: any;
  summary: string;
  transcript: string;
  targetObject: string;
  recommendation: string;
  defaultSampleUrl: string;
}

const scenarios: DemoScenario[] = [
  {
    id: 'scen-clone',
    name: 'Executive Voice Clone / Deepfake',
    category: 'Voice Clone / Impersonation',
    threatLevel: 'CRITICAL',
    icon: Building,
    summary: 'Synthetic clone of a company executive requesting an urgent out-of-band wire transfer.',
    transcript: '"I am currently in an urgent board meeting. Please authorize the $45,000 vendor wire immediately without delay."',
    targetObject: 'Corporate Wire Transfer ($45,000)',
    recommendation: 'Enforce mandatory dual-channel verification for high-value financial transactions.',
    defaultSampleUrl: '/ai_cloned_voice_sample.wav',
  },
  {
    id: 'scen-replay',
    name: 'Acoustic Replay Attack',
    category: 'Replay Attack',
    threatLevel: 'HIGH',
    icon: Radio,
    summary: 'Pre-recorded voice sample played back through a secondary loudspeaker into the microphone.',
    transcript: '"My name is John Doe, and my account passcode is Alpha-7749. Please unlock access."',
    targetObject: 'Voice Biometric Authentication Bypass',
    recommendation: 'Use liveness challenges and spectral impulse response checks to detect acoustic room echo.',
    defaultSampleUrl: '/human_voice_sample.wav',
  },
  {
    id: 'scen-emergency',
    name: 'Emergency Impersonation / Extortion',
    category: 'Fraud / Scam',
    threatLevel: 'CRITICAL',
    icon: UserX,
    summary: 'Distress call simulating a kidnapped or injured family member requesting immediate ransom.',
    transcript: '"Mom, I had an accident and the police took my phone! Please send money to this UPI ID right now!"',
    targetObject: 'Immediate Ransom / Emergency UPI Payment',
    recommendation: 'Hang up and immediately call the family member on their verified, known direct phone number.',
    defaultSampleUrl: '/ai_cloned_voice_sample.wav',
  },
  {
    id: 'scen-digital-arrest',
    name: 'Digital Arrest / Authority Spoofing',
    category: 'Fraud / Scam',
    threatLevel: 'CRITICAL',
    icon: ShieldAlert,
    summary: 'Impersonation of CBI / Cyber Crime Police alleging illegal parcel delivery and demanding video call surrender.',
    transcript: '"We are calling from CBI Cyber Crime HQ. A narcotics parcel under your Aadhaar has been intercepted. You are under Digital Arrest."',
    targetObject: 'Extortion money disguised as security bail bond',
    recommendation: 'Law enforcement agencies never conduct "Digital Arrests" or demand money over phone/video calls.',
    defaultSampleUrl: '/ai_cloned_voice_sample.wav',
  },
  {
    id: 'scen-otp',
    name: 'Banking Credential & OTP Scam',
    category: 'Fraud / Scam',
    threatLevel: 'HIGH',
    icon: KeyRound,
    summary: 'Caller posing as bank security officer asking for an immediate 6-digit OTP verification code.',
    transcript: '"To prevent your bank account from being suspended due to unauthorized access, please read out the 6-digit OTP you just received."',
    targetObject: '6-digit Banking OTP & Debit Card PIN',
    recommendation: 'Never disclose OTP or PIN codes. Banks never ask for OTP credentials over the phone.',
    defaultSampleUrl: '/human_voice_sample.wav',
  },
  {
    id: 'scen-suspicious',
    name: 'Suspicious Unknown Voice Call',
    category: 'Suspicious Audio',
    threatLevel: 'MEDIUM',
    icon: PhoneCall,
    summary: 'Unsolicited investment scheme with synthetic cadence and unnatural acoustic pitch contours.',
    transcript: '"Guaranteed 25% weekly returns on institutional trading. Confirm your participation today by speaking with our automated agent."',
    targetObject: 'Unregulated Investment Fraud',
    recommendation: 'Do not trust unsolicited high-return financial offers over cold calls.',
    defaultSampleUrl: '/ai_cloned_voice_sample.wav',
  },
];

const testAudioSamples = [
  { name: 'AI Cloned Voice Sample', url: '/ai_cloned_voice_sample.wav', isSynthetic: true },
  { name: 'Authentic Human Voice Sample', url: '/human_voice_sample.wav', isSynthetic: false },
];

export const DemoLab: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedSampleUrl, setSelectedSampleUrl] = useState(testAudioSamples[0].url);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const activeScenario = scenarios[selectedScenarioIndex];

  const handleRunSimulation = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let audioFile = uploadedFile;
      if (!audioFile) {
        const response = await fetch(selectedSampleUrl);
        if (!response.ok) throw new Error(`Could not load test sample file (${response.status}).`);
        const blob = await response.blob();
        audioFile = new File([blob], selectedSampleUrl.split('/').pop() || 'demo-sample.wav', {
          type: blob.type || 'audio/wav',
        });
      }
      const data = await analyzeAudioFile(audioFile, 'auto');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'var(--accent-rose)';
      case 'HIGH':
        return 'var(--accent-rose)';
      case 'MEDIUM':
        return 'var(--accent-amber)';
      default:
        return 'var(--accent-emerald)';
    }
  };

  const getThreatBadgeBg = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'rgba(244, 63, 94, 0.15)';
      case 'MEDIUM':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(16, 185, 129, 0.15)';
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FlaskConical size={24} color="var(--accent-cyan)" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                DEMO LAB — Threat Simulation Suite
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Interactive cybersecurity threat testing sandbox for Smart India Hackathon (SIH 2026) demonstrations.
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              ● DEMO / SIMULATION MODE
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Threat Scenario
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {scenarios.map((scen, idx) => {
            const Icon = scen.icon;
            const isSelected = idx === selectedScenarioIndex;
            return (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setResult(null);
                  setError('');
                }}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-secondary)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                      {scen.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: getThreatBadgeBg(scen.threatLevel),
                      color: getThreatColor(scen.threatLevel),
                    }}
                  >
                    {scen.threatLevel}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {scen.summary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Scenario Details & Controls */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Scenario: {activeScenario.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Category: <strong style={{ color: 'var(--accent-cyan)' }}>{activeScenario.category}</strong>
            </p>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: getThreatBadgeBg(activeScenario.threatLevel),
              color: getThreatColor(activeScenario.threatLevel),
            }}
          >
            {activeScenario.threatLevel} SEVERITY
          </span>
        </div>

        {/* Threat Transcript & Security Context */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Simulated Audio Transcript
          </div>
          <div style={{ fontSize: '0.95rem', color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>
            {activeScenario.transcript}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '6px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Target Object: </span>
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{activeScenario.targetObject}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mitigation: </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{activeScenario.recommendation}</span>
            </div>
          </div>
        </div>

        {/* Audio Input Selectors & Execution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Test Audio Input Sample
            </label>
            <select
              value={selectedSampleUrl}
              onChange={(e) => {
                setSelectedSampleUrl(e.target.value);
                setUploadedFile(null);
              }}
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
              {testAudioSamples.map((sample) => (
                <option key={sample.url} value={sample.url}>
                  {sample.name} {sample.isSynthetic ? '(AI Cloned)' : '(Genuine Human)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Or Upload Custom Test Audio
            </label>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg,.webm"
              onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
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

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            {loading ? (
              'Analyzing Audio Pipeline...'
            ) : (
              <>
                <Play size={18} /> Run Threat Simulation
              </>
            )}
          </button>
        </div>

        {error && (
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
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Simulation Output */}
        {result && (
          <div
            style={{
              marginTop: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                <FileAudio size={20} color="var(--accent-cyan)" /> Simulation Analysis Verdict
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                }}
              >
                PROTOTYPE HEURISTIC RESULT
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authenticity Verdict</div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: result.authenticity.classification === 'FAKE' ? 'var(--accent-rose)' : result.authenticity.classification === 'SUSPICIOUS' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                  }}
                >
                  {result.authenticity.classification}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Synthetic Voice Likelihood</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {result.authenticity.synthetic_speech_probability != null ? `${result.authenticity.synthetic_speech_probability}%` : 'N/A'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Replay Likelihood</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {result.replay_detection?.probability != null ? `${Math.round(result.replay_detection.probability * 100)}%` : 'N/A'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calculated Risk Score</div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: (result.risk?.score ?? 0) > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                  }}
                >
                  {result.risk?.score != null ? `${result.risk.score}/100` : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Audio: {result.filename} · Duration: {result.duration}s · Sample Rate: {result.sample_rate} Hz · Channels: {result.channels}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
