# Living Knowledge OS — Round 2, Brique 5: Cockpit Ressources/Connaissances Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the cockpit surface that makes the ingested knowledge corpus *operable from the UI, not "just files"* — an Ingestion Inbox (with the dead-letter lane + review-debt), a browsable fiche library with provenance/lifecycle/trust badges, and a never-silent health panel — closing Brique 5 of the base Knowledge OS (design spec §5 Brique 5 + round-2 plan Task 4).

**Architecture:** Extend, never reinvent (design spec §3). This is a new App-Router route under `apps/web/app/(cockpit)/` that reads three data sources that **already exist** on the base branch: (1) `memory_candidates` rows (Brique 1 schema deltas — `source_key`/`trust`/`status:capture_failed`) for the Inbox; (2) fiche frontmatter on disk under `docs/knowledge/**` + `docs/resources/**` (`FicheSchema`, Brique 1) for the badges/browse; (3) `retrievalDoctor` + the golden-set eval + the consolidation log (Brique 4 + Brique 6) for the health panel. It mirrors the `/memory` page's server-component + form-action pattern and the `AgentControlPanel` client tab shell. Pure read/derive logic lives in `apps/web/lib/resources.ts` (TDD'd); the route is thin; mutations go through colocated server actions guarded by the §5 risk rules.

**Tech Stack:** Next.js 15 App Router (Server Components by default) · TypeScript · `gray-matter` (frontmatter read) · Zod (`FicheSchema` reuse) · Drizzle ORM (SQLite candidate reads) · `@mas/memory` conveyor + retriever exports · Vitest · Tailwind + the project CSS-var design system (`var(--*)`, `surface`, `mono`) · lucide-react icons.

---

## 0. Preconditions & sequencing — READ BEFORE ANY TASK

