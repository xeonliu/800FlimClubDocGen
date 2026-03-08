import { Fragment } from "react";
import type { MovieWithSchedule } from "../model/movie";
import MovieTable from "./movie_table";
import { isoDateToWeekday } from "../utils/date_format";

interface Props {
    /** 非沙龙放映篇目列表（周四/六/日） */
    movies: MovieWithSchedule[];
}

const DAY_LABEL: Record<string, string> = {
    "周四": "周四",
    "周五": "周五",
    "周六": "周六",
    "周日": "周日",
};

/** 从 ISO 日期字符串（存储格式）中提取"周X"，如 "2026-04-16" → "周四" */
function extractWeekday(showDate: string): string {
    const weekday = isoDateToWeekday(showDate);
    return DAY_LABEL[weekday] ?? (weekday || showDate);
}

/** 从 showDate 中提取序号（按照传入顺序） */
const ORDINAL = ["一", "二", "三", "四", "五"];

/**
 * 模块 6：周末影院
 *
 * 对每部非沙龙电影，生成：
 *   "放映篇目 N：周X" 标签行 + MovieTable
 */
export default function WeekendCinemaModule({ movies }: Props) {
    return (
        <>
            <h1>周末影院</h1>

            {movies.map((movie, idx) => (
                <Fragment key={movie.chinese}>
                    <p className="MsoNormal">
                        <span style={{ fontFamily: "华文仿宋" }}>&nbsp;</span>
                    </p>

                    <p className="MsoNormal">
                        <span style={{ fontFamily: "华文仿宋" }}>
                            放映篇目{ORDINAL[idx] ?? idx + 1}：{extractWeekday(movie.showDate)}
                        </span>
                    </p>

                    <MovieTable movie={movie} variant="regular" />
                </Fragment>
            ))}

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>&nbsp;</span>
            </p>
        </>
    );
}
