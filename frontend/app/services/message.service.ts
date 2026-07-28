import { Message } from "@/types/message";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(
    `${BASE_URL}/api/v1/conversations/${conversationId}/messages`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
}

export async function sendMessage(
  conversationId: number,

  content: string,
): Promise<Message> {
  const response = await fetch(
    `${BASE_URL}/api/v1/conversations/${conversationId}/messages`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        content,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
