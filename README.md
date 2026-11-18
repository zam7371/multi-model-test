# multi-model-test
## Timeline viewer

Hooks in `.claude/settings.json` log every subagent call to `.claude/logs/events.jsonl`
(needs Node, which Claude Code already requires).

View it:
- Easiest: open `viewer/index.html` in a browser, click **Pilih events.jsonl** and choose `.claude/logs/events.jsonl`.
- Or from the repo root: `python3 -m http.server 8000` then open `http://localhost:8000/viewer/`. It loads the log automatically.

Subagent models are read from the `model:` line in each `.claude/agents/*.md` file.
The "main session" bar is always labelled sonnet; it does not detect the model chosen with `/model`.
