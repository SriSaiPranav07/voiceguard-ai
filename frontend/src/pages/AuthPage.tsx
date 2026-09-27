import React, { useState } from 'react';
import { ShieldAlert, Mail, Phone, Lock, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import type { User } from '../services/api';

interface AuthPageProps {
  onLoginSuccess: (userData: User, authToken: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'gmail' | 'mobile'>('gmail');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobilePin, setMobilePin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      // Primary admin credentials or SIH demo credentials
      if (
        (email.trim().toLowerCase() === 'srisaipranav712007@gmail.com' && password === 'binnu123') ||
        (email.trim().toLowerCase() === 'admin@voiceguard.ai' && password === 'voiceguard2026')
      ) {
        const adminUser: User = {
          id: 'usr_admin_001',
          name: email.includes('srisaipranav') ? 'Sri Sai Pranav (Lead)' : 'SOC Admin',
          email: email.trim().toLowerCase(),
          role: 'SOC Administrator',
        };
        setLoading(false);
        setSuccessMsg('Admin credentials verified. Authenticating secure session...');
        setTimeout(() => onLoginSuccess(adminUser, 'admin_jwt_token_2026'), 400);
      } else {
        setLoading(false);
        setErrorMsg('Invalid Gmail Admin credentials! Demo: admin@voiceguard.ai / voiceguard2026 (or srisaipranav712007@gmail.com / binnu123)');
      }
    }, 500);
  };

  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      const cleanMobile = mobile.replace(/\D/g, '');
      if (
        ((cleanMobile === '8143871714' || cleanMobile === '918143871714') && mobilePin === 'binnu') ||
        (cleanMobile === '9876543210' && mobilePin === '1234')
      ) {
        const mobileUser: User = {
          id: 'usr_admin_002',
          name: `Admin (${cleanMobile.slice(-10)})`,
          email: `${cleanMobile}@voiceguard.soc`,
          role: 'SOC Security Lead',
        };
        setLoading(false);
        setSuccessMsg('Mobile Admin credentials verified. Initializing SOC session...');
        setTimeout(() => onLoginSuccess(mobileUser, 'mobile_jwt_token_2026'), 400);
      } else {
        setLoading(false);
        setErrorMsg('Invalid Mobile Admin credentials! Demo: 9876543210 / 1234 (or 8143871714 / binnu)');
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color-glow)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            VOICEGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            SOC Administrator Portal Access
          </p>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            background: 'var(--bg-tertiary)',
            padding: '4px',
            borderRadius: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('gmail');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: authMode === 'gmail' ? 'var(--accent-blue)' : 'transparent',
              color: authMode === 'gmail' ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Mail size={16} /> Gmail Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('mobile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: authMode === 'mobile' ? 'var(--accent-blue)' : 'transparent',
              color: authMode === 'mobile' ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Phone size={16} /> Mobile Admin
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '20px',
              lineHeight: 1.4,
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {authMode === 'gmail' && (
          <form onSubmit={handleGmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@voiceguard.ai"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-cyan)',
              }}
            >
              {loading ? 'Verifying Credentials...' : 'Authenticate Gmail Admin'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {authMode === 'mobile' && (
          <form onSubmit={handleMobileLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Admin Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mobile Security PIN
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={mobilePin}
                  onChange={(e) => setMobilePin(e.target.value)}
                  placeholder="PIN code"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              {loading ? 'Verifying Mobile Admin...' : 'Authenticate Mobile Admin'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
          }}
        >
          VoiceGuard AI Restricted Access • SOC Administrator Credentials Required
        </div>
      </div>
    </div>
  );
};
