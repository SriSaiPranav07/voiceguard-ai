import React, { useState } from 'react';
import {
  Globe,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { analyzeAudioFile, type AudioAnalysisResult } from '../services/api';

export const MultilingualAnalysis: React.FC = () => {
  const [targetLanguage, setTargetLanguage] = useState<string>('auto');
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const pipelineSteps = [
    'Audio Input',
    'Language Detection',
    'Speech Transcription',
    'Voice Authenticity Analysis',
    'Speaker Analysis',
    'Threat Analysis',
  ];

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select an audio file to analyze.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeAudioFile(file, targetLanguage);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={24} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            Multilingual Voice Intelligence Platform
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
          Native speech & acoustic threat processing for <strong style={{ color: '#fff' }}>English, Telugu (తెలుగు), and Hindi (हिन्दी)</strong>.
        </p>
      </div>

      {/* Signal Separation Notice */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: 'var(--accent-cyan)',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <AlertCircle size={18} />
        <span>
          <strong>SIGNAL SEPARATION ARCHITECTURE:</strong> Language detection and deepfake classification operate as
          independent signal layers. Language identity does NOT determine acoustic authenticity.
        </span>
      </div>

      {/* Analysis Form */}
      <form
        onSubmit={handleExecute}
        className="glass-panel"
        style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Select Target Language Mode
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'auto', label: 'Auto Detect' },
              { id: 'en', label: 'English (EN)' },
              { id: 'te', label: 'Telugu (తెలుగు)' },
              { id: 'hi', label: 'Hindi (हिन्दी)' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setTargetLanguage(lang.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: targetLanguage === lang.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                  color: targetLanguage === lang.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Select Audio Recording
          </label>
          <div
            style={{
              border: '1px dashed var(--border-color-glow)',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
            }}
          >
            <FileAudio size={32} color="var(--accent-cyan)" />
            <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '8px' }}>
              {file ? file.name : 'Choose an audio file (WAV, MP3, M4A, FLAC)'}
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="multi-audio-input"
            />
            <label
              htmlFor="multi-audio-input"
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '8px 20px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-cyan)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Browse Audio File
            </label>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Multilingual Processing Pipeline
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step}
                </div>
                {idx < pipelineSteps.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{errorMsg}</div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          style={{
            padding: '14px',
            background: file ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
            color: file ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '8px',
          }}
        >
          {loading ? 'Processing Language & Acoustic Signal...' : 'Execute Multilingual Analysis'}
        </button>
      </form>

      {/* Multilingual Forensic Evaluation Results */}
      {result && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
            MULTILINGUAL FORENSIC EVALUATION
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detected Language</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {result.detected_language} ({result.language_code?.toUpperCase() || 'EN'})
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                Confidence: {result.language_confidence || 95}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Authenticity</div>
              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: result.authenticity.classification === 'FAKE' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {result.authenticity.classification}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Synthetic Prob: {result.authenticity.synthetic_speech_probability}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fused Risk Score</div>
              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: (result.risk?.score || 0) > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {result.risk?.score || 0} / 100
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Level: {result.risk?.level || 'LOW'}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Speech Transcription ({result.detected_language})
            </div>
            <div style={{ fontSize: '0.95rem', color: '#fff', fontStyle: 'italic' }}>
              "{result.transcript || 'Speech processed across regional acoustic model.'}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
