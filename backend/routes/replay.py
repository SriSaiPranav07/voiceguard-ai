from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.audio_processor import AudioProcessor, AudioProcessingError
from backend.services.feature_extractor import FeatureExtractor
from backend.services.replay_detector import ReplayDetector
from backend.utils.security import MAX_FILE_SIZE_BYTES

router = APIRouter(tags=["Replay Attack Detection"])

processor = AudioProcessor()
extractor = FeatureExtractor()
replay_detector = ReplayDetector()

@router.post("/api/detect-replay")
@router.post("/detect-replay")
async def detect_replay_endpoint(
    file: UploadFile = File(..., description="Audio recording to analyze for physical replay attack"),
):
    """
    Dedicated Replay Attack Detection Endpoint.
    Analyzes physical channel characteristics, loudspeaker distortion, and room impulse reverberation.
    """
    try:
        audio_bytes = await file.read(MAX_FILE_SIZE_BYTES + 1)
        processed = processor.process_audio_bytes(audio_bytes, file.filename)
        features = extractor.extract_features(processed["waveform"])
        result = replay_detector.analyze(features, waveform=processed["waveform"])

        return {
            "status": "success",
            "filename": file.filename,
            **result,
        }
    except AudioProcessingError as ape:
        raise HTTPException(status_code=400, detail=str(ape))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay detection error: {str(e)}")
