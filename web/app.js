const el = (id) => document.getElementById(id);
const fileTree = el('fileTree');
const editor = el('editor');
const lineNumbers = el('lineNumbers');
const statusBar = el('statusBar');
const filePathInput = el('filePath');
const saveFileBtn = el('saveFile');
const promptInput = el('prompt');
const askAIBtn = el('askAI');
const applyAIBtn = el('applyAI');
const messagesEl = el('messages');
const modelSelect = el('modelSelect');
const refreshModelsBtn = el('refreshModels');
const searchInput = el('searchInput');
const searchBtn = el('searchBtn');
const searchResults = el('searchResults');
const tabsEl = el('tabs');
const newFileBtn = el('newFile');
const renameFileBtn = el('renameFile');
const deleteFileBtn = el('deleteFile');
const loadHistoryBtn = el('loadHistory');
const openPaletteBtn = el('openPalette');
const paletteModal = el('paletteModal');
const paletteInput = el('paletteInput');
const paletteList = el('paletteList');
const closePaletteBtn = el('closePalette');
const openSettingsBtn = el('openSettings');
const settingsModal = el('settingsModal');
const closeSettingsBtn = el('closeSettings');
const saveSettingsBtn = el('saveSettings');
const temperatureInput = el('temperature');
const systemPromptInput = el('systemPromptInput');
const toggleTerminalBtn = el('toggleTerminal');
const terminalPanel = el('terminalPanel');
const terminalCwd = el('terminalCwd');
const terminalCommand = el('terminalCommand');
const runTerminal = el('runTerminal');
const terminalOutput = el('terminalOutput');
const terminalTabs = el('terminalTabs');
const newTerminalTabBtn = el('newTerminalTab');
const diagnoseTerminalErrorBtn = el('diagnoseTerminalError');
const inlineSuggest = el('inlineSuggest');
const layoutMain = el('layoutMain');
const leftSplitter = el('leftSplitter');
const rightSplitter = el('rightSplitter');
const toast = el('toast');
const exportSessionBtn = el('exportSession');
const importSessionBtn = el('importSession');
const importSessionFile = el('importSessionFile');
const ctxTree = el('ctxTree');
const ctxSearch = el('ctxSearch');
const goalInput = el('goalInput');
const planTaskBtn = el('planTask');
const executeTaskBtn = el('executeTask');
const taskList = el('taskList');
const diffPreview = el('diffPanelBody');
const openGit = el('openGit');
const gitPanel = el('gitPanel');
const refreshGit = el('refreshGit');
const gitOutput = el('gitOutput');
const parseMultiFileBtn = el('parseMultiFile');
const applyMultiFileBtn = el('applyMultiFile');
const multiFileList = el('multiFileList');
const findPanel = el('findPanel');
const findText = el('findText');
const replaceText = el('replaceText');
const findNextBtn = el('findNext');
const replaceOneBtn = el('replaceOne');
const replaceAllBtn = el('replaceAll');
const closeFindBtn = el('closeFind');
const agentStepBtn = el('agentStep');
const agentApplyBtn = el('agentApply');
const agentSummary = el('agentSummary');
const agentActionsEl = el('agentActions');

