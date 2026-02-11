function normalizeProvider(provider = 'ollama') {
  const p = String(provider || 'ollama').toLowerCase();
  if (['ollama', 'openai', 'openai-compatible', 'openai_compatible'].includes(p)) {
    return p === 'openai' ? 'openai-compatible' : p;
  }
  return 'ollama';
}

async function chatWithProvider({ provider = 'ollama', model, messages, options = {}, providerConfig = {}, ollamaBaseUrl }) {
  const normalized = normalizeProvider(provider);

  if (normalized === 'ollama') {
    const baseUrl = providerConfig.baseUrl || ollamaBaseUrl;
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

async function listModelsByProvider({ provider = 'ollama', providerConfig = {}, ollamaBaseUrl }) {
  const normalized = normalizeProvider(provider);
  if (normalized === 'ollama') {
    const baseUrl = providerConfig.baseUrl || ollamaBaseUrl;
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

module.exports = {
  normalizeProvider,
  chatWithProvider,
  listModelsByProvider
};
