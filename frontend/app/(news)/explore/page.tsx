import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import ExploreClient from "./ExploreClient";
import { getAllCategoryNews, getCategoryNews } from "@/app/services/category.service";
import { Article } from "@/types/article";

export default async function ExplorePage() {
  // Fetch categories and initial articles on the server
  const categories = await getAllCategoryNews();
  const initialCategory = categories.length > 0 ? categories[0] : "";
  const initialArticles: Article[] = initialCategory
    ? await getCategoryNews(initialCategory === "all" ? "top" : initialCategory)
    : [];

  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />
      <ExploreClient
        initialCategories={categories}
        initialArticles={initialArticles}
        initialCategory={initialCategory}
      />
      <Footer />
    </div>
  );
}
