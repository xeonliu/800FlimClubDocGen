"""
800电影社文档生成器 — Python 后端
支持从豆瓣 / TMDB / IMDB 抓取电影信息，返回统一格式供前端自动填表。

启动方式：
    uvicorn main:app --reload --port 8000

环境变量（可在 .env 中配置）：
    TMDB_API_KEY   — TMDB API 密钥（https://www.themoviedb.org/settings/api）
    TMDB_LANGUAGE  — TMDB 返回语言，默认 zh-CN
"""

from __future__ import annotations

import os
import re
from typing import Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

load_dotenv()

app = FastAPI(title="800电影社文档生成器 API", version="1.0.0")

# 允许前端开发服务器跨域调用。
# ⚠️  生产环境请将 "*" 替换为前端实际域名，如 ["https://your-frontend.example.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
TMDB_LANGUAGE: str = os.getenv("TMDB_LANGUAGE", "zh-CN")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

# ─────────────────────────────────────────────
# 数据模型
# ─────────────────────────────────────────────


class FetchRequest(BaseModel):
    source: str  # "douban" | "tmdb" | "imdb"
    url: str

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        allowed = {"douban", "tmdb", "imdb"}
        if v not in allowed:
            raise ValueError(f"来源必须是 {allowed} 之一")
        return v


class MovieInfo(BaseModel):
    """返回给前端的电影信息（字段与前端 Movie 接口对应）"""
    chinese: str = ""
    foreign: str = ""
    year: str = ""
    director: str = ""
    writer: str = ""
    actors: str = ""
    genre: str = ""
    region: str = ""
    length: str = ""
    douban: str = ""
    desc: str = ""
    short: str = ""


# ─────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────


def _get(url: str, timeout: int = 10) -> requests.Response:
    """发出 GET 请求，失败时抛出 HTTPException。"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"上游请求失败：{exc}") from exc


def _text(tag) -> str:
    """安全地提取 BeautifulSoup 标签的文字内容。"""
    if tag is None:
        return ""
    return tag.get_text(strip=True)


# ─────────────────────────────────────────────
# 豆瓣抓取
# ─────────────────────────────────────────────


def _extract_douban_id(url: str) -> str:
    """从豆瓣 URL 提取 subject ID，如 https://movie.douban.com/subject/1291546/ → 1291546"""
    m = re.search(r"/subject/(\d+)", url)
    if not m:
        raise HTTPException(status_code=400, detail="无法从豆瓣链接中提取影片 ID")
    return m.group(1)


