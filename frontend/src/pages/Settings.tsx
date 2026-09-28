import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  MessageSquare,
  LogOut,
  LogIn,
  CheckCircle2,
  Lock,
  Server,
} from 'lucide-react';
import { fetchHealth, type User, type HealthResponse } from '../services/api';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onNavigateAuth: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, onNavigateAuth }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchHealth().then((h) => setHealth(h));
  }, []);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.trim()) {
      setSubmitted(true);
      setComments('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={24} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            SETTINGS & SYSTEM CONFIGURATION
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          Manage user session, verify live API diagnostics, and review data privacy policies.
        </p>
      </div>

      {/* Account & Session Controls */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--accent-blue)" /> Account & Session Management
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
            padding: '16px 20px',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              {user ? user.name : 'Unauthenticated Session'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {user ? `${user.email} • Role: ${user.role}` : 'Sign in to access personalized threat intelligence sessions.'}
            </div>
          </div>
          <div>
            {user ? (
              <button
                onClick={onLogout}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(244, 63, 94, 0.3)',
                }}
              >
                <LogOut size={16} /> Logout Session
              </button>
            ) : (
              <button
                onClick={onNavigateAuth}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-cyan)',
                }}
              >
                <LogIn size={16} /> Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* System Diagnostics & API Status */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--accent-cyan)" /> System Health & API Connectivity
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>API Server</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: health?.api_online ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '4px' }}>
              {health?.api_online ? '● Connected' : '● Offline (Simulation Active)'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Acoustic Processing Pipeline</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              NumPy / 16 kHz Mono WAV
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
              {health?.model_status || 'Prototype Heuristic Detector'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Data Handling Policy */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--accent-emerald)" /> Privacy & Security Guidelines
        </h2>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 10px' }}>
            • <strong>Zero Persistent Audio Retention:</strong> Audio submitted for analysis is processed strictly in-memory and discarded upon completion of spectral feature extraction.
          </p>
          <p style={{ margin: '0 0 10px' }}>
            • <strong>Browser Sandboxing:</strong> Real-time microphone monitoring is client-driven and can be started, paused, or terminated at any time by the user.
          </p>
          <p style={{ margin: 0 }}>
            • <strong>Client-Side PDF Generation:</strong> PDF reports are compiled locally inside your web browser using HTML5 Canvas & jsPDF without transmitting forensic exports to third-party servers.
          </p>
        </div>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmitFeedback} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-cyan)" /> Submit Feedback / Issue Report
        </h2>

        {submitted && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} /> Thank you! Your feedback has been recorded.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Audio Analysis Accuracy">Audio Analysis Accuracy</option>
              <option value="Live Detection Performance">Live Detection Performance</option>
              <option value="Bug Report">Bug Report</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Comments & Observations
            </label>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe your feedback or observation..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-cyan)',
          }}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};
