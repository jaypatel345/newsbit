"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopStories } from "../services/news.service";

export function useTopStories(delay: number = 0) {
  return useQuery({
    queryKey: ["TopStories"],
    queryFn: async () => {
      // Remove artificial delay for production performance
      if (delay > 0 && process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return getTopStories();
    },
    // Optimized for speed
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnReconnect: true,
  });
}