def fetch_douban(url: str) -> MovieInfo:
    """
    抓取豆瓣电影页面，解析电影信息。
    豆瓣无官方 API，通过请求 HTML 页面解析。
    """
    subject_id = _extract_douban_id(url)
    page_url = f"https://movie.douban.com/subject/{subject_id}/"
    resp = _get(page_url)
    soup = BeautifulSoup(resp.text, "lxml")

    # ── 中文名 ──
    title_tag = soup.find("span", property="v:itemreviewed")
    chinese = _text(title_tag)

    # ── 外文名（#content h1 的第二个 span） ──
    h1 = soup.find("div", id="content")
    foreign = ""
    if h1:
        spans = h1.find("h1", recursive=True)
        if spans:
            all_spans = spans.find_all("span")
            # 第一个 span 是中文名，第二个是年份
            pass

    # 豆瓣电影信息 info div
    info_div = soup.find("div", id="info")
    info_text = info_div.get_text("\n") if info_div else ""

    def extract_info_field(label: str) -> str:
        """在 info_text 中提取特定字段内容"""
        if info_div is None:
            return ""
        # 找到包含 label 的 span
        for span in info_div.find_all("span", class_="pl"):
            if label in span.get_text():
                # 收集 span 之后、下一个 .pl 之前的文本
                parts = []
                for sibling in span.next_siblings:
                    if hasattr(sibling, "get_attribute_list") and "pl" in sibling.get_attribute_list("class", []):
                        break
                    text = sibling.get_text(strip=True) if hasattr(sibling, "get_text") else str(sibling).strip()
                    if text:
                        parts.append(text)
                return " / ".join(p for p in parts if p and p != "/")
        return ""

    def extract_info_text(label: str) -> str:
        """提取单行字段（文本形式）"""
        if info_div is None:
            return ""
        for span in info_div.find_all("span", class_="pl"):
            if label in span.get_text():
                sibling = span.next_sibling
                if sibling:
                    text = sibling.strip() if isinstance(sibling, str) else sibling.get_text(strip=True)
                    return text
        return ""

    # ── 导演 ──
    directors = []
    if info_div:
        for a in info_div.select("span.pl ~ a[rel='v:directedBy']"):
            directors.append(a.get_text(strip=True))
    director = " / ".join(directors)

    # ── 编剧 ──
    writers = []
    if info_div:
        writer_span = info_div.find("span", class_="pl", string=re.compile("编剧"))
        if writer_span:
            for a in writer_span.find_next_siblings("a"):
                if a.get_text(strip=True) == "更多...":
                    break
                writers.append(a.get_text(strip=True))
    writer = " / ".join(writers)

    # ── 主演 ──
    actors_list = []
    if info_div:
        for a in info_div.select("a[rel='v:starring']"):
            actors_list.append(a.get_text(strip=True))
    actors = " / ".join(actors_list)

    # ── 类型 ──
    genres = []
    if info_div:
        for span in info_div.select("span[property='v:genre']"):
            genres.append(span.get_text(strip=True))
    genre = " / ".join(genres)

    # ── 地区 ──
    region = extract_info_text("制片国家/地区")

    # ── 语言 (不需要，但可备用) ──

    # ── 片长 ──
    length_tag = soup.find("span", property="v:runtime")
    length = ""
    if length_tag:
        length_text = length_tag.get("content", "") or _text(length_tag)
        length = re.sub(r"\D", "", length_text)  # 只保留数字
    if not length:
        length = re.sub(r"\D", "", extract_info_text("片长"))

    # ── 年份 ──
    year_tag = soup.find("span", class_="year")
    year = re.sub(r"\D", "", _text(year_tag))

    # ── 豆瓣评分 ──
    rating_tag = soup.find("strong", property="v:average")
    douban_rating = _text(rating_tag)

    # ── 剧情简介 ──
    desc = ""
    summary_tag = soup.find("span", property="v:summary")
    if summary_tag:
        desc = summary_tag.get_text(strip=True).replace("\xa0", "").strip()

    # ── 豆瓣短评（热门短评第一条）──
    short = ""
    comment_tag = soup.find("span", class_="short")
    if comment_tag:
        short = comment_tag.get_text(strip=True)

    # ── 外文名（标题中的非中文部分）──
    if not foreign:
        title_full = _text(soup.find("title"))
        # 豆瓣标题格式："中文名 (外文名)"
        m = re.search(r"[(（]([^)）]+)[)）]", chinese)
        if m:
            foreign = m.group(1)
            chinese = chinese[: chinese.index(m.group(0))].strip()
        # 尝试从 og:title 提取
        og_title = soup.find("meta", property="og:title")
        if og_title and not foreign:
            og_text = og_title.get("content", "")
            m2 = re.search(r"[(（]([^)）]+)[)）]", og_text)
            if m2:
                foreign = m2.group(1)
        if not foreign:
            pass  # 无法从标题中解析外文名，留空即可

    return MovieInfo(
        chinese=chinese,
        foreign=foreign,
        year=year,
        director=director,
        writer=writer,
        actors=actors,
        genre=genre,
        region=region,
        length=length,
        douban=douban_rating,
        desc=desc,
        short=short,
    )


# ─────────────────────────────────────────────
# TMDB 抓取
# ─────────────────────────────────────────────


def _extract_tmdb_id(url: str) -> tuple[str, str]:
    """
    从 TMDB URL 提取 ID 和类型（movie / tv）。
    例如：https://www.themoviedb.org/movie/680 → ("movie", "680")
    """
    m = re.search(r"themoviedb\.org/(movie|tv)/(\d+)", url)
    if not m:
        raise HTTPException(status_code=400, detail="无法从 TMDB 链接中提取影片 ID")
    return m.group(1), m.group(2)