### 0.1 Base branch (the build dependency that gates this plan)
Brique 5 **reads** Brique 1 (fiche contract + candidate schema deltas) and Brique 6 (the ingestion conveyor that produces the candidate/fiche rows). Those land on `knowledge-os/brique-1` (Brique 6 core, PR #54, already folded in) + `knowledge-os/brique-6-extractors` (PR #55, off `brique-1`). **Do not branch off `main`** — main lacks all of it.

- Cut the Brique-5 branch off the **final `knowledge-os/brique-1` tip after #55 (and any in-flight extractor work: URL/YouTube) has merged into it.** Confirm before starting:
  ```bash
  git log --oneline -1 knowledge-os/brique-1
  git show knowledge-os/brique-1:packages/memory/src/fiche.ts | head -1       # FicheSchema present
  git show knowledge-os/brique-1:packages/memory/src/conveyor/pipeline.ts | head -1   # conveyor present
  git show knowledge-os/brique-1:packages/db/src/schema.ts | grep -n source_key      # candidate deltas present
  ```
  All three must resolve. If any is missing, the base is wrong — STOP.
- **All PRs open as DRAFT** — the user merges ([[project_ui_redesign]] "Open PRs as DRAFT — user merges too early").

### 0.2 The 5-check verification gate — applies to every code task
A task is DONE only when ALL pass (CLAUDE.md §7, [[feedback_sonar_fifth_check]], [[feedback_sonar_gate_status_check]]):
1. `pnpm -r test`
2. `pnpm lint` *(includes the SDK guard + the Brique-1 frontmatter gardien)*
3. `pnpm build`
4. `pnpm --filter @mas/web smoke`
5. Sonar clean — `scripts/sonar-pr-issues.sh <pr>` exits 0 (zero open issues, zero to-review hotspots) **and** `qualitygates/project_status == OK`, on the HEAD sha. Read `docs/knowledge/sonar-recurring-rules.md` before writing UI/test code.

### 0.3 Anti-template — this is a UI done-criterion, not a nicety
The delivered surface MUST show **≥4 intentional design qualities** (hierarchy, rhythm, depth, designed hover/focus states) — never raw Tailwind/shadcn default (CLAUDE.md §7). Reuse the existing design system: `surface` cards, `var(--text-primary|secondary|muted)`, `var(--accent|accent-soft)`, `mono` badges, the active-rail glow used in `Sidebar.tsx`. No new color invented without reusing the token set.

### 0.4 No fixture divergence
The tab reads **real candidate rows + real on-disk fiches** — never a static fixtures file ([[project_ui-fixtures-vs-seed]]: `/studio` + `/agents` render `apps/web/lib/fixtures.ts` and silently diverge from the DB). Brique 5 must not add to that debt: read `getDb()` + the filesystem, not fixtures.

### 0.5 Two decisions resolved here (recommended defaults — flag to user, do not silently reopen)
- **Route placement (Decision A):** new route `apps/web/app/(cockpit)/knowledge/` with nav label **"Connaissances"**, placed in the `primary` nav group directly under **Memory** (sibling: Memory = the runtime second-brain *registers*; Connaissances = the ingested *resources/fiches*). The spec says "sur la console Arsenal", but that unified Arsenal management console ([[project_ui_arsenal_console]]) is a **separate, larger backlog item** and is not built yet. Brique 5 ships as its own route now, with the internal tab shell sized so it can later be *folded into* the Arsenal console as one of its tabs (the socket = the `<KnowledgeConsole>` client component is console-agnostic).
- **v1 scope (Decision B):** ship the **operable core** + leave the heavier viewers as sockets. See §0.6.

### 0.6 Scope boundary — v1 vs deferred leaves
**v1 (this plan) = 3 internal tabs:**
- **Inbox** — `pending` candidates (accept→promote / edit / reject) + the `capture_failed` **dead-letter** lane (retry / skip, with the human reason) + a **review-debt** counter (pending older than a threshold) + the classifier decision shown read-only + a dossier link when present + a banner surfacing the **5 capture gates** with the 2 wired (drop-folder, CLI) live and 3 (URL-paste, upload, chat-intent) marked "à venir".
- **Connaissances (Browse)** — distilled fiches from `docs/knowledge/**` + raw from `docs/resources/**` with the **6 badges** (provenance/`derived_from` · lifecycle · trust · re-audit date · freshness) + **filter** by lane / doc_type / tag + **MOC grouping** (manifest parent → `part_of` children, never orphaned).
- **Santé (Health)** — QMD collection health via `retrievalDoctor` (incl. the 5th `mas-resources` collection, **never silent**) + golden-set recall@k + the consolidation log "propose diffs" list (read-only).

**Deferred leaves (backlog cards, sockets present, NOT built here):**
- The 3 unwired capture gates' input UI (URL-paste box, upload dropzone, chat-intent) — they hang off `captureOne()`; adding each = one server action + one input (a URL-paste box is included as the **optional Task 7** because its extractor lands with #55).
- The full intake-dossier *renderer* (v1 links to `dossierPath`; rendering its markdown inline is a leaf).
- Classifier-decision **override/edit** (v1 shows it read-only).
- The "propose diffs" **apply** action (v1 lists proposed supersede diffs read-only; applying them is the Keeper's `supersede-apply` path, surfaced later).

Each deferred leaf gets a one-line backlog card in `docs/backlog/` at the end (Task 8).

---

## 1. File structure (created / modified)

**Task 1 — pure read/derive logic (zero React, TDD):**
- Create: `apps/web/lib/resources.ts` — `loadFiches()`, `badgesFor()`, `groupByManifest()`, `filterFiches()`, `reviewDebt()`, `inboxLanes()` (all pure or thin FS wrappers)
- Create: `apps/web/lib/resources.test.ts`

**Task 2 — server actions (mutations, guarded):**
- Create: `apps/web/app/(cockpit)/knowledge/actions.ts` — `retryCapture`, `skipCapture`, `promoteResource` (+ reuse of the existing candidate accept/reject/edit endpoints)
- Create: `apps/web/app/(cockpit)/knowledge/actions.test.ts`

**Task 3 — Inbox tab:**
- Create: `apps/web/components/knowledge/IngestionInbox.tsx`
- Create: `apps/web/components/knowledge/CaptureGatesBanner.tsx`
- Create: `apps/web/components/knowledge/ReviewDebtBadge.tsx`

**Task 4 — Connaissances (Browse) tab:**
- Create: `apps/web/components/knowledge/ResourceList.tsx`
- Create: `apps/web/components/knowledge/ResourceBadges.tsx`
- Create: `apps/web/components/knowledge/BrowseFilters.tsx`

**Task 5 — Santé (Health) tab:**
- Create: `apps/web/components/knowledge/HealthPanel.tsx`

**Task 6 — route + tab shell + nav wiring:**
- Create: `apps/web/app/(cockpit)/knowledge/page.tsx` (server component — fetches data, renders shell)
- Create: `apps/web/app/(cockpit)/knowledge/error.tsx` (mirror the existing per-route `error.tsx`)
- Create: `apps/web/components/knowledge/KnowledgeConsole.tsx` (client — the 3-tab shell, mirrors `AgentControlPanel`)
- Modify: `apps/web/components/Sidebar.tsx:11-16` (add the nav item)
- Modify: `apps/web/lib/i18n.ts` (add `nav.knowledge` key, fr + en)

**Task 7 (optional v1) — URL-paste capture gate:**
- Modify: `apps/web/app/(cockpit)/knowledge/actions.ts` (add `captureUrl`)
- Modify: `apps/web/components/knowledge/CaptureGatesBanner.tsx` (wire the URL input)

**Task 8 — backlog cards for deferred leaves:**
- Create: `docs/backlog/knowledge-cockpit-deferred-leaves.md`

---

## Task 1: pure read/derive logic (`apps/web/lib/resources.ts`)

**Why first:** the route stays thin and the logic is unit-testable without a browser. Everything that can be a pure function (badge derivation, manifest grouping, filtering, review-debt) is one, so the React tasks only wire props.

**Reference the real types** (read them at build to avoid drift):
- `FicheSchema` / `Fiche` — `packages/memory/src/fiche.ts` (fields: `derived_from`, `sources[]`, `lifecycle`, `trust`, `next_audit?`, `freshness?.ttl_days`, `lane`, `doc_type`, `tags[]`, `part_of`, `order`, `manifest`, `quality_score`).
- candidate row — `packages/db/src/schema.ts` `memoryCandidates` (fields: `id`, `type`, `body`, `status` ∈ `pending|accepted|rejected|capture_failed`, `sourceKind`, `dossierPath`, `classifierDecision`, `autoFiled`, `sourceKey`, `trust`, `createdAt`).

**Files:** Create `apps/web/lib/resources.ts` + `apps/web/lib/resources.test.ts`.

- [ ] **Step 1: Write the failing test**

`apps/web/lib/resources.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { badgesFor, groupByManifest, filterFiches, reviewDebt, type FicheRow } from './resources';

const fiche = (over: Partial<FicheRow> = {}): FicheRow => ({
  id: 'res-x', slug: 'x', path: 'docs/knowledge/x.md',
  derived_from: 'docs/resources/x.pdf', sources: [],
  lifecycle: 'active', trust: 'trusted', lane: 'knowledge',
  doc_type: 'reference', tags: ['prompting'],
  part_of: null, order: null, manifest: null,
  next_audit: '2026-09-01', freshness: { ttl_days: 90 },
  ...over,
});

describe('badgesFor', () => {
  it('emits provenance, lifecycle, trust, re-audit and freshness badges', () => {
    const b = badgesFor(fiche());
    const labels = b.map((x) => x.label);
    expect(labels).toContain('active');          // lifecycle
    expect(labels).toContain('trusted');         // trust
    expect(b.some((x) => x.kind === 'provenance' && x.label.includes('x.pdf'))).toBe(true);
    expect(b.some((x) => x.kind === 'reaudit' && x.label.includes('2026-09-01'))).toBe(true);
    expect(b.some((x) => x.kind === 'freshness' && x.label.includes('90'))).toBe(true);
  });
  it('flags an untrusted fiche with a danger tone (never auto-trusted)', () => {
    const b = badgesFor(fiche({ trust: 'untrusted' }));
    expect(b.find((x) => x.kind === 'trust')?.tone).toBe('danger');
  });
});

describe('groupByManifest', () => {
  it('nests children under their manifest parent, never orphaning them', () => {
    const parent = fiche({ id: 'res-course', manifest: { kind: 'course', role: 'manifest' } });
    const c1 = fiche({ id: 'res-course-1', part_of: 'res-course', order: 1 });
    const c2 = fiche({ id: 'res-course-2', part_of: 'res-course', order: 2 });
    const groups = groupByManifest([c2, parent, c1]);   // unordered input
    const g = groups.find((x) => x.parent.id === 'res-course');
    expect(g?.children.map((c) => c.id)).toEqual(['res-course-1', 'res-course-2']); // sorted by order
  });
  it('lists a standalone fiche as its own group with no children', () => {
    const groups = groupByManifest([fiche({ id: 'res-solo' })]);
    expect(groups).toEqual([{ parent: expect.objectContaining({ id: 'res-solo' }), children: [] }]);
  });
});

describe('filterFiches', () => {
  it('filters by lane, doc_type and tag (AND semantics)', () => {
    const a = fiche({ id: 'a', lane: 'knowledge', doc_type: 'reference', tags: ['prompting'] });
    const b = fiche({ id: 'b', lane: 'workflows', doc_type: 'howto', tags: ['ci'] });
    expect(filterFiches([a, b], { lane: 'knowledge' }).map((f) => f.id)).toEqual(['a']);
    expect(filterFiches([a, b], { tag: 'ci' }).map((f) => f.id)).toEqual(['b']);
    expect(filterFiches([a, b], {})).toHaveLength(2);
  });
});

describe('reviewDebt', () => {
  const now = Date.parse('2026-06-29T00:00:00Z');
  it('counts pending candidates older than the threshold', () => {
    const rows = [
      { status: 'pending', createdAt: Date.parse('2026-06-01T00:00:00Z') }, // 28d old → debt
      { status: 'pending', createdAt: Date.parse('2026-06-28T00:00:00Z') }, // 1d old → fresh
      { status: 'capture_failed', createdAt: 0 },                            // not pending → ignored
    ];
    expect(reviewDebt(rows, { now, thresholdDays: 14 })).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/web test resources`
Expected: FAIL — `Cannot find module './resources'`.

- [ ] **Step 3: Write minimal implementation**

`apps/web/lib/resources.ts` — pure helpers + a thin FS loader. `FicheRow` is the subset of `Fiche` the UI needs plus the on-disk `path`. Keep every fn under the §7 50-line bar.
```typescript
import 'server-only';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { FicheSchema } from '@mas/memory';   // re-exported from packages/memory/src/index.ts

export type Tone = 'neutral' | 'accent' | 'warning' | 'danger' | 'success';
export type BadgeKind = 'provenance' | 'lifecycle' | 'trust' | 'reaudit' | 'freshness';
export interface Badge { kind: BadgeKind; label: string; tone: Tone }

export interface FicheRow {
  id: string; slug: string; path: string;
  derived_from: string; sources: string[];
  lifecycle: string; trust: string; lane: string; doc_type: string; tags: string[];
  part_of: string | null; order: number | null;
  manifest: { kind: string; role: string } | null;
  next_audit?: string; freshness?: { ttl_days: number };
}

const TRUST_TONE: Record<string, Tone> = { trusted: 'success', low: 'warning', untrusted: 'danger' };
const LIFECYCLE_TONE: Record<string, Tone> = { active: 'success', superseded: 'warning', archived: 'neutral' };

export function badgesFor(f: FicheRow): Badge[] {
  const out: Badge[] = [];
  const prov = f.derived_from || f.sources[0];
  if (prov) out.push({ kind: 'provenance', label: prov, tone: 'neutral' });
  out.push({ kind: 'lifecycle', label: f.lifecycle, tone: LIFECYCLE_TONE[f.lifecycle] ?? 'neutral' });
  out.push({ kind: 'trust', label: f.trust, tone: TRUST_TONE[f.trust] ?? 'neutral' });
  if (f.next_audit) out.push({ kind: 'reaudit', label: `re-audit ${f.next_audit}`, tone: 'accent' });
  if (f.freshness) out.push({ kind: 'freshness', label: `ttl ${f.freshness.ttl_days}j`, tone: 'neutral' });
  return out;
}

export interface ManifestGroup { parent: FicheRow; children: FicheRow[] }

export function groupByManifest(fiches: FicheRow[]): ManifestGroup[] {
  const childrenOf = new Map<string, FicheRow[]>();
  for (const f of fiches) {
    if (f.part_of) (childrenOf.get(f.part_of) ?? childrenOf.set(f.part_of, []).get(f.part_of)!).push(f);
  }
  const parents = fiches.filter((f) => !f.part_of);
  return parents.map((parent) => ({
    parent,
    children: (childrenOf.get(parent.id) ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }));
}

export interface FicheFilter { lane?: string; doc_type?: string; tag?: string }

export function filterFiches(fiches: FicheRow[], f: FicheFilter): FicheRow[] {
  return fiches.filter(
    (x) =>
      (!f.lane || x.lane === f.lane) &&
      (!f.doc_type || x.doc_type === f.doc_type) &&
      (!f.tag || x.tags.includes(f.tag)),
  );
}

const DAY_MS = 86_400_000;

export function reviewDebt(
  rows: { status: string; createdAt: number }[],
  opts: { now: number; thresholdDays: number },
): number {
  const cutoff = opts.now - opts.thresholdDays * DAY_MS;
  return rows.filter((r) => r.status === 'pending' && r.createdAt < cutoff).length;
}

/** Thin FS loader: parse one .md into a FicheRow (or null if it has no fiche frontmatter). */
export function loadFiche(path: string): FicheRow | null {
  const parsed = matter(readFileSync(path, 'utf8'));
  const result = FicheSchema.safeParse(parsed.data);
  if (!result.success) return null;
  const d = result.data;
  return {
    id: d.id, slug: d.slug, path,
    derived_from: d.derived_from, sources: d.sources,
    lifecycle: d.lifecycle, trust: d.trust, lane: d.lane, doc_type: d.doc_type, tags: d.tags,
    part_of: d.part_of, order: d.order, manifest: d.manifest,
    next_audit: d.next_audit, freshness: d.freshness,
  };
}
```
> Note: `loadFiches(globRoots)` (the directory walker) is a thin wrapper over `loadFiche` + a glob of `docs/knowledge/**/*.md` + `docs/resources/**/*.md`; it is exercised by the smoke test (Task 6), not unit-tested (it is pure FS I/O). Confirm `FicheSchema` is exported from `@mas/memory`'s `index.ts` at build; if not, add the re-export (one line) in `packages/memory/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes** — `pnpm --filter @mas/web test resources` → PASS.

- [ ] **Step 5: Commit**
```bash
git add apps/web/lib/resources.ts apps/web/lib/resources.test.ts
git commit -m "feat(web): knowledge resources read/derive logic (badges, manifest, filter, debt)"
```

---

## Task 2: server actions (guarded mutations)

**Files:** Create `apps/web/app/(cockpit)/knowledge/actions.ts` + `actions.test.ts`. Mutations: retry a dead-lettered capture, skip (→ rejected), promote a resource cold→hot. **§5 risk gate:** a capture retry re-runs an extractor on an untrusted source — it must never auto-promote (`trust: untrusted` stays until human review); `promoteResource` refuses an `untrusted` source (security invariant, design spec §5 Brique 6). Mirror the existing server-action style in `apps/web/app/(cockpit)/*-actions.ts` (`'use server'`, `revalidatePath`).

- [ ] **Step 1: Write the failing test** (pure guard logic extracted so it is testable without a DB)

`apps/web/app/(cockpit)/knowledge/actions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { canPromote, nextStatusForSkip } from './actions';

describe('canPromote (security invariant: untrusted never auto-promotes)', () => {
  it('refuses an untrusted source', () => {
    expect(canPromote({ trust: 'untrusted', status: 'pending' })).toEqual({ ok: false, reason: expect.stringMatching(/untrusted/) });
  });
  it('allows a trusted pending candidate', () => {
    expect(canPromote({ trust: 'trusted', status: 'pending' })).toEqual({ ok: true });
  });
  it('refuses a low-trust (OCR) source until human cross-check', () => {
    expect(canPromote({ trust: 'low', status: 'pending' }).ok).toBe(false);
  });
});

describe('nextStatusForSkip', () => {
  it('skips a dead-lettered capture to rejected (kept, not deleted)', () => {
    expect(nextStatusForSkip('capture_failed')).toBe('rejected');
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `pnpm --filter @mas/web test knowledge/actions` → FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

`apps/web/app/(cockpit)/knowledge/actions.ts`:
```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { getDb, memoryCandidates } from '@mas/db';
import { eq } from 'drizzle-orm';
import { captureOne } from '@mas/memory';   // conveyor CLI entry (confirm export name vs merged brique-6)

export interface Guard { ok: true } 
type GuardFail = { ok: false; reason: string };

// Pure, unit-tested. Untrusted/low sources are NEVER auto-promotable (design spec §5).
export function canPromote(c: { trust: string | null; status: string }): Guard | GuardFail {
  if (c.trust === 'untrusted') return { ok: false, reason: 'untrusted source — human review required' };
  if (c.trust === 'low') return { ok: false, reason: 'low-trust (OCR) — human cross-check required' };
  return { ok: true };
}

export function nextStatusForSkip(_from: string): 'rejected' { return 'rejected'; }

export async function skipCapture(formData: FormData): Promise<void> {
  const id = String(formData.get('id'));
  const db = getDb();
  const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, id));
  if (!row) return;
  await db.update(memoryCandidates).set({ status: nextStatusForSkip(row.status) }).where(eq(memoryCandidates.id, id));
  revalidatePath('/knowledge');
}

