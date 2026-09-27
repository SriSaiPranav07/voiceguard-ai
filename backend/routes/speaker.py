from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.audio_processor import AudioProcessor, AudioProcessingError
from backend.services.feature_extractor import FeatureExtractor
from backend.services.speaker_verifier import SpeakerVerifier

router = APIRouter(tags=["Speaker Verification"])

processor = AudioProcessor()
extractor = FeatureExtractor()
verifier = SpeakerVerifier()

@router.post("/api/verify-speaker")
@router.post("/verify-speaker")
async def verify_speaker_endpoint(
    reference_file: UploadFile = File(..., description="Reference enrolled voice recording of legitimate speaker"),
    incoming_file: UploadFile = File(..., description="Incoming voice sample to verify"),
    threshold: float = Form(0.75, description="Decision threshold for cosine similarity"),
):
    """
    Dedicated Speaker Verification Endpoint.
    Compares reference speaker acoustic fingerprint with incoming speech sample.
    """
    try:
        ref_bytes = await reference_file.read()
        ref_processed = processor.process_audio_bytes(ref_bytes, reference_file.filename)
        ref_features = extractor.extract_features(ref_processed["waveform"])

        inc_bytes = await incoming_file.read()
        inc_processed = processor.process_audio_bytes(inc_bytes, incoming_file.filename)
        inc_features = extractor.extract_features(inc_processed["waveform"])

        result = verifier.verify(ref_features, inc_features, threshold=threshold)
        return {
            "status": "success",
            "reference_file": reference_file.filename,
            "incoming_file": incoming_file.filename,
            **result,
        }
    except AudioProcessingError as ape:
        raise HTTPException(status_code=400, detail=str(ape))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speaker verification error: {str(e)}")
