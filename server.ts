import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// CORSを有効化
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

/**
 * 本物のマルチWebブラウザ用 Iframe制限バイパス・リバースプロキシAPI
 * クエリパラメータ 'url' から指定されたウェブページのHTMLを取得し、
 * X-Frame-Options や Content-Security-Policy ヘッダーを解除して、
 * iframe内で安全に表示できるようにします。また、アセット崩れを防ぐため
 * <base href="元のURL"> タグをインジェクションします。
 */
app.get("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send("url parameter is required");
  }

  try {
    let formattedUrl = targetUrl.trim();
    
    // スキームがない場合は https をデフォルトにする
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    console.log(`[Proxy Request] Target URL: ${formattedUrl}`);

    const response = await fetch(formattedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3"
      }
    });

    if (!response.ok) {
      console.warn(`[Proxy Warning] Failed to fetch. Status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    
    // ヘッダーをコピー
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase();
      // iframe制限、セキュリティ制限、CORS関連のヘッダーを除外
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
      res.setHeader(key, value);
    }

    // CORSヘッダーを上書き
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    // HTMLの場合のみ、相対URL補正用の <base> タグをインジェクション
    if (contentType.includes("text/html")) {
      let body = await response.text();
      
      // 相対URL（画像やCSS、リンク）をすべて絶対URLとして解釈させるための base タグ
      const baseTag = `<base href="${formattedUrl}">`;
      
      // リンククリック時にiframe内で遷移させるための base target タグ
      const baseTarget = `<base target="_self">`;

      const injection = `\n${baseTag}\n${baseTarget}\n`;

      if (body.includes("<head>")) {
        body = body.replace("<head>", `<head>${injection}`);
      } else if (body.includes("<HEAD>")) {
        body = body.replace("<HEAD>", `<HEAD>${injection}`);
      } else if (body.includes("<html>")) {
        body = body.replace("<html>", `<html><head>${injection}</head>`);
      } else if (body.includes("<HTML>")) {
        body = body.replace("<HTML>", `<HTML><head>${injection}</head>`);
      } else {
        body = injection + body;
      }

      res.send(body);
    } else {
      // 画像、CSS、JSなどはそのままバッファとして返却
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err: any) {
    console.error("Proxy Error:", err);
    res.status(500).send(`<html><body style="background:#0c0c0d;color:#fbfbfe;font-family:sans-serif;padding:24px;text-align:center;">
      <h3 style="color:#ff5555;">プロキシ接続エラー</h3>
      <p style="font-size:14px;color:#bfbfc9;">指定されたURL: <code style="background:#1c1b22;padding:2px 6px;border-radius:4px;">${targetUrl}</code></p>
      <p style="font-size:12px;color:#7c7c82;">エラー原因: ${err.message}</p>
    </body></html>`);
  }
});

// Vite ミドルウェアの設定 (開発環境と本番環境の出し分け)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
