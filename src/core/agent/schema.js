const ACTION_TYPES = new Set(['edit', 'terminal', 'ask_user']);

function sanitizeAction(action = {}) {
  const type = ACTION_TYPES.has(action.type) ? action.type : 'ask_user';
  if (type === 'edit') {
    return {
      type,
      path: String(action.path || '').trim(),
      content: typeof action.content === 'string' ? action.content : '',
      reason: String(action.reason || '')
    };
  }
  if (type === 'terminal') {
    return {
      type,
      command: String(action.command || '').trim(),
      cwd: String(action.cwd || '.').trim() || '.',
      reason: String(action.reason || '')
    };
  }
  return {
    type,
    reason: String(action.reason || '需要人工确认下一步')
  };
}

function parseAgentResponse(raw = '') {
  let parsed;
  try {
    parsed = JSON.parse(raw || '{}');
  } catch {
    parsed = {
      summary: String(raw || '').slice(0, 500),
      next_actions: [{ type: 'ask_user', reason: '模型未返回合法 JSON，请人工确认下一步。' }],
      done: false
    };
  }

  const nextActions = Array.isArray(parsed.next_actions) ? parsed.next_actions.map(sanitizeAction) : [];
  return {
    summary: String(parsed.summary || '').trim(),
    next_actions: nextActions,
    done: Boolean(parsed.done)
  };
}

module.exports = {
  parseAgentResponse,
  sanitizeAction
};
