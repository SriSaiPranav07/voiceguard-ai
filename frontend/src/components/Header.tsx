import React from 'react';
import { Mic, FileAudio, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onStartLive: () => void;
  onAnalyzeRecording: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onStartLive,
  onAnalyzeRecording,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const titles: Record<string, string> = {
    'overview': 'Security Overview Dashboard',
    'live-protection': 'Live Protection & Anti-Spoofing',
    'analyze-recording': 'Analyze Recording — Forensic Speech Analysis',
    'reports': 'Threat Intelligence & Forensic Reports',
    'demo-lab': 'SIH 2026 Threat Simulation & Demo Lab',
    'how-it-works': 'How VoiceGuard AI Works — Technical Architecture',
    'settings': 'Platform Settings & Configurations',
  };

  return (
    <header
      style={{
        padding: '20px 32px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{getGreeting()}</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Voice threat protection active
          </span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px', letterSpacing: '-0.01em', margin: 0 }}>
          {titles[currentView] || 'VoiceGuard AI'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onStartLive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Mic size={16} /> Start Live Protection
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
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <FileAudio size={16} /> Analyze Recording
        </button>
      </div>
    </header>
  );
};
