const el = (id) => document.getElementById(id);
const fileTree = el('fileTree');
const editor = el('editor');
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
const exportSessionBtn = el('exportSession');
const importSessionBtn = el('importSession');
const importSessionFile = el('importSessionFile');
const ctxTree = el('ctxTree');
const ctxSearch = el('ctxSearch');
const goalInput = el('goalInput');
const planTaskBtn = el('planTask');
const executeTaskBtn = el('executeTask');
const taskList = el('taskList');
const diffPreview = el('diffPreview');
const openGit = el('openGit');
const gitPanel = el('gitPanel');
const refreshGit = el('refreshGit');
const gitOutput = el('gitOutput');

let latestSuggestedCode = '';
let latestTree = [];
let latestSearch = [];
const openTabs = [];
const taskPlan = [];
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

saveFileBtn.onclick = async () => {
  const path = filePathInput.value.trim();
  if (!path) return alert('请先输入文件路径');
  await api('/api/file', { method: 'POST', body: JSON.stringify({ path, content: editor.value }) });
  setCurrentPath(path);
  await loadTree();
};

newFileBtn.onclick = () => {
  const p = prompt('输入新文件路径（相对工作区）');
  if (!p) return;
  setCurrentPath(p.trim());
  editor.value = '';
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
    };
  });
};

planTaskBtn.onclick = () => {
  const goal = goalInput.value.trim();
  if (!goal) return alert('请先输入任务目标');
  taskPlan.length = 0;
  goal.split(/[，。,.;；\n]+/).map((s) => s.trim()).filter(Boolean).forEach((text) => taskPlan.push({ text, done: false }));
  if (!taskPlan.length) taskPlan.push({ text: goal, done: false });
  renderTaskPlan();
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
          { role: 'system', content: settings.systemPrompt },
          { role: 'user', content: `文件路径: ${currentPath}\n\n当前代码:\n${currentCode}\n\n需求:\n${userPrompt}\n\n上下文:\n${context}` }
        ]
      })
    });
    const content = result?.message?.content || '模型没有返回内容';
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
  diffPreview.textContent = makeSimpleDiff(editor.value, latestSuggestedCode);
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
  { name: '全局搜索', run: () => searchBtn.click() },
  { name: '生成任务计划', run: () => planTaskBtn.click() },
  { name: '执行任务计划', run: () => executeTaskBtn.click() },
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

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPaletteBtn.click();
  }
});

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

refreshModelsBtn.onclick = () => loadModels().catch((e) => alert(`加载模型失败: ${e.message}`));

loadTree().catch((e) => alert(`加载文件树失败: ${e.message}`));
loadModels().catch((e) => alert(`加载模型失败: ${e.message}`));
persistSettings();
