import React from 'react';
import { Mic, FileAudio, Shield, Globe } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onStartLive: () => void;
  onAnalyzeRecording: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onStartLive,
  onAnalyzeRecording
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const titles: Record<string, string> = {
    'overview': 'Security Monitoring Dashboard',
    'live-detection': 'Real-Time Live Voice Detection',
    'call-shield': 'Call Shield Threat Intelligence',
    'audio-analysis': 'Deepfake & Synthetic Speech Analysis',
    'multilingual': 'Multilingual Voice Intelligence (EN / TE / HI)',
    'speaker-verification': 'Speaker Verification & Biometrics',
    'threat-intel': 'Global Voice Threat Feed',
    'incidents': 'Incident Response & Case Management',
    'analytics': 'Forensic Security Analytics',
    'ai-models': 'AI Model Pipeline & Benchmarks',
    'evidence-center': 'Encrypted Evidence Storage',
    'settings': 'Platform & API Configurations'
  };

  return (
    <header style={{
      padding: '20px 32px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{getGreeting()}</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={14} /> Voice security monitoring is active
          </span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
          {titles[currentView] || 'VoiceGuard AI'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <Globe size={14} color="var(--accent-cyan)" />
          <span>Multilingual Engine</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>EN • TE • HI</span>
        </div>

        {/* Header Action Buttons */}
        <button
          onClick={onStartLive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Mic size={16} /> Start Live Detection
        </button>

        <button
          onClick={onAnalyzeRecording}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color-glow)',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px'
          }}
        >
          <FileAudio size={16} /> Analyze Recording
        </button>
      </div>
    </header>
  );
};
