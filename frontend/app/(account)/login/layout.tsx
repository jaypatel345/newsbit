import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Newsbit AI",
  description: "Sign in to your Newsbit account to access AI-powered news summaries and personalized briefings.",
  keywords: ["login", "sign in", "newsbit account", "AI news"],
  openGraph: {
    title: "Sign In - Newsbit AI",
    description: "Sign in to your Newsbit account to access AI-powered news summaries and personalized briefings.",
    url: "https://www.newsbit.in/login",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Sign In - Newsbit AI",
    description: "Sign in to your Newsbit account to access AI-powered news summaries and personalized briefings.",
    images: ["/newsbit_graph.png"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
