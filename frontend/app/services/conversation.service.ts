import { Conversation } from "@/types/conversation";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getConversations(): Promise<Conversation[]> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {};

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header for unauthenticated users or as fallback
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  const response = await fetch(`${BASE_URL}/api/v1/conversations`, {
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Get conversations error:", errorData);
    throw new Error(errorData.detail || "Failed to fetch conversations");
  }

  return response.json();
}

export async function createConversation(): Promise<Conversation> {
  const token = Cookies.get("access_token");
  let guestId = localStorage.getItem("guest_id");

  // Generate guest ID if not exists
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

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

  const response = await fetch(`${BASE_URL}/api/v1/conversations`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      title: "New Chat",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Create conversation error:", errorData);
    throw new Error(errorData.detail || "Failed to create conversation");
  }

  return response.json();
}

export async function updateConversation(
  conversationId: number,
  updates: { title?: string; is_pinned?: boolean }
): Promise<Conversation> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header for unauthenticated users or as fallback
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  const response = await fetch(`${BASE_URL}/api/v1/conversations/${conversationId}`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Update conversation error:", errorData);
    throw new Error(errorData.detail || "Failed to update conversation");
  }

  return response.json();
}

export async function deleteConversation(conversationId: number): Promise<void> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {};

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header for unauthenticated users or as fallback
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  const response = await fetch(`${BASE_URL}/api/v1/conversations/${conversationId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Delete conversation error:", errorData);
    throw new Error(errorData.detail || "Failed to delete conversation");
  }
}
