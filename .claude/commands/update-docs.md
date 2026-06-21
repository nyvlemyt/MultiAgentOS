---
description: "Sync documentation from sources of truth (package.json scripts, .env.example, routes, exports). Generated sections only — never touch hand-written prose."
argument-hint: "[path] (default: repo root)"
---

<!-- pattern from affaan-m/ecc commands/update-docs.md (MIT) — ported to MultiAgentOS conventions -->

# Update Documentation

Sync documentation with the codebase, generating from source-of-truth files. Regenerate only the marked generated sections; leave authored prose intact.

## Step 1: Identify Sources of Truth

| Source | Generates |
|--------|-----------|
| `package.json` scripts (per workspace) | Available commands reference |
| `.env.example` | Environment variable documentation |
| `openapi.yaml` / route files | API endpoint reference |
| Source code exports | Public API documentation |
| `Dockerfile` / `docker-compose.yml` | Infrastructure setup docs |

## Step 2: Generate Script Reference

1. Read `package.json` (or `Makefile`, `Cargo.toml`, `pyproject.toml`). In the MultiAgentOS monorepo, read each workspace's `package.json`.
2. Extract all scripts/commands with their descriptions.
3. Generate a reference table:

```markdown
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Next.js cockpit in dev mode |
| `pnpm -r test` | Run the full Vitest suite across all packages |
| `pnpm lint` | Lint + run the no-PAYG-SDK guard (§11) |
```

## Step 3: Generate Environment Documentation

1. Read `.env.example` (or `.env.template`, `.env.sample`).
2. Extract all variables with their purposes.
3. Categorize as required vs optional.
4. Document expected format and valid values — **never print actual secret values** (CLAUDE.md §5; `.env*` is gitignored and off-limits). Document `.env.example` placeholders only.

```markdown
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CLAUDE_CONFIG_DIR` | No | Per-account config dir for pooled Claude auth | `~/.claude-acct-2` |
| `LOG_LEVEL` | No | Logging verbosity (default: info) | `debug`, `info`, `warn` |
```

> Note (§11): `ANTHROPIC_API_KEY` is a smell, not a documented feature. If you find it referenced, flag it for removal rather than documenting it as a supported variable.

## Step 4: Update Contributing Guide

Generate or update `docs/CONTRIBUTING.md` with:
- Dev environment setup (prerequisites, install steps)
- Available scripts and their purposes
- Testing procedures (the 5-check verification gate — §7)
- Code style enforcement (linter, formatter, pre-commit hooks)
- PR submission checklist

## Step 5: Update Runbook

Generate or update the relevant runbook under `docs/workflows/` with:
- Operating procedures (step-by-step)
- Health checks and monitoring
- Common issues and their fixes
- Recovery procedures

## Step 6: Staleness Check

1. Find documentation files not modified in 90+ days.
2. Cross-reference with recent source changes.
3. Flag potentially outdated docs for manual review.

## Step 7: Show Summary

```
Documentation Update
──────────────────────────────
Updated:  docs/CONTRIBUTING.md (scripts table)
Updated:  docs/ENV.md (3 new variables)
Flagged:  docs/workflows/deploy.md (142 days stale)
Skipped:  docs/API.md (no changes detected)
──────────────────────────────
```

## Rules

- **Single source of truth**: generate from code, never hand-edit generated sections.
- **Preserve manual sections**: update only generated blocks; leave authored prose intact.
- **Mark generated content**: wrap generated sections in `<!-- AUTO-GENERATED -->` markers.
- **No new top-level files** without updating CLAUDE.md §3.
- **Don't create docs unprompted**: only create new doc files when the command explicitly requests it.
