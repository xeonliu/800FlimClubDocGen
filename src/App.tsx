import { useState, useMemo, useEffect } from "react";
import "./App.css";
import DocumentPreview from "./component/document_preview";
import EditorPanel from "./component/editor_panel";
import {
  initialEditorState,
  editorFormToDocument,
  createEmptyMovie,
} from "./utils/editor_utils";
import type { EditorFormData } from "./model/editor";

const STORAGE_KEY = "800_FLIM_CLUB_EDITOR_DATA";

function parseStoredDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeStoredEditorData(parsed: unknown): EditorFormData {
  if (!parsed || typeof parsed !== "object") return initialEditorState;

  const raw = parsed as Partial<EditorFormData> & {
    movies?: Array<Record<string, unknown>>;
  };

  const movies = Array.isArray(raw.movies)
    ? raw.movies.map((movie) => ({
        ...createEmptyMovie(Boolean(movie?.isSalon)),
        ...movie,
        isSalon: Boolean(movie?.isSalon),
        showDate: parseStoredDate(movie?.showDate),
      }))
    : initialEditorState.movies;

  return {
    ...initialEditorState,
    ...raw,
    info: {
      ...initialEditorState.info,
      ...(raw.info ?? {}),
    },
    salonReview: Array.isArray(raw.salonReview)
      ? raw.salonReview
      : initialEditorState.salonReview,
    movies,
  };
}

function App() {
  const [editorData, setEditorData] = useState<EditorFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeStoredEditorData(parsed);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    return initialEditorState;
  });

  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // 当 editorData 改变时自动保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editorData));
  }, [editorData]);

  // 实时将编辑器状态转换为文档数据（用于预览）
  const documentData = useMemo(
    () => editorFormToDocument(editorData),
    [editorData]
  );

  return (
    <div className="app-layout">
      <EditorPanel
        data={editorData}
        onChange={setEditorData}
        onReset={() => {
          if (window.confirm("确定要清空所有已填内容并重置吗？")) {
            setEditorData(initialEditorState);
          }
        }}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed((v) => !v)}
      />
      <main className="preview-area">
        <DocumentPreview data={documentData} />
      </main>
    </div>
  );
}

export default App;
