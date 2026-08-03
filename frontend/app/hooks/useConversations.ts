"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/app/services/conversation.service";
import { Conversation } from "@/types/conversation";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
