import React, { useState } from "react";
import { ArrowRight, Settings } from "lucide-react";
import { AppSettings } from "../types";

interface BrowserNewTabProps {
  onSearch: (query: string) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export default function BrowserNewTab({
  onSearch,
  settings,
  onOpenSettings,
}: BrowserNewTabProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      onSearch(query);
    }
  };

  const isJa = settings.lang === "ja";

  // テーマに応じたスタイル
  const themeTextClass = settings.theme === "light" ? "text-gray-900" : "text-white";
  const themeSubtextClass = settings.theme === "light" ? "text-gray-500" : "text-gray-400";
  const themeContainerClass = 
    settings.theme === "light" ? "bg-[#f0f0f4]" :
    settings.theme === "midnight" ? "bg-[#0c0c0d]" :
    settings.theme === "sunset" ? "bg-[#3c1e1e]" :
    "bg-[#2b2a33]";

  return (
    <div className={`relative min-h-full w-full flex flex-col items-center justify-start px-6 pt-12 pb-20 select-none overflow-y-auto scrollbar-none transition-colors duration-200 ${themeContainerClass}`}>
      
      {/* 設定ボタン */}
      <button 
        onClick={onOpenSettings}
        className={`absolute top-4 right-6 text-xs bg-[#1c1b22] hover:bg-[#38383d] border border-[#4a4a4f]/40 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
          settings.theme === "light" ? "bg-white text-gray-800 border-gray-300 hover:bg-gray-100" : "text-gray-300"
        }`}
        title={isJa ? "ブラウザ設定を開く" : "Open Browser Settings"}
        id="personalize-btn"
      >
        <Settings className="w-3.5 h-3.5" />
        <span>{isJa ? "設定" : "Settings"}</span>
      </button>

      {/* Aboard タイトルデザイン */}
      <div className="flex flex-col items-center text-center mb-8 mt-4">
        <h1 className={`text-4xl md:text-5xl font-black tracking-tight select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${settings.theme === "light" ? "text-gray-900" : "text-white"}`}>
          Aboard
        </h1>
      </div>

      {/* ホーム検索バー */}
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-2xl flex items-center bg-[#1c1b22] border border-[#38383d] hover:border-[#5a5a5f] focus-within:border-[#0060df] focus-within:ring-4 focus-within:ring-[#0060df]/15 rounded-xl shadow-2xl px-4.5 py-3 mb-4 transition-all ${
          settings.theme === "light" ? "bg-white border-gray-300 hover:border-gray-400 focus-within:ring-blue-100" : ""
        }`}
      >
        {/* Googleの「G」ロゴ風アイコン */}
        <div className="w-6 h-6 flex items-center justify-center mr-3 font-black text-lg select-none flex-shrink-0" title="Googleでウェブを検索">
          <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
        </div>
        
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={isJa ? "ウェブを検索" : "Search the web"}
          className={`bg-transparent text-base outline-none w-full placeholder-gray-400 font-sans ${
            settings.theme === "light" ? "text-gray-950 placeholder-gray-500" : "text-gray-100"
          }`}
          id="newtab-search-input"
          autoFocus
        />
        
        <button 
          type="submit" 
          className={`text-gray-400 hover:text-white transition-colors ml-2 cursor-pointer flex items-center justify-center p-1 hover:bg-[#2b2a33] rounded-md ${
            settings.theme === "light" ? "hover:bg-gray-100 hover:text-gray-900 text-gray-500" : ""
          }`} 
          title={isJa ? "検索を実行" : "Search"}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
}
