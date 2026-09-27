"use client";
import { ArrowRight, Square } from "lucide-react";

type ChatInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSend: (message: string) => void;
  onStop?: () => void;
};

export default function ChatInput({
  message,
  setMessage,
  onSend,
  loading,
  onStop,
}: ChatInputProps) {
  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);

    setMessage("");
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="flex items-center space-x-2 max-w-2xl justify-center mx-auto bg-[#FDFDFB] border border-gray-300 p-2.5 sm:p-3 mb-3 rounded-3xl">
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
        className="flex-1 rounded-2xl z-50 bg-[#FDFDFB] border-gray-300 px-3 py-1.5 outline-none text-sm sm:text-base text-gray-800"
        disabled={loading}
      />
      {loading ? (
        <button
          onClick={handleStop}
          className="w-8 h-8 rounded-full transition-colors flex items-center justify-center bg-[#FDFDFB] border border-gray-300 text-gray-900 hover:bg-stone-200"
          title="Stop generation"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          disabled={!message.trim()}
          className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center border ${
            message.trim()
              ? "bg-gray-900 border-gray-900 text-white hover:bg-gray-800"
              : "bg-[#F0F0EB] border-gray-300 text-gray-400 cursor-not-allowed"
          }`}
          onClick={handleSend}
        >
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
