// 其中 movieObj 是一个包含所有字段（chinese, foreign, year, director, writer, actors, genre, region, length, douban, desc, short）的对象。
// 定义 Movie 类型
export interface Movie {
  chinese: string;    // 中文名
  foreign: string;    // 外文名
  year: string;       // 年份
  director: string;   // 导演
  writer: string;     // 编剧
  actors: string;     // 主演
  genre: string;      // 类型
  region: string;     // 地区
  length: string;     // 片长
  douban: string;     // 豆瓣评分
  desc: string;       // 剧情简介
  short: string;      // 豆瓣短评
}

// 例如：
// const movieObj: Movie = {
//   chinese: "霸王别姬",
//   foreign: "Farewell My Concubine",
//   year: "1993",
//   director: "陈凯歌",
//   writer: "芦苇 / 李碧华",
//   actors: "张国荣 / 张丰毅 / 巩俐",
//   genre: "剧情 / 爱情 / 同性",
//   region: "中国大陆 / 香港",
//   length: "171分钟",
//   douban: "9.6",
//   desc: "影片讲述了两位京剧艺人生涯与情感的纠葛。",
//   short: "一生所爱，终成空。"
// };

export interface MovieWithSchedule extends Movie {
  isSalon: boolean;
  showDate: string;
  startTime: string;
  endTime: string;
  salonQuote?: string; // 沙龙引言
  salonReview?: string[]; // 沙龙导赏段落
}