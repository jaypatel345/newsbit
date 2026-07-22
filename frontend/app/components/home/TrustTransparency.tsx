import { Clock, Newspaper, Bot, Link2 } from "lucide-react";

const trustItems = [
  {
    icon: Clock,
    title: "Frequently Updated",
    description:
      "Updated every few minutes to keep you informed with the latest developments.",
  },
  {
    icon: Newspaper,
    title: "Trusted Sources",
    description:
      "150+ verified publishers and news sources analyzed daily.",
  },
  {
    icon: Bot,
    title: "AI Summaries",
    description: "Read concise, accurate summaries in seconds.",
  },
  {
    icon: Link2,
    title: "Source Transparency",
    description:
      "Every AI answer includes links back to the original reporting.",
  },
];

export default function TrustTransparency() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-blue-600 mb-4">
            Trust & Transparency
          </span>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Trusted by readers who want facts, not endless scrolling.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every answer is backed by trusted reporting, AI-powered analysis, and
            transparent sources so you always know where information comes from.
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
              >
                {/* Icon */}
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={32} className="text-gray-700" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
