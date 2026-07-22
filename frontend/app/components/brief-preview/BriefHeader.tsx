import { Clock } from "lucide-react";

interface BriefHeaderProps {
  updatedTime?: string;
  storyCount?: number;
  readTime?: string;
}

export default function BriefHeader({
  updatedTime = "8:00 AM",
  storyCount = 10,
  readTime = "2 min",
}: BriefHeaderProps) {
  return (
    <div className="mb-12">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-semibold mb-3" style={{ color: "#1E1E1E" }}>
        Today&apos;s Brief
      </h1>

      {/* Subtitle */}
      <p className="text-lg mb-4" style={{ color: "#5B4C3A" }}>
        Understand today&apos;s biggest stories in about 2 minutes.
      </p>

      {/* Meta Information */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "#5B4C3A" }}>
        <Clock size={16} style={{ color: "#8A6A3F" }} />
        <span>Updated {updatedTime}</span>
        <span style={{ color: "#8A6A3F" }}>•</span>
        <span>{storyCount} Stories</span>
        <span style={{ color: "#8A6A3F" }}>•</span>
        <span>{readTime} read</span>
      </div>
    </div>
  );
}
