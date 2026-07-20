import NavigationBar from "../components/NavigationBar";
import HeroSection from "../components/HeroSection";
import TodaysBrief from "../components/TodaysBrief";
import TodaysTopStories from "../components/TodaysTopStories";
import WhyNewsbit from "../components/WhyNewsbit";
import ProductDemo from "../components/ProductDemo";
import ExploreByTopic from "../components/ExploreByTopic";
import AICapabilities from "../components/AICapabilities";
import TrustTransparency from "../components/TrustTransparency";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />
      <HeroSection />
      <TodaysBrief />
      <TodaysTopStories />
      <WhyNewsbit />
      <ProductDemo />
      <ExploreByTopic />
      <AICapabilities />
      <TrustTransparency />
      <FinalCTA />
      <Footer />
    </div>
  );
}
