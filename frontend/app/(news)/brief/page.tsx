import BriefClient from "@/app/components/brief-preview/BriefClient";
import { Metadata } from "next";

const newsCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Today's Brief - Newsbit AI",
  "description": "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  "url": "https://www.newsbit.in/brief",
  "publisher": {
    "@type": "Organization",
    "name": "Newsbit AI",
    "url": "https://www.newsbit.in",
    "logo": "https://www.newsbit.in/newsbit_logo/high-resolution-logo-grayscale (1).png",
  },
};

export const metadata: Metadata = {
  title: "Today's Brief | Newsbit AI",
  description:
    "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  keywords: ["daily brief", "news summary", "AI brief", "today's news", "news digest"],
  openGraph: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
    url: "https://www.newsbit.in/brief",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
    images: ["/newsbit_graph.png"],
  },
  alternates: {
    canonical: "/brief",
  },
};

export default function BriefPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsCollectionSchema) }}
      />
      <BriefClient />
    </>
  );
}
