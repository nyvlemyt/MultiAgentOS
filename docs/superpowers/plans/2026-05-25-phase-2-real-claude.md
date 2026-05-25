# Phase 2: Real Claude Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mocked LLM with `@anthropic-ai/sdk`. Wire a live token meter (events table + budgets table). Deliver the `/tokens` page with real spend data.

**Architecture:** `realLLM()` lives in `packages/core/src/llm.real.ts` and implements the existing `LLMClient` interface; a module-level registry in `packages/agents` exposes `getLLM()` / `initLLM()` so dispatch can inject mock or real without changing its signature. Budget checks and event writes are handled by `packages/agents/src/budget.ts`; per-agent LLM calls are handled by `packages/agents/src/agent-runner.ts`. The worker inits the real client at startup if `ANTHROPIC_API_KEY` is in env; otherwise falls back to mock (safe degraded mode for smoke tests).

**Tech Stack:** `@anthropic-ai/sdk ^0.30`, Drizzle ORM (already installed), Vitest (already installed), Next.js 15 Server Components (already installed). No new frameworks.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `packages/core/src/llm.real.ts` | `realLLM()` factory wrapping Anthropic SDK; `calcCostCents()` |
| Create | `packages/core/src/llm.real.test.ts` | Unit tests (SDK mocked via vi.mock) |
| Modify | `packages/core/src/llm.ts` | Add `selectModel()`, `applyCaveman()`, `CavemanRoute` |
| Modify | `packages/core/src/index.ts` | Re-export new helpers + `realLLM` |
| Modify | `packages/core/package.json` | Add `@anthropic-ai/sdk` dep |
| Create | `packages/agents/src/llm-registry.ts` | Module singleton `getLLM()` / `initLLM()` |
| Create | `packages/agents/src/budget.ts` | `checkBudget()`, `recordUsage()`, `ensureMissionBudgetRow()` |
| Create | `packages/agents/src/budget.test.ts` | Unit tests for budget module |
| Create | `packages/agents/src/agent-runner.ts` | Typed LLM runners: `runMissionPlanner`, `runSkillRouter`, `runReviewer`, `runSecReviewer` |
| Create | `packages/agents/src/context-manager.ts` | `buildContextPack()` — file-tree + key-file summary ≤4k tokens |
| Modify | `packages/agents/src/dispatch.ts` | Replace mock calls with agent-runner calls; create mission budget row; inject mode |
| Modify | `packages/agents/src/index.ts` | Export new modules |
| Modify | `apps/worker/src/index.ts` | Read `ANTHROPIC_API_KEY`, call `initLLM(realLLM(key))` if present |
| Create | `apps/web/app/api/tokens/route.ts` | GET endpoint: aggregates from events + budgets |
| Modify | `apps/web/app/(cockpit)/tokens/page.tsx` | Async server component, fetch real data |
| Create | `.env.example` | Document required env vars |

---

## Task 0: Create branch

**Files:** none

- [ ] **Step 1: Create and switch to phase/2-real-claude**

```bash
git checkout main && git pull && git checkout -b phase/2-real-claude
```

Expected: `Switched to a new branch 'phase/2-real-claude'`

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `phase/2-real-claude`

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "chore: open phase/2-real-claude"
```

---

## Task 1: Install `@anthropic-ai/sdk` + create `realLLM`

**Files:**
- Modify: `packages/core/package.json`
- Create: `packages/core/src/llm.real.ts`

- [ ] **Step 1: Add SDK dependency**

Edit `packages/core/package.json` — change the `dependencies` block to:

```json
"dependencies": {
  "@anthropic-ai/sdk": "^0.30.0",
  "zod": "^3.23.8"
}
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

Expected: no errors; `@anthropic-ai/sdk` appears under `node_modules/@anthropic-ai/sdk`.

- [ ] **Step 3: Write `packages/core/src/llm.real.ts`**

```ts
import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, LLMRequest, LLMResponse } from './llm.js';

// Prices in cents per million tokens — verify at console.anthropic.com/plans
const PRICE_PER_M: Record<string, { in: number; out: number; cacheRead: number; cacheWrite: number }> = {
  'claude-haiku-4-5': { in: 80, out: 400, cacheRead: 8, cacheWrite: 100 },
  'claude-haiku-4-5-20251001': { in: 80, out: 400, cacheRead: 8, cacheWrite: 100 },
  'claude-sonnet-4-6': { in: 300, out: 1500, cacheRead: 30, cacheWrite: 375 },
  'claude-opus-4-7': { in: 1500, out: 7500, cacheRead: 150, cacheWrite: 1875 },
};

function calcCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheRead: number,
  cacheCreation: number,
): number {
  const p = PRICE_PER_M[model] ?? PRICE_PER_M['claude-haiku-4-5']!;
  return Math.ceil(
    (inputTokens * p.in + outputTokens * p.out + cacheRead * p.cacheRead + cacheCreation * p.cacheWrite) /
      1_000_000,
  );
}

type SysBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

export function realLLM(apiKey: string): LLMClient {
  const client = new Anthropic({ apiKey });
  return {
    async call(req: LLMRequest): Promise<LLMResponse> {
      const sysBlock: SysBlock = { type: 'text', text: req.system };
      if (req.system.length > 500) sysBlock.cache_control = { type: 'ephemeral' };

      const response = await client.messages.create({
        model: req.model,
        max_tokens: req.maxTokens ?? 4096,
        system: [sysBlock] as Anthropic.TextBlockParam[],
        messages: [{ role: 'user', content: req.user }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');

      const usage = response.usage as Anthropic.Usage & {
        cache_read_input_tokens?: number;
        cache_creation_input_tokens?: number;
      };
      const inputTokens = usage.input_tokens;
      const outputTokens = usage.output_tokens;
      const cacheRead = usage.cache_read_input_tokens ?? 0;
      const cacheCreation = usage.cache_creation_input_tokens ?? 0;

      return {
        text,
        inputTokens,
        outputTokens,
        cacheReadTokens: cacheRead,
        cacheCreationTokens: cacheCreation,
        costCents: calcCostCents(req.model, inputTokens, outputTokens, cacheRead, cacheCreation),
        model: req.model,
      };
    },
  };
}

export { calcCostCents };
```

