"use client";

import { useQuery } from "@tanstack/react-query";

import { getMessages } from "@/app/services/message.service";

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ["messages", conversationId],

    queryFn: () => getMessages(conversationId!),

    enabled: !!conversationId,
    staleTime: 0, // Always consider data stale to ensure UI updates
    refetchOnMount: true, // Refetch when mounting to ensure fresh data
    refetchOnWindowFocus: false,
  });
}
