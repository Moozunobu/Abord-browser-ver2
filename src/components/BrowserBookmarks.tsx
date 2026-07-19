import React from "react";
import { Globe, BookOpen, Github, Newspaper, HelpCircle, Flame } from "lucide-react";

interface BrowserBookmarksProps {
  onBookmarkClick: (query: string) => void;
}

export default function BrowserBookmarks({ onBookmarkClick }: BrowserBookmarksProps) {
  const bookmarks: any[] = [];

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 bg-[#1c1b22] px-4 py-1 border-b border-[#38383d] overflow-x-auto scrollbar-none text-xs select-none">
      <span className="text-gray-500 font-mono mr-2 flex-shrink-0">Bookmarks:</span>
      <div className="flex items-center gap-3">
        {bookmarks.map((bookmark) => {
          const { Icon } = bookmark;
          return (
            <button
              key={bookmark.query}
              onClick={() => onBookmarkClick(bookmark.query)}
              className="flex items-center gap-1 text-gray-400 hover:text-white hover:bg-[#2b2a33] px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap"
              id={`bookmark-${bookmark.label.replace(/\s+/g, "-")}`}
            >
              <Icon className={`w-3.5 h-3.5 ${bookmark.color}`} />
              <span>{bookmark.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
