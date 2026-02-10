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

let latestSuggestedCode = '';

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function renderTree(nodes, container) {
  container.innerHTML = '';
  nodes.forEach((node) => {
    const row = document.createElement('div');
    row.className = 'tree-item';
    if (node.type === 'dir') {
      row.textContent = `📁 ${node.name}`;
      container.appendChild(row);
      renderTree(node.children, row);
    } else {
      row.classList.add('tree-file');
      row.textContent = `📄 ${node.name}`;
      row.onclick = async () => {
        const file = await api(`/api/file?path=${encodeURIComponent(node.path)}`);
        filePathInput.value = file.path;
        editor.value = file.content;
      };
      container.appendChild(row);
    }
  });
}

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = role === 'assistant' ? marked.parse(content) : content;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function loadTree() {
  const data = await api('/api/tree');
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
  await api('/api/file', {
    method: 'POST',
    body: JSON.stringify({ path, content: editor.value }),
  });
  await loadTree();
  alert('已保存');
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
};

applyAIBtn.onclick = () => {
  if (!latestSuggestedCode) {
    alert('还没有可应用的代码，请先点击“让 AI 生成修改建议”');
    return;
  }
  editor.value = latestSuggestedCode;
};

refreshModelsBtn.onclick = loadModels;

loadTree().catch((e) => alert(`加载文件树失败: ${e.message}`));
loadModels().catch((e) => alert(`加载模型失败: ${e.message}`));