let latestSuggestedCode = '';
let latestAssistantRaw = '';
let latestTree = [];
let latestSearch = [];
let dirty = false;
let findIndex = -1;
let latestTerminalError = '';
let latestCompletion = '';
const openTabs = [];
const taskPlan = [];
const multiFileChanges = [];
const terminalSessions = [{ id: 1, title: '终端 1', cwd: '.', output: '' }];
let activeTerminalId = 1;
let latestAgent = null;
const settings = {
  temperature: Number(localStorage.getItem('temperature') || 0.2),
  systemPrompt: localStorage.getItem('systemPrompt') || '你是一个编程助手，输出清晰说明和完整 updated_code 代码块。'
};

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function escapeHtml(text = '') {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function notify(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function getLanguageByPath(p = '') {
  const ext = (p.split('.').pop() || 'txt').toLowerCase();
  const map = { js: 'JavaScript', ts: 'TypeScript', json: 'JSON', md: 'Markdown', css: 'CSS', html: 'HTML', py: 'Python', java: 'Java', go: 'Go', rs: 'Rust' };
  return map[ext] || ext.toUpperCase();
}

function updateLineNumbers() {
  const lines = editor.value.split('\n').length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

function updateStatusBar() {
  const pos = editor.selectionStart;
  const before = editor.value.slice(0, pos);
  const line = before.split('\n').length;
  const col = before.length - before.lastIndexOf('\n');
  const lang = getLanguageByPath(filePathInput.value.trim());
  statusBar.textContent = `Ln ${line}, Col ${col} · UTF-8 · Spaces: 2 · ${lang} · ${dirty ? 'Unsaved' : 'Saved'}`;
}

function markDirty(v = true) {
  dirty = v;
  updateStatusBar();
}

function activeTerminal() {
  return terminalSessions.find((t) => t.id === activeTerminalId) || terminalSessions[0];
}

function renderTerminalTabs() {
  terminalTabs.innerHTML = terminalSessions.map((t) => `<button class="tab ${t.id === activeTerminalId ? 'active' : ''}" data-tid="${t.id}">${t.title}</button>`).join('');
  terminalTabs.querySelectorAll('button[data-tid]').forEach((b) => {
    b.onclick = () => {
      activeTerminalId = Number(b.dataset.tid);
      const t = activeTerminal();
      terminalCwd.value = t.cwd;
      terminalOutput.textContent = t.output || '(no output)';
      renderTerminalTabs();
    };
  });
}

function setInlineSuggestion(text) {
  latestCompletion = text || '';
  inlineSuggest.textContent = latestCompletion ? `补全建议：${latestCompletion.slice(0, 120)}` : '补全建议：无（Ctrl+Space 触发，Tab 接受）';
}

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = role === 'assistant' ? `<pre>${escapeHtml(content)}</pre>` : escapeHtml(content);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setCurrentPath(path) {
  filePathInput.value = path;
  if (path && !openTabs.includes(path)) openTabs.push(path);
  renderTabs();
  updateStatusBar();
}

function renderTabs() {
  tabsEl.innerHTML = '';
  openTabs.forEach((tabPath) => {
    const tab = document.createElement('button');
    tab.className = `tab ${tabPath === filePathInput.value ? 'active' : ''}`;
    tab.textContent = tabPath;
    tab.onclick = async () => {
      const file = await api(`/api/file?path=${encodeURIComponent(tabPath)}`);
      filePathInput.value = file.path;
      editor.value = file.content;
      markDirty(false);
      updateLineNumbers();
      updateStatusBar();
      renderTabs();
    };
    tabsEl.appendChild(tab);
  });
}

function renderTree(nodes, container) {
  const list = document.createElement('div');
  nodes.forEach((node) => {
    const row = document.createElement('div');
    row.className = 'tree-item';
    if (node.type === 'dir') {
      const label = document.createElement('div');
      label.className = 'tree-dir';
      label.textContent = `📁 ${node.name}`;
      const children = document.createElement('div');
      children.className = 'tree-children';
      renderTree(node.children, children);
      label.onclick = () => children.classList.toggle('collapsed');
      row.appendChild(label);
      row.appendChild(children);
    } else {
      row.classList.add('tree-file');
      row.textContent = `📄 ${node.name}`;
      row.onclick = async () => {
        const file = await api(`/api/file?path=${encodeURIComponent(node.path)}`);
        setCurrentPath(file.path);
        editor.value = file.content;
        markDirty(false);
        updateLineNumbers();
      };
    }
    list.appendChild(row);
  });
  container.appendChild(list);
}

async function loadTree() {
  const data = await api('/api/tree');
  latestTree = data.tree;
  fileTree.innerHTML = '';
  renderTree(data.tree, fileTree);
}

async function loadModels() {
  modelSelect.innerHTML = '';
  const data = await api('/api/models');
  data.models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
}

function renderTaskPlan() {
  taskList.innerHTML = taskPlan.map((t, i) => `<div class="task-item"><input type="checkbox" ${t.done ? 'checked' : ''} data-i="${i}" /> ${escapeHtml(t.text)}</div>`).join('') || '暂无任务';
  taskList.querySelectorAll('input[type="checkbox"]').forEach((c) => {
    c.onchange = () => { taskPlan[Number(c.dataset.i)].done = c.checked; };
  });
}

function renderMultiFileList() {
  multiFileList.innerHTML = multiFileChanges.map((c, i) => `<div class="task-item"><input type="checkbox" data-i="${i}" checked /> <strong>${escapeHtml(c.path)}</strong> (${c.content.length} chars)</div>`).join('') || '暂无多文件改动';
}

function buildContext() {
  const contexts = [];
  if (ctxTree.checked) contexts.push(`文件树摘要:\n${JSON.stringify(latestTree).slice(0, 2500)}`);
  if (ctxSearch.checked) contexts.push(`搜索结果:\n${JSON.stringify(latestSearch).slice(0, 2000)}`);
  if (taskPlan.length) contexts.push(`任务计划:\n${taskPlan.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`);
  return contexts.join('\n\n');
}

function makeSimpleDiff(a, b) {
  const A = a.split('\n');
  const B = b.split('\n');
  const out = [];
  const max = Math.max(A.length, B.length);
  for (let i = 0; i < max; i += 1) {
    if (A[i] === B[i]) continue;
    if (A[i] !== undefined) out.push(`- ${A[i]}`);
    if (B[i] !== undefined) out.push(`+ ${B[i]}`);
  }
  return out.join('\n') || '暂无差异';
}

function parseMultiFileBlocks(text) {
  const blocks = [];
  const re = /```file:([^\n]+)\n([\s\S]*?)```/g;
  let m = re.exec(text);
  while (m) {
    blocks.push({ path: m[1].trim(), content: m[2].replace(/\n$/, '') });
    m = re.exec(text);
  }
  return blocks;
}


function renderAgentActions() {
  if (!latestAgent || !Array.isArray(latestAgent.next_actions) || !latestAgent.next_actions.length) {
    agentActionsEl.innerHTML = '暂无动作';
    return;
  }
  agentActionsEl.innerHTML = latestAgent.next_actions.map((a, i) => {
    const label = a.type === 'edit' ? `${a.path || '(未提供路径)'}` : (a.command || a.reason || a.type);
    return `<div class="task-item"><input type="checkbox" data-i="${i}" checked /> [${escapeHtml(a.type || 'unknown')}] ${escapeHtml(label)}</div>`;
  }).join('');
}

async function runAgentStep() {
  const goal = goalInput.value.trim();
  const model = modelSelect.value;
  if (!goal) return alert('请先输入 Agent 目标');
  if (!model) return alert('请先选择模型');
  const context = [
    `当前文件: ${filePathInput.value || 'untitled.txt'}`,
    `当前代码:
${editor.value.slice(0, 3000)}`,
    `任务计划:
${taskPlan.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`,
    `搜索结果:
${JSON.stringify(latestSearch).slice(0, 1500)}`
  ].join('\n\n');

  const res = await api('/api/agent/step', {
    method: 'POST',
    body: JSON.stringify({
      model,
      goal,
      context,
      options: { temperature: Number(settings.temperature || 0.2) }
    })
  });

  latestAgent = res.agent || null;
  agentSummary.textContent = `${latestAgent?.summary || 'Agent 无摘要'}${latestAgent?.done ? '（已完成）' : ''}`;
  renderAgentActions();
}

async function applyAgentActions() {
  if (!latestAgent || !Array.isArray(latestAgent.next_actions)) return alert('暂无可应用动作');
  const selected = [];
  agentActionsEl.querySelectorAll('input[type="checkbox"][data-i]').forEach((c) => {
    if (c.checked) selected.push(latestAgent.next_actions[Number(c.dataset.i)]);
  });
  if (!selected.length) return alert('请先勾选动作');

  const edits = selected.filter((a) => a.type === 'edit' && a.path && typeof a.content === 'string');
  const terms = selected.filter((a) => a.type === 'terminal' && a.command);
  const asks = selected.filter((a) => a.type === 'ask_user');

  if (edits.length) {
    await api('/api/file/batch-save', {
      method: 'POST',
      body: JSON.stringify({ changes: edits.map((e) => ({ path: e.path, content: e.content })) })
    });
    await loadTree();
  }

  for (const t of terms) {
    if (!confirm(`Agent 请求执行终端命令：\n${t.command}`)) continue;
    try {
      const r = await api('/api/terminal', { method: 'POST', body: JSON.stringify({ command: t.command, cwd: terminalCwd.value.trim() || '.' }) });
      terminalOutput.textContent = r.output || '(no output)';
    } catch (e) {
      terminalOutput.textContent = `Error: ${e.message}`;
    }
  }

  if (asks.length) alert(`Agent 有 ${asks.length} 条需要你确认的问题，请查看 Agent 列表。`);
}

function openFind(replace = false) {
  findPanel.classList.remove('hidden');
  if (replace) replaceText.focus();
  else findText.focus();
}

function findNext() {
  const query = findText.value;
  if (!query) return;
  const from = Math.max(0, editor.selectionEnd);
  let idx = editor.value.indexOf(query, from);
  if (idx < 0) idx = editor.value.indexOf(query, 0);
  if (idx < 0) return;
  findIndex = idx;
  editor.focus();
  editor.setSelectionRange(idx, idx + query.length);
  updateStatusBar();
}

function replaceOne() {
  const q = findText.value;
  if (!q) return;
  const sel = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (sel === q) {
    const before = editor.value.slice(0, editor.selectionStart);
    const after = editor.value.slice(editor.selectionEnd);
    editor.value = `${before}${replaceText.value}${after}`;
    markDirty(true);
    updateLineNumbers();
  }
  findNext();
}

function replaceAll() {
  const q = findText.value;
  if (!q) return;
  editor.value = editor.value.split(q).join(replaceText.value);
  markDirty(true);
  updateLineNumbers();
  updateStatusBar();
}

saveFileBtn.onclick = async () => {
  const path = filePathInput.value.trim();
  if (!path) return alert('请先输入文件路径');
  await api('/api/file', { method: 'POST', body: JSON.stringify({ path, content: editor.value }) });
  setCurrentPath(path);
  await loadTree();
  markDirty(false);
};

newFileBtn.onclick = () => {
  const p = prompt('输入新文件路径（相对工作区）');
  if (!p) return;
  setCurrentPath(p.trim());
  editor.value = '';
  markDirty(true);
  updateLineNumbers();
};

renameFileBtn.onclick = async () => {
  const oldPath = filePathInput.value.trim();
  const newPath = prompt('输入新文件路径', oldPath);
  if (!oldPath || !newPath || oldPath === newPath) return;
  await api('/api/file/rename', { method: 'POST', body: JSON.stringify({ oldPath, newPath }) });
  const idx = openTabs.indexOf(oldPath);
  if (idx >= 0) openTabs.splice(idx, 1, newPath);
  setCurrentPath(newPath);
  await loadTree();
};

deleteFileBtn.onclick = async () => {
  const p = filePathInput.value.trim();
  if (!p || !confirm(`确认删除 ${p} ?`)) return;
  await api('/api/file/delete', { method: 'POST', body: JSON.stringify({ path: p }) });
  const idx = openTabs.indexOf(p);
  if (idx >= 0) openTabs.splice(idx, 1);
  filePathInput.value = '';
  editor.value = '';
  renderTabs();
  await loadTree();
  markDirty(false);
  updateLineNumbers();
};

loadHistoryBtn.onclick = async () => {
  const p = filePathInput.value.trim();
  if (!p) return;
  const res = await api(`/api/history?path=${encodeURIComponent(p)}`);
  if (!res.snapshots.length) return alert('暂无历史版本');
  const picked = prompt(`可选历史版本:\n${res.snapshots.join('\n')}`);
  if (!picked) return;
  await api('/api/history/restore', { method: 'POST', body: JSON.stringify({ path: p, snapshot: picked.trim() }) });
  editor.value = (await api(`/api/file?path=${encodeURIComponent(p)}`)).content;
  markDirty(false);
  updateLineNumbers();
};

searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  const data = await api(`/api/search?q=${encodeURIComponent(q)}`);
  latestSearch = data.results;
  searchResults.innerHTML = data.results.map((r) => `<div class="result-item" data-path="${escapeHtml(r.path)}"><strong>${escapeHtml(r.path)}</strong><div>${escapeHtml(r.snippet)}</div></div>`).join('') || '<div class="result-item">未找到匹配</div>';
  searchResults.querySelectorAll('.result-item[data-path]').forEach((node) => {
    node.onclick = async () => {
      const p = node.getAttribute('data-path');
      const file = await api(`/api/file?path=${encodeURIComponent(p)}`);
      setCurrentPath(file.path);
      editor.value = file.content;
      markDirty(false);
      updateLineNumbers();
    };
  });
};

planTaskBtn.onclick = async () => {
  const goal = goalInput.value.trim();
  const model = modelSelect.value;
  if (!goal) return alert('请先输入任务目标');
  if (!model) return alert('请先选择模型');
  try {
    const res = await api('/api/plan', {
      method: 'POST',
      body: JSON.stringify({ model, goal, options: { temperature: Number(settings.temperature || 0.2) } })
    });
    taskPlan.length = 0;
    res.steps.forEach((text) => taskPlan.push({ text, done: false }));
    if (!taskPlan.length) taskPlan.push({ text: goal, done: false });
    renderTaskPlan();
  } catch (e) {
    notify(`生成计划失败: ${e.message}`);
  }
};

executeTaskBtn.onclick = () => {
  const remain = taskPlan.filter((t) => !t.done).map((t) => t.text).join('；');
  if (!remain) return alert('没有待执行任务');
  promptInput.value = `请按以下计划执行并修改当前文件：${remain}`;
  askAIBtn.click();
};

runTerminal.onclick = async () => {
  const cmd = terminalCommand.value.trim();
  if (!cmd) return;
  if (!confirm(`确认执行命令？\n${cmd}`)) return;
  terminalOutput.textContent = 'Running...';
  try {
    const data = await api('/api/terminal', { method: 'POST', body: JSON.stringify({ command: cmd, cwd: terminalCwd.value.trim() || '.' }) });
    terminalOutput.textContent = data.output || '(no output)';
  } catch (e) {
    terminalOutput.textContent = `Error: ${e.message}`;
  }
};

toggleTerminalBtn.onclick = () => terminalPanel.classList.toggle('hidden');
openGit.onclick = () => gitPanel.classList.toggle('hidden');
refreshGit.onclick = async () => {
  try {
    const status = await api('/api/git/status');
    const diff = await api('/api/git/diff');
    gitOutput.textContent = `# status\n${status.output}\n\n# diff\n${diff.output || '(no diff)'}`;
  } catch (e) {
    gitOutput.textContent = e.message;
  }
};


diagnoseTerminalErrorBtn.onclick = async () => {
  if (!latestTerminalError) return alert('当前没有可诊断的错误输出');
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');
  const res = await api('/api/diagnose-error', {
    method: 'POST',
    body: JSON.stringify({ model, stderr: latestTerminalError, command: terminalCommand.value.trim(), options: { temperature: 0.1 } })
  });
  addMessage('assistant', `终端错误诊断：
${res.diagnosis}`);
};

newTerminalTabBtn.onclick = () => {
  const nextId = Math.max(...terminalSessions.map((t) => t.id)) + 1;
  terminalSessions.push({ id: nextId, title: `终端 ${nextId}`, cwd: '.', output: '' });
  activeTerminalId = nextId;
  terminalCwd.value = '.';
  terminalOutput.textContent = '(no output)';
  renderTerminalTabs();
};

askAIBtn.onclick = async () => {
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return alert('请先输入你的需求');
  const currentPath = filePathInput.value.trim() || 'untitled.txt';
  const currentCode = editor.value;
  const context = buildContext();
  addMessage('user', `${userPrompt}\n\n${context}`);
  askAIBtn.disabled = true;
  try {
    const result = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model,
        options: { temperature: Number(settings.temperature || 0.2) },
        messages: [
          { role: 'system', content: `${settings.systemPrompt}\n如果需要改多个文件，可用格式：\`\`\`file:path/to/file\\n完整文件内容\`\`\` 返回。` },
          { role: 'user', content: `文件路径: ${currentPath}\n\n当前代码:\n${currentCode}\n\n需求:\n${userPrompt}\n\n上下文:\n${context}` }
        ]
      })
    });
    const content = result?.message?.content || '模型没有返回内容';
    latestAssistantRaw = content;
    addMessage('assistant', content);
    const matched = content.match(/```updated_code\n([\s\S]*?)```/);
    latestSuggestedCode = matched ? matched[1].trimEnd() : '';
    diffPreview.textContent = makeSimpleDiff(editor.value, latestSuggestedCode || editor.value);
  } catch (e) {
    addMessage('assistant', `请求失败：${e.message}`);
  } finally {
    askAIBtn.disabled = false;
  }
};

