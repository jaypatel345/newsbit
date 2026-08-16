const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const guestId =
    typeof window !== "undefined" ? localStorage.getItem("guest_id") : null;

  const headers = new Headers(options.headers);

  if (guestId) {
    headers.set("X-Guest-ID", guestId);
  }

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}
