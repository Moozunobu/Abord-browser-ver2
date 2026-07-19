# Aboard Browser (Ver 2)

Aboard は、美しくモダンなタブ管理、プロキシ切り替え機能、クイック検索機能を備えた Firefox 風のウェブブラウザ型カスタムスタートページ（ダッシュボード）アプリケーションです。

---

## 🚀 GitHub Pages への自動デプロイ方法 (GitHub Pages Deployment)

本リポジトリには、GitHub にファイルをアップロードするだけで自動的にビルドとデプロイが行われる **GitHub Actions ワークフロー** が定義されています。  
リポジトリ名が `Abord-browser-ver2` の場合、以下の手順に沿って設定を 1 つ有効化するだけで、すぐに Web ページとして利用可能です。

### 📋 セットアップ手順 (Setup Steps)

1. **ZIPをダウンロード & 展開**
   - Google AI Studio の設定（Settings）メニューからプロジェクトを ZIP でエクスポートし、手元で展開します。

2. **GitHub でリポジトリを作成**
   - GitHub で新しいリポジトリを作成します。
   - リポジトリ名: `Abord-browser-ver2`（任意の名前で構いませんが、この名前を推奨します）。

3. **ファイルをアップロード (Push)**
   - 展開したすべてのファイルとフォルダ（`.github` フォルダも含めて）をリポジトリの `main` (または `master`) ブランチにプッシュします。
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Aboard browser"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/Abord-browser-ver2.git
   git push -u origin main
   ```

4. **GitHub Pages の設定を有効化**
   - 作成した GitHub リポジトリのページを開き、上部の **Settings** タブをクリックします。
   - 左サイドバーの **Pages**（「Code and automation」セクション内）を選択します。
   - **Build and deployment** の **Source** ドロップダウンから **`GitHub Actions`** を選択します。

5. **自動デプロイ完了！**
   - 設定を変更すると、プッシュされたソースを元に自動的にビルドが開始されます（上部タブの **Actions** から進行状況を確認できます）。
   - ビルドが完了すると、自動的に以下のURLで公開されます。
     `https://<YOUR_USERNAME>.github.io/Abord-browser-ver2/`

---

## 💻 ローカルでの実行方法 (Local Development)

手元の PC で開発サーバーを立ち上げたり、本番用のサーバーを起動したりするのも非常に簡単です。

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 開発サーバーの起動 (Vite + Express)
```bash
npm run dev
```
起動後、ブラウザで `http://localhost:3000` にアクセスしてください。

### 3. 本番用ビルド & 起動
```bash
npm run build
npm start
```

---

## 🛠️ 機能構成について

- **フロントエンド (Vite + React + Tailwind CSS)**
  - 美しいデザイン、タブレイアウト切り替え、パーソナライズ（クラシック、ライト、ミッドナイト、サンセット）を完備。
  - `vite.config.ts` で `base: "./"` に設定されているため、どのようなURLサブパスの配下に配置されても、パス崩れなく完璧に動作します。
- **バックエンド (server.ts)**
  - X-Frame-Options などの Iframe セキュリティ制限を安全にバイパスするためのリバースプロキシAPI (`/api/proxy`) が組み込まれています（ローカル/独自サーバー運用時に有効）。
- **Cloudflare Workers 連携パッケージ (`/github-pages-workers-dist` フォルダ)**
  - GitHub Pages などの静的ホスティングで運用する際、プロキシサーバーを Cloudflare Workers (完全無料枠あり) に設置して連携するためのコードが同梱されています（詳細は Web 画面右下の「エクスポート/デプロイ」画面を参照）。

---

## English Summary

This repository is ready for immediate deployment to **GitHub Pages** using GitHub Actions:
1. Export the project as a ZIP, expand it, and push all files to your GitHub repository named `Abord-browser-ver2`.
2. Go to your repository's **Settings** -> **Pages**.
3. Under **Build and deployment**, change the **Source** to **`GitHub Actions`**.
4. The workflow will automatically compile your React + Vite app and publish it at:  
   `https://<YOUR_USERNAME>.github.io/Abord-browser-ver2/`
