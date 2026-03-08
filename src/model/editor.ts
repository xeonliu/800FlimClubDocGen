import type { Info } from "./info";

/**
 * 编辑器内部使用的单部影片数据结构
 * showDate 使用 Date 对象以支持日期选择器，最终格式化为中文字符串
 */
export interface EditorMovieData {
  chinese: string;    // 中文名
  foreign: string;    // 外文名
  year: string;       // 年份
  director: string;   // 导演
  writer: string;     // 编剧
  actors: string;     // 主演
  genre: string;      // 类型
  region: string;     // 地区
  length: string;     // 片长（分钟）
  douban: string;     // 豆瓣评分
  desc: string;       // 剧情简介
  short: string;      // 豆瓣短评

  isSalon: boolean;       // 是否为周五沙龙篇目
  showDate: Date | null;  // 放映日期（东八区）
  startTime: string;      // 开始时间，格式 "HH:MM"
  endTime: string;        // 结束时间，格式 "HH:MM"

  // 沙龙模块特定字段
  salonQuote?: string;    // 沙龙引言
  salonReview?: string[]; // 沙龙导赏段落
}

/**
 * 编辑器全局表单状态
 */
export interface EditorFormData {
  showInstructions: boolean;  // 是否显示模块1指示说明
  info: Info;                 // 基本信息
  themeText: string;          // 主题介绍正文
  salonQuote: string;         // 沙龙引言
  salonReview: string[];      // 沙龙导赏段落（可多段）
  movies: EditorMovieData[];  // 所有放映篇目（沙龙+周末）
}

/** 电影信息导入来源 */
export type ImportSource = "douban" | "tmdb" | "imdb";
