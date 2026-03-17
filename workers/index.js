/**
 * 800号电影社文档生成器 — Cloudflare Workers 后端
 *
 * 支持从豆瓣 / TMDB / IMDB (OMDb) 抓取电影信息。
 *
 * 部署到 Cloudflare Workers 后设置以下环境变量（密钥）：
 *   TMDB_API_KEY  — TMDB API 密钥
 *   OMDB_API_KEY  — OMDb API 密钥（免费版：https://www.omdbapi.com/apikey.aspx）
 *
 * 本地调试：
 *   npx wrangler dev
 */

/** @type {import('@cloudflare/workers-types').ExportedHandler} */
export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === "OPTIONS") {
      return corsResponse(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return corsResponse(
        Response.json({ status: "ok", message: "800号电影社文档生成器 API 运行中" })
      );
    }

    if (url.pathname === "/api/fetch-movie" && request.method === "POST") {
      return handleFetchMovie(request, env);
    }

    return corsResponse(new Response("Not Found", { status: 404 }));
  },
};

// ─────────────────────────────────────────────────────────────
// 主处理函数
// ─────────────────────────────────────────────────────────────

async function handleFetchMovie(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "请求体必须是 JSON 格式");
  }

  const { source, url: movieUrl } = body;

  if (!["douban", "tmdb", "imdb"].includes(source)) {
    return errorResponse(400, `不支持的数据来源：${source}。请使用 douban、tmdb 或 imdb`);
  }

  if (!movieUrl || typeof movieUrl !== "string") {
    return errorResponse(400, "缺少 url 参数");
  }

  try {
    const parsed = new URL(movieUrl);
    if (!parsed.protocol.startsWith("http")) {
      throw new Error("协议不合法");
    }
  } catch {
    return errorResponse(400, "链接格式不正确，请输入完整的 URL（含 https://）");
  }

  try {
    let movie;
    if (source === "douban") {
      movie = await fetchDouban(movieUrl);
    } else if (source === "tmdb") {
      movie = await fetchTmdb(movieUrl, env.TMDB_API_KEY);
    } else {
      movie = await fetchImdb(movieUrl, env.OMDB_API_KEY);
    }
    return corsResponse(Response.json(movie));
  } catch (err) {
    if (err instanceof ApiError) {
      return errorResponse(err.status, err.message);
    }
    console.error("未知错误", err);
    return errorResponse(500, "服务端内部错误，请稍后重试");
  }
}

// ─────────────────────────────────────────────────────────────
// 豆瓣抓取
// ─────────────────────────────────────────────────────────────

