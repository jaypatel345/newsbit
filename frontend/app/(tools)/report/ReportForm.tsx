"use client";

import { useState } from "react";

export default function ReportForm() {
  const [formData, setFormData] = useState({
    pageUrl: "",
    issueType: "incorrect-news",
    description: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!formData.description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ pageUrl: "", issueType: "incorrect-news", description: "", email: "" });
    }, 3000);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
          Report an Issue
        </h1>
        <p className="text-xl text-gray-600">
          Help us improve by reporting bugs or issues you encounter.
        </p>
      </div>

      {/* Success Message */}
      {isSubmitted && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-green-800 font-medium">
            Thank you for reporting this issue! We'll look into it.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      {!isSubmitted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page URL */}
          <div>
            <label htmlFor="pageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Page URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              id="pageUrl"
              name="pageUrl"
              value={formData.pageUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="https://newsbit.in/page"
            />
          </div>

          {/* Issue Type */}
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
            >
              <option value="incorrect-news">Incorrect News</option>
              <option value="ai-explanation">AI Explanation Issue</option>
              <option value="broken-link">Broken Link</option>
              <option value="ui-bug">UI Bug</option>
              <option value="performance">Performance Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              We may contact you if we need more information.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      )}
    </>
  );
}
