---
description: "Scan project structure and generate token-lean architecture codemaps (file paths + signatures, not full code)."
argument-hint: "[path] (default: repo root)"
---

<!-- pattern from affaan-m/ecc commands/update-codemaps.md (MIT) — ported to MultiAgentOS conventions -->

# Update Codemaps

Analyze the codebase structure and generate token-lean architecture documentation. This complements — but is distinct from — `mas-context-manager`: codemaps are durable, hand-readable architecture maps checked into `docs/`, whereas a context pack is a ≤4k-token runtime injection cached under `data/context-packs/<projectId>.md`. Build codemaps for structure; build a context pack for a mission.

## Step 1: Scan Project Structure

1. Identify the project type (monorepo, single app, library, microservice). MultiAgentOS itself is a pnpm monorepo: `apps/web`, `apps/worker`, `packages/*`.
2. Find all source directories (`src/`, `lib/`, `app/`, `packages/`).
3. Map entry points (`main.ts`, `index.ts`, `app.py`, `main.go`, etc.).

## Step 2: Generate Codemaps

Create or update codemaps in `docs/CODEMAPS/`:

| File | Contents |
|------|----------|
| `architecture.md` | High-level system diagram, service boundaries, data flow |
| `backend.md` | API routes / worker jobs, service → repository mapping |
| `frontend.md` | Page tree, component hierarchy, state flow |
| `data.md` | Database tables, relationships, migration history |
| `dependencies.md` | External services, third-party integrations, shared libraries |

### Codemap Format

Each codemap is token-lean — optimized for AI context consumption:

```markdown
# Backend Architecture

## Routes / Jobs
POST /api/missions → MissionController.create → MissionService.create → MissionRepo.insert
worker: runDispatchTick → dispatcher → agent → diff → review gate

## Key Files
packages/core/src/mission.ts (domain logic)
packages/db/src/schema.ts (Drizzle schema)

## Dependencies
- SQLite via Drizzle (data/mas.db)
- @anthropic-ai/claude-agent-sdk (single LLM injection point: packages/core/src/llm.ts)
```

## Step 3: Diff Detection

1. If previous codemaps exist, calculate the diff percentage.
2. If changes > 30%, show the diff and request user approval before overwriting.
3. If changes <= 30%, update in place.

## Step 4: Add Metadata

Add a freshness header to each codemap:

```markdown
<!-- Generated: 2026-06-19 | Files scanned: 142 | Token estimate: ~800 -->
```

## Step 5: Save Analysis Report

Write a summary under `docs/CODEMAPS/` (or `.reports/codemap-diff.txt` if that convention already exists in the project):
- Files added/removed/modified since the last scan
- New dependencies detected
- Architecture changes (new routes, new services, etc.)
- Staleness warnings for codemaps not updated in 90+ days

## Tips

- Focus on **high-level structure**, not implementation details.
- Prefer **file paths and signatures** over full code blocks.
- Keep each codemap under **1000 tokens** for efficient context loading (CLAUDE.md §6).
- Use ASCII diagrams for data flow instead of verbose prose.
- Run after major feature additions or refactoring sessions.
