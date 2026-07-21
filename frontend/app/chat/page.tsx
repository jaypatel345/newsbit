"use client";
import MessageList from "../components/MessageList";
import PromptChips from "../components/PromptChips";
import ChatInput from "../components/ChatInput";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getNews } from "../services/newsApi";
import { Message } from "@/types/message";
import { Article } from "@/types/article";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [message1, setMessage1] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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

      setMessage1((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          articles: data,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white text-black animate-in fade-in duration-700">
      <header className="border-b border-gray-200 p-4 items-center justify-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Newsbit AI</h1>
      </header>
      <main className="flex-1 overflow-y-auto pb-36 sm:pb-40 pt-5 flex flex-col px-2 sm:px-0">
        {message1.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <p className="text-sm sm:text-base text-center">
              Start a conversation by selecting a prompt or typing a message.
            </p>
          </div>
        ) : (
          <MessageList message1={message1} loading={loading} />
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
