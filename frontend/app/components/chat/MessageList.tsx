import { Message } from "@/types/message";
import { ExternalLink, Copy, Edit2, Check, X } from "lucide-react";
import ThinkingTimeline from "./ThinkingTimeline";
import { useState } from "react";
import { toast } from "sonner";

type MessageListProps = {
  messages: Message[];
  loading: boolean;
  onLoadingComplete?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
};

const getDomainName = (url: string) => {
  return new URL(url).hostname.replace("www.", "");
};

export default function MessageList({ messages, loading, onLoadingComplete, onEditMessage }: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied!");
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content || "");
  };

  const handleSaveEdit = async (messageId: string) => {
    if (onEditMessage && editContent.trim()) {
      await onEditMessage(messageId, editContent);
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  return (
    <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl px-2 sm:px-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 sm:mb-6 w-full ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex flex-col max-w-full sm:max-w-[85%] group">
            <div
              className={`rounded-2xl p-3 sm:p-4 relative ${
                message.role === "user"
                  ? "bg-neutral-900"
                  : "bg-gray-100 text-black"
              }`}
            >
              {message.role === "user" ? (
                editingMessageId === message.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white/10 rounded-lg p-2 text-sm sm:text-base text-white resize-none outline-none focus:ring-2 focus:ring-white/20"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(message.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-white">{message.content}</p>
                )
              ) : (
                <>
                  {/* Normal AI text response */}
                  {message.content && (
                    <p className="text-sm sm:text-base whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}

                  {/* News articles response */}
                  {message.articles && (
                    <div className="mt-4">
                      {message.articles.map((article) => (
                        <div key={article.url} className="mb-4">
                          <h2 className="font-semibold text-base sm:text-lg">
                            ◦ {article.title}
                          </h2>

                          <p className="text-gray-700 text-sm sm:text-base">
                            {article.summary}
                          </p>

                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 text-sm sm:text-base"
                          >
                            {getDomainName(article.url)}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Action buttons outside the border */}
            {editingMessageId !== message.id && (
              <div className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}>
                {message.role === "user" && (
                  <button
                    onClick={() => handleEdit(message)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
                    title="Edit message"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {message.content && (
                  <button
                    onClick={() => handleCopy(message.content!)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
                    title="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && onLoadingComplete && <ThinkingTimeline onComplete={onLoadingComplete} />}
    </div>
  );
}
