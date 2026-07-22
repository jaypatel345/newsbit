import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";
import ReportForm from "./ReportForm";

export const metadata: Metadata = {
  title: "Report an Issue - Newsbit",
  description: "Report bugs or issues to the Newsbit team.",
  openGraph: {
    title: "Report an Issue - Newsbit",
    description: "Report bugs or issues to the Newsbit team.",
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