export async function retryCapture(formData: FormData): Promise<void> {
  const id = String(formData.get('id'));
  const db = getDb();
  const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, id));
  if (!row?.sourceKey) return;
  // Re-run the extractor for this source. The conveyor re-stamps trust; an untrusted result stays untrusted.
  await captureOne(db, row.sourceKey, { /* deps wired against merged brique-6 (budgetBlocked, llm) */ });
  revalidatePath('/knowledge');
}

export async function promoteResource(formData: FormData): Promise<void> {
  const id = String(formData.get('id'));
  const db = getDb();
  const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, id));
  if (!row) return;
  const gate = canPromote(row);
  if (!gate.ok) return;   // surfaced to the user as a disabled button + reason in the UI (Task 3)
  // cold→hot: route through the existing candidate-promote path (Keeper-owned). Confirm the exact
  // export against merged brique-6; reuse promoteCandidate rather than writing a new write-path.
  await db.update(memoryCandidates).set({ status: 'accepted' }).where(eq(memoryCandidates.id, id));
  revalidatePath('/knowledge');
}
```
> Build-time note: `captureOne` + the promote write-path live in the merged brique-6. Confirm the exact export names + the `PipelineDeps` shape (`budgetBlocked`, `llm`) against the base branch and wire the budget gate from the `budgets` table — never call an LLM unbudgeted (design spec §5 Brique 6 budget guard). If the distill-on-promote needs the worker, this action enqueues (sets status) and the worker runs the distill stage; do NOT run an unbounded LLM loop inside a request.

- [ ] **Step 4: Run test to verify it passes** — `pnpm --filter @mas/web test knowledge/actions` → PASS.

- [ ] **Step 5: Commit**
```bash
git add apps/web/app/\(cockpit\)/knowledge/actions.ts apps/web/app/\(cockpit\)/knowledge/actions.test.ts
git commit -m "feat(web): knowledge inbox server actions (retry/skip/promote) with trust guard"
```

---

## Task 3: Inbox tab

**Files:** Create `apps/web/components/knowledge/IngestionInbox.tsx`, `CaptureGatesBanner.tsx`, `ReviewDebtBadge.tsx`. Server-rendered list (data passed as props from the route); mutations via the Task-2 form actions. Mirror `/memory` page's row markup (mono badges, `surface` rows, form buttons) but split into focused components (§7 file-length). Each row shows: `type` + `sourceKind` + `trust` badge + body + the classifier decision (`classifierDecision`) read-only + a `dossierPath` link when present.

- [ ] **Step 1: `ReviewDebtBadge.tsx`** — pure presentational. Renders `N en attente de revue` with a `warning` tone when `count > 0`, muted when 0. Props: `{ count: number }`. Uses `var(--warning)` / `var(--text-muted)`.

- [ ] **Step 2: `CaptureGatesBanner.tsx`** — renders the **5 gates** as a row of chips: `drop-folder` + `CLI` live (accent), `URL-paste` + `upload` + `chat-intent` muted with an `à venir` suffix. Props: `{ urlGate?: React.ReactNode }` (Task 7 injects the live URL input here; until then the slot is the muted chip).

- [ ] **Step 3: `IngestionInbox.tsx`** — two sections in one card: **À trier** (`pending` rows, each with Accept→`promoteResource` / Edit / Reject) and **Échecs de capture** (`capture_failed` rows, each with the dead-letter reason from `classifierDecision`, a Retry→`retryCapture` and a Skip→`skipCapture`). A `promoteResource` button on an `untrusted`/`low` row is rendered **disabled** with the `canPromote` reason as a tooltip (never silently droppable). Props:
```typescript
type CandidateRow = {
  id: string; type: string; body: string; status: 'pending' | 'capture_failed';
  sourceKind: string | null; trust: string | null; classifierDecision: string | null; dossierPath: string | null;
};
export function IngestionInbox({ pending, failed, reviewDebt }: Readonly<{
  pending: CandidateRow[]; failed: CandidateRow[]; reviewDebt: number;
}>): React.JSX.Element
```
Design qualities (≥4, §0.3): (1) hierarchy — section headers + count chips like `/memory`; (2) rhythm — `space-y-2` rows, consistent chip padding; (3) depth — nested `surface` rows on the card; (4) designed states — `hover:bg-[color:var(--bg-hover)]` on rows, `focus-visible` ring on buttons, disabled-promote affordance with reason.

- [ ] **Step 4: Wire the components into a smoke-checkable shell** (full render happens in Task 6). No standalone test — these are presentational; they are covered by `pnpm --filter @mas/web smoke` (Task 6) + the design-quality review.

- [ ] **Step 5: Commit**
```bash
git add apps/web/components/knowledge/IngestionInbox.tsx apps/web/components/knowledge/CaptureGatesBanner.tsx apps/web/components/knowledge/ReviewDebtBadge.tsx
git commit -m "feat(web): knowledge ingestion inbox (pending + dead-letter + review-debt + gates)"
```

---

## Task 4: Connaissances (Browse) tab

**Files:** Create `apps/web/components/knowledge/ResourceList.tsx`, `ResourceBadges.tsx`, `BrowseFilters.tsx`. Reads `FicheRow[]` (from `loadFiches`, passed as props) → `groupByManifest` → render manifest parents with nested children; `BrowseFilters` drives `filterFiches` via URL search params (server-component re-fetch, like `/memory`'s `?source=` filter — no client state needed).

- [ ] **Step 1: `ResourceBadges.tsx`** — maps `badgesFor(fiche)` → chips, one tone class per `Tone` (`success`/`warning`/`danger`/`accent`/`neutral` → the matching `var(--*)`). Provenance badge is `mono` + truncated with a `title` tooltip. Props: `{ fiche: FicheRow }`.

- [ ] **Step 2: `BrowseFilters.tsx`** — three filter chip-rows (lane / doc_type / tag), each a `<Link href="/knowledge?tab=browse&lane=...">` toggling the active value (reuse the exact pattern from `/memory` page lines 53-77). Active chip = `var(--accent)` bg + white; inactive = `var(--bg-hover)`. Props: `{ lanes: string[]; docTypes: string[]; tags: string[]; active: FicheFilter }`.

- [ ] **Step 3: `ResourceList.tsx`** — for each `ManifestGroup`: a parent row (title + `manifest.kind` chip + `ResourceBadges`) and, when `children.length > 0`, an indented MOC list (`order. [[childId]] — title`, linking each child) so a 12-lesson course shows as 1 parent + 12 ordered children, never 12 orphans. A standalone fiche renders as a single row. Props: `{ groups: ManifestGroup[] }`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/components/knowledge/ResourceList.tsx apps/web/components/knowledge/ResourceBadges.tsx apps/web/components/knowledge/BrowseFilters.tsx
git commit -m "feat(web): knowledge browse (badges + lane/type/tag filter + MOC grouping)"
```

