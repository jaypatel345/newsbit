"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryNews } from "@/app/services/category.service";
import { Article } from "@/types/article";

export function useCategoryNews(category: string, initialData?: Article[]) {
  return useQuery({
    queryKey: ["category-news", category],
    queryFn: async () => {
      // Add small delay to stagger the API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return getCategoryNews(category);
    },
    enabled: !!category,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
