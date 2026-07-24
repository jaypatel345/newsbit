"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopStories } from "../services/news.service";

export function useTopStories() {
  return useQuery({
    queryKey: ["TopStories"],
    queryFn: getTopStories,
  });
}
