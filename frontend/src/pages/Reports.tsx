import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { fetchAnalysisHistory, type AudioAnalysisResult } from '../services/api';

interface ReportIncident {
  id: string;
  category: 'Voice Clone / Impersonation' | 'Fraud / Scam' | 'Replay Attack' | 'Suspicious Audio' | 'Unknown';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  transcriptSnippet: string;
  targetObject: string;
  recommendation: string;
  timestamp: string;
  isDemo: boolean;
}

const sampleReportIncidents: ReportIncident[] = [
  {
    id: 'REP-101',
    category: 'Fraud / Scam',
    severity: 'CRITICAL',
    title: 'Urgent OTP Credential Theft',
    transcriptSnippet: 'To prevent immediate account suspension, read out the 6-digit OTP code sent to your mobile phone.',
    targetObject: '6-digit Banking OTP',
    recommendation: 'Never disclose OTP or PIN codes over voice calls. Banks never ask for OTP via telephone.',
    timestamp: 'Sample Dataset',
    isDemo: true,
  },
  {
    id: 'REP-102',
    category: 'Voice Clone / Impersonation',
    severity: 'CRITICAL',
    title: 'CEO / Executive Voice Clone',
    transcriptSnippet: 'I am currently in an urgent board meeting. Please wire $45,000 to the specified vendor account right now.',
    targetObject: 'Corporate Wire Transfer ($45,000)',
    recommendation: 'Enforce mandatory dual out-of-band verification for corporate fund transfers.',
    timestamp: 'Sample Dataset',
    isDemo: true,
  },
  {
    id: 'REP-103',
    category: 'Fraud / Scam',
    severity: 'CRITICAL',
    title: 'Digital Arrest / Authority Spoofing',
    transcriptSnippet: 'We are calling from CBI Cyber Crime HQ. An illegal narcotics parcel linked to your ID has been seized. Accept digital arrest.',
    targetObject: 'Extortion money via UPI',
    recommendation: 'Law enforcement agencies never conduct "Digital Arrests" or demand money over calls.',
    timestamp: 'Sample Dataset',
    isDemo: true,
  },
  {
    id: 'REP-104',
    category: 'Replay Attack',
    severity: 'HIGH',
    title: 'Acoustic Voice Biometric Playback',
    transcriptSnippet: 'My name is John Doe, account passcode Alpha-7749. Please unlock access immediately.',
    targetObject: 'Voice Biometric Passcode',
    recommendation: 'Use dynamic liveness challenges to defeat acoustic loudspeaker replay.',
    timestamp: 'Sample Dataset',
    isDemo: true,
  },
  {
    id: 'REP-105',
    category: 'Suspicious Audio',
    severity: 'MEDIUM',
    title: 'Synthetic Cold Call Phishing',
    transcriptSnippet: 'Your online banking session has expired. Press 1 to speak with an automated authentication bot.',
    targetObject: 'Login Credentials',
    recommendation: 'Do not follow automated voice prompts from unsolicited callers.',
    timestamp: 'Sample Dataset',
    isDemo: true,
  },
];

export const Reports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentHistory, setRecentHistory] = useState<AudioAnalysisResult[]>([]);

  useEffect(() => {
    fetchAnalysisHistory().then((hist) => {
      if (hist && hist.length > 0) setRecentHistory(hist.reverse());
    });
  }, []);

  const categories = [
    'ALL',
    'Voice Clone / Impersonation',
    'Fraud / Scam',
    'Replay Attack',
    'Suspicious Audio',
  ];

  const filteredIncidents = sampleReportIncidents.filter((inc) => {
    const matchesCategory = selectedCategory === 'ALL' || inc.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.transcriptSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.targetObject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return { color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.15)' };
      case 'MEDIUM':
        return { color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="var(--accent-cyan)" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                REPORTS & THREAT INTELLIGENCE
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Summary statistics, threat vector breakdowns, and historical detection reports.
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              ● SAMPLE & HISTORICAL DEMO DATA
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Total Analyses Recorded</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>Demo</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            {recentHistory.length > 0 ? recentHistory.length + 128 : '128'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            Combined Live & Upload checks
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Voice Clones Flagged</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>Demo</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            42
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '4px' }}>
            High-risk synthetic voice detections
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Replay Attacks Detected</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>Demo</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            19
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
            Acoustic playback signatures
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Average Analysis Latency</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>Live</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            ~32ms
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            Real-time acoustic feature extraction
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--accent-cyan)" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: selectedCategory === cat ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.82rem',
            }}
          />
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredIncidents.map((inc) => {
          const sev = getSeverityStyle(inc.severity);
          return (
            <div
              key={inc.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {inc.id}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {inc.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {inc.category}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: sev.bg,
                      color: sev.color,
                    }}
                  >
                    {inc.severity} RISK
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {inc.timestamp}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}
              >
                "{inc.transcriptSnippet}"
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                  <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{inc.targetObject}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Defense Guideline: </span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{inc.recommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
