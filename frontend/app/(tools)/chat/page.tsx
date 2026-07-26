"use client";
import { Suspense } from "react";
import MessageList from "@/app/components/chat/MessageList";
import PromptChips from "@/app/components/chat/PromptChips";
import ChatInput from "@/app/components/chat/ChatInput";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getNews } from "@/app/services/newsApi";
import { Message } from "@/types/message";
import { Article } from "@/types/article";
import ThinkingTimeline from "@/app/components/chat/ThinkingTimeline";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [message1, setMessage1] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingArticles, setPendingArticles] = useState<Article[] | null>(
    null,
  );

  // Read prompt from URL and set in input
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setMessage(decodeURIComponent(promptParam));
    }
  }, [searchParams]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    setMessage1((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const data: Article[] = await getNews();

      setPendingArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white text-black animate-in fade-in duration-700">
      <header className="p-2 ml-10 items-center justify-start">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-95 transition-opacity"
        >
          <img
            src="/newsbit_logo/logo_without_bg.png"
            alt="Newsbit Logo"
            className="h-7 w-7"
          />
          <div className="flex flex-col">
            <span className="text-[17px] font-medium text-gray-900">
              Newsbit
            </span>
            <span className="text-[12px] text-gray-600">AI-Powered News</span>
          </div>
        </Link>
      </header>
      <main className="flex-1 overflow-y-auto pb-36 sm:pb-40 pt-5 flex flex-col px-2 sm:px-0">
        {message1.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <p className="text-sm sm:text-base text-center">
              Start a conversation by selecting a prompt or typing a message.
            </p>
          </div>
        ) : (
          <>
            <MessageList
              message1={message1}
              loading={loading}
              onThinkingComplete={() => {
                if (!pendingArticles) return;

                setMessage1((prev) => [
                  ...prev,

                  {
                    id: crypto.randomUUID(),

                    role: "assistant",

                    articles: pendingArticles,
                  },
                ]);

                setPendingArticles(null);

                setLoading(false);
              }}
            />
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white">
        {message1.length === 0 && (
          <div className="flex justify-center">
            <PromptChips onSelectPrompt={setMessage} />
          </div>
        )}

        <ChatInput
          message={message}
          setMessage={setMessage}
          loading={loading}
          onSend={handleSend}
        />
      </footer>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="h-10 w-10 mx-auto rounded-full border-4 border-gray-300 border-t-black animate-spin" />

            <p className="mt-4 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
