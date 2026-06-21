# Kickoff prompt — ECC + Cybersec Harvest (paste into a fresh session)

---

You are running the **ECC + Cybersecurity-Skills Harvest** campaign for MultiAgentOS. Everything is already analyzed and planned — your job is to EXECUTE it rigorously, no skipping.

**Read first (in order):**
1. `CLAUDE.md` (esp. §5 risky actions, §6 token discipline, §7 verification = 5 checks + Sonar, §12 knowledge-base rules, §13 intake-audit doctrine).
2. `docs/intake/2026-06-16-ecc-harvest/PLAN.md` — the full implementation plan (Harvest Engine + Tasks A→E).
3. `docs/intake/2026-06-16-ecc-harvest/CLUSTERS.md` — the cluster map for all 4 ECC component types.

**What we're harvesting:** two repos into a deduped, audited, *improved* arsenal.
- ECC (`/tmp/ecc-inspect`, already cloned read-only): 270 skills + 67 agents + 92 commands + 113 rules.
- Cybersec-skills (clone in Task A1): ~754 skills.
- Inventories already built: `ecc-inventory.tsv`, `ecc_commands.tsv`, `ecc_rules.tsv` in the harvest dir.

**Locked decisions (do not re-litigate):**
- Acceptance bar = BROAD: keep any item that is NOT a duplicate-and-not-better, NOT a stub, IS performant, adds value in its own domain — even with no current use. Reject only dup-not-better / stub / unsafe (PAYG or secrets = auto-reject, CLAUDE.md §11).
- Storage = library `packages/skills/library/<slug>/SKILL.md` + `index.json` (router-read on-demand, NOT auto-injected). Rules → `docs/rules/<lang>/`. Commands → `.claude/commands/`.
- Budget = deep-boost EVERY keeper (rewrite to §12 format + improve). Multi-session, quota override accepted. Per-batch token sub-budget still enforced.

**How to work (the engine) — YOU ORCHESTRATE, you don't author yourself:**
- This session is the ORCHESTRATOR. It decomposes, spawns subagents, reviews verdicts, reduces ledger shards, drives gates. It does NOT write SKILL.md bodies itself — that keeps the main context cheap and the work parallel.
- Use `mas-mission-planner` to decompose into a cluster-DAG (Task B3).
- Use `superpowers:dispatching-parallel-agents` for fan-out: one **Doer** subagent per cluster, independent, one-file-per-item writes (zero merge conflict), ledger shard per cluster in `decisions/`. Cap concurrency to the per-batch token sub-budget.
- Use `superpowers:subagent-driven-development` for per-task fresh subagent + a **Checker** subagent between (Checker writes an authoritative verdict file).
- **Before authoring/boosting ANY SKILL.md (CLAUDE.md §12, non-negotiable):** the boosting subagent reads `docs/knowledge/prompting-anthropic.md` + `docs/knowledge/skills-reference.md` + the relevant domain file, then produces the §12 format — L1 `summary` (≤200 tok) + L2 body (Principles citing source / Process / Rationalizations / Red Flags / Verification Criteria). Stubs are rejected.
- Per item: `intake-audit` decides (must be able to say `reject`, with a KILL criterion) → `skill-creator` authors/boosts → cite `// pattern from <repo> <path>` (§9.bis) → add the Prompt Defense Baseline to adopted agents. No generated code/skill may import `@anthropic-ai/sdk` (§11).
- Ledger-driven & resumable across sessions: `ledger.tsv` (status pending→triaged→boosted→integrated|rejected). Process only pending/triaged. Two stages: cheap triage (dedup+keep/reject) before expensive boost. **At session end leave `ledger.tsv` consistent** → next session resumes with zero double-work.
- Template-once for regular grids: rules 21×5 and the 22 `*-reviewer` agents → 1 gold template + generate + sample-review (saves ~90 audits).

**Hard sequence (gate between EVERY phase — run the 5 checks: `pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke` + `scripts/sonar-pr-issues.sh <pr>` exit 0 AND quality-gate status == OK; markdown-only batches still run them green — then STOP for my "go"):**
1. **B3** — build engine scaffolding (ledger.tsv seeded ~1297 rows + `our-assets-index.md` dedup index + `decisions/`).
2. **A1** — clone + inventory cybersec-skills (`cybersec-inventory.tsv` + `cybersec-clusters.md`).
3. **B1** — ADR `docs/decisions/0005-skill-arsenal-library.md`.
4. **B2** — upgrade our `intake-audit` skill FIRST (sanitizer stage + Prompt Defense Baseline + maintainer-safe rewrite + broad-bar). Run our own intake-audit on these patterns.
5. **C / C-CMD / C-RULES** — ECC keepers (skills, then commands, then rules), parallel batches.
6. **D** — cybersec keepers, broad, inspect all.
7. **E** — `index.json`, §13 self-audit, seed Phase-4 memory, close `decisions.md` (must cover 100% of ~1297 items), open DRAFT PR.

**Rules of engagement:** never run ECC's `install.sh` inside our repo; never write outside the project sandbox (§5); keep `/tmp/ecc-inspect` read-only. No `@anthropic-ai/sdk` import; secrets/PAYG item = auto-reject (§11). Open PRs as **DRAFT** (I merge). **Stop + ask** at every phase gate AND if any batch hits its token sub-budget (this campaign overrides the lean ~20 € default — but per-batch caps still bind). `decisions.md` must end at 100% coverage — no item un-triaged.

Start with **Task B3**, then pause at the gate for my go.
