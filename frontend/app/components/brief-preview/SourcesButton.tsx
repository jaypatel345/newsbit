"use client";
import { ChevronDown } from "lucide-react";

export interface Source {
  url: string;
  name: string;
  hostname: string;
}

interface SourcesButtonProps {
  sources: Source[];
  onClick?: () => void;
  isOpen?: boolean;
}

export default function SourcesButton({ sources, onClick, isOpen }: SourcesButtonProps) {
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
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors ${isOpen ? 'bg-gray-100' : ''}`}
    >
      {/* Stacked source */}
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
              src={`https://www.google.com/s2/favicons?domain=${getDomain(source.url)}&sz=24`}
              alt={source.name}
              className="w-5 h-5 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className="relative w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-medium text-gray-600"
            style={{ marginLeft: '-8px' }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {/* Sources text */}
      <span className="text-xs font-medium">Sources</span>
      
      {/* Chevron icon */}
      <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}
