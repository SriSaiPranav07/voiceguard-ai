import io
import wave
import struct
import numpy as np
import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.utils.security import MAX_FILE_SIZE_BYTES

client = TestClient(app)

def create_test_wav_bytes(duration_sec: float = 1.0, freq_hz: float = 440.0) -> bytes:
    buffer = io.BytesIO()
    sample_rate = 16000
    n_samples = int(duration_sec * sample_rate)
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for i in range(n_samples):
            val = int(32767.0 * 0.4 * np.sin(2.0 * np.pi * freq_hz * (i / sample_rate)))
            wf.writeframes(struct.pack("<h", val))
    return buffer.getvalue()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["service"] == "voiceguard-ai"
    assert data["api_online"] is True
    assert data["model_loaded"] is False
    assert data["ai_engine_online"] is False
    assert "active_modules" in data
    assert data["active_modules"]["audio_preprocessor"] is True
    assert data["active_modules"]["authenticity_detector"] is False

def test_analyze_valid_audio():
    wav_bytes = create_test_wav_bytes(duration_sec=1.2, freq_hz=440.0)
    files = {"file": ("test_speech.wav", wav_bytes, "audio/wav")}
    data = {"language": "en"}
    response = client.post("/api/analyze", files=files, data=data)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert "analysis_id" in body
    assert "authenticity" in body
    assert "risk" in body
    assert "evidence" in body
    assert body["authenticity"]["classification"] == "UNAVAILABLE"
    assert body["authenticity"]["synthetic_speech_probability"] is None
    assert body["authenticity"]["human_speech_probability"] is None
    assert body["authenticity"]["model_confidence"] is None
    assert body["risk"]["score"] is None
    assert body["risk"]["level"] == "UNAVAILABLE"
    assert body["detected_language"] is None
    assert body["language_identification_available"] is False
    assert "transcript" not in body

def test_analyze_chunk_uses_the_same_audio_analysis_pipeline():
    wav_bytes = create_test_wav_bytes(duration_sec=1.0, freq_hz=330.0)
    response = client.post(
        "/api/analyze-chunk",
        files={"file": ("microphone_chunk.wav", wav_bytes, "audio/wav")},
        data={"language": "auto"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["authenticity"]["classification"] == "UNAVAILABLE"
    assert body["authenticity"]["measurements"]["high_freq_ratio"] is not None
    assert body["speaker_verification"]["similarity"] is None
    assert body["speaker_verification"]["match"] is None

def test_analyze_corrupt_audio_returns_client_error():
    response = client.post("/api/analyze", files={"file": ("broken.wav", b"not a wav", "audio/wav")})
    assert response.status_code == 400

def test_analyze_oversized_audio_is_rejected():
    response = client.post(
        "/api/analyze",
        files={"file": ("large.wav", b"0" * (MAX_FILE_SIZE_BYTES + 1), "audio/wav")},
    )
    assert response.status_code == 400

def test_analyze_empty_file_rejected():
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 400
    body = response.json()
    assert "empty" in body["detail"].lower()

def test_analyze_unsupported_file_rejected():
    files = {"file": ("document.exe", b"executable_binary_data", "application/octet-stream")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 400
    body = response.json()
    assert "unsupported" in body["detail"].lower()

def test_speaker_verification_endpoint():
    wav_a = create_test_wav_bytes(duration_sec=1.0, freq_hz=300.0)
    wav_b = create_test_wav_bytes(duration_sec=1.0, freq_hz=300.0)
    files = {
        "reference_file": ("ref.wav", wav_a, "audio/wav"),
        "incoming_file": ("incoming.wav", wav_b, "audio/wav"),
    }
    data = {"threshold": "0.75"}
    response = client.post("/api/verify-speaker", files=files, data=data)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert "similarity" in body
    assert "match" in body
    assert body["available"] is False
    assert body["match"] is None
    assert body["similarity"] is None

def test_replay_detection_endpoint():
    wav_bytes = create_test_wav_bytes(duration_sec=1.0, freq_hz=500.0)
    files = {"file": ("mic_recording.wav", wav_bytes, "audio/wav")}
    response = client.post("/api/detect-replay", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["probability"] is None
    assert body["is_replay"] is None

def test_call_shield_endpoints():
    # Incidents list
    inc_res = client.get("/api/v1/call-shield/incidents")
    assert inc_res.status_code == 200
    assert "incidents" in inc_res.json()

    # Threat assessment
    threat_res = client.post(
        "/api/v1/call-shield/analyze-threat",
        data={"category": "Digital Arrest Authority Scam", "caller_phone": "+91 99999 88888", "language": "hi"},
    )
    assert threat_res.status_code == 200
    body = threat_res.json()
    assert "threat_score" in body
    assert "recommendation" in body

def test_analysis_history():
    res = client.get("/api/history")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
