import React, { useState, useEffect } from "react";
import { TabState, AppSettings } from "./types";
import BrowserTabs from "./components/BrowserTabs";
import BrowserToolbar from "./components/BrowserToolbar";
import BrowserBookmarks from "./components/BrowserBookmarks";
import BrowserNewTab from "./components/BrowserNewTab";
import BrowserFrame from "./components/BrowserFrame";
import ExportPanel from "./components/ExportPanel";
import SettingsPanel from "./components/SettingsPanel";
import { Loader2 } from "lucide-react";

export default function App() {
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  // カスタマイズ設定
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("browser-settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      tabLayout: "horizontal",
      theme: "classic",
      lang: "ja",
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("browser-settings", JSON.stringify(settings));
  }, [settings]);

  // 初期タブの作成
  useEffect(() => {
    const initialId = "tab-" + Math.random().toString(36).substr(2, 9);
    const initialTab: TabState = {
      id: initialId,
      title: settings.lang === "ja" ? "新しいタブ" : "New Tab",
      url: "",
      currentIframeUrl: "",
      history: ["home"],
      historyIndex: 0,
      viewMode: "home",
      isLoading: false,
      useProxy: true,
    };
    setTabs([initialTab]);
    setActiveTabId(initialId);
  }, [settings.lang]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // 拡張機能連携パネルを開く
  const handleOpenExport = () => {
    if (!activeTab) return;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;
        const histUpdate = pushToHistory(t, "export");
        return {
          ...t,
          title: "Workers連携 & コード出力",
          url: "chrome://workers-integration",
          currentIframeUrl: "",
          viewMode: "export",
          ...histUpdate,
        };
      })
    );
  };

  // Pキー長押し（2秒）検出
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let startTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key && e.key.toLowerCase() === "p") {
        if (e.repeat) return;

        startTime = Date.now();
        setShowProgress(true);
        setProgress(0);

        intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const percent = Math.min((elapsed / 2000) * 100, 100);
          setProgress(percent);

          if (elapsed >= 2000) {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
            setShowProgress(false);
            setProgress(0);
            handleOpenExport();
          }
        }, 50);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "p") {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        setShowProgress(false);
        setProgress(0);
      }
    };

    const handleBlur = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setShowProgress(false);
      setProgress(0);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTabId, tabs, activeTab]);

  // 新規タブの追加
  const handleAddTab = () => {
    const newId = "tab-" + Math.random().toString(36).substr(2, 9);
    const newTab: TabState = {
      id: newId,
      title: settings.lang === "ja" ? "新しいタブ" : "New Tab",
      url: "",
      currentIframeUrl: "",
      history: ["home"],
      historyIndex: 0,
      viewMode: "home",
      isLoading: false,
      useProxy: true,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // タブのクローズ
  const handleCloseTab = (idToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setTabs((prev) => {
      // タブが1個しかない場合は絶対に閉じない（不具合防止・セキュリティガード）
      if (prev.length <= 1) return prev;

      const index = prev.findIndex((t) => t.id === idToClose);
      if (index === -1) return prev;

      const newTabs = prev.filter((t) => t.id !== idToClose);

      // 閉じたタブがアクティブだった場合、別タブを選択
      if (activeTabId === idToClose) {
        const nextActiveIndex = index === 0 ? 0 : index - 1;
        setActiveTabId(newTabs[nextActiveIndex].id);
      }

      return newTabs;
    });
  };

  // タブ選択
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  // 履歴更新のヘルパー
  const pushToHistory = (tab: TabState, stateStr: string) => {
    const newHistory = tab.history.slice(0, tab.historyIndex + 1);
    if (newHistory[newHistory.length - 1] !== stateStr) {
      newHistory.push(stateStr);
    }
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  };

  // iframe URL解決ロジック（Google検索igu=1は直接、その他はプロキシ優先がセキュアで確実）
  const resolveIframeUrl = (url: string, useProxy: boolean) => {
    if (!url) return "";
    
    // Google検索のigu=1パラメータ付きURLは、直接接続が最も安定して動作する
    if (url.includes("google.com/search") && url.includes("igu=1")) {
      return url;
    }
    
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Webサイトへのナビゲーション・検索
  const handleNavigate = (input: string) => {
    if (!activeTab) return;

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    let targetUrl = trimmedInput;
    const isUrl = /^https?:\/\//i.test(trimmedInput) || (trimmedInput.includes(".") && !trimmedInput.includes(" "));

    if (!isUrl) {
      // 検索ワードの場合はGoogle検索のiframe用URLに自動変換
      targetUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmedInput)}`;
    } else if (!/^https?:\/\//i.test(targetUrl)) {
      // http/httpsがないURLは https:// を補完
      targetUrl = `https://${targetUrl}`;
    }

    const title = isUrl ? trimmedInput.replace(/^https?:\/\/(www\.)?/, "") : `検索: ${trimmedInput}`;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;

        const histUpdate = pushToHistory(t, targetUrl);
        const resolved = resolveIframeUrl(targetUrl, t.useProxy);

        return {
          ...t,
          title: title.length > 20 ? title.substring(0, 18) + "..." : title,
          url: targetUrl,
          currentIframeUrl: resolved,
          viewMode: "browser",
          ...histUpdate,
        };
      })
    );
  };

  // 戻る・進むナビゲーション
  const handleNavigateHistory = (direction: number) => {
    if (!activeTab) return;

    const targetIndex = activeTab.historyIndex + direction;
    if (targetIndex >= 0 && targetIndex < activeTab.history.length) {
      const historyState = activeTab.history[targetIndex];
      
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTabId) return t;

          let viewMode: TabState["viewMode"] = "home";
          let url = "";
          let currentIframeUrl = "";
          let title = t.title;

          if (historyState === "home") {
            viewMode = "home";
            url = "";
            currentIframeUrl = "";
            title = settings.lang === "ja" ? "新しいタブ" : "New Tab";
          } else {
            viewMode = "browser";
            url = historyState;
            currentIframeUrl = resolveIframeUrl(historyState, t.useProxy);
            const isSearch = historyState.includes("google.com/search");
            title = isSearch ? "Google検索結果" : historyState.replace(/^https?:\/\/(www\.)?/, "");
          }

          return {
            ...t,
            viewMode,
            url,
            currentIframeUrl,
            title: title.length > 20 ? title.substring(0, 18) + "..." : title,
            historyIndex: targetIndex,
          };
        })
      );
    }
  };

  // リフレッシュ
  const handleRefresh = () => {
    if (!activeTab || activeTab.viewMode !== "browser") return;

    // 一旦iframeURLを空にして、直後に再設定することでリロード効果を得る
    const currentIframe = activeTab.currentIframeUrl;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, currentIframeUrl: "" } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, currentIframeUrl: currentIframe } : t))
      );
    }, 50);
  };

  // ホームへ戻る
  const handleGoHome = () => {
    if (!activeTab) return;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;
        const histUpdate = pushToHistory(t, "home");
        return {
          ...t,
          title: settings.lang === "ja" ? "新しいタブ" : "New Tab",
          url: "",
          currentIframeUrl: "",
          viewMode: "home",
          ...histUpdate,
        };
      })
    );
  };

  // プロキシ解除トグルスイッチ
  const handleToggleProxy = () => {
    if (!activeTab || activeTab.viewMode !== "browser") return;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;
        const nextProxyState = !t.useProxy;
        const resolved = resolveIframeUrl(t.url, nextProxyState);
        return {
          ...t,
          useProxy: nextProxyState,
          currentIframeUrl: resolved,
        };
      })
    );
  };

  // テーマごとの全体背景色や配色設定
  const themeStyles = {
    classic: {
      appBg: "bg-[#1c1b22]",
      contentBg: "bg-[#2b2a33]",
      text: "text-gray-100",
      loaderText: "text-gray-400",
    },
    light: {
      appBg: "bg-[#e3e3e9]",
      contentBg: "bg-[#f0f0f4]",
      text: "text-gray-900",
      loaderText: "text-gray-600",
    },
    midnight: {
      appBg: "bg-[#16161a]",
      contentBg: "bg-[#0c0c0d]",
      text: "text-gray-100",
      loaderText: "text-gray-500",
    },
    sunset: {
      appBg: "bg-[#2a1414]",
      contentBg: "bg-[#3c1e1e]",
      text: "text-gray-100",
      loaderText: "text-gray-400",
    },
  }[settings.theme] || {
    appBg: "bg-[#1c1b22]",
    contentBg: "bg-[#2b2a33]",
    text: "text-gray-100",
    loaderText: "text-gray-400",
  };

  const isVertical = settings.tabLayout === "vertical";

  return (
    <div className={`flex ${isVertical ? "flex-row" : "flex-col"} h-screen ${themeStyles.appBg} font-sans ${themeStyles.text} overflow-hidden transition-colors duration-200`}>
      
      {/* Pキー長押しプログレスインジケーター */}
      {showProgress && (
        <div className="fixed bottom-6 left-6 bg-[#1c1b22]/95 border border-[#0060df]/50 rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-2 select-none animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-[#00ddff] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#00ddff] animate-ping" />
            <span>Workers連携コードを開いています... Pキー長押し中</span>
          </div>
          <div className="w-56 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0060df] via-[#00ddff] to-cyan-400 h-2 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Progress: {Math.round(progress)}%</span>
            <span>あと {Math.max(0, 2 - (progress / 100) * 2).toFixed(1)} 秒</span>
          </div>
        </div>
      )}

      {/* 1. 垂直（サイドバー）タブバー */}
      {isVertical && (
        <BrowserTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onAddTab={handleAddTab}
          settings={settings}
        />
      )}

      {/* 右側のメイン領域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 2. 水平タブバー（上部） */}
        {!isVertical && (
          <BrowserTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onAddTab={handleAddTab}
            settings={settings}
          />
        )}

        {/* 3. ツールバー */}
        {activeTab && (
          <BrowserToolbar
            activeTab={activeTab}
            onNavigateHistory={handleNavigateHistory}
            onRefresh={handleRefresh}
            onGoHome={handleGoHome}
            onSearch={handleNavigate}
            onOpenExport={handleOpenExport}
            onToggleProxy={handleToggleProxy}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* 4. ブックマークバー */}
        <BrowserBookmarks onBookmarkClick={handleNavigate} />

        {/* 5. コンテンツエリア */}
        <div className={`flex-1 relative overflow-hidden transition-colors duration-200 ${themeStyles.contentBg}`}>
          {activeTab ? (
            activeTab.isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4" id="browser-loading-spinner">
                <Loader2 className="w-10 h-10 text-[#00ddff] animate-spin" />
                <p className={`text-sm font-medium animate-pulse ${themeStyles.loaderText}`}>
                  {settings.lang === "ja" 
                    ? "セキュリティ制限(X-Frame-Options)解除プロキシを接続中..." 
                    : "Connecting iframe unblock proxy..."}
                </p>
              </div>
            ) : (
              <>
                {activeTab.viewMode === "home" && (
                  <BrowserNewTab 
                    onSearch={handleNavigate} 
                    settings={settings}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                )}
                {activeTab.viewMode === "browser" && (
                  <BrowserFrame
                    tab={activeTab}
                    onRefresh={handleRefresh}
                  />
                )}
                {activeTab.viewMode === "export" && (
                  <ExportPanel />
                )}
              </>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* カスタマイズ設定ドロワー */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
      />

    </div>
  );
}
