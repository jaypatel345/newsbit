"use client";
import { useQuery } from "@tanstack/react-query";

async function getCategories() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${BASE_URL}/api/v1/news/categories`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  return response.json();
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
