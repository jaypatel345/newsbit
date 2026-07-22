"use client";

import { ArrowRight } from "lucide-react";
import { usePrompt } from "../../context/PromptContext";

const topics = [
  {
    icon: "🤖",
    title: "AI",
    description: "Latest developments in artificial intelligence.",
    prompt: "Explain today's AI news.",
  },
  {
    icon: "🌍",
    title: "World",
    description: "Global events and international news.",
    prompt: "What happened in the world today?",
  },
  {
    icon: "💰",
    title: "Business",
    description: "Corporate news and economic updates.",
    prompt: "Summarize today's business news.",
  },
  {
    icon: "📈",
    title: "Markets",
    description: "Stock markets and financial trends.",
    prompt: "What's happening in the markets today?",
  },
  {
    icon: "🇮🇳",
    title: "India",
    description: "News from across India.",
    prompt: "What happened in India today?",
  },
  {
    icon: "⚽",
    title: "Sports",
    description: "Latest sports news and highlights.",
    prompt: "Give me today's sports highlights.",
  },
  {
    icon: "🏥",
    title: "Health",
    description: "Medical breakthroughs and health news.",
    prompt: "What's new in health today?",
  },
  {
    icon: "🔬",
    title: "Science",
    description: "Scientific discoveries and research.",
    prompt: "Explain today's science news.",
  },
  {
    icon: "🌱",
    title: "Climate",
    description: "Environmental news and climate updates.",
    prompt: "What's happening with climate today?",
  },
  {
    icon: "₿",
    title: "Crypto",
    description: "Cryptocurrency and blockchain news.",
    prompt: "What's happening in crypto today?",
  },
  {
    icon: "🎬",
    title: "Entertainment",
    description: "Movies, music, and celebrity news.",
    prompt: "What's new in entertainment today?",
  },
  {
    icon: "🚀",
    title: "Technology",
    description: "Latest innovations and product launches.",
    prompt: "What happened in technology today?",
  },
];

export default function ExploreByTopic() {
  const { setPrompt } = usePrompt();

  const handleTopicClick = (prompt: string) => {
    setPrompt(prompt);
    // Scroll to the floating input
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <section id="explore" className="py-28 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-blue-600 mb-4">
            Explore
          </span>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
            Choose a topic. Start a conversation.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the latest news across different topics and ask AI anything to
            get summaries, explanations, and deeper context.
          </p>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(topic.prompt)}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer text-left"
            >
              {/* Icon */}
              <div className="text-3xl mb-4">{topic.icon}</div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {topic.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {topic.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center text-blue-600">
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Can't find your topic?</p>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-all duration-200"
          >
            Start chatting
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
