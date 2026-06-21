---
allowed-tools: Read, Glob, Grep, LS
description: Answer a quick side question mid-task without modifying anything, then resume the active task from where it paused.
---

<!-- pattern from affaan-m/ecc commands/aside.md — rewritten to MAOS conventions: read-only tool gate (§5), no file writes, no external egress -->

# /aside — read-only side question

Ask a question mid-task and get a focused answer without losing context. The active task, files, and working tree are **never** modified during an aside. This command is read-only by construction: its tool gate excludes Edit, Write, Bash, and any network access (§5 — no silent writes, no egress).

## When to Use

- You want a quick explanation of code currently being worked on
- You need a second opinion on a decision without derailing the task
- You want to understand an error, concept, or pattern before proceeding
- You want to ask something unrelated without starting a new session

## When NOT to Use

- The "question" is actually a direction change (use the normal mission flow / re-plan instead)
- Answering would require editing, running, or fetching anything — an aside is read-only

## Process

### Step 1 — Freeze the current task state

Before answering, note internally:
- the active task (file, feature, or problem in progress),
- the step that was in progress when `/aside` was invoked,
- what was about to happen next.

Do not touch, edit, create, delete, or execute anything during the aside.

### Step 2 — Answer directly

Answer in the most concise form that is still complete.
- Lead with the answer, not the reasoning.
- If it concerns the current file, cite it precisely (`path:line`).
- If answering needs a file you have not read, read it — **read-only**, never write.

Response shape:

```
ASIDE: [restated question]

[answer]

— Back to task: [one-line description of what was paused]
```

### Step 3 — Resume

Immediately continue the paused task from the exact point it stopped. Do not ask permission to resume unless the answer revealed a blocker (see Edge Cases).

## Edge Cases

- **No question** (`/aside` alone): ask the user what they want to know, keep the wrapper, end with `— Back to task: …`.
- **Answer reveals a problem with the current approach**: flag it with a `WARNING:` line and wait for the user's decision before resuming.
- **Question is a direction change** (e.g. "actually use Redis"): clarify — (a) treat as information only and keep the plan, or (b) pause and re-plan via the normal mission flow. Wait for the answer; never assume.
- **Answer implies a code change**: note what should change, but do **not** make it during the aside — surface it after the task resumes.
- **No active task**: keep the wrapper, end with `— Back to task: no active task to resume`.
- **Multiple asides in a row**: answer each in sequence; do not lose task state across the chain.
- **Ambiguous question**: ask exactly one clarifying question — the shortest one that unblocks the answer.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "I'll just make this one tiny edit while I'm here" | An aside is read-only by gate. Any write = wrong command (§5). |
| "Let me run a quick command to confirm" | No Bash in an aside. Reason from the code you can read. |
| "I'll re-plan the task since they mentioned a change" | A direction change is not a side question — clarify first, then use the mission flow. |
| "I lost what I was doing, I'll just start fresh" | The point of /aside is to resume exactly. Freeze state in Step 1. |

## Red Flags — stop

- You are about to Edit, Write, or run Bash inside an aside
- You are fetching a URL or hitting the network to answer
- You dropped the paused-task context and cannot resume precisely
- You silently changed the plan based on an aside answer

## Verification Criteria (binary)

- [ ] No file was created, modified, or deleted during the aside
- [ ] No command was executed and no network call was made
- [ ] Response used the `ASIDE: … — Back to task: …` wrapper
- [ ] The paused task was resumed from its exact prior point (or explicitly marked "no active task")
- [ ] Any revealed problem or needed change was flagged, not silently acted on
