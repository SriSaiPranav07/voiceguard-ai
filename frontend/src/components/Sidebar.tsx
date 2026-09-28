import React from 'react';
import {
  Activity,
  ShieldCheck,
  FileAudio,
  BarChart3,
  FlaskConical,
  HelpCircle,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import type { User as UserType } from '../services/api';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: UserType | null;
  apiOnline: boolean;
  modelLoaded: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  user,
  apiOnline,
  modelLoaded,
  onLogout,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'live-protection', label: 'Live Protection', icon: ShieldCheck, badge: 'LIVE' },
    { id: 'analyze-recording', label: 'Analyze Recording', icon: FileAudio },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'demo-lab', label: 'Demo Lab', icon: FlaskConical, badge: 'SIH DEMO', highlight: true },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-cyan)',
          }}
        >
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff', margin: 0 }}>
            VOICEGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Voice Threat Defense
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                marginBottom: '4px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : item.highlight ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : item.highlight ? 'var(--accent-cyan)' : 'inherit'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: item.badge === 'LIVE' ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(10, 13, 20, 0.6)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-muted)' }}>
          System Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${apiOnline ? (modelLoaded ? '' : 'warning') : 'danger'}`} />
            Protection Pipeline {apiOnline ? (modelLoaded ? 'Active (Loaded)' : 'Active (Simulation)') : 'Offline'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${apiOnline ? '' : 'danger'}`} />
            API Gateway {apiOnline ? 'Connected' : 'Offline'}
          </div>
        </div>
      </div>

      {/* User Session Profile */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <UserIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
              {user ? user.name : 'Security Lead'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {user ? user.role : 'Analyst'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
