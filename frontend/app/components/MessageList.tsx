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
    <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl ">
      {message1.map((message) => (
        <div
          className={`flex mb-6 w-full ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            key={message.id}
            className={` rounded-2xl p-4  ${
              message.role === "user"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100"
            }`}
          >
            {message.role === "user" ? (
              <>
                {/* <p className="font-semibold">You</p> */}
                <p>{message.content}</p>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700 ">
                  Here's what's making news today, {today}.
                </p>
                {/* <p className="font-semibold">Assistant</p> */}
                {(message.articles ?? []).map((article, index) => (
                  <div key={article.url} className="mb-4">
                    <h3 className="font-semibold"> ◦ {article.title}</h3>
                    <p>{article.summary}</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1"
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
        <p className="italic text-gray-500 flex items-center justify-center">
          Thinking...
        </p>
      )}
    </div>
  );
}
