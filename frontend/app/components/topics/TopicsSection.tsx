import { topicsData } from "../../data/topicsData";
import TopicCard from "./TopicCard";

export default function TopicsSection() {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-[30px] font-semibold text-gray-900 mb-4">
          Topics You May Like
        </h2>
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
