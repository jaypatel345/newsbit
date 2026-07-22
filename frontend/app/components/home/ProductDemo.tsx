"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, ExternalLink, ArrowRight } from "lucide-react";

export default function ProductDemo() {
  const [showAIResponse, setShowAIResponse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAIResponse(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side */}
          <div className="lg:pr-12">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
              See Newsbit in action.
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Ask a question about today's news and instantly receive summaries,
              context, related stories, and trusted sources.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-all duration-200"
            >
              Try Newsbit
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Right Side - Chat Preview */}
          <div className="lg:pl-12">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 sm:p-8">
              {/* User Message */}
              <div className="flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4">
                    <p className="text-gray-900">Why is oil increasing?</p>
                  </div>
                </div>
              </div>

              {/* AI Response */}
              {showAIResponse && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">N</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-2xl rounded-tl-none px-5 py-4 mb-4">
                        <p className="text-gray-900 leading-relaxed">
                          Oil prices are rising due to reduced supply expectations,
                          geopolitical tensions, and increased global demand.
                        </p>
                      </div>

                      {/* This could affect */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          This could affect
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            Inflation
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            Stock Market
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            Petrol prices
                          </li>
                        </ul>
                      </div>

                      {/* Related Stories */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Related Stories
                        </p>
                        <div className="space-y-2">
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            OPEC production meeting
                          </div>
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            Russia exports
                          </div>
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            Middle East tensions
                          </div>
                        </div>
                      </div>

                      {/* Sources */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                            <span>Reuters</span>
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                            <span>Bloomberg</span>
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                            <span>CNBC</span>
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Placeholder */}
              <div className="mt-8 aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Play size={24} className="text-gray-500 ml-1" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Product Demo Video
                </p>
                <p className="text-xs text-gray-500">Video will be added later</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