---

## Task 5: Santé (Health) tab

**Files:** Create `apps/web/components/knowledge/HealthPanel.tsx`. Renders three never-silent panels from data the route fetches server-side: (a) QMD collection health via `retrievalDoctor()` (`packages/memory/src/retriever.ts`) — one row per collection incl. the 5th `mas-resources`, with a `success`/`danger` dot and the FTS-fallback note when QMD is down (doctor never-silent, [[project_phase9a2_qmd]]); (b) golden-set recall@k from the eval (`packages/memory/src/eval.ts` + `golden-queries.json`) — a single `recall@k = X` stat with the run date; (c) consolidation "propose diffs" — a read-only list of proposed supersede pairs (from `planSupersede` over the current fiches, or the tail of `docs/knowledge/consolidation-log.md`), each shown as `oldId → newId (lane, date)`.

- [ ] **Step 1: Implement `HealthPanel.tsx`** — props are the already-fetched results (the route does the async calls; the component is presentational):
```typescript
export function HealthPanel({ collections, recall, proposedDiffs }: Readonly<{
  collections: { name: string; healthy: boolean; note?: string }[];
  recall: { value: number; k: number; ranAt: string } | null;
  proposedDiffs: { oldId: string; newId: string; lane: string; date: string }[];
}>): React.JSX.Element
```
Render each panel as a `surface` sub-card with a header + count. If `recall` is null (eval not yet run) show a muted "non encore mesuré" — never blank. Design states: collection dots glow (`glow-accent` when healthy), the proposed-diff rows have a hover affordance even though they are read-only in v1.

