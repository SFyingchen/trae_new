const el = (id) => document.getElementById(id);
const fileTree = el('fileTree');
const leftSidebarTabs = el('leftSidebarTabs');
const sidebarSearchInput = el('sidebarSearchInput');
const sidebarSearchBtn = el('sidebarSearchBtn');
const sidebarSearchResults = el('sidebarSearchResults');
const editor = el('editor');
const lineNumbers = el('lineNumbers');
const statusBar = el('statusBar');
const filePathInput = el('filePath');
const saveFileBtn = el('saveFile');
const promptInput = el('prompt');
const mentionQuickActions = el('mentionQuickActions');
const mentionPreview = el('mentionPreview');
const promptPreset = el('promptPreset');
const applyPromptPresetBtn = el('applyPromptPreset');
const improvePromptBtn = el('improvePrompt');
const clearChatBtn = el('clearChat');
const askAIBtn = el('askAI');
const applyAIBtn = el('applyAI');
const messagesEl = el('messages');
const providerSelect = el('providerSelect');
const modelSelect = el('modelSelect');
const providerBaseUrl = el('providerBaseUrl');
const providerApiKey = el('providerApiKey');
const refreshModelsBtn = el('refreshModels');
const soloModeToggle = el('soloModeToggle');
const soloMaxSteps = el('soloMaxSteps');
const soloModeBanner = el('soloModeBanner');
const workflowBar = el('workflowBar');
const workflowHint = el('workflowHint');
const searchInput = el('searchInput');
const searchBtn = el('searchBtn');
const searchResults = el('searchResults');
const editorQuickToggles = el('editorQuickToggles');
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
const settingsTabs = el('settingsTabs');
const uiDensity = el('uiDensity');
const autoSave = el('autoSave');
const showLineNumbers = el('showLineNumbers');
const editorFontSize = el('editorFontSize');
const editorTabSize = el('editorTabSize');
const wordWrap = el('wordWrap');
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
const rightPaneTabs = el('rightPaneTabs');
const cueSection = el('cueSection');
const agentSection = el('agentSection');
const chatSection = el('chatSection');
const goalInput = el('goalInput');
const planTaskBtn = el('planTask');
const executeTaskBtn = el('executeTask');
const taskList = el('taskList');
const diffPreview = el('diffPanelBody');
const openGit = el('openGit');
const gitPanel = el('gitPanel');
const refreshGit = el('refreshGit');
const gitOutput = el('gitOutput');
const problemsPanel = el('problemsPanel');
const problemsList = el('problemsList');
const clearProblemsBtn = el('clearProblems');
const cueTemplates = el('cueTemplates');
const cueInput = el('cueInput');
const runCueBtn = el('runCue');
const suggestCueBtn = el('suggestCue');
const cueSuggestions = el('cueSuggestions');
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
const agentRunBtn = el('agentRun');
const agentAllowWrite = el('agentAllowWrite');
const agentAllowTerminal = el('agentAllowTerminal');
const agentMaxSteps = el('agentMaxSteps');
const agentRunTrace = el('agentRunTrace');
const agentRequireApproval = el('agentRequireApproval');
const agentSessionStartBtn = el('agentSessionStart');
const agentSessionNextBtn = el('agentSessionNext');
const agentSessionAutoBtn = el('agentSessionAuto');
const agentSessionApproveBtn = el('agentSessionApprove');
const agentSessionRejectBtn = el('agentSessionReject');
const agentSessionStopBtn = el('agentSessionStop');
const agentSessionIdInput = el('agentSessionId');
const agentSessionRefreshBtn = el('agentSessionRefresh');
const agentSessionsEl = el('agentSessions');

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
let currentAgentSession = null;
const problems = [];
const settings = {
  temperature: Number(localStorage.getItem('temperature') || 0.2),
  systemPrompt: localStorage.getItem('systemPrompt') || '你是一个编程助手，输出清晰说明和完整 updated_code 代码块。',
  provider: localStorage.getItem('provider') || 'ollama',
  providerBaseUrl: localStorage.getItem('providerBaseUrl') || '',
  providerApiKey: localStorage.getItem('providerApiKey') || '',
  soloMode: localStorage.getItem('soloMode') === 'true',
  soloMaxSteps: Number(localStorage.getItem('soloMaxSteps') || 3),
  uiDensity: localStorage.getItem('uiDensity') || 'comfortable',
  autoSave: localStorage.getItem('autoSave') === 'true',
  showLineNumbers: localStorage.getItem('showLineNumbers') !== 'false',
  editorFontSize: Number(localStorage.getItem('editorFontSize') || 14),
  editorTabSize: Number(localStorage.getItem('editorTabSize') || 2),
  wordWrap: localStorage.getItem('wordWrap') !== 'false',
  workflowMode: localStorage.getItem('workflowMode') || 'hybrid'
};

function getWorkflowProfile(mode = settings.workflowMode) {
  const map = {
    trae: {
      label: 'Trae 快速探索',
      hint: '偏向快速探索与建议扩散，适合头脑风暴和需求不稳定阶段。',
      temp: 0.55,
      solo: false,
      maxSteps: 2,
      requireApproval: false,
      allowTerminal: false
    },
    cline: {
      label: 'Cline 稳健执行',
      hint: '偏向计划化执行与确认闭环，适合明确目标的重构/修复。',
      temp: 0.18,
      solo: true,
      maxSteps: 4,
      requireApproval: true,
      allowTerminal: false
    },
    hybrid: {
      label: 'Hybrid（推荐）',
      hint: '平衡探索速度与执行确定性，适合大多数任务。',
      temp: 0.28,
      solo: false,
      maxSteps: 3,
      requireApproval: true,
      allowTerminal: false
    }
  };
  return map[mode] || map.hybrid;
}

