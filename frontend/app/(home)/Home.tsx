"use client";
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
  return (
    <PromptProvider>
      <div className="min-h-screen bg-white text-black overflow-x-hidden">
        <NavigationBar />

        {/* Full-bleed gradient backdrop for hero + brief header, filling the first screen */}
        <div
          className="relative left-1/2 right-1/2 w-screen -mx-[50vw] min-h-screen flex flex-col justify-center"
          style={{
            backgroundImage:
              "radial-gradient(125% 125% at 50% 101%, rgba(245,87,2,1) 10.5%, rgba(245,120,2,1) 16%, rgba(245,140,2,1) 17.5%, rgba(245,170,100,1) 25%, rgba(238,174,202,1) 40%, rgba(202,179,214,1) 65%, rgba(148,201,233,1) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <HeroSection />
          </div>
        </div>

        {/* Common centered container for Today's Brief, Top Stories, and Topics */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
