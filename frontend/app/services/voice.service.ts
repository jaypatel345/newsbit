const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** Send a recorded voice clip to the backend and get back its transcript. */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetch(`${BASE_URL}/api/v1/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Transcribe audio error:", errorData);
    throw new Error(errorData.detail || "Failed to transcribe audio");
  }

  const data = await response.json();
  return data.text as string;
}

/** Render one line of a chat answer as speech and return it as MP3 audio. */
export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/api/v1/voice/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to synthesize speech");
  }

  return response.blob();
}
