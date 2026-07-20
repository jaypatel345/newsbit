import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white pt-24 pb-16">
      <div className="max-w-300 mx-auto px-6 sm:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Left Section */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Newsbit
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              AI-powered news assistant that helps you understand today's news
              through summaries, context, and conversation.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                Twitter
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Center Section - Product */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/brief"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Today's Brief
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/topics"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Topics
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Ask AI
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Chat History
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Feedback
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 transition-all duration-200"
                >
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Newsbit. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with AI • Made for curious readers
          </p>
        </div>
      </div>
    </footer>
  );
}
