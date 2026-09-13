const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** MP3 of a single article's AI summary, cached server-side per article. */
export function getArticleAudioUrl(articleId: number) {
  return `${BASE_URL}/api/v1/news/articles/${articleId}/audio`;
}

/** MP3 of the home page's daily brief, cached server-side per day's summary. */
export function getTodaysBriefAudioUrl() {
  return `${BASE_URL}/api/v1/news/today-summary/audio`;
}
