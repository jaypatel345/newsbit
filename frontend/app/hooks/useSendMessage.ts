"use client";

import { useMutation } from "@tanstack/react-query";

import { sendMessage } from "@/app/services/message.service";

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      signal,
      articleIds,
    }: {
      conversationId: number;
      content: string;
      signal?: AbortSignal;
      articleIds?: number[];
    }) => sendMessage(conversationId, content, signal, articleIds),
  });
}
