# Phase 3 · Skill Registry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make skills first-class citizens — index the 6 orchestrator skills with summaries + domain tags, inject summaries into agent prompts, wire the `/skills` page to real DB data with filter and promote actions.

**Architecture:** Scanner reads SKILL.md frontmatter → populates `skills` DB table + writes `data/skill-cache/<id>/summary.md`. SkillRouter provides L1 (summaries) at prompt-assembly time and L2 (full body) on demand. `/skills` page becomes a live view of the registry with promote/pin actions.

**Tech Stack:** Node.js + TypeScript, Drizzle ORM (SQLite), Next.js 15 App Router, `@mas/db`, `@mas/core`. New package: `@mas/skills`.

---

## Audit Findings — Addendum 2026-06-03

From the Phase 3 strategic resource audit (`docs/workflows/phase3-audit-report-2026-06-03.md`). Read before implementing.

### Confirmed: effort parameter values
From `docs/knowledge/anthropic-ecosystem.md` — SDK `AgentDefinition`:
```typescript
effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'
```
Mapping (from `ROADMAP.md` effort-mapping addendum):
- `eco` → `'medium'`
- `standard` → `'high'`
- `expert` → `'xhigh'`

Wire in `packages/core/src/llm.real.ts`. Verify SDK parameter name before implementing (check `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`).

### Confirmed: depth=1 absolute constraint
Subagents cannot spawn subagents. Tier C impossible. Architecture Tier A/B is the ONLY valid structure.
Source: `docs/knowledge/anthropic-ecosystem.md`

### Critical: billing change June 15, 2026
Agent SDK usage on subscription = **separate** monthly credit from Claude.ai conversations.
Agents consume ~4× quota vs normal chat. Multi-agent research = ~15×.
`budgets` table must track Agent SDK quota separately from interactive Claude.ai usage.
Source: `docs/knowledge/anthropic-ecosystem.md`

### Summaries are AUTHORED, not LLM-generated (correction 2026-06-03)
`reindex.ts` is a **deterministic scanner** — it reads the `summary:` field from each SKILL.md frontmatter (`scanner.ts:48`) and writes `data/skill-cache/<id>/summary.md`. **No LLM call.** The summary is hand-authored in the SKILL.md frontmatter per CLAUDE.md §12.5. There is no "model selection" for summary generation — that question is moot.
The `summary.md` cache format is: frontmatter `domain` + `tags`, then the summary body. No `generated_at`/`token_count`/`id` fields.
The `skills` DB schema uses `summaryPath` (pointer to cache file), `domain` enum, `tagsJson` — NOT an inline `summary` column.