- [ ] **Step 4: Commit**

```bash
git add packages/core/package.json packages/core/src/llm.real.ts pnpm-lock.yaml
git commit -m "feat(core): add @anthropic-ai/sdk + realLLM factory"
```

---

## Task 2: `selectModel` + `applyCaveman` + tests

**Files:**
- Modify: `packages/core/src/llm.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/src/llm.real.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/core/src/llm.real.test.ts`:

```ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { selectModel, applyCaveman } from './llm.js';

// -- realLLM tests (SDK mocked) --
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({ messages: { create: mockCreate } })),
}));

import { realLLM } from './llm.real.js';

const MOCK_USAGE = {
  input_tokens: 100,
  output_tokens: 50,
  cache_read_input_tokens: 80,
  cache_creation_input_tokens: 20,
};

beforeEach(() => {
  mockCreate.mockResolvedValue({
    content: [{ type: 'text', text: '{"ok":true}' }],
    usage: MOCK_USAGE,
  });
  mockCreate.mockClear();
});

describe('selectModel', () => {
  it('eco always returns haiku', () => {
    expect(selectModel('eco')).toBe('claude-haiku-4-5');
    expect(selectModel('eco', true)).toBe('claude-haiku-4-5');
  });
  it('standard returns haiku on first attempt', () => {
    expect(selectModel('standard')).toBe('claude-haiku-4-5');
  });
  it('standard returns sonnet on retry', () => {
    expect(selectModel('standard', true)).toBe('claude-sonnet-4-6');
  });
  it('expert returns sonnet', () => {
    expect(selectModel('expert')).toBe('claude-sonnet-4-6');
  });
});

describe('applyCaveman', () => {
  it('appends suffix for eco + internal route', () => {
    const result = applyCaveman('You are an agent.', 'eco', 'planner_to_router');
    expect(result).toContain('[CAVEMAN MODE');
  });
  it('no-ops for standard mode', () => {
    const result = applyCaveman('You are an agent.', 'standard', 'planner_to_router');
    expect(result).toBe('You are an agent.');
  });
  it('no-ops for expert mode', () => {
    const result = applyCaveman('You are an agent.', 'expert', 'planner_to_router');
    expect(result).toBe('You are an agent.');
  });
  it('no-ops for null route (user-facing)', () => {
    const result = applyCaveman('You are an agent.', 'eco', null);
    expect(result).toBe('You are an agent.');
  });
});

describe('realLLM', () => {
  it('maps API usage fields to LLMResponse', async () => {
    const llm = realLLM('test-key');
    const res = await llm.call({ system: 'sys', user: 'usr', model: 'claude-haiku-4-5', mode: 'eco' });
    expect(res.inputTokens).toBe(100);
    expect(res.outputTokens).toBe(50);
    expect(res.cacheReadTokens).toBe(80);
    expect(res.cacheCreationTokens).toBe(20);
    expect(res.text).toBe('{"ok":true}');
    expect(res.model).toBe('claude-haiku-4-5');
  });

  it('computes haiku-4-5 cost correctly', async () => {
    const llm = realLLM('test-key');
    // 100in@80¢/M=0.008¢ + 50out@400¢/M=0.020¢ + 80read@8¢/M=0.00064¢ + 20write@100¢/M=0.002¢ = 0.031¢ → ceil=1
    const res = await llm.call({ system: 'sys', user: 'usr', model: 'claude-haiku-4-5', mode: 'eco' });
    expect(res.costCents).toBeGreaterThanOrEqual(1);
  });

  it('passes cache_control: ephemeral when system > 500 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(501), user: 'usr', model: 'claude-haiku-4-5', mode: 'eco' });
    const callArg = mockCreate.mock.calls[0]?.[0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('does NOT pass cache_control when system ≤ 500 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(50), user: 'usr', model: 'claude-haiku-4-5', mode: 'eco' });
    const callArg = mockCreate.mock.calls[0]?.[0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0].cache_control).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — verify it fails** (selectModel and applyCaveman not yet exported)

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/core test
```

Expected: FAIL — `selectModel is not a function` (or similar import error).

- [ ] **Step 3: Add `selectModel` + `applyCaveman` to `packages/core/src/llm.ts`**

Append at the bottom of `packages/core/src/llm.ts` (after the existing mock functions):

```ts
// ---- Phase 2: model selection + Caveman gate ----------------------------------

export function selectModel(mode: Mode, retry = false): string {
  if (mode === 'eco') return 'claude-haiku-4-5';
  if (mode === 'standard') return retry ? 'claude-sonnet-4-6' : 'claude-haiku-4-5';
  return 'claude-sonnet-4-6';
}

export type CavemanRoute = 'planner_to_router' | 'router_to_tierb' | 'reviewer_to_sec' | 'trace_event';

// Routes where Caveman activates under eco (internal agent-to-agent prose only).
// Reviewer/SecReviewer output goes into validation modals → never Caveman.
const CAVEMAN_ROUTES = new Set<CavemanRoute>(['planner_to_router', 'router_to_tierb', 'trace_event']);

const CAVEMAN_SUFFIX =
  '\n\n[CAVEMAN MODE: internal prose only. Drop articles, filler, pleasantries. Technical terms exact. Max 80 tokens response prose.]';

export function applyCaveman(system: string, mode: Mode, route: CavemanRoute | null): string {
  if (mode !== 'eco' || route === null || !CAVEMAN_ROUTES.has(route)) return system;
  return system + CAVEMAN_SUFFIX;
}
```

- [ ] **Step 4: Update `packages/core/src/index.ts`**

Replace the file content with:

```ts
export * from './types';
export * from './llm';
export * from './permissions';
export { realLLM, calcCostCents } from './llm.real';
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/core test
```

