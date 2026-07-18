import { Message } from "@/types/message";
import { ExternalLink } from "lucide-react";

type MessageListProps = {
  loading: boolean;
  message1: Message[];
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const getDomainName = (url: string) => {
  return new URL(url).hostname.replace("www.", "");
};

export default function MessageList({ loading, message1 }: MessageListProps) {
  return (
    <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl px-2 sm:px-4">
      {message1.map((message) => (
        <div
          className={`flex mb-4 sm:mb-6 w-full ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            key={message.id}
            className={` rounded-2xl p-3 sm:p-4 max-w-full sm:max-w-[85%] ${
              message.role === "user"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100"
            }`}
          >
            {message.role === "user" ? (
              <>
                {/* <p className="font-semibold">You</p> */}
                <p className="text-sm sm:text-base">{message.content}</p>
              </>
            ) : (
              <>
                <p className="mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
                  Here's what's making news today, {today}.
                </p>
                {/* <p className="font-semibold">Assistant</p> */}
                {(message.articles ?? []).map((article, index) => (
                  <div key={article.url} className="mb-3 sm:mb-4">
                    <h2 className="font-semibold text-base sm:text-lg">◦ {article.title}</h2>
                    <p className="text-gray-700 text-sm sm:text-base">{article.summary}</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 text-sm sm:text-base"
                      aria-label={`Read full article: ${article.title}`}
                    >
                      {getDomainName(article.url)}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <p className="italic text-gray-500 flex items-center justify-center text-sm sm:text-base">
          Thinking...
        </p>
      )}
    </div>
  );
}
