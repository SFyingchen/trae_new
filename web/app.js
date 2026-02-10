const fileTree = document.getElementById('fileTree');
const editor = document.getElementById('editor');
const filePathInput = document.getElementById('filePath');
const saveFileBtn = document.getElementById('saveFile');
const promptInput = document.getElementById('prompt');
const askAIBtn = document.getElementById('askAI');
const applyAIBtn = document.getElementById('applyAI');
const messagesEl = document.getElementById('messages');
const modelSelect = document.getElementById('modelSelect');
const refreshModelsBtn = document.getElementById('refreshModels');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const tabsEl = document.getElementById('tabs');
const newFileBtn = document.getElementById('newFile');
const renameFileBtn = document.getElementById('renameFile');
const deleteFileBtn = document.getElementById('deleteFile');
const loadHistoryBtn = document.getElementById('loadHistory');

let latestSuggestedCode = '';
const openTabs = [];

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

function renderAssistant(content) {
  return `<pre>${escapeHtml(content)}</pre>`;
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
        try {
          const file = await api(`/api/file?path=${encodeURIComponent(node.path)}`);
          setCurrentPath(file.path);
          editor.value = file.content;
        } catch (error) {
          alert(`加载文件失败: ${error.message}`);
        }
      };
    }

    list.appendChild(row);
  });
  container.appendChild(list);
}

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = role === 'assistant' ? renderAssistant(content) : escapeHtml(content);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function loadTree() {
  const data = await api('/api/tree');
  fileTree.innerHTML = '';
  renderTree(data.tree, fileTree);
}

async function loadModels() {
  modelSelect.innerHTML = '';
  const data = await api('/api/models');
  if (!data.models.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '未检测到模型（请先 ollama pull）';
    modelSelect.appendChild(option);
    return;
  }
  data.models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
}

saveFileBtn.onclick = async () => {
  const path = filePathInput.value.trim();
  if (!path) return alert('请先输入文件路径');
  try {
    await api('/api/file', {
      method: 'POST',
      body: JSON.stringify({ path, content: editor.value }),
    });
    setCurrentPath(path);
    await loadTree();
    alert('已保存');
  } catch (error) {
    alert(`保存失败: ${error.message}`);
  }
};

newFileBtn.onclick = () => {
  const p = prompt('输入新文件路径（相对工作区）');
  if (!p) return;
  setCurrentPath(p.trim());
  editor.value = '';
};

renameFileBtn.onclick = async () => {
  const oldPath = filePathInput.value.trim();
  if (!oldPath) return alert('请先打开文件');
  const newPath = prompt('输入新文件路径', oldPath);
  if (!newPath || newPath === oldPath) return;
  try {
    await api('/api/file/rename', {
      method: 'POST',
      body: JSON.stringify({ oldPath, newPath }),
    });
    const oldIdx = openTabs.indexOf(oldPath);
    if (oldIdx >= 0) openTabs.splice(oldIdx, 1, newPath);
    setCurrentPath(newPath);
    await loadTree();
  } catch (error) {
    alert(`重命名失败: ${error.message}`);
  }
};

deleteFileBtn.onclick = async () => {
  const p = filePathInput.value.trim();
  if (!p) return alert('请先打开文件');
  if (!confirm(`确认删除 ${p} ?`)) return;
  try {
    await api('/api/file/delete', {
      method: 'POST',
      body: JSON.stringify({ path: p }),
    });
    const idx = openTabs.indexOf(p);
    if (idx >= 0) openTabs.splice(idx, 1);
    filePathInput.value = '';
    editor.value = '';
    renderTabs();
    await loadTree();
  } catch (error) {
    alert(`删除失败: ${error.message}`);
  }
};

loadHistoryBtn.onclick = async () => {
  const p = filePathInput.value.trim();
  if (!p) return alert('请先打开文件');
  try {
    const res = await api(`/api/history?path=${encodeURIComponent(p)}`);
    if (!res.snapshots.length) return alert('暂无历史版本');
    const picked = prompt(`可选历史版本（复制一个完整文件名）:\n${res.snapshots.join('\n')}`);
    if (!picked) return;
    await api('/api/history/restore', {
      method: 'POST',
      body: JSON.stringify({ path: p, snapshot: picked.trim() }),
    });
    const file = await api(`/api/file?path=${encodeURIComponent(p)}`);
    editor.value = file.content;
    alert('恢复成功');
  } catch (error) {
    alert(`历史版本操作失败: ${error.message}`);
  }
};

searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    const data = await api(`/api/search?q=${encodeURIComponent(q)}`);
    searchResults.innerHTML = data.results.map((r) => `
      <div class="result-item" data-path="${escapeHtml(r.path)}">
        <strong>${escapeHtml(r.path)}</strong>
        <div>${escapeHtml(r.snippet)}</div>
      </div>
    `).join('') || '<div class="result-item">未找到匹配</div>';

    searchResults.querySelectorAll('.result-item[data-path]').forEach((el) => {
      el.onclick = async () => {
        const p = el.getAttribute('data-path');
        const file = await api(`/api/file?path=${encodeURIComponent(p)}`);
        setCurrentPath(file.path);
        editor.value = file.content;
      };
    });
  } catch (error) {
    alert(`搜索失败: ${error.message}`);
  }
};

askAIBtn.onclick = async () => {
  const model = modelSelect.value;
  if (!model) return alert('请先选择模型');

  const userPrompt = promptInput.value.trim();
  if (!userPrompt) return alert('请先输入你的需求');

  const currentPath = filePathInput.value.trim() || 'untitled.txt';
  const currentCode = editor.value;
  addMessage('user', userPrompt);

  const systemPrompt = [
    '你是一个代码编辑助手。',
    '你必须返回两个区块：',
    '1) 先用简短中文说明修改思路。',
    '2) 然后返回 ```updated_code ...``` 代码块，里面是完整可替换文件内容。',
    '不要省略代码。',
  ].join('\n');

  askAIBtn.disabled = true;

  try {
    const result = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `文件路径: ${currentPath}\n\n当前代码:\n\n${currentCode}\n\n需求:\n${userPrompt}`,
          },
        ],
      }),
    });

    const content = result?.message?.content || '模型没有返回内容';
    addMessage('assistant', content);

    const matched = content.match(/```updated_code\n([\s\S]*?)```/);
    latestSuggestedCode = matched ? matched[1].trimEnd() : '';
  } catch (error) {
    addMessage('assistant', `请求失败：${error.message}`);
  } finally {
    askAIBtn.disabled = false;
  }
};

applyAIBtn.onclick = () => {
  if (!latestSuggestedCode) {
    alert('还没有可应用的代码，请先点击“让 AI 生成修改建议”');
    return;
  }
  editor.value = latestSuggestedCode;
};

refreshModelsBtn.onclick = () => loadModels().catch((e) => alert(`加载模型失败: ${e.message}`));

loadTree().catch((e) => alert(`加载文件树失败: ${e.message}`));
loadModels().catch((e) => alert(`加载模型失败: ${e.message}`));
