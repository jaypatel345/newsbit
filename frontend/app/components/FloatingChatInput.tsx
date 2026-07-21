"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { usePrompt } from "../context/PromptContext";

export default function FloatingChatInput() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const { prompt, setPrompt } = usePrompt();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setVisible(scrollPosition > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update local message when prompt changes from context
  useEffect(() => {
    if (prompt) {
      setMessage(prompt);
      setPrompt(""); // Clear the context after using it
    }
  }, [prompt, setPrompt]);

  const handleSend = () => {
    if (!message.trim()) return;
    // Navigate to chat page with the message as a URL parameter
    setTimeout(() => {
      router.push(`/chat?prompt=${encodeURIComponent(message)}`);
    }, 300);
    setMessage("");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="rounded-2xl shadow-xl p-2 flex items-center gap-2" style={{ backgroundColor: "#E8DCC5", border: "1px solid #8A6A3F" }}>
        <input
          type="text"
          value={message}
          placeholder="Ask today's news..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-sm"
          style={{ color: "#1E1E1E" }}
        />
        <button
          disabled={!message.trim()}
          onClick={handleSend}
          className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center ${
            message.trim()
              ? "hover:opacity-80"
              : "opacity-50"
          }`}
          style={{ backgroundColor: message.trim() ? "#8A6A3F" : "#5B4C3A", color: "#F5E9D2" }}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
