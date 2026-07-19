import React, { useState } from "react";
import { EXPORT_FILES } from "../exportData";
import { Copy, Check, Download, FileCode, Server, ShieldAlert } from "lucide-react";

export default function ExportPanel() {
  const [activeFile, setActiveFile] = useState<keyof typeof EXPORT_FILES>("indexHtml");
  const [copied, setCopied] = useState(false);

  const fileInfo = {
    indexHtml: { name: "index.html", lang: "html", desc: "ブラウザUIとコンテンツ構造のHTML" },
    styleCss: { name: "style.css", lang: "css", desc: "Firefox風タブ、アドレスバー、プロキシ連携用のCSS" },
    appJs: { name: "app.js", lang: "javascript", desc: "タブ追加・削除、履歴、プロキシバイパス切り替えのロジック" },
    workerJs: { name: "worker.js", lang: "javascript", desc: "Cloudflare Workers用 Iframe制限(X-Frame-Options)解除プロキシコード" },
    wranglerToml: { name: "wrangler.toml", lang: "ini", desc: "Cloudflare Workersのデプロイ構成ファイル" },
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    handleDownload("index.html", EXPORT_FILES.indexHtml);
    setTimeout(() => handleDownload("style.css", EXPORT_FILES.styleCss), 100);
    setTimeout(() => handleDownload("app.js", EXPORT_FILES.appJs), 200);
    setTimeout(() => handleDownload("worker.js", EXPORT_FILES.workerJs), 300);
    setTimeout(() => handleDownload("wrangler.toml", EXPORT_FILES.wranglerToml), 400);
  };

  return (
    <div id="export-panel" className="bg-[#0c0c0d] text-gray-100 min-h-screen p-6 md:p-10 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ヘッダー */}
        <div className="border-b border-[#38383d] pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-cyan-400 font-mono text-xs tracking-wider uppercase font-bold">Deploy Package</span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">GitHub Pages &amp; Workers 連携コード</h1>
              <p className="text-gray-400 mt-2 text-sm max-w-2xl">
                お好きな環境（GitHub Pages等）にフロントエンドをホストし、バックエンドにCloudflare Workersを設置するための完全な配布パッケージです。
              </p>
            </div>
            <button
              onClick={handleDownloadAll}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-5 py-3 rounded-lg shadow-lg shadow-cyan-950/20 transition-all transform active:scale-95 text-sm cursor-pointer"
              id="download-all-btn"
            >
              <Download className="w-4 h-4" />
              全5ファイルを一括ダウンロード
            </button>
          </div>
        </div>

        {/* セットアップ説明ガイド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1c1b22] border border-[#38383d] p-5 rounded-xl space-y-3 shadow-md" id="guide-step-1">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm">1</span>
              <h3 className="font-semibold text-white">フロントエンドの公開</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              <code className="text-cyan-300">index.html</code>, <code className="text-cyan-300">style.css</code>, <code className="text-cyan-300">app.js</code> をお使いのローカルフォルダに保存し、GitHubリポジトリにアップロードして<strong>GitHub Pages</strong>で公開します。
            </p>
          </div>

          <div className="bg-[#1c1b22] border border-[#38383d] p-5 rounded-xl space-y-3 shadow-md" id="guide-step-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm">2</span>
              <h3 className="font-semibold text-white">Cloudflare Workers 設置</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              ローカルに <code className="text-cyan-300">wrangler.toml</code> と <code className="text-cyan-300">worker.js</code> (src/index.js) を配置し、Wrangler CLIを導入して <code className="text-gray-300">wrangler deploy</code> を実行し、プロキシを世界中に公開します。
            </p>
          </div>

          <div className="bg-[#1c1b22] border border-[#38383d] p-5 rounded-xl space-y-3 shadow-md" id="guide-step-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm">3</span>
              <h3 className="font-semibold text-white">エンドポイントの紐付け</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              <code className="text-cyan-300">app.js</code> 内の定数 <code className="text-gray-300">WORKER_API_BASE</code> に、デプロイしたCloudflare WorkerのURL（例: <code className="text-cyan-300">https://foxtab-proxy.username.workers.dev</code>）を設定すれば完了です！
            </p>
          </div>
        </div>

        {/* コードビューアエリア */}
        <div className="bg-[#1c1b22] border border-[#38383d] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[550px]" id="code-viewer-container">
          
          {/* ファイルタブ切り替え */}
          <div className="bg-[#14131a] border-b border-[#38383d] flex flex-wrap gap-1 px-3 pt-3">
            {(Object.keys(EXPORT_FILES) as Array<keyof typeof EXPORT_FILES>).map((key) => {
              const info = fileInfo[key];
              const isActive = activeFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFile(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium rounded-t-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1c1b22] text-white border-t-2 border-cyan-400 shadow-md"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1921]"
                  }`}
                  id={`file-tab-${key}`}
                >
                  <FileCode className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-500"}`} />
                  {info.name}
                </button>
              );
            })}
          </div>

          {/* ビューアヘッダー */}
          <div className="bg-[#18171f] px-5 py-3 border-b border-[#38383d] flex items-center justify-between text-xs text-gray-400">
            <span className="italic">{fileInfo[activeFile].desc}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(EXPORT_FILES[activeFile])}
                className="flex items-center gap-1.5 bg-[#2b2a33] hover:bg-[#38383d] text-white px-3 py-1.5 rounded transition-all active:scale-95 cursor-pointer"
                id="copy-code-btn"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "コピー完了" : "コードをコピー"}
              </button>
              <button
                onClick={() => handleDownload(fileInfo[activeFile].name, EXPORT_FILES[activeFile])}
                className="flex items-center gap-1.5 bg-[#2b2a33] hover:bg-[#38383d] text-white px-3 py-1.5 rounded transition-all active:scale-95 cursor-pointer"
                id="download-code-btn"
              >
                <Download className="w-3.5 h-3.5" />
                ファイルを保存
              </button>
            </div>
          </div>

          {/* コード表示エリア */}
          <div className="flex-1 p-5 overflow-auto bg-[#0a090f] font-mono text-sm leading-relaxed text-gray-300 text-left max-h-[500px]">
            <pre className="whitespace-pre overflow-x-auto tab-size-4">
              <code>{EXPORT_FILES[activeFile]}</code>
            </pre>
          </div>
        </div>

        {/* コラム / ワンポイント解説 */}
        <div className="bg-gradient-to-br from-[#121b2c] to-[#1c1b22] border border-blue-900/30 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="bg-cyan-950/40 p-4 rounded-xl border border-cyan-800/20">
            <Server className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="space-y-1.5 text-left flex-1">
            <h4 className="font-semibold text-white text-base">Cloudflare Workers をリバースプロキシとして採用する利点</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              WikipediaやYahoo!をはじめとする多くの主要Webサイトは、セキュリティ上の観点（クリックジャッキング対策など）から 
              <strong>「X-Frame-Options: SAMEORIGIN」</strong> または <strong>Content-Security-Policy</strong> 
              を設定しており、通常のiframe経由での埋め込み表示が禁止されています。<br />
              Cloudflare Workers を中継させることで、対象のウェブページをエッジサーバー上で代理取得（Fetch）し、
              <strong>iframe表示をブロックする各種HTTPレスポンスヘッダーを動的に除去</strong>した上で、
              さらにHTMLへ <code className="text-cyan-300">&lt;base href="元のサイトURL"&gt;</code> タグを注入します。
              これにより、スタイルシートや画像などの相対パスによるアセット崩れを完璧に解消し、1つのブラウザタブの中で快適に動作する仕組みを構築しています。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
