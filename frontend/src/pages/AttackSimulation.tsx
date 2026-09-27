import React, { useState } from 'react';
import {
  Radio,
  Play,
  RefreshCw,
} from 'lucide-react';

interface AttackScenario {
  id: string;
  name: string;
  attackType: string;
  category: 'genuine' | 'tts' | 'clone' | 'replay' | 'impersonation';
  description: string;
  targetVictim: string;
  audioFilename: string;
  syntheticProbability: number;
  speakerSimilarity: number;
  replayProbability: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence: string[];
  recommendation: string;
}

export const AttackSimulation: React.FC = () => {
  const scenarios: AttackScenario[] = [
    {
      id: 'SCN-01',
      name: 'Baseline Human Speech',
      attackType: 'Genuine Human Speech Verification',
      category: 'genuine',
      description: 'Authentic human voice recording with natural pitch jitter and biological vocal tract harmonics.',
      targetVictim: 'N/A (Legitimate User)',
      audioFilename: 'sample_genuine_human.wav',
      syntheticProbability: 8,
      speakerSimilarity: 0.94,
      replayProbability: 6,
      riskScore: 12,
      riskLevel: 'LOW',
      evidence: [
        'Natural harmonic dispersion across biological vocal spectrum (100 Hz – 8 kHz)',
        'Presence of physiological micro-tremors and natural pitch inflection',
        'Absence of neural vocoder frame stitching boundaries',
      ],
      recommendation: 'Allow communication session to proceed normally.',
    },
    {
      id: 'SCN-02',
      name: 'AI-Generated Voice (TTS)',
      attackType: 'Text-to-Speech Synthesis Attack',
      category: 'tts',
      description: 'Fully synthetic voice rendered via modern neural vocoder (Tacotron2/VITS). Lacks biological vocal chord variance.',
      targetVictim: 'Banking Automated Telephony Gateway',
      audioFilename: 'sample_tts_synthetic.wav',
      syntheticProbability: 93,
      speakerSimilarity: 0.32,
      replayProbability: 11,
      riskScore: 89,
      riskLevel: 'HIGH',
      evidence: [
        'Severe spectral energy roll-off anomaly detected above 7.5 kHz',
        'Robotic pitch monotonicity and synthetic fundamental frequency contour',
        'Phase discontinuity artifacts detected at neural vocoder frame boundaries',
      ],
      recommendation:
        'HIGH-RISK VOICE THREAT: Enforce out-of-band secondary authentication. Block privileged transaction requests.',
    },
    {
      id: 'SCN-03',
      name: 'Few-Shot Voice-Cloning Attack',
      attackType: 'Voice-Cloning Impersonation Attack',
      category: 'clone',
      description: 'Clone created using a 5-second victim sample via diffusion voice conversion. Mimics victim timbre but reveals vocoder artifacts.',
      targetVictim: 'Corporate Finance Department (CEO Impersonation)',
      audioFilename: 'sample_voice_clone_ceo.wav',
      syntheticProbability: 88,
      speakerSimilarity: 0.81,
      replayProbability: 14,
      riskScore: 92,
      riskLevel: 'HIGH',
      evidence: [
        'Voice timbre matches victim profile (81% biometric similarity), but synthetic probability is critical (88%)',
        'High-frequency spectrogram roll-off indicating synthetic speech conversion',
        'Phase misalignment between speaker vocal tract resonances and excitation source',
      ],
      recommendation:
        'CRITICAL IMPERSONATION ALERT: Do NOT authorize financial wire transfers. Verify executive through an authorized secondary channel.',
    },
    {
      id: 'SCN-04',
      name: 'Physical Replay Attack',
      attackType: 'Loudspeaker Playback Replay Attack',
      category: 'replay',
      description: 'Pre-recorded legitimate speech captured previously and replayed through a high-definition smartphone loudspeaker.',
      targetVictim: 'Voice Biometric Authentication Gate',
      audioFilename: 'sample_replay_loudspeaker.wav',
      syntheticProbability: 18,
      speakerSimilarity: 0.91,
      replayProbability: 86,
      riskScore: 78,
      riskLevel: 'HIGH',
      evidence: [
        'Speaker similarity is high (91%), but strong secondary acoustic room reverberation detected',
        'Acoustic impulse response matches physical loudspeaker distortion profile',
        'Lack of live micro-environmental ambiance variance',
      ],
      recommendation:
        'REPLAY ATTACK DETECTED: Voice is recorded, not live. Prompt user for randomized challenge-response phrase.',
    },
    {
      id: 'SCN-05',
      name: 'Cross-Language Impersonation Scenario',
      attackType: 'Regional Voice Extortion (Telugu / Hindi)',
      category: 'impersonation',
      description: 'Synthesized regional language kidnapping threat targeting family relatives with simulated emotional panic.',
      targetVictim: 'Elderly Family Member (Grandparent Scam)',
      audioFilename: 'sample_extortion_telugu.wav',
      syntheticProbability: 91,
      speakerSimilarity: 0.74,
      replayProbability: 15,
      riskScore: 95,
      riskLevel: 'HIGH',
      evidence: [
        'Linguistic extortion threat pattern confirmed in Telugu ("ఆసుపత్రిలో ఉన్నాను...")',
        'Acoustic vocoder anomalies detected in synthetic distress vocalization',
        'Inconsistent formant dynamics during simulated cry/distress speech',
      ],
      recommendation:
        'EXTORTION PROTOCOL ACTIVATED: Alert family emergency contacts immediately. Do not transfer funds. Contact local cyber police helpline (1930).',
    },
  ];

  const [selectedScenario, setSelectedScenario] = useState<AttackScenario>(scenarios[0]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSimulate = (scenario: AttackScenario) => {
    setSelectedScenario(scenario);
    setIsExecuting(true);

    setTimeout(() => {
      setIsExecuting(false);
    }, 700);
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Radio size={22} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                ATTACK SIMULATION & THREAT DEMO MATRIX (SIH 2026)
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
              Demonstrate how VoiceGuard AI detects and prevents 5 distinct voice threat vectors: genuine voice, AI synthesis, voice cloning, replay attack, and regional extortion.
            </p>
          </div>
          <span className="badge-demo">SIH DEMO MODE</span>
        </div>
      </div>

      {/* Attack Scenarios Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {scenarios.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleSimulate(sc)}
              style={{
                textAlign: 'left',
                padding: '18px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {sc.id}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: sc.riskLevel === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: sc.riskLevel === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    }}
                  >
                    {sc.riskLevel} RISK
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{sc.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {sc.attackType}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                <Play size={12} /> Simulate Scenario
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Pipeline Execution View (Rule 17: ATTACK TYPE -> VOICE INPUT -> DETECTION -> RISK -> EVIDENCE -> RECOMMENDED RESPONSE) */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Selected Threat Scenario
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {selectedScenario.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {selectedScenario.description}
            </p>
          </div>

          <button
            onClick={() => handleSimulate(selectedScenario)}
            disabled={isExecuting}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-cyan)',
            }}
          >
            {isExecuting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            {isExecuting ? 'Running Pipeline Simulation...' : 'Re-Run Pipeline'}
          </button>
        </div>

        {/* 6-Stage Security Inspection Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stage 1: Attack Type & Voice Input */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STAGE 1: ATTACK TYPE</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-rose)', marginTop: '6px' }}>
                {selectedScenario.attackType}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Target: {selectedScenario.targetVictim}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STAGE 2: VOICE INPUT SAMPLE</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {selectedScenario.audioFilename}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Preprocessed to 16 kHz Mono WAV • Normalized RMS
              </div>
            </div>
          </div>

          {/* Stage 3: Detection Signals */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '16px' }}>
              STAGE 3: MULTI-LAYER AI DETECTION SIGNALS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Synthetic Speech Probability</div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: selectedScenario.syntheticProbability > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    marginTop: '4px',
                  }}
                >
                  {selectedScenario.syntheticProbability}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speaker Biometric Similarity</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  {Math.round(selectedScenario.speakerSimilarity * 100)}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Replay Attack Probability</div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: selectedScenario.replayProbability > 30 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    marginTop: '4px',
                  }}
                >
                  {selectedScenario.replayProbability}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calibrated Risk Score</div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: selectedScenario.riskScore > 60 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    marginTop: '4px',
                  }}
                >
                  {selectedScenario.riskScore} / 100
                </div>
              </div>
            </div>
          </div>

          {/* Stage 4: Risk Tier & Evidence */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                STAGE 4: FORENSIC EVIDENCE DISCOVERY
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: selectedScenario.riskLevel === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: selectedScenario.riskLevel === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                }}
              >
                TIER: {selectedScenario.riskLevel} RISK
              </span>
            </div>

            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {selectedScenario.evidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>

          {/* Stage 5: Recommended Security Response */}
          <div
            style={{
              background:
                selectedScenario.riskLevel === 'HIGH'
                  ? 'rgba(244, 63, 94, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
              padding: '20px',
              borderRadius: '10px',
              border: `1px solid ${
                selectedScenario.riskLevel === 'HIGH'
                  ? 'rgba(244, 63, 94, 0.3)'
                  : 'rgba(16, 185, 129, 0.3)'
              }`,
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: selectedScenario.riskLevel === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                marginBottom: '6px',
              }}
            >
              STAGE 5: RECOMMENDED SECURITY RESPONSE
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              {selectedScenario.recommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
