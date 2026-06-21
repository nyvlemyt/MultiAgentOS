# ECC residual intake — non-skill/agent/rule/command dirs (2026-06-21)

The first ECC campaign harvested **skills / agents / rules / commands**. The commander
asked to audit the *remaining* top-level dirs of `affaan-m/ecc` (local clone at
`/Users/melvyn/Documents/02_PROJETS/Tkinter/ecc`) and integrate what is valuable.

Method: intake-audit (CLAUDE.md §13). Decision rule — **distill transferable knowledge
into `docs/knowledge/`; never copy ECC harness internals** (installer, schemas, plugins,
editor scaffolds are specific to ECC's own packaging and clash with MAOS's stack).

## Decisions per dir

| Dir | Verdict | Rationale / integration |
|---|---|---|
| `mcp-configs/` | **INTEGRATE** | ~30-server MCP catalog + `docs/MCP-CONNECTOR-POLICY.md` doctrine → distilled to `docs/knowledge/mcp-connector-policy-and-catalog.md`. Feeds [[project_linked_memory]] P4 (memory MCPs: omega-memory/squish/longhand) + §11.bis provider policy. |
| `research/ecc2-codebase-analysis.md` | **INTEGRATE** | ecc2 (Rust TUI control-plane) patterns: 4-axis risk scoring, session state machine, ring buffer, DbWriter, SessionMetrics, comms send-without-receive gap → `docs/knowledge/risk-scoring-and-session-orchestration.md`. Feeds §5 + Phase 6 risk classifier + worker. |
| `hooks/` + `scripts/hooks/*.js` + `docs/continuous-learning-v2-spec.md` | **INTEGRATE (pattern only)** | Memory-persistence lifecycle (session-start/pre-compact/session-end/observe/activity) + continuous-learning spiral (observe→instinct→evolve-to-skill) → `docs/knowledge/continuous-learning-and-memory-lifecycle.md`. Feeds §13 persistence bridge + Phase 4 memory. JS impls NOT copied (MAOS = own hook surface). |
| `config/project-stack-mappings.json` | **INTEGRATE (reference)** | indicator→{rules,skills,commands,permissions} per stack — richer than our `detectStack` (Phase 7b). Noted as an enrichment reference in the risk/session knowledge doc + backlog for detectStack. |
| `docs/MCP-CONNECTOR-POLICY.md` | **INTEGRATE** | folded into the MCP knowledge doc (the "Universal + MCP-beats-CLI" rule). |
| `contexts/` (dev/research/review) | skip | Trivial mode presets; MAOS already has autonomy levels (§4) + per-project context-packs. No new signal. |
| `integrations/aura/` | backlog | Read-only counterparty trust-gate before delegate/settle. Niche (agent-to-agent payments). Pattern noted; MAOS has no payment surface yet. Re-audit if a payments domain agent appears. |
| `examples/*-CLAUDE.md` (django/go/rails/rust/laravel/harmonyos) | backlog | Per-stack CLAUDE.md exemplars could enrich Phase-7 project templates. Backlog, not integrated now. |
| `docs/architecture/*` (observability-readiness, evaluator-rag, cross-harness, session-adapter) | partial | observability + evaluator-rag + continuous-learning folded into the knowledge docs where relevant; the rest is ECC-roadmap-internal → skip. |
| `the-security-guide.md`, `the-longform/shortform-guide.md`, `WORKING-CONTEXT.md`, `SOUL.md` | skip | ECC's own operating guide/philosophy; MAOS has CLAUDE.md + docs/knowledge + project-doctrine. Security content already superseded by the 877-skill defensive library. |
| `ecc2/` (Rust src), `src/`, `tests/`, `assets/` | skip | ecc2 = separate Rust TUI app (distilled via research note); MAOS is Next/Node. |
| `schemas/`, `manifests/`, `scaffolds/`, `plugins/`, `.claude-plugin/`, `legacy-command-shims/`, `install.*`, `integrations` (installer), editor dot-dirs (`.cursor/.codex/.kiro/.zed/...`) | skip | ECC installer + multi-harness packaging internals. Out of scope; MAOS ships its own. |

## Integrated artifacts (this intake)
- `docs/knowledge/mcp-connector-policy-and-catalog.md`
- `docs/knowledge/risk-scoring-and-session-orchestration.md`
- `docs/knowledge/continuous-learning-and-memory-lifecycle.md`

## Backlog (re-audit dates)
- Per-stack CLAUDE.md exemplars → Phase-7 templates enrichment.
- `project-stack-mappings` → enrich `detectStack` (Phase 7b) with per-stack build/test/lint/format + permission allow/deny.
- aura trust-gate → revisit if/when a payments domain agent is introduced.
