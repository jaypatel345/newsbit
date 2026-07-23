"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const topics = [
  {
    title: "AI",
    question: "What's the biggest AI news today?",
    time: "4 hours ago",
  },
  {
    title: "Technology",
    question: "What was announced this week?",
    time: "2 hours ago",
  },
  {
    title: "Business",
    question: "Why is the stock market moving?",
    time: "1 hour ago",
  },
  {
    title: "India",
    question: "What happened in India today?",
    time: "3 hours ago",
  },
  {
    title: "World",
    question: "What's happening around the world?",
    time: "5 hours ago",
  },
  {
    title: "Sports",
    question: "Who won today's biggest matches?",
    time: "2 hours ago",
  },
  {
    title: "Science",
    question: "Explain the latest scientific discovery.",
    time: "6 hours ago",
  },
  {
    title: "Health",
    question: "What's the latest health news?",
    time: "4 hours ago",
  },
  {
    title: "Entertainment",
    question: "What are people talking about today?",
    time: "1 hour ago",
  },
];

export default function ExploreByTopic() {
  const router = useRouter();

  const handleTopicClick = (topic: string) => {
    router.push(`/chat?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <section id="explore" className="py-24 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-[30px] font-semibold text-gray-900 mb-4">
            Chat by Topic
          </h2>
          <p className="text-[16px] text-gray-600 mb-4">
            Choose a topic. Start a conversation.
          </p>
          <p className="text-[16px] text-gray-600">
            Select a news topic and ask AI anything about the latest stories. Newsbit will automatically use that topic as the conversation context.
          </p>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-3 gap-5">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(topic.title)}
              className="group bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer text-left"
            >
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {topic.title}
              </h3>

              {/* Example Question */}
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {topic.question}
              </p>

              {/* Open Chat */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{topic.time}</span>
                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
                  Open Chat
                  <ArrowRight
                    size={16}
                    className="ml-1"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
