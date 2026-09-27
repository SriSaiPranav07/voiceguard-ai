# VoiceGuard AI — Model Architecture & Registry

This directory documents the model architectures, operational status, weights integration points, and future roadmap for the **VoiceGuard AI** cybersecurity platform.

---

## 1. Active Operational Models

| Pipeline Component | Active Model Architecture | Operational Status | Latency | Primary Feature Input |
|---|---|---|---|---|
| **Voice Authenticity Detection** | `VoiceGuard-SpoofNet-Baseline` | `BASELINE_MODEL` | ~12 ms | 13 MFCCs, Spectral Roll-off, Pitch Jitter, High-Freq Ratio |
| **Speaker Biometrics** | `VoiceGuard-SpeakerBiometrics-Baseline` | `BASELINE_MODEL` | ~10 ms | 32-dim Normalized Acoustic Fingerprint Vector |
| **Replay Attack Detection** | `VoiceGuard-ReplayGuard-Baseline` | `BASELINE_MODEL` | ~9 ms | Spectral Centroid, Crest Factor, Room Impulse Tail |
| **Risk Engine** | `VoiceGuard-RiskFusion-v1` | `PRODUCTION_ENGINE` | ~2 ms | Calibrated Multi-Factor Threat Classifier |

---

## 2. Model Status Transparency Standard

To maintain strict scientific and technical credibility during evaluation:

- **`PRODUCTION_MODEL`**: Fully trained deep neural model validated against standardized public benchmark datasets with measured EER/AUC metrics.
- **`BASELINE_MODEL`**: Mathematically grounded signal processing and heuristic statistical classifier (e.g. vocoder cutoff detection, pitch micro-jitter analysis).
- **`DEMO_MODE`**: Clearly marked scenario simulator for UI and SOC operational workflows.
- **`MODEL_UNAVAILABLE`**: Failsafe state displayed when offline or weights are missing.

---

## 3. Deep Learning Upgrade Roadmap

When integrating pre-trained or fine-tuned deep learning models:

1. **AASIST / RawNet2 (Anti-Spoofing)**:
   - Evaluated on **ASVspoof 2019 / 2021** (Logical Access).
   - Input: Raw waveform (16 kHz, 64,600 samples / 4 seconds).
   - Output: Spoof vs Bonafide log-likelihood ratio (LLR).
   - Place ONNX/TorchScript weights in `backend/models/aasist_spoofnet.onnx`.

2. **ECAPA-TDNN (Speaker Verification)**:
   - Pre-trained on **VoxCeleb 1 & 2** (SpeechBrain / PyAnnote).
   - Input: 80-dimensional Mel-filterbank spectrogram.
   - Output: 192-dimensional speaker biometric embedding.
   - Place weights in `backend/models/ecapa_tdnn_spk.onnx`.

3. **LFCC-LCNN (Replay Detection)**:
   - Evaluated on **ASVspoof 2019 / 2021** (Physical Access).
   - Input: Linear Frequency Cepstral Coefficients (LFCC).
   - Output: Replay vs Bonafide probability.

---

## 4. Privacy & Model Ethics Notice

- VoiceGuard AI operates **Zero Voice Retention** by default.
- No biometric voiceprints or acoustic models are stored persistently on disk.
- Embeddings are computed in volatile RAM and freed immediately after cosine comparison.
