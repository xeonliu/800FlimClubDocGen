# 800 号电影社文档生成器 (800FilmClubDocGen)

基于 Vite + React + FastAPI/Cloudflare Workers 构建的自动化影展报备表生成工具。旨在解决从豆瓣、TMDB 手动复制电影信息繁琐的问题，支持一键抓取并生成标准格式的报备文档。

## 🌟 特性

- **多源数据抓取**：支持从 **豆瓣 (Douban)**、**TMDB** 和 **IMDb** 自动获取电影元数据（导演、主演、剧情简介、短评等）。
- **智能防反爬**：后端采用三级回退机制（网页解析 -> Rexxar API -> Abstract API），确保豆瓣数据的高成功率获取。
- **实时预览**：前端支持表单实时编辑与文档排版预览。
- **打印支持**：完美适配 A4 纸张排版，可直接通过浏览器打印为 PDF。
- **双后端支持**：
  - **Python (FastAPI)**：适合本地或服务器部署。
  - **Cloudflare Workers**：支持 Serverless 部署，高性能且零成本。

## 🚀 快速开始

### 前端开发 (Vite)
```bash
yarn install
yarn dev
```

### 后端部署

#### 1. Python 后端 (FastAPI)
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Cloudflare Workers (Serverless)
```bash
cd workers
npx wrangler dev  # 本地调试
npx wrangler deploy  # 部署到生产环境
```

## 🛠️ 技术栈

- **Frontend**: React, TypeScript, Vite, CSS Modules
- **Backend (Python)**: FastAPI, BeautifulSoup4, Requests
- **Backend (Serverless)**: Cloudflare Workers (JavaScript)
- **Data Sources**: Douban, TMDB API, OMDb API

## 📝 TODO
- [x] 前端报备表组件与表单控件
- [x] 豆瓣/TMDB/IMDb 抓取逻辑
- [x] 智能防反爬回退机制
- [x] Cloudflare Workers 适配
- [ ] 导出为 Word (.docx) 格式支持
- [ ] 更多主题模板选择
