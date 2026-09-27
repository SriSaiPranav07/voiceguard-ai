import io
import os
import tempfile
import wave
import numpy as np
import soundfile as sf
from scipy import signal
from backend.utils.security import is_allowed_audio_file, MAX_FILE_SIZE_BYTES, safe_cleanup_file
from backend.utils.logger import get_logger

logger = get_logger("audio_processor")

TARGET_SAMPLE_RATE = 16000  # Standard 16 kHz for speech processing
MIN_AUDIO_DURATION_SEC = 0.3
MAX_AUDIO_DURATION_SEC = 300.0  # 5 minutes

class AudioProcessingError(Exception):
    """Custom exception raised during audio validation or processing."""
    pass

class AudioProcessor:
    """
    Robust audio preprocessing pipeline:
    - Format validation & size limit enforcement
    - Resampling to 16 kHz
    - Mono conversion
    - Amplitude normalization (RMS)
    - Silence detection & trimming
    """

    def __init__(self, target_sr: int = TARGET_SAMPLE_RATE):
        self.target_sr = target_sr

    def process_audio_bytes(self, audio_bytes: bytes, filename: str) -> dict:
        """
        Processes raw audio bytes into normalized 16kHz mono float32 array.
        Returns metadata and clean numpy waveform.
        """
        if not audio_bytes or len(audio_bytes) == 0:
            raise AudioProcessingError("Uploaded audio file is empty (0 bytes).")

        if len(audio_bytes) > MAX_FILE_SIZE_BYTES:
            raise AudioProcessingError(f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.")

        if not is_allowed_audio_file(filename):
            raise AudioProcessingError(f"Unsupported file format '{filename}'. Supported formats: WAV, MP3, FLAC, M4A, OGG, WEBM.")

        # Write to temporary file for robust multi-format decoding
        temp_input = None
        try:
            _, ext = os.path.splitext(filename.lower())
            if not ext:
                ext = ".wav"

            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tf:
                tf.write(audio_bytes)
                temp_input = tf.name

            # Read with soundfile
            try:
                data, sr = sf.read(temp_input, dtype="float32")
            except Exception as e:
                # If soundfile fails, attempt raw wave fallback if WAV format
                try:
                    with wave.open(temp_input, "rb") as wf:
                        n_channels = wf.getnchannels()
                        sampwidth = wf.getsampwidth()
                        sr = wf.getframerate()
                        n_frames = wf.getnframes()
                        frames = wf.readframes(n_frames)
                        
                        if sampwidth == 2:
                            dtype = np.int16
                        elif sampwidth == 4:
                            dtype = np.int32
                        else:
                            dtype = np.uint8

                        raw_arr = np.frombuffer(frames, dtype=dtype)
                        if n_channels > 1:
                            raw_arr = raw_arr.reshape(-1, n_channels)
                        data = (raw_arr / np.iinfo(dtype).max).astype(np.float32)
                except Exception:
                    raise AudioProcessingError(f"Could not decode audio file '{filename}'. File may be corrupted or in an unsupported codec.")

            if data is None or len(data) == 0:
                raise AudioProcessingError("Audio signal is empty after decoding.")

            # Convert stereo/multichannel to mono by averaging channels
            if data.ndim > 1:
                channels = data.shape[1]
                data = np.mean(data, axis=1)
            else:
                channels = 1

            original_duration = len(data) / float(sr)

            if original_duration < MIN_AUDIO_DURATION_SEC:
                raise AudioProcessingError(f"Audio duration ({original_duration:.2f}s) is too short. Minimum duration is {MIN_AUDIO_DURATION_SEC}s.")

            if original_duration > MAX_AUDIO_DURATION_SEC:
                raise AudioProcessingError(f"Audio duration ({original_duration:.1f}s) exceeds maximum allowed duration of {MAX_AUDIO_DURATION_SEC}s.")

            # Resample to 16 kHz if necessary
            if sr != self.target_sr:
                target_length = int(len(data) * (self.target_sr / sr))
                data = signal.resample(data, target_length)
                current_sr = self.target_sr
            else:
                current_sr = sr

            # Silence trimming and speech activity estimation
            data_trimmed, speech_ratio = self._trim_silence_and_estimate_vad(data, current_sr)

            # Amplitude normalization
            data_normalized = self._normalize_amplitude(data_trimmed)

            duration = len(data_normalized) / float(current_sr)

            return {
                "waveform": data_normalized,
                "sample_rate": current_sr,
                "original_sample_rate": sr,
                "duration": round(duration, 3),
                "original_duration": round(original_duration, 3),
                "channels": channels,
                "speech_duration": round(duration * speech_ratio, 3),
                "vad_score": round(speech_ratio * 100, 1),
            }

        finally:
            if temp_input:
                safe_cleanup_file(temp_input)

    def _normalize_amplitude(self, audio: np.ndarray, target_rms: float = 0.1) -> np.ndarray:
        """Peak and RMS normalization to ensure uniform input dynamics."""
        rms = np.sqrt(np.mean(audio ** 2))
        if rms > 1e-6:
            audio = audio * (target_rms / rms)
        # Clip peaks safely to avoid harsh saturation
        return np.clip(audio, -1.0, 1.0)

    def _trim_silence_and_estimate_vad(self, audio: np.ndarray, sr: int, frame_ms: int = 30, threshold_db: float = -40.0):
        """Simple frame energy-based silence trimmer and speech activity detector."""
        frame_len = int(sr * (frame_ms / 1000.0))
        if len(audio) < frame_len:
            return audio, 1.0

        n_frames = len(audio) // frame_len
        energies = []
        for i in range(n_frames):
            frame = audio[i * frame_len : (i + 1) * frame_len]
            rms = np.sqrt(np.mean(frame ** 2) + 1e-12)
            db = 20 * np.log10(rms + 1e-12)
            energies.append(db)

        energies = np.array(energies)
        active_mask = energies > threshold_db
        speech_ratio = float(np.mean(active_mask)) if len(active_mask) > 0 else 1.0

        # Find first and last active frames for trimming
        active_indices = np.where(active_mask)[0]
        if len(active_indices) > 0:
            start_idx = max(0, active_indices[0] * frame_len - frame_len)
            end_idx = min(len(audio), (active_indices[-1] + 2) * frame_len)
            trimmed = audio[start_idx:end_idx]
            if len(trimmed) > int(sr * MIN_AUDIO_DURATION_SEC):
                return trimmed, speech_ratio

        return audio, speech_ratio
