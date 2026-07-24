"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTodaySummary } from "@/app/hooks/useTodaySummary";

export default function BriefPreview() {
  const { data, isLoading, error } = useTodaySummary();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Something went wrong.</div>;
  }

  return (
    <section id="brief-preview" className="py-12">
      {/* Header */}

      <div className="mb-8 text-center">
        <h2 className="text-[30px] font-semibold text-gray-900 mb-3">
          Today&apos;s Brief
        </h2>
        <p className="text-[16px] text-gray-600">
          Understand today&apos;s biggest stories in about 2 minutes.
        </p>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        {/* AI Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 bg-blue-50 text-blue-700">
          <span className="text-sm">✨</span>
          2-Minute AI Brief
        </div>

        {/* Preview Text - Bullet Points */}

        <ul className="text-gray-700 text-sm leading-relaxed mb-6 space-y-2.5">
          {data?.summary.map((item, index) => (
            <div>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-900 mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="6" />
                </svg>
                <span>{item}</span>
              </li>
            </div>
          ))}
        </ul>

        {/* Footer with metadata and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">10 stories</span>
            <span>•</span>
            <span>2 min read</span>
          </div>
          <Link
            href="/brief"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>Read Brief</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
