"use client";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  Clapperboard,
  Cpu,
  Globe,
  Landmark,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useTopStories } from "@/app/hooks/useTopStories";
import { getSourceLogoUrl } from "@/app/components/common/ArticleImage";

// Three tiles per side, laid out as a pair of brackets around the heading:
// the top and bottom tiles tuck in towards the centre (they sit above and
// below the text, so they can), the middle ones sit outermost, level with the
// heading. The right side mirrors the left with small offsets so the frame
// stays balanced without looking stamped. Percentages are of the frame box in
// HeroSection, which is centred on the heading + input, not on the viewport.
const SLOTS: {
  position: CSSProperties;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
}[] = [
  { position: { top: "2%", left: "11%" }, size: 56, rotate: -6, duration: 7, delay: 0 },
  { position: { top: "38%", left: "0%" }, size: 46, rotate: 4, duration: 8.5, delay: 1.2 },
  { position: { top: "76%", left: "9%" }, size: 52, rotate: -3, duration: 7.5, delay: 0.6 },
  { position: { top: "4%", right: "9%" }, size: 50, rotate: 5, duration: 8, delay: 0.9 },
  { position: { top: "36%", right: "0%" }, size: 58, rotate: -4, duration: 7.2, delay: 0.3 },
  { position: { top: "74%", right: "11%" }, size: 44, rotate: 6, duration: 9, delay: 1.5 },
];

// Shown until stories load (or when there are none), so the hero never has
// empty gaps where the tiles belong.
const TOPIC_ICONS: LucideIcon[] = [Globe, Cpu, TrendingUp, Landmark, Trophy, Clapperboard];

const TILE_CLASS =
  "block overflow-hidden rounded-xl border border-white/80 bg-white shadow-[0_8px_24px_-8px_rgba(30,30,30,0.18)]";

export default function FloatingNews() {
  const { data: stories } = useTopStories(0);
  // Stories whose photo failed to load. A favicon blown up to tile size reads
  // as an empty white square, so a failed story gives its slot to the next one
  // that has a photo rather than falling back the way ArticleImage does.
  const [failed, setFailed] = useState<Record<string, true>>({});

  const top = (stories ?? [])
    .filter((story) => story.image_url?.trim() && !failed[story.id])
    .slice(0, SLOTS.length);

  return (
    <div className="pointer-events-none absolute inset-0">
      {SLOTS.map((slot, i) => {
        const story = top[i];
        const Icon = TOPIC_ICONS[i];
        const logo = story ? getSourceLogoUrl(story.domain) : null;

        return (
          <div
            key={i}
            className="absolute animate-in fade-in zoom-in-90 fill-mode-both duration-700"
            style={{ ...slot.position, animationDelay: `${300 + i * 120}ms` }}
          >
            <div
              className="animate-hero-float"
              style={
                {
                  "--float-rotate": `${slot.rotate}deg`,
                  animationDuration: `${slot.duration}s`,
                  animationDelay: `${slot.delay}s`,
                } as CSSProperties
              }
            >
              {story ? (
                <Link
                  key={story.id}
                  href={`/brief#story-${story.id}`}
                  aria-label={story.title}
                  title={story.title}
                  className="pointer-events-auto relative block transition-transform duration-300 hover:scale-110"
                >
                  <span className={TILE_CLASS} style={{ width: slot.size, height: slot.size }}>
                    <img
                      src={story.image_url.trim()}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() =>
                        setFailed((prev) => (prev[story.id] ? prev : { ...prev, [story.id]: true }))
                      }
                    />
                  </span>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      width={16}
                      height={16}
                      className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[1.5px] border-white bg-white object-contain shadow-sm"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className={`${TILE_CLASS} flex items-center justify-center text-stone-500`}
                  style={{ width: slot.size * 0.85, height: slot.size * 0.85 }}
                >
                  <Icon size={slot.size * 0.4} strokeWidth={1.6} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