- [ ] **Step 2: Commit**
```bash
git add apps/web/components/knowledge/HealthPanel.tsx
git commit -m "feat(web): knowledge health panel (QMD doctor + recall@k + propose-diffs)"
```

---

## Task 6: route + tab shell + nav wiring + the gate

**Files:** Create `apps/web/app/(cockpit)/knowledge/page.tsx`, `error.tsx`, `apps/web/components/knowledge/KnowledgeConsole.tsx`; modify `Sidebar.tsx`, `lib/i18n.ts`.

- [ ] **Step 1: `KnowledgeConsole.tsx`** — the client tab shell, mirroring `AgentControlPanel.tsx` exactly (a `TabKey = 'inbox' | 'browse' | 'health'`, the same nav-button markup + `var(--accent-soft)` active style). It receives all three tabs' pre-rendered content as props (server components passed as `children`-style props) so the heavy data work stays on the server:
```typescript
'use client';
export function KnowledgeConsole({ inbox, browse, health }: Readonly<{
  inbox: React.ReactNode; browse: React.ReactNode; health: React.ReactNode;
}>): React.JSX.Element
```
Tabs: `Inbox` (icon `Inbox`), `Connaissances` (icon `Library`), `Santé` (icon `Activity`) from lucide-react.

- [ ] **Step 2: `page.tsx`** — server component, `export const dynamic = 'force-dynamic'`. Reads `searchParams` for the active tab + browse filters (like `/memory`). Fetches: candidate rows (`getDb()` → `memoryCandidates` where status in pending/capture_failed), `loadFiches([...roots])`, `retrievalDoctor()`, the eval recall, the consolidation tail. Derives `reviewDebt`, `groupByManifest`, `filterFiches`, `inboxLanes`. Renders `<KnowledgeConsole inbox={<IngestionInbox .../>} browse={<><BrowseFilters/><ResourceList/></>} health={<HealthPanel .../>} />`. Wrap the FS + QMD reads in try/catch so a missing `docs/resources/` never 500s the page (degrade to empty + a muted note — never silent).

