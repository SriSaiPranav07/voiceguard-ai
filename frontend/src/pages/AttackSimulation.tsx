import React, { useState } from 'react';
import { AlertCircle, FileAudio, Radio, Upload } from 'lucide-react';
import { analyzeAudioFile, type AudioAnalysisResult } from '../services/api';

const scenarios = [
  { name: 'Bank Security', description: 'Fictional caller claims an account needs an urgent security review.' },
  { name: 'Family Emergency', description: 'Fictional relative requests help; verify through a trusted callback.' },
  { name: 'Customer Support', description: 'Fictional support agent asks the user to take an account action.' },
  { name: 'Manager Impersonation', description: 'Fictional manager makes an unexpected privileged request.' },
  { name: 'Delivery Scam', description: 'Fictional courier asks the user to resolve a delivery issue.' },
  { name: 'Technical Support', description: 'Fictional technician requests access to a device.' },
  { name: 'Telugu Fraud Scenario', description: 'హలో, మీ ఖాతాలో అసాధారణ కార్యకలాపాలు గుర్తించబడ్డాయి. దయచేసి అధికారిక నంబర్‌కు తిరిగి కాల్ చేసి నిర్ధారించండి.' },
];

const providedSamples = [
  { name: 'Provided sample A', url: '/human_voice_sample.wav' },
  { name: 'Provided sample B', url: '/ai_cloned_voice_sample.wav' },
];

export const AttackSimulation: React.FC = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [sampleUrl, setSampleUrl] = useState(providedSamples[0].url);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let audioFile = file;
      if (!audioFile) {
        const response = await fetch(sampleUrl);
        if (!response.ok) throw new Error(`Could not load the provided sample (HTTP ${response.status}).`);
        const blob = await response.blob();
        audioFile = new File([blob], sampleUrl.split('/').pop() || 'provided-sample.wav', { type: blob.type || 'audio/wav' });
      }
      setResult(await analyzeAudioFile(audioFile, 'auto'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Audio analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const activeScenario = scenarios[scenarioIndex];

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={22} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>ATTACK SCENARIO LAB</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>SIMULATION / CYBERSECURITY TEST · Scenarios are fictional. Audio is sent to the same backend analysis endpoint used by Audio Analysis.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '8px' }}>This deployment has no validated anti-spoof, replay, speaker, or contextual scam model. Analysis returns measured acoustic checks; it will not invent classification or risk scores.</p>
      </div>

      <section className="glass-panel" style={{ padding: '24px' }}>
        <label htmlFor="scenario-select" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Fictional scenario</label>
        <select id="scenario-select" value={scenarioIndex} onChange={(event) => setScenarioIndex(Number(event.target.value))} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          {scenarios.map((scenario, index) => <option key={scenario.name} value={index}>{scenario.name}</option>)}
        </select>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>{activeScenario.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label htmlFor="provided-audio" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Provided test audio</label>
            <select id="provided-audio" value={sampleUrl} onChange={(event) => { setSampleUrl(event.target.value); setFile(null); }} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              {providedSamples.map((sample) => <option key={sample.url} value={sample.url}>{sample.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scenario-audio" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Or upload a test recording</label>
            <input id="scenario-audio" type="file" accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg,.webm" onChange={(event) => setFile(event.target.files?.[0] || null)} style={{ width: '100%', color: 'var(--text-secondary)' }} />
          </div>
          <button onClick={analyze} disabled={loading} style={{ padding: '12px 18px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', color: '#fff', border: 0, borderRadius: '8px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Analyzing audio…' : <><Upload size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Analyze with VoiceGuard API</>}
          </button>
        </div>
      </section>

      {error && <div role="alert" className="glass-panel" style={{ padding: '16px', color: 'var(--accent-rose)' }}>{error}</div>}

      {result && (
        <section className="glass-panel" style={{ padding: '24px' }} aria-live="polite">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', color: '#fff' }}><FileAudio size={18} /> Backend analysis result</h2>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '12px' }}>
            <div>Audio: {result.filename} · {result.duration}s · {result.sample_rate} Hz · {result.channels} channel(s)</div>
            <div>Authenticity classification: {result.authenticity.classification}</div>
            <div>Synthetic / human probability: {result.authenticity.synthetic_speech_probability == null ? 'N/A' : `${result.authenticity.synthetic_speech_probability}%`} / {result.authenticity.human_speech_probability == null ? 'N/A' : `${result.authenticity.human_speech_probability}%`}</div>
            <div>Replay probability: {result.replay_detection?.probability == null ? 'N/A' : `${Math.round(result.replay_detection.probability * 100)}%`}</div>
            <div>Risk: {result.risk?.score == null ? 'N/A' : `${result.risk.level} (${result.risk.score}/100)`}</div>
            <div>Model: {result.model_metadata.status} · {result.model_metadata.engine_name}</div>
          </div>
          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: 'var(--text-secondary)' }}>
            <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-amber)' }} />No validated model is loaded. Any listed items below are measured acoustic checks, not evidence that the voice is human or synthetic.
          </div>
          <ul style={{ paddingLeft: '20px', marginTop: '16px', color: 'var(--text-secondary)' }}>
            {(result.evidence || []).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
};
