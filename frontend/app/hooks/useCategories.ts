"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategoryNews } from "@/app/services/category.service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategoryNews,
  });
}
