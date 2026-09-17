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
