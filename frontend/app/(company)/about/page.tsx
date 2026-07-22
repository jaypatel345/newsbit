import { Metadata } from "next";
import Link from "next/link";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "About - Newsbit",
  description: "Learn about Newsbit's mission to make news understandable through AI-powered summaries and explanations.",
  openGraph: {
    title: "About - Newsbit",
    description: "Learn about Newsbit's mission to make news understandable through AI-powered summaries and explanations.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            About Newsbit
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Making news understandable, one summary at a time.
          </p>
        </div>

        {/* What is Newsbit */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What is Newsbit
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Newsbit is an AI-powered news assistant that helps you understand today's news through concise summaries, clear explanations, and natural conversation. We believe that staying informed shouldn't require hours of reading or a degree in current events.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our AI analyzes news from trusted sources, identifies the most important stories, and presents them in a way that's easy to digest. Whether you have 5 minutes or 30, Newsbit helps you stay informed without the noise.
          </p>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            To make news accessible to everyone by removing complexity, reducing noise, and providing context that helps you understand not just what happened, but why it matters.
          </p>
        </section>

        {/* Why Newsbit exists */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Newsbit Exists
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The modern news landscape is overwhelming. Thousands of stories are published daily, across countless sources, with varying degrees of reliability and relevance. Even when you find good journalism, the sheer volume can be paralyzing.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Newsbit exists to solve this problem. We use AI to curate, summarize, and explain the news, so you can stay informed without drowning in information. We're not replacing journalism—we're making it more accessible.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What Makes Newsbit Different
          </h2>
          <div className="space-y-6">
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI-Powered Explanations
              </h3>
              <p className="text-gray-600">
                Our AI doesn't just summarize—it explains complex topics in simple terms, providing context that helps you truly understand the story.
              </p>
            </div>
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Daily Briefings
              </h3>
              <p className="text-gray-600">
                Get a curated selection of the most important stories each day, summarized in a format you can read in minutes.
              </p>
            </div>
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Trusted Sources
              </h3>
              <p className="text-gray-600">
                We source news from reputable publications and always provide links to original articles so you can read more if you want.
              </p>
            </div>
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conversation-Based Learning
              </h3>
              <p className="text-gray-600">
                Ask questions, request clarifications, and explore topics deeper through natural conversation with our AI.
              </p>
            </div>
            <div className="border-l-2 border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Fast & Distraction-Free
              </h3>
              <p className="text-gray-600">
                No ads, no clickbait, no endless scrolling. Just the news you need, presented clearly and efficiently.
              </p>
            </div>
          </div>
        </section>

        {/* Our Principles */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Our Principles
          </h2>
          <div className="bg-gray-50 rounded-2xl p-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-600"><strong className="text-gray-900">Accuracy over speed</strong> — We prioritize getting it right over being first.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-600"><strong className="text-gray-900">Explain, don't confuse</strong> — If a story is complex, we break it down until it makes sense.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-600"><strong className="text-gray-900">AI assists, humans verify</strong> — AI helps us process information, but we believe in human journalism.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-600"><strong className="text-gray-900">Multiple perspectives</strong> — We strive to present balanced viewpoints on important issues.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-600"><strong className="text-gray-900">Respect reader privacy</strong> — Your reading habits are your business. We don't sell your data.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-200 pt-12">
          <p className="text-gray-600 mb-6">
            Ready to experience a better way to stay informed?
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Try Newsbit
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  );
}