async function fetchDouban(movieUrl) {
  const idMatch = movieUrl.match(/\/subject\/(\d+)/);
  if (!idMatch) {
    throw new ApiError(400, "无法从豆瓣链接中提取影片 ID");
  }
  const subjectId = idMatch[1];
  const pageUrl = `https://movie.douban.com/subject/${subjectId}/`;

  let movieInfo = {
    chinese: "",
    foreign: "",
    year: "",
    director: "",
    writer: "",
    actors: "",
    genre: "",
    region: "",
    length: "",
    douban: "",
    desc: "",
    short: "",
  };

  try {
    const resp = await upstreamGet(pageUrl, {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "zh-CN,zh;q=0.9",
      Referer: "https://movie.douban.com/",
    });

    const html = await resp.text();

    // 用正则从 HTML 中提取所需字段（Workers 环境无 DOM API）
    function extract(pattern, flags = "") {
      const m = html.match(new RegExp(pattern, flags));
      return m ? m[1].trim() : "";
    }

    function extractAll(pattern, flags = "g") {
      return [...html.matchAll(new RegExp(pattern, flags))].map((m) =>
        m[1].trim()
      );
    }

    // 中文名（og:title）
    const chinese = extract('<meta property="og:title" content="([^"]+)"');

    // 外文名（括号内）
    let foreign = "";
    const foreignMatch = chinese.match(/[（(]([^)）]+)[)）]/);
    if (foreignMatch) {
      foreign = foreignMatch[1];
    }
    const chineseName = foreignMatch
      ? chinese.slice(0, chinese.indexOf(foreignMatch[0])).trim()
      : chinese;

    // 年份
    const year = extract(/<span class="year">\((\d{4})\)<\/span>/);

    // 导演
    const directors = extractAll(/rel="v:directedBy">([^<]+)<\/a>/);

    // 编剧
    const writers = extractAll(
      /<span class="pl">\s*编剧[^<]*<\/span>[^]*?<a[^>]*>([^<]+)<\/a>/,
      "g"
    );
    // 备用编剧提取（更宽泛）
    const writerSection = html.match(
      /<span class="pl">\s*编剧[^<]*<\/span>([\s\S]*?)<br\s*\/?>/
    );
    const writersFromSection = writerSection
      ? [...writerSection[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((m) =>
          m[1].trim()
        )
      : [];

    // 主演
    const actors = extractAll(/rel="v:starring">([^<]+)<\/a>/);

    // 类型
    const genres = extractAll(/property="v:genre">([^<]+)<\/span>/);

    // 地区
    const regionMatch = html.match(
      /<span class="pl">\s*制片国家\/地区:<\/span>\s*([^\n<]+)/
    );
    const region = regionMatch ? regionMatch[1].trim() : "";

    // 片长
    const lengthTag = extract(/property="v:runtime" content="(\d+)"/);
    const length = lengthTag || extract(/property="v:runtime">([^<]+)<\/span>/);

    // 豆瓣评分
    const douban = extract(/property="v:average">([^<]+)<\/strong>/);

    // 剧情简介
    const descRaw = extract(/property="v:summary"[^>]*>([\s\S]*?)<\/span>/);
    const desc = stripHtml(descRaw);

    // 豆瓣短评
    const short = extract(/<span class="short">([^<]+)<\/span>/);

    movieInfo = {
      chinese: chineseName || chinese,
      foreign,
      year,
      director: directors.join(" / "),
      writer: (writers.length ? writers : writersFromSection).join(" / "),
      actors: actors.slice(0, 5).join(" / "),
      genre: genres.join(" / "),
      region,
      length: length.replace(/\D/g, ""),
      douban,
      desc,
      short,
    };
  } catch (err) {
    console.error("网页解析失败，尝试接口:", err);
  }

  // 若网页解析失败或关键信息缺失，尝试移动端 Rexxar API
  if (!movieInfo.chinese || !movieInfo.desc) {
    const mobileHeaders = {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
      Referer: `https://m.douban.com/movie/subject/${subjectId}/`,
    };

    try {
      const mobileApiUrl = `https://m.douban.com/rexxar/api/v2/movie/${subjectId}`;
      const resp = await fetch(mobileApiUrl, { headers: mobileHeaders });
      if (resp.ok) {
        const data = await resp.json();
        if (!movieInfo.chinese) movieInfo.chinese = data.title || "";
        if (!movieInfo.year) movieInfo.year = data.year || "";
        if (!movieInfo.desc) movieInfo.desc = data.intro || "";
        if (!movieInfo.director) {
          movieInfo.director = (data.directors || [])
            .map((d) => d.name)
            .filter(Boolean)
            .join(" / ");
        }
        if (!movieInfo.actors) {
          movieInfo.actors = (data.actors || [])
            .slice(0, 10)
            .map((a) => a.name)
            .filter(Boolean)
            .join(" / ");
        }
        if (!movieInfo.genre) movieInfo.genre = (data.genres || []).join(" / ");
        if (!movieInfo.region)
          movieInfo.region = (data.countries || []).join(" / ");
        if (!movieInfo.length && data.durations) {
          movieInfo.length = data.durations[0]?.replace(/\D/g, "") || "";
        }
        if (!movieInfo.douban) movieInfo.douban = String(data.rating?.value || "");

        if (!movieInfo.foreign) {
          let original = data.original_title || "";
          if (!original && data.aka) {
            for (const name of data.aka) {
              if (/[a-zA-Z]/.test(name)) {
                original = name;
                break;
              }
            }
          }
          movieInfo.foreign = original;
        }

        // 尝试获取编剧
        try {
          const creditsUrl = `https://m.douban.com/rexxar/api/v2/movie/${subjectId}/credits`;
          const cResp = await fetch(creditsUrl, { headers: mobileHeaders });
          if (cResp.ok) {
            const cData = await cResp.json();
            const writers = (cData.items || [])
              .filter((item) => item.category === "编剧")
              .map((item) => item.name);
            if (writers.length > 0) movieInfo.writer = writers.join(" / ");
          }
        } catch (e) {
          /* ignore */
        }
      }
    } catch (err) {
      console.error("移动端 API 失败:", err);
    }
  }

  // 若还是缺失关键信息，尝试 subject_abstract 接口
  if (!movieInfo.chinese) {
    const apiUrl = `https://movie.douban.com/j/subject_abstract?subject_id=${subjectId}`;
    try {
      const resp = await upstreamGet(apiUrl);
      const data = await resp.json();
      if (data.r === 0 && data.subject) {
        const subj = data.subject;
        movieInfo.chinese = subj.title || "";
        movieInfo.year = subj.release_year || "";
        movieInfo.director = (subj.directors || []).join(" / ");
        movieInfo.actors = (subj.actors || []).join(" / ");
        movieInfo.genre = (subj.types || []).join(" / ");
        movieInfo.region = subj.region || "";
      }
    } catch (err) {
      /* ignore */
    }
  }

  if (!movieInfo.chinese) {
    throw new ApiError(404, "未能抓取到有效的电影信息，请检查链接或稍后重试");
  }

  return movieInfo;
}

// ─────────────────────────────────────────────────────────────
// TMDB 抓取
// ─────────────────────────────────────────────────────────────

async function fetchTmdb(movieUrl, apiKey) {
  if (!apiKey) {
    throw new ApiError(
      503,
      "Worker 未配置 TMDB_API_KEY，请在 Cloudflare Dashboard 的 Worker 设置中添加密钥"
    );
  }

  const typeMatch = movieUrl.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
  if (!typeMatch) {
    throw new ApiError(400, "无法从 TMDB 链接中提取影片 ID");
  }
  const [, mediaType, tmdbId] = typeMatch;

  const apiUrl = new URL(
    `https://api.themoviedb.org/3/${mediaType}/${tmdbId}`
  );
  apiUrl.searchParams.set("api_key", apiKey);
  apiUrl.searchParams.set("language", "zh-CN");
  apiUrl.searchParams.set("append_to_response", "credits");

  const resp = await upstreamGet(apiUrl.toString());
  const data = await resp.json();

  const crew = data.credits?.crew ?? [];
  const cast = (data.credits?.cast ?? []).slice(0, 5);

  const directors = crew
    .filter((p) => p.job === "Director")
    .map((p) => p.name);
  const writers = crew
    .filter(
      (p) =>
        p.department === "Writing" &&
        ["Writer", "Screenplay", "Story", "Script"].includes(p.job)
    )
    .map((p) => p.name);

  const releaseDate = data.release_date || data.first_air_date || "";

  return {
    chinese: data.title || data.name || "",
    foreign: data.original_title || data.original_name || "",
    year: releaseDate.slice(0, 4),
    director: directors.join(" / "),
    writer: writers.join(" / "),
    actors: cast.map((p) => p.name).join(" / "),
    genre: (data.genres ?? [])
      .map((g) => g.name)
      .join(" / "),
    region: (data.production_countries ?? [])
      .map((c) => c.name)
      .join(" / "),
    length: String(data.runtime || ""),
    douban: "",
    desc: data.overview || "",
    short: "",
  };
}

// ─────────────────────────────────────────────────────────────
// IMDB 抓取（通过 OMDb API）
// ─────────────────────────────────────────────────────────────

async function fetchImdb(movieUrl, omdbApiKey) {
  if (!omdbApiKey) {
    throw new ApiError(
      503,
      "Worker 未配置 OMDB_API_KEY，请在 Cloudflare Dashboard 的 Worker 设置中添加密钥（申请：https://www.omdbapi.com/apikey.aspx）"
    );
  }

  const idMatch = movieUrl.match(/(tt\d+)/);
  if (!idMatch) {
    throw new ApiError(400, "无法从 IMDB 链接中提取影片 ID（格式：ttXXXXXXX）");
  }
  const imdbId = idMatch[1];

  const apiUrl = new URL("https://www.omdbapi.com/");
  apiUrl.searchParams.set("i", imdbId);
  apiUrl.searchParams.set("apikey", omdbApiKey);
  apiUrl.searchParams.set("plot", "full");

  const resp = await upstreamGet(apiUrl.toString());
  const data = await resp.json();

  if (data.Response === "False") {
    throw new ApiError(404, `OMDb 未找到影片：${data.Error || "未知错误"}`);
  }

  // 片长：OMDb 返回 "142 min" 格式
  const length = (data.Runtime || "").replace(/\D/g, "");

  return {
    chinese: data.Title || "",
    foreign: data.Title || "",
    year: data.Year || "",
    director: data.Director || "",
    writer: data.Writer || "",
    actors: data.Actors || "",
    genre: (data.Genre || "").replace(/,\s*/g, " / "),
    region: data.Country || "",
    length,
    douban: "",
    desc: data.Plot || "",
    short: "",
  };
}

// ─────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────

/**
 * 将 HTML 字符串转换为纯文本。
 * 逐字符扫描，跳过 < ... > 范围内的所有内容，不依赖正则回溯，
 * 避免 CodeQL 报告的不完整多字符清理警告。
 */
function stripHtml(html) {
  let result = "";
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === "<") {
      inTag = true;
    } else if (ch === ">") {
      inTag = false;
    } else if (!inTag) {
      result += ch;
    }
  }
  // 处理常见 HTML 实体（&amp; 必须最后处理，防止二次转义）
  return result
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function upstreamGet(url, extraHeaders = {}) {
  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; 800FilmClubDocGen/1.0; +https://github.com/xeonliu/800FilmClubDocGen)",
      ...extraHeaders,
    },
  });
  if (!resp.ok) {
    throw new ApiError(502, `上游请求失败：${resp.status} ${resp.statusText}`);
  }
  return resp;
}

function errorResponse(status, detail) {
  return corsResponse(Response.json({ detail }, { status }));
}

function corsResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