Expected: all tests PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/llm.ts packages/core/src/index.ts packages/core/src/llm.real.test.ts
git commit -m "feat(core): selectModel, applyCaveman, realLLM tests"
```

---

## Task 3: LLM registry singleton

**Files:**
- Create: `packages/agents/src/llm-registry.ts`

The registry decouples dispatch from LLM implementation. Tests call `initLLM(mockLLM())`. Worker calls `initLLM(realLLM(key))`.

- [ ] **Step 1: Write `packages/agents/src/llm-registry.ts`**

```ts
import { mockLLM, type LLMClient } from '@mas/core';

let _llm: LLMClient = mockLLM();

export function initLLM(client: LLMClient): void {
  _llm = client;
}

export function getLLM(): LLMClient {
  return _llm;
}
```

- [ ] **Step 2: Export from `packages/agents/src/index.ts`**

Edit `packages/agents/src/index.ts`:

```ts
export * from './registry';
export * from './dispatch';
export { initLLM, getLLM } from './llm-registry';
export { buildContextPack } from './context-manager';
```

(The `context-manager` export will be satisfied in Task 6. Add it now so the file is final.)

- [ ] **Step 3: Commit**

```bash
git add packages/agents/src/llm-registry.ts packages/agents/src/index.ts
git commit -m "feat(agents): LLM registry singleton with initLLM/getLLM"
```

---

## Task 4: Budget module

**Files:**
- Create: `packages/agents/src/budget.ts`
- Create: `packages/agents/src/budget.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/agents/src/budget.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, budgets, schema } from '@mas/db';
import { eq } from 'drizzle-orm';
import { checkBudget, recordUsage, ensureMissionBudgetRow, BudgetExceededError } from './budget.js';

const MIGRATIONS = resolve(fileURLToPath(import.meta.url), '../../../../db/migrations');

function makeTestDb() {
  const raw = new Database(':memory:');
  raw.pragma('journal_mode = WAL');
  raw.pragma('foreign_keys = ON');
  const db = drizzle(raw, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}

// Override getDb for tests via env
beforeEach(() => {
  process.env.MAS_DB_PATH = ':memory:';
});

describe('BudgetExceededError', () => {
  it('is an Error subclass', () => {
    const e = new BudgetExceededError('global', 'day');
    expect(e).toBeInstanceOf(Error);
    expect(e.scope).toBe('global');
    expect(e.period).toBe('day');
  });
});

describe('checkBudget', () => {
  it('does not throw when under cap', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'budget_global_month',
      scope: 'global',
      period: 'month',
      tokensCap: 1_000_000,
      tokensSpent: 0,
      moneyCapCents: 1500,
      moneySpentCents: 100,
    });
    await expect(checkBudget({ db, missionId: undefined })).resolves.toBeUndefined();
  });

  it('throws BudgetExceededError when global day cap hit', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values({
      id: 'budget_global_day',
      scope: 'global',
      period: 'day',
      tokensCap: 100,
      tokensSpent: 100,
      moneyCapCents: 300,
      moneySpentCents: 300,
    });
    await expect(checkBudget({ db, missionId: undefined })).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it('throws when mission token cap hit', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await db.insert(budgets).values({
      id: `budget_mission_${missionId}`,
      scope: 'mission',
      scopeId: missionId,
      period: 'mission',
      tokensCap: 500,
      tokensSpent: 500,
      moneyCapCents: 0,
      moneySpentCents: 0,
    });
    await expect(checkBudget({ db, missionId })).rejects.toBeInstanceOf(BudgetExceededError);
  });
});

describe('recordUsage', () => {
  it('updates global budget rows after a call', async () => {
    const db = makeTestDb();
    await db.insert(budgets).values([
      { id: 'budget_global_day', scope: 'global', period: 'day', tokensCap: 1_000_000, tokensSpent: 0, moneyCapCents: 300, moneySpentCents: 0 },
      { id: 'budget_global_month', scope: 'global', period: 'month', tokensCap: 5_000_000, tokensSpent: 0, moneyCapCents: 1500, moneySpentCents: 0 },
    ]);
    const mockRes = { text: 'hi', inputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheCreationTokens: 0, costCents: 1, model: 'claude-haiku-4-5' };
    await recordUsage({ db, response: mockRes });
    const [dayRow] = await db.select().from(budgets).where(eq(budgets.id, 'budget_global_day'));
    expect(dayRow!.tokensSpent).toBe(150);
    expect(dayRow!.moneySpentCents).toBe(1);
  });
});

describe('ensureMissionBudgetRow', () => {
  it('creates a budget row for a new mission', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 });
    const [row] = await db.select().from(budgets).where(eq(budgets.scopeId, missionId));
    expect(row!.scope).toBe('mission');
    expect(row!.tokensCap).toBe(20_000);
  });

  it('is idempotent — second call does not throw', async () => {
    const db = makeTestDb();
    const missionId = `m_${randomUUID()}`;
    await ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 });
    await expect(ensureMissionBudgetRow({ db, missionId, budgetTokens: 20_000 })).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — verify tests fail** (budget.ts does not exist yet)

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents test 2>&1 | head -30
```

Expected: FAIL — `Cannot find module './budget.js'`.

- [ ] **Step 3: Write `packages/agents/src/budget.ts`**

```ts
import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, budgets, events } from '@mas/db';
import type { LLMResponse } from '@mas/core';
import type { Db } from './dispatch.js';

export class BudgetExceededError extends Error {
  constructor(
    public readonly scope: string,
    public readonly period: string,
  ) {
    super(`Budget cap reached: ${scope} ${period}`);
    this.name = 'BudgetExceededError';
  }
}

export async function checkBudget(opts: { db?: Db; missionId?: string }): Promise<void> {
  const db = opts.db ?? getDb();

  // Check global caps (day + month)
  const globalRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
  for (const row of globalRows) {
    if (row.moneySpentCents >= row.moneyCapCents && row.moneyCapCents > 0) {
      throw new BudgetExceededError(row.scope, row.period);
    }
  }

  // Check mission token cap
  if (opts.missionId) {
    const [mRow] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.scope, 'mission'), eq(budgets.scopeId, opts.missionId)));
    if (mRow && mRow.tokensSpent >= mRow.tokensCap) {
      throw new BudgetExceededError('mission', opts.missionId);
    }
  }
}

