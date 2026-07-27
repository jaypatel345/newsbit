"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategoryNews } from "@/app/services/category.service";

export function useCategories(initialData?: string[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategoryNews,
    initialData,
  });
}
