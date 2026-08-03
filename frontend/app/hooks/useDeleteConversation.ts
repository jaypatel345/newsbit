"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteConversation } from "@/app/services/conversation.service";

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) => deleteConversation(conversationId),

    onSuccess: (_, deletedConversationId) => {
      // Remove localStorage entry since server delete succeeded
      localStorage.removeItem(`deleted_conversation_${deletedConversationId}`);
    },

    onError: (error, deletedConversationId) => {
      console.error("Failed to delete conversation on server:", error);
      // Keep localStorage deletion to persist across reloads
    },
  });
}
