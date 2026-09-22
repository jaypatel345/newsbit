import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import ExploreClient from "./ExploreClient";
import {
  getAllCategoryNews,
  getCategoryNews,
} from "@/app/services/category.service";
import { Article } from "@/types/article";

export const dynamic = "force-dynamic";

// Kept in sync with ExploreClient's own EXCLUDED_CATEGORIES list.
const EXCLUDED_CATEGORIES = ["India", "Nation", "Other"];

interface ExplorePageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { category: categoryParam } = await searchParams;

  // Fetched server-side so the page (and whichever category is selected via
  // ?category=) has real, crawlable content on first paint instead of a
  // client-rendered loading skeleton. If the backend is unreachable at
  // request time, fall through to undefined and let ExploreClient fetch
  // client-side as before.
  let initialCategories: string[] | undefined;
  let initialArticles: Article[] | undefined;
  let initialCategory: string | undefined;

  try {
    const categories: string[] = await getAllCategoryNews();
    initialCategories = categories;

    const filtered = categories.filter(
      (category) => !EXCLUDED_CATEGORIES.includes(category),
    );
    initialCategory = categoryParam || filtered[0];

    if (initialCategory) {
      initialArticles = await getCategoryNews(
        initialCategory === "all" ? "top" : initialCategory,
      );
    }
  } catch {
    initialCategories = undefined;
    initialArticles = undefined;
    initialCategory = undefined;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />
      <main>
        <ExploreClient
          initialCategories={initialCategories}
          initialArticles={initialArticles}
          initialCategory={initialCategory}
        />
      </main>
      <Footer />
    </div>
  );
}
