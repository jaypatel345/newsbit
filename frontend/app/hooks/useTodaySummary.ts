"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopSummary } from "../services/news.service";

export function useTodaySummary() {
  return useQuery({
    queryKey: ["TopSummary"],
    queryFn: getTopSummary,
    // Stagger the initial load - no delay for first section
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
