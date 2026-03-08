/**
 * 日期格式化工具（东八区 UTC+8）
 *
 * 存储约定：showDate 使用 ISO 8601 字符串 "YYYY-MM-DD"（含年份）
 * 渲染约定：展示时调用 formatChineseDateDisplay / isoDateToWeekday，不显示年份
 */

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * 将 JS Date 对象格式化为中文日期字符串（东八区，不含年份）
 * 例如：new Date("2026-04-13") → "4月13日 周一"
 * 内部工具函数，外部请用 formatChineseDateDisplay。
 */
export function formatChineseDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  // 使用 Intl.DateTimeFormat 获取东八区的年月日和星期
  const fmt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const parts = fmt.formatToParts(date);
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";

  // Intl weekday in zh-CN short = "周一" etc.
  return `${month}月${day}日 ${weekday}`;
}

/**
 * 将 ISO 日期字符串（存储格式 "YYYY-MM-DD"）转换为渲染用中文日期（不含年份）
 * 例如："2026-04-13" → "4月13日 周一"
 */
export function formatChineseDateDisplay(isoStr: string): string {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return isoStr;
  return formatChineseDate(date);
}

/**
 * 从 ISO 日期字符串提取星期（Asia/Shanghai 时区）
 * 例如："2026-04-13" → "周一"
 */
export function isoDateToWeekday(isoStr: string): string {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  });
  return fmt.format(date);
}

/**
 * 将 Date 对象格式化为 ISO 日期字符串（Asia/Shanghai 时区，适合存储）
 * 例如：new Date("2026-04-13T04:00:00Z") → "2026-04-13"
 */
export function dateToIsoString(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  // en-CA locale 输出 "YYYY-MM-DD" 格式，指定时区避免跨天偏移
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * 解析中文日期字符串为 Date 对象（已废弃：存储格式改为 ISO 字符串，请勿在新代码中使用）
 * @deprecated 仅保留用于兼容旧数据迁移
 */
export function parseChineseDate(
  dateStr: string,
  year: number = new Date().getFullYear()
): Date | null {
  const match = dateStr.match(/(\d+)月(\d+)日/);
  if (!match) return null;
  const month = parseInt(match[1], 10) - 1; // 0-indexed
  const day = parseInt(match[2], 10);

  const utcOffsetMs = 8 * 60 * 60 * 1000;
  const noonUtc8Ms = Date.UTC(year, month, day, 12, 0, 0);
  return new Date(noonUtc8Ms - utcOffsetMs);
}

/**
 * 生成以15分钟为单位的时间选项（00:00 - 23:45）
 */
export function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}

/** WEEKDAYS 供外部按索引使用 */
export { WEEKDAYS };
