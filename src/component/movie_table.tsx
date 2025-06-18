import type { Movie } from "../model/movie";

/**
 * 电影信息表格组件
 * @param {Object} props
 * @param {Object} props.movie - 单部电影信息对象
 * @returns {JSX.Element}
 */
export default function MovieTable({ movie }: { movie: Movie }) {
    return (
        <table
            className="MsoTableGrid"
            border={0}
            cellSpacing={0}
            cellPadding={0}
            style={{
                marginLeft: "-.25pt",
                borderCollapse: "collapse",
                border: "none",
            }}
        >
            <tbody>
                <tr style={{ height: "21.25pt" }}>
                    <td
                        width={114}
                        style={{
                            width: "85.3pt",
                            borderTop: "none",
                            borderLeft: "none",
                            borderBottom: "solid windowtext 1.0pt",
                            borderRight: "solid windowtext 1.0pt",
                            padding: "0cm 5.4pt 0cm 5.4pt",
                            height: "21.25pt",
                        }}
                    >
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>中文名</span>
                        </p>
                    </td>
                    <td
                        width={446}
                        style={{
                            width: "334.6pt",
                            border: "none",
                            borderBottom: "solid windowtext 1.0pt",
                            padding: "0cm 5.4pt 0cm 5.4pt",
                            height: "21.25pt",
                        }}
                    >
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.chinese}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>外文名</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span lang="EN-US" style={{ fontFamily: "华文宋体" }}>
                                {movie.foreign}
                            </span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>年份</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span lang="EN-US" style={{ fontFamily: "华文宋体" }}>
                                {movie.year}
                            </span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>导演</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.director}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>编剧</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.writer}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>主演</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.actors}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>类型</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.genre}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>制片地区/国家</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.region}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>片长</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span lang="EN-US" style={{ fontFamily: "华文宋体" }}>
                                {movie.length}
                            </span>
                            <span style={{ fontFamily: "华文宋体" }}>分钟</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>豆瓣评分</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span lang="EN-US" style={{ fontFamily: "华文宋体" }}>
                                {movie.douban}
                            </span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>剧情简介</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>{movie.desc}</span>
                        </p>
                    </td>
                </tr>
                <tr style={{ height: "21.25pt" }}>
                    <td width={114} style={tdStyle}>
                        <p className="MsoNormal" align="right" style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "华文宋体" }}>豆瓣短评</span>
                        </p>
                    </td>
                    <td width={446} style={tdStyle2}>
                        <p
                            className="MsoNormal"
                            align="left"
                            style={{
                                textAlign: "left",
                                lineHeight: "20.4pt",
                                background: "white",
                            }}
                        >
                            <span
                                lang="EN-US"
                                style={{
                                    color: "black",
                                    fontSize: "10.0pt",
                                    fontFamily: "宋体",
                                }}
                            >
                                {movie.short}
                            </span>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

// 公共样式对象，避免重复
const tdStyle = {
    width: "85.3pt",
    borderTop: "none",
    borderLeft: "none",
    borderBottom: "solid windowtext 1.0pt",
    borderRight: "solid windowtext 1.0pt",
    padding: "0cm 5.4pt 0cm 5.4pt",
    height: "21.25pt",
};
const tdStyle2 = {
    width: "334.6pt",
    border: "none",
    borderBottom: "solid windowtext 1.0pt",
    padding: "0cm 5.4pt 0cm 5.4pt",
    height: "21.25pt",
};