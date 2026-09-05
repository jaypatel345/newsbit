"use client";
import { useState, useEffect } from "react";
import NavigationBar from "@/app/components/layout/NavigationBar";
import HeroSection from "@/app/components/home/HeroSection";
import BriefPreview from "@/app/components/brief-preview/BriefPreview";
import TodaysTopStories from "@/app/components/home/TodaysTopStories";
import TopicsSection from "@/app/components/topics/TopicsSection";
import WhyNewsbit from "@/app/components/home/WhyNewsbit";
import ProductDemo from "@/app/components/home/ProductDemo";
import ExploreByTopic from "@/app/components/home/ExploreByTopic";
import AICapabilities from "@/app/components/home/AICapabilities";
import TrustTransparency from "@/app/components/home/TrustTransparency";
import Footer from "@/app/components/layout/Footer";
import { PromptProvider } from "@/app/context/PromptContext";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PromptProvider>
        <div className="min-h-screen bg-white text-black overflow-x-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      </PromptProvider>
    );
  }

  return (
    <PromptProvider>
      <div className="min-h-screen bg-white text-black overflow-x-hidden">
        <NavigationBar />

        {/* Common centered container for Today's Brief, Top Stories, and Topics */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HeroSection />
          <BriefPreview />
          <TodaysTopStories />
          <TopicsSection />
          {/* <ExploreByTopic />
          <AICapabilities /> */}
          {/* <ProductDemo /> */}
        </div>

        {/* <WhyNewsbit /> */}
        {/* <TrustTransparency /> */}

        <Footer />
      </div>
    </PromptProvider>
  );
}
