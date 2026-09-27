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
      <rect width="160" height="120" fill="#F0F0EB"/>
      <g fill="none" stroke="#C9C3B5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
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

  const markErrored = () =>
    setErrored((prev) => (prev[current] ? prev : { ...prev, [current]: true }));

  // The favicon service hands back a 64px canvas for every domain, but what
  // sits inside it is the publisher's choice: Nature fills the whole square,
  // others centre a small glyph in transparent margin. Sizing the <img> to
  // the thumbnail preserves that difference and multiplies it by the box, so
  // one source reads as a billboard and the next as a speck. Pinning it to a
  // fixed badge instead bounds the variance to 32px, where it stops mattering.
  const isSourceLogo = current !== candidates[0] && current !== PLACEHOLDER_IMAGE;

  if (isSourceLogo) {
    return (
      <span
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F0F0EB",
        }}
      >
        <img
          src={current}
          alt={alt}
          loading={loading}
          width={32}
          height={32}
          style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6 }}
          onError={markErrored}
        />
      </span>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      onError={markErrored}
    />
  );
}
