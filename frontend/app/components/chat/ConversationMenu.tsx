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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(conversation.id, !conversation.is_pinned);
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
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
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
            Rename
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Delete button clicked in menu for conversation:", conversation.id);
              onDelete(conversation.id);
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
