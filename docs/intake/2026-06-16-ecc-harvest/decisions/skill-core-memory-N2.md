# ECC Harvest — Decisions Shard: cluster `skill:core-memory` (Doer N2)

Date: 2026-06-18 · Doer lot N2 · Worktree `maos-ecc` · Wide-bar rule (intake-audit §12 step 7).
Source repo: affaan-m/ecc (skills RO at `/tmp/ecc-inspect/skills/<slug>/`).
Sanitize pass: 0 SDK imports, 0 secrets, 0 PAYG across all 4 candidates (grep clean).

| slug | decision | tier | path |
|---|---|---|---|
| content-hash-cache-pattern | **adapt_now (keep)** | T1 | `packages/skills/library/content-hash-cache-pattern/SKILL.md` |
| scientific-db-pubmed-database | **adapt_now (keep)** | T2 | `packages/skills/library/scientific-db-pubmed-database/SKILL.md` |
| ito-basket-compare | **reject** | T0 | — |
| knowledge-ops | **reject** | T0 | — |

---

## content-hash-cache-pattern — adapt_now (T1) ✅

- **Identity:** Reusable pattern — cache expensive deterministic file processing keyed by SHA-256 of file *content* (not path); `{hash}.json` per entry, O(1), no index; service-layer wrapper keeps the processing fn pure.
- **Dedup vs our assets:** NOT a dup-no-better. `mas-context-manager` caches context-packs on a 24h *time* window and is *path*-based. Content-hash invalidation is a distinct, superior signal: survives moves/renames, auto-invalidates on edit. Complements (does not replace) the time window — combine both.
- **Fit:** Directly serves `TOKEN_STRATEGY §6` (don't re-derive `data/skill-cache/<id>/summary.md`, don't re-render `data/context-packs/<projectId>.md` when source bytes unchanged).
- **Sanitize:** clean. Deterministic, no LLM, no network.
- **KILL criteria:** none triggered. No PAYG, no secret, not a stub, performant, in-domain (MAS spine: caching/memory).
- **Appropriation:** added MAS framing (skill-cache / context-pack), correctness emphasis (key must cover ALL inputs, not just file), graceful-corruption, SRP. Prompt Defense Baseline header added (it guides code-writing agents). Reframed into 7 mandatory §12 sections.
- **Re-audit:** when context-pack caching is wired into the worker (next memory phase).

## scientific-db-pubmed-database — adapt_now (T2) ✅

- **Identity:** Biomedical literature search craft over PubMed/NCBI E-utilities — MeSH/field-tag query construction, esearch→esummary→efetch→elink workflow, reproducible search logs. Origin slug dir = `scientific-db-pubmed-database` (frontmatter `name: pubmed-database`).
- **Vertical verdict (biomed):** KEEP — real domain value, NOT a pure vendor binding. NCBI E-utilities is a **free public API**; `api_key`/`email` are optional rate-limit aids from env, no per-token billing, no §11 conflict. Operational content is genuine (MeSH subheading syntax, [majr] tradeoffs, systematic-review logging) — not a stub.
- **Dedup:** no overlap in our 24 skills / 56 agents (no biomed literature skill).
- **Sanitize:** clean. Network host `eutils.ncbi.nlm.nih.gov` must be in `config/permissions.json#allowed_hosts` before live calls (§5) — noted in skill.
- **KILL criteria:** none. Key is optional+env (not PAYG), free API, in-domain arsenal.
- **Appropriation:** env-only key discipline restated against §11, allowed_hosts gating against §5, scope-guard (surface literature, not clinical advice), Prompt Defense Baseline. 7 §12 sections.
- **Re-audit:** if NCBI deprecates E-utilities or moves to paid tier.

## ito-basket-compare — reject (T0) ❌

- **Identity:** Read-only comparison of *Itô* prediction-market baskets vs a user's KB/portfolio/thesis; gated behind `ITO_API_KEY` for Itô basket/market data.
- **Reject reason (vertical, vendor-bound, no MAS value):** Thin wrapper bound to one specific third-party prediction-market vendor (Itô). The generic lens ("compare a set vs your notes → gaps/conflicts/missing context") is already covered by our memory + reviewer stack; nothing biomedical/orchestration value remains once the Itô binding is stripped. Crypto/prediction-market vertical with no domain fit for MultiAgentOS. Per lot instructions: reject vertical that is pure binding-to-vendor with no real domain value.
- **Note:** `ITO_API_KEY` is a third-party paid-ish data key — even if not Anthropic PAYG, adopting a vendor-locked finance binding with zero MAS fit fails the wide-bar (dup-no-better of our generic gap-analysis + zero standalone value).
- **Re-audit condition:** only if MAS ever gains a real prediction-market / finance project needing Itô specifically.

## knowledge-ops — reject (T0) ❌

- **Identity:** Multi-layer knowledge-base mgmt skill (ingest/sync/dedup/retrieve across Claude Code memory, MCP memory graph, Supabase/Postgres, GitHub/Linear, KB repo, local archive).
- **Reject reason (dup-no-better AND architecturally conflicting):** We already own the memory spine — `mas-memory-keeper` (sole writer to `data/memory/`, §8), `mas-context-manager`, and the 5-register architecture from `docs/knowledge/project-doctrine.md`. This skill prescribes a *competing* architecture: multiple writers, `~/.claude/projects/*/memory/` writes, Supabase/Linear/MCP-memory layers — which violates §8 (Memory Keeper is the only writer) and the local-first / subscription-only model (§11). Adopting it would fork our memory doctrine.
- **Useful sub-idea already owned:** "dedup before store / one canonical home per fact" is already enforced by `mas-memory-keeper`. Nothing net-new to extract.
- **Re-audit condition:** none — superseded by our memory doctrine; revisit only on a deliberate ADR to redesign memory.
