interface BriefSummaryCardProps {
  summary: string[];
}

export default function BriefSummaryCard({ summary }: BriefSummaryCardProps) {
  return (
    <div
      className="rounded-2xl p-6 mb-8"
      style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
    >
      {/* AI Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
        style={{ backgroundColor: "#EEF2FF", color: "#6366F1" }}
      >
        <span className="text-sm">✨</span>
        AI Summary
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold mb-4" style={{ color: "#1E1E1E" }}>
        Today&apos;s News at a Glance
      </h3>

      {/* Summary Lines */}
      <ul className="space-y-2.5">
        {summary.map((line, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm leading-relaxed"
            style={{ color: "#5B4C3A" }}
          >
            <span
              className="mt-1.5 w-1 h-1 rounded-full shrink-0"
              style={{ backgroundColor: "#8A6A3F" }}
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
