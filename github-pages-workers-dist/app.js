/**
 * FoxTab YouTube Browser - フロントエンドメインロジック (app.js)
 */

// Cloudflare Workers の本番用APIエンドポイントURLを設定します。
// （GitHub Pagesにホスティングする場合は、Cloudflare Workerのデプロイ先URLに置き換えてください）
const WORKER_API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("3000") || window.location.origin.includes("run.app")
  ? "/api" // ローカル開発またはAI Studio上でのAPIパス
  : "https://web-browser.mozunbu0123.workers.dev"; // ←本番WorkerのURLを入力

// タブデータを保持する状態
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
const contentArea = document.getElementById("content-area");

/**
 * ユーティリティ: ユニークなIDを生成
 */
function generateId() {
  return "tab-" + Math.random().toString(36).substr(2, 9);
}

/**
 * 初期化処理
 */
function init() {
  // イベントリスナーの登録
  addTabBtn.addEventListener("click", () => createNewTab());
  addressInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleAddressSubmit();
    }
  });
  searchGoBtn.addEventListener("click", handleAddressSubmit);
  
  backBtn.addEventListener("click", () => navigateHistory(-1));
  forwardBtn.addEventListener("click", () => navigateHistory(1));
  refreshBtn.addEventListener("click", () => refreshTab());
  homeBtn.addEventListener("click", () => goHome());

  // ブックマーククリックイベント
  document.querySelectorAll(".bookmark-item").forEach(item => {
    item.addEventListener("click", () => {
      const query = item.getAttribute("data-query");
      searchVideos(query);
    });
  });

  // 初回起動時に最初のタブを作成
  createNewTab();
}

/**
 * 新しいタブを作成
 */
function createNewTab() {
  const tabId = generateId();
  const newTab = {
    id: tabId,
    title: "新しいタブ",
    url: "",
    viewMode: "home", // "home" | "search" | "player" | "loading"
    searchQuery: "",
    searchResults: [],
    activeVideo: null,
    apiSource: "",
    history: ["home"],
    historyIndex: 0
  };

  tabs.push(newTab);
  setActiveTab(tabId);
}

/**
 * アクティブなタブを設定
 */
function setActiveTab(tabId) {
  activeTabId = tabId;
  renderTabs();
  renderContent();
  updateToolbar();
}

/**
 * タブを閉じる
 */
function closeTab(tabId, event) {
  if (event) {
    event.stopPropagation(); // 親のクリックイベント（タブ切り替え）を防ぐ
  }

  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  // 最後の1つなら閉じずに新しいまっさらなタブを作る
  if (tabs.length === 1) {
    tabs = [];
    createNewTab();
    return;
  }

  // 閉じるタブが現在アクティブだった場合、別のタブをアクティブにする
  if (activeTabId === tabId) {
    const nextActiveIndex = tabIndex === 0 ? 1 : tabIndex - 1;
    activeTabId = tabs[nextActiveIndex].id;
  }

  tabs.splice(tabIndex, 1);
  renderTabs();
  renderContent();
  updateToolbar();
}

/**
 * 戻る・進むナビゲーション
 */
function navigateHistory(direction) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  const targetIndex = tab.historyIndex + direction;
  if (targetIndex >= 0 && targetIndex < tab.history.length) {
    tab.historyIndex = targetIndex;
    const historyState = tab.history[targetIndex];
    
    // 履歴データから表示を復元
    if (historyState === "home") {
      tab.viewMode = "home";
      tab.url = "";
    } else if (historyState.startsWith("search:")) {
      tab.viewMode = "search";
      tab.searchQuery = historyState.substring(7);
      tab.url = tab.searchQuery;
    } else if (historyState.startsWith("player:")) {
      // 簡易的に再生中ビデオを残しておく
      tab.viewMode = "player";
      // IDを特定
      const vidId = historyState.substring(7);
      // activeVideoが履歴移動で失われないようにsearchResultsから探す
      const foundVideo = tab.searchResults.find(v => v.id.videoId === vidId);
      if (foundVideo) {
        tab.activeVideo = foundVideo;
      }
      tab.url = "https://www.youtube.com/watch?v=" + vidId;
    }

    renderTabs();
    renderContent();
    updateToolbar();
  }
}

