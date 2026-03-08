/**
 * 日期格式化工具（东八区 UTC+8）
 */

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * 将 JS Date 对象格式化为中文日期字符串（东八区）
 * 例如：new Date("2026-04-13") → "4月13日 周一"
 */
export function formatChineseDate(date: Date): string {
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
 * 解析中文日期字符串为 Date 对象（默认使用当前年份，时区：Asia/Shanghai）
 * 例如："4月13日 周一" → 对应 Asia/Shanghai 时区的 Date 对象
 */
export function parseChineseDate(
  dateStr: string,
  year: number = new Date().getFullYear()
): Date | null {
  const match = dateStr.match(/(\d+)月(\d+)日/);
  if (!match) return null;
  const month = parseInt(match[1], 10) - 1; // 0-indexed
  const day = parseInt(match[2], 10);

  // 通过 Intl.DateTimeFormat 将东八区中午12点转换为 UTC 时间戳，
  // 避免因客户端本地时区不同导致日期偏移。
  // 直接构造 Asia/Shanghai 时区的 12:00 等同于 UTC+8 的 04:00。
  const utcOffsetMs = 8 * 60 * 60 * 1000; // UTC+8 → UTC 偏移量
  const noonUtc8Ms = Date.UTC(year, month, day, 12, 0, 0); // 视为 UTC+8 中午
  return new Date(noonUtc8Ms - utcOffsetMs); // 转换为实际 UTC 时间戳
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
