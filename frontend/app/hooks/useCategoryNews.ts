"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryNews } from "@/app/services/category.service";
import { Article } from "@/types/article";

export function useCategoryNews(category: string, initialData?: Article[]) {
  return useQuery({
    queryKey: ["category-news", category],
    queryFn: () => getCategoryNews(category),
    enabled: !!category,
    initialData,
  });
}
