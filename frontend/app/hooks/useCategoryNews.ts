"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryNews } from "@/app/services/category.service";

export function useCategoryNews(category: string) {
  return useQuery({
    queryKey: ["category-news", category],
    queryFn: () => getCategoryNews(category),
    enabled: !!category,
  });
}
