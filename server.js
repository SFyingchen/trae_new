const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const PORT = process.env.PORT || 3000;
const WORKSPACE_ROOT = path.resolve(process.env.WORKSPACE_ROOT || process.cwd());
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const WEB_ROOT = path.join(__dirname, 'web');
const HISTORY_ROOT = path.join(WORKSPACE_ROOT, '.trae-history');
const ALLOW_DANGEROUS_COMMANDS = process.env.ALLOW_DANGEROUS_COMMANDS === 'true';
const agentSessions = new Map();

function safeWorkspacePath(requestPath = '') {
  const normalized = path.normalize(requestPath).replace(/^([/\\])+/, '');
  const resolved = path.resolve(WORKSPACE_ROOT, normalized);
  if (!resolved.startsWith(WORKSPACE_ROOT)) throw new Error('Path traversal is not allowed');
  return resolved;
}

function safeWebPath(requestPath = '') {
  const normalized = path.normalize(requestPath).replace(/^([/\\])+/, '');
  const resolved = path.resolve(WEB_ROOT, normalized);
  if (!resolved.startsWith(WEB_ROOT)) throw new Error('Static path traversal is not allowed');
  return resolved;
}

function encodeHistoryPath(fileRel) {
  return fileRel.replaceAll('/', '__');
}

function isDangerousCommand(command = '') {
  const dangerousPatterns = [
    /\brm\s+-rf\s+\//i,
    /\bsudo\b/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /:\(\)\s*\{\s*:\|:\s*&\s*\};:/
  ];
  return dangerousPatterns.some((p) => p.test(command));
}

async function ensureHistoryRoot() {
  await fsp.mkdir(HISTORY_ROOT, { recursive: true });
}

async function writeHistorySnapshot(fileRel, content) {
  await ensureHistoryRoot();
  const safeName = encodeHistoryPath(fileRel || 'untitled.txt');
  const now = new Date().toISOString().replaceAll(':', '-');
  await fsp.writeFile(path.join(HISTORY_ROOT, `${safeName}__${now}.txt`), content ?? '', 'utf8');
}

async function listHistorySnapshots(fileRel) {
  await ensureHistoryRoot();
  const safeName = encodeHistoryPath(fileRel);
  const entries = await fsp.readdir(HISTORY_ROOT, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.startsWith(`${safeName}__`) && e.name.endsWith('.txt')).map((e) => e.name).sort().reverse();
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf8');
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  const stream = fs.createReadStream(filePath);
  stream.on('open', () => res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' }));
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
  stream.pipe(res);
}

async function listTree(dir, relBase = '') {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const filtered = entries.filter((e) => !['node_modules', '.git', '.trae-history'].includes(e.name)).sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name, 'zh-Hans-CN'));
  const out = [];
  for (const entry of filtered) {
    const relPath = path.posix.join(relBase, entry.name);
    if (entry.isDirectory()) out.push({ type: 'dir', name: entry.name, path: relPath, children: await listTree(path.join(dir, entry.name), relPath) });
    else out.push({ type: 'file', name: entry.name, path: relPath });
  }
  return out;
}

async function searchFiles(dir, keyword, relBase = '', maxResults = 120) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (['node_modules', '.git', '.trae-history'].includes(entry.name)) continue;
    const relPath = path.posix.join(relBase, entry.name);
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await searchFiles(fullPath, keyword, relPath, maxResults - result.length));
    else if (entry.isFile()) {
      if (result.length >= maxResults) break;
      try {
        const content = await fsp.readFile(fullPath, 'utf8');
        const index = content.toLowerCase().indexOf(keyword.toLowerCase());
        if (index >= 0) {
          const start = Math.max(0, index - 45);
          const end = Math.min(content.length, index + 100);
          result.push({ path: relPath, snippet: content.slice(start, end).replaceAll('\n', ' ') });
        }
      } catch {
        // ignore unreadable
      }
    }
    if (result.length >= maxResults) break;
  }
  return result;
}

async function runTerminalCommand(command, cwdRel = '') {
  if (!ALLOW_DANGEROUS_COMMANDS && isDangerousCommand(command)) {
    throw new Error('Blocked potentially dangerous command. Set ALLOW_DANGEROUS_COMMANDS=true to override.');
  }

  const cwd = safeWorkspacePath(cwdRel || '.');
  const { stdout, stderr } = await execAsync(command, {
    cwd,
    timeout: 12_000,
    maxBuffer: 1024 * 1024,
    shell: '/bin/bash'
  });
  const combined = `${stdout || ''}${stderr ? `\n${stderr}` : ''}`;
  return combined.slice(0, 20000);
}

async function runGit(command) {
  const { stdout, stderr } = await execAsync(command, {
    cwd: WORKSPACE_ROOT,
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
    shell: '/bin/bash'
  });
  return `${stdout || ''}${stderr ? `\n${stderr}` : ''}`.trim();
}

