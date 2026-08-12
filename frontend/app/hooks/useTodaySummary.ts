"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopSummary } from "../services/news.service";

export function useTodaySummary() {
  return useQuery({
    queryKey: ["TopSummary"],
    queryFn: getTopSummary,
    // Optimized for speed - load immediately with highest priority
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Enable background refetching for instant updates
    refetchOnReconnect: true,
  });
}
