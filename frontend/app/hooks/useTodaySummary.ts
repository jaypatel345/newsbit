"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopSummary } from "../services/news.service";

export function useTodaySummary() {
  return useQuery({
    queryKey: ["TopSummary"],
    queryFn: getTopSummary,
  });
}