async function saveFileWithSnapshot(relPath, content) {
  const full = safeWorkspacePath(relPath || '');
  let previousContent = '';
  try { previousContent = await fsp.readFile(full, 'utf8'); } catch {}
  await writeHistorySnapshot(relPath, previousContent);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content ?? '', 'utf8');
}



function normalizeProvider(provider = 'ollama') {
  const p = String(provider || 'ollama').toLowerCase();
  if (['ollama', 'openai', 'openai-compatible', 'openai_compatible'].includes(p)) return p === 'openai' ? 'openai-compatible' : p;
  return 'ollama';
}

async function chatWithProvider({ provider = 'ollama', model, messages, options = {}, providerConfig = {} }) {
  const normalized = normalizeProvider(provider);

  if (normalized === 'ollama') {
    const baseUrl = providerConfig.baseUrl || OLLAMA_BASE_URL;
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, options, stream: false })
    });
    if (!response.ok) throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
    return { message: (await response.json()).message };
  }

  const baseUrl = (providerConfig.baseUrl || 'https://api.openai.com').replace(/\/$/, '');
  const apiKey = providerConfig.apiKey || '';
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({ model, messages, temperature: options.temperature ?? 0.2 })
  });
  if (!response.ok) throw new Error(`Provider error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return { message: { role: 'assistant', content: data?.choices?.[0]?.message?.content || '' } };
}

async function listModelsByProvider({ provider = 'ollama', providerConfig = {} }) {
  const normalized = normalizeProvider(provider);
  if (normalized === 'ollama') {
    const baseUrl = providerConfig.baseUrl || OLLAMA_BASE_URL;
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) throw new Error(await response.text() || 'Unable to fetch models from Ollama');
    const data = await response.json();
    return (data.models || []).map((m) => m.name);
  }
  const baseUrl = (providerConfig.baseUrl || 'https://api.openai.com').replace(/\/$/, '');
  const apiKey = providerConfig.apiKey || '';
  const response = await fetch(`${baseUrl}/v1/models`, {
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    }
  });
  if (!response.ok) throw new Error(await response.text() || 'Unable to fetch models from provider');
  const data = await response.json();
  return (data.data || []).map((m) => m.id);
}

async function runSingleAgentStep({ model, goal, context = '', options = {}, provider = 'ollama', providerConfig = {} }) {
  const response = await chatWithProvider({
    model,
    options,
    provider,
    providerConfig,
    messages: [
      {
        role: 'system',
        content: [
          '你是 IDE 内的 AI Agent。',
          '请严格返回 JSON 对象，格式：',
          '{"summary":"...","next_actions":[{"type":"edit|terminal|ask_user","path":"...","content":"...","command":"...","reason":"..."}],"done":false}',
          '规则：',
          '1) 如果要修改代码，优先输出 edit 动作，content 是完整文件内容。',
          '2) terminal 动作只用于必要命令。',
          '3) 不要输出 markdown。只输出 JSON。'
        ].join('\n')
      },
      {
        role: 'user',
        content: `目标:
${goal}\n\n当前上下文:
${String(context).slice(0, 6000)}`
      }
    ]
  });

  const raw = response?.message?.content || '{}';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      summary: raw.slice(0, 500),
      next_actions: [{ type: 'ask_user', reason: '模型未返回合法 JSON，请人工确认下一步。' }],
      done: false
    };
  }
  if (!Array.isArray(parsed.next_actions)) parsed.next_actions = [];
  return { parsed, raw };
}

async function executeAgentActions(actions, opts = {}) {
  const { allowWrite = false, allowTerminal = false } = opts;
  const results = [];
  for (const action of actions) {
    if (action.type === 'edit') {
      if (allowWrite && action.path && typeof action.content === 'string') {
        await saveFileWithSnapshot(action.path, action.content);
        results.push({ type: 'edit', path: action.path, status: 'applied' });
      } else {
        results.push({ type: 'edit', path: action.path || '', status: 'skipped' });
      }
    } else if (action.type === 'terminal') {
      if (allowTerminal && action.command) {
        try {
          const output = await runTerminalCommand(action.command, action.cwd || '.');
          results.push({ type: 'terminal', command: action.command, status: 'ran', output: String(output).slice(0, 1200) });
        } catch (e) {
          results.push({ type: 'terminal', command: action.command, status: 'error', error: e.message });
        }
      } else {
        results.push({ type: 'terminal', command: action.command || '', status: 'skipped' });
      }
    } else {
      results.push({ type: action.type || 'ask_user', reason: action.reason || '', status: 'pending_user' });
    }
  }
  return results;
}

async function proxyOllamaChat(payload) {
  return chatWithProvider({ provider: 'ollama', ...payload });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/health') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET' && req.url === '/api/tree') return sendJson(res, 200, { root: WORKSPACE_ROOT, tree: await listTree(WORKSPACE_ROOT) });

    if (req.method === 'GET' && req.url.startsWith('/api/file?')) {
      const fileRel = new URL(req.url, `http://${req.headers.host}`).searchParams.get('path') || '';
      return sendJson(res, 200, { path: fileRel, content: await fsp.readFile(safeWorkspacePath(fileRel), 'utf8') });
    }

    if (req.method === 'POST' && req.url === '/api/file') {
      const data = await readJson(req);
      await saveFileWithSnapshot(data.path || '', data.content ?? '');
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && req.url === '/api/file/batch-save') {
      const data = await readJson(req);
      const changes = Array.isArray(data.changes) ? data.changes : [];
      if (!changes.length) return sendJson(res, 400, { error: 'changes is required' });
      for (const change of changes) {
        if (!change.path) continue;
        await saveFileWithSnapshot(change.path, change.content ?? '');
      }
      return sendJson(res, 200, { ok: true, count: changes.length });
    }

    if (req.method === 'POST' && req.url === '/api/file/rename') {
      const data = await readJson(req);
      await fsp.mkdir(path.dirname(safeWorkspacePath(data.newPath || '')), { recursive: true });
      await fsp.rename(safeWorkspacePath(data.oldPath || ''), safeWorkspacePath(data.newPath || ''));
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && req.url === '/api/file/delete') {
      const data = await readJson(req);
      await fsp.rm(safeWorkspacePath(data.path || ''), { recursive: true, force: true });
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/history?')) {
      const relPath = new URL(req.url, `http://${req.headers.host}`).searchParams.get('path') || '';
      return sendJson(res, 200, { snapshots: await listHistorySnapshots(relPath) });
    }

    if (req.method === 'POST' && req.url === '/api/history/restore') {
      const data = await readJson(req);
      const snapshotPath = path.resolve(HISTORY_ROOT, data.snapshot || '');
      if (!snapshotPath.startsWith(HISTORY_ROOT)) return sendJson(res, 400, { error: 'invalid snapshot' });
      await fsp.writeFile(safeWorkspacePath(data.path || ''), await fsp.readFile(snapshotPath, 'utf8'), 'utf8');
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/search?')) {
      const keyword = new URL(req.url, `http://${req.headers.host}`).searchParams.get('q') || '';
      return sendJson(res, 200, { results: keyword.trim() ? await searchFiles(WORKSPACE_ROOT, keyword.trim()) : [] });
    }

    if (req.method === 'POST' && req.url === '/api/terminal') {
      const data = await readJson(req);
      if (!data.command || typeof data.command !== 'string') return sendJson(res, 400, { error: 'command is required' });
      return sendJson(res, 200, { output: await runTerminalCommand(data.command, data.cwd || '.') });
    }

    if (req.method === 'GET' && req.url === '/api/git/status') return sendJson(res, 200, { output: await runGit('git status --short && git branch --show-current') });
    if (req.method === 'GET' && req.url === '/api/git/diff') return sendJson(res, 200, { output: await runGit('git diff -- . ":(exclude).trae-history"') });

    if (req.method === 'POST' && req.url === '/api/plan') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      const goal = String(data.goal || '').trim();
      if (!goal) return sendJson(res, 400, { error: 'goal is required' });
      const response = await chatWithProvider({
        model: data.model,
        provider: data.provider || 'ollama',
        providerConfig: data.providerConfig || {},
        options: data.options || {},
        messages: [
          { role: 'system', content: '你是任务规划助手。只返回 JSON 数组，每个元素是简短步骤字符串。不要输出其他内容。' },
          { role: 'user', content: goal }
        ]
      });
      const text = response?.message?.content || '[]';
      let steps = [];
      try {
        steps = JSON.parse(text);
      } catch {
        steps = goal.split(/[，。,.;；\n]+/).map((s) => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(steps)) steps = [];
      return sendJson(res, 200, { steps: steps.map(String).filter(Boolean).slice(0, 20) });
    }


    if (req.method === 'POST' && req.url === '/api/agent/step') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      const goal = String(data.goal || '').trim();
      if (!goal) return sendJson(res, 400, { error: 'goal is required' });
      const { parsed, raw } = await runSingleAgentStep({
        model: data.model,
        goal,
        context: data.context || '',
        options: data.options || {},
        provider: data.provider || 'ollama',
        providerConfig: data.providerConfig || {}
      });
      return sendJson(res, 200, { agent: parsed, raw });
    }

    if (req.method === 'POST' && req.url === '/api/agent/run') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      const goal = String(data.goal || '').trim();
      if (!goal) return sendJson(res, 400, { error: 'goal is required' });
      const maxSteps = Math.min(10, Math.max(1, Number(data.maxSteps || 3)));
      const allowWrite = Boolean(data.allowWrite);
      const allowTerminal = Boolean(data.allowTerminal);
      const runId = `run_${Date.now()}`;
      const trace = [];
      let context = String(data.context || '');
      let done = false;

      for (let step = 1; step <= maxSteps; step += 1) {
        const { parsed, raw } = await runSingleAgentStep({ model: data.model, goal, context, options: data.options || {}, provider: data.provider || 'ollama', providerConfig: data.providerConfig || {} });
        const actionResults = await executeAgentActions(parsed.next_actions || [], { allowWrite, allowTerminal });
        trace.push({ step, summary: parsed.summary || '', actions: parsed.next_actions || [], actionResults, raw: String(raw).slice(0, 1200) });
        context = `${context}

[step ${step}] ${parsed.summary || ''}
${JSON.stringify(actionResults).slice(0, 2000)}`;
        if (parsed.done) { done = true; break; }
      }

      const session = { runId, goal, createdAt: new Date().toISOString(), done, allowWrite, allowTerminal, trace };
      agentSessions.set(runId, session);
      return sendJson(res, 200, session);
    }

    if (req.method === 'GET' && req.url === '/api/agent/runs') {
      const runs = [...agentSessions.values()].slice(-20).reverse();
      return sendJson(res, 200, { runs });
    }


    if (req.method === 'POST' && req.url === '/api/complete') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      const code = String(data.code || '').slice(0, 8000);
      const cursorContext = String(data.cursorContext || '').slice(0, 1500);
      const response = await chatWithProvider({
        model: data.model,
        provider: data.provider || 'ollama',
        providerConfig: data.providerConfig || {},
        options: data.options || {},
        messages: [
          {
            role: 'system',
            content: '你是代码补全引擎。只返回要补全的后续代码，不要解释，不要markdown，不要代码块标记。'
          },
          {
            role: 'user',
            content: `以下是当前文件代码（可能不完整）:
${code}

光标附近上下文:
${cursorContext}

请给出下一段最可能补全（尽量简短）。`
          }
        ]
      });
      const suggestion = (response?.message?.content || '').trim();
      return sendJson(res, 200, { suggestion });
    }

    if (req.method === 'POST' && req.url === '/api/diagnose-error') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      const stderr = String(data.stderr || '').slice(0, 12000);
      const command = String(data.command || '');
      const response = await chatWithProvider({
        model: data.model,
        provider: data.provider || 'ollama',
        providerConfig: data.providerConfig || {},
        options: data.options || {},
        messages: [
          {
            role: 'system',
            content: '你是命令行报错诊断助手。输出中文，包含：1) 根因分析 2) 修复步骤 3) 可直接执行的命令（如有）。'
          },
          {
            role: 'user',
            content: `命令: ${command}

报错输出:
${stderr}`
          }
        ]
      });
      return sendJson(res, 200, { diagnosis: response?.message?.content || '无诊断结果' });
    }

    if (req.method === 'GET' && req.url === '/api/providers') {
      return sendJson(res, 200, {
        providers: [
          { id: 'ollama', name: 'Ollama (local)', needsApiKey: false, defaultBaseUrl: OLLAMA_BASE_URL },
          { id: 'openai-compatible', name: 'OpenAI Compatible', needsApiKey: true, defaultBaseUrl: 'https://api.openai.com' }
        ]
      });
    }

    if (req.method === 'GET' && req.url === '/api/models') {
      const models = await listModelsByProvider({ provider: 'ollama', providerConfig: {} });
      return sendJson(res, 200, { models });
    }

    if (req.method === 'POST' && req.url === '/api/models') {
      const data = await readJson(req);
      const models = await listModelsByProvider({ provider: data.provider || 'ollama', providerConfig: data.providerConfig || {} });
      return sendJson(res, 200, { models });
    }


    if (req.method === 'POST' && req.url === '/api/chat') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      if (!Array.isArray(data.messages)) return sendJson(res, 400, { error: 'messages array is required' });
      return sendJson(res, 200, await chatWithProvider({ provider: data.provider || 'ollama', providerConfig: data.providerConfig || {}, model: data.model, messages: data.messages, options: data.options || {} }));
    }

    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) return sendFile(res, path.join(WEB_ROOT, 'index.html'));
    if (req.method === 'GET' && req.url.startsWith('/web/')) return sendFile(res, safeWebPath(req.url.slice('/web/'.length)));

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Trae local AI editor running on http://localhost:${PORT}`);
  console.log(`Workspace root: ${WORKSPACE_ROOT}`);
  console.log(`Ollama URL: ${OLLAMA_BASE_URL}`);
  console.log(`Dangerous terminal commands allowed: ${ALLOW_DANGEROUS_COMMANDS}`);
});
