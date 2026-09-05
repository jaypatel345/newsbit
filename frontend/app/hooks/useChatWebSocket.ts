"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createChatWebSocket } from "@/app/services/chatWebSocket";

type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

type ChatMessage = {
  type: string;
  content?: string;
  conversation_id?: number;
  id?: string;
  role?: string;
  created_at?: string;
};

export function useChatWebSocket(conversationId: number | null) {
  const socketRef = useRef<WebSocket | null>(null);

  const [status, setStatus] =
    useState<ConnectionStatus>("disconnected");

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setStatus("disconnected");
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;
    let manuallyClosed = false;

    const connect = () => {
      if (manuallyClosed) return;

      setStatus(
        reconnectAttempts === 0
          ? "connecting"
          : "reconnecting"
      );

      socket = createChatWebSocket(conversationId);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts = 0;
        setStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          const data: ChatMessage = JSON.parse(event.data);
          // console.log("WebSocket message:", data);

          if (data.type === "error") {
            console.error(
              "WebSocket error message:",
              data.content
            );
            return;
          }

          setMessages((previous) => [
            ...previous,
            data,
          ]);
        } catch (error) {
          console.error(
            "Failed to parse WebSocket message:",
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("error");
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");

        if (manuallyClosed) {
          setStatus("disconnected");
          return;
        }

        socketRef.current = null;
        reconnectAttempts++;

        if (reconnectAttempts <= 5) {
          setStatus("reconnecting");
          const delay = Math.min(
            1000 * reconnectAttempts,
            5000
          );
          console.log(
            `Reconnecting in ${delay}ms...`
          );
          reconnectTimer = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error(
            "Maximum WebSocket reconnection attempts reached"
          );
          setStatus("error");
        }
      };
    };

    connect();

    return () => {
      manuallyClosed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
  async (
    content: string,
    articleIds: number[] = [],
  ) => {
    const socket = socketRef.current;

    // console.log("sendMessage called, socket:", socket, "readyState:", socket?.readyState);

    if (!socket) {
      throw new Error("WebSocket is not initialized");
    }

    if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      throw new Error("WebSocket is closed or closing");
    }

    if (socket.readyState === WebSocket.CONNECTING) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(
            new Error(
              "WebSocket connection timeout",
            ),
          );
        }, 10000);

        socket.addEventListener(
          "open",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );

        socket.addEventListener(
          "error",
          () => {
            clearTimeout(timeout);
            reject(
              new Error(
                "WebSocket connection failed",
              ),
            );
          },
          { once: true },
        );
      });
    }

    if (socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    // Create a promise that resolves when we get a response or times out
    const responsePromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Response timeout after 35 seconds"));
      }, 35000); // 35 second timeout (slightly longer than backend 30s timeout)

      const messageHandler = (event: MessageEvent) => {
        try {
          const data: ChatMessage = JSON.parse(event.data);
          if (data.type === "message" || data.type === "error") {
            clearTimeout(timeout);
            socket.removeEventListener("message", messageHandler);
            if (data.type === "error") {
              reject(new Error(data.content || "Unknown error"));
            } else {
              resolve();
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          socket.removeEventListener("message", messageHandler);
          reject(error);
        }
      };

      socket.addEventListener("message", messageHandler);
    });

    socket.send(
      JSON.stringify({
        type: "user_message",
        content,
        article_ids: articleIds,
      }),
    );

    // Wait for response or timeout
    await responsePromise;
  },
  [],
);

  return {
    status,
    messages,
    sendMessage,
  };
}