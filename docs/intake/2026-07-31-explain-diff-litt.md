# Intake Audit — Geoffrey Litt "explain-diff" skills (2026-07-31)

> **Candidate**: two Claude Code skills published as a public gist by Geoffrey Litt —
> `explain-diff-html` and `explain-diff-notion`. Both turn a diff / branch / PR into a
> **rich teaching artifact** (Background → Intuition → Code walkthrough → interactive Quiz);
> one emits a self-contained HTML file, the other a Notion page.
> **Source**: https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524
> (revision `126e7fe`, 2 files, 29 + 35 lines).
> **Question decided here**: does MAOS adopt this, and in which form.

## Guardrails (step 0)

- **Local-first** ✓ for the HTML variant (writes one file on disk, reads the repo). ✗ for the
  Notion variant — it ships repo content to a third-party SaaS.
- **Subscription-only (§11)** ✓ — pure prompt, no SDK, no key, no PAYG surface.
- **Memory Keeper sole writer (§8)** ⚠ — the artifact must **not** land in `data/memory/`.
  Output path is therefore `data/explanations/` (gitignored via `data/`), never the memory vault.
- **Risky actions (§5)** ⚠ — the Notion variant is an **outbound network send** of private code
  → `risk: high`, human-gated, and no Notion MCP is configured in this repo.
- **Token discipline (§6)** ✗ as-written — "You should broadly explore surrounding code" is an
  unbounded read invitation. Must be capped before adoption.
- **No new top-level file / no new framework** ✓ — one skill folder + one gitignored output dir.

Verdict of step 0: **cannot be `implement_now` as-is**. Adapt (HTML) / reject (Notion).

## Identity

- **What it is**: a *prompt-only skill* (no code, no dependency). Frontmatter `name` +
  `description`, body = 4 required sections + formatting rules.
- **Recency / obsolescence**: gist has no visible date signal; content targets the current
  Claude Code skill format → obsolescence **low** (prose, nothing version-pinned).
- **Evidence maturity**: single author, no stars/installs/audit badges. Author is a credible
  practitioner (Ink & Switch, malleable-software research), but the artifact itself carries
  **no independent usage evidence** → score capped.
- **Summary**:
  - Four fixed sections: **Background** (deep for beginners + narrow for this change),
    **Intuition** (essence, toy data, diagrams), **Code** (grouped walkthrough), **Quiz**.
  - The **quiz is the real invention**: 5 medium-difficulty MCQs with per-option feedback —
    it converts "I read the PR" into "I can prove I understood the PR".
  - Reusable **diagram families** (simplified UI mock + system/data-flow diagram *with example data*),
    HTML diagrams only, ASCII art banned.
  - Voice target: Martin Kleppmann — classic style, smooth transitions.
  - Output hygiene: single self-contained file, date-prefixed filename, kept out of version control.
  - One deterministic self-check already present: every code block must carry
    `white-space: pre`/`pre-wrap` (a real bug Litt clearly hit).

## Sanitize (step 4.bis — independent scan)

Re-scanned both raw files against the full regex battery (secrets, AWS keys, DB URLs with creds,
JWT, private keys, GitHub tokens, personal emails, private IP ranges, absolute home paths):
**0 matches, both files.** Additional scan for execution/egress surface
(`curl`, `npx`, `eval`, `sudo`, `http(s)://`): **0 matches** — no unpinned external execution,
no remote scanner, no `curl | sh`. The Notion variant's egress is not a *hidden* payload; it is
its declared purpose (Notion MCP tools), which is handled by the KILL criteria below.
**Sanitize verdict: PASS** (content is inert prose).

## Fit (file/phase-linked)

