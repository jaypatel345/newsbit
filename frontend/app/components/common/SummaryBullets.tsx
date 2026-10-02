// Words that end in a period without ending the sentence ("Mr. Smith",
// "U.S. troops"), so the splitter doesn't break a point in half.
const ABBREVIATION = /(?:\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|Inc|Ltd|Co|Corp|No|Gov|Sen|Rep|Gen|Lt|Col|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)|\b(?:[A-Za-z]\.)+[A-Za-z]|(?:^|\s)[A-Z])\.$/;

/**
 * Splits a prose summary into its sentences. Summaries arrive as one
 * paragraph (the same text feeds the audio read-out), so the bullets are
 * derived here rather than stored.
 */
export function splitSummary(summary: string): string[] {
  const text = summary.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const sentences: string[] = [];
  let start = 0;
  const boundary = /[.!?]["'”’)]*\s+(?=["'“‘(]?[A-Z0-9])/g;
  let match: RegExpExecArray | null;

  while ((match = boundary.exec(text))) {
    const end = match.index + match[0].trimEnd().length;
    const candidate = text.slice(start, end);
    if (ABBREVIATION.test(candidate)) continue;
    sentences.push(candidate.trim());
    start = match.index + match[0].length;
  }
  sentences.push(text.slice(start).trim());

  return sentences.filter(Boolean);
}

interface SummaryBulletsProps {
  summary: string;
  /** Show at most this many points; the rest of the summary is dropped. */
  max?: number;
  /** Clamp each point to this many lines (compact cards). */
  clampLines?: 1 | 2 | 3;
  className?: string;
  itemClassName?: string;
}

const CLAMP = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const;

/**
 * Marker for one point: a small bronze diamond with a soft halo, plus a
 * faint thread down to the next point's diamond. Place it inside a
 * `relative pl-5` list item. The thread spans the gap between items, which
 * it reads from `--bullet-gap` on the list (default 6px, i.e. space-y-1.5).
 */
export function BulletMarker({ last = false }: { last?: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute left-[3px] top-[0.6em] h-[7px] w-[7px] rotate-45 rounded-[2px] bg-linear-to-br from-[#D4B07A] to-[#8A6A3F] shadow-[0_0_0_3px_rgba(138,106,63,0.14)]"
      />
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-[6px] top-[calc(0.6em+12px)] bottom-[calc(-0.6em-var(--bullet-gap,6px)+4px)] w-px bg-linear-to-b from-[#8A6A3F]/35 to-[#8A6A3F]/10"
        />
      )}
    </>
  );
}

/**
 * A summary as a short run of points, each marked by a small bronze diamond
 * and joined to the next by a faint thread, so the points read as one story
 * told in steps.
 */
export default function SummaryBullets({
  summary,
  max,
  clampLines,
  className = "",
  itemClassName = "",
}: SummaryBulletsProps) {
  const points = splitSummary(summary).slice(0, max);
  if (points.length === 0) return null;

  return (
    <ul className={`space-y-1.5 ${className}`}>
      {points.map((point, index) => (
        <li key={index} className="relative pl-5">
          <BulletMarker last={index === points.length - 1} />
          <span className={`block ${clampLines ? CLAMP[clampLines] : ""} ${itemClassName}`}>
            {point}
          </span>
        </li>
      ))}
    </ul>
  );
}
