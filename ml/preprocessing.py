import os
import numpy as np
from typing import Tuple, List, Dict
from backend.services.audio_processor import AudioProcessor
from backend.services.feature_extractor import FeatureExtractor

processor = AudioProcessor(target_sr=16000)
extractor = FeatureExtractor(sample_rate=16000)

def extract_features_from_file(filepath: str) -> np.ndarray:
    """
    Loads audio file, preprocesses to 16kHz mono, and extracts a 32-dimensional feature vector:
    - 13 MFCC means
    - 13 MFCC stds
    - Spectral centroid, bandwidth, roll-off, pitch jitter, high-frequency energy ratio, zero-crossing rate.
    """
    with open(filepath, "rb") as f:
        audio_bytes = f.read()

    processed = processor.process_audio_bytes(audio_bytes, os.path.basename(filepath))
    features = extractor.extract_features(processed["waveform"])

    mfcc_m = features["mfcc_mean"]
    mfcc_s = features["mfcc_std"]
    scalars = np.array([
        features["spectral_centroid_mean"] / 4000.0,
        features["spectral_bandwidth_mean"] / 3000.0,
        features["spectral_rolloff_mean"] / 8000.0,
        min(features["f0_mean"] / 300.0, 1.0),
        min(features["pitch_jitter"] * 20.0, 1.0),
        features["high_freq_ratio"] * 10.0,
    ])

    return np.concatenate([mfcc_m, mfcc_s, scalars]).astype(np.float32)

def prepare_dataset_from_directory(
    bonafide_dir: str,
    spoof_dir: str,
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Builds (X, y, filenames) dataset from directories of bonafide (label 0) and spoofed (label 1) audio.
    """
    X_list = []
    y_list = []
    filenames = []

    if os.path.exists(bonafide_dir):
        for fname in os.listdir(bonafide_dir):
            if fname.lower().endswith((".wav", ".mp3", ".flac")):
                path = os.path.join(bonafide_dir, fname)
                try:
                    feat = extract_features_from_file(path)
                    X_list.append(feat)
                    y_list.append(0)
                    filenames.append(path)
                except Exception as e:
                    print(f"Skipping {fname}: {e}")

    if os.path.exists(spoof_dir):
        for fname in os.listdir(spoof_dir):
            if fname.lower().endswith((".wav", ".mp3", ".flac")):
                path = os.path.join(spoof_dir, fname)
                try:
                    feat = extract_features_from_file(path)
                    X_list.append(feat)
                    y_list.append(1)
                    filenames.append(path)
                except Exception as e:
                    print(f"Skipping {fname}: {e}")

    X = np.array(X_list, dtype=np.float32) if X_list else np.empty((0, 32))
    y = np.array(y_list, dtype=np.int32) if y_list else np.empty((0,))

    return X, y, filenames
