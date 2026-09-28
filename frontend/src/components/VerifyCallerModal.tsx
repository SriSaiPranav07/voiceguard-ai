import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Users,
  KeyRound,
  X,
  Lock,
} from 'lucide-react';

interface VerifyCallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerContext?: string;
}

export const VerifyCallerModal: React.FC<VerifyCallerModalProps> = ({
  isOpen,
  onClose,
  callerContext,
}) => {
  const [activeMethod, setActiveMethod] = useState<'callback' | 'trusted-contact' | 'passphrase'>('callback');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '620px',
          padding: '28px',
          border: '1px solid var(--accent-cyan)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '6px',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              INDEPENDENT CALLER VERIFICATION
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Never rely on incoming voice audio alone to authenticate identity during high-risk requests.
            </p>
          </div>
        </div>

        {callerContext && (
          <div
            style={{
              margin: '14px 0',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: 'var(--accent-rose)',
              fontSize: '0.82rem',
            }}
          >
            <strong>Trigger Context: </strong> {callerContext}
          </div>
        )}

        {/* Verification Method Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '20px 0 16px' }}>
          <button
            onClick={() => setActiveMethod('callback')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              background: activeMethod === 'callback' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: activeMethod === 'callback' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PhoneCall size={16} />
            <span>Call Known Number</span>
          </button>

          <button
            onClick={() => setActiveMethod('trusted-contact')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              background: activeMethod === 'trusted-contact' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: activeMethod === 'trusted-contact' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={16} />
            <span>Trusted Contact</span>
          </button>

          <button
            onClick={() => setActiveMethod('passphrase')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              background: activeMethod === 'passphrase' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: activeMethod === 'passphrase' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={16} />
            <span>Verification Challenge</span>
          </button>
        </div>

        {/* Method 1: Callback Instructions */}
        {activeMethod === 'callback' && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', margin: 0 }}>
              Method 1: Direct Out-of-Band Callback
            </h3>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Do NOT call back using the caller ID:</strong> Spoofed numbers can route right back to scammers.</li>
              <li><strong>Hang up immediately:</strong> Politely state that security protocol requires an independent callback.</li>
              <li><strong>Dial the saved number:</strong> Use the contact number already saved in your phonebook or corporate directory.</li>
              <li><strong>Verify the claimed scenario:</strong> Ask if they personally initiated the request.</li>
            </ol>
          </div>
        )}

        {/* Method 2: Trusted Contact Channel */}
        {activeMethod === 'trusted-contact' && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)', margin: 0 }}>
              Method 2: Multi-Party Trusted Verification
            </h3>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Contact mutual family / coworkers:</strong> Check if someone else can corroborate the caller's whereabouts.</li>
              <li><strong>Use a secondary messaging app:</strong> Send an out-of-band text message on Signal, WhatsApp, or Slack.</li>
              <li><strong>Request video confirmation:</strong> Ask for a brief video call on a known platform if impersonation is suspected.</li>
            </ol>
          </div>
        )}

        {/* Method 3: Private Challenge Phrase */}
        {activeMethod === 'passphrase' && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)', margin: 0 }}>
              Method 3: Private Verification Challenge (Pre-Agreed Phrase)
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ask a question only the real person would know that cannot be found on public social media:
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>"What was the name of our childhood neighbor's dog?"</li>
              <li>"Where did we go for dinner two weeks ago?"</li>
              <li>A pre-established family / corporate safety word.</li>
            </ul>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <Lock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              VoiceGuard does not store private phrases in memory or transmitted logs.
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Understood — Proceed With Verification
          </button>
        </div>
      </div>
    </div>
  );
};
