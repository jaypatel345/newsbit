import { topicsData } from "../../data/topicsData";
import TopicCard from "./TopicCard";

export default function TopicsSection() {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[30px] font-semibold text-gray-900">
            Topics You May Like
          </h2>
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            Updated Today
          </span>
        </div>
        <p className="text-[16px] text-gray-600">
          Explore today's news by category.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topicsData.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
