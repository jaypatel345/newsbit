"use client";
import { Suspense } from "react";
import MessageList from "@/app/components/chat/MessageList";
import PromptChips from "@/app/components/chat/PromptChips";
import ChatInput from "@/app/components/chat/ChatInput";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Message } from "@/types/message";
import { SquarePen } from "lucide-react";
import { useConversations } from "@/app/hooks/useConversations";
import { useCreateConversation } from "@/app/hooks/useCreateConversation";
import { useMessages } from "@/app/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import { useSendMessage } from "@/app/hooks/useSendMessage";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<Message | null>(null);
  const { data: conversations = [] } = useConversations();
  const { mutateAsync: createConversation } = useCreateConversation();
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const { data: messages = [] } = useMessages(selectedConversationId);
  const queryClient = useQueryClient();
  const { mutateAsync: sendMessage } = useSendMessage();

  const handleSend = async (message: string) => {
    if (!message.trim() || !selectedConversationId) return;

    queryClient.setQueryData(
      ["messages", selectedConversationId],

      (oldMessages: Message[] = []) => [
        ...oldMessages,

        {
          id: crypto.randomUUID(),

          role: "user",

          content: message,
        },
      ],
    );

    setLoading(true);
    setPendingResponse(null);

    try {
      const response = await sendMessage({
        conversationId: selectedConversationId,

        content: message,
      });

      setPendingResponse(response);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    if (pendingResponse && selectedConversationId) {
      queryClient.setQueryData(
        ["messages", selectedConversationId],

        (oldMessages: Message[] = []) => [...oldMessages, pendingResponse],
      );
      setPendingResponse(null);
    }
    setLoading(false);
  };

  const handleCreateConversation = async () => {
    const conversation = await createConversation();
    setSelectedConversationId(conversation.id);
    queryClient.setQueryData(["messages", conversation.id], []);
    setInputMessage("");
  };

  // Read prompt from URL and set in input
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setInputMessage(decodeURIComponent(promptParam));
    }
  }, [searchParams]);
  return (
    <div className="flex h-screen bg-white ">
      <aside className="w-72 border-r border-gray-200 shrink-0 overflow-y-auto">
        <header className="p-4">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
          >
            <img
              src="/newsbit_logo/logo_without_bg.png"
              alt="Newsbit Logo"
              className="h-7 w-7"
            />
          </Link>
        </header>

        <div className="px-4">
          <button
            className=" mt-2 flex w-[calc(100%-2rem)] items-center rounded-xl bg-white border border-gray-200 px-5 py-4 text-sm font-medium hover:bg-gray-100 cursor-pointer"
            onClick={handleCreateConversation}
          >
            <SquarePen className="mr-3 h-3 w-5 " />
            New Chat
          </button>
        </div>
        <div className="mt-4 px-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selectedConversationId === conversation.id
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="truncate text-sm">{conversation.title}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col h-full bg-white text-black animate-in fade-in duration-700">
        <main className="flex-1 overflow-y-auto pb-36 sm:pb-40 pt-5 flex flex-col px-2 sm:px-0">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4">
              <p className="text-sm sm:text-base text-center">
                Start a conversation by selecting a prompt or typing a message.
              </p>
            </div>
          ) : (
            <>
              <MessageList
                loading={loading}
                messages={messages}
                onLoadingComplete={handleAnimationComplete}
              />
            </>
          )}
        </main>

        <footer className="sticky bottom-0  bg-white">
          {messages.length === 0 && (
            <div className="flex justify-center">
              <PromptChips onSelectPrompt={setInputMessage} />
            </div>
          )}

          <ChatInput
            message={inputMessage}
            setMessage={setInputMessage}
            loading={loading}
            onSend={handleSend}
          />
        </footer>
      </div>
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
