# Trae Local AI Editor

一个简化版的 AI 编辑器（灵感来自 Codex / Trae），支持：

- 本地文件浏览与编辑
- 直接调用本地 Ollama 模型进行代码改写建议
- 无需登录/注册

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

## 交互流程

1. 左侧选择文件，或在中间输入新文件路径。
2. 在编辑器中修改内容。
3. 右侧输入自然语言需求，点击「让 AI 生成修改建议」。
4. 查看结果后点击「应用到编辑器」。
5. 点击「保存文件」。

## 注意

- 出于安全考虑，后端会限制只读写 `WORKSPACE_ROOT` 内文件。
- 若模型列表为空，请先执行 `ollama pull <model>`。
