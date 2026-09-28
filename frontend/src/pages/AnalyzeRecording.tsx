import React, { useState, useRef } from 'react';
import {
  FileAudio,
  Mic,
  Square,
  AlertCircle,
  Download,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';
import { analyzeAudioFile, type AudioAnalysisResult } from '../services/api';
import { generateAnalysisPDF } from '../utils/pdfGenerator';

export const AnalyzeRecording: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Built-in audio recorder state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    const validExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm', '.aac', '.opus'];
    const hasValidExt = validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && !f.type.startsWith('audio/')) {
      setErrorMsg('Unsupported format. Please provide a WAV, MP3, M4A, FLAC, OGG, or WEBM audio file.');
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25 MB limit.');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const startMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], `mic_recording_${Date.now()}.wav`, { type: 'audio/wav' });
        validateAndSetFile(recordedFile);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordedSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMsg('Microphone access denied or unavailable.');
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await analyzeAudioFile(file, 'auto', referenceFile || undefined);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis pipeline encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeStep = !file ? 1 : loading ? 2 : result ? 5 : 1;

  const steps = [
    { num: 1, label: 'UPLOAD / RECORD' },
    { num: 2, label: 'AUDIO PROCESSING' },
    { num: 3, label: 'VOICE ANALYSIS' },
    { num: 4, label: 'RISK ASSESSMENT' },
    { num: 5, label: 'RESULT' },
  ];

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileAudio size={24} color="var(--accent-cyan)" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ANALYZE RECORDING — Deepfake & Authenticity Analysis
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Upload or record speech audio to evaluate vocoder artifacts, acoustic anomalies, replay signatures, and speaker consistency.
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              ● FORENSIC WORKFLOW
            </span>
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline Flow Indicator */}
      <div className="glass-panel" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '12px' }}>
          {steps.map((step, idx) => {
            const isCompleted = activeStep >= step.num;
            const isCurrent = activeStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-tertiary)',
                      color: isCompleted ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      boxShadow: isCurrent ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                    }}
                  >
                    {step.num}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCompleted ? '#fff' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      background: activeStep > step.num ? 'var(--accent-cyan)' : 'var(--border-color)',
                      minWidth: '20px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      <form onSubmit={handleAnalyze} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Step 1: Provide Audio Input
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Select an audio file or record speech directly with your browser microphone.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isRecording ? (
              <button
                type="button"
                onClick={startMicRecording}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--accent-emerald)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Mic size={16} /> Record Mic
              </button>
            ) : (
              <button
                type="button"
                onClick={stopMicRecording}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Square size={16} /> Stop Recording ({recordedSeconds}s)
              </button>
            )}
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

        {/* Audio Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {/* Primary Voice Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: file ? '2px solid var(--accent-cyan)' : '2px dashed var(--border-color)',
              padding: '28px 20px',
              borderRadius: '10px',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              transition: 'all 0.15s ease',
            }}
          >
            <FileAudio size={36} color="var(--accent-cyan)" />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '10px' }}>
              {file ? file.name : 'Target Voice Audio (Required)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drag & drop WAV, MP3, FLAC, M4A or browse'}
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm,.aac,.opus"
              onChange={(e) => e.target.files && e.target.files[0] && validateAndSetFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="analyze-audio-input"
            />
            <label
              htmlFor="analyze-audio-input"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {file ? 'Change Audio File' : 'Browse Audio File'}
            </label>
          </div>

          {/* Reference Speaker Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleReferenceDrop}
            style={{
              border: referenceFile ? '2px solid var(--accent-violet)' : '2px dashed rgba(139, 92, 246, 0.3)',
              padding: '28px 20px',
              borderRadius: '10px',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Fingerprint size={36} color="var(--accent-violet)" />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '10px' }}>
              {referenceFile ? referenceFile.name : 'Reference Voice (Optional)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {referenceFile ? `${(referenceFile.size / 1024 / 1024).toFixed(2)} MB` : 'Optional genuine enrolled sample for Speaker Verification'}
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm,.aac,.opus"
              onChange={(e) => e.target.files && e.target.files[0] && setReferenceFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="analyze-ref-input"
            />
            <label
              htmlFor="analyze-ref-input"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
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
            background: file ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
            color: file ? '#fff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '1rem',
            borderRadius: '10px',
            boxShadow: file ? 'var(--shadow-cyan)' : 'none',
            cursor: file && !loading ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
        >
          {loading ? 'Executing Voice Threat Analysis Pipeline...' : 'Execute Recording Analysis'}
        </button>
      </form>

      {/* Results Section */}
      {result && (
        <div id="forensic-report-section" className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--accent-emerald)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Analysis Verdict & Forensic Report
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Audio: {result.filename} · Duration: {result.duration}s · Sample Rate: {result.sample_rate} Hz · {result.channels} ch · Processed in {result.processing_time_ms}ms
              </p>
            </div>

            <button
              onClick={() => generateAnalysisPDF(result)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color-glow)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} /> Export PDF Report
            </button>
          </div>

          {/* 4 Big Forensic Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authenticity Verdict</div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: result.authenticity.classification === 'FAKE' ? 'var(--accent-rose)' : result.authenticity.classification === 'SUSPICIOUS' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px',
                }}
              >
                {result.authenticity.classification}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Synthetic Voice Probability</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {result.authenticity.synthetic_speech_probability != null ? `${result.authenticity.synthetic_speech_probability}%` : '—'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Replay Detection Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {result.replay_detection?.probability != null ? `${Math.round(result.replay_detection.probability * 100)}%` : '—'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fused Risk Index</div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: (result.risk?.score ?? 0) > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px',
                }}
              >
                {result.risk?.score != null ? `${result.risk.score}/100` : '—'}
              </div>
            </div>
          </div>

          {/* Evidence and Recommendation */}
          {result.evidence && result.evidence.length > 0 && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Forensic Evidence & Indicators:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.evidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendation && (
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Mitigation Recommendation: </strong>
              {result.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
