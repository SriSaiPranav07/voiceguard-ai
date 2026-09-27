# VoiceGuard AI — Machine Learning Pipeline & Dataset Documentation

This directory contains the training, evaluation, preprocessing, and model definition pipelines for **VoiceGuard AI**.

---

## 1. Supported Benchmark Datasets

VoiceGuard AI is architected to be evaluated on standardized international speech anti-spoofing and biometric benchmarks:

### A. ASVspoof 2019 (Logical Access — LA)
- **Source**: [https://www.asvspoof.org/](https://www.asvspoof.org/)
- **License**: Open for academic & non-commercial research (ODC-BY).
- **Classes**: Bonafide (genuine human speech) vs. Spoof (19 state-of-the-art TTS and voice conversion algorithms, including Tacotron, WaveNet, neural vocoders).
- **Splits**:
  - **Train**: 2,580 bonafide, 22,800 spoof (total 25,380 samples)
  - **Development**: 2,548 bonafide, 22,296 spoof (total 24,844 samples)
  - **Evaluation**: 7,355 bonafide, 63,882 spoof (total 71,237 samples)
- **Primary Metric**: Minimum Tandem Detection Cost Function (min t-DCF) and Equal Error Rate (EER).

### B. ASVspoof 2019 (Physical Access — PA / Replay Attacks)
- **Source**: ASVspoof Consortium.
- **License**: ODC-BY.
- **Classes**: Bonafide vs. Replay attacks across diverse physical room acoustics, microphone distances, and playback devices.

### C. In-the-Wild Audio Deepfake Dataset
- **Source**: Real-world collected deepfake samples of prominent public figures across diverse channels.
- **Classes**: Human voice vs. AI-cloned speech (ElevenLabs, Tortoise, Bark, VITS).

---

## 2. Audio Preprocessing & Feature Extraction

Before feeding into classifiers or evaluating models:
1. **Sampling Rate**: All audio is uniformly resampled to **16 kHz, 16-bit Mono WAV**.
2. **Dynamic Range Normalization**: Signals are RMS-normalized to avoid gain bias.
3. **Silence Trimming**: Voice Activity Detection (VAD) trims unvoiced lead/tail silence (< -40 dB).
4. **Feature Vectors**:
   - 13 Mel-Frequency Cepstral Coefficients (MFCCs)
   - Spectral Centroid, Bandwidth, and 85% Energy Roll-off
   - Fundamental frequency (F0) contour & Pitch Jitter
   - High-Frequency spectral energy ratio (> 7.5 kHz)

---

## 3. Running Training & Evaluation

### Train Baseline Model:
```bash
# Using external dataset directories:
python ml/train.py --bonafide-dir /path/to/bonafide --spoof-dir /path/to/spoof --epochs 150

# Using local benchmark generator:
python ml/train.py --epochs 100
```

### Run Model Evaluation:
```bash
python ml/evaluate.py --benchmark
```

Expected evaluation output includes:
- **Accuracy (%)**
- **Precision (%)**
- **Recall (%)**
- **F1 Score (%)**
- **Equal Error Rate (EER %)** & decision threshold
- **Confusion Matrix** (TP, FP, TN, FN)
- **Mean Inference Latency** (ms per sample)

---

## 4. Privacy & Compliance

- **No private or copyrighted voice datasets are committed to this Git repository.**
- Training artifacts and weights are saved locally in `backend/models/`.
- Voice recordings processed in production are never logged or stored permanently.
