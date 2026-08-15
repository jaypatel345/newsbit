import { Message } from "@/types/message";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMessages(conversationId: number): Promise<Message[]> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {};

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header as fallback for expired tokens
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/conversations/${conversationId}/messages`,
    {
      headers,
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Get messages error:", errorData);
    throw new Error(errorData.detail || "Failed to fetch messages");
  }

  const data = await response.json();
  
  // Handle both array response (MessageListResponse) and potential direct array
  const messages = data.messages || data;
  
  // Transform backend messages to match frontend Message type
  if (Array.isArray(messages)) {
    return messages.map((msg: any) => ({
      id: String(msg.id), // Convert numeric ID to string
      role: msg.role,
      content: msg.content,
    }));
  }
  
  return [];
}

export async function sendMessage(
  conversationId: number,
  content: string,
  signal?: AbortSignal,
  articleIds?: number[],
): Promise<Message> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header as fallback for expired tokens
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        content,
        article_ids: articleIds || [],
      }),
      signal,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Send message error:", errorData);
    throw new Error(errorData.detail || "Failed to send message");
  }

  const data = await response.json();
  
  // Transform backend response to match frontend Message type
  return {
    id: String(data.id), // Convert numeric ID to string
    role: data.role,
    content: data.content,
  };
}
