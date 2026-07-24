import BriefClient from "@/app/components/brief-preview/BriefClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Brief | Newsbit AI",
  description:
    "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  openGraph: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
    url: "https://www.newsbit.in/brief",
  },
  twitter: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  },
};

export default function BriefPage() {
  return <BriefClient />;
}
