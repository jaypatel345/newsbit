"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptInput } from "@/components/ui/ai-chat-input";
import { InfiniteGridBackground } from "@/components/ui/the-infinite-grid";

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
    <main>
      <InfiniteGridBackground className="min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="relative z-10 w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-225 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center -translate-y-16 animate-in fade-in duration-700">
          {/* Main Heading */}
          <h1
            className="font-(family-name:--font-geist) text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[63px] mb-6 sm:mb-8 tracking-tight leading-tight text-center select-none"
            style={{ color: "#1E1E1E" }}
          >
            News{" "}
            <span className="inline-block font-(family-name:--font-fraunces) font-light italic text-black">for</span>{" "}
            busy minds.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-center max-w-2xl mb-2 sm:mb-3 leading-relaxed text-gray-500 select-none">
            Think deeper. Read smarter. Stay informed.
          </p>

          {/* AI Chat Input - absolutely positioned so its expand/collapse height
              change never shifts the heading/subtext above it */}
          <div className="relative w-full">
            <div className="absolute top-0 left-0 w-full flex justify-center">
              <PromptInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={(prompt) => handlePromptSubmit(prompt)}
                placeholder="Ask about today's news..."
              />
            </div>
          </div>
        </div>
      </InfiniteGridBackground>
    </main>
  );
}
