"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
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
import ArticleImage, { getSourceLogoUrl } from "@/app/components/common/ArticleImage";

// Hand-placed spots in the hero's side gutters - three per side, staggered so
// they read as scattered rather than as two columns. Percentages are of the
// hero box; the centre (heading + input) stays clear.
const SLOTS: {
  position: CSSProperties;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
}[] = [
  { position: { top: "17%", left: "7%" }, size: 88, rotate: -6, duration: 7, delay: 0 },
  { position: { top: "45%", left: "14%" }, size: 72, rotate: 4, duration: 8.5, delay: 1.2 },
  { position: { top: "68%", left: "5%" }, size: 80, rotate: -3, duration: 7.5, delay: 0.6 },
  { position: { top: "20%", right: "9%" }, size: 76, rotate: 5, duration: 8, delay: 0.9 },
  { position: { top: "47%", right: "4%" }, size: 90, rotate: -4, duration: 7.2, delay: 0.3 },
  { position: { top: "70%", right: "13%" }, size: 70, rotate: 6, duration: 9, delay: 1.5 },
];

// Shown until stories load (or when there are none), so the hero never has
// empty gaps where the tiles belong.
const TOPIC_ICONS: LucideIcon[] = [Globe, Cpu, TrendingUp, Landmark, Trophy, Clapperboard];

const TILE_CLASS =
  "block overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_24px_-8px_rgba(30,30,30,0.18)]";

export default function FloatingNews() {
  const { data: stories } = useTopStories(0);
  const top = (stories ?? []).slice(0, SLOTS.length);

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
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
                  href={`/brief#story-${story.id}`}
                  aria-label={story.title}
                  title={story.title}
                  className="pointer-events-auto relative block transition-transform duration-300 hover:scale-110"
                >
                  <span className={TILE_CLASS} style={{ width: slot.size, height: slot.size }}>
                    <ArticleImage
                      src={story.image_url}
                      alt=""
                      domain={story.domain}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      width={22}
                      height={22}
                      className="absolute -bottom-1.5 -right-1.5 h-[22px] w-[22px] rounded-full border-2 border-white bg-white object-contain shadow-sm"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className={`${TILE_CLASS} flex items-center justify-center text-stone-500`}
                  style={{ width: slot.size * 0.75, height: slot.size * 0.75 }}
                >
                  <Icon size={slot.size * 0.3} strokeWidth={1.6} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
