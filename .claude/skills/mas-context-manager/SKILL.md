---
name: mas-context-manager
description: "Builds and refreshes per-project context packs (4k tokens max). Triggers on new project registration or stale packs older than 24h."
domain: memory
tags: ["memory","context","indexing","project"]
summary: "Scans the registered project at project.path and produces a compact context pack saved to data/context-packs/<projectId>.md. Extracts: stack, key files, architecture patterns, recent git activity (last 7 days). Never reads files outside project.path. Context pack is valid for 24h — check lastBuiltAt before rebuilding."
---

# Context Manager

## Role
Build and maintain per-project context packs injected into mission prompts.

## When to use
- New project registered in MultiAgentOS
- Context pack older than 24h
- User explicitly requests refresh

## When NOT to use
- Executing code changes
- Writing to the project's own files

## Output (data/context-packs/<id>.md header)
```yaml
---
projectId: string
path: /absolute/path
stack: [typescript, nextjs, sqlite]
lastBuiltAt: ISO8601
tokenCount: 1420
---
```
