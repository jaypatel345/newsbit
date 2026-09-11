import Cookies from "js-cookie";
import { getGuestId } from "@/app/lib/guest";

// Prefer an explicit WS URL. Otherwise derive one from the API URL (http ->
// ws, https -> wss) instead of hardcoding a localhost default — that default
// silently broke chat in production, where NEXT_PUBLIC_WS_URL was never set:
// every browser tried to open a WebSocket to the visitor's own machine.
function resolveWsBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/^http/, "ws");
  }
  return "ws://127.0.0.1:8000";
}

const WS_BASE_URL = resolveWsBaseUrl();

export function createChatWebSocket(conversationId: number | null) {
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Get guest_id using the centralized function
  const guestId = getGuestId();

  // Get token from cookies
  const token = Cookies.get("access_token");

  // Build URL with guest_id
  let url = `${WS_BASE_URL}/api/v1/conversations/${conversationId}/ws?guest_id=${guestId}`;
  
  // Add token to URL if available
  if (token) {
    url += `&token=${token}`;
  }

  return new WebSocket(url);
}