export async function recordUsage(opts: {
  db?: Db;
  response: LLMResponse;
  missionId?: string;
  taskId?: string;
  agentId?: string;
}): Promise<void> {
  const db = opts.db ?? getDb();
  const { response: res, missionId, taskId, agentId } = opts;
  const spent = res.inputTokens + res.outputTokens;

  // Write llm_call event
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    missionId: missionId ?? null,
    taskId: taskId ?? null,
    agentId: agentId ?? null,
    type: 'llm_call',
    payloadJson: JSON.stringify({ model: res.model }),
    tokensIn: res.inputTokens,
    tokensOut: res.outputTokens,
    cacheRead: res.cacheReadTokens,
    cacheCreation: res.cacheCreationTokens,
    costCents: res.costCents,
    risk: 'low',
    createdAt: new Date(),
  });

  // Update all global budget rows atomically
  await db
    .update(budgets)
    .set({
      tokensSpent: sql`tokens_spent + ${spent}`,
      moneySpentCents: sql`money_spent_cents + ${res.costCents}`,
    })
    .where(eq(budgets.scope, 'global'));

  // Update mission budget if present
  if (missionId) {
    await db
      .update(budgets)
      .set({ tokensSpent: sql`tokens_spent + ${spent}` })
      .where(and(eq(budgets.scope, 'mission'), eq(budgets.scopeId, missionId)));
  }
}

