from app.schemas.voice import SpeechRequest, TranscriptionResponse
from app.services.infrastructure.voice.chat_speech import to_speech_text
from app.services.infrastructure.voice.stt_service import STTService
from app.services.infrastructure.voice.tts_service import TTSService
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile

router = APIRouter(
    prefix="/api/v1/voice",
    tags=["voice"],
)

# Groq's transcription endpoint caps uploads at 25MB - reject earlier and
# clearly rather than let the upstream call fail.
MAX_AUDIO_BYTES = 25 * 1024 * 1024


def get_stt_service() -> STTService:
    return STTService()


def get_tts_service() -> TTSService:
    return TTSService()


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


@router.post("/speak")
async def speak_text(
    request: SpeechRequest,
    service: TTSService = Depends(get_tts_service),
):
    """Read one piece of a chat answer aloud and return it as MP3.

    Voice mode calls this per sentence while the answer is still streaming,
    so the caller can start playing audio seconds before the answer is
    finished. Nothing is cached: unlike an article summary, these lines are
    said once and never requested again.
    """
    script = to_speech_text(request.text)
    if not script:
        raise HTTPException(status_code=422, detail="No text to read aloud")

    audio_bytes = await service.synthesize_script(script)
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )
