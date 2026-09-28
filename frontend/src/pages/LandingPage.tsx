import React from 'react';
import {
  ShieldCheck,
  Mic,
  FileAudio,
  ArrowRight,
  Activity,
  Layers,
  Fingerprint,
  Radio,
  Sliders,
  FlaskConical,
} from 'lucide-react';
import { HeroWaveform } from '../components/HeroWaveform';

interface LandingPageProps {
  onStartLive: () => void;
  onAnalyzeRecording: () => void;
  onViewDemo: () => void;
  onExploreDemoLab: () => void;
  onHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLive,
  onAnalyzeRecording,
  onViewDemo,
  onExploreDemoLab,
  onHowItWorks,
}) => {
  const pipelineSteps = [
    { label: 'VOICE INPUT', icon: Mic },
    { label: 'PREPROCESSING', icon: Sliders },
    { label: 'SPECTRAL FEATURES', icon: Layers },
    { label: 'SPEAKER BIOMETRICS', icon: Fingerprint },
    { label: 'REPLAY DETECTION', icon: Radio },
    { label: 'RISK FUSION', icon: Activity },
    { label: 'DEFENSE VERDICT', icon: ShieldCheck },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: '#fff', paddingBottom: '60px' }}>
      {/* Top Navigation */}
      <nav
        style={{
          padding: '20px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(10, 13, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em' }}>
            VOICEGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onHowItWorks}
            style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            How It Works
          </button>
          <button
            onClick={onExploreDemoLab}
            style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Demo Lab
          </button>
          <button
            onClick={onViewDemo}
            style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Dashboard
          </button>
          <button
            onClick={onStartLive}
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
            }}
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '60px auto 40px', padding: '0 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: 'var(--accent-cyan)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          <ShieldCheck size={16} /> AI Voice Cybersecurity Platform — SIH 2026 Edition
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: '920px',
            margin: '0 auto 20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Protect Every Voice.
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Detect AI Impersonation In Real Time.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '840px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          VoiceGuard AI evaluates acoustic artifacts, spectral vocoder footprints, replay signatures, and speaker
          biometric embeddings to distinguish genuine human voices from AI-generated clones and replay attacks.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button
            onClick={onStartLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Mic size={20} /> Start Live Protection
          </button>

          <button
            onClick={onAnalyzeRecording}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color-glow)',
              color: 'var(--accent-cyan)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <FileAudio size={20} /> Analyze Recording
          </button>

          <button
            onClick={onExploreDemoLab}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '14px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <FlaskConical size={18} color="var(--accent-violet)" /> Demo Lab
          </button>

          <button
            onClick={onHowItWorks}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            How It Works <ArrowRight size={16} />
          </button>
        </div>

        {/* Pipeline Steps Flow */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Real-Time Voice Threat Analysis Pipeline
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}
          >
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      minWidth: '105px',
                      padding: '12px 8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}
                  >
                    <Icon size={18} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {step.label}
                    </span>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <HeroWaveform />
      </section>
    </div>
  );
};
