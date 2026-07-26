import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import ReportForm from "./ReportForm";

export const metadata: Metadata = {
  title: "Report an Issue - Newsbit AI",
  description: "Report bugs or issues to the Newsbit team.",
  keywords: ["report issue", "bug report", "newsbit support", "issue tracking"],
  openGraph: {
    title: "Report an Issue - Newsbit AI",
    description: "Report bugs or issues to the Newsbit team.",
    url: "https://www.newsbit.in/report",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Report an Issue - Newsbit AI",
    description: "Report bugs or issues to the Newsbit team.",
    images: ["/newsbit_graph.png"],
  },
  alternates: {
    canonical: "/report",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20">
        <ReportForm />
      </div>
      <Footer />
    </div>
  );
}
