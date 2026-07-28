"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "@/app/services/conversation.service";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,

    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
