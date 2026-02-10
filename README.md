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

> 注意：要做到“和 VSCode 一模一样”还需要完整插件市场、调试器协议、语言服务器生态等大量能力。本项目当前是本地可安装 IDE + AI Agent 的增强实现。


## Agent Core 继续增强

- 新增自动执行模式：Agent 可按目标自动运行 N 步（可配置最大步数）。
- 可选权限开关：允许写文件 / 允许终端命令（默认更保守）。
- 每步都有执行追踪（summary + actionResults），便于复盘与审计。


## 模型提供商支持（新增）

- 支持本地 Ollama（默认）
- 支持 OpenAI-Compatible 提供商（可配置 Base URL + API Key）
- Provider 配置会保存在本地，可在界面中切换并刷新模型列表