/**
 * リフレッシュ
 */
function refreshTab() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  if (tab.viewMode === "search") {
    searchVideos(tab.searchQuery, true); // キャッシュを使わずリロード
  } else if (tab.viewMode === "player") {
    renderContent();
  }
}

/**
 * ホームへ移動
 */
function goHome() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  tab.viewMode = "home";
  tab.url = "";
  tab.title = "新しいタブ";
  
  // 履歴に追加
  pushToHistory(tab, "home");
  
  renderTabs();
  renderContent();
  updateToolbar();
}

/**
 * アドレスバーに入力された値の送信処理
 */
function handleAddressSubmit() {
  const value = addressInput.value.trim();
  if (!value) return;

  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  // もしURL風なら、そのままYouTubeの動画検索キーワードとして扱います
  if (value.startsWith("https://") || value.startsWith("http://")) {
    // 埋め込みプレイヤーへの直接ジャンプを試みる（YouTube URLの場合）
    const ytId = extractYoutubeId(value);
    if (ytId) {
      // 擬似的な動画オブジェクトを作成して再生
      const mockVideo = {
        id: { videoId: ytId },
        snippet: {
          title: "URL直接再生動画 (ID: " + ytId + ")",
          description: "アドレスバーに直接入力されたYouTube URLから再生しています。",
          channelTitle: "YouTube Link Viewer",
          publishedAt: new Date().toISOString(),
          thumbnails: { medium: { url: "https://img.youtube.com/vi/" + ytId + "/mqdefault.jpg" } }
        }
      };
      playVideo(mockVideo);
      return;
    }
  }

  // 通常の検索として動作
  searchVideos(value);
}

/**
 * YouTube URLから動画IDを抽出
 */
function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * 履歴への追加制御
 */
function pushToHistory(tab, state) {
  // 現在のインデックス以降の履歴（進むボタンで進むはずだった履歴）を削除して追加
  tab.history = tab.history.slice(0, tab.historyIndex + 1);
  // 最後の状態と重複していなければ追加
  if (tab.history[tab.history.length - 1] !== state) {
    tab.history.push(state);
    tab.historyIndex = tab.history.length - 1;
  }
}

/**
 * YouTube動画検索の通信ロジック (Cloudflare Workersを経由)
 */
async function searchVideos(query, forceReload = false) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  tab.viewMode = "loading";
  tab.searchQuery = query;
  tab.url = query;
  tab.title = "検索: " + query;
  renderTabs();
  renderContent();
  updateToolbar();

  try {
    // Cloudflare Workers プロキシ経由でYouTube検索リクエスト
    const response = await fetch(WORKER_API_BASE + "/search?q=" + encodeURIComponent(query));
    if (!response.ok) {
      throw new Error("検索エラーが発生しました。");
    }

    const resData = await response.json();
    
    // レスポンスデータの処理
    tab.searchResults = resData.data.items || [];
    tab.apiSource = resData.source || "unknown";
    tab.viewMode = "search";
    
    // 履歴に追加
    pushToHistory(tab, "search:" + query);

  } catch (error) {
    console.error(error);
    tab.viewMode = "search";
    tab.searchResults = [];
    tab.apiSource = "error";
  }

  renderTabs();
  renderContent();
  updateToolbar();
}

/**
 * 動画の再生開始
 */
function playVideo(video) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  tab.activeVideo = video;
  tab.viewMode = "player";
  tab.title = "再生: " + video.snippet.title;
  tab.url = "https://www.youtube.com/watch?v=" + video.id.videoId;

  pushToHistory(tab, "player:" + video.id.videoId);

  renderTabs();
  renderContent();
  updateToolbar();
}

/**
 * ツールバーとボタンの活性・非活性状態の更新
 */
function updateToolbar() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  addressInput.value = tab.url;
  
  // 履歴インデックスに基づく戻る・進む制御
  backBtn.disabled = tab.historyIndex <= 0;
  forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;
}

