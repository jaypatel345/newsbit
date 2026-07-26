import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore News - Newsbit AI",
  description: "Explore news by category. Browse stories from World, AI, Business, Markets, India, Sports, Health, Science and more.",
  keywords: ["explore news", "news categories", "world news", "AI news", "business news", "india news"],
  openGraph: {
    title: "Explore News - Newsbit AI",
    description: "Explore news by category. Browse stories from World, AI, Business, Markets, India, Sports, Health, Science and more.",
    url: "https://www.newsbit.in/explore",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Explore News - Newsbit AI",
    description: "Explore news by category. Browse stories from World, AI, Business, Markets, India, Sports, Health, Science and more.",
    images: ["/newsbit_graph.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
