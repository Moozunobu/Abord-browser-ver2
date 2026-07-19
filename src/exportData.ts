export const EXPORT_FILES = {
  indexHtml: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FoxTab Web Browser</title>
  <link rel="stylesheet" href="style.css">
  <!-- Lucide Icons for nice UI icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <div class="browser-container">
    <!-- 1. Firefox風 タブバー -->
    <header class="tab-bar">
      <div class="tabs-container" id="tabs-container">
        <!-- JavaScriptでタブが動的に追加されます -->
      </div>
      <button class="add-tab-btn" id="add-tab-btn" title="新しいタブを開く">
        <i data-lucide="plus"></i>
      </button>
    </header>

    <!-- 2. ナビゲーション＆アドレスバー -->
    <div class="toolbar">
      <div class="nav-buttons">
        <button class="nav-btn" id="back-btn" disabled title="戻る">
          <i data-lucide="arrow-left"></i>
        </button>
        <button class="nav-btn" id="forward-btn" disabled title="進む">
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="nav-btn" id="refresh-btn" title="更新">
          <i data-lucide="rotate-cw"></i>
        </button>
        <button class="nav-btn" id="home-btn" title="ホーム（新しいタブ）">
          <i data-lucide="home"></i>
        </button>
      </div>
      
      <div class="address-bar-container">
        <i data-lucide="globe" class="address-icon"></i>
        <input type="text" id="address-input" class="address-input" placeholder="Googleで検索するキーワード、または URL (https://...) を入力...">
        <button class="search-go-btn" id="search-go-btn" title="検索を実行">
          <i data-lucide="search"></i>
        </button>
      </div>

      <!-- プロキシ解除トグル -->
      <button class="proxy-toggle-btn" id="proxy-toggle-btn" title="プロキシ経由とダイレクト接続を切り替えます">
        <span class="status-dot"></span>
        <span class="btn-text">X-Frame解除プロキシ</span>
      </button>
    </div>

    <!-- 4. メインコンテンツエリア -->
    <main class="content-area" id="content-area">
      <!-- JavaScriptによって画面が切り替わります -->
    </main>
  </div>

  <!-- Lucide アイコンのレンダリング初期化 -->
  <script>
    lucide.createIcons();
  </script>
  <script src="app.js"></script>
</body>
</html>`,

  styleCss: `/* Firefox風 モダンブラウザUI スタイルシート */
:root {
  --bg-color: #0c0c0d;          /* Firefoxに近い超ダークカラー */
  --toolbar-bg: #1c1b22;       /* ツールバー、アクティブタブの背景 */
  --tab-inactive: transparent; /* 非アクティブタブの背景 */
  --text-color: #fbfbfe;       /* 文字色 */
  --text-muted: #bfbfc9;       /* 落ち着いた文字色 */
  --accent-color: #ff9400;     /* アクセント（Firefoxオレンジ） */
  --input-bg: #2b2a33;         /* 入力欄の背景 */
  --border-color: #38383d;     /* 境界線 */
  --card-bg: #1c1b22;          /* カード背景 */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  overflow: hidden;
  height: 100vh;
}

.browser-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 1. タブバー */
.tab-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-color);
  padding: 10px 12px 4px 12px;
  border-bottom: 1px solid var(--border-color);
  height: 48px;
}

.tabs-container {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  max-width: calc(100% - 44px);
  align-items: center;
  height: 100%;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--tab-inactive);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  max-width: 180px;
  min-width: 100px;
  white-space: nowrap;
  position: relative;
  transition: background-color 0.15s, color 0.15s;
  border: 1px solid transparent;
}

.tab:hover {
  background-color: rgba(43, 42, 51, 0.5);
  color: var(--text-color);
}

.tab.active {
  background-color: var(--toolbar-bg);
  color: var(--text-color);
  border-color: var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  width: 14px;
  height: 14px;
}

.tab-close:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--text-color);
}

.add-tab-btn {
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.add-tab-btn:hover {
  background-color: #2b2a33;
}

/* 2. ツールバーとアドレスバー */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--toolbar-bg);
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.nav-buttons {
  display: flex;
  gap: 6px;
}

