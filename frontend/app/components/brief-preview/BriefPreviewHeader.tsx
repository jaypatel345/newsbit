import { Clock } from "lucide-react";

interface BriefPreviewHeaderProps {
  updatedTime: string;
  storyCount: number;
  readTime: string;
}

export default function BriefPreviewHeader({
  updatedTime,
  storyCount,
  readTime,
}: BriefPreviewHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-4xl sm:text-5xl font-semibold mb-3" style={{ color: "#1E1E1E" }}>
        Today&apos;s Brief
      </h2>
      <p className="text-base mb-4" style={{ color: "#5B4C3A" }}>
        Understand today&apos;s biggest stories in about 2 minutes.
      </p>
      <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: "#5B4C3A" }}>
        <Clock size={14} style={{ color: "#8A6A3F" }} />
        <span>Updated {updatedTime}</span>
        <span style={{ color: "#8A6A3F" }}>•</span>
        <span>{storyCount} Stories</span>
        <span style={{ color: "#8A6A3F" }}>•</span>
        <span>{readTime} min read</span>
      </div>
    </div>
  );
}
