"use client";
import { ArrowRight, AudioLines, Square } from "lucide-react";

type ChatInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSend: (message: string) => void;
  onStop?: () => void;
  /** Opens hands-free voice mode. Omitted where voice isn't available. */
  onStartVoice?: () => void;
  voiceActive?: boolean;
};

export default function ChatInput({
  message,
  setMessage,
  onSend,
  loading,
  onStop,
  onStartVoice,
  voiceActive = false,
}: ChatInputProps) {
  const canSend = message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
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
      {/* One slot, three jobs. An empty box offers the voice, because there
          is nothing to send; typing turns it into send, because that is now
          the obvious next move. Nothing is ever shown greyed out and
          unusable. */}
      {loading ? (
        <button
          onClick={handleStop}
          className="w-8 h-8 rounded-full transition-colors flex items-center justify-center bg-[#FDFDFB] border border-gray-300 text-gray-900 hover:bg-stone-200"
          title="Stop generation"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : canSend ? (
        <button
          className="w-8 h-8 rounded-full transition-colors flex items-center justify-center border bg-gray-900 border-gray-900 text-white hover:bg-gray-800"
          onClick={handleSend}
          title="Send"
        >
          <ArrowRight size={16} />
        </button>
      ) : onStartVoice ? (
        <button
          onClick={onStartVoice}
          disabled={voiceActive}
          aria-pressed={voiceActive}
          title={voiceActive ? "Voice mode is on" : "Talk to Newsbit"}
          className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center border ${
            voiceActive
              ? "bg-[#8A6A3F] border-[#8A6A3F] text-[#F5E9D2]"
              : "bg-[#FDFDFB] border-gray-300 text-gray-700 hover:bg-stone-200"
          }`}
        >
          <AudioLines size={16} />
        </button>
      ) : (
        // No voice available here, so the slot falls back to an inert send.
        <button
          disabled
          className="w-8 h-8 rounded-full flex items-center justify-center border bg-[#F0F0EB] border-gray-300 text-gray-400 cursor-not-allowed"
        >
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
