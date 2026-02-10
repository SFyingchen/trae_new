# Trae Local AI Editor

一个本地优先的 AI 编辑器（灵感来自 Codex / Trae），支持本地 Ollama，无需登录。

## 已实现的 Trae 风格能力

- 项目文件树、标签页、多文件编辑
- 全局搜索 / 新建 / 重命名 / 删除
- AI 对话改写（支持一键应用 `updated_code`）
- AI 上下文增强（可附带文件树摘要/搜索结果）
- 工作区终端（在项目内执行命令）
- 命令面板（`Ctrl/Cmd + K`）
- 会话导出/导入（消息、标签页、设置）
- 每次保存自动快照 + 历史版本回滚
- 无账号体系（纯本地）

## 快速开始

```bash
# 1) 启动 ollama
ollama serve

# 2) 拉模型
ollama pull qwen2.5-coder:7b

# 3) 启动项目
npm start
```

访问：`http://localhost:3000`

## 环境变量

- `PORT`：服务端口（默认 `3000`）
- `WORKSPACE_ROOT`：可编辑目录（默认当前目录）
- `OLLAMA_BASE_URL`：Ollama 地址（默认 `http://127.0.0.1:11434`）

## 核心 API

- `GET /api/tree`
- `GET /api/file?path=...`
- `POST /api/file`（自动写历史快照）
- `POST /api/file/rename`
- `POST /api/file/delete`
- `GET /api/search?q=...`
- `GET /api/history?path=...`
- `POST /api/history/restore`
- `POST /api/terminal`
- `GET /api/models`
- `POST /api/chat`

## 安全说明

- 文件访问限制在 `WORKSPACE_ROOT`。
- 静态资源限制在 `web/`。
- 路径穿越有防护。

> 说明：本项目是“Trae 风格的本地实现”，不是官方 Trae 客户端。
