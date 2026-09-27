import argparse
import time
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Dict, Any, Tuple
from ml.model import BaselineClassifier

def compute_eer(y_true: np.ndarray, y_scores: np.ndarray) -> Tuple[float, float]:
    """
    Computes Equal Error Rate (EER) where False Positive Rate equals False Negative Rate.
    Industry standard biometric and anti-spoofing benchmark metric.
    """
    thresholds = np.sort(np.unique(y_scores))
    if len(thresholds) == 0:
        return 0.0, 0.5

    fpr_list = []
    fnr_list = []

    positives = np.sum(y_true == 1)
    negatives = np.sum(y_true == 0)

    if positives == 0 or negatives == 0:
        return 0.0, 0.5

    for th in thresholds:
        fp = np.sum((y_scores >= th) & (y_true == 0))
        fn = np.sum((y_scores < th) & (y_true == 1))
        fpr = fp / float(negatives)
        fnr = fn / float(positives)
        fpr_list.append(fpr)
        fnr_list.append(fnr)

    fpr_arr = np.array(fpr_list)
    fnr_arr = np.array(fnr_list)

    # Find intersection point
    diff = np.abs(fpr_arr - fnr_arr)
    min_idx = np.argmin(diff)
    eer = (fpr_arr[min_idx] + fnr_arr[min_idx]) / 2.0
    eer_threshold = thresholds[min_idx]

    return float(eer), float(eer_threshold)

def evaluate_predictions(y_true: np.ndarray, y_scores: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Calculates authentic performance metrics:
    Accuracy, Precision, Recall, F1, Confusion Matrix, FPR, FNR, and EER.
    """
    y_pred = (y_scores >= threshold).astype(int)

    tp = int(np.sum((y_pred == 1) & (y_true == 1)))
    fp = int(np.sum((y_pred == 1) & (y_true == 0)))
    tn = int(np.sum((y_pred == 0) & (y_true == 0)))
    fn = int(np.sum((y_pred == 0) & (y_true == 1)))

    total = len(y_true)
    accuracy = (tp + tn) / float(total) if total > 0 else 0.0
    precision = tp / float(tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / float(tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    fpr = fp / float(fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / float(fn + tp) if (fn + tp) > 0 else 0.0

    eer, eer_th = compute_eer(y_true, y_scores)

    return {
        "total_samples": total,
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "false_positive_rate": round(fpr * 100, 2),
        "false_negative_rate": round(fnr * 100, 2),
        "equal_error_rate_eer": round(eer * 100, 2),
        "eer_decision_threshold": round(eer_th, 4),
        "confusion_matrix": {
            "true_positive_spoof": tp,
            "false_positive_spoof": fp,
            "true_negative_bonafide": tn,
            "false_negative_bonafide": fn,
        },
    }

def run_synthetic_benchmark():
    """
    Generates a deterministic synthetic signal evaluation matrix to benchmark
    mathematical metric calculations and inference latency without fabricated external numbers.
    """
    print("=" * 70)
    print(" VOICEGUARD AI — MODEL EVALUATION PIPELINE (SIH 2026)")
    print("=" * 70)

    np.random.seed(42)
    n_samples = 200
    dim = 32

    # Bonafide: class 0 (human-like feature distributions)
    X_bonafide = np.random.normal(loc=0.3, scale=0.5, size=(n_samples // 2, dim))
    # Spoof: class 1 (shifted vocoder artifact distributions)
    X_spoof = np.random.normal(loc=1.2, scale=0.6, size=(n_samples // 2, dim))

    X = np.vstack([X_bonafide, X_spoof]).astype(np.float32)
    y = np.array([0] * (n_samples // 2) + [1] * (n_samples // 2), dtype=np.int32)

    model = BaselineClassifier(input_dim=dim)
    model.fit(X, y, epochs=100)

    start_infer = time.perf_counter()
    probs = model.predict_proba(X)[:, 1]
    infer_time_ms = (time.perf_counter() - start_infer) * 1000.0 / n_samples

    metrics = evaluate_predictions(y, probs)

    print(f"Total Evaluated Samples : {metrics['total_samples']}")
    print(f"Accuracy               : {metrics['accuracy']}%")
    print(f"Precision              : {metrics['precision']}%")
    print(f"Recall                 : {metrics['recall']}%")
    print(f"F1 Score               : {metrics['f1_score']}%")
    print(f"Equal Error Rate (EER) : {metrics['equal_error_rate_eer']}% (threshold: {metrics['eer_decision_threshold']})")
    print(f"False Positive Rate    : {metrics['false_positive_rate']}%")
    print(f"False Negative Rate    : {metrics['false_negative_rate']}%")
    print(f"Mean Inference Latency : {round(infer_time_ms, 2)} ms / sample")
    print("\nConfusion Matrix:")
    print(f"  TP (Spoof Detected) : {metrics['confusion_matrix']['true_positive_spoof']}")
    print(f"  FP (False Alarm)    : {metrics['confusion_matrix']['false_positive_spoof']}")
    print(f"  TN (Bonafide Clear) : {metrics['confusion_matrix']['true_negative_bonafide']}")
    print(f"  FN (Missed Threat)  : {metrics['confusion_matrix']['false_negative_bonafide']}")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VoiceGuard AI Evaluation Framework")
    parser.add_argument("--benchmark", action="store_true", help="Run deterministic signal benchmark")
    args = parser.parse_args()

    run_synthetic_benchmark()
