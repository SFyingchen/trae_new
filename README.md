# Trae Local AI Editor

一个简化版的 AI 编辑器（灵感来自 Codex / Trae），支持：

- 本地文件浏览与编辑
- 直接调用本地 Ollama 模型进行代码改写建议
- 无需登录/注册
- 文件搜索、重命名、删除、新建
- 自动历史快照与回滚

## 快速开始

```bash
# 1) 确保你已安装并启动 ollama
ollama serve

# 2) 拉取一个模型（示例）
ollama pull qwen2.5-coder:7b

# 3) 启动本项目
npm start
```

默认访问：`http://localhost:3000`

## 环境变量

- `PORT`：服务端口（默认 `3000`）
- `WORKSPACE_ROOT`：可编辑的工作区目录（默认当前目录）
- `OLLAMA_BASE_URL`：Ollama 地址（默认 `http://127.0.0.1:11434`）

## 功能说明

1. 左侧：项目文件树（可折叠目录）
2. 中间：编辑器 + 文件标签页 + 搜索结果
3. 右侧：AI 对话区（生成可替换完整代码）
4. 顶部：模型选择、全局搜索、新建/重命名/删除/保存
5. 历史版本：每次保存会自动写入 `.trae-history`，可按文件回滚

## 主要 API

- `GET /api/tree` 文件树
- `GET /api/file?path=...` 读取文件
- `POST /api/file` 保存文件（自动快照）
- `POST /api/file/rename` 重命名
- `POST /api/file/delete` 删除
- `GET /api/search?q=...` 全局内容搜索
- `GET /api/history?path=...` 历史快照列表
- `POST /api/history/restore` 回滚快照
- `GET /api/models` 本地模型列表
- `POST /api/chat` 调用 Ollama 对话

## 注意

- 出于安全考虑，后端限制只读写 `WORKSPACE_ROOT` 内文件。
- 静态资源与工作区路径都做了路径穿越防护。
- 若模型列表为空，请先执行 `ollama pull <model>`。
