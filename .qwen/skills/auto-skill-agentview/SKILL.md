---
name: agentview
description: Build a web server for visualizing Claude Code and Qwen Code session JSONL files. Covers JSONL path discovery, entry type parsing, and an Express + CDN-React single-file frontend architecture.
source: auto-skill
extracted_at: '2026-06-14T08:03:51.374Z'
---

# AgentView — Session JSONL Web Viewer

Build a local web server that reads and visualizes AI coding assistant session transcripts from JSONL files.

## Session File Locations

### Qwen Code
```
~/.qwen/projects/<sanitized-work-dir>/chats/<session-uuid>.jsonl
```
- `<sanitized-work-dir>` is the absolute project path with `/` replaced by `-`
  - e.g., `/home/tea/jsonl` → `-home-tea-jsonl`
- Subagents: `~/.qwen/projects/<sanitized-work-dir>/subagents/<parent-session>/agent-<Type>-<uuid>.jsonl`
- Companion `.runtime.json` files live alongside each chat JSONL with pid, work_dir, hostname, started_at, qwen_version

### Claude Code
```
~/.claude/projects/<sanitized-work-dir>/<session-uuid>.jsonl
```
- Same sanitization: `/` → `-`

## JSONL Entry Types (Qwen Code format)

Every line shares envelope fields: `uuid`, `parentUuid`, `sessionId`, `timestamp`, `type`, `cwd`, `version`.

| `type` | Key fields | UI relevance |
|---|---|---|
| `user` | `message.role: "user"`, `message.parts[].text` | Show as user bubble |
| `assistant` | `message.role: "model"`, `message.parts[]` with `text`, `thought` (bool), `functionCall` sub-parts; `usageMetadata` for tokens | Show text, collapsible thinking blocks, expandable tool call cards |
| `tool_result` | `toolCallResult` | Collapsible output |
| `system` | `subtype`: `attribution_snapshot`, `file_history_snapshot`, `ui_telemetry` | Hidden by default, toggleable |

**Why:** Claude Code and Qwen Code use slightly different JSONL schemas; the viewer must handle both. Qwen Code nests content in `message.parts[]` with `thought` flags; Claude Code uses `ContentBlock[]` arrays.

## Architecture

### Backend: Express (Node.js)

```
server.js          # Express entry point
src/
  scanner.js       # Scan ~/.claude/projects/ and ~/.qwen/projects/ for JSONL files
  parser.js        # Stream JSONL with readline, return paginated lines
```

**Endpoints:**

| Endpoint | Purpose |
|---|---|
| `GET /api/sessions` | List all sessions from both sources. Returns `{id, source, project, timestamp, firstMessage, messageCount}` |
| `GET /api/sessions/:source/:project/:sessionId?offset=0&limit=200` | Paginated JSONL lines in `{lines: [...], hasMore: bool}` |
| `GET /api/sessions/:source/:project/:sessionId/info` | Metadata: first user message, model, token stats, duration |

**Key design decisions:**
- Use `readline` for streaming reads — never load a full JSONL into memory
- `source` is `"claude"` or `"qwen"`; `project` is the sanitized directory name
- Scanner does a single metadata-first pass (first user message, message count, ongoing state) to build session listings without reading entire files

### Frontend: Single-file React SPA

- **No build step.** React 18 + Babel standalone from CDN.
- **Dark monochromatic theme:** `#1f2228` background, white-on-transparency layers, sharp corners (`0px` radius), monospace typography.
- **Three-panel layout:**
  - Left sidebar (260px): session list grouped by source, with search
  - Center: chat view with message rendering
  - Right: optional outline/anchors
- **Message rendering:**
  - User messages: right-aligned bubble
  - Assistant text: left-aligned, code blocks in `<pre>` with dark backgrounds
  - Thinking blocks: collapsible, muted style (detected via `thought: true` in Qwen)
  - Tool calls: expandable cards showing function name + args
  - System events: hidden by default (filtered from view unless toggled)

**How to apply:** Use this architecture when building any session viewer for AI coding assistants. The two-source scanning pattern (`~/.claude/` + `~/.qwen/`) and the CDN-React frontend approach minimize dependencies and deployment complexity.