def fetch_tmdb(url: str) -> MovieInfo:
    """通过 TMDB API 获取电影信息。需要设置 TMDB_API_KEY 环境变量。"""
    if not TMDB_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="服务端未配置 TMDB_API_KEY，无法使用 TMDB 数据源。请在 .env 中添加 TMDB_API_KEY=你的密钥。",
        )

    media_type, tmdb_id = _extract_tmdb_id(url)
    api_url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": TMDB_LANGUAGE,
        "append_to_response": "credits",
    }

    try:
        resp = requests.get(api_url, params=params, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"TMDB 请求失败：{exc}") from exc

    data: dict = resp.json()
    credits: dict = data.get("credits", {})

    # 导演
    crew = credits.get("crew", [])
    directors = [p["name"] for p in crew if p.get("job") == "Director"]
    writers = [
        p["name"]
        for p in crew
        if p.get("department") == "Writing"
        and p.get("job") in ("Writer", "Screenplay", "Story", "Script")
    ]

    # 主演（前5位）
    cast = credits.get("cast", [])[:5]
    actors_list = [p["name"] for p in cast]

    # 类型
    genres = [g["name"] for g in data.get("genres", [])]

    # 制片国家
    countries = [c["name"] for c in data.get("production_countries", [])]

    # 片长
    runtime = str(data.get("runtime", ""))

    # 年份
    release_date = data.get("release_date", "") or data.get("first_air_date", "")
    year = release_date[:4] if release_date else ""

    # 中文名 / 外文名
    chinese = data.get("title") or data.get("name", "")
    foreign = data.get("original_title") or data.get("original_name", "")

    # 简介
    desc = data.get("overview", "")

    return MovieInfo(
        chinese=chinese,
        foreign=foreign,
        year=year,
        director=" / ".join(directors),
        writer=" / ".join(writers),
        actors=" / ".join(actors_list),
        genre=" / ".join(genres),
        region=" / ".join(countries),
        length=runtime,
        douban="",  # TMDB 无豆瓣评分
        desc=desc,
        short="",
    )


# ─────────────────────────────────────────────
# IMDB 抓取（通过 cinemagoer）
# ─────────────────────────────────────────────


def _extract_imdb_id(url: str) -> str:
    """
    从 IMDB URL 提取 tt ID。
    例如：https://www.imdb.com/title/tt0110912/ → tt0110912
    """
    m = re.search(r"/(tt\d+)", url)
    if not m:
        raise HTTPException(status_code=400, detail="无法从 IMDB 链接中提取影片 ID")
    return m.group(1)


def fetch_imdb(url: str) -> MovieInfo:
    """通过 cinemagoer 库获取 IMDB 影片信息。"""
    try:
        import imdb as cinemagoer_module  # cinemagoer 安装后以 imdb 导入
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="服务端未安装 cinemagoer 库，请执行 pip install cinemagoer。",
        ) from None

    imdb_id = _extract_imdb_id(url)
    # cinemagoer 接受不带 "tt" 前缀的纯数字 ID
    numeric_id = imdb_id.lstrip("t")

    ia = cinemagoer_module.Cinemagoer()
    try:
        movie = ia.get_movie(numeric_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"IMDB 查询失败：{exc}") from exc

    if movie is None:
        raise HTTPException(status_code=404, detail="IMDB 上未找到该影片")

    def join_persons(key: str) -> str:
        people = movie.get(key, []) or []
        return " / ".join(str(p) for p in people[:5])

    genres_raw = movie.get("genres", []) or []
    countries_raw = movie.get("countries", []) or []
    runtime_raw = movie.get("runtimes", [""])[0]

    return MovieInfo(
        chinese=str(movie.get("title", "")),
        foreign=str(movie.get("original title", movie.get("title", ""))),
        year=str(movie.get("year", "")),
        director=join_persons("directors"),
        writer=join_persons("writers"),
        actors=join_persons("cast"),
        genre=" / ".join(genres_raw[:4]),
        region=" / ".join(countries_raw[:3]),
        length=re.sub(r"\D", "", str(runtime_raw)),
        douban="",
        desc=str(movie.get("plot outline", "") or ""),
        short="",
    )


# ─────────────────────────────────────────────
# API 路由
# ─────────────────────────────────────────────


@app.get("/")
def health():
    return {"status": "ok", "message": "800电影社文档生成器 API 运行中"}


@app.post("/api/fetch-movie", response_model=MovieInfo)
def fetch_movie(req: FetchRequest) -> MovieInfo:
    """
    根据来源和链接抓取电影信息。

    - **source**: `"douban"` | `"tmdb"` | `"imdb"`
    - **url**: 对应平台的电影页面链接
    """
    source = req.source
    url = req.url.strip()

    # 简单校验 URL 格式
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(status_code=400, detail="链接格式不正确，请输入完整的 URL（含 https://）")

    if source == "douban":
        return fetch_douban(url)
    elif source == "tmdb":
        return fetch_tmdb(url)
    elif source == "imdb":
        return fetch_imdb(url)
    else:
        raise HTTPException(status_code=400, detail="不支持的数据来源")
