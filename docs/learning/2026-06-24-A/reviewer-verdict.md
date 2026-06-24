# Wave A — Cross-wave REVIEWER verdict (global / transverse)

> Role: transverse Reviewer (CAMPAIGN §3.5) — does Wave A break earlier waves or
> violate cross-cutting invariants? READ-ONLY: no source edit, no commit, no push.
> Branch `phase/9-audit-0a0b` HEAD `16730ae`, stacked on `phase/9b-pipeline` (0b).
> This is the **global** check; the Wave-A internal plan is the Checker's job.

## Verdict: **PASS** (global)

Wave A leaves 0b intact, holds every cross-cutting invariant end-to-end, sits as a
clean descendant of 0b, and defers nothing silently — each carry-forward has a named
target wave that matches the CAMPAIGN's own sequencing. No cross-wave regression found.

---

## Evidence

### 1 · Wave A does not break 0b — PASS
- `pnpm --filter @mas/agents test` → **25 files / 114 tests, 0 fail** (3.74s).
- The four named 0b suites all green:
  - `src/reviewers.test.ts` (11) ✓ · `src/dispatch-eval-loop.test.ts` (1) ✓
  - `src/dispatch-chaining.test.ts` (1) ✓ · `src/quality-controller-wiring.test.ts` (2) ✓
  - plus `dispatch.test.ts` (9), `dispatch-tick.test.ts` (6), `review-gate.test.ts` (4),
    `dispatch-delegate.test.ts` (1), `dispatch-arsenal.test.ts` (1) — full 0b pipeline path green.
- **Fiche loader tolerates the new `limits` key.** `reviewers.ts:52 loadFiche()` reads the
  fiche markdown **raw** (`readFileSync(path).trim()`) and injects it whole as the system
  prompt (`runCritic` l.109). There is **no YAML schema parse** that could reject an unknown
  key — `limits` is passed through as additional prompt context. `realQualityController`
  (`reviewers.ts:176`, `ficheId:'quality-controller'`) exercises exactly this path, and
  `quality-controller-wiring.test.ts` (2 tests) passes — empirical confirmation the eval/QC
  path still works after the fiche change.

### 2 · AGENTS.md coherence — PASS
- `git diff phase/9b-pipeline..HEAD -- AGENTS.md` → **empty** (Wave A did NOT touch it, as intended).
- The 6→7 roster fix is correctly routed to **0c**: CAMPAIGN §5 l.30/l.71/l.106 explicitly
  assign "`AGENTS.md` §3 (6→7, +`quality-controller`) + §7" to wave 0c. Build-report §3 finding
  U2 + §5 hand-off both name `→ 0c`. Drift is documented, not lost.

### 3 · Cross-cutting invariants end-to-end — PASS
- **§5 (no destructive ops):** diff grep for `rm -rf|reset --hard|--force|rmSync|unlinkSync|fs.rm`
  → only matches are **doc prose** in plan.md/build-report describing the guard. No code/config op.
- **§8 (Memory Keeper sole writer of `data/memory/`):** diff grep `data/memory` → only **doc prose**
  reaffirming the lock. No new write path added. Wave A is test-files + fiche + docs only.
- **§11 (billing isolation):** diff grep `@anthropic-ai/sdk` → only **doc prose**. PAYG guard
  `scripts/lint-no-sdk-payg.sh` → "PASS: no forbidden provider SDK imports", **exit 0**.
  `packages/core/src/providers/` diff stat → **empty** (untouched). `packages/core/src/llm.ts`
  (single LLM injection point) diff stat → **empty** (unchanged).

### 4 · Stacked-branch integrity — PASS
- `git merge-base --is-ancestor phase/9b-pipeline HEAD` → **true** (HEAD is a clean descendant; 0b history not rewritten).
- Commits on top of 0b are **exactly the 4 Wave A commits**, no unrelated work:
  - `4a7d0e6` docs(A): wave A plan
  - `4e28c74` test: specific assertions (S5906) — toHaveLength across 14 suites
  - `2cc9d83` docs(A): self-audit fix-now — quality-controller fiche limits key
  - `16730ae` docs(A): build report
