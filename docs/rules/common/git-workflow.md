---
origin: affaan-m/ecc
license: MIT
lang: common
concern: git-workflow
---
<!-- pattern from affaan-m/ecc rules/common/git-workflow.md -->

# Git Workflow (stack-agnostic)

Commit and PR conventions for a registered project. **Where this overlaps CLAUDE.md §7, §7 wins** — and on one point it conflicts (see note).

## Commit message format

```
<type>: <description>

<optional body>
```

Types: `feat, fix, refactor, docs, test, chore, perf, ci`. Conventional Commits; subject ≤ 60 chars (CLAUDE.md §7).

> **Conflict with MAOS doctrine — do not port.** The ECC source says "Attribution disabled globally." MAOS requires the opposite: every commit ends with a `Co-Authored-By: Claude …` trailer, and PR bodies end with the generated-with attribution line. Follow MAOS's attribution rule, not ECC's.

## Pull request workflow

The portable delta worth keeping:

1. Analyze the **full commit history**, not just the latest commit.
2. Use `git diff <base-branch>...HEAD` to see all changes in the branch.
3. Draft a comprehensive PR summary from that diff.
4. Include a test plan.
5. Push a new branch with `-u`.

## Reference

- For the full pre-git pipeline (research, planning, TDD, review), see `development-workflow.md`.
