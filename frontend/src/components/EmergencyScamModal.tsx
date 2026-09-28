import React from 'react';
import {
  AlertOctagon,
  X,
  PhoneCall,
  Landmark,
  FileCheck2,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface EmergencyScamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyScamModal: React.FC<EmergencyScamModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 13, 20, 0.88)',
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
          maxWidth: '680px',
          padding: '28px',
          border: '1px solid var(--accent-rose)',
          boxShadow: '0 0 35px rgba(244, 63, 94, 0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <AlertOctagon size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              POST-INCIDENT FRAUD TRIAGE PLAYBOOK
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', margin: '2px 0 0', fontWeight: 600 }}>
              "I Already Sent Money" or "I Suspect I Was Scammed"
            </p>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--text-secondary)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            marginBottom: '18px',
          }}
        >
          <strong style={{ color: '#fff' }}>URGENT NOTICE:</strong> VoiceGuard AI is an advisory forensic tool and cannot automatically reverse bank transactions. Fast direct action with your financial institution and cybercrime authorities is required.
        </div>

        {/* 5-Step Action Playbook */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Step 1 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--accent-rose)', fontWeight: 800, fontSize: '1.1rem' }}>1</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Stop Communication Immediately
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Hang up immediately. Do not disclose additional details, secondary OTPs, or agree to install remote desktop apps (AnyDesk, TeamViewer, RustDesk).
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '1.1rem' }}>2</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Landmark size={16} color="var(--accent-cyan)" /> Contact Bank / Payment Provider Fraud Desk
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Call your bank's 24x7 emergency fraud helpline. Request an immediate lien / stop-payment on the transaction and freeze compromised debit/credit cards or UPI handles.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '1.1rem' }}>3</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={16} color="var(--accent-amber)" /> Call National Cybercrime Helpline: 1930
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                In India, dial <strong>1930</strong> (Citizen Financial Cyber Fraud Reporting) within the "Golden Hour" to freeze scammer bank accounts, and register an official complaint at{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                >
                  cybercrime.gov.in <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '1.1rem' }}>4</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck2 size={16} color="var(--accent-emerald)" /> Preserve Forensic Evidence
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Save call timestamps, incoming caller numbers, audio recordings, SMS texts, payment UTR / reference numbers, and UPI handles without deleting chat history.
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--accent-violet)', fontWeight: 800, fontSize: '1.1rem' }}>5</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} color="var(--accent-violet)" /> Reset Credentials & Enable 2FA
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Change net banking passwords, UPI PINs, and email credentials from a secure secondary device. Enable hardware/authenticator app 2FA.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Close Playbook
          </button>
        </div>
      </div>
    </div>
  );
};
