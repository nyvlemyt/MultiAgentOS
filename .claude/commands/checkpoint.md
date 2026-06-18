---
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git diff:*), Bash(git stash list:*), Bash(git stash push:*), Read, Glob, Grep, LS
description: Create, verify, or list workflow checkpoints, anchored on the MAOS 5-check verification gate.
---

<!-- pattern from affaan-m/ecc commands/checkpoint.md — rewritten to MAOS conventions: 5-check gate (CLAUDE.md §7), destructive git stays human-gated (§5), state lives under data/ (§8) -->

# /checkpoint — workflow checkpoints

Mark and compare safe points during a build so progress is recoverable and regressions are visible. A checkpoint is **non-destructive**: it records state, it never resets, force-pushes, or deletes branches (those are §5 human-gated actions and are out of scope for this command).

## Usage

`/checkpoint [create|verify|list] [name]`

## State location

The checkpoint log lives inside the repo's own state folder, never in a global or external path (§8 — all MAOS state lives under `data/`):

```
data/checkpoints.log
```

Each row: `YYYY-MM-DD-HH:MM | <name> | <short-sha>`.

## create

1. Run the **5-check verification gate** so a checkpoint always marks a known-good state (CLAUDE.md §7):
   `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar (`scripts/sonar-pr-issues.sh` exit 0 when a PR exists).
   If any check fails, report the failure and create the checkpoint only if the user confirms an explicit "checkpoint anyway".
2. Append a row to `data/checkpoints.log` with the current `git rev-parse --short HEAD`.
3. To preserve uncommitted work without a commit, use `git stash push` (non-destructive — keeps the change). Do **not** auto-commit on the user's behalf; committing is a user-initiated action per CLAUDE.md.
4. Report the checkpoint name + SHA + which of the 5 checks passed.

## verify

1. Read the named row from `data/checkpoints.log`.
2. Compare current state to that SHA (read-only — `git diff`, `git status`, `git log`):
   - files added / modified since the checkpoint,
   - test pass/fail delta,
   - whether the 5-check gate still passes now.
3. Report:

```
CHECKPOINT COMPARISON: <name>
=============================
Files changed: X
Tests: +Y passed / -Z failed
5-check gate: [PASS/FAIL]
```

## list

Show each checkpoint: name, timestamp, short SHA, and current relation to HEAD (current / behind / ahead). Read-only.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "I'll `git reset --hard` back to the checkpoint" | Reset is §5 destructive and always human-gated — this command never does it. |
| "Tests are red but I'll checkpoint to be safe" | A checkpoint marks a *known-good* state. Red gate → ask first, log the exception. |
| "I'll commit the work as the checkpoint" | Committing is user-initiated. Use `git stash push` to preserve without committing. |
| "I'll write the log to ~/.claude" | State lives under repo `data/` (§8), never a global/external path. |

## Red Flags — stop

- You are about to run `git reset --hard`, `git push --force`, or delete a branch (§5 — not this command's job)
- You are auto-committing or auto-pushing without the user asking
- You are creating a checkpoint over a failing gate without an explicit user override
- The log is being written outside `data/`

## Verification Criteria (binary)

- [ ] `data/checkpoints.log` row written with name + timestamp + short SHA on create
- [ ] No destructive git op (reset --hard / force push / branch delete) was run
- [ ] No auto-commit / auto-push happened without an explicit user request
- [ ] `verify` reported the 5-check gate status and the file/test delta
- [ ] All checkpoint state stayed under `data/`
