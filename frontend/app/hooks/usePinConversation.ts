"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateConversation } from "@/app/services/conversation.service";

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, isPinned }: { conversationId: number; isPinned: boolean }) =>
      updateConversation(conversationId, { is_pinned: isPinned }),

    onSuccess: (updatedConversation) => {
      queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
        return oldConversations.map((conv) =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        );
      });
    },
  });
}
