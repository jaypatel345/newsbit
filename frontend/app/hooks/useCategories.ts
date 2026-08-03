"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategoryNews } from "@/app/services/category.service";

export function useCategories(initialData?: string[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Add 1000ms delay to stagger the API call (last to load)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getAllCategoryNews();
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
