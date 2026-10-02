"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptInput } from "@/components/ui/ai-chat-input";
import FloatingNews from "@/app/components/home/FloatingNews";
import { Reveal } from "@/app/components/motion/Reveal";

export default function HeroSection() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handlePromptSubmit = (prompt: string) => {
    if (!prompt.trim()) return;
    setTimeout(() => {
      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
    }, 300);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-hidden">
      {/* Tile frame - centred and lifted by the same -translate-y-16 as the
          content below, so the tiles frame the heading + input instead of the
          viewport. Height is capped by vh so short screens keep the top tiles
          clear of the navbar. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-center">
        <div className="relative w-[calc(100%-3rem)] max-w-295 h-[min(520px,62vh)] -translate-y-16">
          <FloatingNews />
        </div>
      </div>
      <div className="relative z-10 w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-225 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center -translate-y-16">
        {/* Main Heading */}
        <Reveal immediate y={22}>
          <h1
            className="font-(family-name:--font-geist) text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[63px] mb-6 sm:mb-8 tracking-tight leading-tight text-center select-none"
            style={{ color: "#1E1E1E" }}
          >
            News{" "}
            <span className="inline-block font-(family-name:--font-fraunces) font-light italic text-black">for</span>{" "}
            busy minds.
          </h1>
        </Reveal>

        {/* Supporting Text */}
        <Reveal immediate y={22} delay={0.08}>
          <p className="text-base sm:text-lg text-center max-w-2xl mb-2 sm:mb-3 leading-relaxed text-gray-500 select-none">
            Think deeper. Read smarter. Stay informed.
          </p>
        </Reveal>

        {/* AI Chat Input - absolutely positioned so its expand/collapse height
            change never shifts the heading/subtext above it */}
        <Reveal immediate y={22} delay={0.16} className="relative w-full">
          <div className="absolute top-0 left-0 w-full flex justify-center">
            <PromptInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={(prompt) => handlePromptSubmit(prompt)}
              placeholder="Ask about today's news..."
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
