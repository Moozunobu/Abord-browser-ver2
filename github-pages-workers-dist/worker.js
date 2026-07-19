/**
 * Cloudflare Workers (src/index.js) - YouTube API Proxy & KV Cache Controller
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

    // パスの解析
    const url = new URL(request.url);
    
    // エンドポイント "/search?q=検索ワード" の確認
    if (url.pathname === "/search") {
      const q = url.searchParams.get("q");
      if (!q) {
        return new Response(JSON.stringify({ error: "Missing query parameter 'q'" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      const cacheKey = `q=${q.trim().toLowerCase()}`;

      try {
        // 2. Cloudflare Workers KV (バインディング名: YOUTUBE_CACHE) からキャッシュ検索
        // バインディングが存在するか確認しながら安全に呼び出します
        let cachedData = null;
        if (env.YOUTUBE_CACHE) {
          cachedData = await env.YOUTUBE_CACHE.get(cacheKey);
        }

        if (cachedData) {
          // キャッシュヒット: 直接JSONを返却
          return new Response(JSON.stringify({
            source: "kv-cache",
            data: JSON.parse(cachedData)
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        // 3. キャッシュがない場合、YouTube Data API v3 を呼び出す
        const apiKey = env.YOUTUBE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({
            error: "YOUTUBE_API_KEY is not configured in Workers environment."
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`;
        
        const ytResponse = await fetch(youtubeUrl);
        if (!ytResponse.ok) {
          const errText = await ytResponse.text();
          return new Response(JSON.stringify({
            error: "Failed to fetch from YouTube API",
            details: errText
          }), {
            status: ytResponse.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        const ytData = await ytResponse.json();

        // 4. Workers KV へ12時間の有効期限（expirationTtl: 43200秒）を設けて保存
        if (env.YOUTUBE_CACHE) {
          await env.YOUTUBE_CACHE.put(cacheKey, JSON.stringify(ytData), {
            expirationTtl: 43200 // 12時間 = 12 * 60 * 60
          });
        }

        // 新規取得結果の返却
        return new Response(JSON.stringify({
          source: "youtube-api",
          data: ytData
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // ルートやそれ以外のパスは404を返却
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
