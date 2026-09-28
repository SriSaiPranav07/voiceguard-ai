import numpy as np

class FeatureExtractor:
    """
    Modular acoustic feature extractor for forensic speech analysis:
    - MFCCs (13 coefficients)
    - Mel spectrogram filterbank energies
    - Spectral centroid
    - Spectral bandwidth
    - Spectral roll-off (85% energy frequency)
    - Zero crossing rate
    - RMS energy
    - Fundamental frequency (F0) pitch contour and jitter variance
    """

    def __init__(self, sample_rate: int = 16000, n_fft: int = 512, hop_length: int = 256, n_mels: int = 40):
        self.sr = sample_rate
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.n_mels = n_mels
        self.mel_filterbank = self._build_mel_filterbank(n_mels, n_fft, sample_rate)

    def extract_features(self, waveform: np.ndarray) -> dict:
        """
        Extracts comprehensive acoustic and spectral feature representations.
        """
        if len(waveform) < self.n_fft:
            waveform = np.pad(waveform, (0, self.n_fft - len(waveform)))

        # STFT computation
        stft_matrix = self._stft(waveform)
        mag_spectrogram = np.abs(stft_matrix)  # Shape: (n_bins, n_frames)
        power_spectrogram = mag_spectrogram ** 2

        # 1. Mel Spectrogram & MFCCs
        mel_spectrogram = np.dot(self.mel_filterbank, power_spectrogram)
        log_mel = np.log(mel_spectrogram + 1e-9)
        mfcc = self._dct(log_mel)[:13, :]  # 13 coefficients

        # 2. Spectral Centroid
        freqs = np.linspace(0, self.sr / 2, mag_spectrogram.shape[0])
        mag_sum = np.sum(mag_spectrogram, axis=0) + 1e-9
        spectral_centroid = np.sum(freqs[:, None] * mag_spectrogram, axis=0) / mag_sum

        # 3. Spectral Bandwidth
        centroid_diff = (freqs[:, None] - spectral_centroid[None, :]) ** 2
        spectral_bandwidth = np.sqrt(np.sum(centroid_diff * mag_spectrogram, axis=0) / mag_sum)

        # 4. Spectral Roll-off (85% cumulative energy)
        cumulative_energy = np.cumsum(mag_spectrogram, axis=0)
        total_energy = cumulative_energy[-1, :] + 1e-9
        rolloff_idx = np.argmax(cumulative_energy >= (0.85 * total_energy), axis=0)
        spectral_rolloff = freqs[rolloff_idx]

        # 5. Zero Crossing Rate
        zcr = np.mean(0.5 * np.abs(np.diff(np.sign(waveform))))

        # 6. RMS Energy
        rms = np.sqrt(np.mean(waveform ** 2))

        # 7. Pitch (F0) Estimation via Normalized Autocorrelation
        f0_estimates = self._estimate_pitch_contour(waveform)
        f0_mean = float(np.mean(f0_estimates)) if len(f0_estimates) > 0 else 0.0
        f0_std = float(np.std(f0_estimates)) if len(f0_estimates) > 0 else 0.0
        # Pitch jitter: frame-to-frame relative frequency variance
        pitch_jitter = (
            float(np.mean(np.abs(np.diff(f0_estimates))) / (f0_mean + 1e-6))
            if len(f0_estimates) > 1 and f0_mean > 0
            else 0.0
        )

        # 8. High-Frequency Energy Ratio (HF above 7.5 kHz vs total)
        hf_bin = int((7500.0 / (self.sr / 2.0)) * mag_spectrogram.shape[0])
        hf_bin = min(hf_bin, mag_spectrogram.shape[0] - 1)
        hf_energy = np.sum(mag_spectrogram[hf_bin:, :])
        total_mag = np.sum(mag_spectrogram) + 1e-9
        hf_ratio = float(hf_energy / total_mag)

        return {
            "mfcc": mfcc,  # (13, n_frames)
            "mfcc_mean": np.mean(mfcc, axis=1),  # (13,)
            "mfcc_std": np.std(mfcc, axis=1),  # (13,)
            "spectral_centroid_mean": float(np.mean(spectral_centroid)),
            "spectral_centroid_std": float(np.std(spectral_centroid)),
            "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
            "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
            "zero_crossing_rate": float(zcr),
            "rms_energy": float(rms),
            "f0_mean": round(f0_mean, 1),
            "f0_std": round(f0_std, 1),
            "pitch_jitter": round(pitch_jitter, 4),
            "high_freq_ratio": round(hf_ratio, 4),
        }

    def _stft(self, y: np.ndarray) -> np.ndarray:
        """Computes Short-Time Fourier Transform with Hanning window."""
        window = np.hanning(self.n_fft)
        n_frames = 1 + (len(y) - self.n_fft) // self.hop_length
        frames = np.lib.stride_tricks.as_strided(
            y,
            shape=(n_frames, self.n_fft),
            strides=(y.strides[0] * self.hop_length, y.strides[0]),
        )
        windowed = frames * window
        spectrum = np.fft.rfft(windowed, n=self.n_fft, axis=-1)
        return spectrum.T  # (n_bins, n_frames)

    def _build_mel_filterbank(self, n_mels: int, n_fft: int, sr: int) -> np.ndarray:
        """Constructs standard triangular Mel filterbank matrix."""
        def hz_to_mel(hz):
            return 2595.0 * np.log10(1.0 + hz / 700.0)

        def mel_to_hz(mel):
            return 700.0 * (10.0 ** (mel / 2595.0) - 1.0)

        low_mel = hz_to_mel(0)
        high_mel = hz_to_mel(sr / 2)
        mel_points = np.linspace(low_mel, high_mel, n_mels + 2)
        hz_points = mel_to_hz(mel_points)

        bin_points = np.floor((n_fft + 1) * hz_points / sr).astype(int)
        n_bins = n_fft // 2 + 1
        filterbank = np.zeros((n_mels, n_bins))

        for i in range(1, n_mels + 1):
            left = bin_points[i - 1]
            center = bin_points[i]
            right = bin_points[i + 1]

            for j in range(left, center):
                if center > left:
                    filterbank[i - 1, j] = (j - left) / (center - left)
            for j in range(center, right):
                if right > center:
                    filterbank[i - 1, j] = (right - j) / (right - center)

        return filterbank

    def _dct(self, x: np.ndarray, type: int = 2) -> np.ndarray:
        """Discrete Cosine Transform (DCT-II) for MFCC derivation."""
        N = x.shape[0]
        n = np.arange(N)
        k = np.arange(N)[:, None]
        transform = np.sqrt(2.0 / N) * np.cos(np.pi * (2 * n + 1) * k / (2.0 * N))
        transform[0, :] /= np.sqrt(2)
        return np.dot(transform, x)

    def _estimate_pitch_contour(self, waveform: np.ndarray) -> np.ndarray:
        """Autocorrelation-based pitch estimator for human vocal ranges (70 Hz – 450 Hz)."""
        frame_len = int(self.sr * 0.04)  # 40ms frame
        hop = int(self.sr * 0.02)  # 20ms hop
        if len(waveform) < frame_len:
            return np.array([])

        min_lag = int(self.sr / 450.0)
        max_lag = int(self.sr / 70.0)

        pitches = []
        for i in range(0, len(waveform) - frame_len, hop):
            frame = waveform[i : i + frame_len]
            # Autocorrelation
            corr = np.correlate(frame, frame, mode="full")
            corr = corr[len(corr) // 2 :]
            
            if len(corr) > max_lag:
                valid_corr = corr[min_lag:max_lag]
                if len(valid_corr) > 0 and np.max(valid_corr) > 0.3 * corr[0]:
                    peak_lag = min_lag + np.argmax(valid_corr)
                    pitch_hz = self.sr / float(peak_lag)
                    pitches.append(pitch_hz)

        return np.array(pitches)
