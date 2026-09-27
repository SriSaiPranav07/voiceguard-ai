import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  MessageSquare,
  LogOut,
  LogIn,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { User } from '../services/api';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onNavigateAuth: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, onNavigateAuth }) => {
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.trim()) {
      setSubmitted(true);
      setComments('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon color="var(--accent-cyan)" /> Platform Settings & Operational Controls
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Manage administrator session access, view privacy guidelines, and submit SOC engineering feedback.
        </p>
      </div>

      {/* Account & Session Controls */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--accent-blue)" /> Account & SOC Session Management
        </h4>
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
              {user ? `${user.email} • Role: ${user.role}` : 'Please authenticate to access restricted SOC operations.'}
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
                  boxShadow: 'var(--shadow-cyan)',
                }}
              >
                <LogIn size={16} /> Login / Authenticate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Privacy & Data Governance (Prompt Rule 21 & 22) */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--accent-emerald)" /> Privacy by Design & Data Protection Principles
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>Zero Voice Retention Default</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              Raw voice audio received by VoiceGuard AI is processed in volatile memory and immediately deleted after feature extraction. No permanent audio recordings are kept on disk.
            </p>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>Encrypted Telemetry & Metadata</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              Analysis IDs, threat scores, and acoustic indicators are logged as non-reversible mathematical metrics without biometric identity or private conversation text.
            </p>
          </div>
        </div>
      </div>

      {/* Guides Section */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--accent-cyan)" /> SOC Operational Guides
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Forensic Audio Analysis Guide</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Learn how VoiceGuard AI detects high-frequency neural vocoder artifacts, spectral roll-off anomalies, and robotic pitch monotonicity.
            </p>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Call Shield Incident Guide</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Understand how Call Shield triages extortion, kidnapping ransom scams, and digital arrest threats across regional languages.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-amber)" /> Submit SOC Feedback
        </h4>
        {submitted && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} /> Thank you! Your feedback has been recorded for the engineering team.
          </div>
        )}
        <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Feedback Category
            </label>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Model Detection Improvement">Model Detection Improvement</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Report an Issue">Report an Issue</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Your Comments / Feedback
            </label>
            <textarea
              rows={4}
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide technical suggestions, model observations, or platform feedback..."
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '8px',
              alignSelf: 'flex-start',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            Submit Feedback
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        VoiceGuard AI • Smart India Hackathon (SIH) 2026 Cybersecurity Platform
      </div>
    </div>
  );
};
