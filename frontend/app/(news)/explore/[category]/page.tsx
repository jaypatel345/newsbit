import { topicsData } from "@/app/data/topicsData";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";

export async function generateStaticParams() {
  return topicsData.map((topic) => ({
    category: topic.id,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const topic = topicsData.find((t) => t.id === category);

  if (!topic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{topic.icon}</span>
            <h1 className="text-[30px] font-semibold text-gray-900">
              {topic.name}
            </h1>
          </div>
          <p className="text-[16px] text-gray-600">
            Latest news and updates in {topic.name.toLowerCase()}.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topic.articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
            >
              {/* Source */}
              <p className="text-sm font-medium text-gray-900 mb-2">
                {article.source}
              </p>

              {/* Headline */}
              <h3 className="text-[19px] font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.headline}
              </h3>

              {/* Time */}
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <span>{article.time}</span>
              </div>

              {/* Author */}
              {article.author && (
                <p className="text-[13px] text-gray-400 mt-1">{article.author}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
