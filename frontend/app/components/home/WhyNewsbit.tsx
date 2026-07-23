import { FileText, Link2, MessageSquare, Clock, ArrowRight, Globe } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Summary",
    description: "Read every story in under 30 seconds.",
  },
  {
    icon: Globe,
    title: "Context",
    description: "Understand why this event matters and what led to it.",
  },
  {
    icon: Link2,
    title: "Related Stories",
    description: "Discover connected events and follow the bigger picture.",
  },
  {
    icon: Clock,
    title: "Source Links",
    description: "Read the original reporting from trusted publishers.",
  },
  {
    icon: MessageSquare,
    title: "Ask AI",
    description: "Continue asking questions naturally like you're chatting with an expert.",
  },
  {
    icon: ArrowRight,
    title: "Timeline",
    description: "Explore how the story developed over time.",
  },
];

export default function WhyNewsbit() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-medium text-blue-600 mb-4">
            Why Newsbit
          </span>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Understand beyond the headline.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Go beyond summaries with AI-powered explanations, context, and
            conversations that help you truly understand today's news.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-250 cursor-pointer"
              >
                {/* Icon */}
                <div className="mb-6 group-hover:scale-110 transition-transform duration-250">
                  <Icon size={32} className="text-gray-700" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Learn More Arrow */}
                <div className="flex items-center gap-2 text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                  <span>Learn more</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-250" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
