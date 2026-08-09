# Intake Audit — "Le God file : les 2 piliers d'architecture" (2026-07-31)

> **Candidate**: the VibeFlow / `@le_gouverneur_ia` companion page to the God-file video —
> pilier 1 *modulariser* (one reason to change per file, honest threshold) and pilier 2
> *vérifier au niveau du système* (a `PreToolUse` hook that denies the write, a CI check that
> denies the merge). Same author lineage as `docs/knowledge/vibeflow/`.
> **Source**: local export `~/Downloads/Private & Shared/Le God file …e91b5b36…md` (Notion page).

## Guardrails (step 0)

- **Local-first / subscription-only (§11)** ✓ — two shell scripts, `jq`, GitHub Actions. No key, no API, no PAYG.
- **No new framework (§3)** ✓ — no dependency added; one hook file + one script under existing folders.
- **Risky actions (§5)** ✓ — both guards are read-only + refusal-only; they never write or delete.
- **Token discipline (§6)** ✓ — the guards run outside the model (deterministic), cost ~0 tokens.
- **Anti-injection** ✓ — the hook reads a JSON payload from the harness, not model prose.

## Identity

- **What it is**: a method page (diagnosis → threshold doctrine → two enforcement floors → a bypass test), with copy-ready `settings.json`, hook script, CI script and ESLint/pylint equivalents.
- **Recency / obsolescence**: current (cites Claude Code hooks docs, Context Rot, Lost in the Middle). **Low** — the mechanism is the officially documented hook API.
- **Evidence maturity**: **4** — unusually well-sourced for this genre: Riel 1996 (god class), Martin (SRP), Fowler/Beck refusing a numeric criterion, Hatton's U-curve, Chroma Context Rot, Anthropic's own attention-budget page. It argues *against* the magic 500-line number rather than selling it.
- **Summary**:
  - The real defect is not "the agent can't read the whole file" — the harness already truncates *and warns*, and blocks the edit that follows. The gap is the **complacent report**: the model saw the warning and still says "done, context respected".
  - Long files manufacture **unread surface nobody counts**; the model fills the gap with what is probable.
  - A rule written in `CLAUDE.md` is an **intention**; only the harness enforces. Quote from the official docs: permission rules are enforced by Claude Code, *not by the model*.
  - Three floors: (1) hook before write — pedagogic, bypassable via the terminal; (2) pre-commit — bypassable with `--no-verify`; (3) CI + branch protection — **uncrossable**. Ship 1 and 3.
  - No universal line threshold exists (ESLint 300 · Sonar 750 · PMD 1500 · Checkstyle 2000). What matters is that a number **exists, is written, and is enforced by a machine**. Too low on day one ⇒ disabled within a week.
  - **The bypass test is the only proof**: ask for a 900-line file and watch what happens.

## Sanitize (step 4.bis)

Independent scan of the page: no secrets, no keys, no private IPs, no personal emails, no absolute home paths inside the payload. Contains two marketing links (audit booking, Skool community) — inert, not adopted. The copy-ready scripts execute locally, are fully readable (≈35 lines), use only `jq`/`awk`, perform **no network call** and **no write**. `curl | sh`: none. **PASS**.

## Fit (file/phase-linked)

