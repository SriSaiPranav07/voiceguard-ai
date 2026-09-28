import React, { useState, useEffect } from 'react';
import {
  Mic,
  FileAudio,
  FlaskConical,
  ArrowRight,
  Play,
  Sparkles,
  Radio,
} from 'lucide-react';
import { fetchHealth, type HealthResponse } from '../services/api';

interface DashboardProps {
  onStartLive: () => void;
  onAnalyzeRecording: () => void;
  onSelectDemoLab: () => void;
  onSelectReports?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartLive,
  onAnalyzeRecording,
  onSelectDemoLab,
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth().then((h) => setHealth(h));
  }, []);

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

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Welcome & Identity */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          borderLeft: '4px solid var(--accent-cyan)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={14} /> AI-Powered Voice Cybersecurity
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            VOICEGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
            Real-time AI-powered voice threat detection, synthetic speech analysis, and anti-spoofing protection.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <button
          onClick={onStartLive}
          style={{
            padding: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Mic size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Start Live Protection</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Real-time microphone stream monitoring
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--accent-emerald)" />
        </button>

        <button
          onClick={onAnalyzeRecording}
          style={{
            padding: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.1))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <FileAudio size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Analyze Recording</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Upload or record forensic speech files
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--accent-cyan)" />
        </button>

        <button
          onClick={onSelectDemoLab}
          style={{
            padding: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <FlaskConical size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Open Demo Lab</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Simulate voice clone & fraud scenarios
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--accent-violet)" />
        </button>
      </div>

      {/* System Status & Key Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Protection Engine</span>
            <span className="badge-demo">Live</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: health?.api_online ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            {health?.api_online ? 'ACTIVE' : 'SIMULATION'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {health?.api_online ? 'Real-time API connected' : 'Client simulation fallback'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Acoustic Pipeline</span>
            <span className="badge-demo">Status</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            16 kHz Mono
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            RMS Normalization & MFCCs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Voice Threat Scenarios</span>
            <span className="badge-demo">Demo Data</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            6 Vectors
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tested in Demo Lab
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Average Inference Time</span>
            <span className="badge-demo">Live</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            ~24ms
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fast spectral feature analysis
          </div>
        </div>
      </div>

      {/* Test Voice Audio Samples Preview */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={18} color="var(--accent-cyan)" /> Pre-Loaded Audio Benchmark Samples
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Listen to sample test recordings provided for live demonstration:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                Authentic Human Voice
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                human_voice_sample.wav
              </div>
            </div>
            <button
              onClick={() => handlePlayAudio('human_voice_sample.wav')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: playingAudio === 'human_voice_sample.wav' ? 'var(--accent-rose)' : 'rgba(16, 185, 129, 0.2)',
                color: playingAudio === 'human_voice_sample.wav' ? '#fff' : 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Play size={14} /> {playingAudio === 'human_voice_sample.wav' ? 'Stop' : 'Play'}
            </button>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                AI Cloned Voice (Synthetic)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                ai_cloned_voice_sample.wav
              </div>
            </div>
            <button
              onClick={() => handlePlayAudio('ai_cloned_voice_sample.wav')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: playingAudio === 'ai_cloned_voice_sample.wav' ? 'var(--accent-rose)' : 'rgba(244, 63, 94, 0.2)',
                color: playingAudio === 'ai_cloned_voice_sample.wav' ? '#fff' : 'var(--accent-rose)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Play size={14} /> {playingAudio === 'ai_cloned_voice_sample.wav' ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
