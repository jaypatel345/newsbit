import { Article } from "@/types/article";
import { TodaySummary } from "@/types/todaySummary";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTopStories(): Promise<Article[]> {
  const response = await fetch(`${BASE_URL}/api/v1/news/top-stories/`);
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}

export async function getTopSummary(): Promise<TodaySummary> {
  const response = await fetch(`${BASE_URL}/api/v1/news/today-summary/`);

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}
