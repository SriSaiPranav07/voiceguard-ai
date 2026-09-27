"""Generate sample audio files for VoiceGuard AI demo."""
import numpy as np
import struct
import os

SAMPLE_RATE = 16000
DURATION = 4.0

def write_wav(filename, data, sample_rate=16000):
    n_samples = len(data)
    data = np.clip(data, -1.0, 1.0)
    pcm = (data * 32767).astype(np.int16)
    with open(filename, 'wb') as f:
        data_size = n_samples * 2
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + data_size))
        f.write(b'WAVE')
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))
        f.write(struct.pack('<H', 1))
        f.write(struct.pack('<H', 1))
        f.write(struct.pack('<I', sample_rate))
        f.write(struct.pack('<I', sample_rate * 2))
        f.write(struct.pack('<H', 2))
        f.write(struct.pack('<H', 16))
        f.write(b'data')
        f.write(struct.pack('<I', data_size))
        f.write(pcm.tobytes())

def generate_human_voice():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    base_freq = 120.0
    jitter = np.random.normal(0, 2.5, len(t))
    pitch = base_freq + 8 * np.sin(2 * np.pi * 0.4 * t) + jitter
    phase = np.cumsum(2 * np.pi * pitch / SAMPLE_RATE)
    fundamental = np.sin(phase)
    h2 = 0.5 * np.sin(2 * phase + np.random.uniform(0, 0.3))
    h3 = 0.3 * np.sin(3 * phase + np.random.uniform(0, 0.5))
    h4 = 0.15 * np.sin(4 * phase)
    h5 = 0.08 * np.sin(5 * phase)
    signal = fundamental + h2 + h3 + h4 + h5
    shimmer = 1 + 0.08 * np.random.normal(0, 1, len(t))
    signal *= shimmer
    envelope = np.ones(len(t))
    segments = [
        (0.0, 0.15, 'pause'), (0.15, 0.8, 'speak'),
        (0.8, 1.0, 'pause'), (1.0, 1.7, 'speak'),
        (1.7, 1.85, 'pause'), (1.85, 2.6, 'speak'),
        (2.6, 2.75, 'pause'), (2.75, 3.5, 'speak'),
        (3.5, 3.6, 'pause'), (3.6, 4.0, 'speak'),
    ]
    for start, end, seg_type in segments:
        i0 = int(start * SAMPLE_RATE)
        i1 = min(int(end * SAMPLE_RATE), len(t))
        if seg_type == 'pause':
            envelope[i0:i1] = 0.02
        else:
            seg_len = i1 - i0
            attack = min(800, seg_len // 4)
            release = min(600, seg_len // 4)
            env_seg = np.ones(seg_len)
            env_seg[:attack] = np.linspace(0.0, 1.0, attack)
            env_seg[-release:] = np.linspace(1.0, 0.1, release)
            env_seg *= (1 + 0.1 * np.sin(2 * np.pi * 3.5 * np.linspace(0, 1, seg_len)))
            envelope[i0:i1] = env_seg
    signal *= envelope
    breath_noise = 0.015 * np.random.randn(len(t))
    signal += breath_noise
    signal /= np.max(np.abs(signal)) + 1e-6
    signal *= 0.85
    return signal

def generate_ai_voice():
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    base_freq = 125.0
    pitch = base_freq + 1.5 * np.sin(2 * np.pi * 0.15 * t)
    phase = np.cumsum(2 * np.pi * pitch / SAMPLE_RATE)
    fundamental = np.sin(phase)
    h2 = 0.45 * np.sin(2 * phase)
    h3 = 0.35 * np.sin(3 * phase)
    h4 = 0.25 * np.sin(4 * phase)
    h5 = 0.18 * np.sin(5 * phase)
    h6 = 0.12 * np.sin(6 * phase)
    signal = fundamental + h2 + h3 + h4 + h5 + h6
    envelope = np.ones(len(t))
    for i in range(5):
        start = int(i * 0.8 * SAMPLE_RATE)
        end = min(int((i * 0.8 + 0.65) * SAMPLE_RATE), len(t))
        pause_start = end
        pause_end = min(int((i * 0.8 + 0.8) * SAMPLE_RATE), len(t))
        seg_len = end - start
        if seg_len > 0:
            attack = min(200, seg_len // 5)
            release = min(200, seg_len // 5)
            env_seg = np.ones(seg_len)
            env_seg[:attack] = np.linspace(0, 1, attack)
            env_seg[-release:] = np.linspace(1, 0, release)
            envelope[start:end] = env_seg
        if pause_start < len(t):
            envelope[pause_start:pause_end] = 0.0
    signal *= envelope
    frame_size = 256
    for i in range(0, len(signal), frame_size):
        if i + frame_size < len(signal):
            signal[i] += 0.02 * np.random.randn()
    metallic = 0.04 * np.sin(2 * np.pi * 3400 * t) * np.exp(-2 * t)
    signal += metallic
    signal /= np.max(np.abs(signal)) + 1e-6
    signal *= 0.85
    return signal

if __name__ == '__main__':
    out_dir = os.path.dirname(os.path.abspath(__file__))
    print("Generating human voice sample...")
    human = generate_human_voice()
    human_path = os.path.join(out_dir, 'human_voice_sample.wav')
    write_wav(human_path, human, SAMPLE_RATE)
    print(f"  -> {human_path} ({os.path.getsize(human_path)} bytes)")
    print("Generating AI cloned voice sample...")
    ai = generate_ai_voice()
    ai_path = os.path.join(out_dir, 'ai_cloned_voice_sample.wav')
    write_wav(ai_path, ai, SAMPLE_RATE)
    print(f"  -> {ai_path} ({os.path.getsize(ai_path)} bytes)")
    print("Done!")
