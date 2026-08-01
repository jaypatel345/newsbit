import { Conversation } from "@/types/conversation";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getConversations(): Promise<Conversation[]> {
  const token = Cookies.get("access_token");
  const guestId = localStorage.getItem("guest_id");

  const headers: Record<string, string> = {};

  // Add authorization header for authenticated users
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add guest ID header for unauthenticated users
  if (!token && guestId) {
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

  // Generate guest ID if not exists and user is not authenticated
  if (!token && !guestId) {
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

  // Add guest ID header for unauthenticated users
  if (!token && guestId) {
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
