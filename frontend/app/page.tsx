import { Metadata } from "next";
import Home from "@/app/(home)/Home";

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Newsbit AI - AI-Powered News Summaries in Minutes",
  "description": "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
  "url": "https://www.newsbit.in",
  "publisher": {
    "@type": "Organization",
    "name": "Newsbit AI",
    "url": "https://www.newsbit.in",
    "logo": "https://www.newsbit.in/newsbit_logo/newsbit-logo.png",
  },
};

export const metadata: Metadata = {
  title: "AI-Powered News Summaries in Minutes",
  description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
  keywords: ["AI news", "news summaries", "daily news", "breaking news", "news aggregator"],
  openGraph: {
    title: "Newsbit AI - AI-Powered News Summaries in Minutes",
    description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
    url: "https://www.newsbit.in/",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Newsbit AI - AI-Powered News Summaries in Minutes",
    description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
    images: ["/newsbit_graph.png"],
    site: "@newsbitai",
    creator: "@newsbitai",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Home />
    </>
  );
}
