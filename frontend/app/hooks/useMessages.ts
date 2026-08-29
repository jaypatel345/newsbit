"use client";

import { useQuery } from "@tanstack/react-query";

import { getMessages } from "@/app/services/message.service";

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ["messages", conversationId],

    queryFn: () => getMessages(conversationId!),

    enabled: !!conversationId,
    staleTime: 30000, // Keep data fresh for 30 seconds to prevent overwriting optimistic updates
    refetchOnMount: false, // Don't refetch on mount to preserve cache
    refetchOnWindowFocus: false,
  });
}
