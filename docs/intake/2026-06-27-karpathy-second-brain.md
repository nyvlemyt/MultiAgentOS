# Intake Audit — Karpathy "LLM Wiki" second-brain pattern (2026-06-27)

> **Candidate**: adopting Andrej Karpathy's *LLM Wiki / AI second brain* pattern — and a
> dedicated "Karpathy-style system prompt" — as the way MAOS organizes its second brain,
> **vs.** the existing memory doctrine (5-register architecture + `CLAUDE.md §8/§12` +
> ADR 0003/0004 + QMD retriever).
> **Question for the user**: keep QMD-as-retriever, or replace it with Obsidian+vault?
> Report **go/no-go before touching doctrine** (user-requested gate).

## Guardrails (step 0)

- **Local-first** ✓ — markdown vault on disk; pattern is provider-agnostic, driven by the Claude Code engine.
- **Subscription-only (§11)** ✓ — no PAYG. Karpathy's pattern needs *an* LLM, not a paid embeddings API. Driven via `@anthropic-ai/claude-agent-sdk`. (Mem0-cloud-style egress already rejected in ADR 0003.)
- **Memory Keeper sole writer (§8)** ✗ **CONFLICT** — Karpathy's core claim is *"you rarely ever write or edit the wiki manually, it's the domain of the LLM"* = **free agent writes**. MAOS forbids this: every producer emits **candidates**, the Keeper alone promotes (ADR 0004 §2). → the *implementation* is rejected as-is; the *principle* is keepable only routed through `captureCandidates()`.
- **≤5 global items/call (§12)** — must hold; an auto-grown wiki can balloon the store, so the **cap on injection** (not on storage) is the guardrail.
- **Token discipline (§6)** ⚠ — Karpathy's headline (≈100 articles / 400k words auto-written) is exactly the quota-burn pattern §6/§12 guard against. Any auto-synthesis must be Keeper-gated + budgeted.
- **No new framework without ADR** ✓ — we adopt a **pattern from public articles**, not a dependency. No repo ingested (see Sanitize).

## Identity

- **What it is**: a *pattern* (not a tool) for structuring a personal knowledge base so an LLM **maintains** it — reads raw sources once, writes structured interlinked markdown "wiki articles", keeps an index, answers queries by pulling the few relevant articles. Human reviews in Obsidian. Behaviour governed by a plain-text `agents.md`-style prompt.
- **Source**: Karpathy's public posts, popularized via blogs + several independent re-implementations (incl. a public GitHub repo and an Apify actor). Pattern-level, widely replicated.
- **Recency / obsolescence**: very recent (weeks old), hype-heavy → obsolescence **medium** (the *principle* is durable; the surrounding tooling churn is high).
- **Summary**:
  - Inversion: the **LLM writes/maintains** the wiki; the user rarely edits by hand.
  - Storage = open markdown; viewing = Obsidian; an **index file** routes retrieval.
  - A governing prompt (`agents.md`) tells agents how to file, link, index, and answer.
  - Distinctive deliverable = an **auto-grown *topical* encyclopedia** (articles per subject), not episodic logs.

## Fit (file/phase-linked)

What it concretely touches: the second-brain north-star (`project_north-star-autonomy`), `docs/knowledge/project-doctrine.md` (5 registers), ADR 0003 (storage/retrieval), ADR 0004 (intake/auto-capture), the Memory Keeper fiche, and the **already-open** candidate ADR `docs/backlog/second-brain-cross-project.md`.

**Duplicate analysis — most of the pattern is already shipped:**

| Karpathy pattern element | MAOS already has it? | Where |
|---|---|---|
| Markdown source-of-truth vault | ✅ yes | ADR 0003 §1 |
| Obsidian as the human view (read-only, no code change) | ✅ yes, **already in doctrine** | `project-doctrine.md` §"Obsidian pour visualisation humaine" (L140–147) |
| `[[wikilinks]]` → backlinks | ✅ yes | `project-doctrine.md` L39–40; Phase 9a emits them |
| LLM/agent maintains the store (not the user) | ⚠️ partial | ADR 0004 auto-capture, but **Keeper-gated**, not free-write |
| An index/retriever to "pull the right articles" | ✅ **superior** | QMD (BM25+vec+rerank) replaces a hand-maintained index file — ADR 0003 amendment 2026-06-22 |
| A governing "agents.md" schema prompt | ✅ yes | `CLAUDE.md §8/§12` + `project-doctrine.md` + Memory Keeper fiche |
| Cross-project shared brain | ✅ captured | `docs/backlog/second-brain-cross-project.md` (candidate ADR) |

**The ONE genuinely new element**: an **auto-grown *topical* knowledge wiki** — LLM-synthesized encyclopedia articles per subject that accumulate over time. MAOS today has **episodic/operational** registers (decisions/learnings/blockers/journal/evals) + a **human-curated** knowledge layer (`docs/knowledge/`). It has **no runtime, auto-synthesized topical-article layer**. That gap is the only thing worth importing.

## Three costs

