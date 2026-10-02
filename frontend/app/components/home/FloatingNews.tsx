"use client";
import Link from "next/link";
import { motion } from "framer-motion";

// Three tiles per side, loosely bracketing the heading: the top and bottom
// tiles tuck in towards the centre (they sit above and below the text, so
// they can), the middle ones sit outermost, level with the heading. Offsets
// are deliberately uneven, and the tiles are a little smaller than a grid
// cell, so they read as scattered over the background grid rather than set
// into it. Percentages are of the frame box in HeroSection, which is centred
// on the heading + input, not on the viewport.
const SLOTS: { side: "left" | "right"; x: number; y: number }[] = [
  { side: "left", x: 0.1, y: 0.03 },
  { side: "left", x: 0.01, y: 0.41 },
  { side: "left", x: 0.08, y: 0.79 },
  { side: "right", x: 0.12, y: 0 },
  { side: "right", x: 0.02, y: 0.35 },
  { side: "right", x: 0.1, y: 0.74 },
];

// Fixed, hand-picked placeholder imagery (not live articles): each tile is a
// doorway into a section of the site, so it carries a strong, instantly
// readable picture for its topic. All are public domain or CC0 photos from
// Wikimedia Commons (no attribution required), saved as 330px thumbnails in
// public/hero. Order matches SLOTS.
// `zoom`/`focus` crop in on the subject so it still reads at tile size.
const TILES: { label: string; href: string; image: string; zoom?: number; focus?: string }[] = [
  {
    label: "Top stories",
    href: "#top-stories",
    // NASA/Tony Gray and Tim Powers - public domain
    image: "/hero/top-stories.jpg",
  },
  {
    label: "Politics",
    href: "/explore?category=Politics",
    // The White House - public domain
    zoom: 2,
    focus: "48% 42%",
    image: "/hero/politics.jpg",
  },
  {
    label: "Entertainment",
    href: "/explore?category=Entertainment",
    // JollyJamboree - CC0
    image: "/hero/entertainment.jpg",
  },
  {
    label: "AI",
    href: "/explore?category=AI",
    // Wikideas1 - CC0
    image: "/hero/ai.webp",
  },
  {
    label: "Celebrity news",
    href: "/explore?category=Entertainment",
    // Cpl. Dary M Patten (DVIDS) - public domain
    image: "/hero/celebrity.jpg",
  },
  {
    label: "Space",
    href: "/explore?category=Space",
    // NASA/Jared Lyons - public domain
    zoom: 1.6,
    focus: "62% 40%",
    image: "/hero/space.jpg",
  },
];

const TILE = 60;

const TILE_CLASS =
  "block overflow-hidden rounded-xl border border-white/80 bg-stone-200 shadow-[0_8px_24px_-8px_rgba(30,30,30,0.18)]";

export default function FloatingNews() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {SLOTS.map((slot, i) => {
        const tile = TILES[i];
        const position = { [slot.side]: `${slot.x * 100}%`, top: `${slot.y * 100}%` };

        return (
          <div
            key={tile.label}
            className="absolute animate-in fade-in zoom-in-90 fill-mode-both duration-700"
            style={{ ...position, animationDelay: `${300 + i * 120}ms` }}
          >
            {/* A slow, shallow bob. Each tile gets its own period and start
                offset so they drift out of step. */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 5 + (i % 3),
                delay: i * 0.4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <Link
                href={tile.href}
                aria-label={tile.label}
                title={tile.label}
                className="pointer-events-auto block transition-transform duration-300 hover:scale-110"
              >
                <span className={TILE_CLASS} style={{ width: TILE, height: TILE }}>
                  <img
                    src={tile.image}
                    alt=""
                    className="h-full w-full object-cover"
                    style={
                      tile.zoom
                        ? { transform: `scale(${tile.zoom})`, transformOrigin: tile.focus, objectPosition: tile.focus }
                        : undefined
                    }
                  />
                </span>
              </Link>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
