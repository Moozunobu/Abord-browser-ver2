import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Globe, Settings } from "lucide-react";
import { TabState, AppSettings } from "../types";

interface BrowserToolbarProps {
  activeTab: TabState;
  onNavigateHistory: (direction: number) => void;
  onRefresh: () => void;
  onGoHome: () => void;
  onSearch: (query: string) => void;
  onOpenExport: () => void;
  onToggleProxy?: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export default function BrowserToolbar({
  activeTab,
  onNavigateHistory,
  onRefresh,
  onGoHome,
  onSearch,
  onOpenExport,
  onToggleProxy,
  settings,
  onOpenSettings,
}: BrowserToolbarProps) {
  const [inputValue, setInputValue] = useState(activeTab.url);

  // アクティブなタブのURL（検索クエリやWebサイトURL）が変化したら、入力フィールドも同期する
  useEffect(() => {
    setInputValue(activeTab.url);
  }, [activeTab.url, activeTab.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      onSearch(query);
    }
  };

  const isJa = settings.lang === "ja";
  const isBackDisabled = activeTab.historyIndex <= 0;
  const isForwardDisabled = activeTab.historyIndex >= activeTab.history.length - 1;

  // テーマ別のカラースタイルマッピング
  const themeStyles = {
    classic: {
      barBg: "bg-[#2b2a33]",
      border: "border-[#38383d]",
      inputBg: "bg-[#1c1b22]",
      inputBorder: "border-[#38383d]",
      btnHover: "hover:bg-[#38383d] text-gray-100",
      text: "text-gray-100",
      placeholder: "placeholder-gray-400",
    },
    light: {
      barBg: "bg-[#f0f0f4]",
      border: "border-gray-300",
      inputBg: "bg-white",
      inputBorder: "border-gray-300",
      btnHover: "hover:bg-gray-200 text-gray-800 disabled:hover:bg-transparent",
      text: "text-gray-800",
      placeholder: "placeholder-gray-500",
    },
    midnight: {
      barBg: "bg-[#16161a]",
      border: "border-gray-800",
      inputBg: "bg-[#0c0c0d]",
      inputBorder: "border-gray-800",
      btnHover: "hover:bg-[#232329] text-gray-100",
      text: "text-gray-100",
      placeholder: "placeholder-gray-500",
    },
    sunset: {
      barBg: "bg-[#3c1e1e]",
      border: "border-red-950/40",
      inputBg: "bg-[#2a1414]",
      inputBorder: "border-red-950/20",
      btnHover: "hover:bg-[#4d2727] text-gray-100",
      text: "text-gray-100",
      placeholder: "placeholder-gray-400",
    },
  };

  const styles = themeStyles[settings.theme] || themeStyles.classic;

  const t = {
    back: isJa ? "戻る" : "Back",
    forward: isJa ? "進む" : "Forward",
    reload: isJa ? "再読み込み" : "Reload",
    home: isJa ? "ホーム" : "Home",
    placeholder: isJa ? "Google で検索、または URL を入力します" : "Search with Google or enter URL",
    execute: isJa ? "検索・移動を実行" : "Search or Go",
    proxyEnabled: isJa ? "プロキシ(X-Frame解除)有効: iframe不許可サイトを表示できます" : "Proxy enabled: Bypass iframe restrictions",
    proxyDisabled: isJa ? "ダイレクト接続(プロキシ無効): 直リンクで高速に読み込みます" : "Direct connect: High-speed connection",
    proxyLabel: isJa ? "X-Frame解除プロキシ" : "Bypass Proxy",
    settings: isJa ? "ブラウザ設定" : "Browser Settings",
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-b transition-colors duration-200 ${styles.barBg} ${styles.border}`}>
      
      {/* 戻る・進む・リロード・ホーム */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onNavigateHistory(-1)}
          disabled={isBackDisabled}
          className={`p-1.5 rounded disabled:text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer ${styles.btnHover}`}
          title={t.back}
          id="toolbar-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateHistory(1)}
          disabled={isForwardDisabled}
          className={`p-1.5 rounded disabled:text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer ${styles.btnHover}`}
          title={t.forward}
          id="toolbar-forward-btn"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          className={`p-1.5 rounded transition-colors cursor-pointer ${styles.btnHover}`}
          title={t.reload}
          id="toolbar-refresh-btn"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={onGoHome}
          className={`p-1.5 rounded transition-colors cursor-pointer ${styles.btnHover}`}
          title={t.home}
          id="toolbar-home-btn"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* アドレスバー */}
      <form 
        onSubmit={handleSubmit} 
        className={`flex-1 flex items-center border focus-within:border-[#0060df] focus-within:ring-2 focus-within:ring-[#0060df]/20 rounded-md px-3 py-1.5 transition-all ${styles.inputBg} ${styles.inputBorder}`}
      >
        <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.placeholder}
          className={`bg-transparent text-sm outline-none w-full ${styles.text} ${styles.placeholder}`}
          id="toolbar-address-input"
        />
        <button 
          type="submit" 
          className="text-gray-400 hover:text-white transition-colors ml-1 cursor-pointer p-0.5" 
          title={t.execute}
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* 右側のプロキシトグル ＆ 設定（パーソナライズ）ボタン */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onToggleProxy && activeTab.viewMode === "browser" && (
          <button
            onClick={onToggleProxy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium text-xs border transition-all cursor-pointer ${
              activeTab.useProxy
                ? "bg-[#0060df]/20 text-[#00ddff] border-[#0060df]/40"
                : "bg-gray-800/50 text-gray-400 border-transparent hover:border-gray-700 hover:bg-gray-800"
            }`}
            title={activeTab.useProxy ? t.proxyEnabled : t.proxyDisabled}
            id="toolbar-proxy-toggle-btn"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab.useProxy ? "bg-[#00ddff] animate-pulse" : "bg-gray-500"}`} />
            <span className="hidden md:inline text-[11px]">{t.proxyLabel}</span>
          </button>
        )}

        {/* クイック設定ボタン */}
        <button
          onClick={onOpenSettings}
          className={`p-1.5 rounded transition-colors cursor-pointer ${styles.btnHover}`}
          title={t.settings}
          id="toolbar-settings-btn"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