applyAIBtn.onclick = () => {
  if (!latestSuggestedCode) return alert('没有可应用代码');
  editor.value = latestSuggestedCode;
  markDirty(true);
  updateLineNumbers();
};

parseMultiFileBtn.onclick = () => {
  multiFileChanges.length = 0;
  parseMultiFileBlocks(latestAssistantRaw).forEach((c) => multiFileChanges.push(c));
  renderMultiFileList();
};

applyMultiFileBtn.onclick = async () => {
  const selected = [];
  multiFileList.querySelectorAll('input[type="checkbox"][data-i]').forEach((c) => {
    if (c.checked) selected.push(multiFileChanges[Number(c.dataset.i)]);
  });
  if (!selected.length) return alert('请至少选择一个文件改动');
  await api('/api/file/batch-save', { method: 'POST', body: JSON.stringify({ changes: selected }) });
  await loadTree();
  notify(`已应用 ${selected.length} 个文件改动`);
};

function getMessages() {
  return [...messagesEl.querySelectorAll('.message')].map((m) => ({ role: m.classList.contains('assistant') ? 'assistant' : 'user', text: m.textContent }));
}

exportSessionBtn.onclick = () => {
  const data = {
    filePath: filePathInput.value,
    openTabs,
    goal: goalInput.value,
    plan: taskPlan,
    prompt: promptInput.value,
    messages: getMessages(),
    settings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'trae-session.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

importSessionBtn.onclick = () => importSessionFile.click();
importSessionFile.onchange = async () => {
  const f = importSessionFile.files[0];
  if (!f) return;
  const data = JSON.parse(await f.text());
  goalInput.value = data.goal || '';
  taskPlan.length = 0;
  (data.plan || []).forEach((p) => taskPlan.push(p));
  renderTaskPlan();
  promptInput.value = data.prompt || '';
  messagesEl.innerHTML = '';
  (data.messages || []).forEach((m) => addMessage(m.role, m.text));
};

const commands = [
  { name: '保存文件', run: () => saveFileBtn.click() },
  { name: '查找', run: () => openFind(false) },
  { name: '替换', run: () => openFind(true) },
  { name: '全局搜索', run: () => searchBtn.click() },
  { name: 'AI生成计划', run: () => planTaskBtn.click() },
  { name: '执行任务计划', run: () => executeTaskBtn.click() },
  { name: 'Agent 下一步', run: () => agentStepBtn.click() },
  { name: '应用 Agent 动作', run: () => agentApplyBtn.click() },
  { name: '解析多文件建议', run: () => parseMultiFileBtn.click() },
  { name: '批量应用多文件建议', run: () => applyMultiFileBtn.click() },
  { name: '切换终端', run: () => toggleTerminalBtn.click() },
  { name: '打开Git面板', run: () => openGit.click() },
  { name: '请求AI建议', run: () => askAIBtn.click() },
  { name: '打开设置', run: () => openSettingsBtn.click() },
];

function renderPalette(filter = '') {
  const shown = commands.filter((c) => c.name.includes(filter));
  paletteList.innerHTML = shown.map((c, i) => `<button class="palette-item" data-i="${i}">${c.name}</button>`).join('');
  paletteList.querySelectorAll('.palette-item').forEach((btn) => {
    btn.onclick = () => {
      shown[Number(btn.dataset.i)].run();
      paletteModal.classList.add('hidden');
    };
  });
}

openPaletteBtn.onclick = () => {
  paletteModal.classList.remove('hidden');
  paletteInput.value = '';
  renderPalette('');
  paletteInput.focus();
};
closePaletteBtn.onclick = () => paletteModal.classList.add('hidden');
paletteInput.oninput = () => renderPalette(paletteInput.value.trim());

function persistSettings() {
  localStorage.setItem('temperature', String(settings.temperature));
  localStorage.setItem('systemPrompt', settings.systemPrompt);
  temperatureInput.value = String(settings.temperature);
  systemPromptInput.value = settings.systemPrompt;
}
openSettingsBtn.onclick = () => {
  settingsModal.classList.remove('hidden');
  persistSettings();
};
closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
saveSettingsBtn.onclick = () => {
  settings.temperature = Number(temperatureInput.value || 0.2);
  settings.systemPrompt = systemPromptInput.value.trim() || settings.systemPrompt;
  persistSettings();
  settingsModal.classList.add('hidden');
};

findNextBtn.onclick = findNext;
replaceOneBtn.onclick = replaceOne;
replaceAllBtn.onclick = replaceAll;
closeFindBtn.onclick = () => findPanel.classList.add('hidden');
agentStepBtn.onclick = () => runAgentStep().catch((e) => alert(`Agent 执行失败: ${e.message}`));
agentApplyBtn.onclick = () => applyAgentActions().catch((e) => alert(`应用 Agent 动作失败: ${e.message}`));

editor.addEventListener('input', () => {
  markDirty(true);
  updateLineNumbers();
});
editor.addEventListener('click', updateStatusBar);
editor.addEventListener('keyup', updateStatusBar);
editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    saveFileBtn.click();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    openFind(false);
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault();
    openFind(true);
  }
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    const model = modelSelect.value;
    if (!model) return alert('请先选择模型');
    const pos = editor.selectionStart;
    const before = editor.value.slice(Math.max(0, pos - 300), pos);
    api('/api/complete', {
      method: 'POST',
      body: JSON.stringify({ model, code: editor.value, cursorContext: before, options: { temperature: 0.1 } })
    }).then((r) => setInlineSuggestion(r.suggestion || '')).catch((err) => setInlineSuggestion(`补全失败: ${err.message}`));
  }
  if (e.key === 'Tab' && latestCompletion && document.activeElement === editor) {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = `${editor.value.slice(0, start)}${latestCompletion}${editor.value.slice(end)}`;
    editor.setSelectionRange(start + latestCompletion.length, start + latestCompletion.length);
    markDirty(true);
    updateLineNumbers();
    setInlineSuggestion('');
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPaletteBtn.click();
  }
});



