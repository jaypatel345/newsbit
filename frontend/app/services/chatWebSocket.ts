import Cookies from "js-cookie";
import { getGuestId } from "@/app/lib/guest";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

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