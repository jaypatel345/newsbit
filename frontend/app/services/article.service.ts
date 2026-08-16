const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getArticle(id: number) {
    const response = await fetch(`${BASE_URL}/api/v1/news/articles/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch article");
    }
    return response.json();
} 