.nav-btn {
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--input-bg);
}

.nav-btn:disabled {
  color: #55555a;
  cursor: not-allowed;
}

.address-bar-container {
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--input-bg);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  padding: 6px 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.address-bar-container:focus-within {
  border-color: rgba(255, 148, 0, 0.8);
  box-shadow: 0 0 0 2px rgba(255, 148, 0, 0.2);
}

.address-icon {
  color: var(--text-muted);
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.address-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 14px;
  outline: none;
}

.search-go-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.search-go-btn:hover {
  color: var(--text-color);
}

/* プロキシ解除ボタン */
.proxy-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--input-bg);
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.proxy-toggle-btn.enabled {
  background-color: rgba(255, 148, 0, 0.1);
  border-color: rgba(255, 148, 0, 0.3);
  color: var(--accent-color);
}

.proxy-toggle-btn .status-dot {
  width: 6px;
  height: 6px;
  background-color: #55555a;
  border-radius: 50%;
}

.proxy-toggle-btn.enabled .status-dot {
  background-color: var(--accent-color);
  box-shadow: 0 0 8px var(--accent-color);
}

/* 4. コンテンツエリア */
.content-area {
  flex: 1;
  background-color: var(--bg-color);
  position: relative;
}

/* A. 新しいタブ 画面 (Firefox風ホーム) */
.new-tab-home {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.firefox-logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  text-align: center;
}

.firefox-logo-container {
  position: relative;
  width: 96px;
  height: 96px;
  margin-bottom: 24px;
  filter: drop-shadow(0 10px 25px rgba(255, 148, 0, 0.35));
}

.firefox-logo-glow {
  position: absolute;
  inset: 0;
  background: gradient(to tr, #ff003c, #ff9400);
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.6;
}

.firefox-logo-earth {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: linear-gradient(135deg, #1d4ed8, #1e1b4b);
  border-radius: 50%;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.1);
}

.firefox-logo-fox {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ff9400, #ff003c);
  border-radius: 50%;
  clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40%);
}

.firefox-logo-area h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.5px;
}

.firefox-logo-area h1 span {
  color: var(--accent-color);
}

.firefox-logo-area p {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 10px;
  line-height: 1.5;
}

.home-search-container {
  width: 100%;
  max-width: 560px;
  display: flex;
  background-color: rgba(28, 27, 34, 0.9);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 10px 18px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
}

.home-search-container:focus-within {
  border-color: rgba(255, 148, 0, 0.8);
  box-shadow: 0 0 0 2px rgba(255, 148, 0, 0.2);
}

.home-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-size: 16px;
}

.home-search-btn {
  background: transparent;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* B. ブラウザフレーム画面 */
.browser-frame-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.connection-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #14131a;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-indicator.proxy {
  color: var(--accent-color);
}