document.querySelectorAll('.panel-toggle').forEach((btn) => {
  btn.onclick = () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    target.classList.toggle('hidden');
    btn.textContent = target.classList.contains('hidden') ? '展开' : '折叠';
  };
});

function bindSplitter(splitterEl) {
  let dragging = false;
  splitterEl.addEventListener('mousedown', () => { dragging = true; document.body.classList.add('resizing'); });
  window.addEventListener('mouseup', () => { dragging = false; document.body.classList.remove('resizing'); });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = layoutMain.getBoundingClientRect();
    if (splitterEl === leftSplitter) {
      const left = Math.max(200, Math.min(e.clientX - rect.left, rect.width - 760));
      const right = (layoutMain.dataset.right || '430');
      layoutMain.style.gridTemplateColumns = `${left}px 6px 1fr 6px ${right}px`;
    } else {
      const right = Math.max(320, Math.min(rect.right - e.clientX, rect.width - 340));
      layoutMain.dataset.right = String(right);
      const left = layoutMain.style.gridTemplateColumns.split(' ')[0] || '280px';
      layoutMain.style.gridTemplateColumns = `${left} 6px 1fr 6px ${right}px`;
    }
  });
}

bindSplitter(leftSplitter);
bindSplitter(rightSplitter);

refreshModelsBtn.onclick = () => loadModels().catch((e) => notify(`加载模型失败: ${e.message}`));

loadTree().catch((e) => notify(`加载文件树失败: ${e.message}`));
loadModels().catch((e) => notify(`加载模型失败: ${e.message}`));
persistSettings();
renderTaskPlan();
renderMultiFileList();
renderAgentActions();
renderTerminalTabs();
setInlineSuggestion('');
updateLineNumbers();
updateStatusBar();
