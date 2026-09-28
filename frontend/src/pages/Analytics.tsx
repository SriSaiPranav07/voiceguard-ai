import React, { useState } from 'react';
import {
  BarChart3,
  ShieldAlert,
  KeyRound,
  Link,
  Building,
  PhoneCall,
} from 'lucide-react';

interface FraudIncident {
  id: string;
  vector: string;
  vectorLabel: string;
  icon: any;
  callerId: string;
  language: string;
  vectorDetail: string;
  transcriptSnippet: string;
  targetObject: string;
  recommendation: string;
  status: string;
  timestamp: string;
}

export const Analytics: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const incidents: FraudIncident[] = [
    {
      id: 'SAMPLE-01',
      vector: 'OTP_VERIFICATION',
      vectorLabel: 'OTP Theft Scam',
      icon: KeyRound,
      callerId: '+91 98765 43210',
      language: 'Telugu (తెలుగు)',
      vectorDetail: 'Bank Security Officer Impersonation',
      transcriptSnippet:
        'మీ ఖాతా బ్లాక్ కాకుండా ఉండటానికి మీ ఫోన్‌కి వచ్చిన 6 అంకెల OTP ని వెంటనే చెప్పండి (Read the 6-digit OTP sent to your phone immediately to prevent account blockage).',
      targetObject: '6-digit OTP Code',
      recommendation: 'NEVER share OTP codes over phone calls. Banks never ask for OTP via voice.',
      status: 'CRITICAL_ALERT',
      timestamp: 'Training example',
    },
    {
      id: 'SAMPLE-02',
      vector: 'PHISHING_LINK',
      vectorLabel: 'Malicious Link & PIN Scam',
      icon: Link,
      callerId: '+91 91234 56789',
      language: 'English (EN)',
      vectorDetail: 'IT Support & Security PIN Harvesting',
      transcriptSnippet:
        'Your online banking session has expired. Click the link sent to your SMS (verify-netbank-sec.com) and enter your 4-digit security PIN now.',
      targetObject: 'Malicious SMS Link + Security PIN',
      recommendation: 'Do not click links provided during unexpected phone calls.',
      status: 'CRITICAL_ALERT',
      timestamp: 'Training example',
    },
    {
      id: 'SAMPLE-03',
      vector: 'DIGITAL_ARREST',
      vectorLabel: 'Digital Arrest Extortion',
      icon: ShieldAlert,
      callerId: '+91 99887 76655',
      language: 'Hindi (हिन्दी)',
      vectorDetail: 'CBI / Cyber Police Authority Clone',
      transcriptSnippet:
        'हम सीबीआई मुख्यालय से बोल रहे हैं। आपके आधार नंबर से जुड़ा एक पारస్ल जब्त हुआ है जिसमें संदिग्ध ड्रग्स हैं। तुरंत स्काइप/फोन पर डिजिटल अरेस्ट स्वीकार करें।',
      targetObject: 'Extortion Money via UPI/Wire',
      recommendation: 'Police/CBI never conduct "Digital Arrests" or demand money over calls.',
      status: 'CRITICAL_ALERT',
      timestamp: 'Training example',
    },
    {
      id: 'SAMPLE-04',
      vector: 'WIRE_TRANSFER',
      vectorLabel: 'Executive Voice Clone',
      icon: Building,
      callerId: '+1 (555) 019-8821',
      language: 'English (EN)',
      vectorDetail: 'CEO / CFO Voice Conversion',
      transcriptSnippet:
        'I am currently in an urgent board meeting. Wire $45,000 to the vendor account specified in your inbox right now without waiting.',
      targetObject: 'Corporate Bank Wire Transfer',
      recommendation: 'Enforce dual out-of-band authorization for all corporate fund transfers.',
      status: 'HIGH_RISK',
      timestamp: 'Training example',
    },
    {
      id: 'SAMPLE-05',
      vector: 'OTP_VERIFICATION',
      vectorLabel: 'Loan Pre-Approval PIN Scam',
      icon: KeyRound,
      callerId: '+91 97654 32109',
      language: 'Hindi (हिन्दी)',
      vectorDetail: 'Fake Bank Credit Agent',
      transcriptSnippet:
        'बधाई हो! आपका 5 लाख का लोन अप्रूव हो गया है। प्रोसेसिंग फ़ीस ट्रांसफर करने के लिए अपना यूपीआई पिन और 6 डिजिट ओटीपी कन्फर्म करें।',
      targetObject: 'UPI Security PIN / Processing Fee',
      recommendation: 'Pre-approved loans do not require upfront OTP or UPI PIN entry.',
      status: 'HIGH_RISK',
      timestamp: 'Training example',
    },
    {
      id: 'SAMPLE-06',
      vector: 'DIGITAL_ARREST',
      vectorLabel: 'Emergency Hospital Ransom',
      icon: PhoneCall,
      callerId: '+91 98123 45678',
      language: 'Telugu (తెలుగు)',
      vectorDetail: 'Synthetic Relative Voice Clone',
      transcriptSnippet:
        'అమ్మా... నాకు పెద్ద యాక్సిడెంట్ అయింది... హాస్పిటల్ ఐసియు లో ఉన్నాను... వెంటనే రూ. 2 లక్షలు ఈ గూగుల్ పే నంబర్‌కి పంపించండి (Mom... I had a severe accident... I am in ICU... Send Rs 2 Lakhs immediately to this Google Pay number).',
      targetObject: 'Emergency UPI/GPay Ransom',
      recommendation: 'Verify hospital claims directly by calling the family member or local police station.',
      status: 'CRITICAL_ALERT',
      timestamp: 'Training example',
    },
  ];

  const filteredIncidents =
    selectedFilter === 'ALL'
      ? incidents
      : incidents.filter((inc) => inc.vector === selectedFilter);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 color="var(--accent-cyan)" /> Fraud Awareness Training Scenarios
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Fictional examples for analyst training. These are not live incidents and have not been analyzed by a detector.
            </p>
          </div>
          <span className="badge-demo">SIMULATION ONLY</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '18px', color: 'var(--text-secondary)' }}>
        No incident counts or detector scores are available. The cards below are fictional awareness examples only.
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Fraud Vectors' },
          { id: 'OTP_VERIFICATION', label: 'OTP & PIN Scams' },
          { id: 'PHISHING_LINK', label: 'Phishing Link & SMS' },
          { id: 'DIGITAL_ARREST', label: 'Digital Arrest / Ransom' },
          { id: 'WIRE_TRANSFER', label: 'Executive Wire Transfer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: selectedFilter === tab.id ? 'var(--accent-blue)' : 'var(--bg-secondary)',
              color: selectedFilter === tab.id ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredIncidents.map((inc) => {
          const Icon = inc.icon;
          return (
            <div
              key={inc.id}
              className="glass-panel"
              style={{ padding: '24px', borderLeft: '4px solid var(--accent-rose)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {inc.id}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        background: 'rgba(244, 63, 94, 0.2)',
                        color: 'var(--accent-rose)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Icon size={12} /> {inc.vectorLabel}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      Language: {inc.language}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    {inc.vectorDetail} — Caller ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{inc.callerId}</span>
                  </h4>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    SIMULATION
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {inc.timestamp}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  color: '#fff',
                  fontStyle: 'italic',
                  marginBottom: '12px',
                }}
              >
                "{inc.transcriptSnippet}"
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Extortion / Target Metric: </span>
                  <strong style={{ color: 'var(--accent-amber)' }}>{inc.targetObject}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Security Recommendation: </span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{inc.recommendation}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
