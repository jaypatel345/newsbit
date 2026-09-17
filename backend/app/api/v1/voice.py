from app.schemas.voice import TranscriptionResponse
from app.services.infrastructure.voice.stt_service import STTService
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

router = APIRouter(
    prefix="/api/v1/voice",
    tags=["voice"],
)

# Groq's transcription endpoint caps uploads at 25MB - reject earlier and
# clearly rather than let the upstream call fail.
MAX_AUDIO_BYTES = 25 * 1024 * 1024


def get_stt_service() -> STTService:
    return STTService()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    service: STTService = Depends(get_stt_service),
):
    """Transcribe a short voice recording (webm/wav/mp3/etc.) into text."""
    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large")

    text = await service.transcribe(
        audio_bytes, filename=audio.filename or "audio.webm"
    )
    return TranscriptionResponse(text=text)
