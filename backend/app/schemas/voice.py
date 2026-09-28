from pydantic import BaseModel, Field


class TranscriptionResponse(BaseModel):
    text: str


class SpeechRequest(BaseModel):
    """A chunk of a chat answer to be read aloud."""

    text: str = Field(min_length=1, max_length=2000)