function applyWorkflowToControls(profile = getWorkflowProfile()) {
  if (!profile) return;
  settings.temperature = Number(profile.temp);
  settings.soloMode = Boolean(profile.solo);
  settings.soloMaxSteps = Number(profile.maxSteps || 3);
  settings.workflowMode = settings.workflowMode || 'hybrid';
  soloModeToggle.checked = settings.soloMode;
  soloMaxSteps.value = String(settings.soloMaxSteps);
  agentRequireApproval.checked = Boolean(profile.requireApproval);
  agentAllowTerminal.checked = Boolean(profile.allowTerminal);
  agentMaxSteps.value = String(profile.maxSteps || 3);
  temperatureInput.value = String(settings.temperature);
  soloModeBanner.classList.toggle('hidden', !settings.soloMode);
  if (workflowHint) workflowHint.textContent = profile.hint;
  if (workflowBar) {
    workflowBar.querySelectorAll('button[data-workflow-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.workflowMode === settings.workflowMode);
    });
  }
}

function bindWorkflowMode() {
  if (!workflowBar) return;
  workflowBar.querySelectorAll('button[data-workflow-mode]').forEach((btn) => {
    btn.onclick = () => {
      settings.workflowMode = btn.dataset.workflowMode || 'hybrid';
      applyWorkflowToControls(getWorkflowProfile(settings.workflowMode));
      persistSettings();
      notify(`已切换工作流模式：${getWorkflowProfile(settings.workflowMode).label}`);
    };
  });
  applyWorkflowToControls(getWorkflowProfile(settings.workflowMode));
}

function bindEditorSectionToggles() {
  if (!editorQuickToggles) return;
  const state = JSON.parse(localStorage.getItem('editorSectionState') || '{}');
  editorQuickToggles.querySelectorAll('button[data-editor-section-toggle]').forEach((btn) => {
    const targetId = btn.dataset.editorSectionToggle;
    const target = document.getElementById(targetId);
    if (!target) return;
    const hidden = Boolean(state[targetId]);
    target.classList.toggle('hidden', hidden);
    btn.classList.toggle('active', !hidden);
    btn.onclick = () => {
      target.classList.toggle('hidden');
      const isHidden = target.classList.contains('hidden');
      btn.classList.toggle('active', !isHidden);
      state[targetId] = isHidden;
      localStorage.setItem('editorSectionState', JSON.stringify(state));
    };
  });
}

const promptPresetTemplates = {
  default: '目标：实现需求并保证可运行。\n约束：最小改动优先，兼容现有结构。\n输出：先说明方案，再给 updated_code。',
  fix: '目标：定位并修复当前问题。\n请先说明根因，再给修复方案和 updated_code；同时列出回归风险。',
  refactor: '目标：在不改变行为前提下重构当前代码。\n请先说明重构边界，再给 updated_code，并解释可维护性提升点。',
  tests: '目标：为当前逻辑补充测试。\n请覆盖正常/边界/异常路径，并说明每个测试意图。',
  perf: '目标：优化性能并保证可读性。\n请对比优化前后复杂度或关键路径开销，再给 updated_code。'
};

function buildPromptQualityHint(text = '') {
  const base = String(text || '').trim();
  if (!base) return '';
  const lines = [];
  if (!/目标|goal/i.test(base)) lines.push('目标：');
  if (!/约束|限制|constraint/i.test(base)) lines.push('约束：');
  if (!/验收|标准|acceptance/i.test(base)) lines.push('验收标准：');
  if (!/输出|返回|format/i.test(base)) lines.push('输出格式：');
  if (!lines.length) return base;
  return `${base}\n\n请补全以下信息后执行：\n${lines.map((x) => `- ${x}`).join('\n')}`;
}

function buildSystemPrompt() {
  const workflow = getWorkflowProfile(settings.workflowMode);
  const preset = promptPreset?.value || 'default';
  const presetHint = promptPresetTemplates[preset] || promptPresetTemplates.default;
  return `${settings.systemPrompt}\n当前工作流模式：${workflow.label}。\n提示词策略：${preset}。\n执行要求：优先给出最小可验证改动；涉及多文件时明确每个文件作用。\n模板要求：${presetHint}\n如果需要改多个文件，可用格式：\`\`\`file:path/to/file\\n完整文件内容\`\`\` 返回。`;
}

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const message = data.error || 'Request failed';
    pushProblem('api', `${url}: ${message}`);
    throw new Error(message);
  }
  return data;
}

function currentProviderPayload() {
  return {
    provider: providerSelect.value || settings.provider || 'ollama',
    providerConfig: {
      baseUrl: providerBaseUrl.value.trim(),
      apiKey: providerApiKey.value.trim()
    }
  };
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

function setRightPaneTab(tabId) {
  const sections = [cueSection, agentSection, chatSection, problemsPanel, gitPanel].filter(Boolean);
  sections.forEach((sec) => {
    if (sec.id === tabId) sec.classList.remove('hidden');
    else sec.classList.add('hidden');
  });
  rightPaneTabs.querySelectorAll('button[data-right-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.rightTab === tabId);
  });
  localStorage.setItem('rightPaneTab', tabId);
}

function renderProblems() {
  if (!problems.length) {
    problemsList.innerHTML = '暂无问题';
    return;
  }
  problemsList.innerHTML = problems.map((p) => `<div class="problem-item"><strong>[${escapeHtml(p.source)}]</strong> ${escapeHtml(p.message)}<div class="problem-time">${escapeHtml(p.time)}</div></div>`).join('');
}

