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
import FinalCTA from "@/app/components/home/FinalCTA";
import Footer from "@/app/components/layout/Footer";
import { PromptProvider } from "@/app/context/PromptContext";

export default function Home() {
  return (
    <PromptProvider>
      <div className="min-h-screen bg-white text-black">
        <NavigationBar />
        <HeroSection />

        {/* Common centered container for Today's Brief, Top Stories, and Topics */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <BriefPreview />
          <TodaysTopStories />
          <TopicsSection />
          <AICapabilities />
        </div>

        {/* <ProductDemo /> */}
        {/* <ExploreByTopic /> */}

        {/* <WhyNewsbit /> */}
        {/* <TrustTransparency /> */}
        {/* <FinalCTA /> */}
        <Footer />
      </div>
    </PromptProvider>
  );
}
