"use client";

import { Article } from "@/types/article";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function getNews(): Promise<Article[]> {
  const response = await fetch(`${BASE_URL}/news/v1`);
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = response.json();
  // console.log(data);

  return data;
}
