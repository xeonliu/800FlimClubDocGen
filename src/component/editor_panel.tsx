import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { EditorFormData, EditorMovieData } from "../model/editor";
import type { Movie } from "../model/movie";
import { createEmptyMovie } from "../utils/editor_utils";
import MovieImportModal from "./movie_import_modal";
import TimeSelect from "./time_select";

interface EditorPanelProps {
  data: EditorFormData;
  onChange: (data: EditorFormData) => void;
  onReset: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTab?: "doc" | "report";
}

/** 可折叠区块 */
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="editor-section">
      <button
        className="editor-section-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="section-arrow">{open ? "▾" : "▸"}</span>
        <span>{title}</span>
      </button>
      {open && <div className="editor-section-body">{children}</div>}
    </div>
  );
}

/** 带 tooltip 的标签 */
function LabelWithTip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="editor-label-with-tip" title={tip}>
      {label}
      <span className="editor-label-tip-icon" aria-hidden="true">ⓘ</span>
    </span>
  );
}

/** 单部影片的编辑区块 */
function MovieEditor({
  movie,
  index,
  onChange,
  onRemove,
}: {
  movie: EditorMovieData;
  index: number;
  onChange: (m: EditorMovieData) => void;
  onRemove: () => void;
}) {
  const [importModalOpen, setImportModalOpen] = useState(false);

  function set<K extends keyof EditorMovieData>(key: K, value: EditorMovieData[K]) {
    onChange({ ...movie, [key]: value });
  }

  function handleImport(partial: Partial<Movie>) {
    onChange({ ...movie, ...partial });
  }

  const movieLabel = movie.chinese
    ? movie.chinese
    : `篇目 ${index + 1}`;

  return (
    <div className="movie-editor-card">
      <div className="movie-editor-card-header">
        <span className="movie-card-label">
          {movie.isSalon ? "🎭 " : "🎬 "}
          {movieLabel}
        </span>
        <div className="movie-card-actions">
          <label className="inline-checkbox" title="标记为周五沙龙篇目">
            <input
              type="checkbox"
              checked={movie.isSalon}
              onChange={(e) => set("isSalon", e.target.checked)}
            />
            &nbsp;沙龙
          </label>
          <button
            className="btn-icon btn-danger"
            onClick={onRemove}
            title="删除此篇目"
            aria-label="删除此篇目"
          >
            🗑
          </button>
        </div>
      </div>

      {/* 放映时间 */}
      <div className="movie-schedule-row">
        <div className="editor-field">
          <label className="editor-label">放映日期</label>
          <DatePicker
            selected={movie.showDate}
            onChange={(date: Date | null) => set("showDate", date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="选择日期"
            className="editor-datepicker"
            isClearable
            portalId="datepicker-portal"
            popperPlacement="bottom-end"
            popperProps={{
              positionFixed: true
            }}
          />
        </div>
        <div className="editor-field">
          <label className="editor-label">开始时间</label>
          <TimeSelect
            value={movie.startTime}
            onChange={(v) => set("startTime", v)}
          />
        </div>
        <div className="editor-field">
          <label className="editor-label">结束时间</label>
          <TimeSelect
            value={movie.endTime}
            onChange={(v) => set("endTime", v)}
          />
        </div>
      </div>

      {/* 导入按钮 */}
      <button
        className="btn-import"
        onClick={() => setImportModalOpen(true)}
        title="从豆瓣/TMDB/IMDB导入电影信息"
      >
        🌐 从网络导入电影信息
      </button>

      {/* 电影基本信息字段 */}
      <div className="movie-fields-grid">
        {(
          [
            { key: "chinese", label: "中文名", hint: "电影中文名称" },
            { key: "foreign", label: "外文名", hint: "原片名或英文名" },
            { key: "year", label: "年份", hint: "上映年份，如 1984" },
            { key: "director", label: "导演", hint: "多人用 / 分隔" },
            { key: "writer", label: "编剧", hint: "多人用 / 分隔" },
            { key: "actors", label: "主演", hint: "多人用 / 分隔" },
            { key: "genre", label: "类型", hint: "如 剧情 / 战争" },
            { key: "region", label: "地区", hint: "如 中国大陆" },
            { key: "length", label: "片长(分钟)", hint: "如 120" },
            { key: "douban", label: "豆瓣评分", hint: "如 9.1" },
          ] as { key: keyof EditorMovieData; label: string; hint: string }[]
        ).map(({ key, label, hint }) => (
          <div key={key} className="editor-field">
            <label className="editor-label" title={hint}>
              {label}
            </label>
            <input
              className="editor-input"
              type="text"
              placeholder={hint}
              value={movie[key] as string}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* 剧情简介 */}
      <div className="editor-field editor-field-full">
        <label className="editor-label" title="剧情概述，约100字">
          剧情简介
        </label>
        <textarea
          className="editor-textarea"
          placeholder="剧情概述，约100字"
          rows={3}
          value={movie.desc}
          onChange={(e) => set("desc", e.target.value)}
        />
      </div>

      {/* 豆瓣短评 */}
      <div className="editor-field editor-field-full">
        <label className="editor-label" title="豆瓣热门短评一则">
          豆瓣短评
        </label>
        <textarea
          className="editor-textarea"
          placeholder="豆瓣热门短评一则"
          rows={2}
          value={movie.short}
          onChange={(e) => set("short", e.target.value)}
        />
      </div>

      {/* 报备表字段：获奖信息 / 推荐理由 / 放映风险 */}
      <div className="editor-field editor-field-full">
        <label className="editor-label" title="所获主要奖项，如无则填「无」">
          获奖信息
        </label>
        <input
          className="editor-input"
          type="text"
          placeholder='所获主要奖项，如无则填"无"'
          value={movie.awards}
          onChange={(e) => set("awards", e.target.value)}
        />
      </div>

      <div className="editor-field editor-field-full">
        <LabelWithTip
          label="推荐理由"
          tip="请从所获奖项、影视地位、艺术解读等角度阐述选片的原因（仅用于报备表）"
        />
        <textarea
          className="editor-textarea"
          placeholder="请从所获奖项、影视地位、艺术解读等角度阐述选片的原因"
          rows={3}
          value={movie.recommendation}
          onChange={(e) => set("recommendation", e.target.value)}
        />
      </div>

      <div className="editor-field editor-field-full">
        <LabelWithTip
          label="放映风险"
          tip="1）查找并附上该电影可放映的所有官方渠道（如爱奇艺、腾讯视频、bilibili）；2）若无在线正版播放渠道，可查找官方电影节或电影资料馆的公映记录；3）如以上均无，请对电影主题、镜头、台词等可能存在的风险进行预判（仅用于报备表）"
        />
        <textarea
          className="editor-textarea"
          placeholder="附上官方放映渠道链接，或说明放映风险"
          rows={2}
          value={movie.risk}
          onChange={(e) => set("risk", e.target.value)}
        />
      </div>

      {/* 沙龙专属字段：引言与导赏 */}
      {movie.isSalon && (
        <div className="salon-editor-fields">
          <div className="editor-field editor-field-full">
            <label className="editor-label">沙龙引言</label>
            <input
              className="editor-input"
              type="text"
              placeholder="一句电影中的台词..."
              value={movie.salonQuote || ""}
              onChange={(e) => set("salonQuote", e.target.value)}
            />
          </div>
          <div className="editor-field editor-field-full">
            <label className="editor-label">沙龙导赏正文</label>
            {(movie.salonReview || [""]).map((text, idx) => (
              <div key={idx} className="salon-review-row" style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                <textarea
                  className="editor-textarea"
                  style={{ flex: 1 }}
                  placeholder={`第 ${idx + 1} 段导赏文字...`}
                  rows={3}
                  value={text}
                  onChange={(e) => {
                    const next = [...(movie.salonReview || [""])];
                    next[idx] = e.target.value;
                    set("salonReview", next);
                  }}
                />
                <button
                  className="btn-icon btn-danger"
                  onClick={() => {
                    const next = (movie.salonReview || [""]).filter((_, i) => i !== idx);
                    set("salonReview", next.length ? next : [""]);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="btn-add-item"
              style={{ marginTop: "4px" }}
              onClick={() => set("salonReview", [...(movie.salonReview || [""]), ""])}
            >
              + 添加导赏段落
            </button>
          </div>
        </div>
      )}

      {importModalOpen && (
        <MovieImportModal
          onImport={handleImport}
          onClose={() => setImportModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * 左侧编辑面板
 * 包含所有表单字段、可折叠区块、打印按钮
 */
export default function EditorPanel({
  data,
  onChange,
  collapsed,
  onToggleCollapse,
  onReset,
  activeTab = "doc",
}: EditorPanelProps) {
  const setInfo = useCallback(
    (key: keyof typeof data.info, value: string) => {
      onChange({ ...data, info: { ...data.info, [key]: value } });
    },
    [data, onChange]
  );

  const setMovies = useCallback(
    (movies: EditorMovieData[]) => onChange({ ...data, movies }),
    [data, onChange]
  );

  function updateMovie(index: number, movie: EditorMovieData) {
    const next = [...data.movies];
    next[index] = movie;
    setMovies(next);
  }

  function removeMovie(index: number) {
    setMovies(data.movies.filter((_, i) => i !== index));
  }

  function addMovie(isSalon: boolean) {
    setMovies([...data.movies, createEmptyMovie(isSalon)]);
  }

  const tabName = activeTab === "report" ? "报备表" : "宣传资料";
  const printLabel = `🖨️ 打印${tabName}`;

  return (
    <aside
      className={`editor-panel${collapsed ? " collapsed" : ""}`}
      aria-label="编辑面板"
    >
      {/* 折叠切换按钮 */}
      <button
        className="panel-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? "展开编辑面板" : "折叠编辑面板"}
        aria-label={collapsed ? "展开编辑面板" : "折叠编辑面板"}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {!collapsed && (
        <div className="editor-panel-inner">
          <div className="editor-panel-top">
            <h2 className="editor-panel-title">📋 信息填写</h2>
            <div className="editor-panel-actions">
              <button
                className="btn-print"
                onClick={() => window.print()}
                title={`打印当前预览标签页 / 导出 PDF（当前：${tabName}）`}
              >
                {printLabel}
              </button>
              <button
                className="panel-reset-btn"
                onClick={onReset}
                title="重置所有数据到初始状态"
                aria-label="重置所有数据到初始状态"
              >
                🧹 重置
              </button>
            </div>
          </div>

          {/* ─── 基本信息 ─── */}
          <Section title="📌 基本信息">
            <div className="editor-field">
              <label className="editor-label" title="本期活动周次编号，如 9">
                周次
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="如：9"
                value={data.info.week}
                onChange={(e) => setInfo("week", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="本期主讲/策展嘉宾姓名">
                主讲人/策展人
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="姓名"
                value={data.info.speaker}
                onChange={(e) => setInfo("speaker", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="策展人学号（仅用于报备表）">
                学号
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="学号（报备表用）"
                value={data.info.studentId}
                onChange={(e) => setInfo("studentId", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="策展人院系专业（仅用于报备表）">
                院系专业
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="如：计算机科学与技术（报备表用）"
                value={data.info.department}
                onChange={(e) => setInfo("department", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="本期主题名称">
                主题
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="主题名称"
                value={data.info.theme}
                onChange={(e) => setInfo("theme", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="一句话介绍本期主题">
                主题简介
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="一句话介绍"
                value={data.info.themeDesc}
                onChange={(e) => setInfo("themeDesc", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label" title="学期标识，如 2025年秋（用于报备表标题）">
                学期
              </label>
              <input
                className="editor-input"
                type="text"
                placeholder="如：2025年秋（报备表用）"
                value={data.semester}
                onChange={(e) => onChange({ ...data, semester: e.target.value })}
              />
            </div>
            <div className="editor-field">
              <label className="editor-label inline-label">
                <input
                  type="checkbox"
                  checked={data.showInstructions}
                  onChange={(e) =>
                    onChange({ ...data, showInstructions: e.target.checked })
                  }
                />
                &nbsp;显示指示说明（模块1）
              </label>
            </div>
          </Section>

          {/* ─── 主题介绍 ─── */}
          <Section title="📝 主题介绍">
            <div className="editor-field editor-field-full">
              <label className="editor-label" title="第4模块展示的主题正文介绍">
                正文段落
              </label>
              <textarea
                className="editor-textarea editor-textarea-lg"
                placeholder="主题介绍正文，可多段，使用换行分段"
                rows={6}
                value={data.themeText}
                onChange={(e) => onChange({ ...data, themeText: e.target.value })}
              />
            </div>
          </Section>

          {/* ─── 报备表专属信息 ─── */}
          <Section title="📑 报备表信息" defaultOpen={false}>
            <p className="editor-hint">以下字段仅用于放映报备表，不影响宣传资料。</p>
            <div className="editor-field editor-field-full">
              <LabelWithTip
                label="放映意义"
                tip="简要说明本次影展的选片意义和策划初衷"
              />
              <textarea
                className="editor-textarea"
                placeholder="简要说明本次影展的选片意义和策划初衷"
                rows={4}
                value={data.significance}
                onChange={(e) => onChange({ ...data, significance: e.target.value })}
              />
            </div>
            <div className="editor-field editor-field-full">
              <LabelWithTip
                label="整体放映风险评价"
                tip="对本次影展所有影片整体放映风险的综合评估"
              />
              <textarea
                className="editor-textarea"
                placeholder="对本次影展所有影片整体放映风险的综合评估"
                rows={3}
                value={data.overallRisk}
                onChange={(e) => onChange({ ...data, overallRisk: e.target.value })}
              />
            </div>
          </Section>

          {/* ─── 放映安排 ─── */}
          <Section title="🎬 放映安排">
            <p className="editor-hint">
              点击"+ 添加篇目"增加影片，勾选"沙龙"标记为周五沙龙篇目。
              篇目数量可任意增减。
            </p>
            {data.movies.map((movie, i) => (
              <MovieEditor
                key={i}
                movie={movie}
                index={i}
                onChange={(m) => updateMovie(i, m)}
                onRemove={() => removeMovie(i)}
              />
            ))}
            <div className="add-movie-row">
              <button
                className="btn-add"
                onClick={() => addMovie(false)}
                title="添加一部周末影院篇目"
              >
                + 周末影院篇目
              </button>
              <button
                className="btn-add btn-add-salon"
                onClick={() => addMovie(true)}
                title="添加一部沙龙篇目"
              >
                + 沙龙篇目
              </button>
            </div>
          </Section>
        </div>
      )}
    </aside>
  );
}
