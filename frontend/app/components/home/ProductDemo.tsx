"use client";
import { useState } from "react";
import { BookOpen, BarChart3, Scale, Clock, Lightbulb } from "lucide-react";

type FeatureType = "explain" | "analyze" | "compare" | "timeline" | "takeaways";

const features = [
  { id: "explain" as FeatureType, label: "Explain", icon: BookOpen },
  { id: "analyze" as FeatureType, label: "Analyze", icon: BarChart3 },
  { id: "compare" as FeatureType, label: "Compare", icon: Scale },
  { id: "timeline" as FeatureType, label: "Timeline", icon: Clock },
  { id: "takeaways" as FeatureType, label: "Key Takeaways", icon: Lightbulb },
];

const featureContent = {
  explain: {
    prompt: "Explain the recent tech layoffs in simple terms",
    output: "Tech companies are reducing their workforce due to economic uncertainty and over-hiring during the pandemic. Many firms expanded rapidly when demand surged, but now face slower growth and higher costs.",
  },
  analyze: {
    prompt: "Analyze the impact of interest rate hikes",
    output: "Interest rate increases are cooling inflation but also slowing economic growth. Higher borrowing costs affect mortgages, business loans, and consumer spending, potentially leading to reduced investment and hiring.",
  },
  compare: {
    prompt: "Compare electric vs gas vehicles",
    output: "Electric vehicles offer lower operating costs and zero emissions but have higher upfront prices. Gas vehicles provide longer range and faster refueling but contribute to pollution and have higher fuel costs over time.",
  },
  timeline: {
    prompt: "Timeline of the Ukraine conflict",
    output: "February 2022: Russia invades Ukraine. March 2022: International sanctions imposed. Ongoing: Continued fighting, humanitarian crisis, and global economic impact including energy and food security concerns.",
  },
  takeaways: {
    prompt: "Key takeaways from today's climate report",
    output: "Global temperatures continue rising, with 2023 being the hottest year on record. Extreme weather events are becoming more frequent. Urgent action needed to reduce emissions and adapt to changes.",
  },
};

export default function ProductDemo() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>("explain");

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Heading */}
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <h2 className="text-[30px] font-semibold text-gray-900 mb-4">
            See what Newsbit can do
          </h2>
          <p className="text-[16px] text-gray-600">
            Go beyond headlines with AI-powered insights.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center mb-10">
          <div className="inline-flex p-0.5 bg-gray-100 rounded-2xl border border-gray-200">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300
                    ${isSelected 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 cursor-pointer"
                    }
                  `}
                >
                  <Icon size={14} />
                  <span>{feature.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="relative">
          {/* AI Output Panel (Full Width) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-sm h-[500px] overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">N</span>
              </div>
              <span className="font-medium text-gray-700">Newsbit AI</span>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-gray-800 leading-relaxed text-lg">
                {featureContent[selectedFeature].output}
              </p>
            </div>
          </div>

          {/* User Prompt Panel (Absolute Positioned on Top Right) */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-2xl p-5 border border-gray-200 shadow-lg w-xs h-[200px] translate-x-1/2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">U</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Your Prompt</span>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
              <p className="text-gray-700 text-sm leading-relaxed">
                {featureContent[selectedFeature].prompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
