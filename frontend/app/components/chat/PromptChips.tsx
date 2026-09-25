"use client";

const INK = "#1E1E1E";
const BODY_TEXT = "#5B4C3A";
const GOLD = "#8A6A3F";

// Starters that show what Newsbit is actually good at, rather than three
// bare keyword chips: one to catch up, one to see what's moving, three
// beats to follow, and one that asks for the reasoning behind a story.
const STARTERS = [
  {
    label: "Catch up",
    prompt: "Top 10 today's news summary",
    description: "The day's biggest stories, summarized.",
  },
  {
    label: "Trending",
    prompt: "What's trending right now",
    description: "What everyone is reading today.",
  },
  {
    label: "Technology",
    prompt: "Latest AI news",
    description: "Models, launches and the race to ship.",
  },
  {
    label: "Business",
    prompt: "Business headlines today",
    description: "Markets, deals and the economy.",
  },
  {
    label: "World",
    prompt: "What's happening around the world",
    description: "Conflicts, elections and diplomacy.",
  },
  {
    label: "Go deeper",
    prompt: "Explain the biggest story today and why it matters",
    description: "The context behind the headline.",
  },
];

type PromptChipsProps = {
  onSelectPrompt: (prompt: string) => void;
};

export default function PromptChips({ onSelectPrompt }: PromptChipsProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
      {STARTERS.map((starter) => (
        <button
          key={starter.prompt}
          onClick={() => onSelectPrompt(starter.prompt)}
          className="group relative overflow-hidden rounded-xl border border-gray-300 bg-[#F0F0EB] p-4 text-left transition-colors duration-200 hover:border-[#8A6A3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6A3F]/30 cursor-pointer"
        >
          {/* A gold edge that wipes in from the left on hover. */}
          <span
            className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 transition-transform duration-200 group-hover:scale-y-100"
            style={{ backgroundColor: GOLD }}
          />

          <span
            className="block text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            {starter.label}
          </span>

          <span
            className="mt-1.5 block text-[14px] font-semibold leading-snug"
            style={{ color: INK }}
          >
            {starter.prompt}
          </span>

          <span
            className="mt-1 block text-[12px] leading-relaxed"
            style={{ color: BODY_TEXT }}
          >
            {starter.description}
          </span>
        </button>
      ))}
    </div>
  );
}
