import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layout, Palette, Globe, Check } from "lucide-react";
import { AppSettings, TabLayout, AppTheme, AppLang } from "../types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}: SettingsPanelProps) {
  const isJa = settings.lang === "ja";

  const handleLayoutChange = (layout: TabLayout) => {
    onChangeSettings({ ...settings, tabLayout: layout });
  };

  const handleThemeChange = (theme: AppTheme) => {
    onChangeSettings({ ...settings, theme });
  };

  const handleLangChange = (lang: AppLang) => {
    onChangeSettings({ ...settings, lang });
  };

  // テーマ色一覧
  const themesList: { id: AppTheme; nameJa: string; nameEn: string; colorClass: string; borderClass: string }[] = [
    {
      id: "classic",
      nameJa: "クラシック (Firefox)",
      nameEn: "Classic Dark",
      colorClass: "bg-[#2b2a33]",
      borderClass: "border-[#38383d]",
    },
    {
      id: "light",
      nameJa: "エレガント・ライト",
      nameEn: "Elegant Light",
      colorClass: "bg-[#f0f0f4]",
      borderClass: "border-gray-300",
    },
    {
      id: "midnight",
      nameJa: "ミッドナイト (漆黒)",
      nameEn: "Midnight Black",
      colorClass: "bg-[#0c0c0d]",
      borderClass: "border-gray-800",
    },
    {
      id: "sunset",
      nameJa: "サンセット (温もり)",
      nameEn: "Sunset Orange",
      colorClass: "bg-[#3c1e1e]",
      borderClass: "border-red-950/40",
    },
  ];

  const t = {
    title: isJa ? "Firefox のカスタマイズ" : "Firefox Customization",
    subtitle: isJa ? "ブラウザの見た目や動作をパーソナライズします。" : "Personalize your browsing experience.",
    layout: isJa ? "タブの位置 (Layout)" : "Tab Layout",
    layoutDesc: isJa ? "タブバーの表示位置を水平または垂直に切り替えます。" : "Position tabs horizontally on top, or vertically in a sidebar.",
    layoutHorizontal: isJa ? "水平タブ (上部)" : "Horizontal Tabs (Top)",
    layoutVertical: isJa ? "垂直タブ (サイドバー)" : "Vertical Tabs (Sidebar)",
    theme: isJa ? "テーマカラー (Color Theme)" : "Color Theme",
    themeDesc: isJa ? "ブラウザ全体のテーマ配色を変更します。" : "Select the color palette for your browser interface.",
    lang: isJa ? "表示言語 (Language)" : "Display Language",
    langDesc: isJa ? "ブラウザのメニューや新規タブの表示言語です。" : "Choose your primary interface language.",
    close: isJa ? "完了して閉じる" : "Save and Close",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* ドロワーパネル */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] shadow-2xl z-50 flex flex-col border-l select-none ${
              settings.theme === "light"
                ? "bg-white text-gray-900 border-gray-200"
                : "bg-[#1c1b22] text-gray-100 border-[#38383d]"
            }`}
          >
            {/* ヘッダー */}
            <div className={`p-5 border-b flex items-center justify-between ${
              settings.theme === "light" ? "border-gray-200" : "border-[#38383d]"
            }`}>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#00ddff]" />
                  {t.title}
                </h2>
                <p className={`text-xs mt-1 ${settings.theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {t.subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  settings.theme === "light" ? "hover:bg-gray-100 text-gray-500" : "hover:bg-[#2b2a33] text-gray-400"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-none">
              {/* 1. タブレイアウト */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-400" />
                  {t.layout}
                </label>
                <p className={`text-xs ${settings.theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {t.layoutDesc}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLayoutChange("horizontal")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-2 transition-all cursor-pointer ${
                      settings.tabLayout === "horizontal"
                        ? "border-[#0060df] bg-[#0060df]/10 text-[#0060df] font-semibold shadow-sm"
                        : settings.theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "border-[#38383d] bg-[#2b2a33]/40 text-gray-300 hover:bg-[#2b2a33]"
                    }`}
                  >
                    <div className="w-full h-8 bg-gray-800 rounded flex flex-col gap-1 p-1 overflow-hidden relative border border-white/5">
                      <div className="flex gap-0.5 w-full h-2">
                        <div className="bg-[#00ddff] w-4 rounded-sm" />
                        <div className="bg-gray-700 w-4 rounded-sm" />
                        <div className="bg-gray-700 w-4 rounded-sm" />
                      </div>
                      <div className="flex-1 bg-gray-900 rounded-sm" />
                    </div>
                    <span>{t.layoutHorizontal}</span>
                  </button>

                  <button
                    onClick={() => handleLayoutChange("vertical")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-2 transition-all cursor-pointer ${
                      settings.tabLayout === "vertical"
                        ? "border-[#0060df] bg-[#0060df]/10 text-[#0060df] font-semibold shadow-sm"
                        : settings.theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "border-[#38383d] bg-[#2b2a33]/40 text-gray-300 hover:bg-[#2b2a33]"
                    }`}
                  >
                    <div className="w-full h-8 bg-gray-800 rounded flex gap-1 p-1 overflow-hidden relative border border-white/5">
                      <div className="w-4 bg-gray-700 rounded-sm flex flex-col gap-0.5 p-0.5">
                        <div className="bg-[#00ddff] h-1 rounded-sm w-full" />
                        <div className="bg-gray-600 h-1 rounded-sm w-full" />
                        <div className="bg-gray-600 h-1 rounded-sm w-full" />
                      </div>
                      <div className="flex-1 bg-gray-900 rounded-sm" />
                    </div>
                    <span>{t.layoutVertical}</span>
                  </button>
                </div>
              </div>

              {/* 2. カラーテーマ */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  {t.theme}
                </label>
                <p className={`text-xs ${settings.theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {t.themeDesc}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {themesList.map((themeItem) => {
                    const isSelected = settings.theme === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        onClick={() => handleThemeChange(themeItem.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "border-[#0060df] bg-[#0060df]/10 font-semibold"
                            : settings.theme === "light"
                            ? "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                            : "border-[#38383d] bg-[#2b2a33]/40 text-gray-300 hover:bg-[#2b2a33]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* ミニプレビューサークル */}
                          <div className={`w-6 h-6 rounded-full ${themeItem.colorClass} border ${themeItem.borderClass} flex-shrink-0 shadow-inner flex items-center justify-center`}>
                            {themeItem.id === "light" ? (
                              <div className="w-2.5 h-2.5 bg-[#1a1142] rounded-full" />
                            ) : (
                              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                            )}
                          </div>
                          <span className="text-xs">
                            {isJa ? themeItem.nameJa : themeItem.nameEn}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0060df]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. 表示言語 */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  {t.lang}
                </label>
                <p className={`text-xs ${settings.theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {t.langDesc}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLangChange("ja")}
                    className={`p-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      settings.lang === "ja"
                        ? "border-[#0060df] bg-[#0060df]/10 text-[#0060df] font-semibold"
                        : settings.theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "border-[#38383d] bg-[#2b2a33]/40 text-gray-300 hover:bg-[#2b2a33]"
                    }`}
                  >
                    日本語 (Japanese)
                  </button>

                  <button
                    onClick={() => handleLangChange("en")}
                    className={`p-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      settings.lang === "en"
                        ? "border-[#0060df] bg-[#0060df]/10 text-[#0060df] font-semibold"
                        : settings.theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "border-[#38383d] bg-[#2b2a33]/40 text-gray-300 hover:bg-[#2b2a33]"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className={`p-4 border-t flex items-center justify-end ${
              settings.theme === "light" ? "border-gray-200" : "border-[#38383d]"
            }`}>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[#0060df] hover:bg-[#0051ba] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
