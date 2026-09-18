"use client";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const prompts = [
  "Latest SpaceX Starship news",
  "Taylor Swift's latest news",
  "OpenAI's newest AI incidents",
  "Champions League results",
  "Russia-Ukraine war update",
  "Apple iPhone Duo price",
  "Ms Rachel's $1M donation",
  "Bitcoin's price surge",
  "NASA's Roman Space Telescope",
  "Elon Musk's Tesla news",
  "Macklemore vs Ed Sheeran drama",
  "DeepMind's AI safety warning",
  "Sweden's new PM",
  "PrismML's tiny LLM breakthrough",
  "Roku's new bundle deals",
  "Prince Harry's UK return",
];

const promptRows = Array.from({ length: 4 }, (_, rowIndex) =>
  prompts.slice(rowIndex * 4, rowIndex * 4 + 4),
);

export default function AICapabilities() {
  const router = useRouter();

  const sendPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    router.push(`/chat?prompt=${encodeURIComponent(trimmedPrompt)}`);
  };

  return (
    <section className="py-24 sm:py-32 md:py-40">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold text-gray-900 mb-3 sm:mb-4">
          Ask Newsbit anything.
        </h2>
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
          Go beyond reading the news. Ask follow-up questions, compare
          perspectives, understand context, and explore stories through
          conversation.
        </p>
      </div>

      {/* Prompt Suggestions */}
      <div
        className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(ellipse 65% 130% at 50% 50%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 130% at 50% 50%, black 60%, transparent 100%)",
        }}
      >
        {promptRows.map((row, rowIndex) => (
          <div key={rowIndex} className="overflow-hidden">
            <div
              className={`flex w-max gap-3 ${
                rowIndex % 2 === 0
                  ? "animate-prompt-slide-left"
                  : "animate-prompt-slide-right"
              }`}
            >
              {[...row, ...row].map((prompt, promptIndex) => (
                <button
                  key={`${rowIndex}-${promptIndex}`}
                  type="button"
                  onClick={() => sendPrompt(prompt)}
                  className="group flex w-40 sm:w-48 md:w-56 lg:w-64 shrink-0 items-center gap-2 rounded-lg sm:rounded-xl border border-gray-200 bg-white/90 backdrop-blur-xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md hover:shadow-gray-900/5 cursor-pointer"
                >
                  <Sparkles
                    size={13}
                    className="shrink-0 text-gray-300 transition-colors group-hover:text-gray-400"
                  />
                  <span className="truncate">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
