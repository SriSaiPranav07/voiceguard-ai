import React from 'react';
import {
  ShieldAlert,
  Activity,
  Mic,
  FileAudio,
  Globe,
  BarChart3,
  Cpu,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import type { User as UserType } from '../services/api';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  user,
  onLogout
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'live-detection', label: 'Live Detection', icon: Mic, badge: 'LIVE' },
    { id: 'call-shield', label: 'Call Shield', icon: ShieldAlert, badge: 'NEW', highlight: true },
    { id: 'audio-analysis', label: 'Audio Analysis', icon: FileAudio },
    { id: 'multilingual', label: 'Multilingual Voice', icon: Globe, badge: 'NEW' },
    { id: 'analytics', label: 'Fraud Analytics & Incidents', icon: BarChart3 },
    { id: 'ai-models', label: 'AI Models', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: 'var(--shadow-cyan)'
        }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
            VOICEGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SOC Threat Platform
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
                padding: '10px 14px',
                marginBottom: '4px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : item.highlight ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : item.highlight ? 'var(--accent-cyan)' : 'inherit'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: item.badge === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: item.badge === 'LIVE' ? 'var(--accent-emerald)' : 'var(--accent-cyan)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(10, 13, 20, 0.6)',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-muted)' }}>
          System Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot"></span> AI Engine Online
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot"></span> API Connected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot"></span> Monitoring Active
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <UserIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
              {user ? user.name : 'SOC Lead'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {user ? user.role : 'Analyst'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '4px' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
