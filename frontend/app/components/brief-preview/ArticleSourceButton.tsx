"use client";
import { ExternalLink } from "lucide-react";

interface ArticleSourceButtonProps {
  articleUrl: string;
  sourceName: string;
  showText?: boolean;
}

export default function ArticleSourceButton({ articleUrl, sourceName, showText = true }: ArticleSourceButtonProps) {
  // Extract domain from URL for favicon
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "example.com";
    }
  };

  const domain = getDomain(articleUrl);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

  return (
    <a
      href={articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-[10px] font-medium text-gray-700 mt-1 ml-2"
    >
      <img
        src={faviconUrl}
        alt={sourceName}
        className="w-3 h-3"
        onError={(e) => {
          // Fallback if favicon fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
      {showText && <span className="lowercase">{sourceName}</span>}
      {showText && <ExternalLink size={10} className="text-gray-500" />}
    </a>
  );
}
