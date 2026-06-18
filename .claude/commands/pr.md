---
description: "Create a GitHub PR from the current branch — discover templates, analyze commits, push (never force-push), open the PR as draft"
argument-hint: "[base-branch] (default: main)"
---

<!-- pattern from affaan-m/ecc commands/pr.md (MIT) — reframed to MultiAgentOS §5/§7 -->

# Create Pull Request

**Input**: `$ARGUMENTS` — optional, may contain a base branch name and/or flags (e.g., `--draft`).

**Parse `$ARGUMENTS`**:
- Extract any recognized flags (`--draft`).
- Treat remaining non-flag text as the base branch name.
- Default base branch to `main` if none specified.

> **MultiAgentOS rules (CLAUDE.md §5 / §7) — non-negotiable:**
> - Push and PR creation are write/exec actions. Only run this command when the user has asked for a PR.
> - **Never `git push --force`.** If the remote diverged, the only allowed form is `git push --force-with-lease`, and only after a clean rebase.
> - If the current branch is the default branch (`main`), STOP and tell the user to branch first — never PR `main → main`.
> - Branch deletion, `git reset --hard`, and force-push are §5 risky actions: do not perform them here even to "fix" a divergence — surface the conflict to the user instead.
> - Default to opening the PR as **draft** unless the user explicitly asks for a ready PR.

---

## Phase 1 — VALIDATE

Check preconditions:

```bash
git branch --show-current
git status --short
git log origin/<base>..HEAD --oneline
```

| Check | Condition | Action if Failed |
|---|---|---|
| Not on base branch | Current branch ≠ base | Stop: "Switch to a feature branch first (CLAUDE.md §7)." |
| Clean working directory | No uncommitted changes | Warn: "You have uncommitted changes. Commit or stash first." |
| Has commits ahead | `git log origin/<base>..HEAD` not empty | Stop: "No commits ahead of `<base>`. Nothing to PR." |
| No existing PR | `gh pr list --head <branch> --json number` is empty | Stop: "PR already exists: #<number>. Use `gh pr view <number> --web` to open it." |

If all checks pass, proceed.

---

## Phase 2 — DISCOVER

### PR Template

Search for a PR template in order:

1. `.github/PULL_REQUEST_TEMPLATE/` directory — if it exists, list files and let the user choose (or use `default.md`).
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/pull_request_template.md`
4. `docs/pull_request_template.md`

If found, read it and use its structure for the PR body.

### Commit Analysis

```bash
git log origin/<base>..HEAD --format="%h %s" --reverse
```

Determine:
- **PR title**: Conventional Commits format with a type prefix — `feat: ...`, `fix: ...`, etc. Subject ≤ 60 chars (§7). If multiple types, use the dominant one; if a single commit, reuse its subject.
- **Change summary**: group commits by type/area.

### File Analysis

```bash
git diff origin/<base>..HEAD --stat
git diff origin/<base>..HEAD --name-only
```

Categorize changed files: source, tests, docs, config, migrations.

---

## Phase 3 — PUSH

```bash
git push -u origin HEAD
```

If push fails due to divergence:

```bash
git fetch origin
git rebase origin/<base>
git push --force-with-lease -u origin HEAD
```

If the rebase produces conflicts, **stop** and hand the conflict back to the user. Do not run `git reset --hard`, do not delete the branch, and never use `git push --force` (§5).

---

## Phase 4 — CREATE

### With Template

If a PR template was found in Phase 2, fill in each section using the commit and file analysis. Preserve all template sections — mark inapplicable ones "N/A" rather than removing them.

### Without Template

Use this default format:

```markdown
## Summary

<1-2 sentence description of what this PR does and why>

## Changes

<bulleted list of changes grouped by area>

## Files Changed

<table or list of changed files with change type: Added/Modified/Deleted>

## Testing

<which of the 5 checks were run (pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke · Sonar), or "Needs testing">

## Related Issues

<linked issues with Closes/Fixes/Relates to #N, or "None">
```

### Create the PR

```bash
gh pr create \
  --title "<PR title>" \
  --base <base-branch> \
  --draft \
  --body "<PR body>"
  # Drop --draft only if the user explicitly asked for a ready PR.
```

---

## Phase 5 — VERIFY

```bash
gh pr view --json number,url,title,state,baseRefName,headRefName,additions,deletions,changedFiles
gh pr checks --json name,status,conclusion 2>/dev/null || true
```

---

## Phase 6 — OUTPUT

Report to the user:

```
PR #<number>: <title>   (draft)
URL: <url>
Branch: <head> → <base>
Changes: +<additions> -<deletions> across <changedFiles> files

CI Checks: <status summary or "pending" or "none configured">

Next steps:
  - gh pr view <number> --web   → open in browser
  - gh pr merge <number>        → merge when ready (the user merges)
```

---

## Edge Cases

- **No `gh` CLI**: Stop with: "GitHub CLI (`gh`) is required. Install: <https://cli.github.com/>"
- **Not authenticated**: Stop with: "Run `gh auth login` first."
- **Force push needed**: only `git push --force-with-lease` after a clean rebase — never `--force` (§5).
- **Multiple PR templates**: list the files and ask the user to choose.
- **Large PR (>20 files)**: warn about size; suggest splitting if changes are logically separable.
