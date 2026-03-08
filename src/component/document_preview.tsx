import type { DocumentData } from "../model/document";
import "../styles/document.css";

import InstructionsModule from "./instructions_module";
import BasicInfoModule from "./basic_info_module";
import ScheduleTable from "./schedule";
import ThemeModule from "./theme_module";
import SalonModule from "./salon_module";
import WeekendCinemaModule from "./weekend_cinema_module";

interface Props {
    data: DocumentData;
}

/**
 * 完整文档预览组件
 *
 * 将六个模块渲染在 A4 页面容器中，屏幕上以纸张阴影效果呈现，
 * 打印/导出 PDF 时自动套用 @page 尺寸与分页规则。
 *
 * 布局示意：
 *   ┌──────────────────────────────┐
 *   │  模块 1：指示说明（可选）       │
 *   │  模块 2：基本信息              │
 *   │  模块 3：放映安排              │
 *   │  模块 4：关于电影周主题         │
 *   ├── ── ── 分页线 ── ── ── ──── ┤
 *   │  模块 5：周五沙龙              │
 *   │  模块 6：周末影院              │
 *   └──────────────────────────────┘
 */
export default function DocumentPreview({ data }: Props) {
    const { showInstructions = true, info, schedule, themeText } = data;

    // 获取所有沙龙篇目（isSalon === true）
    const salonMovies = schedule.movies.filter((m) => m.isSalon);
    // 周末影院篇目（非沙龙）
    const weekendMovies = schedule.movies.filter((m) => !m.isSalon);

    // 根据日期获取星期（周四/周五）
    const getSalonTitle = (movie: any) => {
        const dateStr = movie.showDate || "";
        
        if (dateStr.includes("周一")) return "周一沙龙";
        if (dateStr.includes("周二")) return "周二沙龙";
        if (dateStr.includes("周三")) return "周三沙龙";
        if (dateStr.includes("周四")) return "周四沙龙";
        if (dateStr.includes("周五")) return "周五沙龙";
        if (dateStr.includes("周六")) return "周六沙龙";
        if (dateStr.includes("周日")) return "周日沙龙";
        
        // 如果没有星期信息，回退到默认
        return "周五沙龙"; 
    };

    return (
        <div className="doc-viewer">
            {/* ── 第 1 页 ─────────────────── */}
            <div className="doc-page">
                {/* ── 模块 1：指示说明（可选） ─────────────────── */}
                {showInstructions && <InstructionsModule />}

                {/* ── 模块 2：基本信息 ─────────────────────────── */}
                <BasicInfoModule info={info} />

                {/* ── 模块 3：放映安排 ─────────────────────────── */}
                <ScheduleTable schedule={schedule} />

                {/* ── 模块 4：关于电影周主题 ───────────────────── */}
                <ThemeModule themeText={themeText} />
            </div>

            {/* ── 沙龙模块（可能有多个） ─────────────────── */}
            {salonMovies.map((movie, index) => (
                <div className="doc-page" key={`salon-${index}`}>
                    <SalonModule
                        movie={movie}
                        title={getSalonTitle(movie)}
                        quote={movie.salonQuote || ""}
                        review={movie.salonReview || []}
                    />
                </div>
            ))}

            {/* ── 周末影院 ─────────────────── */}
            {weekendMovies.length > 0 && (
                <div className="doc-page">
                    <WeekendCinemaModule movies={weekendMovies} />
                </div>
            )}
        </div>
    );
}
