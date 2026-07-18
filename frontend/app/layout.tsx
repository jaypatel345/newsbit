import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Newsbit AI - AI-Powered News Summaries in Minutes",
    template: "%s | Newsbit AI",
  },
  description: "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI. Get today's most important news in minutes.",
  keywords: ["AI news", "news summaries", "daily news", "artificial intelligence", "news aggregator", "quick news"],
  authors: [{ name: "Newsbit AI" }],
  creator: "Newsbit AI",
  publisher: "Newsbit AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.newsbit.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.newsbit.in",
    title: "Newsbit AI - AI-Powered News Summaries in Minutes",
    description: "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI.",
    siteName: "Newsbit AI",
    images: [
      {
        url: "/newsbit_graph.png",
        width: 1200,
        height: 630,
        alt: "Newsbit AI - AI-Powered News Summaries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsbit AI - AI-Powered News Summaries in Minutes",
    description: "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI.",
    images: ["/newsbit_graph.png"],
    creator: "@newsbitai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Newsbit AI",
    url: "https://www.newsbit.in",
    description: "AI-powered news summarization platform that delivers the top 10 news stories with concise, intelligent summaries in minutes.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.newsbit.in/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Newsbit AI",
      url: "https://www.newsbit.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.newsbit.in/newsbit_logo.png",
      },
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
