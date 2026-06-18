# ECC Harvest — Decision Shard S1

**Cluster:** `skill:core-skills-mgmt`
**Source:** affaan-m/ecc (MIT) · inspected RO at `/tmp/ecc-inspect/skills/<slug>/SKILL.md`
**Doer:** ECC Harvest Phase C · date 2026-06-16
**Method:** `intake-audit` wide-bar rule (keep unless dup-no-better / stub / unsafe). Sanitize scan run per §4.bis.

| Slug | Decision | Tier | Path / reason |
|------|----------|------|---------------|
| `config-gc` | **keep** | T2 | `packages/skills/library/config-gc/SKILL.md` |
| `hermes-imports` | **keep** | T1 | `packages/skills/library/hermes-imports/SKILL.md` |
| `hookify-rules` | **keep** | T2 | `packages/skills/library/hookify-rules/SKILL.md` |
| `configure-ecc` | **reject** | T0 | ECC-self-referential — installer of the ECC product itself |
| `ecc-guide` | **reject** | T0 | ECC-self-referential — navigation doc for the ECC repo |

---

## config-gc — keep (T2, arsenal)

- **Identity:** garbage-collection workflow for a Claude Code config surface (skills/memory/hooks/permissions/MCP/caches). Human-in-the-loop, soft-delete first, logs to `gc_log.md`.
- **Dedup:** no equivalent owned. Closest is `intake-audit` (the *additive* counterpart); config-gc is the *subtractive* half — complementary, not a duplicate.
- **Fit:** maintenance hygiene for MAS's own `.claude` surface; directly serves CLAUDE.md §5 (no silent destructive ops) and §8 (memory discipline).
- **Sanitize:** 0 secrets, 0 PAYG. `/Users/...` / `~/.claude` strings were *pedagogical placeholders*, not leaks; rewrote to a `$CFG` variable and neutralized the nominative `dead-skill`/permission examples.
- **KILL:** none triggered (not dup-no-better, not stub, not unsafe).
- **Appropriation:** maintainer-safe rewrite — added Prompt Defense Baseline header, §5/§8 cross-refs, full 7-section lifecycle, binary verification. No external execution / no data egress in original; nothing to strip beyond placeholders.
- **Re-audit:** if ECC config-gc gains autonomous-delete behavior (would violate §5).

## hookify-rules — keep (T2, arsenal)

- **Identity:** authoring guide for declarative "hookify" guard rules (markdown + YAML frontmatter, event-driven warn/block patterns).
- **Dedup:** partial overlap with `update-config` (settings.json hooks) but hookify is a *distinct rule format*; not dup-no-better.
- **Fit:** defense-in-depth visualization of §5/§11 doctrine at action time (e.g. `warn-env-api-keys` mirrors our secret ban). Pilots agent behavior → Prompt Defense Baseline added.
- **Sanitize:** 0 secrets, 0 PAYG. Patterns shown are generic regex literals, no live secrets.
- **KILL:** none.
- **Appropriation:** added explicit guardrail that a hookify rule is NOT the §5 risk gate (complements `config/permissions.json` + `mas-sec-reviewer`); full lifecycle + binary verification.
- **Re-audit:** if MAS adopts a runtime hook engine, reconcile the format then.

## hermes-imports — keep (T1, spine)

- **Identity:** sanitization lens that promotes a repeated private operator workflow into a shareable skill, stripping private state/credentials/paths.
- **Dedup:** no owned equivalent. Shares the §4.bis Sanitize lens with `intake-audit` but is a distinct, narrower publish-time tool.
- **Fit (why T1):** touches MAS's intake/security spine — generalized as "private workflow → shareable skill" sanitization, reusing our intake Sanitize regex set. Directly reinforces §11.
- **Sanitize:** 0 secrets, 0 PAYG. `~/.hermes` mention is a setup-context placeholder; generalized to `~/.<tool>` and reframed away from the proprietary "Hermes" product name.
- **KILL:** none.
- **Appropriation:** added Prompt Defense Baseline; bound the scan to the canonical intake regex set (truncate-to-4-chars rule); stated precedence "precedes, never replaces, the runtime §5 gate"; full lifecycle + binary verification.
- **Re-audit:** none scheduled; stable lens.

## configure-ecc — reject (T0)

- **Identity:** interactive installer wizard for Everything Claude Code — clones `github.com/affaan-m/everything-claude-code` into `/tmp`, copies skills/rules into `~/.claude` or project `.claude`.
- **Reason (ECC-self-referential, out of product):** MAS never installs ECC; CLAUDE.md memory forbids running `install.sh`/the ECC installer in the repo. The skill *is* the installation machinery (unpinned `git clone`, bulk `cp -R` into config) — exactly the external-execution machinery §4.bis says to strip.
- **Transferable lens check:** the only generic capability (reconcile/verify installed skills, fix path refs) is already covered by `config-gc` (subtractive audit) and `intake-audit` (additive decision). Nothing left to keep.
- **Re-audit condition:** none — re-open only if MAS ever decides to vendor an ECC bundle (it does not).

## ecc-guide — reject (T0)

- **Identity:** navigation/onboarding doc for the ECC repo — answers "what does ECC include?" by running `node scripts/ci/catalog.js`, `install-plan.js`, `/project-init` against the live ECC repository surface.
- **Reason (ECC-self-referential, out of product):** entirely about driving the ECC product's own scripts and slash-commands; presupposes an ECC checkout. No standalone capability once ECC is not installed.
- **Transferable lens check:** "answer from current files, not memory" is a sound principle but already embodied in our `mas-context-manager` / intake practice; not worth a skill of its own.
- **Re-audit condition:** none.

---

### Sanitize summary (cluster)
- API keys / secrets: **0**
- PAYG / `ANTHROPIC_API_KEY` / `@anthropic-ai/sdk`: **0**
- Absolute home paths in keepers: neutralized to placeholders.
- All 3 keepers carry the Prompt Defense Baseline (each pilots agent behavior).
