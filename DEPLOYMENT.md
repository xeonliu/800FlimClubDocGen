# 部署指南

本项目包含前端（React + Vite）和后端（FastAPI）两部分，支持多种部署方式。

## 快速开始

### 1. 本地开发环境

#### 方式 A：Docker Compose（推荐）

```bash
# 复制环境配置
cp .env.example .env

# 编辑 .env，添加 TMDB_API_KEY
nano .env

# 启动服务
docker-compose up --build

# 访问
- 前端：http://localhost:5173
- 后端 API：http://localhost:8000
```

#### 方式 B：本地运行

**后端：**
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # 配置环境变量
uvicorn main:app --reload --port 8000
```

**前端：**
```bash
npm install
npm run dev
```

### 2. 生产部署

#### 方式 A：Docker（推荐）

构建镜像：
```bash
docker build -t 800-doc-gen:latest .
```

运行容器：
```bash
docker run -d \
  --name 800-doc-gen \
  -p 8000:8000 \
  -e TMDB_API_KEY=your_api_key \
  -e TMDB_LANGUAGE=zh-CN \
  800-doc-gen:latest
```

#### 方式 B：Docker Compose（生产配置）

创建 `docker-compose.prod.yml`：
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - TMDB_API_KEY=${TMDB_API_KEY}
      - TMDB_LANGUAGE=zh-CN
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
```

启动生产环境：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 方式 C：使用反向代理（Nginx）

创建 `nginx.conf`：
```nginx
upstream api {
    server localhost:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 环境变量

| 变量 | 说明 | 例子 |
|------|------|------|
| TMDB_API_KEY | TMDB API 密钥 | `abc123...` |
| TMDB_LANGUAGE | TMDB 返回语言 | `zh-CN` |

在 `.env` 文件中配置，或在容器启动时传入 `-e` 参数。

## 项目结构

```
.
├── Dockerfile              # 多阶段构建：前端 + 后端
├── Dockerfile.frontend.dev # 前端开发环境
├── docker-compose.yml      # 开发环境编排
├── .dockerignore           # Docker 忽略文件
├── backend/
│   ├── main.py            # FastAPI 应用入口
│   └── requirements.txt    # Python 依赖
├── src/                    # 前端源代码
├── package.json           # Node.js 依赖
└── vite.config.ts         # Vite 配置
```

## 常见问题

### Q: 如何更新 API Key？
A: 修改 `.env` 文件中的 `TMDB_API_KEY`，然后重启容器：
```bash
docker-compose down
docker-compose up -d
```

### Q: 前端和后端 API 通信失败？
A: 检查 CORS 配置。开发环境时，后端已允许所有源 (`allow_origins=["*"]`)。生产环境需要在 `backend/main.py` 中配置实际的前端域名。

### Q: 如何查看日志？
```bash
docker-compose logs -f backend
```

### Q: 容器启动失败？
```bash
# 查看详细错误信息
docker logs 800-doc-gen

# 重建镜像
docker-compose build --no-cache
```

## 性能优化建议

1. **使用 CDN** 提供前端静态资源
2. **启用 gzip 压缩** 在 Nginx 中
3. **添加数据库缓存** 减少 TMDB 请求
4. **设置速率限制** 保护 API 端点
5. **监控容器资源** 使用 `docker stats`

## 安全建议

1. ⚠️  **生产环境** 修改 CORS 配置，将 `allow_origins=["*"]` 改为实际域名
2. 使用环境变量存储敏感信息（不要提交 .env 到版本控制）
3. 定期更新依赖包
4. 配置防火墙限制访问
5. 使用 HTTPS 和 SSL 证书