- **Install**: principle as a doctrine clarification = **cheap** (one doc edit, ~0 tokens runtime). The full topical-wiki register = a real build (synthesis pass + Keeper routing + cap) → a Phase-5 effort, not a doc edit.
- **Maintenance**: an auto-writing wiki **drifts and bloats** if unchecked (Karpathy's 400k words is the cautionary tale). Owner = Memory Keeper path; needs a budget + a consolidation ritual (we already have `anthropic-skills:consolidate-memory` + the close-out ritual).
- **Removal**: principle = trivially reversible (delete a doctrine paragraph). A topical-wiki **register** that agents start populating = **rooted** (a third store to keep in sync) → that part must clear its own ADR before it's built. This is why it is *backlog*, not *implement-now*.

## Sanitize (step 4.bis)

**N/A by construction** — adoption is **pattern-only**, distilled from **public articles**. **No external repo or code is ingested** into MAOS by this audit. The public re-implementation repos (e.g. `NicholasSpisak/second-brain`) and the Apify actor are **not** adopted; if we ever want to mine that code, it triggers its own `mas-sec-reviewer` PASS first (§5 / ADR 0004 §6). No foreign content copied → no secret/PII scan applies to this dossier.

## Scores (0–5)

| Axis | Score | Note |
|---|---|---|
| project_fit | 4 | It *is* the north-star, but ~80% already built |
| token_efficiency | 3 | Auto-synthesis is a quota risk; only safe if Keeper-gated + capped |
| safety | 4 | Local + subscription, but §8 free-write must be neutralized |
| implementation_effort | 4 | Principle = cheap; topical-wiki register = a Phase-5 build |
| evidence_maturity | 4 | Karpathy-authored, many independent rebuilds — but young & hype-heavy |
| user_value | 4 | High pull; directly the "second brain" the user wants |
| phase_compatibility | 3 | Doctrine clarification fits now; the new register is Phase 4.5/5, not the current floor-hardening phase |

## KILL criteria (veto)

- **PAYG / API key** → none. Passes §11. *(no kill)*
- **Free agent writes to `data/memory/`** → **vetoes the as-is implementation** (§8). Survives only routed through `captureCandidates()` → Keeper promotion.
- **Manual index file** → **rejected** — inferior to QMD, which already does hybrid semantic retrieval. (Directly answers the user's "Obsidian vs QMD": Obsidian's manual/Smart-Connections index is the *worse* half of Karpathy's pattern; QMD stays.)
- **External repo/actor adoption** → not adopted; would require sec-review first (not done, not needed here).
- **New framework** → none introduced. *(no kill)*
- **Out-of-phase heavy build** → the topical-wiki *register* is out of the current phase → `backlog_next`, never a back-door install.

## Decision: `adapt_now` (principle extraction) + `backlog_next` (the new register)

**Justification (≤4 lines):** ~80% of the pattern is already shipped (markdown vault, Obsidian view, wikilinks, Keeper-maintained store, QMD index, governing prompt). A standalone "Karpathy system prompt" would **duplicate** `CLAUDE.md §8/§12` + `project-doctrine.md` and risk doctrine **divergence** (anti-§13) → **reject the parallel prompt**. Keep exactly one new idea — the **auto-grown topical wiki layer** — as a doctrine clarification now (`adapt_now`), with its build deferred to the existing cross-project second-brain candidate ADR (`backlog_next`, Phase 4.5/5). **QMD stays the retriever; Obsidian stays the human view; they are layers, not rivals.**

## Appropriation (the MAOS version, if kept)

- **Do NOT** write a new "Karpathy system prompt". The governing schema already exists as `CLAUDE.md §8/§12` + `project-doctrine.md` + the Memory Keeper fiche. Enrich *those* — single source, no divergence.
- **The new register** = a `knowledge/` (topical-article) layer **distinct** from the 5 episodic registers, fed by mission outputs **as candidates** (`captureCandidates()`), promoted by the **Keeper only** (§8 intact). Articles carry `source:` provenance (ADR 0003 §consequences) and `[[wikilinks]]`.
- **Cheapness**: synthesis runs at **eco/medium** effort behind the Keeper write-path, **budget-capped** (§6); injection keeps the ≤5-items cap (§12); QMD indexes the new collection like any other corpus (no new retriever).
- **Obsidian** = no work — `project-doctrine.md` L140–147 already specifies opening the vault read-only. Just *do* it (point Obsidian at `data/memory/`).

## Integration plan

- **Now (on user go)** — `adapt_now`, doc-only, low-risk:
  1. Add a short clause to `docs/knowledge/project-doctrine.md` (after the Obsidian section): the Karpathy "LLM-maintained topical wiki" is adopted **as a principle**, realized **only** through the Keeper candidate pipeline (§8), with QMD as the index (never a manual index file).
  2. Cross-link this dossier from `docs/backlog/second-brain-cross-project.md` (the topical-article layer = a named sub-feature of that candidate ADR).
  - **Binary DoD**: both files reference this dossier; no new write path; no code; no dependency. (No risk:high → no human-gate beyond your go.)
- **Backlog (`backlog_next`, Phase 4.5/5)** — the topical-wiki **register** build, under the existing second-brain candidate ADR. **Do NOT** build it now (out of current floor-hardening phase).

**What NOT to do**: don't create a standalone Karpathy prompt; don't add a manual index; don't let agents write the wiki directly; don't drop or sideline QMD; don't ingest the public re-implementation repos without a sec-review.

## Re-audit date / condition

Re-audit when the **cross-project second-brain candidate ADR is opened** (Phase 5 second-brain extension), or if the user asks to prototype the topical-wiki layer sooner.

## Sources

- [Karpathy's Instructions for Building an AI-Driven Second Brain — Techstrong.ai](https://techstrong.ai/features/karpathys-instructions-for-building-an-ai-driven-second-brain/)
- [Karpathy's LLM Knowledge Base: Build Your Second Brain — Codersera](https://codersera.com/blog/karpathy-llm-knowledge-base-second-brain/)
- [What Is Andrej Karpathy's LLM Wiki? (Claude Code) — MindStudio](https://www.mindstudio.ai/blog/andrej-karpathy-llm-wiki-knowledge-base-claude-code)
- [NicholasSpisak/second-brain — GitHub (public re-implementation, NOT adopted)](https://github.com/NicholasSpisak/second-brain)
