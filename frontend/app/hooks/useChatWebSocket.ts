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
  sources?: unknown[];
  conversation_id?: number;
  id?: string;
  role?: string;
  created_at?: string;
  message_id?: string;
};

export function useChatWebSocket(conversationId: number | null) {
  const socketRef = useRef<WebSocket | null>(null);

  const [status, setStatus] =
    useState<ConnectionStatus>("disconnected");

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Text of the answer currently streaming in. Chunks land far faster than
  // the screen refreshes, so they're accumulated in a ref and published once
  // per frame — one render per frame instead of one per token.
  const [streamingContent, setStreamingContent] = useState("");
  const streamBufferRef = useRef("");
  const flushHandleRef = useRef<number | null>(null);

  const cancelFlush = useCallback(() => {
    if (flushHandleRef.current === null) return;
    cancelAnimationFrame(flushHandleRef.current);
    flushHandleRef.current = null;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushHandleRef.current !== null) return;
    flushHandleRef.current = requestAnimationFrame(() => {
      flushHandleRef.current = null;
      setStreamingContent(streamBufferRef.current);
    });
  }, []);

  const clearStreamingContent = useCallback(() => {
    cancelFlush();
    streamBufferRef.current = "";
    setStreamingContent("");
  }, [cancelFlush]);

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
            clearStreamingContent();
            return;
          }

          // A piece of the answer. These are display-only and must not go
          // into `messages` — the saved message arrives separately at the end.
          if (data.type === "chunk") {
            streamBufferRef.current += data.content ?? "";
            scheduleFlush();
            return;
          }

          // The server abandoned the attempt and is regenerating the answer,
          // so drop what has been shown so far.
          if (data.type === "reset") {
            clearStreamingContent();
            return;
          }

          setMessages((previous) => {
            // Prevent duplicate messages by checking id
            if (data.id && previous.some((message) => message.id === data.id)) {
              return previous;
            }
            return [...previous, data];
          });
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

        // Protect onclose from old socket instances
        if (socketRef.current !== socket) {
          return;
        }

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
      clearStreamingContent();
    };
  }, [conversationId, clearStreamingContent, scheduleFlush]);

  // Helper to wait for an open connection
  const waitForConnection = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const check = () => {
        const socket = socketRef.current;
        if (!socket) {
          reject(new Error("WebSocket not initialized"));
          return;
        }
        if (socket.readyState === WebSocket.OPEN) {
          resolve(socket);
          return;
        }
        if (
          socket.readyState === WebSocket.CLOSED ||
          socket.readyState === WebSocket.CLOSING
        ) {
          reject(new Error("WebSocket closed"));
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }, []);

  const sendMessage = useCallback(
  async (
    content: string,
    articleIds: number[] = [],
  ) => {
    // Wait for connection with 15 second timeout
    const connectionTimeout = setTimeout(() => {
      throw new Error("Connection timeout after 15 seconds");
    }, 15000);

    const socket = await waitForConnection();
    clearTimeout(connectionTimeout);

    // Generate unique message ID for request-response tracking
    const messageId = crypto.randomUUID();

    // Create a promise that resolves when we get a response or times out
    const responsePromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Response timeout after 90 seconds"));
      }, 90000); // 90 second timeout for AI response

      const messageHandler = (event: MessageEvent) => {
        try {
          const data: ChatMessage = JSON.parse(event.data);
if (data.type === "message" || data.type === "error") {
            // Check if this response matches our request
            if (data.message_id && data.message_id !== messageId) {
              return; // Not our response
            }
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
        message_id: messageId,
        content,
        article_ids: articleIds,
      }),
    );

    // Wait for response or timeout
    await responsePromise;
  },
  [waitForConnection],
);

  return {
    status,
    messages,
    sendMessage,
    streamingContent,
    clearStreamingContent,
  };
}