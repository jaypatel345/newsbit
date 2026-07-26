import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Newsbit AI",
  description: "Create your Newsbit account to get AI-powered news summaries and personalized briefings.",
  keywords: ["signup", "register", "create account", "AI news"],
  openGraph: {
    title: "Sign Up - Newsbit AI",
    description: "Create your Newsbit account to get AI-powered news summaries and personalized briefings.",
    url: "https://www.newsbit.in/signup",
    images: ["/newsbit_graph.png"],
  },
  twitter: {
    title: "Sign Up - Newsbit AI",
    description: "Create your Newsbit account to get AI-powered news summaries and personalized briefings.",
    images: ["/newsbit_graph.png"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