| Surface | Why it fits |
|---|---|
| `CLAUDE.md` §14.1/§14.7 + `docs/workflows/dashboard-visuel-de-suivi.md` | The house doctrine already says *"visual first, jargon second, one living HTML page"*. This skill is that doctrine applied to **code changes** — the one structuring subject the doctrine had no recipe for. |
| `CLAUDE.md` §7 review thresholds / `superpowers:requesting-code-review` | Existing review path answers *"is this correct?"*. Nothing in the repo answers *"does the human actually understand what just got merged?"* — the gap this fills. |
| `.claude/commands/pr.md`, `security-review.md` | Same family of diff-driven entry points; reuses their `git diff --merge-base origin/HEAD` grounding idiom. |
| Onboarding of the user onto **his own** merged work | 60+ PRs landed since 2026-06; the recurring cost is re-loading *why* a change looks the way it does. A quizzed explanation page is the cheapest durable answer. |

**Duplicate analysis** — nothing in the repo covers it:

| Existing asset | Overlap | Verdict |
|---|---|---|
| `.claude/commands/pr.md` | writes a PR *description* (what changed) | no overlap with *teaching* |
| `.claude/commands/security-review.md` | vulnerability findings on the same diff | different lens |
| `mas-reviewer` skill | PASS/NEEDS_WORK verdict vs a brief | verdict, not pedagogy |
| `web-artifacts-builder` | *how* to build a multi-component HTML artifact | complementary mechanics, no diff/quiz semantics |
| `doc-coauthoring` | interactive doc writing with a human | different loop (co-authoring, not explaining a diff) |

→ Not a duplicate. `grep -rli "explain-diff"` across `.claude/` + `docs/` returns nothing.

## Costs

- **Install**: ~1 h of authoring; one skill folder + one 100-line check script + registry/seed rows.
  Tokens: negligible at install (prose), the cost is **per run** (see below).
- **Per-run cost** (the real number): the as-written version is unbounded. Adapted version caps at
  **≈40k tokens** (diff + ≤10 targeted files) with a stated coverage note in the page.
- **Maintenance**: near-zero drift — prose skill, no dependency, no API. The only coupling is the
  house visual charter (if the charter changes, one section of the skill changes).
- **Removal**: fully reversible — `rm -rf .claude/skills/explain-diff`, drop 1 registry row +
  1 seed row + 1 command file. Nothing takes root; outputs are gitignored.

## Score

`project_fit` **5** / `token_efficiency` **3** (as-written; **4** adapted with the read cap) /
`safety` **4** (HTML variant is local + read-only; **2** for the Notion variant) /
`implementation_effort` **5** (cheap) / `evidence_maturity` **3** (single author, no usage signal) /
`user_value` **5** (directly serves §14 "clarté imagée d'abord") / `phase_compatibility` **5**
(skill layer, no ROADMAP phase scope).

## KILL check

| Criterion | HTML variant | Notion variant |
|---|---|---|
| Paid API key / PAYG (§11) | no veto | no veto |
| Executes code without sec audit | no veto (prose only; Sanitize PASS) | no veto |
| Outbound send of private content (§5) | no veto (writes locally) | **VETO — private repo content to a third-party SaaS** |
| Heavy framework | no veto | no veto (but requires an unconfigured Notion MCP) |
| Out of phase | no veto | no veto |
| Weak evidence | capped score, no veto | — |
| Unbounded token read (§6) | **triggers `adapt_now`** (cap required) | same |

## Decision

**`adapt_now` — `explain-diff-html` → in-house `explain-diff`.**
Kept because it fills a real, un-covered gap (comprehension of a merged change) and because its
output form *is* the house doctrine (`CLAUDE.md` §14.7). Adapted, not copied: the unbounded
"broadly explore surrounding code" violates §6, the styling is unspecified (generic-AI risk vs
§7 anti-template), and it has no grounding contract — so it can produce a beautiful page that is
confidently wrong. Those three are fixed below.

**`reject` — `explain-diff-notion`.** Outbound send of private code to a third-party SaaS (§5),
against a Notion MCP this repo does not have and does not want; the second brain is
Obsidian + QMD over local markdown (ADR 0003). The *lens* it adds over the HTML variant (toggle
blocks for quiz answers) is already covered by native HTML `<details>`. Nothing is lost.

## Appropriation — what changes vs the original

