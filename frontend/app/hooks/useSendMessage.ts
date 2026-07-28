"use client";

import { useMutation } from "@tanstack/react-query";

import { sendMessage } from "@/app/services/message.service";

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      conversationId,

      content,
    }: {
      conversationId: number;

      content: string;
    }) => sendMessage(conversationId, content),
  });
}
