# Trae Local AI Editor

一个**可安装的桌面 AI 编辑器开发工具**（Electron 版，灵感来自 Trae / Cline），支持本地 Ollama，无需登录。

## 你要的“像 VSCode 一样可安装”能力

本项目现在提供两种运行方式：

1. Web 调试模式（浏览器访问）
2. **桌面安装包模式（Electron，可打包安装）**

---

## 1) 本地开发运行（Web）

```bash
npm start
```

访问：`http://localhost:3000`

---

## 2) 桌面模式运行（像 IDE 客户端）

先安装依赖：

```bash
npm install
```

启动桌面客户端：

```bash
npm run desktop
```

这会启动 Electron 主进程，并自动拉起内置后端服务，再以桌面窗口加载编辑器。

---

## 3) 构建安装包（Windows/macOS/Linux）

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

输出目录：`dist/`

> 说明：跨平台构建通常建议在对应系统上执行（例如在 Windows 构建 `nsis`）。

---

## Ollama 准备

```bash
ollama serve
ollama pull qwen2.5-coder:7b
```

---

## 环境变量

- `PORT`：服务端口，默认 `3000`（桌面模式默认走 `3344`）
- `WORKSPACE_ROOT`：工作区目录，默认当前目录
- `OLLAMA_BASE_URL`：Ollama 地址，默认 `http://127.0.0.1:11434`
- `OPENAI_BASE_URL`：可选，OpenAI-Compatible 默认地址（也可在界面输入）
- `ALLOW_DANGEROUS_COMMANDS`：是否允许高危终端命令，默认 `false`

---

## 已有功能

- 项目文件树、标签页、多文件编辑
- 全局搜索 / 新建 / 重命名 / 删除
- AI 对话改写（支持一键应用 `updated_code`）
- AI 任务计划（`/api/plan`）
- 多文件建议解析并批量应用（`/api/file/batch-save`）
- Git 状态与 diff 面板
- 历史快照 + 回滚
- 命令面板、终端、会话导入导出

---

## 说明

这是 Trae/Cline 风格的本地实现，不是官方 Trae 客户端。


## VSCode 风格编辑增强（本次新增）

- 代码行号栏（随滚动同步）
- 状态栏（行列号 / 编码 / 缩进 / 语言 / 保存状态）
- 查找替换面板（Ctrl+F / Ctrl+H）
- 快捷键保存（Ctrl+S）
- 文件脏状态（Unsaved/Saved）


## AI Agent 助手（新增）

- 在右侧新增 Agent 面板，可按目标生成下一步动作（edit / terminal / ask_user）。
- 支持选择性应用 Agent 动作（含多文件编辑与终端命令确认）。
- 说明：当前是本地单 Agent 版本，非完整 VSCode 全量插件生态。


## 新增能力（继续向 VSCode + Agent 靠拢）

- 多终端会话（可新建终端标签）
- AI 实时补全预测（Ctrl/Cmd+Space 触发，Tab 接受）
- 终端报错 AI 诊断（基于最新错误输出）
- Agent 动作流（edit / terminal / ask_user）并可选择性执行
- Problems 面板（API/终端/Git 错误聚合）
- 工作台布局持久化（分栏宽度、可折叠面板状态）

> 注意：要做到“和 VSCode 一模一样”还需要完整插件市场、调试器协议、语言服务器生态等大量能力。本项目当前是本地可安装 IDE + AI Agent 的增强实现。


## Agent Core 继续增强

- 新增自动执行模式：Agent 可按目标自动运行 N 步（可配置最大步数）。
- 可选权限开关：允许写文件 / 允许终端命令（默认更保守）。
- 每步都有执行追踪（summary + actionResults），便于复盘与审计。
- 新增 Agent 会话模式：支持启动/继续/停止会话，状态可追踪。
- 支持“动作审批”流程：当存在 edit/terminal 动作时，先人工批准再执行。
- 支持会话列表与载入，便于像 Cline 一样持续推进长任务。
- 新增会话自动推进（直到完成或进入审批等待），减少手工逐步点击。


## 模型提供商支持（新增）

- 支持本地 Ollama（默认）
- 支持 OpenAI-Compatible 提供商（可配置 Base URL + API Key）
- Provider 配置会保存在本地，可在界面中切换并刷新模型列表


## AI Core 模块化（本次重构）

- 将 Provider 能力拆分到 `src/core/provider/client.js`。
- 将 Agent 核心拆分为：
  - `src/core/agent/engine.js`（步骤推理、会话推进）
  - `src/core/agent/schema.js`（模型输出规范化/动作清洗）
  - `src/core/agent/executor.js`（动作执行器）
- `server.js` 负责路由编排，核心逻辑在 `src/core` 下维护，便于后续继续对齐 Cline 的 core 设计。



## Trae Cue（快捷意图）

- 新增 Cue 面板：一键触发“解释/修复/优化/测试/重构”等意图。
- 支持自定义 Cue 文本并直接调用当前 AI 对话链路。
- 支持 AI 自动生成 Cue 建议（`/api/cue/suggest`）。


## 布局体验增强（Trae 风格）

- 右侧工作区新增标签切换（Cue / Agent / Chat / Problems / Git）。
- 支持记忆右侧标签页选择，重启后恢复。

## Context 与 @Mentions（新增）

- 支持在对话框里使用 `@selection` `@file:path` `@folder:path` `@tree` `@search` `@problems` `@terminal`。
- 发送请求前会自动解析 mentions 并注入上下文，接近 Cline 的 at-mentions 工作流。
- 新增 Trae 风格 Context 快捷按钮，减少手动输入。
