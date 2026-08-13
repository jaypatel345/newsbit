"use client";
import { ChevronDown } from "lucide-react";

interface Source {
  url: string;
  name: string;
}

interface SourcesButtonProps {
  sources: Source[];
  showPopup: boolean;
  onTogglePopup: () => void;
}

export default function SourcesButton({ sources, showPopup, onTogglePopup }: SourcesButtonProps) {
  // Get domain for favicon
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "example.com";
    }
  };

  // Show only first 5 sources
  const displaySources = sources.slice(0, 5);
  const remainingCount = sources.length - 5;

  return (
    <button
      onClick={onTogglePopup}
      className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
    >
      {/* Stacked source icons */}
      <div className="flex items-center">
        {displaySources.map((source, index) => (
          <div
            key={index}
            className="relative"
            style={{
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: displaySources.length - index,
            }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(source.url)}&sz=16`}
              alt={source.name}
              className="w-4 h-4 rounded-full border-2 border-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className="relative w-4 h-4 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-medium text-gray-600"
            style={{ marginLeft: '-8px' }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {/* Sources text */}
      <span className="text-xs font-medium">Sources</span>
      
      {/* Chevron icon */}
      <ChevronDown size={12} className={`transition-transform ${showPopup ? 'rotate-180' : ''}`} />
    </button>
  );
}