.status-indicator.direct {
  color: #00ff66;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ext-link {
  color: var(--text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
}

.ext-link:hover {
  color: var(--text-color);
}

.iframe-viewport {
  flex: 1;
  position: relative;
  background-color: #fff;
}

.iframe-viewport iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* C. ローディング & エラースピナー */
.iframe-overlay {
  position: absolute;
  inset: 0;
  background-color: #0c0c0d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 100;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 148, 0, 0.1);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`,

  appJs: `/**
 * FoxTab Web Browser - フロントエンドメインロジック (app.js)
 */

const WORKER_API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("3000") || window.location.origin.includes("run.app")
  ? "/api" // ローカル開発またはAI Studio上でのAPIパス
  : "https://web-browser.mozunbu0123.workers.dev"; // ←本番WorkerのURLを入力

let tabs = [];
let activeTabId = null;

// DOM要素
const tabsContainer = document.getElementById("tabs-container");
const addTabBtn = document.getElementById("add-tab-btn");
const addressInput = document.getElementById("address-input");
const searchGoBtn = document.getElementById("search-go-btn");
const backBtn = document.getElementById("back-btn");
const forwardBtn = document.getElementById("forward-btn");
const refreshBtn = document.getElementById("refresh-btn");
const homeBtn = document.getElementById("home-btn");
const proxyToggleBtn = document.getElementById("proxy-toggle-btn");
const contentArea = document.getElementById("content-area");

function generateId() {
  return "tab-" + Math.random().toString(36).substr(2, 9);
}

function init() {
  addTabBtn.addEventListener("click", () => createNewTab());
  addressInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAddressSubmit();
  });
  searchGoBtn.addEventListener("click", handleAddressSubmit);
  
  backBtn.addEventListener("click", () => navigateHistory(-1));
  forwardBtn.addEventListener("click", () => navigateHistory(1));
  refreshBtn.addEventListener("click", () => refreshTab());
  homeBtn.addEventListener("click", () => goHome());

  if (proxyToggleBtn) {
    proxyToggleBtn.addEventListener("click", toggleProxyMode);
  }

  createNewTab();
}

function createNewTab() {
  const tabId = generateId();
  const newTab = {
    id: tabId,
    title: "新しいタブ",
    url: "",
    currentIframeUrl: "",
    viewMode: "home", // "home" | "browser"
    useProxy: true,  // デフォルトでセキュリティ回避プロキシを使用
    history: ["home"],
    historyIndex: 0
  };

  tabs.push(newTab);
  setActiveTab(tabId);
}

function setActiveTab(tabId) {
  activeTabId = tabId;
  renderTabs();
  renderContent();
  updateToolbar();
}

function closeTab(tabId, event) {
  if (event) event.stopPropagation();

  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  if (tabs.length === 1) {
    tabs = [];
    createNewTab();
    return;
  }

  if (activeTabId === tabId) {
    const nextActiveIndex = tabIndex === 0 ? 1 : tabIndex - 1;
    activeTabId = tabs[nextActiveIndex].id;
  }

  tabs.splice(tabIndex, 1);
  renderTabs();
  renderContent();
  updateToolbar();
}

function navigateHistory(direction) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  const targetIndex = tab.historyIndex + direction;
  if (targetIndex >= 0 && targetIndex < tab.history.length) {
    tab.historyIndex = targetIndex;
    const historyState = tab.history[targetIndex];
    
    if (historyState === "home") {
      tab.viewMode = "home";
      tab.url = "";
      tab.currentIframeUrl = "";
      tab.title = "新しいタブ";
    } else {
      tab.viewMode = "browser";
      tab.url = historyState;
      tab.currentIframeUrl = resolveIframeUrl(historyState, tab.useProxy);
      tab.title = cleanTitle(historyState);
    }

    renderTabs();
    renderContent();
    updateToolbar();
  }
}

function refreshTab() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  if (tab.viewMode === "browser") {
    // iframeのsrcを再セットしてリロード
    const iframe = contentArea.querySelector("iframe");
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = "";
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 50);
    }
  }
}

function goHome() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  tab.viewMode = "home";
  tab.url = "";
  tab.currentIframeUrl = "";
  tab.title = "新しいタブ";
  
  pushToHistory(tab, "home");
  
  renderTabs();
  renderContent();
  updateToolbar();
}

function handleAddressSubmit() {
  const value = addressInput.value.trim();
  if (!value) return;

  navigateBrowser(value);
}

function navigateBrowser(input) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  let targetUrl = input;

  // URL判定ロジック
  const isUrl = /^https?:\/\//i.test(input) || (input.includes(".") && !input.includes(" "));
  
  if (!isUrl) {
    // 検索ワードの場合は Google 検索
    targetUrl = "https://www.google.com/search?igu=1&q=" + encodeURIComponent(input);
  } else if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "https://" + targetUrl;
  }

  tab.viewMode = "browser";
  tab.url = targetUrl;
  tab.currentIframeUrl = resolveIframeUrl(targetUrl, tab.useProxy);
  tab.title = cleanTitle(targetUrl);

  pushToHistory(tab, targetUrl);

  renderTabs();
  renderContent();
  updateToolbar();
}

function resolveIframeUrl(url, useProxy) {
  // Google検索のigu=1パラメータ付きURLは、プロキシを通さなくても表示可能な場合があるため直接開く
  if (url.includes("google.com/search") && url.includes("igu=1")) {
    return url;
  }
  
  if (useProxy) {
    return WORKER_API_BASE + "/proxy?url=" + encodeURIComponent(url);
  }
  return url;
}

function toggleProxyMode() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab || tab.viewMode !== "browser") return;

  tab.useProxy = !tab.useProxy;
  tab.currentIframeUrl = resolveIframeUrl(tab.url, tab.useProxy);
  
  // ツールバーと画面を更新
  updateToolbar();
  renderContent();
}

function pushToHistory(tab, state) {
  tab.history = tab.history.slice(0, tab.historyIndex + 1);
  if (tab.history[tab.history.length - 1] !== state) {
    tab.history.push(state);
    tab.historyIndex = tab.history.length - 1;
  }
}

function updateToolbar() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  addressInput.value = tab.url;
  
  backBtn.disabled = tab.historyIndex <= 0;
  forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;

  if (proxyToggleBtn) {
    if (tab.viewMode === "browser") {
      proxyToggleBtn.style.display = "flex";
      if (tab.useProxy) {
        proxyToggleBtn.classList.add("enabled");
      } else {
        proxyToggleBtn.classList.remove("enabled");
      }
    } else {
      proxyToggleBtn.style.display = "none";
    }
  }
}

function renderTabs() {
  tabsContainer.innerHTML = "";
  tabs.forEach(tab => {
    const isActive = tab.id === activeTabId;
    
    const tabEl = document.createElement("div");
    tabEl.className = "tab" + (isActive ? " active" : "");
    tabEl.addEventListener("click", () => setActiveTab(tab.id));

    let tabIconHtml = '<i data-lucide="globe" style="width: 14px; height: 14px; color: #ff9400;"></i>';

    tabEl.innerHTML = \`
      \${tabIconHtml}
      <span class="tab-title">\${escapeHtml(tab.title)}</span>
      <button class="tab-close"><i data-lucide="x" style="width: 12px; height: 12px;"></i></button>
    \`;

    tabEl.querySelector(".tab-close").addEventListener("click", (e) => closeTab(tab.id, e));
    tabsContainer.appendChild(tabEl);
  });

  lucide.createIcons();
}

function renderContent() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  contentArea.innerHTML = "";

  if (tab.viewMode === "home") {
    renderHomeView();
  } else if (tab.viewMode === "browser") {
    renderBrowserView(tab);
  }
}

function renderHomeView() {
  const homeEl = document.createElement("div");
  homeEl.className = "new-tab-home";
  homeEl.innerHTML = \`
    <div class="firefox-logo-area">
      <div class="firefox-logo-container">
        <div class="firefox-logo-glow"></div>
        <div class="firefox-logo-earth"></div>
        <div class="firefox-logo-fox"></div>
      </div>
      <h1>Firefox <span>FoxTab</span></h1>
      <p>Firefoxの高速、プライベート、安全なスピリットを受け継いだWebブラウザ。<br>X-Frame-Options 制限を解除するプロキシエンジンを標準搭載。</p>
    </div>

    <div class="home-search-container">
      <input type="text" id="home-search-input" class="home-search-input" placeholder="検索キーワード、または URL を入力...">
      <button id="home-search-btn" class="home-search-btn"><i data-lucide="search"></i></button>
    </div>
  \`;

  contentArea.appendChild(homeEl);

  const homeInput = document.getElementById("home-search-input");
  const homeBtn = document.getElementById("home-search-btn");

  const submitSearch = () => {
    const val = homeInput.value.trim();
    if (val) navigateBrowser(val);
  };

  homeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitSearch();
  });
  homeBtn.addEventListener("click", submitSearch);

  lucide.createIcons();
}

function renderBrowserView(tab) {
  const container = document.createElement("div");
  container.className = "browser-frame-container";

  const statusText = tab.useProxy ? "プロキシ接続中 (X-Frame制限解除)" : "ダイレクト接続中";
  const indicatorClass = tab.useProxy ? "proxy" : "direct";

  container.innerHTML = \`
    <div class="connection-status-bar">
      <div class="status-left">
        <div class="status-indicator \${indicatorClass}">
          <i data-lucide="shield-check" style="width:14px; height:14px;"></i>
          <span>\${statusText}</span>
        </div>
        <span style="color:#38383d;">|</span>
        <span style="max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="\${escapeHtml(tab.currentIframeUrl)}">
          宛先: \${escapeHtml(tab.currentIframeUrl)}
        </span>
      </div>
      <div class="status-right">
        <a class="ext-link" href="\${tab.url}" target="_blank" rel="noopener noreferrer">
          外部で開く <i data-lucide="external-link" style="width:12px; height:12px;"></i>
        </a>
      </div>
    </div>
    <div class="iframe-viewport">
      <div class="iframe-overlay" id="iframe-loader">
        <div class="spinner"></div>
        <p style="font-size:13px; color:var(--text-muted);">ページを読み込み中...</p>
      </div>
      <iframe src="\${tab.currentIframeUrl}" id="web-iframe" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
    </div>
  \`;

  contentArea.appendChild(container);

  // iframeロード完了検知
  const iframe = document.getElementById("web-iframe");
  const loader = document.getElementById("iframe-loader");
  if (iframe) {
    iframe.addEventListener("load", () => {
      if (loader) loader.style.display = "none";
    });
  }

  lucide.createIcons();
}

function cleanTitle(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (e) {
    return url;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.addEventListener("DOMContentLoaded", init);
`,

  workerJs: `/**
 * Cloudflare Workers (src/index.js) - Iframe Bypass Web Proxy
 */

export default {
  async fetch(request, env, ctx) {
    // 1. CORSプリフライトリクエストの処理
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);
    
    if (url.pathname === "/proxy") {
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) {
        return new Response("Missing 'url' parameter", { status: 400 });
      }

      try {
        let formattedUrl = targetUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = "https://" + formattedUrl;
        }

        // ターゲットへフェッチ
        const response = await fetch(formattedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "ja,en-US;q=0.7,en;q=0.3"
          }
        });

        const contentType = response.headers.get("content-type") || "";
        
        // ヘッダーをコピーしつつ制限解除
        const newHeaders = new Headers();
        for (const [key, value] of response.headers.entries()) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey === "x-frame-options" ||
            lowerKey === "content-security-policy" ||
            lowerKey === "content-security-policy-report-only" ||
            lowerKey === "clear-site-data" ||
            lowerKey === "cross-origin-embedder-policy" ||
            lowerKey === "cross-origin-opener-policy" ||
            lowerKey === "cross-origin-resource-policy" ||
            lowerKey === "access-control-allow-origin"
          ) {
            continue;
          }
          newHeaders.set(key, value);
        }

        newHeaders.set("Access-Control-Allow-Origin", "*");

        // HTMLの場合は、相対パス崩れを防ぐために <base href="URL"> を挿入
        if (contentType.includes("text/html")) {
          let html = await response.text();
          const baseTag = \`<base href="\${formattedUrl}">\`;
          const baseTarget = '<base target="_self">';
          const injection = \`\\n\${baseTag}\\n\${baseTarget}\\n\`;

          if (html.includes("<head>")) {
            html = html.replace("<head>", \`<head>\${injection}\`);
          } else if (html.includes("<HEAD>")) {
            html = html.replace("<HEAD>", \`<HEAD>\${injection}\`);
          } else if (html.includes("<html>")) {
            html = html.replace("<html>", \`<html><head>\${injection}</head>\`);
          } else {
            html = injection + html;
          }

          return new Response(html, {
            status: response.status,
            headers: newHeaders
          });
        } else {
          const body = await response.arrayBuffer();
          return new Response(body, {
            status: response.status,
            headers: newHeaders
          });
        }

      } catch (err) {
        return new Response("Proxy error: " + err.message, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};`,

  wranglerToml: `# Cloudflare Workers 設定ファイル (wrangler.toml)

name = "foxtab-proxy"
main = "src/index.js"
compatibility_date = "2026-07-17"
`
};