This lands on an already-open wound. `CLAUDE.md` §7 has carried `file < 800` since the ECC harvest — written, cited in reviews, and enforced by **nothing**. The Bloc D hardening PR (#48) split three functions by hand (F-FN-1/2/3), i.e. the discipline was paid manually, one audit at a time. Meanwhile `packages/agents/src/dispatch.ts` drifted from 739 lines (post-#42) to **821** with no signal. The page's thesis — an unenforced rule is a wish — is empirically confirmed by our own repo.

**Duplicate analysis**: `scripts/lint-no-sdk-payg.sh` and `scripts/lint-frontmatter.sh` are the same *shape* of guard (deterministic gardien wired into `pnpm lint`) but for billing and frontmatter. No line-length guard existed. Sonar's `S104` is not active on our profile, and Sonar runs after the push, never before the write. The `PreToolUse` slot was empty — the repo had only `PostToolUse` + `SessionStart` hooks, i.e. it could observe but never refuse.

## Costs

- **Install**: ~40 min. Two scripts (~35 + ~25 lines), one `settings.json` entry, one `package.json` word.
- **Maintenance**: near-zero, except the exception list — every entry must own a backlog card or the guard rots into decoration.
- **Removal**: fully reversible — delete two files, revert two one-line edits.

## Score

`project_fit` **5** / `token_efficiency` **5** (runs outside the model) / `safety` **5** (refusal-only) /
`implementation_effort` **5** / `evidence_maturity` **4** / `user_value` **5** / `phase_compatibility` **5**.

## KILL check

No veto. Not PAYG, no external execution, no egress, no framework, no phase scope. The only real risk is *self-inflicted*: shipping a cap that current code violates, which gets the guard disabled within the week (the page's own error #3). Handled by the exception list + backlog card, not by weakening the number.

## Decision

**`adapt_now`** — both piliers adopted, three adaptations:

1. **Threshold = 800, not 500.** The page's own doctrine says the number matters less than its existence and its enforcement. We already have a written number in §7; inventing a second one would create doc-vs-machine drift — the exact failure mode being fixed. `MAX_LINES` is overridable for a later tightening.
2. **Source files only** (`.ts .tsx .js .mjs .cjs .sh .py`). Markdown stays editorially capped (§7 / CLAUDE.md ≤200 lines): the repo's largest files are docs and plans, and hook-blocking a doc write would break the Living Knowledge OS pipeline for no comprehension gain.
3. **Étage 3 wired into `pnpm lint`, not a separate workflow.** `pnpm lint` is already the 2nd of the five verification checks and already runs in `ci.yml` — one guard, both paths (local + CI), no second YAML to drift. `.github/workflows/file-size.yml` deliberately **not** created.

Étage 2 (pre-commit) skipped, as the page itself recommends: bypassable, and it would slow every commit for a floor étage 3 already holds.

## What it costs us that the page doesn't mention

The hook fires on **every** `Write`/`Edit` in every session — its own latency budget (10 s timeout) and its own failure mode: no `jq`, no guard. Ours exits 0 silently when `jq` is missing rather than blocking all writes, because étage 3 still holds. That trade is deliberate: a hook that breaks the session is a guard that gets removed.

## Plan — done in this pass

- `.claude/hooks/limit-file-size.sh` (étage 1) · `.claude/settings.json` → new `PreToolUse` block.
- `scripts/check-max-lines.sh` (étage 3) · wired into `package.json#lint`.
- `CLAUDE.md` §7: `file < 800` marked machine-enforced, pointing at both floors.
- `docs/backlog/dispatch-ts-god-file.md`: the one exception, with a binary DoD.
- Exemptions: vendored skill payloads (`.claude/skills/*/scripts/*`), generated/library/dist/.next/node_modules/data.

**Verification (all run)**: 900-line `.ts` payload ⇒ `permissionDecision: deny` with an actionable reason · 900-line `.md` ⇒ allowed · small `.ts` ⇒ allowed · `bash scripts/check-max-lines.sh` ⇒ `PASS: 333 source files under the 800-line cap`, exit 0 · `pnpm lint` green with the guard wired in.

**Do NOT**: do not lower the cap to 500 in one move (error #3) · do not extend the hook to markdown · do not add exceptions without a backlog card · do not trust the hook alone (the terminal bypasses it by design) · do not treat `pnpm lint` passing as proof the hook is alive — only the payload test proves that.

## Re-audit

**2027-01-31**, or on any of: `dispatch.ts` split (drop the exception, consider tightening to 600) · the exception list growing past 3 entries (the cap is wrong or the codebase is drifting) · Claude Code changing the `PreToolUse` decision schema · a second team member joining (then étage 2 + branch protection become worth their cost).
