const { parseAgentResponse } = require('./schema');
const { executeAgentActions } = require('./executor');

const MAX_AGENT_STEPS = 12;
const MAX_AGENT_CONTEXT = 7000;

function buildAgentSystemPrompt() {
  return [
    '你是 IDE 内的 AI Agent。',
    '严格返回 JSON，不要 markdown。',
    '格式：{"summary":"...","next_actions":[{"type":"edit|terminal|ask_user","path":"...","content":"...","command":"...","cwd":".","reason":"..."}],"done":false}',
    '行为规范：',
    '1) 修改代码时，edit.content 必须是完整文件内容。',
    '2) terminal 只在必要时使用，优先给出可复现、最小化命令。',
    '3) 不确定时输出 ask_user。',
    '4) 每步尽量小，保证可验证与可回滚。'
  ].join('\n');
}

async function runSingleAgentStep({ model, goal, context = '', options = {}, provider = 'ollama', providerConfig = {}, chatWithProvider }) {
  const response = await chatWithProvider({
    model,
    options,
    provider,
    providerConfig,
    messages: [
      { role: 'system', content: buildAgentSystemPrompt() },
      {
        role: 'user',
        content: `目标:\n${goal}\n\n当前上下文:\n${String(context).slice(0, MAX_AGENT_CONTEXT)}`
      }
    ]
  });

  const raw = response?.message?.content || '{}';
  return { parsed: parseAgentResponse(raw), raw };
}

function createAgentSession(data = {}) {
  const maxSteps = Math.min(MAX_AGENT_STEPS, Math.max(1, Number(data.maxSteps || 4)));
  const now = new Date().toISOString();
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    model: data.model,
    goal: String(data.goal || '').trim(),
    baseContext: String(data.context || '').slice(0, MAX_AGENT_CONTEXT),
    provider: data.provider || 'ollama',
    providerConfig: data.providerConfig || {},
    options: data.options || {},
    allowWrite: Boolean(data.allowWrite),
    allowTerminal: Boolean(data.allowTerminal),
    requireApproval: data.requireApproval !== false,
    maxSteps,
    step: 0,
    status: 'running',
    done: false,
    createdAt: now,
    updatedAt: now,
    pendingStep: null,
    pendingActions: [],
    trace: [],
    summary: 'Session created'
  };
}

function toHistoryForPrompt(session) {
  const compact = session.trace.slice(-5).map((t) => ({
    step: t.step,
    summary: t.summary || '',
    actions: (t.actions || []).map((a) => ({ type: a.type, path: a.path, command: a.command, reason: a.reason })),
    actionResults: (t.actionResults || []).map((r) => ({ type: r.type, status: r.status, path: r.path, command: r.command, error: r.error }))
  }));
  return JSON.stringify(compact).slice(0, MAX_AGENT_CONTEXT);
}

async function generateAgentStepForSession(session, deps = {}) {
  const { chatWithProvider, saveFile, runTerminal } = deps;

  if (session.done || session.status === 'stopped') return session;
  if (session.step >= session.maxSteps) {
    session.done = true;
    session.status = 'completed';
    session.summary = `Reached max steps (${session.maxSteps})`;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  const context = [
    session.baseContext,
    `会话历史(最近5步): ${toHistoryForPrompt(session)}`
  ].filter(Boolean).join('\n\n').slice(0, MAX_AGENT_CONTEXT);

  const { parsed, raw } = await runSingleAgentStep({
    model: session.model,
    goal: session.goal,
    context,
    options: session.options || {},
    provider: session.provider || 'ollama',
    providerConfig: session.providerConfig || {},
    chatWithProvider
  });

  session.step += 1;
  session.pendingStep = session.step;
  session.pendingActions = Array.isArray(parsed.next_actions) ? parsed.next_actions : [];
  session.summary = parsed.summary || '';
  session.trace.push({
    step: session.step,
    summary: parsed.summary || '',
    actions: session.pendingActions,
    actionResults: [],
    done: Boolean(parsed.done),
    raw: String(raw).slice(0, 1400)
  });

  const hasExecutableActions = session.pendingActions.some((a) => a.type === 'edit' || a.type === 'terminal');
  if (session.requireApproval && hasExecutableActions) {
    session.status = 'waiting_approval';
  } else {
    const actionResults = await executeAgentActions(session.pendingActions, {
      allowWrite: session.allowWrite,
      allowTerminal: session.allowTerminal,
      saveFile,
      runTerminal
    });
    session.trace[session.trace.length - 1].actionResults = actionResults;
    session.pendingActions = [];
    session.pendingStep = null;
    session.status = parsed.done ? 'completed' : 'running';
  }

  if (parsed.done) {
    session.done = true;
    session.status = 'completed';
    session.pendingActions = [];
    session.pendingStep = null;
  }

  if (!session.done && session.step >= session.maxSteps && session.status !== 'waiting_approval') {
    session.done = true;
    session.status = 'completed';
    session.summary = `Reached max steps (${session.maxSteps})`;
  }

  session.updatedAt = new Date().toISOString();
  return session;
}

function compactSession(session) {
  return {
    id: session.id,
    goal: session.goal,
    model: session.model,
    provider: session.provider,
    status: session.status,
    done: session.done,
    step: session.step,
    maxSteps: session.maxSteps,
    requireApproval: session.requireApproval,
    allowWrite: session.allowWrite,
    allowTerminal: session.allowTerminal,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    summary: session.summary,
    pendingStep: session.pendingStep,
    pendingActions: session.pendingActions,
    trace: session.trace
  };
}

module.exports = {
  MAX_AGENT_STEPS,
  MAX_AGENT_CONTEXT,
  runSingleAgentStep,
  createAgentSession,
  generateAgentStepForSession,
  compactSession,
  executeAgentActions
};
