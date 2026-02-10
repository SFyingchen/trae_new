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
