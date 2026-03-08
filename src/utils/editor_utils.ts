import type { DocumentData } from "../model/document";
import type { EditorFormData, EditorMovieData } from "../model/editor";
import type { MovieWithSchedule } from "../model/movie";
import { mockDocumentData } from "../data/mock_data";
import { dateToIsoString } from "./date_format";

/**
 * 将 MovieWithSchedule（文档模型）转换为 EditorMovieData（编辑器状态）
 */
function movieWithScheduleToEditor(m: MovieWithSchedule): EditorMovieData {
  return {
    chinese: m.chinese,
    foreign: m.foreign,
    year: m.year,
    director: m.director,
    writer: m.writer,
    actors: m.actors,
    genre: m.genre,
    region: m.region,
    length: m.length,
    douban: m.douban,
    desc: m.desc,
    short: m.short,
    isSalon: m.isSalon,
    showDate: m.showDate ? new Date(m.showDate) : null,
    startTime: m.startTime,
    endTime: m.endTime,
    salonQuote: m.salonQuote || "",
    salonReview: m.salonReview ? [...m.salonReview] : [""],
    awards: m.awards || "",
    recommendation: m.recommendation || "",
    risk: m.risk || "",
  };
}

/**
 * 将 EditorMovieData 转换回 MovieWithSchedule（供预览使用）
 */
function editorMovieToDocument(m: EditorMovieData): MovieWithSchedule {
  return {
    chinese: m.chinese,
    foreign: m.foreign,
    year: m.year,
    director: m.director,
    writer: m.writer,
    actors: m.actors,
    genre: m.genre,
    region: m.region,
    length: m.length,
    douban: m.douban,
    desc: m.desc,
    short: m.short,
    isSalon: m.isSalon,
    showDate: m.showDate ? dateToIsoString(m.showDate) : "",
    startTime: m.startTime,
    endTime: m.endTime,
    salonQuote: m.salonQuote || "",
    salonReview: m.salonReview ? [...m.salonReview] : [""],
    awards: m.awards || "",
    recommendation: m.recommendation || "",
    risk: m.risk || "",
  };
}

/**
 * 将 DocumentData 初始化为 EditorFormData
 */
export function documentToEditorForm(doc: DocumentData): EditorFormData {
  return {
    showInstructions: doc.showInstructions ?? true,
    info: { ...doc.info },
    themeText: doc.themeText,
    salonQuote: doc.salonQuote,
    salonReview: [...doc.salonReview],
    movies: doc.schedule.movies.map(movieWithScheduleToEditor),
    semester: doc.semester || "",
    significance: doc.significance || "",
    overallRisk: doc.overallRisk || "",
  };
}

/**
 * 将 EditorFormData 转换为 DocumentData（供预览渲染使用）
 */
export function editorFormToDocument(editor: EditorFormData): DocumentData {
  return {
    showInstructions: editor.showInstructions,
    info: { ...editor.info },
    themeText: editor.themeText,
    salonQuote: editor.salonQuote,
    salonReview: [...editor.salonReview],
    schedule: {
      movies: editor.movies.map(editorMovieToDocument),
    },
    semester: editor.semester,
    significance: editor.significance,
    overallRisk: editor.overallRisk,
  };
}

/**
 * 创建一部空白影片的默认编辑器数据
 */
export function createEmptyMovie(isSalon = false): EditorMovieData {
  return {
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
    isSalon,
    showDate: null,
    startTime: "18:30",
    endTime: "21:00",
    awards: "",
    recommendation: "",
    risk: "",
  };
}

/**
 * 从 mock 数据初始化编辑器状态
 */
export const initialEditorState: EditorFormData =
  documentToEditorForm(mockDocumentData);