/**
 * タブバーのレンダリング
 */
function renderTabs() {
  tabsContainer.innerHTML = "";
  tabs.forEach(tab => {
    const isActive = tab.id === activeTabId;
    
    const tabEl = document.createElement("div");
    tabEl.className = "tab" + (isActive ? " active" : "");
    tabEl.addEventListener("click", () => setActiveTab(tab.id));

    // Firefox風アイコン
    let tabIconHtml = '<i data-lucide="globe" style="width: 14px; height: 14px;"></i>';
    if (tab.viewMode === "loading") {
      tabIconHtml = '<div class="tab-spinner animate-spin"></div>';
    } else if (tab.viewMode === "player") {
      tabIconHtml = '<i data-lucide="play" style="width: 14px; height: 14px; color: #ff003c;"></i>';
    }

    tabEl.innerHTML = `
      ${tabIconHtml}
      <span class="tab-title">${escapeHtml(tab.title)}</span>
      <button class="tab-close"><i data-lucide="x" style="width: 12px; height: 12px;"></i></button>
    `;

    // 閉じるボタンの挙動
    tabEl.querySelector(".tab-close").addEventListener("click", (e) => closeTab(tab.id, e));

    tabsContainer.appendChild(tabEl);
  });

  lucide.createIcons();
}

/**
 * メインコンテンツのレンダリング
 */
function renderContent() {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  contentArea.innerHTML = "";

  if (tab.viewMode === "home") {
    renderHomeView();
  } else if (tab.viewMode === "loading") {
    renderLoadingView();
  } else if (tab.viewMode === "search") {
    renderSearchView(tab);
  } else if (tab.viewMode === "player") {
    renderPlayerView(tab);
  }
}

/**
 * 新規タブホーム画面の生成
 */
function renderHomeView() {
  const homeEl = document.createElement("div");
  homeEl.className = "new-tab-home";
  homeEl.innerHTML = `
    <div class="firefox-logo-area">
      <div class="firefox-logo-placeholder">
        <i data-lucide="compass"></i>
      </div>
      <h1>FoxTab YouTube</h1>
    </div>

    <div class="home-search-container">
      <input type="text" id="home-search-input" class="home-search-input" placeholder="YouTube動画を検索するキーワードを入力...">
      <button id="home-search-btn" class="home-search-btn"><i data-lucide="search"></i></button>
    </div>

    <div class="shortcuts-grid">
      <div class="shortcut-card" data-query="Lofi Girl">
        <div class="shortcut-icon"><i data-lucide="headset" style="color: #ff9400"></i></div>
        <span>Lofi Girl</span>
      </div>
      <div class="shortcut-card" data-query="Kyoto Rain sound">
        <div class="shortcut-icon"><i data-lucide="cloud-rain" style="color: #00ddff"></i></div>
        <span>Kyoto Rain</span>
      </div>
      <div class="shortcut-card" data-query="Synthwave chillout">
        <div class="shortcut-icon"><i data-lucide="sparkles" style="color: #e040fb"></i></div>
        <span>Synthwave</span>
      </div>
      <div class="shortcut-card" data-query="React TS coding tutorial">
        <div class="shortcut-icon"><i data-lucide="terminal" style="color: #00ff66"></i></div>
        <span>Learn React</span>
      </div>
    </div>
  `;

  contentArea.appendChild(homeEl);

  // イベント登録
  const homeInput = document.getElementById("home-search-input");
  const homeBtn = document.getElementById("home-search-btn");

  const submitSearch = () => {
    const val = homeInput.value.trim();
    if (val) searchVideos(val);
  };

  homeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitSearch();
  });
  homeBtn.addEventListener("click", submitSearch);

  // ショートカットカードの動作
  homeEl.querySelectorAll(".shortcut-card").forEach(card => {
    card.addEventListener("click", () => {
      searchVideos(card.getAttribute("data-query"));
    });
  });

  lucide.createIcons();
}

/**
 * ローディング画面
 */
