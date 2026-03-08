import React, { Fragment } from "react";
import type { DocumentData } from "../model/document";
import type { MovieWithSchedule } from "../model/movie";
import "../styles/document.css";
import { formatChineseDateDisplay } from "../utils/date_format";

interface Props {
    data: DocumentData;
}

/** 单部影片在报备表中的信息区块 */
function ReportMovieBlock({
    movie,
    label,
}: {
    movie: MovieWithSchedule;
    label: string;
}) {
    const labelWidth = "85.3pt";
    const valueWidth = "334.6pt";

    const labelStyle: React.CSSProperties = {
        width: labelWidth,
        borderTop: "none",
        borderLeft: "none",
        borderBottom: "solid windowtext 1.0pt",
        borderRight: "solid windowtext 1.0pt",
        padding: "0 5.4pt",
        height: "21.25pt",
        verticalAlign: "middle",
    };
    const valueStyle: React.CSSProperties = {
        width: valueWidth,
        border: "none",
        borderBottom: "solid windowtext 1.0pt",
        padding: "0 5.4pt",
        height: "21.25pt",
        verticalAlign: "middle",
    };
    const labelStyleLast: React.CSSProperties = {
        ...labelStyle,
        borderBottom: "none",
    };
    const valueStyleLast: React.CSSProperties = {
        ...valueStyle,
        borderBottom: "none",
        verticalAlign: "top",
        height: "auto",
        minHeight: "42pt",
        paddingTop: "2pt",
        paddingBottom: "2pt",
    };

    const rows: { label: string; value: React.ReactNode; last?: boolean }[] = [
        { label: "中文名", value: movie.chinese },
        { label: "外文名", value: movie.foreign },
        { label: "年份", value: movie.year },
        { label: "导演", value: movie.director },
        { label: "编剧", value: movie.writer },
        { label: "主演", value: movie.actors },
        { label: "类型", value: movie.genre },
        { label: "制片地区/国家", value: movie.region },
        {
            label: "片长",
            value: (
                <span style={{ fontFamily: "华文楷体" }}>{movie.length}分钟</span>
            ),
        },
        { label: "豆瓣评分", value: movie.douban },
        {
            label: "剧情简介",
            value: (
                <span style={{ fontFamily: "华文宋体" }}>{movie.desc}</span>
            ),
        },
        { label: "获奖信息", value: movie.awards || "无" },
        {
            label: "推荐理由",
            value: (
                <span style={{ fontFamily: "华文宋体" }}>{movie.recommendation}</span>
            ),
            last: true,
        },
    ];

    return (
        <div style={{ marginBottom: "6pt" }}>
            <p className="MsoNormal" style={{ fontFamily: "华文仿宋" }}>
                {label}
            </p>

            <table
                className="MsoTableGrid"
                border={0}
                cellSpacing={0}
                cellPadding={0}
                style={{ marginLeft: "-.25pt", borderCollapse: "collapse", border: "none" }}
            >
                <tbody>
                    {rows.map(({ label: l, value, last }) => (
                        <tr key={l} style={{ height: "21.25pt" }}>
                            <td style={last ? labelStyleLast : labelStyle}>
                                <p className="MsoNormal" style={{ textAlign: "right", fontFamily: "华文宋体" }}>
                                    {l}
                                </p>
                            </td>
                            <td style={last ? valueStyleLast : valueStyle}>
                                <p className="MsoNormal" style={{ fontFamily: "华文楷体" }}>
                                    {value}
                                </p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 放映风险单独列出，以便空间充足 */}
            <p className="MsoNormal" style={{ marginTop: "4pt", fontFamily: "华文宋体" }}>
                <span style={{ fontFamily: "华文仿宋" }}>放映风险：</span>
                {movie.risk}
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>
        </div>
    );
}

/**
 * 报备表预览组件
 *
 * 渲染"主题影展信息报备表"，包括：
 *   - 标题栏（800号电影社 学期 WEEK 周次 放映报备）
 *   - 基本信息（周数、放映安排、主题、策展人信息、放映意义、整体风险）
 *   - 各放映篇目（沙龙篇目 + 放映篇目）
 *   - 报备流程说明（静态文本）
 */
export default function ReportPreview({ data }: Props) {
    const { info, schedule, semester = "", significance = "", overallRisk = "" } = data;

    const salonMovies = schedule.movies.filter((m) => m.isSalon);
    const regularMovies = schedule.movies.filter((m) => !m.isSalon);

    return (
        <div className="doc-viewer">
            <div className="doc-page">
                {/* ── 标题 ─────────────────────── */}
                <h1 style={{ textAlign: "center", marginBottom: "8pt" }}>
                    800号电影社&emsp;{semester}&emsp;WEEK&nbsp;{info.week}&emsp;放映报备
                </h1>

                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                </p>

                {/* ── 基本信息 ───────────────── */}
                <div className="basic-info-section" style={{ fontFamily: "华文宋体", fontSize: "12pt" }}>
                    <p className="MsoNormal">
                        <b>电影周周数：</b>第&nbsp;{info.week}&nbsp;周
                    </p>

                    <p className="MsoNormal">
                        <b>放映安排：</b>
                    </p>
                    <div style={{ marginLeft: "21pt" }}>
                        {schedule.movies.map((movie) => (
                            <p className="MsoNormal" key={movie.chinese}>
                                <span style={movie.isSalon ? { fontWeight: "bold" } : undefined}>
                                    {formatChineseDateDisplay(movie.showDate)}&emsp;{movie.startTime}-{movie.endTime}&emsp;
                                    《{movie.chinese}》
                                </span>
                            </p>
                        ))}
                    </div>

                    <p className="MsoNormal">
                        <b>放映主题：</b>{info.theme}
                    </p>

                    <p className="MsoNormal">
                        <b>策展人信息：</b>
                    </p>
                    <p className="MsoNormal" style={{ marginLeft: "21pt" }}>
                        姓名：{info.speaker}
                        &emsp;&emsp;
                        学号：{info.studentId}
                        &emsp;&emsp;
                        院系专业：{info.department}
                    </p>

                    <p className="MsoNormal">
                        <b>放映意义：</b>
                    </p>
                    <p className="MsoNormal" style={{ marginLeft: "21pt", whiteSpace: "pre-wrap" }}>
                        {significance}
                    </p>

                    <p className="MsoNormal">
                        <b>整体放映风险评价：</b>
                    </p>
                    <p className="MsoNormal" style={{ marginLeft: "21pt", whiteSpace: "pre-wrap" }}>
                        {overallRisk}
                    </p>
                </div>

                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                </p>

                {/* ── 沙龙篇目 ───────────────────── */}
                {salonMovies.length > 0 && (
                    <Fragment>
                        <h2>沙龙篇目</h2>
                        <p className="MsoNormal">
                            <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                        </p>
                        {salonMovies.map((movie, idx) => (
                            <ReportMovieBlock
                                key={`salon-${movie.showDate}-${idx}`}
                                movie={movie}
                                label={`沙龙篇目${idx + 1}：`}
                            />
                        ))}
                    </Fragment>
                )}

                {/* ── 放映篇目 ───────────────────── */}
                {regularMovies.length > 0 && (
                    <Fragment>
                        <h2>放映篇目</h2>
                        <p className="MsoNormal">
                            <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                        </p>
                        {regularMovies.map((movie, idx) => (
                            <ReportMovieBlock
                                key={`regular-${movie.showDate}-${idx}`}
                                movie={movie}
                                label={`放映篇目${idx + 1}：`}
                            />
                        ))}
                    </Fragment>
                )}

                {/* ── 报备表提交流程（静态说明） ─── */}
                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                </p>
                <h2>报备表提交流程</h2>
                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文仿宋" }}>若按每周提交：</span>
                </p>
                {[
                    "请策展同学于电影周首次放映前提前两周确定选片，填好报备表，并准备好放映资源，一起交给放映部部长；",
                    "放映部负责人过目后，于电影周前两周周三前将报备表及放映资源交由外联部；",
                    <Fragment>外联部负责同学需于电影周前两周周五前将报备表与放映资源交至庞博老师；</Fragment>,
                    <Fragment>由于推送、海报等制作需要一周的周期，并需要于活动举办前几天发布进行宣传，请<span style={{ display: "inline-block", whiteSpace: "nowrap" }}>庞博老师</span>于电影周前一周周二前反馈审核意见。</Fragment>,
                ].map((text, i) => (
                    <p key={i} className="MsoNormal list-para">
                        <span style={{ fontFamily: "华文仿宋" }}>{i + 1}）{text}</span>
                    </p>
                ))}
                
                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文仿宋" }}>&nbsp;</span>
                </p>

                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文仿宋" }}>若按每半学期提交：</span>
                </p>
                <p className="MsoNormal list-para">
                    <span style={{ fontFamily: "华文仿宋" }}>
                        请在尽量让最近一周影展可以满足上述「每周提交」的时间线的前提下提交报备文件合集，若有特殊情况也尽量留给老师充足的审片时间。
                    </span>
                </p>
                <p className="MsoNormal">
                    <span style={{ fontFamily: "华文仿宋" }}>感谢大家的配合！</span>
                </p>
            </div>
        </div>
    );
}
