import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat - Newsbit AI",
  description: "Chat with AI to understand news better. Ask questions, get explanations, and explore topics in depth.",
  keywords: ["AI chat", "news assistant", "ask AI", "news questions"],
  openGraph: {
    title: "AI Chat - Newsbit AI",
    description: "Chat with AI to understand news better. Ask questions, get explanations, and explore topics in depth.",
    url: "https://www.newsbit.in/chat",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "AI Chat - Newsbit AI",
    description: "Chat with AI to understand news better. Ask questions, get explanations, and explore topics in depth.",
    images: ["/newsbit_graph.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
