"use client";

import { Article } from "@/types/article";

const BASE_URL = "http://127.0.0.1:8000";

export async function getNews(): Promise<Article[]> {
  const response = await fetch(`${BASE_URL}/news/v1`);
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = response.json();
  console.log(data);

  return data;
}
