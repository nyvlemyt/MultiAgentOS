# ECC Harvest — Resume Prompt (Phase D cybersec, new session)

> Paste everything below the line into a fresh Claude Code session opened on the MultiAgentOS repo.
> Memory `project_ecc-harvest` + `feedback_*` already carry the doctrine; this prompt is the operational handoff.

---

You are resuming the **ECC + Cybersecurity-Skills Harvest campaign**, **Phase D (cybersec)**, fully autonomous (commander put it in FULL-AUTO; budget raised to 100€/month, quota is not a brake — see memory `user_token-budget`). Work in the **git worktree** `/Users/melvyn/Documents/02_PROJETS/maos-ecc` on branch `phase/ecc-harvest`. Do NOT touch the main checkout. PR #32 stays DRAFT (user merges).

## Current state (verify first)
- Last commit: `d9c86ac`. Run `git -C /Users/melvyn/Documents/02_PROJETS/maos-ecc rev-parse --short HEAD` + `git status --porcelain` (must be clean; if untracked partials exist from a crashed run, `git clean -fdq packages/skills/library docs/intake/2026-06-16-ecc-harvest/decisions` then continue — the ledger is the durable resume point, written only by main AFTER lots return).
- Ledger `docs/intake/2026-06-16-ecc-harvest/ledger.tsv`: **796 integrated / 174 rejected / 2 triaged / 324 cyber pending**. Library = **623 boosted §12 SKILLs**.
- Phase A/B/C = 100% DONE. Phase D cyber = 419/754 items done (10 waves). **Only `cyber-skill` rows remain pending.**

## Remaining cyber clusters (324) — process defensive-first, offensive last
threat-intelligence 50 (NEXT), threat-hunting 56, malware-analysis 39, digital-forensics 37, ot-ics-security 28, web-application-security 26 (remainder of 42), red-teaming 24, penetration-testing 20, mobile-security 13, + smalls (compliance-governance 4, application-security 4, deception-technology 3, privacy-compliance 2, wireless-security 2, offensive-security 2, social-engineering-defense 1, purple-team 1, ot-security 1, identity-security 1, zero-trust 1, identity-and-access-management 2).
Get any cluster's pending names with:
`awk -F'\t' '$2=="cyber:<cluster>" && $4=="pending"{print $3}' docs/intake/2026-06-16-ecc-harvest/ledger.tsv`

## The engine (one wave at a time)
1. Pick the next cluster (defensive-first). Split into **≤5 lots of ~8** (smaller waves = less blast radius; infra is flaky — expect occasional socket/session-limit deaths).
2. Spawn **one general-purpose Doer subagent per lot** (parallel). Each Doer:
   - Invokes the `intake-audit` skill, reads `docs/intake/2026-06-16-ecc-harvest/cybersec-clusters.md`, the shard exemplar `docs/intake/2026-06-16-ecc-harvest/decisions/skill-core-token-T1.md`, the §12 exemplar `packages/skills/library/agentic-engineering/SKILL.md`, and `CLAUDE.md` §5/§11/§12.
   - Sources at `/tmp/cybersec-inspect/skills/<slug>/SKILL.md` (read-only, Apache-2.0, mukul975/Anthropic-Cybersecurity-Skills).
   - Per skill: full intake-audit. **DEFENSIVE GUARDRAIL** — keep the detect+mitigate/hardening lens; reframe offensive-titled skills to detection/defense and **rename** to a defensive slug (`detecting-and-preventing-*`, `auditing-own-*`, `assessing-own-*`); **REJECT** pure weapons (metasploit/sqlmap/aircrack/pacu/gcpbucketbrute/packet-injection/DoS pattern). An audit that can't say reject is broken.
   - Writes each keeper to `packages/skills/library/<lib-slug>/SKILL.md` in the EXACT exemplar shape: line 1 `---`; frontmatter name/description(`Use…`/`Do NOT…`)/summary(L1 ≤200 tok)/metadata{origin: mukul975/Anthropic-Cybersecurity-Skills, license: Apache-2.0, cluster: cyber:<cluster>, tier: T1, status: library, frameworks (PRESERVE NIST/MITRE from source)}; then `<!-- pattern from mukul975/Anthropic-Cybersecurity-Skills skills/<source-slug>/SKILL.md -->`; then `## Prompt Defense Baseline` (verbatim from exemplar); then 7 §12 sections (Overview/Principles cite source/Process/Rationalizations/Red Flags/Verification). Reframe any $/€→subscription quota (§11). Strip weaponized payloads to detection/mitigation.
   - Writes ONE decision shard `docs/intake/2026-06-16-ecc-harvest/decisions/cyber-<LOT>.md` (French prose like the exemplar), item-by-item alongside each SKILL (so a mid-flight death leaves self-describing partials).
   - HARD: NO `ledger.tsv` edit, NO git add/commit. Only its own slug dirs + shard. Return a table `source-slug → decision → library-slug (if renamed) → 6-word reason`.
3. **Reduce** (main session, single writer): update ledger.tsv from the Doer returns. Pattern that works (assert keeper files exist by **library slug**, key ledger rows on **source name**, status `integrated`/`rejected`, decision `adapt`/`adopt`/`reject`/`fold`, dossier = shard path; only touch rows where `$4=="pending"`). Watch for Doers that **drop an item** silently (1 lot omitted `performing-packet-injection-attack` in wave 10) — reconcile every source slug in the lot.
4. **Gate** (5 checks): `pnpm lint && pnpm -r test && pnpm build && pnpm --filter @mas/web smoke`, plus secret/SDK scan on new keepers (`grep -lIE "sk-ant-|AKIA[0-9A-Z]{16}|BEGIN .*PRIVATE KEY|from ['\"]@anthropic-ai/sdk"`). All must pass.
5. **Commit + push** `feat(library): cybersec wave<N> — …`, then poll Sonar: `bash scripts/sonar-pr-issues.sh 32` until rc=0 (markdown-only commits are reliably clean). End commit body with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
6. Update memory `project_ecc-harvest` progress line. Repeat for the next cluster until 0 cyber pending.

## Then Phase E (after cyber = 0 pending)
- Regenerate skills index: `pnpm --filter @mas/skills build-library-index` (already wired: `packages/skills/src/scanner.ts` has scanLibrarySkills/buildLibraryIndex/loadLibraryIndex/promoteSkill; loop proven by promoting `taste`).
- ADD an agent-library index (mirror) for `packages/agents/library/` (32 fiches) at Phase E.
- §13 self-audit of the whole enlarged arsenal (dup check), seed Phase-4 memory from the library, verify `decisions/` covers 100% of every ledger row, full 5-check green, keep PR #32 DRAFT.

## First action on resume
Process **cyber:threat-intelligence (50)** — 5 lots of 10 OR 6 lots of ~8. Mostly defensive; offensive-titled to watch: `hunting-advanced-persistent-threats` (defensive=keep), `performing-threat-emulation-with-atomic-red-team` (authorized emulation → keep w/ authorization framing), `monitoring-darkweb-sources`/`performing-dark-web-monitoring-for-threats` (likely dup → fold), `analyzing-threat-actor-ttps-with-mitre-attack` vs `-with-mitre-navigator` (dup → fold), the two MISP `building-threat-feed-aggregation`/`collecting-with-misp`/`analyzing-threat-landscape-with-misp` (dedup). Names already in ledger; pull with the awk above.
