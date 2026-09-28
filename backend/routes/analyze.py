import time
import uuid
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.audio_processor import AudioProcessor, AudioProcessingError
from backend.services.feature_extractor import FeatureExtractor
from backend.services.deepfake_detector import DeepfakeDetector
from backend.services.speaker_verifier import SpeakerVerifier
from backend.services.replay_detector import ReplayDetector
from backend.services.risk_engine import RiskEngine
from backend.utils.security import compute_file_hash, MAX_FILE_SIZE_BYTES
from backend.utils.logger import get_logger

logger = get_logger("analyze_route")

router = APIRouter(tags=["Audio Analysis"])

processor = AudioProcessor()
extractor = FeatureExtractor()
detector = DeepfakeDetector()
verifier = SpeakerVerifier()
replay_det = ReplayDetector()
risk_engine = RiskEngine()

# In-memory session history store (privacy-preserving: no raw audio stored)
ANALYSIS_HISTORY = []
MAX_HISTORY_ITEMS = 50

@router.post("/api/analyze")
@router.post("/api/analyze-chunk")
@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(..., description="Incoming voice audio recording to evaluate"),
    reference_file: Optional[UploadFile] = File(None, description="Optional enrolled reference voice for speaker verification"),
    language: Optional[str] = Form("auto", description="Spoken language code (auto, en, te, hi)"),
):
    """
    Main Multi-Modal Forensic Audio Analysis Endpoint.
    Executes end-to-end AI security pipeline:
    1. Audio Preprocessing (validation, 16kHz resampling, RMS normalization, VAD)
    2. Spectral Feature Extraction (MFCC, roll-off, pitch jitter, formant dynamics)
    3. Voice Authenticity / Deepfake Detection (vocoder artifacts, synthetic probability)
    4. Replay Attack Detection (room impulse, loudspeaker distortion)
    5. Speaker Verification (biometric cosine similarity if reference file provided)
    6. Calibrated Multi-Factor Risk Fusion & Security Response Recommendation
    """
    start_time = performance_time = time.perf_counter()
    analysis_id = f"VG-{str(uuid.uuid4())[:8].upper()}"

    try:
        audio_bytes = await file.read(MAX_FILE_SIZE_BYTES + 1)
        if len(audio_bytes) > MAX_FILE_SIZE_BYTES:
            raise AudioProcessingError(f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.")
        logger.info("Audio analysis received id=%s bytes=%d", analysis_id, len(audio_bytes))
        file_hash = compute_file_hash(audio_bytes)

        # 1. Audio Preprocessing
        processed = processor.process_audio_bytes(audio_bytes, file.filename)
        waveform = processed["waveform"]
        logger.info(
            "Audio decoded id=%s duration_seconds=%.3f sample_rate=%d channels=%d",
            analysis_id,
            processed["duration"],
            processed["sample_rate"],
            processed["channels"],
        )

        # 2. Feature Extraction
        features = extractor.extract_features(waveform)

        # 3. Voice Authenticity Analysis
        authenticity_res = detector.analyze(features)

        # 4. Replay Detection
        replay_res = replay_det.analyze(features, waveform=waveform)

        # 5. Speaker Verification (if reference sample provided)
        speaker_res = {"available": False, "similarity": None, "match": None, "explanation": "No reference voice enrolled."}
        if reference_file is not None:
            try:
                ref_bytes = await reference_file.read(MAX_FILE_SIZE_BYTES + 1)
                ref_processed = processor.process_audio_bytes(ref_bytes, reference_file.filename)
                ref_features = extractor.extract_features(ref_processed["waveform"])
                speaker_res = verifier.verify(ref_features, features)
            except Exception as ref_err:
                logger.warning("Reference voice processing failed: %s", ref_err)
                speaker_res = {
                    "available": False,
                    "similarity": None,
                    "match": None,
                    "explanation": "Reference audio could not be processed; speaker verification is unavailable.",
                }

        # 6. Risk Engine Fusion
        risk_res = risk_engine.evaluate(
            authenticity_result=authenticity_res,
            speaker_result=speaker_res if speaker_res.get("available") else None,
            replay_result=replay_res,
            speech_vad_score=processed.get("vad_score"),
        )

        processing_ms = int((time.perf_counter() - start_time) * 1000)

        # Language display mapping
        lang_map = {
            "en": "English",
            "te": "Telugu",
            "hi": "Hindi",
            "auto": "Auto (English / Multilingual)",
        }
        requested_language = lang_map.get(language.lower(), "Auto (English / Multilingual)")

        # Compile explainable evidence list
        evidence_list = list(authenticity_res.get("evidence", []))
        if speaker_res.get("available"):
            evidence_list.append(speaker_res.get("explanation"))
        if replay_res.get("indicators"):
            evidence_list.extend(replay_res.get("indicators"))

        response_data = {
            "status": "success",
            "analysis_id": analysis_id,
            "filename": file.filename,
            "file_size": len(audio_bytes),
            "file_hash": file_hash,
            "duration": processed["duration"],
            "sample_rate": processed["sample_rate"],
            "channels": processed["channels"],
            "speech_duration": processed["speech_duration"],
            "vad_score": processed["vad_score"],
            "detected_language": None,
            "requested_language": requested_language,
            "language_identification_available": False,
            "language_code": language,
            "authenticity": authenticity_res,
            "speaker_verification": speaker_res,
            "replay_detection": replay_res,
            "risk": risk_res,
            "evidence": evidence_list,
            "recommendation": risk_res.get("recommendation"),
            "model_metadata": authenticity_res.get("model_metadata", {}),
            "processing_time_ms": processing_ms,
            "confidence_disclaimer": "Multi-factor acoustic and spectral forensic analysis. Evaluates neural vocoder artifacts, pitch stability, high-frequency loss, and replay channel dynamics.",
            # Backward compatibility aliases
            "risk_engine": {
                "overall_risk_score": risk_res.get("score"),
                "risk_level": risk_res.get("level"),
                "primary_indicators": evidence_list,
                "recommendation": risk_res.get("recommendation"),
            },
        }

        # Store in session history (privacy-preserving metadata only)
        ANALYSIS_HISTORY.append(response_data)
        if len(ANALYSIS_HISTORY) > MAX_HISTORY_ITEMS:
            ANALYSIS_HISTORY.pop(0)

        logger.info("Audio analysis completed id=%s elapsed_ms=%d model_status=%s", analysis_id, processing_ms, authenticity_res.get("model_metadata", {}).get("status"))
        return response_data

    except AudioProcessingError as ape:
        raise HTTPException(status_code=400, detail=str(ape))
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Audio analysis failed due to an internal server error.") from e

@router.get("/api/history")
@router.get("/history")
async def get_analysis_history():
    """
    Returns session analysis history (metadata only, no voice files stored).
    """
    return ANALYSIS_HISTORY
