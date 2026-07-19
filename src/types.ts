export interface TabState {
  id: string;
  title: string;
  url: string; // アドレスバーに表示するユーザー入力のURL、または検索クエリ
  currentIframeUrl: string; // 実際にiframe内で読み込んでいるプロキシまたは直リンクのURL
  history: string[]; // 戻る/進む履歴（アドレスバーのurlを保存）
  historyIndex: number;
  viewMode: "home" | "browser" | "export"; // 表示モード: "home"(新規タブ), "browser"(iframeブラウザ), "export"(連携設定)
  isLoading: boolean;
  useProxy: boolean; // iframe制限を解除するためにプロキシを経由するかどうか
}

export type TabLayout = "horizontal" | "vertical";
export type AppTheme = "classic" | "light" | "midnight" | "sunset";
export type AppLang = "ja" | "en";

export interface AppSettings {
  tabLayout: TabLayout;
  theme: AppTheme;
  lang: AppLang;
}

