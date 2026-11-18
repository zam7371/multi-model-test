#!/usr/bin/env node
// Appends one JSON line per hook event to .claude/logs/events.jsonl
// Used by viewer/index.html to draw the multi-model timeline.
const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  try {
    const p = JSON.parse(raw || '{}');
    const root = process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd();
    const ti = p.tool_input || {};
    const agent = ti.subagent_type || p.agent_type || null;

    // Resolve the model from the agent's frontmatter (model: haiku/opus/...)
    let model = null;
    if (agent) {
      try {
        const f = fs.readFileSync(path.join(root, '.claude', 'agents', agent + '.md'), 'utf8');
        const m = f.match(/^model:\s*(\S+)/m);
        if (m) model = m[1];
      } catch (_) {}
    }

    const clip = (s, n) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').slice(0, n) : null);
    const ev = {
      ts: Date.now(),
      event: p.hook_event_name || null,
      session: p.session_id || null,
      tool: p.tool_name || null,
      tool_use_id: p.tool_use_id || null,
      agent,
      agent_id: p.agent_id || (p.tool_response && (p.tool_response.agentId || p.tool_response.agent_id)) || null,
      model,
      desc: clip(ti.description, 100),
      detail: clip(ti.command || ti.file_path || ti.pattern || ti.path || ti.url || ti.query, 80),
      prompt: p.hook_event_name === 'UserPromptSubmit' ? clip(p.prompt, 100) : null,
      error: p.tool_response && p.tool_response.is_error ? true : undefined,
    };

    const dir = path.join(root, '.claude', 'logs');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'events.jsonl'), JSON.stringify(ev) + '\n');
  } catch (_) {
    // never block Claude Code because of logging
  }
  process.exit(0);
});
