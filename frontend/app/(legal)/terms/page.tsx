import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - Newsbit",
  description: "Terms and conditions for using Newsbit.",
  openGraph: {
    title: "Terms of Service - Newsbit",
    description: "Terms and conditions for using Newsbit.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: July 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Newsbit, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Use of the Service
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Newsbit is provided to help you understand news through AI-powered summaries and explanations. You agree to use the service only for its intended purpose and in compliance with all applicable laws and regulations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You may not use the service to: distribute spam, attempt to gain unauthorized access, interfere with the service's operation, or use it for any unlawful purpose.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              AI-Generated Responses Disclaimer
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Newsbit uses artificial intelligence to generate summaries, explanations, and responses. While we strive for accuracy, AI-generated content may occasionally be incomplete, inaccurate, or outdated.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You should not rely solely on AI-generated information for important decisions. Always verify critical information from primary sources and use your own judgment.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              News Accuracy Disclaimer
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Newsbit aggregates news from various sources and provides summaries using AI. We do not guarantee the accuracy, completeness, or timeliness of any news content. News is constantly evolving, and information may change rapidly.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We always provide links to original news sources. We encourage you to read the full articles from their original publishers for the most complete and up-to-date information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              User Responsibilities
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              As a user of Newsbit, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide accurate information when creating an account</li>
              <li>Keep your account credentials secure</li>
              <li>Use the service in a respectful and lawful manner</li>
              <li>Not attempt to circumvent any security measures</li>
              <li>Not use the service to harass, abuse, or harm others</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Newsbit and its original content, features, and functionality are owned by Newsbit and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              News content displayed on Newsbit is owned by the respective publishers and sources. We provide attribution and links to original sources. You may not reproduce, distribute, or create derivative works of news content without permission from the original publishers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You retain ownership of any content you submit to Newsbit, but you grant us a license to use, store, and process that content to provide and improve our service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To the fullest extent permitted by law, Newsbit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              In no event shall Newsbit's total liability to you for all claims exceed the amount you paid, if any, for using the service during the twelve months preceding the claim.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Service Availability
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We strive to maintain high availability of the service, but we do not guarantee that the service will be uninterrupted, secure, or error-free. We may temporarily suspend the service for maintenance, updates, or other reasons.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the service at any time without prior notice.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Termination
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to violation of these terms, suspicious activity, or abuse of the service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You may terminate your account at any time by contacting us or using the account deletion feature in our service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Updates and Modifications
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update or modify the service, including adding or removing features, at any time. We will notify users of significant changes that affect their use of the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Newsbit is operated, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <p className="text-gray-600">
              Email: legal@newsbit.in
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
