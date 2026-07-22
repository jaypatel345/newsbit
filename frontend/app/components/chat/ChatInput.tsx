"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type ChatInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSend: (message: string) => void;
};

export default function ChatInput({
  message,
  setMessage,
  onSend,
  loading,
}: ChatInputProps) {
  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);

    setMessage("");
  };

  return (
    <div className="flex items-center space-x-2 max-w-3xl justify-center mx-auto px-2 sm:px-4 shadow-xl border border-mauve-100 p-3 sm:p-4 mb-3 rounded-3xl">
      <input
        type="text"
        value={message}
        placeholder="ask another question..."
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="flex-1 rounded-2xl z-50 border-gray-300 p-2 outline-none text-sm sm:text-base"
        disabled={loading}
      />
      <button
        disabled={loading || !message.trim()}
        className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center ${
          message.trim() && !loading
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={handleSend}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
