import { Metadata } from "next";
import Link from "next/link";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact - Newsbit",
  description: "Get in touch with the Newsbit team for inquiries, partnerships, or support.",
  openGraph: {
    title: "Contact - Newsbit",
    description: "Get in touch with the Newsbit team for inquiries, partnerships, or support.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Have questions, feedback, or partnership ideas? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 mb-16">
          {/* Support */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Support
            </h2>
            <p className="text-gray-600 mb-4">
              For technical issues, bugs, or help using Newsbit.
            </p>
            <a
              href="mailto:support@newsbit.in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@newsbit.in
            </a>
          </div>

          {/* Founder */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Founder
            </h2>
            <p className="text-gray-600 mb-4">
              Direct contact with the founder for any inquiries.
            </p>
            <a
              href="mailto:jaypatel210776@gmail.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              jaypatel210776@gmail.com
            </a>
          </div>
        </div>

        {/* Social Links */}
        <section className="border-t border-gray-200 pt-12 mb-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Follow Us
          </h2>
          <div className="flex gap-4">
            <a
              href="https://github.com/jaypatel345/newsbit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter)
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </section>

        {/* Alternative Contact */}
        <section className="border-t border-gray-200 pt-12">
          <p className="text-gray-600 mb-4">
            Prefer to send feedback or report an issue directly?
          </p>
          <div className="flex gap-4">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Send Feedback
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Report an Issue
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
