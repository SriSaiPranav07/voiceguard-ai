# VoiceGuard AI — Audio Threat Samples (SIH 2026 Demo Kit)

This directory contains standardized audio recordings designed for live 3-minute demonstrations and testing of the **VoiceGuard AI** forensic analysis pipeline.

---

## Sample Registry

| Filename | Threat Category | Expected Detection | Key Acoustic Indicators |
|---|---|---|---|
| `sample_genuine_human.wav` | Genuine Human Voice | **REAL (Low Risk)** | Natural biological micro-tremors, continuous harmonic spectrum up to 8 kHz, normal pitch jitter. |
| `sample_tts_synthetic.wav` | Neural TTS Synthesis | **FAKE (High Risk)** | Severe spectral energy roll-off above 7.5 kHz, flat pitch monotonicity, phase discontinuity at vocoder frame boundaries. |
| `sample_voice_clone.wav` | Few-Shot Voice Clone | **FAKE (High Risk)** | Biometric timbre matches target speaker, but artificial vocoder harmonics and phase misalignment are flagged. |
| `sample_replay_attack.wav` | Loudspeaker Replay | **REPLAY (High Risk)** | Elevated 2.5 kHz transducer resonance, secondary room impulse response, acoustic compression. |
| `sample_extortion_threat.wav` | Extortion Threat Call | **CRITICAL (High Risk)** | Synthesized vocal distress, linguistic threat cues, elevated fused risk score (> 85). |

---

## How to Test During Demo

1. Open **VoiceGuard AI SOC Dashboard**.
2. Navigate to **Audio Analysis** or **Attack Simulation**.
3. Drag & drop `sample_genuine_human.wav` → observe **GENUINE / LOW RISK (Score: ~12%)**.
4. Drag & drop `sample_tts_synthetic.wav` → observe immediate transition to **SYNTHETIC / HIGH RISK (Score: ~89%)**.
5. Upload `sample_genuine_human.wav` as Reference Voice, and `sample_voice_clone.wav` as Incoming Voice → observe **Speaker Verification Similarity vs Authenticity Conflict**.
6. Download the generated **Forensic Audit PDF Report**.
