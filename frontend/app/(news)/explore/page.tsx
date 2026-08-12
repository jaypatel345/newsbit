import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import ExploreClient from "./ExploreClient";

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavigationBar />
      <ExploreClient />
      <Footer />
    </div>
  );
}
