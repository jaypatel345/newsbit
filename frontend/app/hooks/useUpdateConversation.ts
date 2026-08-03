"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateConversation } from "@/app/services/conversation.service";

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, updates }: { conversationId: number; updates: { title?: string; is_pinned?: boolean } }) =>
      updateConversation(conversationId, updates),

    onSuccess: (updatedConversation) => {
      // Remove localStorage fallback since server update succeeded
      localStorage.removeItem(`conversation_title_${updatedConversation.id}`);
      localStorage.removeItem(`conversation_pinned_${updatedConversation.id}`);
      // Update the conversations list
      queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
        return oldConversations.map((conv) =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        );
      });
    },
  });
}
