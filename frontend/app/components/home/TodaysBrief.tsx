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
    <section id="todays-brief" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <span className="inline-block text-sm font-medium mb-3" style={{ color: "#8A6A3F" }}>
            Daily AI Brief
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4" style={{ color: "#1E1E1E" }}>
            Today&apos;s Brief
          </h2>
          <p className="text-base sm:text-lg mb-3 sm:mb-4" style={{ color: "#5B4C3A" }}>
            10 important stories selected and summarized by AI.
          </p>
          <div className="flex items-center gap-2 text-sm" style={{ color: "#5B4C3A" }}>
            <Clock size={16} style={{ color: "#8A6A3F" }} />
            <span>Read time: 4 min</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/brief"
          className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium hover:opacity-80 transition-all duration-200 mb-8 sm:mb-10 md:mb-12"
          style={{ backgroundColor: "#8A6A3F", color: "#FFFFFF" }}
        >
          Start Reading
          <ArrowRight size={20} />
        </Link>

        {/* Category Card */}
        <div className="rounded-2xl shadow-sm p-5 sm:p-6 md:p-8" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1E1E1E" }}
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
