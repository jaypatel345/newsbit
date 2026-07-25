"use client";
import { useQuery } from "@tanstack/react-query";
import { getCategoryNews } from "@/app/services/category.service";

export function useCategory(category: string) {
  return useQuery({
    queryKey: ["CategoryNews", category],
    queryFn: () => getCategoryNews(category),
    enabled: !!category,
  });
}
