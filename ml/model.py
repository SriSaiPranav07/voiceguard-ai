import numpy as np
import pickle
import os

class BaselineClassifier:
    """
    Modular baseline binary classifier for voice authenticity detection (0 = Bonafide, 1 = Synthetic / Spoofed).
    Implements vectorized logistic regression with L2 regularization and sigmoid decision boundary.
    """

    def __init__(self, input_dim: int = 32, learning_rate: float = 0.05, reg_lambda: float = 0.01):
        self.input_dim = input_dim
        self.lr = learning_rate
        self.reg_lambda = reg_lambda
        # Xavier initialization
        self.weights = np.random.randn(input_dim) * np.sqrt(2.0 / input_dim)
        self.bias = 0.0
        self.is_fitted = False

    def _sigmoid(self, z: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))

    def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 150, batch_size: int = 32):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0.0

        for epoch in range(epochs):
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            for i in range(0, n_samples, batch_size):
                xb = X_shuffled[i : i + batch_size]
                yb = y_shuffled[i : i + batch_size]
                m = len(xb)

                # Forward pass
                linear = np.dot(xb, self.weights) + self.bias
                preds = self._sigmoid(linear)

                # Gradients with L2 regularization
                dw = (1.0 / m) * np.dot(xb.T, (preds - yb)) + (self.reg_lambda / m) * self.weights
                db = (1.0 / m) * np.sum(preds - yb)

                # Parameter update
                self.weights -= self.lr * dw
                self.bias -= self.lr * db

        self.is_fitted = True

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        linear = np.dot(X, self.weights) + self.bias
        p1 = self._sigmoid(linear)
        p0 = 1.0 - p1
        if p1.ndim == 0:
            return np.array([p0, p1])
        return np.column_stack([p0, p1])

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        probs = self.predict_proba(X)
        if probs.ndim == 1:
            return int(probs[1] >= threshold)
        return (probs[:, 1] >= threshold).astype(int)

    def save(self, filepath: str):
        with open(filepath, "wb") as f:
            pickle.dump({"weights": self.weights, "bias": self.bias, "input_dim": self.input_dim}, f)

    def load(self, filepath: str):
        with open(filepath, "rb") as f:
            data = pickle.load(f)
            self.weights = data["weights"]
            self.bias = data["bias"]
            self.input_dim = data["input_dim"]
            self.is_fitted = True