function renderLoadingView() {
  const loaderEl = document.createElement("div");
  loaderEl.className = "loader-container";
  loaderEl.innerHTML = `
    <div class="spinner"></div>
    <p>Cloudflare Workers / KV キャッシュ経由で検索中...</p>
  `;
  contentArea.appendChild(loaderEl);
}

/**
 * 検索結果画面の生成
 */
function renderSearchView(tab) {
  const pageEl = document.createElement("div");
  pageEl.className = "search-results-page";

  let sourceLabel = "API経由で新規取得";
  let cacheIcon = "database";
  if (tab.apiSource === "kv-cache") {
    sourceLabel = "Cloudflare Workers KV キャッシュから高速応答";
    cacheIcon = "zap";
  } else if (tab.apiSource === "gemini-fallback") {
    sourceLabel = "Gemini AIスマートフォールバック（API未設定のため）";
    cacheIcon = "cpu";
  }

  let htmlContent = `
    <div class="search-info">
      <h2>「${escapeHtml(tab.searchQuery)}」の検索結果 ( ${tab.searchResults.length} 件 )</h2>
      <div class="cache-badge" title="情報元">
        <i data-lucide="${cacheIcon}" style="width:14px; height:14px;"></i>
        <span>${sourceLabel}</span>
      </div>
    </div>
  `;

  if (tab.searchResults.length === 0) {
    htmlContent += `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 12px; color: #ff5555;"></i>
        <p>動画が見つかりませんでした。キーワードを変更してもう一度お試しください。</p>
      </div>
    `;
  } else {
    htmlContent += '<div class="video-grid">';
    tab.searchResults.forEach((video, index) => {
      const vId = video.id.videoId;
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const published = new Date(video.snippet.publishedAt).toLocaleDateString("ja-JP");
      const thumbUrl = video.snippet.thumbnails.medium.url;

      htmlContent += `
        <div class="video-card" data-video-index="${index}">
          <div class="thumbnail-container">
            <img class="thumbnail-img" src="${thumbUrl}" alt="thumbnail" loading="lazy">
            <div class="play-overlay">
              <i data-lucide="play-circle"></i>
            </div>
          </div>
          <div class="video-info">
            <h3 class="video-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
            <div class="channel-name">${escapeHtml(channel)}</div>
            <div class="published-at">${published}</div>
          </div>
        </div>
      `;
    });
    htmlContent += '</div>';
  }

  pageEl.innerHTML = htmlContent;
  contentArea.appendChild(pageEl);

  // カードクリックイベント
  pageEl.querySelectorAll(".video-card").forEach(card => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.getAttribute("data-video-index"));
      playVideo(tab.searchResults[idx]);
    });
  });

  lucide.createIcons();
}

/**
 * 埋め込みプレイヤー画面の生成
 */
function renderPlayerView(tab) {
  const video = tab.activeVideo;
  if (!video) return;

  const vId = video.id.videoId;
  const pageEl = document.createElement("div");
  pageEl.className = "player-page";

  pageEl.innerHTML = `
    <div class="iframe-wrapper">
      <iframe src="https://www.youtube.com/embed/${vId}?autoplay=1&rel=0" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
      </iframe>
    </div>

    <div class="player-details">
      <h1>${escapeHtml(video.snippet.title)}</h1>
      
      <div class="player-meta">
        <div class="channel-avatar">
          <i data-lucide="tv"></i>
        </div>
        <div class="channel-info-meta">
          <div class="channel">${escapeHtml(video.snippet.channelTitle)}</div>
          <div class="subscribers">公式YouTube埋め込みプレイヤー</div>
        </div>
      </div>

      <div class="video-description-box">
        <strong>投稿日: ${new Date(video.snippet.publishedAt).toLocaleDateString("ja-JP")}</strong>
        <br><br>
        ${escapeHtml(video.snippet.description || "この動画に詳細情報はありません。")}
      </div>
    </div>
  `;

  contentArea.appendChild(pageEl);
  lucide.createIcons();
}

/**
 * HTMLエスケープユーティリティ (XSS対策)
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 起動
window.addEventListener("DOMContentLoaded", init);
