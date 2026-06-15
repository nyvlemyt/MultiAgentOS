# Handoff — paste-ready prompts for the remaining items

As of 2026-06-15 the **autonomous backlog is exhausted**: items 1 (5b), 2a (tech-debt),
3a (8a), 4a (stack-detect), 5a+5b (hardening) are all shipped (PRs #13–#18). Everything
left needs a human decision, a real binary/login, or visual/UX judgement that can't be
verified unattended. Each section below is a **complete prompt** — open a fresh Claude Code
session at the repo root and paste the block. They follow the same pipeline discipline
(pre-flight → Doer/Checker subagents → 5 checks incl. Sonar exit 0 → PR, never merge).

Order by value: **2b → 4b/4c → self-audits → 3b → 6 → 7**.

---

## ▶ 2b · Move inline mission execution into the worker  *(attended — touches the e2e net)*

> Run AUTONOMOUSLY but I (the user) am AROUND to babysit the e2e. Implement
> `docs/backlog/run-inline-execution-in-next.md` §4: stop driving `executeNextTask` inline
> inside `apps/web/app/api/missions/[id]/run/route.ts`; instead have `/run` set the mission
> `dispatched` and let `apps/worker` advance it (the worker already does, with full skill+memory
> injection — `runDispatchTick`). The catch: the Playwright smoke (`apps/web/tests/lifecycle.spec.ts`)
> depends on the inline drive reaching the §5 gate. Rewire it: add a SECOND Playwright `webServer`
> running `apps/worker` against the SAME `MAS_DB_PATH=data/test/mas-smoke.db` with `MAS_MOCK_LLM=1`,
> and make the spec wait (poll) for the worker tick (1.5s) instead of expecting a synchronous modal.
> Watch for SQLite lock contention between the Next process and the worker (both open the file) —
> enable WAL (already on) and serialise if needed. Read `CLAUDE.md` (§2 worker, §5, §7, §11) +
> `docs/learning/AUTONOMOUS-PIPELINE.md` first. Pre-flight pack → Doer → Checker → 5 checks (the
> smoke MUST stay green — that's the whole risk) → PR off `main`, do not merge. If the smoke turns
> flaky and you can't stabilise it in ~3 tries, REVERT and report — do not ship a flaky e2e.

---

## ▶ 4b/4c · Onboarding tour + empty/error states + deeper i18n  *(frontend batch)*

> Run AUTONOMOUSLY. Implement the 7b UX remainder (pipeline item 4b/4c). Split into small PRs,
> each off `main`, each with the 5 checks green incl. Sonar exit 0. Read `CLAUDE.md` §12 +
> `docs/knowledge/prompting-anthropic.md`/frontend rules + `apps/web` existing components first.
> (a) Onboarding tour ≤5 steps across the 7 cockpit zones (a dismissible, localStorage-gated
> overlay — no new heavy dep; prefer a tiny custom component over a tour library). (b) The
> remaining empty / error / no-permission states for each cockpit page (mirror the Phase-7
> EmptyState pattern already in the repo). (c) Deeper per-page i18n (fr/en) via the existing
> i18n seam (`apps/web/lib/i18n`) — no hardcoded strings in the touched pages. Use the
> `frontend-design` skill. Add Playwright smoke assertions for the tour + a representative
> empty-state. Pre-flight → Doer → Checker → PR per slice, never merge. Sonar-recurring rules
> apply hard on UI code (readonly props, `<output>` over role=status, no array-index keys,
> localeCompare sorts) — see `docs/knowledge/sonar-recurring-rules.md`.

---

## ▶ self-audits · lean-CLAUDE.md + registry naming  *(NEEDS YOUR DECISION first)*

> This needs Melvyn's call before any edit (the docs say so explicitly). Two open questions:
> (1) **CLAUDE.md length** — it's at ~200 lines; `docs/backlog/self-audit-lean-claude-md.md`
> flags RES-012 (<200) vs RES-061 (<150) — which target? (recommendation: ≤150 hygiene goal,
> 200 hard cap). (2) **Registry naming** — `docs/backlog/self-audit-memoire-reaudit-debt.md` §2:
> harmonise decisions-register name on **BDR** (retained) across `gouvernance.md` (RES-013 still
> says EDR) + point RES-013 at the canonical RES-029 model. ONCE you answer both, a prompt:
> "Run AUTONOMOUSLY. Apply the two governance decisions I just made: trim CLAUDE.md to ≤<N> lines
> by moving non-§5/§11 detail to referenced docs (keep every non-negotiable rule, just relocate
> the prose; verify each remaining line is binary-verifiable), and harmonise the decisions
> register to BDR in gouvernance.md pointing at project-doctrine §5 / RES-029. Read
> `docs/backlog/self-audit-lean-claude-md.md` + `self-audit-memoire-reaudit-debt.md` first.
> Pre-flight → Doer → Checker → 5 checks → PR off main, never merge. Mark both backlog cards
> RESOLVED." Do NOT let an agent shorten CLAUDE.md by deleting guardrails.

---

## ▶ 3b · Headless `claude` CLI executor  *(attended — needs the real binary + `claude login`)*

> Run with me AROUND (needs a logged-in `claude` CLI on this machine; can't be CI-verified).
> Implement pipeline item 3b / `CLAUDE.md §2`: a headless `claude --print` executor in
> `apps/worker` as an alternative to the Agent-SDK `claudeCodeLLM`, for shell-heavy missions.
> §11 billing is CRITICAL: strip `ANTHROPIC_API_KEY` from the subprocess env, subscription only,
> no PAYG; the lint guard `scripts/lint-no-sdk-payg.sh` must stay green. Gate it behind an explicit
> config flag (default OFF). Mock the subprocess for unit tests (inject a spawn function); the
> real-binary path is verified manually by you. Read `packages/core/src/llm.real.ts` (the SDK
> executor it parallels) + `docs/decisions/0001-*` first. Pre-flight → Doer → Checker → 5 checks
> (real-binary smoke is manual) → PR off main, never merge.

---

## ▶ 6 · Tauri desktop packaging + notifier  *(attended — Rust toolchain + signing)*

> ATTENDED only — outward-facing, needs the Rust toolchain + a native build + code signing on
> your machine. Pipeline item 6 / `ROADMAP.md` Phase 8 packaging: wrap the Next cockpit in Tauri
> (reference `winfunc/opcode` per CLAUDE.md §9.bis), plus an optional Slack/Telegram notifier for
> autopilot wake reports. Brainstorm scope with me first (`superpowers:brainstorming`) — this is a
> new surface, not a mechanical task. Do NOT run the native build/sign steps unattended.

---

## ▶ 7 · Second-brain cross-project  *(future feature — design first)*

> Future feature, design before build. Pipeline item 7 / `docs/backlog/second-brain-cross-project.md`:
> runtime memory shared across projects, seeded from `docs/knowledge/` + `vibeflow/INDEX.md`
> (the Phase-4 persistence-bridge promise). Start with `superpowers:brainstorming` + an
> intake-audit (`/intake-audit`) — scope, signal-density limits (≤5 global items/mission, §12),
> and the cross-project leakage guard (§5: no writes outside the active project) are the hard
> parts. Produce an ADR in `docs/decisions/` before any code. Then the usual pipeline.

---

**Current main**: PRs #13–#17 merged; **#18 (5b) open, ready to merge**. After merging #18,
delete the merged feature branches. Pipeline source of truth: `docs/learning/AUTONOMOUS-PIPELINE.md`.
