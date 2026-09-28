import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Cpu,
  Mic,
  Sliders,
  Layers,
  Radio,
  Activity,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  FileCode2,
  Sparkles,
} from 'lucide-react';
import { fetchHealth, type HealthResponse } from '../services/api';

export const HowItWorks: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'telephony'>('overview');

  useEffect(() => {
    fetchHealth().then((h) => setHealth(h));
  }, []);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Audio Capture',
      icon: Mic,
      summary: 'Ingest raw voice audio from browser microphone stream, uploaded recordings, or telephony hooks.',
      details: 'Accepts PCM streams, WAV, MP3, FLAC, M4A, and WEBM formats with arbitrary sampling rates and channel counts.',
    },
    {
      step: '02',
      title: 'Preprocessing & Normalization',
      icon: Sliders,
      summary: 'Convert audio into a standardized, clean acoustic representation for spectral analysis.',
      details: 'Resamples to uniform 16 kHz mono WAV, applies RMS amplitude normalization, trims leading/trailing silence, and validates against corrupt frames.',
    },
    {
      step: '03',
      title: 'Acoustic Feature Extraction',
      icon: Layers,
      summary: 'Extract mathematical acoustic markers from time and frequency domains.',
      details: 'Computes 13 Mel-Frequency Cepstral Coefficients (MFCCs), spectral centroid, spectral bandwidth, roll-off (85%), zero crossing rate, and fundamental frequency (F0) pitch contours.',
    },
    {
      step: '04',
      title: 'Synthetic & Replay Anomaly Analysis',
      icon: Radio,
      summary: 'Inspect extracted features for unnatural vocoder fingerprints and acoustic playback signatures.',
      details: 'Examines high-frequency spectral discontinuity, pitch variance monotonicity, phase artifacts, and room reverberation indicators characteristic of replay attacks.',
    },
    {
      step: '05',
      title: 'Risk Fusion & Assessment',
      icon: Activity,
      summary: 'Aggregate multi-factor acoustic indicators into an intuitive 0–100 threat score.',
      details: 'Combines authenticity likelihood, replay indicators, and spectral anomaly counts into a normalized risk score categorized into Low, Medium, or High Risk.',
    },
    {
      step: '06',
      title: 'Security Recommendation',
      icon: ShieldCheck,
      summary: 'Provide actionable guidance to the user in real time.',
      details: 'Generates clear forensic verdicts, highlighted warning indicators, and protective recommendations (e.g., secondary out-of-band verification).',
    },
  ];

  const technicalModules = [
    {
      name: 'Audio Preprocessing & Resampling',
      tech: 'NumPy / SoundFile',
      status: 'Active Pipeline',
      statusType: 'active',
      description: 'Converts heterogeneous multi-format audio into uniform 16 kHz mono WAV with RMS normalization and silence removal.',
    },
    {
      name: 'Spectral Feature Extraction Engine',
      tech: 'NumPy signal processing',
      status: 'Active Pipeline',
      statusType: 'active',
      description: 'Extracts 13 MFCCs, Mel-spectrogram energy bins, spectral centroid, spectral bandwidth, roll-off, and F0 pitch variance.',
    },
    {
      name: 'Voice Authenticity Detector',
      tech: 'Prototype Heuristic Detector',
      status: 'Prototype / Heuristic',
      statusType: 'prototype',
      description: 'Calculates synthetic vs genuine voice indicators based on acoustic artifact thresholds and spectral energy distributions.',
    },
    {
      name: 'Replay Attack Acoustic Detector',
      tech: 'Acoustic Anomaly Analyzer',
      status: 'Prototype / Heuristic',
      statusType: 'prototype',
      description: 'Evaluates high-frequency roll-off degradation and background reverberation signatures characteristic of recorded playback.',
    },
    {
      name: 'Speaker Biometric Comparison',
      tech: 'Cosine Distance on Spectral Features',
      status: 'Prototype / Demo',
      statusType: 'prototype',
      description: 'Compares reference voice samples against test audio using normalized acoustic embeddings.',
    },
    {
      name: 'Risk Fusion Engine',
      tech: 'Multi-Factor Heuristic Fusion',
      status: 'Active Pipeline',
      statusType: 'active',
      description: 'Aggregates acoustic anomalies, replay scores, and synthetic indicators into a weighted threat index (0–100).',
    },
  ];

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={24} color="var(--accent-cyan)" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                HOW VOICEGUARD AI WORKS
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Understanding the Voice Threat Analysis Pipeline, acoustic signal processing, and defense architecture.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                background: health?.api_online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: health?.api_online ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                border: `1px solid ${health?.api_online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              }}
            >
              {health?.api_online ? '● PIPELINE API ONLINE' : '● DEMO MODE ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeTab === 'overview' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
            color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'overview' ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Pipeline Overview
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeTab === 'technical' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
            color: activeTab === 'technical' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'technical' ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Technical Architecture (For Judges/Devs)
        </button>
        <button
          onClick={() => setActiveTab('telephony')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: activeTab === 'telephony' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
            color: activeTab === 'telephony' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'telephony' ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Telephony & WebRTC Integration
        </button>
      </div>

      {/* Tab Content: Pipeline Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-cyan)" /> 6-Step Voice Threat Analysis Lifecycle
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              VoiceGuard AI inspects acoustic signals in real time to differentiate between authentic human biological speech and synthetically generated, cloned, or replayed audio.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {step.step}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {step.summary}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {step.details}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Technical Modules */}
      {activeTab === 'technical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Transparency Disclaimer */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            <AlertTriangle size={20} color="var(--accent-amber)" />
            <span>
              <strong style={{ color: '#fff' }}>Evaluation Notice:</strong> VoiceGuard AI currently operates on signal-processing heuristics and acoustic spectral measurements. Modules are labeled transparently below.
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="var(--accent-cyan)" /> Module Architecture & Implementation Status
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {technicalModules.map((mod, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileCode2 size={18} color="var(--accent-cyan)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{mod.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: mod.statusType === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: mod.statusType === 'active' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                          border: `1px solid ${mod.statusType === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {mod.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {mod.tech}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {mod.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Telephony & WebRTC Architecture */}
      {activeTab === 'telephony' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PhoneCall size={22} color="var(--accent-blue)" /> Telephony & Carrier-Level Architecture (Future Integration)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Standard web browsers operate inside a sandboxed security environment and cannot directly intercept or monitor cellular (GSM/VoLTE), WhatsApp, or PSTN phone calls without an authorized carrier or telephony gateway hook.
            </p>

            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                  1. WebRTC & Browser Audio (Current)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Monitors active audio input authorized via Web Audio API. Supports uploaded call recordings and live microphone tests.
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '8px' }}>
                  2. SIP / PBX Trunk Mirroring (Production Concept)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Enterprise PBX integration hooks (Asterisk, FreeSWITCH, Twilio) that fork active RTP audio streams to VoiceGuard analysis worker nodes.
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px' }}>
                  3. Mobile OS Accessibility / Call Screening
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Dedicated Android/iOS native applications utilizing official CallScreeningService APIs to inspect incoming caller streams prior to connecting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
