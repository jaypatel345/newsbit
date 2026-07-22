import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ViewFullBriefCTA() {
  return (
    <Link
      href="/brief"
      className="inline-flex items-center gap-2 text-base font-semibold transition-all duration-200 group"
      style={{ color: "#8A6A3F" }}
    >
      <span className="group-hover:underline decoration-2 underline-offset-4">
        View Full Brief
      </span>
      <ArrowRight 
        size={18} 
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
