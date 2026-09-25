"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pin, PinOff, Edit2, Trash2 } from "lucide-react";
import { Conversation } from "@/types/conversation";

interface ConversationMenuProps {
  conversation: Conversation;
  onPin: (conversationId: number, isPinned: boolean) => void;
  onRename: (conversationId: number, currentTitle: string) => void;
  onDelete: (conversationId: number) => void;
}

export default function ConversationMenu({
  conversation,
  onPin,
  onRename,
  onDelete,
}: ConversationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;
      event.stopPropagation();
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Visibility is the caller's business - the sidebar reveals this on
          hover for pointer devices and leaves it visible on touch. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Options for ${conversation.title}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`rounded-lg p-1.5 text-gray-400 outline-none transition-colors hover:bg-stone-200/70 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900/20 ${
          isOpen ? "bg-stone-200/70 text-gray-700" : ""
        }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-gray-200 bg-[#F0F0EB] py-1.5 shadow-xl"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(conversation.id, !conversation.is_pinned);
              setIsOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-stone-50"
          >
            {conversation.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 text-gray-500" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 text-gray-500" />
                Pin
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(conversation.id, conversation.title);
              setIsOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-stone-50"
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
            Rename
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.id);
              setIsOpen(false);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
