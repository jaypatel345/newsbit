import { Metadata } from "next";
import Home from "@/app/(home)/Home";

export const metadata: Metadata = {
  title: "Home",
  description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
  openGraph: {
    title: "Newsbit AI - Home",
    description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
    url: "https://www.newsbit.in/",
  },
  twitter: {
    title: "Newsbit AI - Home",
    description: "Get today's top 10 news stories with AI-powered summaries. Stay informed in minutes with Newsbit AI's intelligent news curation.",
  },
};

export default function Page() {
  return <Home />;
}
