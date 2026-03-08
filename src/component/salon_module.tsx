import { Fragment } from "react";
import type { Movie } from "../model/movie";
import MovieTable from "./movie_table";

interface Props {
  /** 沙龙篇目电影信息 */
  movie: Movie;
  /** 标题文字，如 "周五沙龙" */
  title?: string;
  /** 居中引言（台词） */
  quote: string;
  /** 2-3 段导赏文字 */
  review: string[];
}

/**
 * 模块 5：沙龙模块
 *
 * 本模块在打印时独立分页（break-before: page）。
 * 包含：
 *   h1: 标题（默认为 周五沙龙）
 *   h2: 一、沙龙篇目电影基本信息：
 *   电影信息表格（salon 变体）
 *   h2: 二、沙龙导赏：
 *   居中引言
 *   2-3 段导赏正文
 */
export function SalonModule({
  movie,
  title = "周五沙龙",
  quote,
  review,
}: Props) {
  return (
    <div className="salon-container">
      <h1>{title}</h1>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>

            <h2>一、沙龙篇目电影基本信息：</h2>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>

            <MovieTable movie={movie} variant="salon" />

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>*详细要求参考《电影周宣传资料模板_指南》</span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>&nbsp;</span>
            </p>

            <h2>二、沙龙导赏：</h2>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>*一句电影中的台词/如果没有合适的也可以自己写一句话：</span>
            </p>
            
            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>
            
            {/* 居中引言 */}
            <p className="MsoNormal salon-quote">
                <span style={{ fontFamily: "华文宋体" }}>{quote}</span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>*两到三小段话，会用上面的“一句电影中的台词”来将这些段落分隔为两部分，因此出于排版美观需要，请大家让段落长度大致相同，每段100-200字左右</span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>

            {/* 导赏正文段落 */}
            {review.map((para, idx) => (
                <Fragment key={idx}>
                    <p className="MsoNormal">
                        <span style={{ fontFamily: "华文宋体" }}>{para}</span>
                    </p>
                    {idx < review.length - 1 && (
                        <p className="MsoNormal">
                            <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
                        </p>
                    )}
                </Fragment>
            ))}
        </div>
    );
}
export default SalonModule;
