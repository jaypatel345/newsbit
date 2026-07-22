import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback - Newsbit",
  description: "Share your feedback with Newsbit to help us improve.",
  openGraph: {
    title: "Feedback - Newsbit",
    description: "Share your feedback with Newsbit to help us improve.",
  },
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20">
        <FeedbackForm />
      </div>
      <Footer />
    </div>
  );
}
