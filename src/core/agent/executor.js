async function executeAgentActions(actions, opts = {}) {
  const {
    allowWrite = false,
    allowTerminal = false,
    saveFile,
    runTerminal
  } = opts;

  const results = [];
  for (const action of actions || []) {
    if (action.type === 'edit') {
      if (allowWrite && action.path && typeof action.content === 'string') {
        await saveFile(action.path, action.content);
        results.push({ type: 'edit', path: action.path, status: 'applied' });
      } else {
        results.push({ type: 'edit', path: action.path || '', status: 'skipped' });
      }
      continue;
    }

    if (action.type === 'terminal') {
      if (allowTerminal && action.command) {
        try {
          const output = await runTerminal(action.command, action.cwd || '.');
          results.push({
            type: 'terminal',
            command: action.command,
            status: 'ran',
            output: String(output).slice(0, 1200)
          });
        } catch (error) {
          results.push({
            type: 'terminal',
            command: action.command,
            status: 'error',
            error: error.message
          });
        }
      } else {
        results.push({ type: 'terminal', command: action.command || '', status: 'skipped' });
      }
      continue;
    }

    results.push({ type: action.type || 'ask_user', reason: action.reason || '', status: 'pending_user' });
  }

  return results;
}

module.exports = {
  executeAgentActions
};
