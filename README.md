# Trae Local AI Editor

一个本地优先的 AI 编辑器（灵感来自 Trae / Cline），支持本地 Ollama，无需登录。

## 本轮继续迭代

- ✅ AI 任务计划升级：新增 `POST /api/plan`，可由模型生成结构化步骤。
- ✅ 多文件改动工作流：支持从 AI 回复解析 ` ```file:path``` ` 代码块，并批量应用到工作区。
- ✅ 批量保存接口：新增 `POST /api/file/batch-save`，每个文件仍会自动快照。
- ✅ 终端安全增强：默认拦截高危命令（`rm -rf /`、`sudo`、`mkfs` 等），可用 `ALLOW_DANGEROUS_COMMANDS=true` 覆盖。
- ✅ 命令面板补充多文件相关动作（解析/批量应用）。

## 已有核心能力

- 项目文件树、标签页、多文件编辑
- 全局搜索 / 新建 / 重命名 / 删除
- AI 对话改写（支持一键应用 `updated_code`）
- AI 上下文增强（文件树摘要/搜索结果/任务计划）
- 工作区终端（含确认）
- Git 状态与 diff 面板
- 历史快照 + 回滚

## 快速开始

```bash
ollama serve
ollama pull qwen2.5-coder:7b
npm start
```

访问：`http://localhost:3000`

## 环境变量

- `PORT`：服务端口，默认 `3000`
- `WORKSPACE_ROOT`：工作区目录，默认当前目录
- `OLLAMA_BASE_URL`：Ollama 地址，默认 `http://127.0.0.1:11434`
- `ALLOW_DANGEROUS_COMMANDS`：是否允许高危终端命令，默认 `false`

## API

- `GET /api/tree`
- `GET /api/file?path=...`
- `POST /api/file`
- `POST /api/file/batch-save`
- `POST /api/file/rename`
- `POST /api/file/delete`
- `GET /api/search?q=...`
- `GET /api/history?path=...`
- `POST /api/history/restore`
- `POST /api/terminal`
- `GET /api/git/status`
- `GET /api/git/diff`
- `POST /api/plan`
- `GET /api/models`
- `POST /api/chat`

> 说明：这是 Trae/Cline 风格的本地实现，不是官方客户端。
