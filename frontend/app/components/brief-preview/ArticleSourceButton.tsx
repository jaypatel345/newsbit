"use client";
import { ExternalLink } from "lucide-react";

interface ArticleSourceButtonProps {
  articleUrl: string;
  sourceName: string;
}

export default function ArticleSourceButton({ articleUrl, sourceName }: ArticleSourceButtonProps) {
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
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <a
      href={articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs font-medium text-gray-700 mt-1"
    >
      <img
        src={faviconUrl}
        alt={sourceName}
        className="w-4 h-4"
        onError={(e) => {
          // Fallback if favicon fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
      <span className="lowercase">{sourceName}</span>
      <ExternalLink size={12} className="text-gray-500" />
    </a>
  );
}
