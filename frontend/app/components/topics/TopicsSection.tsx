import { topicsData } from "../../data/topicsData";
import TopicCard from "./TopicCard";

export default function TopicsSection() {
  return (
    <section className="py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3 sm:mb-4">
          Topics You May Like
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          Explore today's news by category.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {topicsData.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
