interface ExecutiveSummaryCardProps {
  summary?: string;
}

export default function ExecutiveSummaryCard({
  summary = "Today&apos;s news landscape is dominated by significant developments across technology, business, and global affairs. The technology sector saw major announcements from leading AI companies, with breakthrough innovations in machine learning and natural language processing capturing investor attention. Markets responded positively to these developments, with tech stocks leading gains across major indices. In India, economic indicators showed strong performance, with manufacturing and services sectors contributing to robust GDP growth. On the global stage, climate discussions intensified as world leaders gathered to discuss carbon reduction targets, while sports delivered unexpected outcomes that reshaped tournament standings. Scientific breakthroughs in carbon capture technology offered promising solutions for environmental challenges, marking a significant step forward in sustainable innovation.",
}: ExecutiveSummaryCardProps) {
  return (
    <div className="mb-12 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
      {/* Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#8A6A3F", color: "#FFFFFF" }}>
          AI Summary
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ color: "#1E1E1E" }}>
        Today&apos;s News at a Glance
      </h2>

      {/* Summary Text */}
      <p className="text-base leading-relaxed" style={{ color: "#5B4C3A" }}>
        {summary}
      </p>
    </div>
  );
}
