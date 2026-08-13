"use client";
import { Suspense, useRef, useState } from "react";
import MessageList from "@/app/components/chat/MessageList";
import PromptChips from "@/app/components/chat/PromptChips";
import ChatInput from "@/app/components/chat/ChatInput";
import ConversationMenu from "@/app/components/chat/ConversationMenu";
import RenameDialog from "@/app/components/chat/RenameDialog";
import ThinkingSection from "@/app/components/chat/ThinkingSection";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Message } from "@/types/message";
import { SquarePen, Pin, PanelLeftOpen, PanelRightOpen, X } from "lucide-react";
import { useConversations } from "@/app/hooks/useConversations";
import { useCreateConversation } from "@/app/hooks/useCreateConversation";
import { useUpdateConversation } from "@/app/hooks/useUpdateConversation";
import { usePinConversation } from "@/app/hooks/usePinConversation";
import { useDeleteConversation } from "@/app/hooks/useDeleteConversation";
import { useMessages } from "@/app/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import { useSendMessage } from "@/app/hooks/useSendMessage";
import { generateTitleFromMessage } from "@/app/utils/titleGenerator";
import { useArticle } from "@/app/hooks/useArticle";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: conversations = [] } = useConversations();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: updateConversation } = useUpdateConversation();
  const { mutateAsync: pinConversation } = usePinConversation();
  const { mutateAsync: deleteConversation } = useDeleteConversation();
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const { data: messages = [] } = useMessages(selectedConversationId);
  const queryClient = useQueryClient();
  const { mutateAsync: sendMessage } = useSendMessage();
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    conversationId: number | null;
    currentTitle: string;
  }>({ isOpen: false, conversationId: null, currentTitle: "" });
  const abortControllerRef = useRef<AbortController | null>(null);

  const articleIdParam = searchParams.get("articleId");

  const articleId = articleIdParam

    ? Number(articleIdParam)

    : undefined;

  const [selectedArticles, setSelectedArticles] = useState<any[]>([]);

  const { data: article, isLoading } = useArticle(articleId);

  useEffect(() => {
    if (article) {
      setSelectedArticles([article]);
    }
  }, [article]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Create conversation if none exists
    let conversationId = selectedConversationId;
    if (!conversationId) {
      const conversation = await createConversation();
      conversationId = conversation.id;
      setSelectedConversationId(conversationId);
      queryClient.setQueryData(["messages", conversationId], []);
    }

    const isFirstMessage = messages.length === 0;

    queryClient.setQueryData(
      ["messages", conversationId],

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

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Update conversation title if this is the first message (non-blocking)
    if (isFirstMessage) {
      const generatedTitle = generateTitleFromMessage(message);
      // Store in localStorage as fallback
      localStorage.setItem(`conversation_title_${conversationId}`, generatedTitle);
      // Optimistically update the title in the UI
      queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
        return oldConversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title: generatedTitle } : conv
        );
      });
      // Then try to update on the server
      updateConversation({
        conversationId: conversationId,
        updates: { title: generatedTitle },
      }).catch((error) => {
        console.error("Failed to update conversation title:", error);
      });
    }

    try {
      const response = await sendMessage({
        conversationId: conversationId,
        content: message,
        signal: abortControllerRef.current.signal,
        articleIds: selectedArticles.map((article) => article.id),
      });

      // Store response in pending state, don't add to messages yet
      setPendingResponse(response);

      // Keep loading true until timeline completes
      // Response will be added to messages when timeline completes
    } catch (error) {
      // Check if the error is due to abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        // Remove the pending user message since we stopped the generation
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldMessages: Message[] = []) => oldMessages.slice(0, -1)
        );
      } else {
        console.error(error);
      }
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!selectedConversationId) return;

    // Find the message index
    const messages = queryClient.getQueryData(["messages", selectedConversationId]) as Message[] || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) return;

    // Check if this is the first message (index 0)
    const isFirstMessage = messageIndex === 0;

    // Update the user message in the UI
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content: newContent };

    // Remove the assistant response that follows this user message
    if (messageIndex + 1 < updatedMessages.length && updatedMessages[messageIndex + 1].role === "assistant") {
      updatedMessages.splice(messageIndex + 1, 1);
    }

    queryClient.setQueryData(["messages", selectedConversationId], updatedMessages);

    // Update conversation title if editing the first message (non-blocking)
    if (isFirstMessage) {
      const generatedTitle = generateTitleFromMessage(newContent);
      // Store in localStorage as fallback
      localStorage.setItem(`conversation_title_${selectedConversationId}`, generatedTitle);
      // Optimistically update the title in the UI
      queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
        return oldConversations.map((conv) =>
          conv.id === selectedConversationId ? { ...conv, title: generatedTitle } : conv
        );
      });
      // Then try to update on the server
      updateConversation({
        conversationId: selectedConversationId,
        updates: { title: generatedTitle },
      }).catch((error) => {
        console.error("Failed to update conversation title:", error);
      });
    }

    // Send the edited message to get a new AI response
    setLoading(true);
    setPendingResponse(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendMessage({
        conversationId: selectedConversationId,
        content: newContent,
        signal: abortControllerRef.current.signal,
        articleIds: selectedArticles.map((article) => article.id),
      });

      // Store response in pending state, don't add to messages yet
      setPendingResponse(response);

      // Keep loading true until timeline completes
      // Response will be added to messages when timeline completes
    } catch (error) {
      // Check if the error is due to abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        // Revert the changes if the send was aborted
        queryClient.setQueryData(["messages", selectedConversationId], messages);
      } else {
        console.error(error);
        // Revert the changes if the send fails
        queryClient.setQueryData(["messages", selectedConversationId], messages);
      }
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    // Add the pending response to messages when timeline completes
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
    // Clear any existing abort controller
    abortControllerRef.current = null;
  };

  const handlePinConversation = (conversationId: number, isPinned: boolean) => {
    // Store in localStorage as fallback
    localStorage.setItem(`conversation_pinned_${conversationId}`, isPinned.toString());
    // Optimistically update the UI
    queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
      return oldConversations.map((conv) =>
        conv.id === conversationId ? { ...conv, is_pinned: isPinned } : conv
      );
    });
    // Then try to update on the server
    pinConversation({
      conversationId,
      isPinned,
    }).catch((error) => {
      console.error("Failed to pin conversation:", error);
    });
  };

  const handleRenameConversation = (conversationId: number, currentTitle: string) => {
    setRenameDialog({
      isOpen: true,
      conversationId,
      currentTitle,
    });
  };

  const handleConfirmRename = (newTitle: string) => {
    if (renameDialog.conversationId) {
      // Store in localStorage as fallback
      localStorage.setItem(`conversation_title_${renameDialog.conversationId}`, newTitle);
      // Optimistically update the UI
      queryClient.setQueryData(["conversations"], (oldConversations: any[] = []) => {
        return oldConversations.map((conv) =>
          conv.id === renameDialog.conversationId ? { ...conv, title: newTitle } : conv
        );
      });
      // Then try to update on the server
      updateConversation({
        conversationId: renameDialog.conversationId,
        updates: { title: newTitle },
      })
        .then(() => {
          setRenameDialog({ isOpen: false, conversationId: null, currentTitle: "" });
        })
        .catch((error) => {
          console.error("Failed to rename conversation:", error);
          setRenameDialog({ isOpen: false, conversationId: null, currentTitle: "" });
        });
    }
  };

  const handleDeleteConversation = (conversationId: number) => {
    console.log("Delete called for conversation:", conversationId);
    if (confirm("Are you sure you want to delete this conversation?")) {
      console.log("User confirmed delete");
      // Store deleted conversation ID in localStorage
      localStorage.setItem(`deleted_conversation_${conversationId}`, "true");
      console.log("Stored in localStorage");
      // Optimistically remove from UI
      const previousConversations = queryClient.getQueryData(["conversations"]) as any[] || [];
      console.log("Previous conversations:", previousConversations.length);
      const filtered = previousConversations.filter((conv) => conv.id !== conversationId);
      queryClient.setQueryData(["conversations"], filtered);
      console.log("Removed from UI, remaining:", filtered.length);

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        queryClient.setQueryData(["messages"], []);
        // Abort any ongoing request for this conversation
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setLoading(false);
      }

      // Try to delete on the server in background (fire and forget)
      deleteConversation(conversationId).catch((error) => {
        console.error("Failed to delete conversation on server:", error);
      });
    }
  };

  // Read prompt from URL and set in input
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setInputMessage(decodeURIComponent(promptParam));
    }
  }, [searchParams]);

  // Restore conversation data from localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      const updatedConversations = conversations
        .filter((conv) => !localStorage.getItem(`deleted_conversation_${conv.id}`))
        .map((conv) => {
          const localTitle = localStorage.getItem(`conversation_title_${conv.id}`);
          const localPinned = localStorage.getItem(`conversation_pinned_${conv.id}`);

          // Apply localStorage updates
          const updates: any = {};
          if (localTitle && conv.title === "New Chat") {
            updates.title = localTitle;
          }
          if (localPinned) {
            updates.is_pinned = localPinned === "true";
          }

          return Object.keys(updates).length > 0 ? { ...conv, ...updates } : conv;
        });

      // Check if we need to update (either content changed or conversations were removed)
      const hasChanges = updatedConversations.length !== conversations.length ||
        updatedConversations.some((conv: any, i: number) => {
          const original = conversations[i];
          return conv.title !== original.title || conv.is_pinned !== original.is_pinned;
        });

      if (hasChanges) {
        queryClient.setQueryData(["conversations"], updatedConversations);
      }
    }
  }, [conversations, queryClient]);
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden w-80 border-r border-gray-200 shrink-0 overflow-y-auto bg-white shadow-sm transition-all duration-300 ease-in-out h-full z-20 fixed ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <header className="p-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <img
                src="/newsbit_logo/logo_without_bg.png"
                alt="Newsbit Logo"
                className="h-7 w-7"
              />
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-900">
                  Newsbit
                </span>
                <span className="text-[11px] text-gray-600">
                  AI-Powered News
                </span>
                  </div>
                </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 active:scale-95"
          >
            {sidebarOpen ? <PanelLeftOpen className="h-5 w-5 text-black" /> : <PanelRightOpen className="h-5 w-5 text-black" />}
          </button>
        </header>

        <div className="px-3 py-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
            onClick={handleCreateConversation}
          >
            <SquarePen className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="px-3 pb-4">
          {conversations.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Chats
              </p>
              {conversations
                .slice()
                .filter((conv) => !localStorage.getItem(`deleted_conversation_${conv.id}`))
                .sort((a, b) => {
                  if (a.is_pinned && !b.is_pinned) return -1;
                  if (!a.is_pinned && b.is_pinned) return 1;
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                })
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all group ${selectedConversationId === conversation.id
                      ? "bg-gray-100 border border-gray-300"
                      : "hover:bg-gray-100 border border-transparent"
                      }`}
                  >
                    <button
                      onClick={() => {
                        // Abort any ongoing request when switching conversations
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                          abortControllerRef.current = null;
                        }
                        setLoading(false);
                        setSelectedConversationId(conversation.id);
                      }}
                      className="flex-1 flex items-center gap-2 text-left truncate"
                    >
                      {conversation.is_pinned && <Pin className="h-3.5 w-3.5 text-gray-600 shrink-0" />}
                      <span className={`truncate text-sm ${selectedConversationId === conversation.id
                        ? "text-gray-900 font-medium"
                        : "text-gray-700"
                        }`}>
                        {conversation.title}
                      </span>
                    </button>
                    <ConversationMenu
                      conversation={conversation}
                      onPin={handlePinConversation}
                      onRename={handleRenameConversation}
                      onDelete={handleDeleteConversation}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block border-r border-gray-200 shrink-0 overflow-y-auto bg-white shadow-sm transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden p-0'
      }`}>
        <header className="p-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <img
                src="/newsbit_logo/logo_without_bg.png"
                alt="Newsbit Logo"
                className="h-7 w-7"
              />
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-900">
                  Newsbit
                </span>
                <span className="text-[11px] text-gray-600">
                  AI-Powered News
                </span>
                  </div>
                </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 active:scale-95"
          >
            {sidebarOpen ? <PanelLeftOpen className="h-5 w-5 text-black" /> : <PanelRightOpen className="h-5 w-5 text-black" />}
          </button>
        </header>

        <div className="px-3 py-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
            onClick={handleCreateConversation}
          >
            <SquarePen className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="px-3 pb-4">
          {conversations.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Chats
              </p>
              {conversations
                .slice()
                .filter((conv) => !localStorage.getItem(`deleted_conversation_${conv.id}`))
                .sort((a, b) => {
                  if (a.is_pinned && !b.is_pinned) return -1;
                  if (!a.is_pinned && b.is_pinned) return 1;
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                })
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all group ${selectedConversationId === conversation.id
                      ? "bg-gray-100 border border-gray-300"
                      : "hover:bg-gray-100 border border-transparent"
                      }`}
                  >
                    <button
                      onClick={() => {
                        // Abort any ongoing request when switching conversations
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                          abortControllerRef.current = null;
                        }
                        setLoading(false);
                        setSelectedConversationId(conversation.id);
                      }}
                      className="flex-1 flex items-center gap-2 text-left truncate"
                    >
                      {conversation.is_pinned && <Pin className="h-3.5 w-3.5 text-gray-600 shrink-0" />}
                      <span className={`truncate text-sm ${selectedConversationId === conversation.id
                        ? "text-gray-900 font-medium"
                        : "text-gray-700"
                        }`}>
                        {conversation.title}
                      </span>
                    </button>
                    <ConversationMenu
                      conversation={conversation}
                      onPin={handlePinConversation}
                      onRename={handleRenameConversation}
                      onDelete={handleDeleteConversation}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col h-full bg-gray-50 text-gray-900">
        {/* Mobile menu button */}
        <div className="lg:hidden px-4 pt-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 active:scale-95"
          >
            {sidebarOpen ? <PanelLeftOpen className="h-5 w-5 text-black" /> : <PanelRightOpen className="h-5 w-5 text-black" />}
          </button>
        </div>

        {/* Desktop menu button */}
        {!sidebarOpen && (
          <div className="hidden lg:flex px-4 pt-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 active:scale-95"
            >
              <PanelRightOpen className="h-5 w-5 text-black" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto pb-40 pt-8 flex flex-col px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Start a new conversation
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Ask questions about news, get summaries, or explore topics with AI assistance.
                  </p>
                </div>
                <div className="w-full max-w-2xl">
                  <PromptChips onSelectPrompt={setInputMessage} />
                </div>
              </div>
            ) : (
              <MessageList
                loading={loading}
                messages={messages}
                onLoadingComplete={handleAnimationComplete}
                onEditMessage={handleEditMessage}
              />
            )}
          </div>
        </main>

        <footer className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
            {selectedArticles.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Context</p>
                <div className="flex flex-wrap gap-2">
                  {selectedArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-2 rounded-full bg-gray-100 border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <span className="truncate max-w-xs text-gray-800">
                        {article.title || 'No title available'}
                      </span>
                      <button
                        onClick={() => setSelectedArticles(selectedArticles.filter((a) => a.id !== article.id))}
                        className="text-gray-500 hover:text-gray-700 transition-colors leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ChatInput
              message={inputMessage}
              setMessage={setInputMessage}
              loading={loading}
              onSend={handleSend}
              onStop={handleStop}
            />
          </div>
        </footer>
      </div>

      <RenameDialog
        isOpen={renameDialog.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, conversationId: null, currentTitle: "" })}
        onConfirm={handleConfirmRename}
        currentTitle={renameDialog.currentTitle}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative">
              <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-black animate-spin" />
            </div>
            <p className="mt-4 text-gray-600 text-sm font-medium">Loading conversation...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
