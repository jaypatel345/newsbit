const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { Article } from "@/types/article";

export async function getCategoryNews(category: string): Promise<Article[]> {
  const response = await fetch(
    `${BASE_URL}/api/v1/news/categories/${category}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch category news");
  }

  return response.json();
}

export async function getAllCategoryNews() {
  const response = await fetch(`${BASE_URL}/api/v1/news/categories`, {
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}
