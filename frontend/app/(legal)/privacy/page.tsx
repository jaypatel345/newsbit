import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Newsbit",
  description: "Learn about how Newsbit protects your privacy and handles your data.",
  openGraph: {
    title: "Privacy Policy - Newsbit",
    description: "Learn about how Newsbit protects your privacy and handles your data.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: July 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Newsbit, we take your privacy seriously. This policy explains how we collect, use, and protect your information when you use our service. We believe in transparency and want you to understand exactly what happens with your data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect information to provide and improve our service. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Account information:</strong> When you sign up, we collect your email address and any information you choose to provide in your profile.</li>
              <li><strong>Usage data:</strong> We collect information about how you use Newsbit, including pages you visit, features you use, and your interactions with our AI.</li>
              <li><strong>Conversations:</strong> Your chat history with our AI is stored to provide context and improve your experience.</li>
              <li><strong>Technical data:</strong> We collect device information, browser type, IP address, and other technical details to ensure our service works properly.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide and improve the Newsbit service</li>
              <li>Personalize your news experience</li>
              <li>Process your AI requests and conversations</li>
              <li>Analyze usage patterns to improve our features</li>
              <li>Communicate with you about service updates</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              AI Requests and Conversations
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you interact with our AI, your conversations are stored to provide context and improve the quality of responses. We may use anonymized conversation data to train and improve our AI models. We never sell your individual conversations to third parties.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              News Searches and Content
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Newsbit searches and aggregates news from publicly available sources. We do not claim ownership of news content and always provide attribution and links to original sources. Your news searches and reading preferences help us personalize your experience.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cookies and Analytics
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Remember your preferences and keep you logged in</li>
              <li>Analyze how people use Newsbit to improve the service</li>
              <li>Understand which features are most popular</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can control cookies through your browser settings, though this may affect some features of our service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use third-party services to help operate Newsbit, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Cloud hosting providers to store and process data</li>
              <li>Analytics services to understand usage patterns</li>
              <li>Email services to communicate with you</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We carefully select these partners and ensure they protect your data. We never sell your data to third parties for advertising purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Storage and Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We store your data securely using industry-standard encryption and security practices. We regularly review and update our security measures to protect your information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of certain data collection</li>
              <li>Export your data</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@newsbit.in
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your data for as long as necessary to provide our service and for legitimate business purposes. When you delete your account, we will delete your personal information unless we are required to keep it for legal or security reasons.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Newsbit is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it promptly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes by email or by posting a notice on our service. Your continued use of Newsbit after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about this privacy policy or how we handle your data, please contact us:
            </p>
            <p className="text-gray-600">
              Email: privacy@newsbit.in
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