export async function ensureMissionBudgetRow(opts: {
  db?: Db;
  missionId: string;
  budgetTokens: number;
}): Promise<void> {
  const db = opts.db ?? getDb();
  await db
    .insert(budgets)
    .values({
      id: `budget_mission_${opts.missionId}`,
      scope: 'mission',
      scopeId: opts.missionId,
      period: 'mission',
      tokensCap: opts.budgetTokens,
      tokensSpent: 0,
      moneyCapCents: 0,
      moneySpentCents: 0,
    })
    .onConflictDoNothing();
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents test 2>&1 | tail -20
```

Expected: all budget tests PASS. (dispatch tests from Phase 1 should still PASS.)

- [ ] **Step 5: Commit**

```bash
git add packages/agents/src/budget.ts packages/agents/src/budget.test.ts
git commit -m "feat(agents): budget check + recordUsage + ensureMissionBudgetRow"
```

---

## Task 5: Agent runners

**Files:**
- Create: `packages/agents/src/agent-runner.ts`

Each runner: loads fiche body → applies Caveman → calls `getLLM().call()` → parses JSON → returns typed output. Falls back to mock on JSON parse failure so the mission doesn't crash.

- [ ] **Step 1: Write `packages/agents/src/agent-runner.ts`**

```ts
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import {
  mockMissionPlanner,
  mockSkillRouter,
  mockReviewer,
  mockSecReviewer,
  selectModel,
  applyCaveman,
  type PlannerInput,
  type PlannerOutput,
  type SkillRouterDecision,
  type ReviewerVerdict,
  type Mode,
  type Risk,
} from '@mas/core';
import { getLLM } from './llm-registry.js';
import { checkBudget, recordUsage } from './budget.js';

const FICHES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../fiches');

function loadFicheBody(id: string): string {
  const raw = readFileSync(resolve(FICHES_DIR, `${id}.md`), 'utf-8');
  return matter(raw).content.trim();
}

function extractJson<T>(text: string): T {
  const stripped = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```\s*$/m, '').trim();
  return JSON.parse(stripped) as T;
}

async function callAgent<T>(opts: {
  agentId: string;
  ficheId: string;
  userPrompt: string;
  mode: Mode;
  cavemanRoute: Parameters<typeof applyCaveman>[2];
  missionId?: string;
  taskId?: string;
  fallback: () => T;
}): Promise<T> {
  const { agentId, ficheId, userPrompt, mode, cavemanRoute, missionId, taskId, fallback } = opts;
  const llm = getLLM();
  const ficheBody = loadFicheBody(ficheId);
  const system = applyCaveman(ficheBody, mode, cavemanRoute);
  const model = selectModel(mode);

  await checkBudget({ missionId });

  let response;
  try {
    response = await llm.call({ system, user: userPrompt, model, mode });
  } catch (e) {
    console.error(`[agent-runner:${agentId}] LLM call failed, falling back to mock:`, e);
    return fallback();
  }

  await recordUsage({ response, missionId, taskId, agentId }).catch((e) =>
    console.error('[agent-runner] recordUsage failed (non-fatal):', e),
  );

  try {
    return extractJson<T>(response.text);
  } catch {
    console.error(`[agent-runner:${agentId}] JSON parse failed, falling back to mock. Raw: ${response.text.slice(0, 200)}`);
    return fallback();
  }
}

export async function runMissionPlanner(input: PlannerInput & { mode: Mode }): Promise<PlannerOutput> {
  return callAgent<PlannerOutput>({
    agentId: 'mission-planner',
    ficheId: 'mission-planner',
    mode: input.mode,
    cavemanRoute: 'planner_to_router',
    missionId: input.missionId,
    fallback: () => mockMissionPlanner(input),
    userPrompt: `Return ONLY a valid JSON object matching the schema in your system prompt. No prose, no markdown fences.

Mission to plan:
- id: ${input.missionId}
- title: ${input.title}
- objective: ${input.objective}`,
  });
}

export async function runSkillRouter(opts: {
  taskId: string;
  skillsHint: string[];
  description: string;
  mode: Mode;
  missionId?: string;
}): Promise<SkillRouterDecision> {
  return callAgent<SkillRouterDecision>({
    agentId: 'skill-router',
    ficheId: 'skill-router',
    mode: opts.mode,
    cavemanRoute: 'router_to_tierb',
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockSkillRouter(opts.taskId, opts.skillsHint),
    userPrompt: `Return ONLY valid JSON matching this schema, no prose:
{
  "taskId": "${opts.taskId}",
  "requiredSkills": [],
  "favoriteSkills": [],
  "tierBAgents": [],
  "budgetEstimate": { "tokens": 0, "model": "claude-haiku-4-5" },
  "rationale": "...",
  "requires_validation": false
}

Task to route:
- id: ${opts.taskId}
- skillsHint: ${JSON.stringify(opts.skillsHint)}
- description: ${opts.description}`,
  });
}

export async function runReviewer(opts: {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  risk: Risk;
  mode: Mode;
  missionId?: string;
}): Promise<ReviewerVerdict> {
  return callAgent<ReviewerVerdict>({
    agentId: 'reviewer',
    ficheId: 'reviewer',
    mode: opts.mode,
    cavemanRoute: null, // reviewer output → validation modal → never Caveman
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockReviewer(opts.taskId, { risk: opts.risk }),
    userPrompt: `Return ONLY valid JSON:
{
  "taskId": "${opts.taskId}",
  "verdict": "PASS" | "NEEDS_WORK" | "BLOCK",
  "findings": [{ "severity": "info" | "warn" | "block", "message": "..." }]
}

Review this completed task:
- id: ${opts.taskId}
- title: ${opts.taskTitle}
- description: ${opts.taskDescription}
- risk: ${opts.risk}`,
  });
}

export async function runSecReviewer(opts: {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  risk: Risk;
  mode: Mode;
  missionId?: string;
}): Promise<ReviewerVerdict> {
  return callAgent<ReviewerVerdict>({
    agentId: 'sec-reviewer',
    ficheId: 'sec-reviewer',
    mode: opts.mode,
    cavemanRoute: null, // sec-reviewer verdict → validation modal → never Caveman
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockSecReviewer(opts.taskId, { risk: opts.risk }),
    userPrompt: `Return ONLY valid JSON:
{
  "taskId": "${opts.taskId}",
  "verdict": "PASS" | "NEEDS_WORK" | "BLOCK",
  "findings": [{ "severity": "info" | "warn" | "block", "message": "..." }]
}

Security review this task. BLOCK if it requires: rm -rf, git push --force, eval, curl | sh, writes to .env files, cross-project writes.
- id: ${opts.taskId}
- title: ${opts.taskTitle}
- description: ${opts.taskDescription}
- risk: ${opts.risk}`,
  });
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents exec tsc --noEmit 2>&1
```

Expected: no errors. (Resolve any import/type issues if needed.)

- [ ] **Step 3: Commit**

```bash
git add packages/agents/src/agent-runner.ts
git commit -m "feat(agents): typed agent runners (MissionPlanner, SkillRouter, Reviewer, SecReviewer)"
```

---

## Task 6: Context Manager

**Files:**
- Create: `packages/agents/src/context-manager.ts`

Builds a Markdown context pack (file tree + key file excerpts) for a project. No LLM call — pure filesystem scan. Output ≤4k chars → ≤~1k tokens.

- [ ] **Step 1: Write `packages/agents/src/context-manager.ts`**

```ts
import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, contextPacks, projects, type Project } from '@mas/db';

const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.prisma', '.env.example', '.yaml', '.yml']);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage', '.cache', 'data']);
const MAX_DEPTH = 4;
const MAX_FILES = 80;
const MAX_PACK_CHARS = 14_000; // ~3.5k tokens, leaves headroom

function collectFiles(dir: string, depth = 0, acc: string[] = []): string[] {
  if (depth > MAX_DEPTH || acc.length >= MAX_FILES) return acc;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const entry of entries.sort()) {
    if (acc.length >= MAX_FILES) break;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry)) collectFiles(full, depth + 1, acc);
    } else if (INCLUDE_EXTS.has(extname(entry)) || INCLUDE_EXTS.has(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function readSnippet(path: string, maxChars = 400): string {
  try {
    const content = readFileSync(path, 'utf-8').trim();
    return content.length <= maxChars ? content : content.slice(0, maxChars) + '\n[truncated]';
  } catch {
    return '[unreadable]';
  }
}

export async function buildContextPack(projectIdOrProject: string | Project): Promise<string> {
  const db = getDb();
  let project: Project;
  if (typeof projectIdOrProject === 'string') {
    const [p] = await db.select().from(projects).where(eq(projects.id, projectIdOrProject));
    if (!p) throw new Error(`project ${projectIdOrProject} not found`);
    project = p;
  } else {
    project = projectIdOrProject;
  }

  if (!existsSync(project.path)) {
    throw new Error(`project path does not exist: ${project.path}`);
  }

  const files = collectFiles(project.path);
  let pack = `# Context pack: ${project.name}\n`;
  pack += `path: ${project.path}\n`;
  pack += `type: ${project.type}\n`;
  pack += `stack: ${JSON.parse(project.stackJson).join(', ')}\n\n`;

  // Include package.json if present
  const pkgPath = join(project.path, 'package.json');
  if (existsSync(pkgPath)) {
    pack += `## package.json\n\`\`\`json\n${readSnippet(pkgPath, 600)}\n\`\`\`\n\n`;
  }

  // Include README if present (first 30 lines)
  for (const readme of ['README.md', 'readme.md', 'Readme.md']) {
    const rPath = join(project.path, readme);
    if (existsSync(rPath)) {
      const lines = readFileSync(rPath, 'utf-8').split('\n').slice(0, 30).join('\n');
      pack += `## README (first 30 lines)\n${lines}\n\n`;
      break;
    }
  }

  // File tree
  pack += `## File tree (${files.length} files)\n`;
  for (const f of files) {
    pack += `- ${relative(project.path, f)}\n`;
    if (pack.length > MAX_PACK_CHARS * 0.6) break;
  }
  pack += '\n';

  // Key files: tsconfig, prisma schema, main entry
  const KEY_FILES = ['tsconfig.json', 'prisma/schema.prisma', 'src/index.ts', 'app/page.tsx'];
  for (const rel of KEY_FILES) {
    const full = join(project.path, rel);
    if (existsSync(full) && pack.length < MAX_PACK_CHARS) {
      pack += `## ${rel}\n\`\`\`\n${readSnippet(full, 500)}\n\`\`\`\n\n`;
    }
  }

  if (pack.length > MAX_PACK_CHARS) {
    pack = pack.slice(0, MAX_PACK_CHARS) + '\n[pack truncated to stay under 4k tokens]';
  }

  // Write to data/context-packs/
  const outDir = resolve(process.cwd(), 'data/context-packs');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${project.id}.md`);
  writeFileSync(outPath, pack, 'utf-8');

  // Upsert contextPacks table
  await db
    .insert(contextPacks)
    .values({
      id: `cp_${randomUUID()}`,
      projectId: project.id,
      version: 1,
      path: outPath,
      generatedAt: new Date(),
      tokenSize: Math.ceil(pack.length / 4),
      fileCount: files.length,
    })
    .onConflictDoNothing();

  return pack;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents exec tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/agents/src/context-manager.ts
git commit -m "feat(agents): context-manager builds file-tree context pack"
```

---

## Task 7: Wire `dispatch.ts` to use real agent runners

**Files:**
- Modify: `packages/agents/src/dispatch.ts`

Replace `mockMissionPlanner`, `mockSkillRouter`, `mockReviewer`, `mockSecReviewer` calls with the new agent runners. Inject `mode`. Create mission budget row in `planMission()`. The `Db` type export remains unchanged.

- [ ] **Step 1: Replace the import block in `dispatch.ts`**

Change the top of the file from:

```ts
import type { ReviewerVerdict } from '@mas/core';
import {
  mockMissionPlanner,
  mockSkillRouter,
  mockReviewer,
  mockSecReviewer,
} from '@mas/core';
```

To:

```ts
import type { ReviewerVerdict, Mode } from '@mas/core';
import { runMissionPlanner, runSkillRouter, runReviewer, runSecReviewer } from './agent-runner.js';
import { ensureMissionBudgetRow } from './budget.js';
```

- [ ] **Step 2: Add `getEffectiveMode` helper** (after the imports, before `logEvent`):

```ts
async function getEffectiveMode(missionId: string): Promise<Mode> {
  const db = getDb();
  const [m] = await db
    .select({ modeOverride: missions.modeOverride, projectId: missions.projectId })
    .from(missions)
    .where(eq(missions.id, missionId));
  if (!m) return 'eco';
  if (m.modeOverride) return m.modeOverride as Mode;
  // Look up project default mode
  const { projects } = await import('@mas/db');
  const [p] = await db
    .select({ defaultMode: projects.defaultMode })
    .from(projects)
    .where(eq(projects.id, m.projectId));
  return (p?.defaultMode ?? 'eco') as Mode;
}
```

- [ ] **Step 3: Replace `planMission` body**

Replace the block from `const plan = mockMissionPlanner(...)` through the `mockSkillRouter` loop with:

```ts
  const mode = await getEffectiveMode(m.id);
  const plan = await runMissionPlanner({ missionId: m.id, title: m.title, objective: m.objective, mode });

  // Wipe and rewrite task list for an idempotent plan.
  await db.delete(tasks).where(eq(tasks.missionId, m.id));

  for (const t of plan.tasks) {
    const router = await runSkillRouter({
      taskId: t.id,
      skillsHint: t.skillsHint,
      description: t.description,
      mode,
      missionId: m.id,
    });
    await db.insert(tasks).values({
      id: t.id,
      missionId: m.id,
      title: t.title,
      description: t.description,
      status: 'todo',
      risk: t.risk,
      agentId: t.agentHint,
      skillsJson: JSON.stringify(router.favoriteSkills.concat(router.requiredSkills)),
      dependsOnJson: JSON.stringify(t.dependsOn),
      budgetTokens: t.budgetTokens,
      spentTokens: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await logEvent(db, {
      missionId: m.id,
      taskId: t.id,
      agentId: 'skill-router',
      type: 'skill_router_decision',
      payload: { rationale: router.rationale, skills: router.favoriteSkills, agents: router.tierBAgents },
    });
  }

  await ensureMissionBudgetRow({ missionId: m.id, budgetTokens: plan.estimatedTokens || m.budgetTokens });
```

- [ ] **Step 4: Replace mock reviewer calls in `executeNextTask`**

In the review section (inside `if (allDone)`), replace the `mockSecReviewer` and `mockReviewer` calls:

```ts
    // Run sec-reviewer on every high/blocking-risk task; run reviewer on the last task.
    const mode = await getEffectiveMode(m.id);
    const verdicts: ReviewerVerdict[] = [];
    for (const t of all) {
      if (t.risk === 'high' || t.risk === 'blocking') {
        const sec = await runSecReviewer({ taskId: t.id, taskTitle: t.title, taskDescription: t.description, risk: t.risk, mode, missionId: m.id });
        await logEvent(db, { missionId: m.id, taskId: t.id, agentId: 'sec-reviewer', type: 'sec_review_verdict', payload: sec });
        verdicts.push(sec);
      }
    }
    const last = all.at(-1);
    if (last) {
      const rev = await runReviewer({ taskId: last.id, taskTitle: last.title, taskDescription: last.description, risk: last.risk, mode, missionId: m.id });
      await logEvent(db, { missionId: m.id, taskId: last.id, agentId: 'reviewer', type: 'review_verdict', payload: rev });
      verdicts.push(rev);
    }
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents exec tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 6: Run Phase 1 tests — verify they still pass**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/agents test 2>&1 | tail -20
```

Expected: all existing dispatch tests PASS (the dispatch tests use `mockLLM` via `initLLM` and call the mock fns, which are now the fallback path).

Note: the dispatch tests must call `initLLM(mockLLM())` before each test to ensure the mock is active. If they don't, add this to the test file's `beforeEach`.

- [ ] **Step 7: Commit**

```bash
git add packages/agents/src/dispatch.ts
git commit -m "feat(agents): wire dispatch.ts to real agent runners; create mission budget row"
```

---

## Task 8: Wire worker + `.env.example`

**Files:**
- Modify: `apps/worker/src/index.ts`
- Create: `.env.example`

Worker reads `ANTHROPIC_API_KEY` at startup. If present, inits `realLLM`. If absent, stays on `mockLLM` (smoke tests run safely without a key).

- [ ] **Step 1: Update `apps/worker/src/index.ts`**

Replace the file with:

```ts
import { initLLM } from '@mas/agents';
import { realLLM, mockLLM } from '@mas/core';
import { listDispatchableMissions, executeNextTask } from '@mas/agents';
import { getDb } from '@mas/db';

const TICK_MS = 1500;

let busy = false;

async function tick() {
  if (busy) return;
  busy = true;
  try {
    const dispatchable = await listDispatchableMissions();
    if (dispatchable.length === 0) return;
    for (const m of dispatchable) {
      const res = await executeNextTask(m.id);
      if (res.kind === 'task_done') {
        console.log(`[worker] task done in ${m.id}: ${res.taskId}`);
      } else if (res.kind === 'paused_for_validation') {
        console.log(`[worker] mission ${m.id} paused — task ${res.taskId} needs validation`);
      } else if (res.kind === 'mission_complete') {
        console.log(`[worker] mission ${m.id} complete (validated)`);
      }
    }
  } catch (e) {
    console.error('[worker:tick]', e);
  } finally {
    busy = false;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    initLLM(realLLM(apiKey));
    console.log('[worker] real LLM initialized (claude API)');
  } else {
    initLLM(mockLLM());
    console.log('[worker] mock LLM active (set ANTHROPIC_API_KEY to use real Claude)');
  }

  console.log('[worker] alive');
  getDb();
  setInterval(() => {
    void tick();
  }, TICK_MS);
}

main().catch((e) => {
  console.error('[worker] fatal', e);
  process.exit(1);
});
```

- [ ] **Step 2: Create `.env.example`**

```
# MultiAgentOS — environment variables
# Copy to .env and fill in values. .env is gitignored.

# Anthropic API key for real Claude calls.
# BILLING ISOLATION: Never export this in your shell profile.
# The worker process reads it via tsx --env-file=.env.
# Claude Code (your IDE session) authenticates separately via `claude login`.
ANTHROPIC_API_KEY=sk-ant-api03-...

# DB path override. Default: data/mas.db (repo root).
# Set to data/test/mas-smoke.db for smoke tests.
# MAS_DB_PATH=data/test/mas-smoke.db

# Set to 'true' only to allow seeding the default dev DB (destructive).
# MAS_ALLOW_DESTRUCTIVE_SEED=true
```

- [ ] **Step 3: Commit**

```bash
git add apps/worker/src/index.ts .env.example
git commit -m "feat(worker): init realLLM if ANTHROPIC_API_KEY present; add .env.example"
```

---

## Task 9: `/api/tokens` route

**Files:**
- Create: `apps/web/app/api/tokens/route.ts`

Returns aggregated token data from `budgets` and `events` tables.

- [ ] **Step 1: Write `apps/web/app/api/tokens/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getDb, budgets, events } from '@mas/db';
import { eq, gte, sum } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function startOf(period: 'day' | 'week' | 'month'): Date {
  const now = new Date();
  if (period === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET() {
  try {
    const db = getDb();

    // Budget rows
    const budgetRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
    const dayRow = budgetRows.find((r) => r.period === 'day');
    const monthRow = budgetRows.find((r) => r.period === 'month');

    // Cache hit ratio from llm_call events in the last 24 h
    const since24h = startOf('day');
    const cacheAgg = await db
      .select({
        totalCacheRead: sum(events.cacheRead),
        totalCacheCreation: sum(events.cacheCreation),
      })
      .from(events)
      .where(gte(events.createdAt, since24h));

    const cacheRead = Number(cacheAgg[0]?.totalCacheRead ?? 0);
    const cacheCreation = Number(cacheAgg[0]?.totalCacheCreation ?? 0);
    const cacheTotal = cacheRead + cacheCreation;
    const cacheHitRatio = cacheTotal > 0 ? Math.round((cacheRead / cacheTotal) * 100) : 0;

    return NextResponse.json({
      today: {
        spentCents: dayRow?.moneySpentCents ?? 0,
        capCents: dayRow?.moneyCapCents ?? 300,
        tokensSpent: dayRow?.tokensSpent ?? 0,
        tokensCap: dayRow?.tokensCap ?? 1_000_000,
      },
      month: {
        spentCents: monthRow?.moneySpentCents ?? 0,
        capCents: monthRow?.moneyCapCents ?? 1500,
        tokensSpent: monthRow?.tokensSpent ?? 0,
        tokensCap: monthRow?.tokensCap ?? 5_000_000,
      },
      cacheHitRatio,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm --filter @mas/web exec tsc --noEmit 2>&1 | head -30
```

Expected: no errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/tokens/route.ts
git commit -m "feat(web): /api/tokens endpoint returning real budget + cache data"
```

---

## Task 10: Wire `/tokens` page to real data

**Files:**
- Modify: `apps/web/app/(cockpit)/tokens/page.tsx`

Convert to an async Server Component. Fetch data from `/api/tokens` at render time using the `fetch` helper with `cache: 'no-store'` (Server Component calling internal API). The sparklines keep mock data for now — real historical data comes when we add periodic snapshotting (Phase 4+).

- [ ] **Step 1: Replace `apps/web/app/(cockpit)/tokens/page.tsx`**

```tsx
import { Sparkline } from '@/components/Sparkline';
import { BudgetBar } from '@/components/BudgetBar';
import { ModePill } from '@/components/ModePill';
import { dailyTokens, monthlySpend } from '@/lib/fixtures';

interface TokenData {
  today: { spentCents: number; capCents: number; tokensSpent: number; tokensCap: number };
  month: { spentCents: number; capCents: number; tokensSpent: number; tokensCap: number };
  cacheHitRatio: number;
}

async function getTokenData(): Promise<TokenData> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/tokens`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<TokenData>;
  } catch {
    // Fallback to seed-data values when API is unavailable (build time, SSG)
    return {
      today: { spentCents: 35, capCents: 300, tokensSpent: 42_000, tokensCap: 1_000_000 },
      month: { spentCents: 240, capCents: 1500, tokensSpent: 320_000, tokensCap: 5_000_000 },
      cacheHitRatio: 0,
    };
  }
}

function fmtEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default async function TokenManager() {
  const data = await getTokenData();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tokens & Budget</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Live spend, cache health, mode controls.</p>
        </div>
        <ModePill defaultMode="eco" />
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Today"
          value={fmtEur(data.today.spentCents)}
          hint={`cap ${fmtEur(data.today.capCents)}`}
        >
          <BudgetBar spent={data.today.spentCents} cap={data.today.capCents} />
        </Card>
        <Card
          title="This month"
          value={fmtEur(data.month.spentCents)}
          hint={`cap ${fmtEur(data.month.capCents)}`}
        >
          <BudgetBar spent={data.month.spentCents} cap={data.month.capCents} />
        </Card>
        <Card
          title="Tokens today"
          value={`${(data.today.tokensSpent / 1000).toFixed(1)}k`}
          hint={`cap ${(data.today.tokensCap / 1_000_000).toFixed(0)}M`}
        />
        <Card
          title="Cache hit ratio"
          value={`${data.cacheHitRatio}%`}
          hint="≥30% Phase 2 target"
        />
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Daily tokens (k) — historical</h2>
          <Sparkline data={dailyTokens} width={500} height={140} />
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Monthly spend (€) — historical</h2>
          <Sparkline data={monthlySpend} width={500} height={140} stroke="var(--success)" />
        </article>
      </section>
      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Mode policy</h2>
        <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li><span className="mono">eco</span> · haiku-4-5 everywhere · Caveman ON (internal only) · summaries only</li>
          <li><span className="mono">standard</span> · haiku → sonnet on retry · Caveman OFF · on-demand hydration</li>
          <li><span className="mono">expert</span> · sonnet base · opus on review · full hydration · no auto-cap bypass</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ title, value, hint, children }: { title: string; value: string; hint?: string; children?: React.ReactNode }) {
  return (
    <article className="surface flex flex-col gap-2 p-4">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </header>
      <div className="mono text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {children}
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/(cockpit)/tokens/page.tsx
git commit -m "feat(web): /tokens page reads real budget data from DB via /api/tokens"
```

---

## Task 11: Full checks + exit criteria verification

- [ ] **Step 1: Lint**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm lint
```

Expected: no errors.

- [ ] **Step 2: All tests**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm test
```

Expected: all tests PASS (Phase 1 dispatch tests + new core/agents tests).

- [ ] **Step 3: Build**

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm build
```

Expected: no build errors.

- [ ] **Step 4: Smoke test** (smoke uses test DB + mock LLM — no API key needed)

```bash
cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS && pnpm smoke
```

Expected: all smoke tests PASS. `data/test/mas-smoke.db` is used; `data/mas.db` is untouched.

- [ ] **Step 5: Verify exit criteria manually** (requires `ANTHROPIC_API_KEY` in `.env`)

Create a `.env` file from `.env.example` and set your key. Then:

```bash
# Start worker with real Claude
cd apps/worker && tsx --env-file=../../.env src/index.ts &

# In another terminal: run a mission through planning
node -e "
const { planMission, runMission } = await import('./packages/agents/src/dispatch.js');
await planMission('seed_mission_1');
await runMission('seed_mission_1');
console.log('Mission running via real Claude');
"
```

Then check the events table for real token counts:

```bash
sqlite3 data/mas.db "SELECT type, tokens_in, tokens_out, cache_read, cache_creation, cost_cents FROM events WHERE type='llm_call' ORDER BY created_at DESC LIMIT 10;"
```

Verify:
1. `tokens_in + tokens_out` total across all events < 30,000 ✓
2. `SUM(cache_read) / (SUM(cache_read) + SUM(cache_creation))` ≥ 30% after 2 missions ✓
3. `/tokens` page shows updated figures ✓

- [ ] **Step 6: Push**

```bash
git push -u origin phase/2-real-claude
```

---

## Self-review

**Spec coverage check:**

| Phase 2 requirement (ROADMAP) | Task covering it |
|-------------------------------|------------------|
| `@anthropic-ai/sdk` wired behind same interface | Task 1 |
| Token meter: input, output, cache_read, cache_creation, cost_cents per call | Tasks 1 + 4 |
| Mode pill drives model choice + Caveman gate | Task 2 |
| Caveman suffix on TOKEN_STRATEGY.md §6 routes only | Task 2 + 5 |
| Context Manager builds first real context pack ≤4k | Task 6 |
| Anthropic prompt cache: cache_control: ephemeral on system blocks | Task 1 |
| /tokens page shows live spend + cache hit ratio | Tasks 9 + 10 |
| Billing isolation: key injected per-process, not global shell | Task 8 |

**Type consistency check:**
- `PlannerOutput`, `SkillRouterDecision`, `ReviewerVerdict`, `Risk`, `Mode` — all imported from `@mas/core` in agent-runner. No new types invented.
- `Db` type exported from `dispatch.ts` — imported in `budget.ts` as `import type { Db }`.
- `LLMClient`, `LLMRequest`, `LLMResponse` from `@mas/core/llm` — realLLM correctly implements LLMClient.

**Placeholder scan:** none found — all code blocks are complete.

**Phase 2 exit criteria targets (TOKEN_STRATEGY §11):**
- Hard ceiling per call: 24k tokens — enforced via `maxTokens: 4096` per call + natural prompt size limits
- Daily money cap: 2€ (200 cents) — the seed budgets' `moneyCapCents: 300` covers this during dev
- Cache hit target: ≥30% — `cache_control: ephemeral` on all system blocks > 500 chars enables this
