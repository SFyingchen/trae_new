# Trae Local AI Editor

一个本地优先的 AI 编辑器（灵感来自 Trae / Cline），支持本地 Ollama，无需登录。

## 本次增强（对齐 Trae/Cline 工作流）

- Agent 任务规划面板（目标 -> 可勾选计划）
- 按计划执行：将未完成步骤注入 AI 提示词
- 补丁预览（当前代码 vs AI 建议）
- Git 状态与差异面板
- 终端执行增加二次确认（更接近 Cline 的安全操作习惯）
- 命令面板（Ctrl/Cmd + K）扩展支持任务/Git 操作
- 会话导出/导入（目标、计划、消息、设置）

## 已有核心能力

- 项目文件树、标签页、多文件编辑
- 全局搜索 / 新建 / 重命名 / 删除
- AI 对话改写（支持一键应用 `updated_code`）
- AI 上下文增强（文件树摘要/搜索结果/任务计划）
- 工作区终端
- 历史快照 + 回滚

## 快速开始

```bash
ollama serve
ollama pull qwen2.5-coder:7b
npm start
```

访问：`http://localhost:3000`

## API

- `GET /api/tree`
- `GET /api/file?path=...`
- `POST /api/file`
- `POST /api/file/rename`
- `POST /api/file/delete`
- `GET /api/search?q=...`
- `GET /api/history?path=...`
- `POST /api/history/restore`
- `POST /api/terminal`
- `GET /api/git/status`
- `GET /api/git/diff`
- `GET /api/models`
- `POST /api/chat`

## 安全说明

- 文件访问限制在 `WORKSPACE_ROOT`。
- 静态资源限制在 `web/`。
- 路径穿越有防护。
- 终端命令默认要求用户确认。

> 说明：这是 Trae/Cline 风格的本地实现，不是官方客户端。
