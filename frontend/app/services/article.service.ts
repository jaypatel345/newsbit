const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getArticle(id: number) {
    const response = await fetch(`${BASE_URL}/api/v1/news/articles/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch article");
    }
    return response.json();
} 