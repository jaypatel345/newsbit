import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

const categories = [
  { name: "World", icon: "🌍" },
  { name: "AI", icon: "🤖" },
  { name: "Business", icon: "💰" },
  { name: "Markets", icon: "📈" },
  { name: "India", icon: "🇮🇳" },
  { name: "Sports", icon: "⚽" },
  { name: "Health", icon: "🏥" },
  { name: "Science", icon: "🔬" },
];

export default function TodaysBrief() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block text-sm font-medium text-blue-600 mb-3">
            Daily AI Brief
          </span>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Today's Brief
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            10 important stories selected and summarized by AI.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Read time: 4 min</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/brief"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-all duration-200 mb-12"
        >
          Start Reading
          <ArrowRight size={20} />
        </Link>

        {/* Category Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
