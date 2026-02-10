const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const WORKSPACE_ROOT = path.resolve(process.env.WORKSPACE_ROOT || process.cwd());
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

function safePath(requestPath = '') {
  const normalized = path.normalize(requestPath).replace(/^([/\\])+/, '');
  const resolved = path.resolve(WORKSPACE_ROOT, normalized);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('Path traversal is not allowed');
  }
  return resolved;
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
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('Not found');
  });
  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
  stream.pipe(res);
}

async function listTree(dir, relBase = '') {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const filtered = entries
    .filter((e) => !['node_modules', '.git'].includes(e.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name, 'zh-Hans-CN'));

  const out = [];
  for (const entry of filtered) {
    const relPath = path.posix.join(relBase, entry.name);
    if (entry.isDirectory()) {
      out.push({ type: 'dir', name: entry.name, path: relPath, children: await listTree(path.join(dir, entry.name), relPath) });
    } else {
      out.push({ type: 'file', name: entry.name, path: relPath });
    }
  }
  return out;
}

async function proxyOllamaChat(payload) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, stream: false })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error ${response.status}: ${text}`);
  }

  return response.json();
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/tree') {
      const tree = await listTree(WORKSPACE_ROOT);
      return sendJson(res, 200, { root: WORKSPACE_ROOT, tree });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/file?')) {
      const fileRel = new URL(req.url, `http://${req.headers.host}`).searchParams.get('path') || '';
      const full = safePath(fileRel);
      const content = await fsp.readFile(full, 'utf8');
      return sendJson(res, 200, { path: fileRel, content });
    }

    if (req.method === 'POST' && req.url === '/api/file') {
      const data = await readJson(req);
      const full = safePath(data.path || '');
      await fsp.mkdir(path.dirname(full), { recursive: true });
      await fsp.writeFile(full, data.content ?? '', 'utf8');
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && req.url === '/api/models') {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        const text = await response.text();
        return sendJson(res, 502, { error: text || 'Unable to fetch models from Ollama' });
      }
      const data = await response.json();
      const models = (data.models || []).map((m) => m.name);
      return sendJson(res, 200, { models });
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
      const data = await readJson(req);
      if (!data.model) return sendJson(res, 400, { error: 'model is required' });
      if (!Array.isArray(data.messages)) return sendJson(res, 400, { error: 'messages array is required' });
      const chatResult = await proxyOllamaChat({ model: data.model, messages: data.messages });
      return sendJson(res, 200, chatResult);
    }

    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return sendFile(res, path.join(__dirname, 'web/index.html'));
    }

    if (req.method === 'GET' && req.url.startsWith('/web/')) {
      return sendFile(res, path.join(__dirname, req.url));
    }

    res.writeHead(404);
    res.end('Not Found');
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Trae local AI editor running on http://localhost:${PORT}`);
  console.log(`Workspace root: ${WORKSPACE_ROOT}`);
  console.log(`Ollama URL: ${OLLAMA_BASE_URL}`);
});
