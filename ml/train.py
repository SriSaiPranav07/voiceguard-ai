import argparse
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.model import BaselineClassifier
from ml.preprocessing import prepare_dataset_from_directory

def train_model(bonafide_dir: str = None, spoof_dir: str = None, output_path: str = "backend/models/weights.pkl", epochs: int = 150):
    print("=" * 65)
    print(" VOICEGUARD AI — MODEL TRAINING PIPELINE")
    print("=" * 65)

    if bonafide_dir and spoof_dir and os.path.exists(bonafide_dir) and os.path.exists(spoof_dir):
        print(f"Loading bonafide data from: {bonafide_dir}")
        print(f"Loading spoofed data from:  {spoof_dir}")
        X, y, files = prepare_dataset_from_directory(bonafide_dir, spoof_dir)
        print(f"Extracted {len(X)} audio samples ({np.sum(y == 0)} bonafide, {np.sum(y == 1)} spoofed).")
    else:
        print("Notice: No external dataset directory specified. Generating synthetic signal vectors for training baseline weights.")
        np.random.seed(42)
        n = 300
        dim = 32
        X_bonafide = np.random.normal(loc=0.2, scale=0.4, size=(n // 2, dim))
        X_spoof = np.random.normal(loc=1.1, scale=0.5, size=(n // 2, dim))
        X = np.vstack([X_bonafide, X_spoof]).astype(np.float32)
        y = np.array([0] * (n // 2) + [1] * (n // 2), dtype=np.int32)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model = BaselineClassifier(input_dim=X.shape[1])
    print(f"Training BaselineClassifier for {epochs} epochs...")
    model.fit(X, y, epochs=epochs)
    model.save(output_path)
    print(f"Model successfully trained and saved to: {output_path}")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VoiceGuard AI Training Pipeline")
    parser.add_argument("--bonafide-dir", type=str, default=None, help="Directory containing genuine WAV files")
    parser.add_argument("--spoof-dir", type=str, default=None, help="Directory containing synthetic WAV files")
    parser.add_argument("--output", type=str, default="backend/models/weights.pkl", help="Output path for weights")
    parser.add_argument("--epochs", type=int, default=150, help="Training epochs")
    args = parser.parse_args()

    train_model(args.bonafide_dir, args.spoof_dir, args.output, args.epochs)
