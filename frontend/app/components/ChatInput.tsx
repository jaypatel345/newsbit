"use client";

import { useState } from "react";

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
        className={`rounded-full px-3 sm:px-4 py-2 text-white transition-colors text-sm sm:text-base ${
          message.trim() && !loading
            ? "bg-black hover:bg-gray-800"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={handleSend}
      >
        ↑
      </button>
    </div>
  );
}
