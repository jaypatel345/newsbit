import { Message } from "@/types/message";
import { ExternalLink } from "lucide-react";
import ThinkingTimeline from "./ThinkingTimeline";

type MessageListProps = {
  messages: Message[];
  loading: boolean;
  onLoadingComplete?: () => void;
};

const getDomainName = (url: string) => {
  return new URL(url).hostname.replace("www.", "");
};

export default function MessageList({ messages, loading, onLoadingComplete }: MessageListProps) {
  return (
    <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl px-2 sm:px-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 sm:mb-6 w-full ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`rounded-2xl p-3 sm:p-4 max-w-full sm:max-w-[85%] ${
              message.role === "user"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            {message.role === "user" ? (
              <p className="text-sm sm:text-base">{message.content}</p>
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
        </div>
      ))}

      {loading && onLoadingComplete && <ThinkingTimeline onComplete={onLoadingComplete} />}
    </div>
  );
}
