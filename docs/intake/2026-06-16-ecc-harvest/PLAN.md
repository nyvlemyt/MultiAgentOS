# ECC + Cybersecurity-Skills Harvest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to run this task-by-task. Steps use `- [ ]` checkboxes. The per-item audit ALWAYS uses our `intake-audit` skill.

**Goal:** Harvest the maximum of two high-quality open-source libraries — [affaan-m/ecc](https://github.com/affaan-m/ecc) (**4 component types: 270 skills + 67 agents + 92 commands + 113 rules**) and [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (754 skills) — into a deduped, audited, *improved* MultiAgentOS arsenal, so the user never rebuilds a worse version of something that already exists.

**Component types (ECC) — ALL FOUR are harvested:**
- **Skills (270)** → `packages/skills/library/`
- **Agents (67)** → Tier B fiches / `packages/agents` (22 `*-reviewer` + 10 `*-build-resolver` clustered)
- **Commands (92)** → `.claude/commands/` — slash commands; many are thin wrappers over an agent/skill (`/react-review`→`react-reviewer`), so dedup is heavy: a command adds value only if it wires a workflow we lack.
- **Rules (113)** → `docs/rules/<lang>/` arsenal — 21 languages × {coding-style, testing, patterns, hooks, security} + ~8 common. TS/web/react/vue/nuxt rules also inform CLAUDE.md §7; other languages kept as library for later (broad bar).

**Architecture:** Funnel pipeline. Cheap mechanical passes (frontmatter only) cluster + triage everything; the expensive per-item `intake-audit` runs in batches with phase gates. Our own `intake-audit` skill is upgraded FIRST (so every later audit is stronger). Kept skills land in a router-indexed **library** (not auto-injected), promoted to active `.claude/skills/` on demand.

**RESOLVED DECISIONS (2026-06-16):**
- **Storage = library indexée** → `packages/skills/library/<slug>/SKILL.md` + `index.json`, read on-demand by `mas-skill-router`. NOT auto-injected into `.claude/skills/`.
- **Budget posture = deep-boost EVERYTHING** → every kept skill from both repos is rewritten to §12 format AND improved (not light-ingested). Clustering is still used to BATCH and to audit agent-patterns once, but there is no light T2 tier — all keepers get the deep treatment. Consequence (accepted by user): the campaign spans MULTIPLE sessions and consumes real Agent-SDK quota; the ~20 € lean default is intentionally overridden for this campaign. Phase gates + per-batch token sub-budgets still apply.

**Tech Stack:** Markdown SKILL.md (our §12 format: L1 summary + L2 body, Principles/Process/Rationalizations/RedFlags/VerificationCriteria), `intake-audit` skill, `mas-skill-router`, `mas-sec-reviewer`, Drizzle (if router index persisted), pnpm 5-check verification.

**Acceptance bar (BROAD, user-set):** keep any skill that is NOT a duplicate-and-not-better, NOT a stub/low-quality, IS performant, and adds value *in its own domain* — even with no current MAOS use. Reject only: dup-not-better, stub, or unsafe (PAYG/secrets = §11 auto-reject).

**Source artifacts (done):** `ecc-inventory.tsv` (skills+agents), `ecc_commands.tsv` (92), `ecc_rules.tsv` (113), `ecc-skills-list.txt`, `CLUSTERS.md` (cluster map, all 4 types).

---

## Ordering (hard sequence — do not reorder)
1. **Phase A** — Analyze + group EVERYTHING (both repos). *(ECC done; cybersec pending)*
2. **Phase B** — `intake-audit` improves ITSELF first (fold ECC patterns in, re-audit our skill).
3. **Phase C** — Process all ECC keepers in effort-tiered batches.
4. **Phase D** — Same pipeline for cybersec-skills, inspect everything, broad.
5. **Phase E** — Index, self-audit, memory seed, close ledger.

Each phase ends with a gate: `pnpm -r test · lint · build · smoke · Sonar` green (CLAUDE.md §7) + explicit user "go" before the next (memory `feedback_phase-gates`).

---

## Task A1: Finish Phase-A inventory for cybersec-skills

**Files:**
- Create: `docs/intake/2026-06-16-ecc-harvest/cybersec-inventory.tsv`
- Create: `docs/intake/2026-06-16-ecc-harvest/cybersec-clusters.md`

- [ ] **Step 1: Clone cybersec repo read-only**

```bash
cd /tmp && git clone --depth 1 https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git cybersec-inspect
```

- [ ] **Step 2: Extract frontmatter inventory (name·domain·frameworks·description), bodies untouched**

Mirror the ECC extraction (frontmatter only). Output TSV with columns: `name`, `domain`, `frameworks`, `description`.

- [ ] **Step 3: Cluster by the repo's own 26 domains; tag each cluster T1/T2 against our doctrine**

Defensive/agent-security domains (ATLAS, AI RMF, secure-coding, secret-scan, dep-audit, threat-modeling) → T1 (feed `mas-sec-reviewer` + §5). Offensive/ops verticals (pentest, malware RE, forensics) → T2 library (keep if strong in domain).

- [ ] **Step 4: Verify**

Run: `wc -l docs/intake/2026-06-16-ecc-harvest/cybersec-inventory.tsv` → expect ~755 rows.

- [ ] **Step 5: Commit**

```bash
git add docs/intake/2026-06-16-ecc-harvest/
git commit -m "docs(intake): cybersec-skills inventory + cluster map"
```

---

## Task B1: Decide arsenal storage architecture (ADR)

**Files:**
- Create: `docs/decisions/0005-skill-arsenal-library.md`

- [ ] **Step 1: Write ADR fixing where kept skills live**

Default (recommended): library at `packages/skills/library/<slug>/SKILL.md`, indexed by `mas-skill-router`, NOT under `.claude/skills/` (avoids always-injecting 200+ frontmatters into every session ≈ token bloat — TOKEN_STRATEGY §6). Promotion to active `.claude/skills/` is on-demand. Record alternatives (straight into `.claude/skills/`; git submodule) + why rejected.

- [ ] **Step 2: Verify** — ADR present, links CLAUDE.md §3 (layout) update.
- [ ] **Step 3: Commit** `docs(adr): 0005 skill arsenal library`

---

## Task B2: Upgrade our `intake-audit` skill with ECC patterns (DO THIS BEFORE ANY KEEPER AUDIT)

**Files:**
- Modify: `.claude/skills/intake-audit/SKILL.md`
- Reference (read): `/tmp/ecc-inspect/skills/opensource-pipeline/SKILL.md`, `/tmp/ecc-inspect/agents/opensource-sanitizer.md`, `/tmp/ecc-inspect/skills/production-audit/SKILL.md`

- [ ] **Step 1: Run our OWN intake-audit ON the four ECC patterns** (subject = "ECC audit/sanitizer patterns") → dossier `docs/intake/2026-06-16-intake-audit-self-upgrade.md`. An audit that can't say reject is broken — justify each adoption.

- [ ] **Step 2: Add a "Sanitize" sub-step to the Process** — independent-verifier pass for foreign code ingestion: re-scan secrets/PII/internal-refs with regex, "never trust the previous stage." Pattern from `opensource-sanitizer`.

- [ ] **Step 3: Add "Prompt Defense Baseline" to adoption output** — any adopted agent/skill gets the standard injection-hardening header (cite source). Add the boilerplate block to the skill body.

- [ ] **Step 4: Add "maintainer-safe rewrite" as an adaptation default** — on adopt, strip unpinned external execution + third-party data egress, keep the lens. Pattern from `production-audit`.

- [ ] **Step 5: Encode the BROAD acceptance bar + effort tiers (T0/T1/T2)** into the decision-enum section so batch audits apply it consistently.

- [ ] **Step 6: Verify** — re-read skill, confirm all 5 §12 sections still present (Principles/Process/Rationalizations/RedFlags/VerificationCriteria), summary L1 ≤200 tokens.

- [ ] **Step 7: Commit** `feat(skill): intake-audit — sanitizer stage + prompt-defense + broad-bar`

---

## Task C1..Cn: ECC keeper batches (effort-tiered, gated)

Process per `CLUSTERS.md`. **Each batch = one TodoWrite list, ~5–8 items, one phase gate.**

**Per T1 item (deep boost):**
- [ ] Read body in `/tmp/ecc-inspect/skills/<slug>/SKILL.md`.
- [ ] Run `intake-audit` → dossier `docs/intake/2026-06-16-ecc-harvest/<slug>.md` (guardrails→identity→fit→3 costs→7-axis→KILL→decision enum→appropriation→integration→re-audit).
- [ ] If adopt/adapt: rewrite to §12 format, improve (this is the "boost"), add Prompt Defense Baseline, cite `// pattern from affaan-m/ecc skills/<slug>/SKILL.md`, write to `packages/skills/library/<slug>/SKILL.md`.
- [ ] Append decision to `decisions.md` ledger (adopt/adapt/backlog/reject + 1-line reason).

**Per agent cluster (22 reviewers / 10 build-resolvers):** ONE `intake-audit` on the pattern → decide adopt-pattern vs generate-on-demand; if adopt, produce ONE parametrized Tier B template, not 22 fiches.

**Per non-core keeper (still deep-boost):** same deep treatment as T1 (audit → rewrite to §12 → improve → Prompt Defense Baseline → cite source → library), but lower batch priority. Sub-cluster dossiers may group tight families (e.g. one dossier covering the `kotlin-*` pack) to keep the ledger readable, while each skill still gets its own boosted SKILL.md.

**Batch gate (every batch):** `pnpm -r test · lint · build · smoke` + `scripts/sonar-pr-issues.sh` exit 0 + user "go".

**Token discipline:** bodies read ONLY for the current batch; eco mode for agent-to-agent prose; stop + ask if batch hits its token sub-budget (TOKEN_STRATEGY §8).

---

## Task C-CMD: ECC Commands (92) — audit + adopt useful slash commands

**Files:** read `/tmp/ecc-inspect/commands/<name>.md` · write keepers to `.claude/commands/<name>.md` · dossiers in harvest dir · driven by `ecc_commands.tsv`.

- [ ] **Step 1: Dedup-map every command** against our existing skills/agents/commands. Tag each: WRAPPER (thin call over an agent we're already adopting → SKIP, the agent suffices), WORKFLOW (wires a multi-step flow we lack → candidate), DUP (we have it → skip).
- [ ] **Step 2: For each WORKFLOW keeper:** run `intake-audit` → if adopt, port to `.claude/commands/<name>.md`, rewrite to our conventions, add Prompt Defense Baseline where it invokes agents, cite source.
- [ ] **Step 3: Cluster the `*-review`/`*-build` command families** (react-review, rust-review, cpp-build…): adopt ONE parametrized pattern, not 30 commands.
- [ ] **Step 4: Verify** — adopted commands resolve in Claude Code; ledger updated for all 92.
- [ ] **Step 5: Commit** `feat(commands): adopt ECC workflow commands`

## Task C-RULES: ECC Rules (113) — language coding-standard arsenal

**Files:** read `/tmp/ecc-inspect/rules/<lang>/<concern>.md` · write keepers to `docs/rules/<lang>/<concern>.md` · driven by `ecc_rules.tsv`.

- [ ] **Step 1: Cluster = 21 langs × {coding-style, testing, patterns, hooks, security} + common.** Audit per (lang) pack, not per file (≈21 audits + common).
- [ ] **Step 2: Priority P1** — TS/web/react/vue/nuxt rules (our actual stack): audit → if adopt, port to `docs/rules/<lang>/` AND distill the non-obvious deltas into CLAUDE.md §7 / `docs/knowledge/`.
- [ ] **Step 3: Priority P2** — other languages (python/go/rust/java/kotlin/swift/…): deep-boost into `docs/rules/<lang>/` as arsenal (broad bar — good in their domain, useful later).
- [ ] **Step 4: Verify** — every (lang) pack triaged in ledger; CLAUDE.md §3 layout updated to add `docs/rules/`.
- [ ] **Step 5: Commit** `feat(rules): ingest ECC language coding-standard arsenal`

## Task D1..Dn: Cybersec-skills keeper batches

Same machinery as Phase C, driven by `cybersec-clusters.md`. Broad inspection — do NOT take the minimum. T1 security/agent-defense skills feed `mas-sec-reviewer` + map risky actions in `config/permissions.json` to MITRE/NIST frameworks (their framework-mapping pattern). T2 offensive/forensics skills → library, kept if strong in domain.

---

## Task E1: Index, self-audit, memory seed, close

**Files:**
- Create: `packages/skills/library/index.json` (router-readable: slug · summary · domain · origin · framework refs)
- Modify: `CLAUDE.md` §3 (layout: add `packages/skills/library/`)
- Modify: memory `project_ecc-harvest.md` + `MEMORY.md`

- [ ] Generate `index.json` from all library frontmatters; wire `mas-skill-router` to read it (L1 summaries only).
- [ ] Re-run §13 self-audit against the enlarged set (dup check across the whole arsenal).
- [ ] Seed Phase-4 memory from the new library (knowledge-bootstrap §5.bis enrichment spiral).
- [ ] Verify: `decisions.md` covers 100% of EVERY component — ECC (270 skills + 67 agents + 92 commands + 113 rules = 542) + cybersec (~755) ≈ 1297 items, none un-triaged. Full 5-check green.
- [ ] Commit + open DRAFT PR (memory `project_ui_redesign`: open PRs as DRAFT, user merges).

---

## Self-Review (writing-plans checklist)
- **Coverage:** A=inventory both · B=upgrade intake-audit + ADR · C=ECC skills+agents · C-CMD=ECC commands · C-RULES=ECC rules · D=cybersec keepers · E=index/self-audit/memory. Every user requirement mapped: analyze+group all 4 types (A), intake-audit self-improves first (B2), process all 4 ECC types + cybersec (C/C-CMD/C-RULES/D), broad bar, cybersec inspect-all (D), rigorous no-skip (gates + decisions.md 100% of ~1297 items), good for memory (E).
- **No placeholders:** every task has exact paths, commands, commit msgs.
- **Consistency:** library path `packages/skills/library/<slug>/SKILL.md` used throughout; `decisions.md` ledger referenced consistently.

## Decisions — RESOLVED 2026-06-16
1. **Arsenal storage** → library dir + router index (`packages/skills/library/`). ✅
2. **Budget posture** → deep-boost EVERYTHING, multi-session, quota override accepted. ✅

## Next action on "go"
Start **Task A1** (clone + inventory cybersec-skills) and **Task B1/B2** (ADR 0005 + upgrade `intake-audit`) — these are the unblockers before any keeper batch. Recommend executing via `superpowers:subagent-driven-development` (fresh subagent per task, review between).