function pushProblem(source, message) {
  problems.unshift({ source, message, time: new Date().toLocaleTimeString() });
  if (problems.length > 60) problems.length = 60;
  renderProblems();
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
  statusBar.textContent = `Ln ${line}, Col ${col} · UTF-8 · Spaces: 2 · ${lang} · ${providerSelect.value || settings.provider} · ${modelSelect.value || 'no-model'} · ${dirty ? 'Unsaved' : 'Saved'}`;
}

function markDirty(v = true) {
  dirty = v;
  updateStatusBar();
}

function applyEditorPreferences() {
  editor.style.fontSize = `${settings.editorFontSize || 14}px`;
  editor.style.tabSize = String(settings.editorTabSize || 2);
  editor.style.whiteSpace = settings.wordWrap ? 'pre-wrap' : 'pre';
  lineNumbers.classList.toggle('hidden', !settings.showLineNumbers);
  document.body.classList.toggle('ui-compact', settings.uiDensity === 'compact');
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

function renderSearchResultList(container, results = []) {
  container.innerHTML = results.map((r) => `<div class="result-item" data-path="${escapeHtml(r.path)}"><strong>${escapeHtml(r.path)}</strong><div>${escapeHtml(r.snippet)}</div></div>`).join('') || '<div class="result-item">未找到匹配</div>';
  container.querySelectorAll('.result-item[data-path]').forEach((node) => {
    node.onclick = async () => {
      const p = node.getAttribute('data-path');
      const file = await api(`/api/file?path=${encodeURIComponent(p)}`);
      setCurrentPath(file.path);
      editor.value = file.content;
      markDirty(false);
      updateLineNumbers();
    };
  });
}

async function performGlobalSearch(query) {
  const q = String(query || '').trim();
  if (!q) return;
  const data = await api(`/api/search?q=${encodeURIComponent(q)}`);
  latestSearch = data.results;
  renderSearchResultList(searchResults, data.results);
  renderSearchResultList(sidebarSearchResults, data.results);
}

function bindSidebarTabs() {
  leftSidebarTabs.querySelectorAll('button[data-side-tab]').forEach((btn) => {
    btn.onclick = () => {
      const target = btn.dataset.sideTab;
      document.querySelectorAll('.side-pane').forEach((sec) => sec.classList.toggle('hidden', sec.id !== target));
      leftSidebarTabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      localStorage.setItem('leftSidebarTab', target);
    };
  });
  const saved = localStorage.getItem('leftSidebarTab') || 'explorerPane';
  const picked = leftSidebarTabs.querySelector(`button[data-side-tab="${saved}"]`) || leftSidebarTabs.querySelector('button[data-side-tab]');
  if (picked) picked.click();
}

async function loadProviders() {
  const data = await api('/api/providers');
  providerSelect.innerHTML = '';
  (data.providers || []).forEach((p) => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.name;
    providerSelect.appendChild(option);
  });
  providerSelect.value = settings.provider || 'ollama';
  providerBaseUrl.value = settings.providerBaseUrl || '';
  providerApiKey.value = settings.providerApiKey || '';
}

async function loadModels() {
  modelSelect.innerHTML = '';
  const data = await api('/api/models', { method: 'POST', body: JSON.stringify(currentProviderPayload()) });
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
  if (ctxTree.checked) contexts.push(`文件树摘要:
${JSON.stringify(latestTree).slice(0, 2500)}`);
  if (ctxSearch.checked) contexts.push(`搜索结果:
${JSON.stringify(latestSearch).slice(0, 2000)}`);
  if (taskPlan.length) contexts.push(`任务计划:
${taskPlan.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`);
  return contexts.join('\n\n');
}

function parseMentions(text = '') {
  const tokens = String(text).match(/@(selection|tree|search|problems|terminal|file:[^\s]+|folder:[^\s]+)/g) || [];
  return [...new Set(tokens)];
}

function renderMentionPreview(tokens = []) {
  if (!tokens.length) {
    mentionPreview.innerHTML = '未检测到 @mentions';
    return;
  }
  mentionPreview.innerHTML = tokens.map((t) => `<div class="task-item">${escapeHtml(t)}</div>`).join('');
}

function flattenTree(nodes = [], out = []) {
  for (const node of nodes) {
    out.push(node);
    if (Array.isArray(node.children)) flattenTree(node.children, out);
  }
  return out;
}

async function resolveMentions(tokens = []) {
  const chunks = [];
  const flatTree = flattenTree(latestTree, []);

  for (const token of tokens) {
    if (token === '@selection') {
      const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
      if (selected) chunks.push(`[@selection]\n${selected.slice(0, 2200)}`);
      continue;
    }
    if (token === '@tree') {
      chunks.push(`[@tree]\n${JSON.stringify(latestTree).slice(0, 3000)}`);
      continue;
    }
    if (token === '@search') {
      chunks.push(`[@search]\n${JSON.stringify(latestSearch).slice(0, 2500)}`);
      continue;
    }
    if (token === '@problems') {
      chunks.push(`[@problems]\n${JSON.stringify(problems.slice(0, 20)).slice(0, 2000)}`);
      continue;
    }
    if (token === '@terminal') {
      const t = activeTerminal();
      chunks.push(`[@terminal]\n${String(t?.output || '').slice(0, 2500)}`);
      continue;
    }
    if (token.startsWith('@file:')) {
      const path = token.slice('@file:'.length).trim();
      if (!path) continue;
      try {
        const file = await api(`/api/file?path=${encodeURIComponent(path)}`);
        chunks.push(`[@file:${path}]\n${String(file.content || '').slice(0, 3500)}`);
      } catch (e) {
        chunks.push(`[@file:${path}] 读取失败: ${e.message}`);
      }
      continue;
    }
    if (token.startsWith('@folder:')) {
      const prefix = token.slice('@folder:'.length).trim();
      if (!prefix) continue;
      const matches = flatTree.filter((n) => String(n.path || '').startsWith(prefix)).slice(0, 60).map((n) => n.path);
      chunks.push(`[@folder:${prefix}]\n${matches.join('\n')}`);
    }
  }

  return chunks.join('\n\n');
}