### Phase 4 memory: QMD replaces custom FTS5
`tobi/qmd` (https://github.com/tobi/qmd) — Node 22 ✓, TypeScript, BM25+vector+LLM reranking, MCP server native.
Replaces the planned custom `data/memory/<projectId>/index.db` SQLite FTS5 implementation.
~2GB model download in `~/.cache/qmd/models/`. ADR 0003 required before Phase 4 starts.
Source: `docs/knowledge/memory-patterns.md`

### Phase 4 memory: prompts ready-to-use
Complete initialization prompt + close-out ritual prompt in `docs/claude doc/vrai-memoire-agent-claude.md`.
MAS path: `data/memory/<projectId>/` (not `.claude/memory/` — multi-project separation).

### Phase 5 Tier B expansion source
`msitarzewski/agency-agents` (144+ agents, Claude Code native). Extract workflow patterns for our Tier B fiches. Adapt to MAS schema (budget, escalate_when, tools≤7). No direct import.
Source: `docs/knowledge/agent-patterns.md`

### Phase 3 implementation status (verified 2026-06-03)
All tasks below are **DONE and committed** (commits `2bdb323` → `cd55386`). Verify, do not rebuild:
- [x] `packages/skills/` package exists — scanner, router, reindex, types, tests committed
- [x] `skills` DB table has `domain` enum (9 values) + `summaryPath` + `tagsJson` — migration done
- [x] `/skills` filter by domain persists via `searchParams` URL (`?domain=&q=`) — server component
- [x] `/skills` promote persists via `<form method=POST action=/api/skills/promote>` → DB
- [x] 6 `data/skill-cache/*/summary.md` generated (domain + tags frontmatter)
- [x] effort wired: `llm.real.ts:29-32` MODE_TO_EFFORT, passed to `query()` line 78
- [x] Verification Criteria present in mas-skill-router/mission-planner/sec-reviewer SKILL.md
- [x] `ANTHROPIC_API_KEY` stripped from worker env (`llm.real.ts:66`) — billing safety

**To close Phase 3** (verification only, ~5k tokens):
```bash
pnpm -w lint && pnpm -w test     # confirm green
pnpm skills:reindex              # confirm "6 skills indexed"
pnpm --filter @mas/web dev       # smoke test /skills filter+promote
```
Quality review done 2026-06-03: all 6 fiches conform to AGENTS.md §2 canonical schema (`quality_criteria` + `escalate_when` + `common_mistakes` + `budget` YAML, all ≤7 tools). All 6 SKILL.md have `## Verification Criteria` markdown. lint PASS, 28 tests green, reindex OK. **Phase 3 ready to close — ask user for "go" to Phase 3.5.**

---

**Branch:** `phase/3-skill-registry` (cut from main)

---

## File Map

### New files
| Path | Responsibility |
|------|---------------|
| `packages/skills/package.json` | Package manifest |
| `packages/skills/tsconfig.json` | TypeScript config (extends base) |
| `packages/skills/src/types.ts` | `Domain`, `SkillMeta` types |
| `packages/skills/src/scanner.ts` | Read SKILL.md frontmatter → SkillMeta |
| `packages/skills/src/router.ts` | L1/L2 progressive disclosure + prompt injection |
| `packages/skills/src/reindex.ts` | CLI script: scan → write cache → update DB |
| `packages/skills/src/index.ts` | Public exports |
| `.claude/skills/mas-mission-planner/SKILL.md` | Orchestrator skill definition |
| `.claude/skills/mas-skill-router/SKILL.md` | Orchestrator skill definition |
| `.claude/skills/mas-context-manager/SKILL.md` | Orchestrator skill definition |
| `.claude/skills/mas-memory-keeper/SKILL.md` | Orchestrator skill definition |
| `.claude/skills/mas-reviewer/SKILL.md` | Orchestrator skill definition |
| `.claude/skills/mas-sec-reviewer/SKILL.md` | Orchestrator skill definition |
| `config/skills.policy.json` | Skill tier + auto-load policy |
| `packages/db/migrations/0003_add_skill_domain.sql` | Add `domain` column to skills table |
| `apps/web/app/api/skills/route.ts` | GET skills, PATCH promote |

### Modified files
| Path | Change |
|------|--------|
| `packages/db/src/schema.ts` | Add `domain` column to skills table |
| `packages/db/migrations/meta/_journal.json` | Register migration 0003 |
| `packages/agents/src/dispatch.ts` | Inject skill summaries in executeNextTask system prompt |
| `apps/web/app/(cockpit)/skills/page.tsx` | Replace fixture → real DB + domain filter + promote action |
| `package.json` (root) | Add `skills:reindex` script |

---

## Task 1: Branch + DB migration (`domain` column on skills)

**Files:**
- Create: `packages/db/migrations/0003_add_skill_domain.sql`
- Modify: `packages/db/src/schema.ts`
- Modify: `packages/db/migrations/meta/_journal.json`

- [ ] **Step 1: Cut branch**

```bash
git checkout main && git checkout -b phase/3-skill-registry
```

- [ ] **Step 2: Add `domain` column to schema**

In `packages/db/src/schema.ts`, find the skills table definition and add the domain column:

```typescript
export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  path: text('path').notNull(),
  summaryPath: text('summary_path'),
  tagsJson: text('tags_json').notNull().default('[]'),
  domain: text('domain', {
    enum: ['research', 'code-execution', 'code-review', 'planning', 'memory', 'security', 'ux', 'writing', 'search'],
  }),
  tier: text('tier', { enum: ['pinned', 'project-pinned', 'on-demand', 'methodology'] })
    .notNull()
    .default('on-demand'),
  autoLoad: integer('auto_load', { mode: 'boolean' }).notNull().default(false),
  lastUsedAt: epoch(),
});
```

- [ ] **Step 3: Generate migration**

```bash
cd packages/db && pnpm generate
```

Expected output: `[✓] Your SQL migration file ➜ migrations/0003_*.sql 🚀`

- [ ] **Step 4: Verify migration SQL is correct**

Read the generated file. It must contain:
```sql
ALTER TABLE `skills` ADD `domain` text CHECK(`domain` IN ('research','code-execution','code-review','planning','memory','security','ux','writing','search'));
```

- [ ] **Step 5: Run lint + test**

```bash
cd ../.. && pnpm -w lint && pnpm -w test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/schema.ts packages/db/migrations/
git commit -m "feat(db): add domain column to skills table (migration 0003)"
```

---

## Task 2: `packages/skills` package scaffold

**Files:**
- Create: `packages/skills/package.json`
- Create: `packages/skills/tsconfig.json`
- Create: `packages/skills/src/types.ts`
- Create: `packages/skills/src/index.ts`

- [ ] **Step 1: Create `packages/skills/package.json`**

```json
{
  "name": "@mas/skills",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "tsc --noEmit",
    "reindex": "tsx src/reindex.ts"
  },
  "dependencies": {
    "@mas/db": "workspace:*"
  },
  "devDependencies": {
    "tsx": "catalog:",
    "typescript": "catalog:"
  }
}
```

- [ ] **Step 2: Create `packages/skills/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/skills/src/types.ts`**

```typescript
export type Domain =
  | 'research'
  | 'code-execution'
  | 'code-review'
  | 'planning'
  | 'memory'
  | 'security'
  | 'ux'
  | 'writing'
  | 'search';

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  domain: Domain;
  /** ≤200 tokens — for L1 prompt injection */
  summary: string;
  tags: string[];
  path: string;
}
```

- [ ] **Step 4: Create `packages/skills/src/index.ts`** (re-export, will grow)

```typescript
export * from './types.js';
export * from './scanner.js';
export * from './router.js';
```

- [ ] **Step 5: Install deps**

```bash
pnpm install
```

- [ ] **Step 6: Commit**

```bash
git add packages/skills/
git commit -m "feat(skills): scaffold @mas/skills package"
```

---

## Task 3: Scanner implementation

**Files:**
- Create: `packages/skills/src/scanner.ts`

- [ ] **Step 1: Write `packages/skills/src/scanner.ts`**

```typescript
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SkillMeta, Domain } from './types.js';

export const ORCHESTRATOR_SKILL_IDS = [
  'mas-mission-planner',
  'mas-skill-router',
  'mas-context-manager',
  'mas-memory-keeper',
  'mas-reviewer',
  'mas-sec-reviewer',
] as const;

/** Parse YAML frontmatter between --- markers (no external dep). */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    // Parse JSON arrays like tags: ["planning","memory"]
    if (val.startsWith('[')) {
      try { fm[key] = JSON.parse(val); } catch { fm[key] = val; }
    } else {
      // Strip surrounding quotes if present
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

export function scanOrchestratorSkills(repoRoot: string): SkillMeta[] {
  const results: SkillMeta[] = [];
  for (const id of ORCHESTRATOR_SKILL_IDS) {
    const skillPath = join(repoRoot, '.claude', 'skills', id, 'SKILL.md');
    if (!existsSync(skillPath)) {
      console.warn(`[scanner] SKILL.md not found: ${skillPath}`);
      continue;
    }
    const raw = readFileSync(skillPath, 'utf8');
    const fm = parseFrontmatter(raw);
    results.push({
      id,
      name: String(fm.name ?? id),
      description: String(fm.description ?? ''),
      domain: (fm.domain as Domain) ?? 'planning',
      summary: String(fm.summary ?? fm.description ?? '').slice(0, 1200),
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      path: skillPath,
    });
  }
  return results;
}

export function writeSummaryCache(cacheDir: string, meta: SkillMeta): void {
  const dir = join(cacheDir, meta.id);
  mkdirSync(dir, { recursive: true });
  const content = [
    '---',
    `domain: ${meta.domain}`,
    `tags: ${JSON.stringify(meta.tags)}`,
    '---',
    '',
    meta.summary,
    '',
  ].join('\n');
  writeFileSync(join(dir, 'summary.md'), content, 'utf8');
}
```

- [ ] **Step 2: Verify lint**

```bash
cd packages/skills && pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/skills/src/scanner.ts
git commit -m "feat(skills): scanner — parse SKILL.md frontmatter + write cache"
```

---

## Task 4: SkillRouter implementation

**Files:**
- Create: `packages/skills/src/router.ts`

- [ ] **Step 1: Write `packages/skills/src/router.ts`**

```typescript
import type { SkillMeta, Domain } from './types.js';

export class SkillRouter {
  private readonly skills: Map<string, SkillMeta>;

  constructor(skills: SkillMeta[]) {
    this.skills = new Map(skills.map((s) => [s.id, s]));
  }

  /** L1: summary only — for prompt assembly (cheap). */
  getSummary(id: string): string | undefined {
    return this.skills.get(id)?.summary;
  }

  /** L2: full meta — on-demand hydration. Throws if not found. */
  requireSkill(id: string): SkillMeta {
    const s = this.skills.get(id);
    if (!s) throw new Error(`[SkillRouter] skill not found: ${id}`);
    return s;
  }

  findByDomain(domain: Domain): SkillMeta[] {
    return [...this.skills.values()].filter((s) => s.domain === domain);
  }

  findByTags(tags: string[]): SkillMeta[] {
    const set = new Set(tags);
    return [...this.skills.values()].filter((s) =>
      s.tags.some((t) => set.has(t)),
    );
  }

  /**
   * Build an XML context block with skill summaries (L1).
   * Injects into agent system prompts — never full bodies.
   */
  buildPromptContext(skillIds: string[]): string {
    const blocks = skillIds
      .map((id) => {
        const meta = this.skills.get(id);
        if (!meta) return null;
        return `<skill id="${id}" domain="${meta.domain}">\n${meta.summary}\n</skill>`;
      })
      .filter((b): b is string => b !== null);
    if (blocks.length === 0) return '';
    return `<available_skills>\n${blocks.join('\n')}\n</available_skills>`;
  }

  all(): SkillMeta[] {
    return [...this.skills.values()];
  }
}
```

- [ ] **Step 2: Lint**

```bash
cd packages/skills && pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/skills/src/router.ts
git commit -m "feat(skills): SkillRouter — L1/L2 progressive disclosure + prompt injection"
```

---

## Task 5: Reindex CLI script

**Files:**
- Create: `packages/skills/src/reindex.ts`
- Modify: root `package.json` (add `skills:reindex`)

- [ ] **Step 1: Write `packages/skills/src/reindex.ts`**

```typescript
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, skills } from '@mas/db';
import { scanOrchestratorSkills, writeSummaryCache } from './scanner.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../../..');
const CACHE_DIR = resolve(REPO_ROOT, 'data', 'skill-cache');

async function main() {
  const metas = scanOrchestratorSkills(REPO_ROOT);
  if (metas.length === 0) {
    console.error('[reindex] No SKILL.md files found. Create .claude/skills/mas-*/SKILL.md first.');
    process.exit(1);
  }

  const db = getDb();

  for (const meta of metas) {
    writeSummaryCache(CACHE_DIR, meta);

    await db
      .insert(skills)
      .values({
        id: meta.id,
        source: 'orchestrator',
        path: meta.path,
        summaryPath: `data/skill-cache/${meta.id}/summary.md`,
        tagsJson: JSON.stringify(meta.tags),
        domain: meta.domain,
        tier: 'pinned',
        autoLoad: true,
      })
      .onConflictDoUpdate({
        target: skills.id,
        set: {
          summaryPath: `data/skill-cache/${meta.id}/summary.md`,
          tagsJson: JSON.stringify(meta.tags),
          domain: meta.domain,
          path: meta.path,
        },
      });

    console.log(`[reindex] ✓ ${meta.id}  domain=${meta.domain}  tags=${meta.tags.join(',')}`);
  }

  closeDb();
  console.log(`[reindex] done — ${metas.length} skills indexed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add `skills:reindex` to root `package.json`**

Open root `package.json`. Find the `scripts` object. Add:
```json
"skills:reindex": "pnpm --filter @mas/skills reindex"
```

Also add `db:migrate` and `db:seed` scripts if not present (they should already be there from Phase 0). Only add `skills:reindex`.

- [ ] **Step 3: Lint**

```bash
cd packages/skills && pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add packages/skills/src/reindex.ts package.json
git commit -m "feat(skills): reindex CLI — scan + cache + upsert DB"
```

---

## Task 6: Write the 6 orchestrator SKILL.md files

**Files:**
- Create: `.claude/skills/mas-mission-planner/SKILL.md`
- Create: `.claude/skills/mas-skill-router/SKILL.md`
- Create: `.claude/skills/mas-context-manager/SKILL.md`
- Create: `.claude/skills/mas-memory-keeper/SKILL.md`
- Create: `.claude/skills/mas-reviewer/SKILL.md`
- Create: `.claude/skills/mas-sec-reviewer/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/mas-mission-planner/SKILL.md`**

```markdown
---
name: mas-mission-planner
description: >
  Use to decompose a natural-language mission into a structured task DAG with dependencies,
  risk levels, agent hints, and token budgets. Do NOT use for executing tasks or code review.
domain: planning
tags: ["planning","decomposition","dag","mission"]
summary: >
  Decomposes a mission brief into an ordered task DAG. Asks 1-3 clarifying questions when
  the objective is ambiguous. Each task has: title, description, agentHint (Tier A/B id),
  skillsHint (list of skill ids), dependsOn (list of task ids), budgetTokens (integer),
  risk (low|medium|high|blocking). Output is a PlannerOutput JSON object. Never injects
  assumptions — if context is missing, surface a clarifying question instead.
---

# Mission Planner

## Role

Convert a natural-language mission into a deterministic task DAG that the dispatcher can execute.

## When to use

- User submits a mission brief via the cockpit
- A mission transitions from `draft` to `planned`

## When NOT to use

- Executing tasks
- Code review or security assessment
- Responding to clarifying questions (that's the user's job)

## Process

1. Read the mission title and objective.
2. If the objective is ambiguous or incomplete, output `clarifyingQuestions` (max 3) and stop.
3. Decompose into 4-8 tasks. Each task:
   - Has a single, clear owner (one `agentHint`)
   - Depends on the minimum set of prior tasks (`dependsOn`)
   - Gets a conservative `budgetTokens` estimate
   - Gets a `risk` level (default `low`)
4. The last task is always a review gate (agentHint: `reviewer`, risk: `low`).
5. If any task touches secrets, external APIs, or writes outside the project path, set `risk: high`.

## Output schema

```json
{
  "clarifyingQuestions": ["string?"],
  "objective": "refined one-liner",
  "tasks": [{
    "id": "mid_tN",
    "title": "string",
    "description": "string",
    "agentHint": "agent-id",
    "skillsHint": ["skill-id"],
    "dependsOn": ["task-id"],
    "budgetTokens": 1500,
    "risk": "low|medium|high|blocking"
  }],
  "estimatedTokens": 8600,
  "estimatedQuotaUnits": 0
}
```

## Common mistakes

- Creating more than 8 tasks for a simple mission
- Setting `risk: high` without a concrete reason
- Missing `dependsOn` when tasks clearly sequence
- Outputting partial JSON
```

- [ ] **Step 2: Create `.claude/skills/mas-skill-router/SKILL.md`**

```markdown
---
name: mas-skill-router
description: >
  Use to select the best skills and Tier B agents for a given task based on its tags.
  Do NOT use for task execution, planning, or code review.
domain: planning
tags: ["planning","routing","skills","agents"]
summary: >
  Matches task skillsHint tags against the skill registry (L1 summaries only) and returns
  a SkillRouterDecision: requiredSkills, favoriteSkills, tierBAgents, budgetEstimate, and
  rationale (≤3 lines). Never loads full skill bodies — only summaries. Escalates when no
  agent matches with confidence ≥0.6 or when the task contains words like "payment",
  "send email", or "deploy".
---

# Skill Router

## Role

Route each task to the correct skills and Tier B agents using the skill registry.

## When to use

- During `planMission` for each task in the DAG
- When re-routing a task after a validation rejection

## When NOT to use

- Executing tasks
- Reviewing outputs
- Planning the mission DAG (that's Mission Planner)

## Process

1. Read the task's `skillsHint` tags.
2. Query skill registry by tags (L1 summaries only).
3. Select `requiredSkills` (must-have) and `favoriteSkills` (nice-to-have).
4. Pick the best Tier B agent(s) from `tierBAgents`.
5. Estimate `budgetTokens` and choose model tier (haiku/sonnet/opus).
6. Write `rationale` in ≤3 lines citing concrete signals from the task text.

## Output schema

```json
{
  "taskId": "mid_tN",
  "requiredSkills": ["skill-id"],
  "favoriteSkills": ["skill-id"],
  "tierBAgents": ["agent-id"],
  "budgetEstimate": { "tokens": 1500, "model": "claude-haiku-4-5" },
  "rationale": "string ≤3 lines",
  "requires_validation": false
}
```

## Escalate when

- No agent matches with confidence ≥0.6
- Task contains: "trading", "payment", "send email", "deploy", "rm -rf"
```

- [ ] **Step 3: Create `.claude/skills/mas-context-manager/SKILL.md`**

```markdown
---
name: mas-context-manager
description: >
  Use to build and refresh per-project context packs (≤4k tokens). Triggers on new project
  registration or stale packs (>24h). Do NOT use for executing code changes or committing files.
domain: memory
tags: ["memory","context","indexing","project"]
summary: >
  Scans the registered project at `project.path` and produces a compact context pack
  (≤4k tokens) saved to `data/context-packs/<projectId>.md`. Extracts: stack, key files,
  architecture patterns, recent git activity (last 7 days). Never reads files outside
  `project.path`. Context pack is valid for 24h — check `lastBuiltAt` before rebuilding.
  Format: YAML header + structured markdown sections.
---

# Context Manager

## Role

Build and maintain per-project context packs that the Mission Planner injects into task prompts.

## When to use

- New project registered in MultiAgentOS
- `data/context-packs/<projectId>.md` is older than 24h
- User explicitly requests a context refresh

## When NOT to use

- Executing code changes
- Writing to the project's own files
- Reviewing mission outputs

## Process

1. Verify `project.path` exists and is readable.
2. Scan directory structure (2 levels deep).
3. Read `package.json` / `pyproject.toml` / `Cargo.toml` (if present) for stack info.
4. Run `git log --oneline -20` from `project.path` (if it's a git repo).
5. Produce a context pack ≤4k tokens.
6. Save to `data/context-packs/<projectId>.md` with `lastBuiltAt` timestamp.

## Output schema (data/context-packs/<id>.md header)

```yaml
---
projectId: string
path: /absolute/path
stack: [typescript, nextjs, sqlite]
lastBuiltAt: ISO8601
tokenCount: 1420
---
```
```

- [ ] **Step 4: Create `.claude/skills/mas-memory-keeper/SKILL.md`**

```markdown
---
name: mas-memory-keeper
description: >
  Use to promote agent-proposed memory candidates into the project or global memory store.
  Only the Memory Keeper may write to data/memory/. Do NOT write memory directly from other agents.
domain: memory
tags: ["memory","persistence","knowledge"]
summary: >
  Reads pending rows from `memory_candidates` table. For each candidate: validates relevance
  (reject if ephemeral or redundant), writes approved entries to `data/memory/<projectId>/`
  or `data/memory/_global/` as Markdown with YAML frontmatter (type, scope, createdAt).
  Updates `memory_candidates.status` to `promoted` or `rejected`. Maximum 5 global items
  injected per mission. Never writes without reviewing for accuracy first.
---

# Memory Keeper

## Role

Review memory proposals from other agents and persist approved ones to the memory store.

## When to use

- A mission reaches `validated` or `archived`
- `memory_candidates` table has pending entries

## When NOT to use

- Writing memory directly (always go through this skill)
- Executing tasks or reviewing code

## Process

1. Select all `memory_candidates` where `status = 'pending'`.
2. For each candidate:
   - `promoted` if: non-obvious, durable (>1 month relevance), not already in the store
   - `rejected` if: ephemeral (session-specific), redundant, or low-confidence
3. Write promoted items to `data/memory/<scope>/` as `<slug>.md`.
4. Update the DB row status.

## Memory file format

```markdown
---
type: user|feedback|project|reference
scope: global|<projectId>
createdAt: ISO8601
---
[body]
```
```

- [ ] **Step 5: Create `.claude/skills/mas-reviewer/SKILL.md`**

```markdown
---
name: mas-reviewer
description: >
  Use to verify agent outputs against the mission brief before archiving. Returns a
  PASS/NEEDS_WORK/BLOCK verdict with findings. Do NOT modify files — read-only.
domain: code-review
tags: ["review","quality","verification","code-review"]
summary: >
  Reviews the diff and artifacts produced by a mission against the original brief and
  project conventions (CLAUDE.md). Checks: task completion, test coverage signals, no
  breaking regressions, adherence to architecture rules. Output: ReviewerVerdict with
  verdict (PASS|NEEDS_WORK|BLOCK) and findings list (severity: info|warn|block, message).
  Escalates to BLOCK if critical conventions violated or undeclared breaking changes found.
---

# Code Reviewer

## Role

Final quality gate before a mission reaches `validated`.

## When to use

- All tasks are `done` and mission enters `review` state
- After a validation approval on a high-risk task

## When NOT to use

- Reviewing security (that's Sec Reviewer)
- Executing or modifying any files
- Planning tasks

## Process

1. Read the mission objective and all task outputs.
2. Check each finding category:
   - **Completeness**: does the output address all mission objectives?
   - **Conventions**: does it follow CLAUDE.md rules?
   - **Tests**: are there test signals (added/passed) for functional changes?
   - **No regressions**: does the diff break existing interfaces?
3. Produce findings list.
4. Set verdict: PASS (all clear), NEEDS_WORK (fixable issues), BLOCK (critical violation).

## Output schema

```json
{
  "taskId": "mid_tN",
  "verdict": "PASS|NEEDS_WORK|BLOCK",
  "findings": [{ "severity": "info|warn|block", "message": "string" }]
}
```
```

- [ ] **Step 6: Create `.claude/skills/mas-sec-reviewer/SKILL.md`**

```markdown
---
name: mas-sec-reviewer
description: >
  Mandatory gate before any high or blocking risk action. Checks for risky-action categories
  in config/permissions.json. Returns PASS or BLOCK. Do NOT approve actions outside the project sandbox.
domain: security
tags: ["security","risk","gate","permissions"]
summary: >
  Evaluates a task against the risky-action categories in `config/permissions.json`. Flags:
  writes outside `project.path`, shell commands with eval/sudo/curl-pipe-sh, writes to .env
  files, git push --force, rm -rf. Returns ReviewerVerdict with PASS or BLOCK. BLOCK when
  any category matches — no exceptions. For `risk: blocking` tasks, always BLOCK regardless
  of content (requires explicit user override in the cockpit).
---

# Security Reviewer

## Role

Hard gate for all `risk: high` and `risk: blocking` tasks.

## When to use

- **Always** before executing a task with `risk: high` or `risk: blocking`
- After a validation approval — re-check before resuming

## When NOT to use

- Low/medium risk tasks (skip to save quota)
- General code quality review (that's the Code Reviewer)

## Process

1. Read the task description and proposed action.
2. Check against risky-action categories in `config/permissions.json`:
   - Writes outside `project.path`
   - Shell: `eval`, `sudo`, `curl | sh`, `rm -rf`
   - Writes to `.env*`, keystores, secrets files
   - `git push --force`, branch deletion, `git reset --hard`
   - Network calls to hosts not in `allowed_hosts`
3. If any category matches → BLOCK.
4. If `risk: blocking` → always BLOCK (requires user override in cockpit).

## Output schema

```json
{
  "taskId": "mid_tN",
  "verdict": "PASS|BLOCK",
  "findings": [{ "severity": "info|block", "message": "string" }]
}
```
```

- [ ] **Step 7: Verify scanner can parse all 6 files (quick smoke test)**

```bash
node --input-type=module << 'EOF'
import { scanOrchestratorSkills } from './packages/skills/src/scanner.js';
const metas = scanOrchestratorSkills(process.cwd());
console.log('Found:', metas.length, 'skills');
metas.forEach(m => console.log(' -', m.id, m.domain, m.tags));
EOF
```

Expected: `Found: 6 skills` with correct ids and domains.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/mas-*/
git commit -m "feat(skills): 6 orchestrator SKILL.md files with domain tags + summaries"
```

---

## Task 7: `config/skills.policy.json`

**Files:**
- Create: `config/skills.policy.json`

- [ ] **Step 1: Create `config/skills.policy.json`**

```json
{
  "$schema": "./schemas/skills-policy.schema.json",
  "version": 1,
  "orchestratorPinned": [
    "mas-mission-planner",
    "mas-skill-router",
    "mas-context-manager",
    "mas-memory-keeper",
    "mas-reviewer",
    "mas-sec-reviewer"
  ],
  "autoLoad": {
    "domains": ["planning", "memory", "security"],
    "tiers": ["pinned"]
  },
  "projectOverrides": {}
}
```

- [ ] **Step 2: Commit**

```bash
git add config/skills.policy.json
git commit -m "feat(skills): config/skills.policy.json — initial policy"
```

---

## Task 8: Run reindex + verify DB

**Files:** none (runtime artifact in `data/`)

- [ ] **Step 1: Apply migration**

```bash
cd packages/db && pnpm migrate && cd ../..
```

Expected: migration 0003 applied, `domain` column added.

- [ ] **Step 2: Run reindex**

```bash
pnpm skills:reindex
```

Expected output:
```
[reindex] ✓ mas-mission-planner  domain=planning  tags=planning,decomposition,dag,mission
[reindex] ✓ mas-skill-router     domain=planning  tags=planning,routing,skills,agents
[reindex] ✓ mas-context-manager  domain=memory    tags=memory,context,indexing,project
[reindex] ✓ mas-memory-keeper    domain=memory    tags=memory,persistence,knowledge
[reindex] ✓ mas-reviewer         domain=code-review  tags=review,quality,verification,code-review
[reindex] ✓ mas-sec-reviewer     domain=security  tags=security,risk,gate,permissions
[reindex] done — 6 skills indexed.
```

- [ ] **Step 3: Verify cache files exist**

```bash
ls data/skill-cache/
```

Expected: 6 directories, one per skill.

```bash
cat data/skill-cache/mas-mission-planner/summary.md
```

Expected: YAML frontmatter with domain + tags, then summary text.

- [ ] **Step 4: Verify DB rows**

```bash
node --input-type=module << 'EOF'
import { getDb, skills, closeDb } from './packages/db/src/index.js';
const db = getDb();
const rows = await db.select().from(skills);
console.log(rows.map(r => `${r.id} domain=${r.domain} tier=${r.tier}`));
closeDb();
EOF
```

Expected: 6 rows with correct domain values.

---

## Task 9: Wire skill summaries into `executeNextTask`

**Files:**
- Modify: `packages/agents/src/dispatch.ts`

This makes EC2 pass: "Skill Router injects summaries (not bodies) in mission prompts."

- [ ] **Step 1: Add `@mas/skills` as dependency to `packages/agents/package.json`**

Open `packages/agents/package.json`. Find `dependencies`. Add:
```json
"@mas/skills": "workspace:*"
```

- [ ] **Step 2: Import SkillRouter + scanner in dispatch.ts**

Add to the top of `packages/agents/src/dispatch.ts`:
```typescript
import { scanOrchestratorSkills, SkillRouter } from '@mas/skills';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
```

Add after the imports, before the `logEvent` function:
```typescript
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

// Load orchestrator skill summaries once at module load (L1 only).
const _orchestratorMetas = scanOrchestratorSkills(REPO_ROOT);
const skillRouter = new SkillRouter(_orchestratorMetas);
```

- [ ] **Step 3: Inject skill context in `executeNextTask`**

Find the `llm.call` in `executeNextTask` (around line 267):

```typescript
  const resp = await llm.call({
    system: `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
    user: `Task: ${next.title}\n\n${next.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
  });
```

Replace with:

```typescript
  const taskSkillIds: string[] = JSON.parse(next.skillsJson ?? '[]');
  const skillContext = skillRouter.buildPromptContext(taskSkillIds);

  const resp = await llm.call({
    system: [
      `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${next.title}\n\n${next.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
  });
```

- [ ] **Step 4: Same injection in `resumeAfterValidation`**

Find the second `llm.call` (around line 357). Apply same pattern:

```typescript
  const taskSkillIds: string[] = JSON.parse(t.skillsJson ?? '[]');
  const skillContext = skillRouter.buildPromptContext(taskSkillIds);

  const resp = await llm.call({
    system: [
      `You are executing a validated high-risk task inside project at path ${proj?.path ?? '.'}.`,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${t.title}\n\n${t.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
  });
```

- [ ] **Step 5: Run pnpm install + lint + test**

```bash
pnpm install && pnpm -w lint && pnpm -w test
```

Expected: all pass. The scanner will warn about missing SKILL.md in the test DB path — this is fine (returns 0 skills, empty context).

- [ ] **Step 6: Commit**

```bash
git add packages/agents/ packages/skills/
git commit -m "feat(agents): inject orchestrator skill summaries into task execution prompts"
```

---

## Task 10: `/skills` page — real DB data + filter + promote

**Files:**
- Create: `apps/web/app/api/skills/route.ts`
- Modify: `apps/web/app/(cockpit)/skills/page.tsx`

- [ ] **Step 1: Create `apps/web/app/api/skills/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { getDb, skills } from '@mas/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  const rows = await db.select().from(skills).orderBy(skills.tier, skills.id);
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const { id, tier } = await req.json() as { id: string; tier: string };
  const allowed = ['pinned', 'project-pinned', 'on-demand', 'methodology'] as const;
  if (!allowed.includes(tier as (typeof allowed)[number])) {
    return NextResponse.json({ error: 'invalid tier' }, { status: 400 });
  }
  const db = getDb();
  await db
    .update(skills)
    .set({ tier: tier as (typeof allowed)[number] })
    .where(eq(skills.id, id));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Rewrite `apps/web/app/(cockpit)/skills/page.tsx`**

```typescript
import { getDb, skills } from '@mas/db';

const DOMAIN_COLORS: Record<string, string> = {
  planning: 'var(--accent)',
  memory: '#7c3aed',
  'code-review': '#059669',
  security: '#dc2626',
  ux: '#d97706',
  research: '#0891b2',
  'code-execution': '#6366f1',
  writing: '#db2777',
  search: '#65a30d',
};

export default async function SkillsRegistry({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; q?: string }>;
}) {
  const { domain, q } = await searchParams;
  const db = getDb();
  let rows = await db.select().from(skills).orderBy(skills.tier, skills.id);

  if (domain) rows = rows.filter((r) => r.domain === domain);
  if (q) {
    const lq = q.toLowerCase();
    rows = rows.filter(
      (r) => r.id.includes(lq) || (r.tagsJson ?? '').includes(lq),
    );
  }

  const domains = [...new Set(rows.map((r) => r.domain).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Skills Registry
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {rows.length} skills indexed
          </p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search…"
            className="mono text-xs px-2 py-1 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
          <select
            name="domain"
            defaultValue={domain ?? ''}
            className="mono text-xs px-2 py-1 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d ?? ''}>{d}</option>
            ))}
          </select>
          <button type="submit" className="mono text-xs px-2 py-1 rounded" style={{ background: 'var(--accent)', color: '#fff' }}>
            Filter
          </button>
        </form>
      </header>

      <div className="surface overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}>
            <tr>
              <th className="px-3 py-2">Skill</th>
              <th className="px-3 py-2">Domain</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td className="px-3 py-2 font-medium mono" style={{ color: 'var(--text-primary)' }}>{s.id}</td>
                <td className="px-3 py-2">
                  {s.domain && (
                    <span
                      className="mono rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: DOMAIN_COLORS[s.domain] + '20', color: DOMAIN_COLORS[s.domain] }}
                    >
                      {s.domain}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="mono rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    {s.tier}
                  </span>
                </td>
                <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                  {(JSON.parse(s.tagsJson) as string[]).join(', ')}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.tier !== 'pinned' && (
                    <form method="POST" action="/api/skills/promote">
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}>
                        Pin
                      </button>
                    </form>
                  )}
                  {s.tier === 'pinned' && (
                    <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>pinned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No skills found. Run <code>pnpm skills:reindex</code> to index orchestrator skills.
          </p>
        )}
      </div>
    </div>
  );
}
```

Note: The "Pin" button uses a form POST. Add a server action endpoint `app/api/skills/promote/route.ts` for the form POST to work:

```typescript
// apps/web/app/api/skills/promote/route.ts
import { NextResponse } from 'next/server';
import { getDb, skills } from '@mas/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string;
  if (!id) return NextResponse.redirect(new URL('/skills', req.url));
  const db = getDb();
  await db.update(skills).set({ tier: 'pinned' }).where(eq(skills.id, id));
  return NextResponse.redirect(new URL('/skills', req.url));
}
```

- [ ] **Step 3: Run lint + build**

```bash
pnpm -w lint && pnpm -w build
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat(web): /skills page — real DB data, domain filter, promote action"
```

---

## Task 11: Add Vitest tests for scanner + router

**Files:**
- Create: `packages/skills/vitest.config.ts`
- Create: `packages/skills/src/scanner.test.ts`
- Create: `packages/skills/src/router.test.ts`
- Modify: `packages/skills/package.json` (add test script)

- [ ] **Step 1: Create `packages/skills/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node' },
});
```

- [ ] **Step 2: Add test script to `packages/skills/package.json`**

```json
"test": "vitest run"
```

Also add to devDependencies:
```json
"vitest": "catalog:"
```

- [ ] **Step 3: Create `packages/skills/src/scanner.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { scanOrchestratorSkills, writeSummaryCache } from './scanner.js';

