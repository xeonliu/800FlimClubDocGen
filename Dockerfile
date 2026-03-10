# 多阶段构建：先构建前端，再运行后端

# 阶段1：构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端项目文件
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./
COPY index.html ./
COPY src ./src
COPY public ./public

# 安装依赖并构建
RUN npm ci && npm run build

# 阶段2：运行后端和提供前端静态文件
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制 Python 依赖文件
COPY backend/requirements.txt ./requirements.txt

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/frontend/dist ./static

# 暴露端口
EXPOSE 8000

# 启动后端应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
