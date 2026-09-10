"use client";

import { useState } from "react";

/**
 * Inline SVG placeholder shown when an article has no image and no usable
 * source domain (or when every fallback also fails to load).
 */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
      <rect width="160" height="120" fill="#f3f4f6"/>
      <g fill="none" stroke="#c7ccd1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <rect x="52" y="40" width="56" height="44" rx="4"/>
        <line x1="62" y1="54" x2="98" y2="54"/>
        <line x1="62" y1="64" x2="98" y2="64"/>
        <line x1="62" y1="74" x2="84" y2="74"/>
      </g>
    </svg>`,
  );

export function getSourceLogoUrl(domain?: string | null): string | null {
  if (!domain || !domain.trim()) return null;
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
    domain,
  )}&sz=64`;
}

interface ArticleImageProps {
  /** The article's own image. May be missing, empty, or a broken link. */
  src?: string | null;
  alt: string;
  /** Source site URL/hostname, used to fall back to the publisher's favicon. */
  domain?: string | null;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Article thumbnail that degrades gracefully:
 *   article image -> publisher favicon -> generic placeholder.
 *
 * Each candidate is tried once; when it errors we advance to the next. The
 * errored set is keyed by URL so a re-render with a new `src` starts over.
 */
export default function ArticleImage({
  src,
  alt,
  domain,
  className,
  loading = "lazy",
}: ArticleImageProps) {
  const [errored, setErrored] = useState<Record<string, true>>({});

  const candidates = [
    src && src.trim() ? src.trim() : null,
    getSourceLogoUrl(domain),
    PLACEHOLDER_IMAGE,
  ].filter((value): value is string => Boolean(value));

  const current =
    candidates.find((candidate) => !errored[candidate]) ?? PLACEHOLDER_IMAGE;

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        setErrored((prev) =>
          prev[current] ? prev : { ...prev, [current]: true },
        );
      }}
    />
  );
}
