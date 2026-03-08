import type { Schedule } from "../model/schedule";
import type { MovieWithSchedule } from "../model/movie";
import { formatChineseDateDisplay } from "../utils/date_format";

/**
 * 单条放映记录：沙龙场次加粗，普通场次正常字重。
 */
function ScheduleItem({ movie }: { movie: MovieWithSchedule }) {
    const text = `${formatChineseDateDisplay(movie.showDate)} ${movie.startTime}-${movie.endTime}《${movie.chinese}》`;
    return (
        <p className="MsoNormal schedule-line">
            {movie.isSalon ? (
                <b style={{ fontFamily: "华文宋体" }}>{text}</b>
            ) : (
                <span style={{ fontFamily: "华文宋体" }}>{text}</span>
            )}
        </p>
    );
}

/**
 * 模块 3：电影周放映安排
 * 包含 h1 标题、各场次列表及注释脚注。
 */
export default function ScheduleTable({ schedule }: { schedule: Schedule }) {
    return (
        <>
            <h1>电影周放映安排（沙龙那行加粗哦）</h1>

            {schedule.movies.map((movie) => (
                <ScheduleItem key={movie.chinese} movie={movie} />
            ))}

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文仿宋" }}>&nbsp;</span>
            </p>

            <p className="MsoNormal">
                <span className="MsoSubtleReference">
                    *时间按照片长，往上取几点15分/半点/几点45分/整点
                </span>
            </p>

            <p className="MsoNormal">
                <span className="MsoSubtleReference">
                    *沙龙的话记得在放映时间的基础上加半个小时左右
                </span>
            </p>

            <p className="MsoNormal">
                <span className="MsoSubtleReference">
                    *地点由放映部部长李炜森向外联部汇总后加在文档中
                </span>
            </p>

            <p className="MsoNormal">
                <span style={{ fontFamily: "华文宋体" }}>&nbsp;</span>
            </p>
        </>
    );
}