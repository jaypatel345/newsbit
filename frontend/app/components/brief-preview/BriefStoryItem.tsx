import Link from "next/link";

interface BriefStoryItemProps {
  category: string;
  icon: string;
  headline: string;
  summary: string;
  publishedTime: string;
  slug?: string;
}

export default function BriefStoryItem({
  category,
  icon,
  headline,
  summary,
  publishedTime,
  slug,
}: BriefStoryItemProps) {
  const Content = (
    <div className="group py-4 border-b last:border-b-0 transition-all duration-200 hover:bg-gray-50 rounded-lg px-3 -mx-3">
      {/* Category Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
        <span>{icon}</span>
        <span>{category}</span>
      </div>

      {/* Headline */}
      <h4 className="text-base font-semibold mb-1.5 group-hover:underline decoration-2 underline-offset-2" style={{ color: "#1E1E1E", textDecorationColor: "#8A6A3F" }}>
        {headline}
      </h4>

      {/* AI Summary */}
      <p className="text-sm mb-2 leading-relaxed" style={{ color: "#5B4C3A" }}>
        {summary}
      </p>

      {/* Published Time */}
      <div className="text-xs" style={{ color: "#9CA3AF" }}>
        {publishedTime}
      </div>
    </div>
  );

  if (slug) {
    return <Link href={slug}>{Content}</Link>;
  }

  return Content;
}
