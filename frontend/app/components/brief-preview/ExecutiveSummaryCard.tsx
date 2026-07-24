"use client";
import { useTodaySummary } from "@/app/hooks/useTodaySummary";

interface ExecutiveSummaryCardProps {
  summary?: string[];
}

export default function ExecutiveSummaryCard() {
  const { data, isLoading, error } = useTodaySummary();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Something went wrong.</div>;
  }
  return (
    <div
      className="mb-12 rounded-2xl p-8 shadow-sm"
      style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
    >
      {/* Badge */}
      <div className="mb-4">
        <span
          className="inline-block px-3 py-1 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "#8A6A3F", color: "#FFFFFF" }}
        >
          AI Summary
        </span>
      </div>

      {/* Heading */}
      <h2
        className="text-2xl sm:text-3xl font-semibold mb-4"
        style={{ color: "#1E1E1E" }}
      >
        Today&apos;s News Summary
      </h2>

      {/* Summary Text - Bullet Points */}
      <ul className="text-gray-700 text-sm leading-relaxed space-y-2.5">
        {data?.summary.map((point, index) => (
          <li key={index} className="flex items-start gap-3">
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
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