- [ ] **Step 3: `error.tsx`** — copy the existing per-route `error.tsx` (e.g. `apps/web/app/(cockpit)/memory/error.tsx`) verbatim, retitled, so the route has its boundary ([[project_ui_redesign]] error-boundary sweep).

- [ ] **Step 4: nav + i18n** — `Sidebar.tsx`: add `{ href: '/knowledge', key: 'nav.knowledge', icon: Library }` to the `primary` array right after the Memory item (import `Library` from lucide-react). `lib/i18n.ts`: add `'nav.knowledge'` → `'Connaissances'` (fr) / `'Knowledge'` (en).

- [ ] **Step 5: Run the full 5-check gate**
```bash
pnpm -r test && pnpm lint && pnpm build && pnpm --filter @mas/web smoke
```
The smoke run MUST cover `/knowledge` (add it to the smoke route list if the harness enumerates routes explicitly). Then push (draft PR) and run check 5:
```bash
git push -u origin <branch>
# poll until the HEAD-sha analysis lands, then:
bash scripts/sonar-pr-issues.sh <pr>   # exit 0 + qualitygates/project_status == OK
```
Fix everything Sonar lists (read `docs/knowledge/sonar-recurring-rules.md` first — UI/test code recurring rules).

- [ ] **Step 6: Design-quality self-check (§0.3)** — open the route (or screenshot via the webapp-testing skill) and confirm ≥4 intentional qualities are *visible*, not just coded: hierarchy (tabs + section headers), rhythm (consistent chip/row spacing), depth (nested surfaces), designed hover/focus on rows + buttons. If it reads as raw shadcn/Tailwind default, iterate before claiming done ([[project_ui_redesign]]: "colors ≠ design").

