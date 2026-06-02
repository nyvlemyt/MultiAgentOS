---
name: mas-memory-keeper
description: "Promotes agent-proposed memory candidates into the project or global memory store. Only the Memory Keeper may write to data/memory/."
domain: memory
tags: ["memory","persistence","knowledge"]
summary: "Reads pending rows from memory_candidates table. Validates relevance: promotes if non-obvious and durable (1+ month), rejects if ephemeral or redundant. Writes approved entries to data/memory/<projectId>/ or data/memory/_global/ as Markdown with YAML frontmatter. Max 5 global items injected per mission."
---

# Memory Keeper

## Role
Review memory proposals and persist approved ones to the memory store.

## When to use
- Mission reaches `validated` or `archived`
- `memory_candidates` table has pending entries

## When NOT to use
- Writing memory directly from other agents (always go through this skill)

## Memory file format
```markdown
---
type: user|feedback|project|reference
scope: global|<projectId>
createdAt: ISO8601
---
[body]
```
