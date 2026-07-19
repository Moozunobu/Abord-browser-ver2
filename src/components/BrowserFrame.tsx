import React, { useState, useEffect, useRef } from "react";
import { TabState } from "../types";
import { RotateCw } from "lucide-react";

interface BrowserFrameProps {
  tab: TabState;
  onRefresh: () => void;
}

export default function BrowserFrame({ tab, onRefresh }: BrowserFrameProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIframeLoading(true);
  }, [tab.currentIframeUrl]);

  const handleLoad = () => {
    setIframeLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0d] relative">
      
      {/* メインのiframe表示領域 */}
      <div className="flex-1 bg-white relative">
        {/* ローディングスピナー（iframeの上にかぶせる） */}
        {iframeLoading && (
          <div className="absolute inset-0 bg-[#0c0c0d] flex flex-col items-center justify-center space-y-3 z-10">
            <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">ページを読み込んでいます...</p>
            <p className="text-xs text-gray-600 max-w-sm text-center leading-relaxed">
              プロキシがターゲットサーバーからHTMLを取得し、セキュリティヘッダーを書き換えて安全に描画しています。
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={tab.currentIframeUrl}
          onLoad={handleLoad}
          className="w-full h-full border-none bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title={tab.title}
        />
      </div>

    </div>
  );
}