- [ ] **Step 7: Commit**
```bash
git add apps/web/app/\(cockpit\)/knowledge apps/web/components/knowledge/KnowledgeConsole.tsx apps/web/components/Sidebar.tsx apps/web/lib/i18n.ts
git commit -m "feat(web): knowledge cockpit route + tab shell + nav (Brique 5)"
```

---

## Task 7 (optional v1): URL-paste capture gate

**Why optional-but-now:** the URL extractor (Defuddle+Turndown) lands with #55 / the in-flight extractor branch, so this gate is cheap to wire and demonstrates the inbox end-to-end. If the extractor is not yet merged into the base at build time, SKIP this task and leave the muted `URL-paste à venir` chip.

**Files:** Modify `apps/web/app/(cockpit)/knowledge/actions.ts` (add `captureUrl`), `CaptureGatesBanner.tsx` (inject a live URL input into the `urlGate` slot).

- [ ] **Step 1:** Add `captureUrl(formData)` to `actions.ts` — reads `url`, validates it is an `http(s)` URL (Zod `z.string().url()`), calls `captureOne(db, url, deps)` (the conveyor infers `source_kind='url'`), `revalidatePath('/knowledge')`. The result is `trust: untrusted` until review (anti-injection invariant) — it lands in the Inbox `pending` lane, never auto-promoted.
- [ ] **Step 2:** In `CaptureGatesBanner.tsx`, replace the muted URL chip with a small `<form action={captureUrl}>` (one input + a "Capturer" button), styled to match the design system.
- [ ] **Step 3:** Run the 5-check gate. Manually verify a real article URL produces a `pending` `untrusted` row.
- [ ] **Step 4: Commit** — `feat(web): URL-paste capture gate wired to the conveyor`.