async function buildContextWithMentions(userPrompt) {
  const mentions = parseMentions(userPrompt);
  renderMentionPreview(mentions);
  const mentionContext = mentions.length ? await resolveMentions(mentions) : '';
  const cleanPrompt = String(userPrompt || '').replace(/@(selection|tree|search|problems|terminal|file:[^\s]+|folder:[^\s]+)/g, '').replace(/\s{2,}/g, ' ').trim();
  return { mentions, mentionContext, cleanPrompt: cleanPrompt || String(userPrompt || '').trim() };
}


const cuePromptTemplates = {
  explain: '请解释当前文件的核心逻辑、关键数据流和潜在风险。',
  fix: '请定位当前文件中最可能出问题的点并给出可直接应用的修复代码。',
  optimize: '请在不改变行为前提下优化当前文件性能和可读性，并给出完整更新代码。',
  tests: '请为当前文件生成关键测试用例，优先覆盖边界条件与错误分支。',
  refactor: '请把当前文件按功能模块重构，结构更清晰，保持行为一致。'
};

function setCuePrompt(text) {
  promptInput.value = text;
  promptInput.focus();
}

async function runCue(text) {
  const cue = String(text || '').trim();
  if (!cue) return;
  const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
  const selectionHint = selected ? `

当前选中代码:
${selected.slice(0, 1800)}` : '';
  setCuePrompt(`[Cue] ${cue}${selectionHint}`);
  askAIBtn.click();
}

function renderCueSuggestions(items = []) {
  if (!Array.isArray(items) || !items.length) {
    cueSuggestions.innerHTML = '暂无 Cue 建议';
    return;
  }
  cueSuggestions.innerHTML = items.map((it, i) => `<div class="task-item"><button data-cuei="${i}">使用</button> ${escapeHtml(String(it))}</div>`).join('');
  cueSuggestions.querySelectorAll('button[data-cuei]').forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.cuei);
      const text = String(items[idx] || '');
      cueInput.value = text;
      runCue(text).catch((e) => notify(`Cue 执行失败: ${e.message}`));
    };
  });
}

