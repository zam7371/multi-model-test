# Multi-model workflow

Main session: Sonnet writes the code (`/model sonnet`).

## Delegation rules
- Repo mapping, grep for call sites, and running tests: delegate to the `repo-crawler` subagent. Do not do these yourself.
- Call the `reviewer` subagent at exactly three points:
  1. Before the plan is locked (give it the plan).
  2. When the same error occurs twice in a row (give it the error and what was tried).
  3. Before saying "done" (it reads the final diff).
- `reviewer` never writes code. If it returns REJECT, fix and re-run the tests, then ask for review again.

## Visibility
- Before each delegation, print one line: `-> delegating to <agent>: <task>`.
- After it returns, print one line with the result.