- `git diff --name-only phase/9b-pipeline..HEAD` filtered against expected scope
  (`*.test.ts`, `quality-controller.md`, `docs/learning/2026-06-24-A/`) → **NONE outside scope**.
- S5906 spot-check (library / dispatch / conversations): every change is
  `expect(X.length).toBe(N)` → `expect(X).toHaveLength(N)`; symmetric `-`/`+` lines, no
  deleted assertion, no weakening, no `// NOSONAR`. Intent preserved.

### 5 · Honest reporting (deferred ≠ hidden failures) — PASS
Every deferred item has a named target consistent with the CAMPAIGN sequencing:
| Deferred item | Named target | CAMPAIGN confirmation |
|---|---|---|
| Live end-to-end project-memory demo (R4) | first real project mission / 0c-0d | empty corpus, wiring proven by green tests (`retriever.test.ts`/`context.test.ts`); §8 honoured (not fabricated) |
| Agents **consuming** the MCP brain (R3) | **0d** | CAMPAIGN l.21/l.107 — MCP-as-consumed-tool is 0d's scope |
| AGENTS.md roster 6→7 / §7 (U2) | **0c** | CAMPAIGN l.30/l.71/l.106 |
| `validateFiche()` runtime guard (U3) | **0c** | 0c owns fiche schema; U1 proves nothing catches a missing mandatory key today |
| `packages/tokens/` layout drift (U4) | backlog / ROADMAP §3 note | low-severity; §3 header already says "(planned)" |

---

## Cross-wave findings (severity-tagged)

- **[info]** No cross-wave regression detected. The only Wave A change that touches a 0b
  artifact is `quality-controller.md` (additive `limits:` key); the 0b loader is schema-agnostic
  (raw markdown injection) so the addition is inert to parsing and confirmed harmless by the
  green QC-wiring suite.
- **[info]** Wave A reports A2 (full-scan S5906 = 0) and A5 (Sonar exit 0) as **pending
  post-push** — this is the 5th check and is outside a READ-ONLY pre-push review's reach. Local
  evidence (27 genuine `toHaveLength` conversions, all 7 packages green) supports it but the
  authoritative confirmation is the post-push scan. Not a blocker for the **global** verdict;
  flagged so the gate step verifies it before the PR is considered done.
- **[info]** U3's observation is sound and worth carrying: §10 of AGENTS.md claims `registry.ts`
  rejects fiches missing mandatory keys, but no runtime `validateFiche` exists — correctly
  backlogged to 0c, where the fiche schema is already being touched.

---

## Decision JSON

```json
{
  "wave": "A",
  "role": "cross-wave-reviewer",
  "branch": "phase/9-audit-0a0b",
  "head": "16730ae",
  "base": "phase/9b-pipeline",
  "verdict": "PASS",
  "checks": {
    "breaks_0b": false,
    "agents_md_untouched_in_wave_A": true,
    "agents_md_drift_routed_to_0c": true,
    "fiche_loader_tolerates_limits_key": true,
    "invariant_s5_no_destructive_ops": "held",
    "invariant_s8_memory_keeper_sole_writer": "held",
    "invariant_s11_no_payg_sdk": "held",
    "providers_untouched": true,
    "llm_injection_point_unchanged": true,
    "clean_descendant_of_0b": true,
    "only_wave_A_commits_on_top": true,
    "no_out_of_scope_files": true,
    "deferred_items_have_named_targets": true
  },
  "zero_b_suites": {
    "reviewers.test.ts": "pass",
    "dispatch-eval-loop.test.ts": "pass",
    "dispatch-chaining.test.ts": "pass",
    "quality-controller-wiring.test.ts": "pass",
    "agents_total": "114/114"
  },
  "findings": [
    {"severity": "info", "msg": "no cross-wave regression; quality-controller limits key is inert to the raw-markdown fiche loader"},
    {"severity": "info", "msg": "A2/A5 Sonar exit-0 pending post-push — out of read-only review reach; verify at the gate"},
    {"severity": "info", "msg": "U3 validateFiche guard correctly backlogged to 0c"}
  ],
  "silently_dropped": false
}
```
