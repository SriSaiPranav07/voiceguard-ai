# VoiceGuard AI — System Architecture

**AI-Powered Real-Time Detection and Prevention of Voice-Cloning Impersonation Attacks**  
*Prepared for Smart India Hackathon (SIH) 2026*

---

## 1. High-Level Architecture Overview

```
USER / CALLER / TELEPHONY SIP
       │
       ▼
[Voice Input Layer] (Microphone / WAV/MP3 Upload / WebRTC Audio Stream)
       │
       ▼
[Audio Preprocessor]
  ├─ 16 kHz Mono Uniform Resampling
  ├─ RMS Amplitude Normalization
  ├─ Voice Activity Detection (VAD) & Silence Trimming
  └─ Format & Safety Validation (25 MB max, 0.3s–300s duration)
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AI ANALYSIS PIPELINE                            │
│                                                                        │
│ 1. Feature Extraction:                                                 │
│    13 MFCCs, Mel-Spectrogram, Spectral Centroid, Bandwidth,           │
│    Spectral Roll-off (85%), F0 Pitch Contour, Jitter, HF Ratio        │
│                                                                        │
│ 2. Voice Authenticity Detection:                                       │
│    Neural vocoder cutoff analysis, phase boundary anomalies            │
│                                                                        │
│ 3. Speaker Biometric Verification:                                     │
│    Multi-frame acoustic fingerprint cosine similarity vs reference    │
│                                                                        │
│ 4. Replay Attack Detection:                                            │
│    Transducer distortion & room impulse reverberation analysis        │
│                                                                        │
│ 5. Multilingual Regional Profiling:                                    │
│    Acoustic evaluation across English, Telugu (తెలుగు), Hindi (हिन्दी)│
└────────────────────────────────────────────────────────────────────────┘
       │
       ▼
[Calibrated Multi-Factor Risk Engine]
  ├─ Weighted Threat Fusion (Authenticity + Biometrics + Replay)
  ├─ Threat Multiplier (Extortion / Digital Arrest / Banking Phishing)
  └─ Score: 0 – 100 | Tier: LOW / MEDIUM / HIGH
       │
       ▼
[Explainable Security Response Layer]
  ├─ Transparent Forensic Evidence Discovery
  ├─ Actionable Security Guidance (Out-of-band verification, block wire transfer)
  └─ Real-Time WebSocket Telemetry
       │
       ▼
[VoiceGuard SOC Dashboard & Evidence Center]
  ├─ Live Waveform & Spectral Spectrum Canvas
  ├─ Incident Feed & Threat Categorization
  └─ Encrypted PDF Forensic Audit Report Export
```

---

## 2. Component Specifications

### A. Frontend Layer (React 19 + TypeScript + Vite)
- **Framework**: React 19, TypeScript 5.8, Vite 8 (Rolldown).
- **Styling**: Vanilla CSS custom property design system (`index.css`) with high-contrast slate glassmorphism, accent cyan (`#38bdf8`), emerald (`#10b981`), amber (`#f59e0b`), and rose (`#f43f5e`).
- **Icons & Reports**: Lucide React 1.47, jsPDF for SOC forensic audit reports.
- **Microphone Streaming**: AudioContext Web Audio API analyzer with WebSocket streaming (`/ws/live-detection`) and fallback to 2.5s chunk-based HTTP inference.
- **State & Service Layer**: Centralized API abstraction in `frontend/src/services/api.ts` configured via `VITE_API_URL`.

### B. Backend REST & WebSocket Layer (FastAPI + Python 3.14)
- **Framework**: FastAPI with asynchronous route handlers and Starlette WebSocket support.
- **CORS**: Configurable cross-origin policies supporting local Vite dev, preview environments, and Vercel production hosting.
- **Exception Boundary**: Safe error interception returning clear JSON messages (`AudioProcessingError` -> 400) without leaking stack traces or credentials.
- **Logging**: Non-reversible mathematical telemetry logging (zero voice recording retention).

### C. Scientific Signal Processing & ML Modules
- **Audio Processing**: `backend/services/audio_processor.py` (SoundFile, NumPy, SciPy).
- **Feature Extraction**: `backend/services/feature_extractor.py` (FFT, Mel-Filterbanks, DCT, Autocorrelation F0).
- **Deepfake Classifier**: `backend/services/deepfake_detector.py` (Vocoder spectral roll-off, pitch jitter, phase continuity).
- **Speaker Verifier**: `backend/services/speaker_verifier.py` (Cosine similarity on 32-dim acoustic embeddings).
- **Replay Detector**: `backend/services/replay_detector.py` (Room impulse and loudspeaker transducer compression).
- **Risk Fusion Engine**: `backend/services/risk_engine.py` (Calibrated risk scoring and security responses).
