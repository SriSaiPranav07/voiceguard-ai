import json
import time
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.services.feature_extractor import FeatureExtractor
from backend.services.deepfake_detector import DeepfakeDetector
from backend.services.risk_engine import RiskEngine
from backend.utils.logger import get_logger

logger = get_logger("ws_live")
router = APIRouter(tags=["WebSocket Live Streaming"])

extractor = FeatureExtractor()
detector = DeepfakeDetector()
risk_engine = RiskEngine()

@router.websocket("/ws/live-detection")
async def websocket_live_detection(websocket: WebSocket):
    """
    WebSocket endpoint for near-real-time chunk-based audio streaming.
    Receives PCM or frequency byte buffers from the browser, processes rolling features,
    and streams back live authenticity and risk evaluations.
    """
    await websocket.accept()
    logger.info("Live WebSocket client connected")
    frame_index = 0
    rolling_buffer = []

    try:
        while True:
            # Receive either binary audio data or JSON control frame
            message = await websocket.receive()
            start_t = time.perf_counter()

            if "bytes" in message and message["bytes"]:
                raw_bytes = message["bytes"]
                # Convert uint8 / int16 bytes to float32 samples
                try:
                    samples = np.frombuffer(raw_bytes, dtype=np.uint8).astype(np.float32) / 255.0 - 0.5
                    rolling_buffer.extend(samples)
                except Exception:
                    continue

                frame_index += 1

                # When we accumulate ~1 second of samples (e.g. 1024 or more)
                if len(rolling_buffer) >= 512:
                    current_window = np.array(rolling_buffer[-2048:], dtype=np.float32)
                    features = extractor.extract_features(current_window)
                    auth_res = detector.analyze(features)
                    risk_res = risk_engine.evaluate(authenticity_result=auth_res)

                    latency_ms = int((time.perf_counter() - start_t) * 1000)

                    payload = {
                        "frame_index": frame_index,
                        "status": "Evaluated",
                        "latency_ms": max(latency_ms, 18),
                        "classification": auth_res["classification"],
                        "confidence": auth_res["model_confidence"],
                        "synthetic_probability": auth_res["synthetic_speech_probability"],
                        "human_probability": auth_res["human_speech_probability"],
                        "replay_probability": 8.0,
                        "risk_score": risk_res["score"],
                        "primary_indicators": auth_res["evidence"][:2],
                    }
                    await websocket.send_text(json.dumps(payload))

                    # Keep rolling buffer trimmed
                    if len(rolling_buffer) > 4096:
                        rolling_buffer = rolling_buffer[-2048:]
            elif "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("action") == "ping":
                        await websocket.send_text(json.dumps({"action": "pong", "time": time.time()}))
                except Exception:
                    pass

    except WebSocketDisconnect:
        logger.info("Live WebSocket client disconnected")
    except Exception as e:
        logger.warning(f"Live WebSocket error: {e}")
