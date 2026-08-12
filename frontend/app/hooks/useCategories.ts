"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategoryNews } from "@/app/services/category.service";

export function useCategories(initialData?: string[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return getAllCategoryNews();
    },
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnReconnect: true,
  });
}
