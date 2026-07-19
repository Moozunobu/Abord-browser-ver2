import React from "react";
import { TabState, AppSettings } from "../types";
import { Plus, X, Globe, Server, Loader2 } from "lucide-react";

interface BrowserTabsProps {
  tabs: TabState[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onAddTab: () => void;
  settings: AppSettings;
}

export default function BrowserTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  settings,
}: BrowserTabsProps) {
  const isJa = settings.lang === "ja";
  const isVertical = settings.tabLayout === "vertical";

  // テーマごとの色合いマッピング
  const themeStyles = {
    classic: {
      barBg: "bg-[#1c1b22]",
      border: "border-[#38383d]",
      activeTab: "bg-[#2b2a33] text-gray-100 border-t border-x border-[#38383d] z-10",
      activeTabVertical: "bg-[#2b2a33] text-gray-100 border border-[#38383d] z-10",
      inactiveTab: "text-gray-400 hover:bg-[#2b2a33]/50 hover:text-gray-200",
      btnHover: "hover:bg-[#2b2a33]",
      closeHover: "hover:bg-gray-700/50 text-gray-400 hover:text-gray-100",
    },
    light: {
      barBg: "bg-[#e3e3e9]",
      border: "border-gray-300",
      activeTab: "bg-[#f0f0f4] text-gray-950 border-t border-x border-gray-300 z-10 shadow-sm",
      activeTabVertical: "bg-[#f0f0f4] text-gray-950 border border-gray-300 z-10 shadow-sm",
      inactiveTab: "text-gray-600 hover:bg-white/40 hover:text-gray-900",
      btnHover: "hover:bg-white/50 text-gray-700",
      closeHover: "hover:bg-gray-200 text-gray-500 hover:text-gray-900",
    },
    midnight: {
      barBg: "bg-[#16161a]",
      border: "border-gray-800",
      activeTab: "bg-[#232329] text-gray-100 border-t border-x border-gray-800 z-10",
      activeTabVertical: "bg-[#232329] text-gray-100 border border-gray-800 z-10",
      inactiveTab: "text-gray-400 hover:bg-[#232329]/50 hover:text-gray-200",
      btnHover: "hover:bg-[#232329]",
      closeHover: "hover:bg-gray-800 text-gray-400 hover:text-gray-100",
    },
    sunset: {
      barBg: "bg-[#2a1414]",
      border: "border-red-950/40",
      activeTab: "bg-[#3c1e1e] text-gray-100 border-t border-x border-red-950/40 z-10",
      activeTabVertical: "bg-[#3c1e1e] text-gray-100 border border-red-950/40 z-10",
      inactiveTab: "text-gray-400 hover:bg-[#3c1e1e]/50 hover:text-gray-200",
      btnHover: "hover:bg-[#3c1e1e]",
      closeHover: "hover:bg-red-900/40 text-gray-400 hover:text-gray-100",
    },
  };

  const styles = themeStyles[settings.theme] || themeStyles.classic;

  const tooltipAdd = isJa ? "新しいタブを開く" : "Open a new tab";
  const tooltipClose = isJa ? "タブを閉じる" : "Close tab";

  // 1. 垂直（サイドバー）レイアウト
  if (isVertical) {
    return (
      <div className={`w-56 h-full flex flex-col p-3 border-r select-none shrink-0 transition-colors duration-200 ${styles.barBg} ${styles.border}`}>
        {/* サイドバーヘッダー（＋ボタン） */}
        <div className={`flex items-center justify-between pb-3 mb-2 border-b ${styles.border}`}>
          <span className={`text-[11px] font-bold tracking-wider uppercase opacity-75 ${settings.theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            {isJa ? "タブ一覧" : "Tabs"}
          </span>
          <button
            onClick={onAddTab}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${styles.btnHover} ${settings.theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            title={tooltipAdd}
            id="vertical-add-tab-btn"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 垂直タブ一覧 */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;

            // アイコン決定
            let IconNode = <Globe className="w-3.5 h-3.5 text-gray-400" />;
            if (tab.isLoading) {
              IconNode = <Loader2 className="w-3.5 h-3.5 text-[#00ddff] animate-spin" />;
            } else if (tab.viewMode === "browser") {
              IconNode = <Globe className="w-3.5 h-3.5 text-[#00ddff]" />;
            } else if (tab.viewMode === "export") {
              IconNode = <Server className="w-3.5 h-3.5 text-purple-400" />;
            }

            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2.5 px-3 py-2.5 text-xs font-normal rounded-lg cursor-pointer transition-all duration-150 relative select-none ${
                  isActive ? styles.activeTabVertical : styles.inactiveTab
                }`}
                id={`browser-tab-vertical-${tab.id}`}
              >
                {/* アイコン */}
                <div className="flex-shrink-0">{IconNode}</div>

                {/* タイトル */}
                <span className="flex-1 truncate pr-1 select-none font-medium text-[11px] tracking-wide">
                  {tab.title}
                </span>

                {/* 閉じるボタン */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className={`p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${styles.closeHover}`}
                    title={tooltipClose}
                    id={`close-tab-btn-vertical-${tab.id}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. 水平レイアウト（標準）
  return (
    <div className={`flex items-center px-3 pt-2 pb-1 border-b select-none h-12 transition-colors duration-200 ${styles.barBg} ${styles.border}`}>
      {/* タブ並びエリア */}
      <div className="flex gap-1 overflow-x-auto max-w-[calc(100%-44px)] scrollbar-none items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          // アイコン決定
          let IconNode = <Globe className="w-3.5 h-3.5 text-gray-400" />;
          if (tab.isLoading) {
            IconNode = <Loader2 className="w-3.5 h-3.5 text-[#00ddff] animate-spin" />;
          } else if (tab.viewMode === "browser") {
            IconNode = <Globe className="w-3.5 h-3.5 text-[#00ddff]" />;
          } else if (tab.viewMode === "export") {
            IconNode = <Server className="w-3.5 h-3.5 text-purple-400" />;
          }

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-normal rounded-md cursor-pointer transition-all duration-150 min-w-[120px] max-w-[180px] relative select-none ${
                isActive ? styles.activeTab : styles.inactiveTab
              }`}
              id={`browser-tab-${tab.id}`}
            >
              {/* アイコン */}
              <div className="flex-shrink-0">{IconNode}</div>

              {/* タイトル */}
              <span className="flex-1 truncate pr-1 select-none font-medium text-[11px] tracking-wide">
                {tab.title}
              </span>

              {/* 閉じるボタン */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className={`p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${styles.closeHover}`}
                  title={tooltipClose}
                  id={`close-tab-btn-${tab.id}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* プラスボタン */}
      <button
        onClick={onAddTab}
        className={`p-1.5 ml-2 rounded-md transition-colors cursor-pointer flex items-center justify-center flex-shrink-0 ${styles.btnHover} ${settings.theme === "light" ? "text-gray-700" : "text-gray-300"}`}
        title={tooltipAdd}
        id="new-tab-plus-btn"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