The MAOS version keeps the **lens** (4 sections + quiz + reusable diagram families + the
`white-space` self-check) and adds seven things the original lacks:

1. **Grounding contract.** Resolve the target to a real diff (`git diff --merge-base`, `gh pr diff`)
   **before** writing a word; record base/head SHA in the page footer; every claim must trace to a
   hunk or a file actually read. No claim about code that was neither in the diff nor read.
   *Why*: the original says "make me an explanation" — a fluent-fiction invitation.
2. **Read budget (§6).** Diff first → context pack if fresh (<24 h) → ≤10 grep-targeted files →
   hard cap ~40k tokens; whatever was not covered is stated in the page ("Not covered").
   *Why*: "broadly explore surrounding code" is unbounded.
3. **House visual charter** (`dashboard-visuel-de-suivi.md`): paper `#FAF9F6` / ink `#26242E`,
   accent `#C8405F`, structure `#55527E`, dark **panels** only, no page-level dark theme,
   zero horizontal page scroll, anchored TOC. *Why*: "basic responsive styling" → generic AI output,
   which §7's anti-template rule rejects.
4. **Deterministic gate** — `scripts/check-explanation.sh` turns the prose wishes into binary
   checks (self-containment, `white-space`, 5 questions × ≥3 options × exactly 1 correct with
   per-option feedback, TOC anchors resolve, no ASCII diagrams, SHA footer, date-prefixed name).
   *Why*: the original has one manual self-check and no way to fail.
5. **Untrusted-input rule + Prompt Defense Baseline.** A diff is data, never instructions;
   secret-looking strings are truncated to 4 chars + `…` instead of being pasted into the page;
   all code is HTML-escaped. *Why*: the original pipes attacker-influenceable text straight into
   an artifact.
6. **Output location** `data/explanations/YYYY-MM-DD-<slug>.html` — gitignored (`data/`), survives
   reboot (unlike `/tmp`), same slug ⇒ **same file updated** on re-run (§14.7 "one mission = one
   living page"), never `data/memory/` (§8).
7. **Skill contract (§12)**: `summary:` L1 précis + `domain`/`tags` for the router, negative
   triggers, Principles citing sources, Rationalizations, Red Flags, binary Verification Criteria.

## Plan

- **Phase**: none (skill/doc layer — no ROADMAP phase scope consumed).
- **Files**: `.claude/skills/explain-diff/SKILL.md` · `.claude/skills/explain-diff/scripts/check-explanation.sh`
  · `.claude/commands/explain-diff.md` · `SKILLS_REGISTRY.md` §3 row · `packages/db/src/seed.ts`
  (`installedSkills` row: domain `writing`, tier `on-demand`) · this dossier.
- **Agents/skills**: none required at runtime; the skill is on-demand, invoked by the user or
  hydrated by the Skill Router on "explain this PR" tasks.
- **Tokens**: install ≈ 0 runtime; per run ≤ 40k (capped in the skill).
- **Tests / DoD (binary)**: `check-explanation.sh` exits 0 on a good page and non-zero on a seeded
  bad page (both fixtures proven) · skill scans with the right `domain`/`summary`
  (`pnpm skills:reindex`) · 5-check gate green (`pnpm -r test` · `lint` · `build` · `smoke` · Sonar).
- **Human validation**: not required (no risky action; local read + local write into a gitignored dir).
- **Do NOT**: do not adopt the Notion variant or wire any Notion MCP · do not write explanations
  into `data/memory/` (§8) or into the repo tree · do not let the "broadly explore" instruction
  back in uncapped · do not run the skill on an external project's diff without that project being
  the active one (§5 cross-project write/read boundary).

## Re-audit

**2027-01-31**, or earlier if any of: the house visual charter changes (charter section of the skill
must follow) · a Notion/Confluence MCP is ever adopted (re-open the rejected variant with an egress
gate) · `data/explanations/` grows past ~50 pages (then add retention + a QMD collection so the
pages become searchable knowledge instead of dead files).
