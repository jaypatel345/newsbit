import { Message } from "@/types/message";
import { ExternalLink, Copy, Edit2, Check, X } from "lucide-react";
import ThinkingSection from "./ThinkingSection";
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
    <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl px-2 sm:px-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex w-full ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex flex-col max-w-full sm:max-w-[85%] group">
            <div
              className={`rounded-2xl p-4 sm:p-5 relative ${
                message.role === "user"
                  ? "bg-gray-200 text-gray-900"
                  : "bg-white border border-gray-200 text-gray-800 shadow-sm"
              }`}
            >
                  {message.role === "user" ? (
                    editingMessageId === message.id ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-white rounded-lg p-3 text-sm sm:text-base text-gray-900 resize-none outline-none focus:ring-2 focus:ring-gray-300"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 hover:bg-gray-300 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(message.id)}
                            className="p-2 hover:bg-gray-300 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
                    )
                  ) : (
                    <>
                      {/* Normal AI text response */}
                      {message.content && message.content.replace(/<function=[^>]+>[\s\S]*?<\/function>/g, '').trim() && (
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {message.content.replace(/<function=[^>]+>[\s\S]*?<\/function>/g, '').trim()}
                        </p>
                      )}

                      {/* Fallback message when content is empty after removing function tags */}
                      {message.content && !message.content.replace(/<function=[^>]+>[\s\S]*?<\/function>/g, '').trim() && !message.articles && (
                        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
                          No response generated. Please try again.
                        </p>
                      )}

                      {/* News articles response */}
                      {message.articles && message.articles.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {message.articles.map((article) => (
                            <div key={article.url} className="border-l-2 border-gray-200 pl-4 py-2">
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                                {article.title}
                              </h3>

                              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3">
                                {article.summary}
                              </p>

                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-gray-700 hover:text-black text-sm font-medium transition-colors"
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

                {/* Action buttons */}
                {editingMessageId !== message.id && (
                  <div className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    {message.role === "user" && (
                      <button
                        onClick={() => handleEdit(message)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Edit message"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {message.content && (
                      <button
                        onClick={() => handleCopy(message.content!)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
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

      {loading && onLoadingComplete && <ThinkingSection onComplete={onLoadingComplete} isThinking={loading} />}
    </div>
  );
}
