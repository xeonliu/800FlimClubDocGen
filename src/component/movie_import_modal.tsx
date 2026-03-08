import { useState } from "react";
import type { ImportSource } from "../model/editor";
import type { Movie } from "../model/movie";

interface MovieImportModalProps {
  onImport: (movie: Partial<Movie>) => void;
  onClose: () => void;
}

const SOURCE_OPTIONS: {
  value: ImportSource;
  label: string;
  placeholder: string;
  tooltip?: {
    title: string;
    description: string;
    linkLabel: string;
    link: string;
  };
}[] = [
  {
    value: "douban",
    label: "豆瓣",
    placeholder: "https://movie.douban.com/subject/1291546/",
  },
  {
    value: "tmdb",
    label: "TMDB",
    placeholder: "https://www.themoviedb.org/movie/680",
    tooltip: {
      title: "TMDB",
      description: "The Movie Database，全球影视数据库与开放 API。",
      linkLabel: "https://www.themoviedb.org/",
      link: "https://www.themoviedb.org/",
    },
  },
  {
    value: "imdb",
    label: "IMDB",
    placeholder: "https://www.imdb.com/title/tt0110912/",
    tooltip: {
      title: "IMDb",
      description: "Internet Movie Database，全球影视数据库与评分站。",
      linkLabel: "https://www.imdb.com/",
      link: "https://www.imdb.com/",
    },
  },
];

/** 后端 API 地址。
 *  开发时默认 http://localhost:8000（本地，无需 HTTPS）。
 *  生产部署时请在 GitHub Action 的环境变量或项目的 .env 中设置 VITE_API_BASE
 */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:8000";

/**
 * 电影信息导入弹窗
 * 支持从豆瓣 / TMDB / IMDB 导入电影信息
 */
export default function MovieImportModal({
  onImport,
  onClose,
}: MovieImportModalProps) {
  const [source, setSource] = useState<ImportSource>("douban");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentOption = SOURCE_OPTIONS.find((o) => o.value === source)!;

  function isValidMovieResponse(data: unknown): data is Partial<Movie> {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;

    const obj = data as Record<string, unknown>;
    const possibleFields: Array<keyof Movie> = [
      "chinese",
      "foreign",
      "year",
      "director",
      "writer",
      "actors",
      "genre",
      "region",
      "length",
      "douban",
      "desc",
      "short",
    ];

    const hasKnownField = possibleFields.some((key) => key in obj);
    if (!hasKnownField) return false;

    return possibleFields.every((key) =>
      obj[key] === undefined || typeof obj[key] === "string"
    );
  }

  async function handleImport() {
    if (!url.trim()) {
      setError("请输入电影链接");
      return;
    }
    setLoading(true);
    setError(null);

    let resp: Response;
    try {
      resp = await fetch(`${API_BASE}/api/fetch-movie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, url: url.trim() }),
      });
    } catch {
      setError("网络连接失败：无法连接到服务，请检查网络是否可用");
      setLoading(false);
      return;
    }

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      const detail =
        typeof (data as { detail?: unknown }).detail === "string"
          ? (data as { detail: string }).detail
          : `请求失败 (${resp.status})`;
      setError(`爬取失败：${detail}`);
      setLoading(false);
      return;
    }

    let body: unknown;
    try {
      body = await resp.json();
    } catch {
      setError("返回数据异常：服务返回的不是有效 JSON");
      setLoading(false);
      return;
    }

    if (!isValidMovieResponse(body)) {
      setError("返回数据异常：服务返回结构不符合预期，请稍后重试");
      setLoading(false);
      return;
    }

    try {
      onImport(body);
      onClose();
    } catch {
      setError("返回数据异常：导入失败，返回字段可能不完整");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="导入电影信息"
      >
        <div className="modal-header">
          <span className="modal-title">🎬 从网络导入电影信息</span>
          <button className="modal-close-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* 来源选择 */}
          <div className="modal-field">
            <label className="modal-label">数据来源</label>
            <div className="source-tabs">
              {SOURCE_OPTIONS.map((opt) => (
                <div key={opt.value} className="source-tab-wrapper">
                  <button
                    className={`source-tab${source === opt.value ? " active" : ""}`}
                    onClick={() => {
                      setSource(opt.value);
                      setUrl("");
                      setError(null);
                    }}
                  >
                    {opt.label}
                  </button>
                  {opt.tooltip && (
                    <div className="source-tooltip" role="tooltip">
                      <div className="source-tooltip-title">{opt.tooltip.title}</div>
                      <div className="source-tooltip-desc">{opt.tooltip.description}</div>
                      <a
                        className="source-tooltip-link"
                        href={opt.tooltip.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {opt.tooltip.linkLabel}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* URL 输入 */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="import-url">
              电影链接
            </label>
            <input
              id="import-url"
              className="modal-input"
              type="url"
              placeholder={currentOption.placeholder}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              disabled={loading}
              autoFocus
            />
            <span className="modal-hint">
              粘贴 {currentOption.label} 电影页面链接，后端将自动解析并填入表单
            </span>
          </div>

          {/* 错误提示 */}
          {error && <div className="modal-error">⚠️ {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={loading || !url.trim()}
          >
            {loading ? "导入中…" : "确认导入"}
          </button>
        </div>
      </div>
    </div>
  );
}
