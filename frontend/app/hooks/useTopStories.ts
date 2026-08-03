"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopStories } from "../services/news.service";

export function useTopStories(delay: number = 0) {
  return useQuery({
    queryKey: ["TopStories"],
    queryFn: async () => {
      // Add configurable delay to stagger the API call
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return getTopStories();
    },
    // Stagger the load - delay this section
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
