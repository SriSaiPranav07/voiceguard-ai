import React, { useState } from 'react';
import {
  FileAudio,
  AlertCircle,
  Download,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { analyzeAudioFile, type AudioAnalysisResult } from '../services/api';
import { generateAnalysisPDF } from '../utils/pdfGenerator';

export const AudioAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('auto');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleReferenceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReferenceFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setErrorMsg('');
    const validExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'];
    const hasValidExt = validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && !f.type.startsWith('audio/')) {
      setErrorMsg('Unsupported format. Please provide a WAV, MP3, M4A, FLAC, OGG, or WEBM audio file.');
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25 MB safety limit.');
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setErrorMsg('');
    setLoading(true);
    setProgressStage('uploading');

    try {
      setTimeout(() => {
        if (loading) setProgressStage('processing');
      }, 300);

      const res = await analyzeAudioFile(file, language, referenceFile || undefined);
      setResult(res);
      setProgressStage('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis pipeline encountered an error. Please try again.');
      setProgressStage('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Upload & Form Section */}
      <form
        onSubmit={handleAnalyze}
        className="glass-panel"
        style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Forensic AI Voice Authenticity Analyzer
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Upload speech audio to evaluate neural vocoder artifacts, acoustic anomalies, replay indicators, and speaker verification.
            </p>
          </div>
          <div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="auto">Auto Detect Language</option>
              <option value="en">English (EN)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Two Upload Boxes: Primary Incoming Voice + Optional Reference Speaker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Incoming Voice Upload */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border-color-glow)',
              padding: '32px 20px',
              borderRadius: '12px',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FileAudio size={40} color="var(--accent-cyan)" />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '12px' }}>
              {file ? file.name : 'Incoming Voice (Required)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drag & drop WAV, MP3, FLAC, M4A or browse'}
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm"
              onChange={(e) => e.target.files && e.target.files[0] && validateAndSetFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="audio-upload-input"
            />
            <label
              htmlFor="audio-upload-input"
              style={{
                display: 'inline-block',
                marginTop: '14px',
                padding: '8px 20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Browse Audio File
            </label>
          </div>

          {/* Reference Speaker Voice (Optional) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleReferenceDrop}
            style={{
              border: '2px dashed rgba(139, 92, 246, 0.3)',
              padding: '32px 20px',
              borderRadius: '12px',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Fingerprint size={40} color="var(--accent-violet)" />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '12px' }}>
              {referenceFile ? referenceFile.name : 'Reference Voice (Optional)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {referenceFile ? `${(referenceFile.size / 1024 / 1024).toFixed(2)} MB` : 'Optional voice sample for Speaker Verification'}
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm"
              onChange={(e) => e.target.files && e.target.files[0] && setReferenceFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="ref-audio-upload-input"
            />
            <label
              htmlFor="ref-audio-upload-input"
              style={{
                display: 'inline-block',
                marginTop: '14px',
                padding: '8px 20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--accent-violet)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {referenceFile ? 'Change Reference Voice' : 'Add Reference Voice'}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: '16px',
            background: file
              ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
              : 'var(--bg-card)',
            color: file ? '#fff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '1rem',
            borderRadius: '10px',
            boxShadow: file ? 'var(--shadow-cyan)' : 'none',
          }}
        >
          {loading
            ? progressStage === 'uploading'
              ? 'Uploading audio to VoiceGuard...'
              : 'Extracting features & executing multi-factor pipeline...'
            : 'Analyze Audio Authenticity'}
        </button>
      </form>

      {/* Analysis Results View */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Main Verdict Card */}
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              borderLeft: `6px solid ${
                result.authenticity.classification === 'FAKE' || result.risk?.level === 'HIGH'
                  ? 'var(--accent-rose)'
                  : result.authenticity.classification === 'SUSPICIOUS' || result.risk?.level === 'MEDIUM'
                  ? 'var(--accent-amber)'
                  : result.authenticity.classification === 'UNAVAILABLE' || result.risk?.level === 'UNAVAILABLE'
                  ? 'var(--text-muted)'
                  : 'var(--accent-emerald)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {result.authenticity.classification === 'FAKE' ? (
                  <ShieldAlert size={36} color="var(--accent-rose)" />
                ) : result.authenticity.classification === 'UNAVAILABLE' ? null : (
                  <ShieldCheck size={36} color="var(--accent-emerald)" />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Acoustic Authenticity Verdict
                  </div>
                  <h2
                    style={{
                      fontSize: '2.2rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color:
                        result.authenticity.classification === 'FAKE'
                          ? 'var(--accent-rose)'
                          : result.authenticity.classification === 'SUSPICIOUS'
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)',
                    }}
                  >
                    {result.authenticity.classification === 'UNAVAILABLE' ? 'CLASSIFICATION UNAVAILABLE' : `${result.authenticity.classification} VOICE DETECTED`}
                  </h2>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '12px', maxWidth: '650px' }}>
                {result.recommendation || result.risk?.recommendation || result.risk_engine?.recommendation}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {result.authenticity.model_confidence == null ? 'N/A' : `${result.authenticity.model_confidence}%`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Confidence</div>
              <button
                onClick={() => generateAnalysisPDF(result)}
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: 'var(--shadow-cyan)',
                }}
              >
                <Download size={16} /> Download Forensic Report (PDF)
              </button>
            </div>
          </div>

          {/* Explainable AI Result Section (Prompt Rule 13) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-cyan)" /> EXPLAINABLE AI ANALYSIS BREAKDOWN
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Voice Authenticity Bar */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>VOICE AUTHENTICITY</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {result.authenticity.human_speech_probability == null ? 'N/A' : `${result.authenticity.human_speech_probability}%`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${result.authenticity.human_speech_probability ?? 0}%`,
                      height: '100%',
                      background: 'var(--text-muted)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Synthetic probability: {result.authenticity.synthetic_speech_probability == null ? 'N/A' : `${result.authenticity.synthetic_speech_probability}%`}
                </div>
              </div>

              {/* Speaker Similarity Bar */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SPEAKER SIMILARITY</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>
                    {result.speaker_verification?.available && result.speaker_verification.similarity != null
                      ? `Unvalidated ${Math.round(result.speaker_verification.similarity * 100)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${result.speaker_verification?.available && result.speaker_verification.similarity != null ? Math.round(result.speaker_verification.similarity * 100) : 0}%`,
                      height: '100%',
                      background: 'var(--accent-cyan)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {result.speaker_verification?.explanation || 'Reference comparison is unavailable without a reference recording.'}
                </div>
              </div>

              {/* Replay Indicators Bar */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>REPLAY INDICATORS</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {result.replay_detection?.probability == null ? 'N/A' : `${Math.round(result.replay_detection.probability * 100)}%`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.round((result.replay_detection?.probability ?? 0) * 100)}%`,
                      height: '100%',
                      background: 'var(--text-muted)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {result.replay_detection?.explanation || 'Acoustic impulse response & transmission path analysis.'}
                </div>
              </div>

              {/* Fused Risk Level */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>FUSED RISK LEVEL</span>
                  <span
                    style={{
                      color:
                        (result.risk?.score ?? 0) > 60
                          ? 'var(--accent-rose)'
                          : (result.risk?.score ?? 0) > 30
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)',
                    }}
                  >
                    {result.risk?.score == null ? 'UNAVAILABLE' : `${result.risk.level} (${result.risk.score}/100)`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${result.risk?.score ?? 0}%`,
                      height: '100%',
                      background:
                        (result.risk?.score || 0) > 60
                          ? 'var(--accent-rose)'
                          : (result.risk?.score || 0) > 30
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Risk scoring is unavailable until validated authenticity and replay models are configured.
                </div>
              </div>
            </div>

            {/* Evidence Bullets */}
            <div style={{ marginTop: '20px', background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                EVIDENCE FINDINGS:
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {(result.evidence || result.risk?.factors || []).map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audio Signal Metadata */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '0.05em' }}>
              AUDIO SIGNAL PARAMETERS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Duration</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {result.duration}s
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sampling Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {result.sample_rate} Hz
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processing Latency</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {result.processing_time_ms || 24} ms
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detected Language</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                  {result.detected_language}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
