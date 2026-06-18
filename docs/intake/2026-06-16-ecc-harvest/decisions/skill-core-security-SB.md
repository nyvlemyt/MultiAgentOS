# Decision shard — cluster `skill:core-security` (lot SB)

Source: affaan-m/ecc (MIT). Tier T1 (security, touches MAS's spine). Wide-bar applied:
keep unless dup-no-better, stub, or unsafe (§11 auto-rejects). Independent Sanitize re-scan
run on each source body: no real secrets (only `env(...)`/`${...}` placeholders and truncated
illustrative literals like `sk_live_...`, `base64:abc123...`), no `@anthropic-ai/sdk`, no
`/Users/` paths, no personal emails. All clean.

Dedup checked against `docs/intake/2026-06-16-ecc-harvest/our-assets-index.md`: we own
`mas-sec-reviewer` (runtime risk gate) and `security-review` (current-diff review) but **no
framework-specific defensive security skills** and **no offensive triage lens** — no overlap.

| slug | decision | tier | path |
|---|---|---|---|
| laravel-security | adapt_now (keep) | T1 | `packages/skills/library/laravel-security/SKILL.md` |
| perl-security | adapt_now (keep) | T1 | `packages/skills/library/perl-security/SKILL.md` |
| quarkus-security | adapt_now (keep) | T1 | `packages/skills/library/quarkus-security/SKILL.md` |
| springboot-security | adapt_now (keep) | T1 | `packages/skills/library/springboot-security/SKILL.md` |
| security-bounty-hunter | adapt_now (keep, hardened) | T1 | `packages/skills/library/security-bounty-hunter/SKILL.md` |

## Keepers (5/5) — rationale

- **laravel-security / perl-security / quarkus-security / springboot-security**: dense, operational,
  framework-correct defensive references (authn/authz, injection prevention, validation, CSRF/XSS,
  headers, secrets, rate limiting, dependency scanning). Not stubs, not dups, performant, clear
  domain value. Adapted to the §12 lifecycle structure (Overview → When to Use / NOT to Use →
  Principles citing sources → Process → Rationalizations → Red Flags → binary Verification Criteria),
  given L1 `summary`, a Prompt Defense Baseline header, and an explicit **maintainer-safe** framing:
  review-and-recommend only, no destructive ops, no `.env` auto-write, no third-party egress.

- **security-bounty-hunter**: offensive in origin, kept under a **strictly defensive/audit lens**.
  Re-scoped maintainer-safe:
  - Added a mandatory **Authorization Gate** as step zero (no scope → stop, no analysis).
  - Reframed as a **triage-judgement** skill (reachability + CWE + impact), not an attack tool.
  - **Removed the runnable exploit surface**: dropped the unpinned `semgrep --config=auto` command
    (unpinned external execution per intake-audit Sanitize step 8 maintainer-safe rule) and the raw
    PoC report template; replaced with a descriptive findings structure. Principle states explicitly:
    no runnable exploit, no ready-to-fire payload; the authorized owner reproduces in their own env.
  - Wired to MAS gates: any network/send/modify action it implies is `risk: high|blocking` (§5) and
    requires `mas-sec-reviewer` PASS first; no data egress (§11).
  - `description` + negative triggers make accidental dispatcher activation hard (authorized-only,
    no exploit output).

## Rejects (0/5)

None. No stub, no dup-no-better, no §11 violation in this lot.

## Re-audit

- Re-check if the upstream affaan-m/ecc skills change materially, or at the next cluster self-audit.
- `security-bounty-hunter`: re-audit the maintainer-safe boundary at every phase gate that touches
  autonomy/permissions, to confirm no exploit-generation surface has crept back in.
