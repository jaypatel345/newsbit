"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, PanelLeftClose, Pin, Search, SquarePen, X } from "lucide-react";
import ConversationMenu from "@/app/components/chat/ConversationMenu";
import { Conversation } from "@/types/conversation";

interface ChatSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversationId: number | null;
  open: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: number) => void;
  onCreateConversation: () => void;
  onPinConversation: (conversationId: number, isPinned: boolean) => void;
  onRenameConversation: (conversationId: number, currentTitle: string) => void;
  onDeleteConversation: (conversationId: number) => void;
}

/** Buckets the list into the labelled sections the sidebar renders, newest first. */
const DAY_MS = 24 * 60 * 60 * 1000;

function bucketFor(updatedAt: string): string {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(updated)) return "Earlier";

  const daysAgo = Math.floor((startOfToday.getTime() - updated) / DAY_MS);
  if (daysAgo < 0) return "Today";
  if (daysAgo === 0) return "Yesterday";
  if (daysAgo < 7) return "Previous 7 days";
  if (daysAgo < 30) return "Previous 30 days";
  return "Earlier";
}

const BUCKET_ORDER = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Earlier",
];

export default function ChatSidebar({
  conversations,
  isLoading,
  selectedConversationId,
  open,
  onClose,
  onSelectConversation,
  onCreateConversation,
  onPinConversation,
  onRenameConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  // Escape closes the mobile drawer; on desktop the panel is part of the
  // layout, so the same key would yank away something the reader is using.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (window.matchMedia("(min-width: 1024px)").matches) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const sorted = useMemo(
    () =>
      conversations.slice().sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }),
    [conversations],
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sorted;
    return sorted.filter((conv) =>
      (conv.title ?? "").toLowerCase().includes(needle),
    );
  }, [sorted, query]);

  // Pinned chats stay in their own section at the top; everything else falls
  // into a recency bucket so a long history stays scannable.
  const sections = useMemo(() => {
    const pinned = matches.filter((conv) => conv.is_pinned);
    const grouped = new Map<string, Conversation[]>();

    for (const conv of matches) {
      if (conv.is_pinned) continue;
      const bucket = bucketFor(conv.updated_at);
      const existing = grouped.get(bucket);
      if (existing) existing.push(conv);
      else grouped.set(bucket, [conv]);
    }

    const result: { label: string; items: Conversation[] }[] = [];
    if (pinned.length > 0) result.push({ label: "Pinned", items: pinned });
    for (const label of BUCKET_ORDER) {
      const items = grouped.get(label);
      if (items?.length) result.push({ label, items });
    }
    return result;
  }, [matches]);

  const showSearch = !isLoading && conversations.length > 0;

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Conversations"
        aria-hidden={!open}
        inert={!open ? true : undefined}
        // Widths live in the open/closed branches rather than the shared
        // classes: two `lg:w-*` utilities on one element resolve by Tailwind's
        // own ordering, not by ours, so the panel would never collapse.
        className={`fixed inset-y-0 left-0 z-30 flex h-full shrink-0 flex-col bg-white transition-[transform,width,opacity] duration-300 ease-out lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 ${
          open
            ? "w-[86vw] max-w-[320px] translate-x-0 border-r border-gray-200 lg:w-80 lg:opacity-100"
            : "w-[86vw] max-w-[320px] -translate-x-full border-r border-gray-200 lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0"
        }`}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-3.5">
          <Link
            href="/"
            className="flex items-center rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-gray-900/20"
          >
            <img
              src="/newsbit_logo/logo_without_bg.png"
              alt="Newsbit"
              className="h-6 w-6 shrink-0"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="shrink-0 rounded-lg p-2 text-gray-500 outline-none transition-colors hover:bg-stone-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/20 active:scale-95"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        </header>

        {/* New chat + search */}
        <div className="shrink-0 space-y-2.5 px-3 pb-3">
          <button
            type="button"
            onClick={onCreateConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            <SquarePen className="h-4 w-4" />
            New Chat
          </button>

          {showSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <label htmlFor={searchId} className="sr-only">
                Search conversations
              </label>
              <input
                id={searchId}
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.stopPropagation();
                    setQuery("");
                  }
                }}
                placeholder="Search chats"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:bg-stone-50 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-stone-200/70 hover:text-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* List */}
        <nav
          aria-label="Recent conversations"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
        >
          {isLoading ? (
            <ul className="space-y-1.5 pt-1" aria-hidden>
              {Array.from({ length: 6 }).map((_, index) => (
                <li
                  key={index}
                  className="h-9 animate-pulse rounded-lg bg-stone-100"
                  style={{ animationDelay: `${index * 60}ms` }}
                />
              ))}
            </ul>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                {query ? (
                  <Search className="h-[18px] w-[18px] text-gray-400" />
                ) : (
                  <MessageSquare className="h-[18px] w-[18px] text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700">
                {query ? "No matching chats" : "No chats yet"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {query
                  ? `Nothing matches “${query.trim()}”.`
                  : "Start a new chat to ask about today’s news."}
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.label} className="pb-1">
                <h2 className="sticky top-0 z-10 flex items-center gap-1.5 bg-white/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 backdrop-blur-sm">
                  {section.label === "Pinned" && (
                    <Pin className="h-3 w-3" aria-hidden />
                  )}
                  {section.label}
                </h2>

                <ul className="space-y-0.5">
                  {section.items.map((conversation) => {
                    const isActive = selectedConversationId === conversation.id;
                    return (
                      <li key={conversation.id} className="group relative">
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gray-900"
                          />
                        )}
                        <div
                          className={`flex items-center gap-1 rounded-lg pl-3 pr-1 transition-colors ${
                            isActive ? "bg-stone-100" : "hover:bg-stone-100/70"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectConversation(conversation.id)}
                            aria-current={isActive ? "page" : undefined}
                            title={conversation.title}
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                          >
                            {conversation.is_pinned && (
                              <Pin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            )}
                            <span
                              className={`truncate text-sm ${
                                isActive
                                  ? "font-medium text-gray-900"
                                  : "text-gray-600 group-hover:text-gray-900"
                              }`}
                            >
                              {conversation.title}
                            </span>
                          </button>

                          {/* Hidden until hover on pointer devices, always
                              reachable on touch and via keyboard focus. */}
                          <div
                            className={`shrink-0 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 ${
                              isActive ? "lg:opacity-100" : ""
                            }`}
                          >
                            <ConversationMenu
                              conversation={conversation}
                              onPin={onPinConversation}
                              onRename={onRenameConversation}
                              onDelete={onDeleteConversation}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
