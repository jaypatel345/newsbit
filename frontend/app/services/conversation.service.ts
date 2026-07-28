import { Conversation } from "@/types/conversation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${BASE_URL}/api/v1/conversations`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

export async function createConversation(): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/api/v1/conversations`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      title: "New Chat",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }

  return response.json();
}
