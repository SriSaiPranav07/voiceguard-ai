import io
import wave
import struct
import numpy as np
import pytest
from backend.services.audio_processor import AudioProcessor, AudioProcessingError
from backend.services.feature_extractor import FeatureExtractor
from backend.services.deepfake_detector import DeepfakeDetector
from backend.services.speaker_verifier import SpeakerVerifier
from backend.services.replay_detector import ReplayDetector

def generate_sine_wave_wav(duration_sec: float = 1.0, freq_hz: float = 440.0, sample_rate: int = 16000) -> bytes:
    """Helper to synthesize in-memory PCM WAV bytes for testing."""
    n_samples = int(duration_sec * sample_rate)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for i in range(n_samples):
            val = int(32767.0 * 0.5 * np.sin(2.0 * np.pi * freq_hz * (i / sample_rate)))
            wf.writeframes(struct.pack("<h", val))
    return buffer.getvalue()

def test_audio_processor_valid_wav():
    processor = AudioProcessor(target_sr=16000)
    wav_bytes = generate_sine_wave_wav(duration_sec=1.5, freq_hz=440.0)
    result = processor.process_audio_bytes(wav_bytes, "test_audio.wav")

    assert result["sample_rate"] == 16000
    assert result["duration"] > 0.5
    assert isinstance(result["waveform"], np.ndarray)
    assert len(result["waveform"]) > 0

def test_audio_processor_empty_file():
    processor = AudioProcessor()
    with pytest.raises(AudioProcessingError) as exc_info:
        processor.process_audio_bytes(b"", "empty.wav")
    assert "empty" in str(exc_info.value).lower()

def test_audio_processor_unsupported_format():
    processor = AudioProcessor()
    with pytest.raises(AudioProcessingError) as exc_info:
        processor.process_audio_bytes(b"dummy_content", "document.pdf")
    assert "unsupported" in str(exc_info.value).lower()

def test_feature_extractor_outputs():
    extractor = FeatureExtractor(sample_rate=16000)
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    waveform = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)

    features = extractor.extract_features(waveform)

    assert "mfcc" in features
    assert features["mfcc"].shape[0] == 13
    assert "spectral_centroid_mean" in features
    assert "spectral_rolloff_mean" in features
    assert "pitch_jitter" in features
    assert "high_freq_ratio" in features
    assert features["spectral_centroid_mean"] > 0

def test_deepfake_detector_feature_analysis():
    detector = DeepfakeDetector()
    features = {
        "high_freq_ratio": 0.001,
        "spectral_rolloff_mean": 1400.0,
        "pitch_jitter": 0.001,
        "f0_std": 2.0,
        "f0_mean": 130.0,
        "spectral_centroid_std": 150.0,
        "mfcc_std": np.ones(13) * 0.5,
    }
    result = detector.analyze(features)

    assert result["classification"] in ["REAL", "SUSPICIOUS", "FAKE"]
    assert result["synthetic_speech_probability"] is not None
    assert result["human_speech_probability"] is not None
    assert result["model_confidence"] is not None
    assert len(result["evidence"]) > 0

def test_speaker_verifier_similarity():
    verifier = SpeakerVerifier(default_threshold=0.75)
    features_a = {
        "mfcc_mean": np.ones(13) * 0.5,
        "mfcc_std": np.ones(13) * 0.2,
        "spectral_centroid_mean": 2000.0,
        "spectral_bandwidth_mean": 1500.0,
        "spectral_rolloff_mean": 3500.0,
        "f0_mean": 140.0,
        "pitch_jitter": 0.02,
        "zero_crossing_rate": 0.05,
    }
    # Identity match: features_a vs features_a
    result_identical = verifier.verify(features_a, features_a)
    assert result_identical["available"] is True
    assert result_identical["match"] is True
    assert result_identical["similarity"] >= 0.99

    # Divergent speaker
    features_b = {
        "mfcc_mean": np.ones(13) * -0.5,
        "mfcc_std": np.ones(13) * 0.8,
        "spectral_centroid_mean": 3800.0,
        "spectral_bandwidth_mean": 2800.0,
        "spectral_rolloff_mean": 7500.0,
        "f0_mean": 290.0,
        "pitch_jitter": 0.08,
        "zero_crossing_rate": 0.20,
    }
    result_divergent = verifier.verify(features_a, features_b)
    assert result_divergent["available"] is True
    assert result_divergent["match"] is False

def test_replay_detector_analysis():
    detector = ReplayDetector(threshold=0.45)
    features = {
        "spectral_centroid_mean": 2100.0,
        "spectral_bandwidth_mean": 1600.0,
        "rms_energy": 0.12,
        "zero_crossing_rate": 0.06,
    }
    waveform = np.sin(np.linspace(0, 10, 16000)).astype(np.float32)
    result = detector.analyze(features, waveform=waveform)

    assert "probability" in result
    assert "is_replay" in result
    assert result["available"] is True
    assert isinstance(result["probability"], float)
    assert isinstance(result["measurements"], dict)