async function suggestCueItems() {
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');
  const path = filePathInput.value.trim() || 'untitled.txt';
  const code = editor.value.slice(0, 4000);
  const res = await api('/api/cue/suggest', {
    method: 'POST',
    body: JSON.stringify({
      ...currentProviderPayload(),
      model,
      path,
      code,
      context: buildContext(),
      options: { temperature: 0.2 }
    })
  });
  renderCueSuggestions(res.suggestions || []);
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

function renderAgentRunTrace(session) {
  if (!session || !Array.isArray(session.trace) || !session.trace.length) {
    agentRunTrace.innerHTML = '暂无自动执行记录';
    return;
  }
  agentRunTrace.innerHTML = session.trace.map((t) => {
    const rows = (t.actionResults || []).map((r) => `${r.type}:${r.status}${r.path ? ` (${r.path})` : ''}${r.command ? ` (${r.command})` : ''}`).join(' | ');
    return `<div class="task-item"><strong>Step ${t.step}</strong> - ${escapeHtml(t.summary || '')}<div>${escapeHtml(rows || '等待执行/确认')}</div></div>`;
  }).join('');
}

function renderAgentSessions(sessions = []) {
  if (!sessions.length) {
    agentSessionsEl.innerHTML = '暂无会话';
    return;
  }
  agentSessionsEl.innerHTML = sessions.map((session) => `<div class="task-item"><button data-sid="${escapeHtml(session.id)}">载入</button> <strong>${escapeHtml(session.id)}</strong> <span class="status-pill status-${escapeHtml(session.status)}">${escapeHtml(session.status)}</span> Step ${session.step}/${session.maxSteps}<div>${escapeHtml(session.goal || '')}</div></div>`).join('');
  agentSessionsEl.querySelectorAll('button[data-sid]').forEach((btn) => {
    btn.onclick = () => {
      agentSessionIdInput.value = btn.dataset.sid;
      loadAgentSession(btn.dataset.sid).catch((e) => notify(`加载会话失败: ${e.message}`));
    };
  });
}

function renderCurrentAgentSession(session) {
  currentAgentSession = session || null;
  if (!session) {
    agentSummary.textContent = '暂无 Agent 结果';
    latestAgent = null;
    renderAgentActions();
    renderAgentRunTrace(null);
    return;
  }
  agentSessionIdInput.value = session.id || '';
  agentSummary.textContent = `会话 ${session.id}
状态: ${session.status} · Step ${session.step}/${session.maxSteps}${session.done ? ' · 已完成' : ''}
${session.summary || ''}`;
  latestAgent = { next_actions: session.pendingActions || [], summary: session.summary || '', done: session.done };
  renderAgentActions();
  renderAgentRunTrace(session);
}

async function refreshAgentSessions() {
  const data = await api('/api/agent/sessions');
  renderAgentSessions(data.sessions || []);
}

async function loadAgentSession(sessionId) {
  if (!sessionId) return;
  const data = await api(`/api/agent/session?id=${encodeURIComponent(sessionId)}`);
  renderCurrentAgentSession(data.session || null);
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
      ...currentProviderPayload(),
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


async function runAgentAuto() {
  const goal = goalInput.value.trim();
  const model = modelSelect.value;
  if (!goal) return alert('请先输入 Agent 目标');
  if (!model) return alert('请先选择模型');
  const context = [
    `当前文件: ${filePathInput.value || 'untitled.txt'}`,
    `当前代码:
${editor.value.slice(0, 3000)}`,
    `任务计划:
${taskPlan.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`
  ].join('\n\n');
  const session = await api('/api/agent/run', {
    method: 'POST',
    body: JSON.stringify({
      ...currentProviderPayload(),
      model,
      goal,
      context,
      maxSteps: Number(agentMaxSteps.value || 3),
      allowWrite: Boolean(agentAllowWrite.checked),
      allowTerminal: Boolean(agentAllowTerminal.checked),
      options: { temperature: Number(settings.temperature || 0.2) }
    })
  });
  renderAgentRunTrace(session);
  notify(`Agent 自动执行完成：${session.trace?.length || 0} 步`);
  await loadTree();
}


async function startAgentSession() {
  const goal = goalInput.value.trim();
  const model = modelSelect.value;
  if (!goal) return alert('请先输入 Agent 目标');
  if (!model) return alert('请先选择模型');
  const context = [
    `当前文件: ${filePathInput.value || 'untitled.txt'}`,
    `当前代码:
${editor.value.slice(0, 3000)}`,
    `任务计划:
${taskPlan.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`
  ].join('\n\n');

  const res = await api('/api/agent/session/start', {
    method: 'POST',
    body: JSON.stringify({
      ...currentProviderPayload(),
      model,
      goal,
      context,
      maxSteps: Number(agentMaxSteps.value || 3),
      allowWrite: Boolean(agentAllowWrite.checked),
      allowTerminal: Boolean(agentAllowTerminal.checked),
      requireApproval: Boolean(agentRequireApproval.checked),
      options: { temperature: Number(settings.temperature || 0.2) }
    })
  });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
}

async function nextAgentSessionStep() {
  const sessionId = agentSessionIdInput.value.trim();
  if (!sessionId) return alert('请先选择或输入 session id');
  const res = await api('/api/agent/session/next', { method: 'POST', body: JSON.stringify({ sessionId }) });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
}

async function autoAdvanceAgentSession() {
  const sessionId = agentSessionIdInput.value.trim();
  if (!sessionId) return alert('请先选择或输入 session id');
  const res = await api('/api/agent/session/auto', { method: 'POST', body: JSON.stringify({ sessionId, maxIterations: 4 }) });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
  await loadTree();
}

async function approveAgentSessionStep() {
  const sessionId = agentSessionIdInput.value.trim();
  if (!sessionId) return alert('请先选择或输入 session id');
  const selectedIndexes = [];
  agentActionsEl.querySelectorAll('input[type="checkbox"][data-i]').forEach((c) => {
    if (c.checked) selectedIndexes.push(Number(c.dataset.i));
  });
  const res = await api('/api/agent/session/approve', { method: 'POST', body: JSON.stringify({ sessionId, selectedIndexes }) });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
  await loadTree();
}

async function rejectAgentSessionStep() {
  const sessionId = agentSessionIdInput.value.trim();
  if (!sessionId) return alert('请先选择或输入 session id');
  const res = await api('/api/agent/session/reject', { method: 'POST', body: JSON.stringify({ sessionId }) });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
}

async function stopAgentSession() {
  const sessionId = agentSessionIdInput.value.trim();
  if (!sessionId) return alert('请先选择或输入 session id');
  const res = await api('/api/agent/session/stop', { method: 'POST', body: JSON.stringify({ sessionId }) });
  renderCurrentAgentSession(res.session || null);
  await refreshAgentSessions();
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
      pushProblem('terminal', e.message);
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
  await performGlobalSearch(q);
};

planTaskBtn.onclick = async () => {
  const goal = goalInput.value.trim();
  const model = modelSelect.value;
  if (!goal) return alert('请先输入任务目标');
  if (!model) return alert('请先选择模型');
  try {
    const res = await api('/api/plan', {
      method: 'POST',
      body: JSON.stringify({ ...currentProviderPayload(), model, goal, options: { temperature: Number(settings.temperature || 0.2) } })
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
openGit.onclick = () => setRightPaneTab('gitPanel');
refreshGit.onclick = async () => {
  try {
    const status = await api('/api/git/status');
    const diff = await api('/api/git/diff');
    gitOutput.textContent = `# status\n${status.output}\n\n# diff\n${diff.output || '(no diff)'}`;
  } catch (e) {
    gitOutput.textContent = e.message;
    pushProblem('git', e.message);
  }
};


diagnoseTerminalErrorBtn.onclick = async () => {
  if (!latestTerminalError) return alert('当前没有可诊断的错误输出');
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');
  const res = await api('/api/diagnose-error', {
    method: 'POST',
    body: JSON.stringify({ ...currentProviderPayload(), model, stderr: latestTerminalError, command: terminalCommand.value.trim(), options: { temperature: 0.1 } })
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


async function runSoloModeWithPrompt({ model, cleanPrompt, context, currentPath, currentCode }) {
  const goal = cleanPrompt || '请分析并改进当前文件';
  const soloContext = `当前文件: ${currentPath}\n\n当前代码:\n${currentCode.slice(0, 5000)}\n\n上下文:\n${context}`;

  const started = await api('/api/agent/session/start', {
    method: 'POST',
    body: JSON.stringify({
      ...currentProviderPayload(),
      model,
      goal,
      context: soloContext,
      maxSteps: Number(soloMaxSteps.value || settings.soloMaxSteps || 3),
      allowWrite: true,
      allowTerminal: false,
      requireApproval: true,
      options: { temperature: Number(settings.temperature || 0.2) }
    })
  });

  const session = started.session;
  renderCurrentAgentSession(session || null);
  if (session?.id && session?.status !== 'waiting_approval' && !session?.done) {
    const advanced = await api('/api/agent/session/auto', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, maxIterations: Number(soloMaxSteps.value || 3) })
    });
    renderCurrentAgentSession(advanced.session || session);
  }
  await refreshAgentSessions();
  setRightPaneTab('agentSection');
  notify('Solo 模式：已进入 Agent 会话执行');
}

askAIBtn.onclick = async () => {
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');
  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return alert('请先输入你的需求');
  const currentPath = filePathInput.value.trim() || 'untitled.txt';
  const currentCode = editor.value;
  const { mentions, mentionContext, cleanPrompt } = await buildContextWithMentions(userPrompt);
  const context = [buildContext(), mentionContext].filter(Boolean).join('\n\n');
  const mentionTip = mentions.length ? `\n\nMentions: ${mentions.join(', ')}` : '';
  addMessage('user', `${cleanPrompt}${mentionTip}\n\n${context}`);
  askAIBtn.disabled = true;
  try {
    if (settings.soloMode) {
      await runSoloModeWithPrompt({ model, cleanPrompt, context, currentPath, currentCode });
      return;
    }

    const workflow = getWorkflowProfile(settings.workflowMode);
    const result = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        ...currentProviderPayload(),
        model,
        options: { temperature: Number(workflow.temp ?? settings.temperature ?? 0.2) },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `文件路径: ${currentPath}\n\n当前代码:\n${currentCode}\n\n需求:\n${cleanPrompt}\n\n上下文:\n${context}` }
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
    pushProblem('chat', e.message);
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
  { name: '切换到资源管理器', run: () => leftSidebarTabs.querySelector('button[data-side-tab="explorerPane"]')?.click() },
  { name: '切换到搜索面板', run: () => leftSidebarTabs.querySelector('button[data-side-tab="searchPane"]')?.click() },
  { name: 'AI生成计划', run: () => planTaskBtn.click() },
  { name: '执行任务计划', run: () => executeTaskBtn.click() },
  { name: 'Agent 下一步', run: () => agentStepBtn.click() },
  { name: '应用 Agent 动作', run: () => agentApplyBtn.click() },
  { name: 'Agent 自动执行N步', run: () => agentRunBtn.click() },
  { name: 'Agent 会话: 开始', run: () => agentSessionStartBtn.click() },
  { name: 'Agent 会话: 下一步', run: () => agentSessionNextBtn.click() },
  { name: 'Agent 会话: 自动推进', run: () => agentSessionAutoBtn.click() },
  { name: '解析多文件建议', run: () => parseMultiFileBtn.click() },
  { name: '批量应用多文件建议', run: () => applyMultiFileBtn.click() },
  { name: '切换终端', run: () => toggleTerminalBtn.click() },
  { name: '打开Git面板', run: () => openGit.click() },
  { name: '打开Problems', run: () => setRightPaneTab('problemsPanel') },
  { name: '请求AI建议', run: () => askAIBtn.click() },
  { name: 'Cue: 解释当前代码', run: () => runCue(cuePromptTemplates.explain) },
  { name: 'Cue: 修复当前问题', run: () => runCue(cuePromptTemplates.fix) },
  { name: '打开设置', run: () => openSettingsBtn.click() },
  { name: '切换 Solo 模式', run: () => { soloModeToggle.click(); } },
  { name: '工作流: Hybrid', run: () => workflowBar?.querySelector('button[data-workflow-mode="hybrid"]')?.click() },
  { name: '工作流: Trae 快速探索', run: () => workflowBar?.querySelector('button[data-workflow-mode="trae"]')?.click() },
  { name: '工作流: Cline 稳健执行', run: () => workflowBar?.querySelector('button[data-workflow-mode="cline"]')?.click() },
  { name: '切换紧凑布局', run: () => { settings.uiDensity = settings.uiDensity === 'compact' ? 'comfortable' : 'compact'; persistSettings(); } },
  { name: '右侧切到 Cue', run: () => setRightPaneTab('cueSection') },
  { name: '右侧切到 Agent', run: () => setRightPaneTab('agentSection') },
  { name: '右侧切到 Chat', run: () => setRightPaneTab('chatSection') },
  { name: '切换搜索结果面板', run: () => editorQuickToggles?.querySelector('button[data-editor-section-toggle="searchResults"]')?.click() },
  { name: '切换任务规划面板', run: () => editorQuickToggles?.querySelector('button[data-editor-section-toggle="taskPanel"]')?.click() },
  { name: '切换补丁预览面板', run: () => editorQuickToggles?.querySelector('button[data-editor-section-toggle="diffPanel"]')?.click() },
  { name: '切换多文件改动面板', run: () => editorQuickToggles?.querySelector('button[data-editor-section-toggle="batchPanel"]')?.click() },
  { name: '提示词: 套用模板', run: () => applyPromptPresetBtn?.click() },
  { name: '提示词: 智能优化', run: () => improvePromptBtn?.click() },
  { name: '聊天: 清空记录', run: () => clearChatBtn?.click() },
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
  localStorage.setItem('provider', settings.provider);
  localStorage.setItem('providerBaseUrl', settings.providerBaseUrl);
  localStorage.setItem('providerApiKey', settings.providerApiKey);
  localStorage.setItem('soloMode', String(settings.soloMode));
  localStorage.setItem('soloMaxSteps', String(settings.soloMaxSteps));
  localStorage.setItem('uiDensity', settings.uiDensity);
  localStorage.setItem('autoSave', String(settings.autoSave));
  localStorage.setItem('showLineNumbers', String(settings.showLineNumbers));
  localStorage.setItem('editorFontSize', String(settings.editorFontSize));
  localStorage.setItem('editorTabSize', String(settings.editorTabSize));
  localStorage.setItem('wordWrap', String(settings.wordWrap));
  localStorage.setItem('workflowMode', settings.workflowMode || 'hybrid');
  temperatureInput.value = String(settings.temperature);
  systemPromptInput.value = settings.systemPrompt;
  providerSelect.value = settings.provider;
  providerBaseUrl.value = settings.providerBaseUrl;
  providerApiKey.value = settings.providerApiKey;
  soloModeToggle.checked = Boolean(settings.soloMode);
  soloMaxSteps.value = String(settings.soloMaxSteps || 3);
  soloModeBanner.classList.toggle('hidden', !settings.soloMode);
  uiDensity.value = settings.uiDensity || 'comfortable';
  autoSave.checked = Boolean(settings.autoSave);
  showLineNumbers.checked = Boolean(settings.showLineNumbers);
  editorFontSize.value = String(settings.editorFontSize || 14);
  editorTabSize.value = String(settings.editorTabSize || 2);
  wordWrap.checked = Boolean(settings.wordWrap);
  applyEditorPreferences();
  applyWorkflowToControls(getWorkflowProfile(settings.workflowMode));
}
openSettingsBtn.onclick = () => {
  settingsModal.classList.remove('hidden');
  persistSettings();
};
closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
settingsTabs.querySelectorAll('button[data-settings-tab]').forEach((btn) => {
  btn.onclick = () => {
    const id = btn.dataset.settingsTab;
    document.querySelectorAll('.settings-section').forEach((sec) => sec.classList.toggle('hidden', sec.id !== id));
    settingsTabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
  };
});
providerSelect.onchange = () => { settings.provider = providerSelect.value; persistSettings(); loadModels().catch((e) => notify(`加载模型失败: ${e.message}`)); };
soloModeToggle.onchange = () => { settings.soloMode = soloModeToggle.checked; persistSettings(); };
soloMaxSteps.onchange = () => { settings.soloMaxSteps = Math.min(8, Math.max(1, Number(soloMaxSteps.value || 3))); persistSettings(); };
saveSettingsBtn.onclick = () => {
  settings.temperature = Number(temperatureInput.value || 0.2);
  settings.systemPrompt = systemPromptInput.value.trim() || settings.systemPrompt;
  settings.provider = providerSelect.value || settings.provider;
  settings.providerBaseUrl = providerBaseUrl.value.trim();
  settings.providerApiKey = providerApiKey.value.trim();
  settings.uiDensity = uiDensity.value || 'comfortable';
  settings.autoSave = Boolean(autoSave.checked);
  settings.showLineNumbers = Boolean(showLineNumbers.checked);
  settings.editorFontSize = Math.min(24, Math.max(12, Number(editorFontSize.value || 14)));
  settings.editorTabSize = Math.min(8, Math.max(2, Number(editorTabSize.value || 2)));
  settings.wordWrap = Boolean(wordWrap.checked);
  persistSettings();
  settingsModal.classList.add('hidden');
};

findNextBtn.onclick = findNext;
replaceOneBtn.onclick = replaceOne;
replaceAllBtn.onclick = replaceAll;
closeFindBtn.onclick = () => findPanel.classList.add('hidden');
agentStepBtn.onclick = () => runAgentStep().catch((e) => alert(`Agent 执行失败: ${e.message}`));
agentApplyBtn.onclick = () => applyAgentActions().catch((e) => alert(`应用 Agent 动作失败: ${e.message}`));
agentRunBtn.onclick = () => runAgentAuto().catch((e) => notify(`Agent 自动执行失败: ${e.message}`));
agentSessionStartBtn.onclick = () => startAgentSession().catch((e) => notify(`Agent 会话启动失败: ${e.message}`));
agentSessionNextBtn.onclick = () => nextAgentSessionStep().catch((e) => notify(`Agent 会话继续失败: ${e.message}`));
agentSessionAutoBtn.onclick = () => autoAdvanceAgentSession().catch((e) => notify(`会话自动推进失败: ${e.message}`));
agentSessionApproveBtn.onclick = () => approveAgentSessionStep().catch((e) => notify(`批准动作失败: ${e.message}`));
agentSessionRejectBtn.onclick = () => rejectAgentSessionStep().catch((e) => notify(`拒绝动作失败: ${e.message}`));
agentSessionStopBtn.onclick = () => stopAgentSession().catch((e) => notify(`停止会话失败: ${e.message}`));
agentSessionRefreshBtn.onclick = () => refreshAgentSessions().catch((e) => notify(`刷新会话失败: ${e.message}`));
clearProblemsBtn.onclick = () => { problems.length = 0; renderProblems(); };
cueTemplates.querySelectorAll('button[data-cue]').forEach((btn) => {
  btn.onclick = () => {
    const key = btn.dataset.cue;
    const text = cuePromptTemplates[key] || '';
    cueInput.value = text;
    runCue(text).catch((e) => notify(`Cue 执行失败: ${e.message}`));
  };
});
runCueBtn.onclick = () => runCue(cueInput.value).catch((e) => notify(`Cue 执行失败: ${e.message}`));
suggestCueBtn.onclick = () => suggestCueItems().catch((e) => notify(`Cue 建议生成失败: ${e.message}`));
rightPaneTabs.querySelectorAll('button[data-right-tab]').forEach((btn) => {
  btn.onclick = () => setRightPaneTab(btn.dataset.rightTab);
});
mentionQuickActions.querySelectorAll('button[data-mention]').forEach((btn) => {
  btn.onclick = () => {
    const token = btn.dataset.mention || '';
    const spacer = promptInput.value.trim() ? ' ' : '';
    promptInput.value = `${promptInput.value}${spacer}${token}`;
    promptInput.focus();
    renderMentionPreview(parseMentions(promptInput.value));
  };
});
promptInput.addEventListener('input', () => renderMentionPreview(parseMentions(promptInput.value)));
applyPromptPresetBtn.onclick = () => {
  const preset = promptPreset.value || 'default';
  const base = promptPresetTemplates[preset] || promptPresetTemplates.default;
  promptInput.value = [promptInput.value.trim(), base].filter(Boolean).join('\n\n');
  promptInput.focus();
  renderMentionPreview(parseMentions(promptInput.value));
};
improvePromptBtn.onclick = () => {
  const improved = buildPromptQualityHint(promptInput.value);
  if (!improved) return notify('请先输入提示词');
  promptInput.value = improved;
  promptInput.focus();
  renderMentionPreview(parseMentions(promptInput.value));
  notify('已优化提示词结构（目标/约束/验收/输出）');
};
clearChatBtn.onclick = () => {
  if (!confirm('确认清空当前聊天记录？')) return;
  messagesEl.innerHTML = '';
  latestAssistantRaw = '';
  latestSuggestedCode = '';
  diffPreview.textContent = '暂无差异';
  notify('聊天记录已清空');
};

sidebarSearchBtn.onclick = () => performGlobalSearch(sidebarSearchInput.value).catch((e) => notify(`搜索失败: ${e.message}`));
sidebarSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sidebarSearchBtn.click(); });
bindSidebarTabs();
bindWorkflowMode();
bindEditorSectionToggles();

editor.addEventListener('input', () => {
  markDirty(true);
  updateLineNumbers();
  if (settings.autoSave) {
    clearTimeout(editor._autosaveTimer);
    editor._autosaveTimer = setTimeout(() => {
      if (!dirty) return;
      if (!filePathInput.value.trim()) return;
      saveFileBtn.click();
      notify('自动保存完成');
    }, 1200);
  }
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
      body: JSON.stringify({ ...currentProviderPayload(), model, code: editor.value, cursorContext: before, options: { temperature: 0.1 } })
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



const panelState = JSON.parse(localStorage.getItem('panelState') || '{}');
document.querySelectorAll('.panel-toggle').forEach((btn) => {
  const target = document.getElementById(btn.dataset.target);
  if (!target) return;
  const hidden = Boolean(panelState[btn.dataset.target]);
  if (hidden) target.classList.add('hidden');
  btn.textContent = target.classList.contains('hidden') ? '展开' : '折叠';
  btn.onclick = () => {
    target.classList.toggle('hidden');
    btn.textContent = target.classList.contains('hidden') ? '展开' : '折叠';
    panelState[btn.dataset.target] = target.classList.contains('hidden');
    localStorage.setItem('panelState', JSON.stringify(panelState));
  };
});

const savedLayout = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
if (savedLayout.left && savedLayout.right) {
  layoutMain.dataset.right = String(savedLayout.right);
  layoutMain.style.gridTemplateColumns = `${savedLayout.left}px 6px 1fr 6px ${savedLayout.right}px`;
}

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
      localStorage.setItem('layoutPrefs', JSON.stringify({ left, right: Number(right) }));
    } else {
      const right = Math.max(320, Math.min(rect.right - e.clientX, rect.width - 340));
      layoutMain.dataset.right = String(right);
      const left = layoutMain.style.gridTemplateColumns.split(' ')[0] || '280px';
      layoutMain.style.gridTemplateColumns = `${left} 6px 1fr 6px ${right}px`;
      const leftNum = Number.parseInt(String(left).replace('px', ''), 10) || 280;
      localStorage.setItem('layoutPrefs', JSON.stringify({ left: leftNum, right }));
    }
  });
}

bindSplitter(leftSplitter);
bindSplitter(rightSplitter);

refreshModelsBtn.onclick = () => {
  settings.provider = providerSelect.value || settings.provider;
  settings.providerBaseUrl = providerBaseUrl.value.trim();
  settings.providerApiKey = providerApiKey.value.trim();
  settings.uiDensity = uiDensity.value || 'comfortable';
  settings.autoSave = Boolean(autoSave.checked);
  settings.showLineNumbers = Boolean(showLineNumbers.checked);
  settings.editorFontSize = Math.min(24, Math.max(12, Number(editorFontSize.value || 14)));
  settings.editorTabSize = Math.min(8, Math.max(2, Number(editorTabSize.value || 2)));
  settings.wordWrap = Boolean(wordWrap.checked);
  persistSettings();
  loadModels().catch((e) => notify(`加载模型失败: ${e.message}`));
};

loadTree().catch((e) => notify(`加载文件树失败: ${e.message}`));
loadProviders().then(() => loadModels()).catch((e) => notify(`加载模型失败: ${e.message}`));
persistSettings();
renderTaskPlan();
renderMultiFileList();
renderAgentActions();
renderAgentRunTrace(null);
refreshAgentSessions().catch((e) => notify(`刷新会话失败: ${e.message}`));
renderTerminalTabs();
setInlineSuggestion('');
updateLineNumbers();
const savedRightTab = localStorage.getItem('rightPaneTab') || 'chatSection';
setRightPaneTab(savedRightTab);
renderProblems();
renderMentionPreview(parseMentions(promptInput.value));
updateStatusBar();
