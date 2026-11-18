# multi-model-test
## Viewers

Hooks in `.claude/settings.json` log events to `.claude/logs/events.jsonl` (needs only Node, which Claude Code already requires).
Tool steps are logged with a short detail (command / file path / pattern, max 80 chars). The log stays on your machine (git-ignored).

Start the local server from the repo root:

    node viewer/server.js

- Live flow chart (updates while Claude Code works): http://localhost:8765/viewer/live.html
- Timeline of past sessions: http://localhost:8765/viewer/

Without the server you can still open `viewer/index.html` directly and pick `.claude/logs/events.jsonl`.

Notes:
- Subagent models are read from the `model:` line in each `.claude/agents/*.md` file.
- The main session is always labelled sonnet; it does not detect the model chosen with `/model`.
- For a simple question Claude usually answers alone, so only the main session lights up.