function makeSkillFile(root: string, id: string, domain: string, summary: string) {
  const dir = join(root, '.claude', 'skills', id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), `---
name: ${id}
description: Test skill for ${id}
domain: ${domain}
tags: ["test","${domain}"]
summary: ${summary}
---

# Body
`);
}

describe('scanner', () => {
  it('parses 6 SKILL.md files correctly', () => {
    const root = join(tmpdir(), `mas-test-${randomUUID()}`);
    try {
      const skillIds = [
        'mas-mission-planner',
        'mas-skill-router',
        'mas-context-manager',
        'mas-memory-keeper',
        'mas-reviewer',
        'mas-sec-reviewer',
      ];
      const domains = ['planning','planning','memory','memory','code-review','security'];
      skillIds.forEach((id, i) => makeSkillFile(root, id, domains[i]!, `Summary for ${id}`));

      const metas = scanOrchestratorSkills(root);
      expect(metas).toHaveLength(6);
      expect(metas[0]!.id).toBe('mas-mission-planner');
      expect(metas[0]!.domain).toBe('planning');
      expect(metas[0]!.tags).toContain('test');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('skips missing SKILL.md without throwing', () => {
    const root = join(tmpdir(), `mas-test-${randomUUID()}`);
    // No skill files created
    mkdirSync(root, { recursive: true });
    try {
      const metas = scanOrchestratorSkills(root);
      expect(metas).toHaveLength(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('writes summary cache with correct frontmatter', () => {
    const root = join(tmpdir(), `mas-test-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
    try {
      makeSkillFile(root, 'mas-reviewer', 'code-review', 'A reviewer skill');
      const [meta] = scanOrchestratorSkills(root);
      const cacheDir = join(root, 'data', 'skill-cache');
      writeSummaryCache(cacheDir, meta!);
      const { readFileSync } = await import('node:fs');
      const content = readFileSync(join(cacheDir, 'mas-reviewer', 'summary.md'), 'utf8');
      expect(content).toContain('domain: code-review');
      expect(content).toContain('A reviewer skill');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 4: Create `packages/skills/src/router.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { SkillRouter } from './router.js';
import type { SkillMeta } from './types.js';

const mockMeta: SkillMeta = {
  id: 'mas-mission-planner',
  name: 'Mission Planner',
  description: 'Plans missions',
  domain: 'planning',
  summary: 'Decomposes missions into task DAGs.',
  tags: ['planning', 'decomposition'],
  path: '/tmp/fake.md',
};

describe('SkillRouter', () => {
  it('getSummary returns L1 summary', () => {
    const router = new SkillRouter([mockMeta]);
    expect(router.getSummary('mas-mission-planner')).toBe('Decomposes missions into task DAGs.');
  });

  it('getSummary returns undefined for unknown skill', () => {
    const router = new SkillRouter([mockMeta]);
    expect(router.getSummary('nonexistent')).toBeUndefined();
  });

  it('requireSkill throws for unknown skill', () => {
    const router = new SkillRouter([mockMeta]);
    expect(() => router.requireSkill('nonexistent')).toThrow('skill not found: nonexistent');
  });

  it('findByDomain returns matching skills', () => {
    const router = new SkillRouter([mockMeta]);
    expect(router.findByDomain('planning')).toHaveLength(1);
    expect(router.findByDomain('security')).toHaveLength(0);
  });

  it('buildPromptContext produces XML with summaries', () => {
    const router = new SkillRouter([mockMeta]);
    const ctx = router.buildPromptContext(['mas-mission-planner']);
    expect(ctx).toContain('<available_skills>');
    expect(ctx).toContain('domain="planning"');
    expect(ctx).toContain('Decomposes missions into task DAGs.');
  });

  it('buildPromptContext returns empty string when no matching skills', () => {
    const router = new SkillRouter([mockMeta]);
    const ctx = router.buildPromptContext(['unknown-skill']);
    expect(ctx).toBe('');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm -w test
```

Expected: all tests pass including 9 new ones in `@mas/skills`.

- [ ] **Step 6: Commit**

```bash
git add packages/skills/
git commit -m "test(skills): scanner + router unit tests — 9 tests"
```

---

## Task 12: Final validation — exit criteria check

- [ ] **EC1: All 6 orchestrator skills have a `summary.md`**

```bash
ls data/skill-cache/
```
Expected: 6 directories.

```bash
for d in data/skill-cache/*/; do echo "=== $d ==="; head -5 "$d/summary.md"; done
```
Expected: 6 files with correct frontmatter.

- [ ] **EC2: Skill Router injects summaries in mission prompts**

```bash
node --input-type=module << 'EOF'
import { scanOrchestratorSkills, SkillRouter } from './packages/skills/src/index.js';
const metas = scanOrchestratorSkills(process.cwd());
const router = new SkillRouter(metas);
const ctx = router.buildPromptContext(['mas-mission-planner','mas-reviewer']);
console.log('Context length (chars):', ctx.length);
console.log('Has available_skills tag:', ctx.includes('<available_skills>'));
console.log('Has domain tags:', ctx.includes('domain='));
EOF
```
Expected: context with `<available_skills>` block containing summaries.

- [ ] **EC3: Filter + promote work and persist across reload**

```bash
pnpm dev
```
Navigate to `http://localhost:3000/skills`. Verify:
- 6 skills visible with domain badges
- Domain filter dropdown works
- Search box filters by id/tag
- "Pin" button visible for non-pinned skills

Click "Pin" on a non-pinned skill. Reload page. Verify tier changed to `pinned` and persists.

- [ ] **EC4: pnpm lint + test + build all pass**

```bash
pnpm -w lint && pnpm -w test && pnpm -w build
```
Expected: all green.

- [ ] **Step: Commit + push branch**

```bash
git add . && git status
git push -u origin phase/3-skill-registry
```

---

## Self-Review

**Spec coverage:**

| Requirement | Task |
|-------------|------|
| Summariser for 6 orchestrator skills | Task 6 + Task 8 |
| Auto-discovery scanner | Task 3 + Task 8 |
| `data/skill-cache/<id>/summary.md` | Task 3 (`writeSummaryCache`) + Task 8 |
| Domain tag on each skill | Task 1 (DB) + Task 6 (SKILL.md frontmatter) |
| Skill Router pulls summaries at prompt-assembly time | Task 4 + Task 9 |
| `requireSkill(id)` hydrates bodies on demand | Task 4 (`requireSkill` method) |
| `/skills` page — searchable table | Task 10 |
| Per-project relevance toggle | Partially: domain filter covers this for Phase 3 |
| Promote to project-pinned | Task 10 (Pin button + /api/skills/promote) |
| Skill policy in `config/skills.policy.json` | Task 7 |
| EC1: all 6 have `summary.md` | Task 8 |
| EC2: summaries injected not bodies | Task 9 |
| EC3: filter + promote persist | Task 10 |

**Gaps flagged:**
- "per-project relevance toggle" is simplified to a domain filter in Phase 3. Full project-scoped relevance toggle is Phase 3.5+ scope (requires active project context in the UI).
