import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import AuthInitializer from "./components/AuthInitializer";
import GuestInitializer from "./components/GuestInitializer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "500", "600"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Newsbit AI - AI-Powered News Summaries in Minutes",
    template: "%s | Newsbit AI",
  },
  description:
    "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI. Get today's most important news in minutes.",
  keywords: [
    "AI news",
    "news summaries",
    "daily news",
    "artificial intelligence",
    "news aggregator",
    "quick news",
  ],
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
    description:
      "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI.",
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
    description:
      "Stay informed without the noise. Newsbit AI delivers the top 10 news stories with concise, intelligent summaries powered by AI.",
    images: ["/newsbit_graph.png"],
    site: "@newsbitai",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
    description:
      "AI-powered news summarization platform that delivers the top 10 news stories with concise, intelligent summaries in minutes.",
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
        url: "https://www.newsbit.in/newsbit_logo/newsbit-logo.png",
      },
    },
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full flex flex-col">
        <Providers>
          <AuthInitializer />
          <GuestInitializer />
          {children}
        </Providers>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G7N4FLTFHN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G7N4FLTFHN');
          `}
        </Script>
      </body>
    </html>
  );
}
