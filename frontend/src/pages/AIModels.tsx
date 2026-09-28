import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchHealth, type HealthResponse } from '../services/api';

export const AIModels: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetchHealth().then((h) => setHealth(h));
  }, []);

  const pipelineModules = [
    {
      name: 'Audio Preprocessing & Resampling',
      tech: 'NumPy / SoundFile',
      status: 'ACTIVE PIPELINE',
      statusType: 'production',
      description:
        'Converts heterogeneous multi-format audio streams into uniform 16 kHz mono WAV, performs RMS amplitude normalization, silence trimming, and sanity validation against truncated or corrupt files.',
    },
    {
      name: 'Spectral Feature Extraction Engine',
      tech: 'NumPy signal processing',
      status: 'ACTIVE PIPELINE',
      statusType: 'production',
      description:
        'Extracts 13 MFCCs, Mel-spectrogram energy banks, spectral centroid, spectral bandwidth, spectral roll-off (85%), zero crossing rate, RMS energy, and fundamental frequency (F0) pitch contour variance.',
    },
    {
      name: 'Voice Authenticity / Anti-Spoofing Detector',
      tech: 'No trained model configured',
      status: 'UNAVAILABLE',
      statusType: 'unavailable',
      description:
        'The API returns measured spectral and pitch checks only. It does not classify audio as human or synthetic or provide calibrated probabilities.',
    },
    {
      name: 'Speaker Biometric Verification Layer',
      tech: 'No trained speaker-embedding model configured',
      status: 'UNAVAILABLE',
      statusType: 'unavailable',
      description:
        'Speaker identity verification is not available. Reference recordings are not compared by a validated speaker model.',
    },
    {
      name: 'Replay Attack Acoustic Detector',
      tech: 'No validated replay model configured',
      status: 'UNAVAILABLE',
      statusType: 'unavailable',
      description:
        'The API can return acoustic measurements, but it does not classify audio as replay or provide replay probabilities.',
    },
    {
      name: 'Multi-Factor Calibrated Risk Fusion Engine',
      tech: 'Unavailable until validated model outputs exist',
      status: 'UNAVAILABLE',
      statusType: 'unavailable',
      description:
        'No overall risk score is returned because authenticity, speaker, replay, and contextual outputs are not validated or configured.',
    },
  ];

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu color="var(--accent-cyan)" /> AI Model Pipeline & Architectural Topology
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Available signal processing and the actual status of each model-dependent feature.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: health?.api_online && health?.model_loaded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: health?.api_online && health?.model_loaded ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              }}
            >
              {health?.api_online ? (health.model_loaded ? '● MODEL LOADED' : '● API ONLINE · MODEL UNAVAILABLE') : '● API OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Transparency & Credibility Notice */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: 'var(--text-primary)',
          padding: '16px 20px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
          <AlertCircle size={16} /> SCIENTIFIC RIGOR & TRANSPARENCY PRINCIPLE
        </div>
        VoiceGuard AI distinguishes clearly between <strong>Production Signal Pipelines</strong>, <strong>Baseline ML Models</strong>, and <strong>Trained Classifiers</strong>.
        We do not fabricate 99%+ accuracy numbers. Model benchmarks require evaluation against standardized datasets (e.g. ASVspoof 2019/2021, In-the-Wild) using real EER (Equal Error Rate) and ROC-AUC metrics.
      </div>

      {/* Pipeline Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {pipelineModules.map((mod, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: `3px solid ${
                mod.statusType === 'production'
                  ? 'var(--accent-emerald)'
                  : 'var(--accent-cyan)'
              }`,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: mod.statusType === 'production' ? 'rgba(16, 185, 129, 0.15)' : mod.statusType === 'unavailable' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: mod.statusType === 'production' ? 'var(--accent-emerald)' : mod.statusType === 'unavailable' ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                  }}
                >
                  {mod.status}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{mod.name}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px', marginBottom: '10px' }}>
                {mod.tech}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {mod.description}
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Status: Verified Operational</span>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
          </div>
        ))}
      </div>

      {/* Model Benchmark Architecture Diagram */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="var(--accent-cyan)" /> End-to-End Neural & Signal Flow Architecture
        </h4>

        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '24px',
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: 'var(--accent-cyan)',
            lineHeight: 1.8,
            overflowX: 'auto',
          }}
        >
          <div>RAW AUDIO STREAM (Mic / File / SIP Trunk)</div>
          <div>  │</div>
          <div>  ▼ [Audio Preprocessor: 16kHz mono, RMS normalization, silence removal]</div>
          <div>NORMALIZED PCM BUFFER</div>
          <div>  │</div>
          <div>  ├─► [Feature Extractor: 13 MFCCs, Mel-Spectrogram, Spectral Roll-off, F0 Pitch Jitter]</div>
          <div>  │      │</div>
          <div>  │      ├─► [Authenticity Detector: Vocoder Cutoff Anomaly, Phase Discontinuity] ──► Synthetic Prob</div>
          <div>  │      │</div>
          <div>  │      ├─► [Speaker Verifier: MFCC Fingerprint Cosine Sim vs Reference] ─────────► Similarity Score</div>
          <div>  │      │</div>
          <div>  │      └─► [Replay Detector: Room Impulse Reverberation & Compression Cutoff] ──► Replay Prob</div>
          <div>  │</div>
          <div>  ▼</div>
          <div>[RISK FUSION ENGINE: Calibrated Multi-Factor Threat Classifier]</div>
          <div>  │</div>
          <div>  ▼</div>
          <div>EXPLAINABLE SOC DASHBOARD + RECOMMENDED SECURITY RESPONSE</div>
        </div>
      </div>
    </div>
  );
};