---

## Task 8: backlog cards for the deferred leaves

**Files:** Create `docs/backlog/knowledge-cockpit-deferred-leaves.md`. One short card per deferred leaf (§0.6), each naming its socket so it is a bolt-on, not a redo ([[feedback_completeness-over-yagni]]):
- upload-dropzone gate (socket: `captureOne` + a server action)
- chat-intent gate (socket: `captureCandidates` from the Manager chat)
- intake-dossier inline renderer (socket: `dossierPath` already linked)
- classifier-decision override/edit (socket: `classifierDecision` shown read-only)
- propose-diffs **apply** action (socket: `supersede-apply` path + the read-only list)

- [ ] **Commit** — `docs(backlog): knowledge cockpit deferred leaves (sockets named)`.

---

## Verification / done-criteria

- **Per task:** the 5-check gate (§0.2) green on the HEAD sha, Sonar polled + clean.
- **Brique 5 overall:** the `/knowledge` route renders the 3 tabs from **real** data (no fixtures, §0.4); the Inbox shows `pending` + the `capture_failed` dead-letter lane (retry/skip) + the review-debt counter; Browse shows the 6 badges + lane/doc_type/tag filter + MOC manifest grouping; Santé shows QMD doctor (5 collections, never silent) + recall@k + propose-diffs; an `untrusted`/`low` source can never be promoted from the UI (security invariant test, Task 2); the surface shows ≥4 intentional design qualities (§0.3); `pnpm --filter @mas/web smoke` covers the route.
- **Anti-regression:** no new fixture divergence; no mutation writes outside the candidate table / the Keeper-owned promote path; the budget gate fronts every LLM-touching action (retry/promote/URL-capture).

---

## Self-review (run against design spec §5 Brique 5 + round-2 plan Task 4)

- **§5 Brique 5 "Inbox d'ingestion : les 5 portes + capture_failed + dette de revue"** → Task 3 (gates banner + dead-letter lane + review-debt) ✓.
- **§5 "visionneuse de dossier intake, revue de décision du classifieur"** → Task 3 surfaces `dossierPath` link + `classifierDecision` read-only; full inline viewer + edit = deferred leaves (Task 8) ✓.
- **§5 "promotion froid→chaud explicite (jamais tout-chaud)"** → Task 2 `promoteResource` (explicit, per-row, trust-guarded) ✓.
- **§5 "badges provenance / derived_from / lifecycle / re-audit / trust / freshness"** → Task 1 `badgesFor` + Task 4 `ResourceBadges` ✓ (6 badges, tested).
- **§5 "browse par voie / doc_type / MOC / tag"** → Task 1 `filterFiches` + `groupByManifest` + Task 4 `BrowseFilters`/`ResourceList` ✓.
- **§5 "panneau santé : consolidation propose-diffs + golden recall@k + santé QMD (never-silent)"** → Task 5 `HealthPanel` ✓.
- **Round-2 plan Task 4 done-criteria** (smoke covers route · ≥4 design qualities · real candidate rows · 5-check green) → Task 6 steps 5-6 ✓.
- **Type consistency:** `FicheRow`/`Badge`/`ManifestGroup`/`FicheFilter`/`CandidateRow` are defined in Task 1/3 and reused identically in Tasks 4-6; candidate field names (`classifierDecision`, `dossierPath`, `trust`, `sourceKey`, `status`) match `memoryCandidates` verbatim; `canPromote`/`nextStatusForSkip` defined Task 2, used Task 3.
- **Placeholder scan:** the two build-time confirmations (`captureOne`/promote export names, `FicheSchema` re-export from `@mas/memory`) are explicit verify-against-merged-brique-6 steps, not TODOs — they exist on the base branch by §0.1 and only the exact symbol name needs confirming. UI components (Tasks 3-5) are specified at prop-contract + design-criteria altitude (presentational, gated by smoke + the §0.3 visual check) — matching how the parent plan sequenced Task 4.
```
