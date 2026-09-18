"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptInput } from "@/components/ui/ai-chat-input";

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
    <main className="relative min-h-[70vh] sm:min-h-[65vh] lg:min-h-[60vh] flex items-center justify-center pt-28 sm:pt-32 lg:pt-36 bg-white overflow-x-hidden">
      {/* Decorative AI glow backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-linear-to-br from-gray-400 via-gray-500 to-gray-300 opacity-20 blur-3xl" />
        <div className="absolute top-10 -right-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-linear-to-br from-gray-300 via-gray-500 to-gray-400 opacity-20 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse 55% 50% at 50% 35%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 55% 50% at 50% 35%, black 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-225 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-in fade-in duration-700">
        {/* Main Heading */}
        <h1
          className="font-(family-name:--font-geist) text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[63px] mb-6 sm:mb-8 tracking-tight leading-tight text-center"
          style={{ color: "#1E1E1E" }}
        >
          News{" "}
          <span className="inline-block text-black">for</span>{" "}
          busy minds.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-center max-w-2xl mb-6 sm:mb-8 leading-relaxed text-gray-500">
          Think deeper. Read smarter. Stay informed.
        </p>

        {/* AI Chat Input */}
        <PromptInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={(prompt) => handlePromptSubmit(prompt)}
          placeholder="Ask about today's news..."
        />
      </div>
    </main>
  );
}
