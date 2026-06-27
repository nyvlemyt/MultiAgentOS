---
id: patterns-de-production-pour-agents
slug: patterns-de-production-pour-agents
source_key: 'sha256:3ef7ceb246adf4e1976b1c779b9e6c0c7875a4787aa5d8b081e175ea71e0bd8f'
lifecycle: active
trust: trusted
schema_version: '1'
---
# Patterns de Production pour Agents

## Experts de référence

| Expert | URL | Domaine |
|--------|-----|---------|
| swyx / Shawn Wang | https://www.latent.space/ | Architecture agents, IMPACT framework |
| Simon Willison | https://simonwillison.net | Patterns pratiques, sécurité |
| Hamel Husain | https://hamel.dev | Évaluation, itération produit |
| Eugene Yan | https://eugeneyan.com/writing/llm-patterns/ | 7 patterns LLM production |
| Lilian Weng | https://lilianweng.github.io | Taxonomie agents, recherche |

---

## 12-Factor Agents (HumanLayer)

**Source:** https://github.com/humanlayer/12-factor-agents — **À lire avant Phase 3**

| Facteur | Description | Mapping MultiAgentOS |
|---------|-------------|---------------------|
| 1. NL → Tool Calls | Convertir intent en appels déterministes | Dispatcher → `AgentDefinition.tools` |
| 2. Own Your Prompts | Ne pas déléguer aux frameworks | Fiches agents dans `packages/agents/fiches/` |
| 3. Own Context Window | Gestion explicite du contexte | TOKEN_STRATEGY.md + context-packs |
| 4. Tools = Structured Outputs | Pas d'abstractions spéciales | JSON schemas dans les tools |
| 5. Unify execution + state | État agent synchronisé avec la DB | Table `jobs` + `events` Drizzle |
| 6. Launch/Pause/Resume | APIs simples start/stop/restart | Worker + SSE + human gates |
| 7. Humans via Tool Calls | Même mécanisme tool-calling pour approbation | `risk: high` → validation tool |
| 8. Own Control Flow | Boucle explicite, pas déléguée | Worker `tick()` explicite |
| 9. Compact Errors | Représenter erreurs sans polluer contexte | Error summary → context window |
| 10. Small Focused Agents | Agents narrow-purpose | Tier A = orchestration only |
| 11. Trigger from Anywhere | CLI, web, cron | Worker + API + `/missions` cockpit |
| 12. Stateless Reducer | Agent = fonction pure state→state | `executeNextTask` idempotent |

---

## IMPACT Framework (swyx — AI Engineer Summit 2025)

| Composant | Status MultiAgentOS |
|-----------|-------------------|
| **Intent** | Mission + to-do list ✓ |
| **Memory** | `data/memory/` + Memory Keeper ✓ |
| **Planning** | Décomposition en tasks ✓ |
| **Authority** | Autonomy levels (§4) + risky gates (§5) ✓ |
| **Control Flow** | Worker + SSE + job table ✓ |
| **Tools** | Claude Agent SDK + MCP ✓ |

**Alerte swyx — stutter-step agents** : les agents qui confirment à chaque micro-action perdent toute valeur. Les human gates doivent s'appliquer **seulement aux actions §5**, pas à chaque tour.

---

## Leçons Simon Willison (terrain, quotidien)

1. **TDD obligatoire avec les agents** : écrire les tests d'abord permet aux agents de valider leur propre travail itérativement. Pattern `superpowers:test-driven-development` déjà dans CLAUDE.md.

2. **Loss of control pattern** : lors de la compaction de contexte, les instructions de mission originales peuvent être perdues. → MultiAgentOS doit stocker les instructions hors du contexte agent (DB SQLite) et les ré-injecter à chaque nouveau tour.

3. **Lethal trifecta** (sécurité) : accès données privées + accès contenu non fiable + capacité d'action = trio à briser. Le `config/permissions.json` §5 répond exactement à ça.

4. **Contexte discipline** : élaguer agressivement ce que le modèle voit, déplacer l'état vers du stockage durable.

---

## Leçons Hamel Husain (30+ entreprises)

1. **Error analysis avant architecture** : catégoriser les modes d'échec réels avant de choisir un framework. Construire d'abord un viewer des outputs agents (page `/trace`), puis raffiner le dispatcher.

2. **Custom data viewers** : 10× plus rapide à itérer que les dashboards génériques. La page `/trace` de MultiAgentOS doit être domain-specific, pas un JSON dump générique.

3. **Domain experts comme prompt engineers** : le user power-user doit pouvoir éditer les fiches agents directement depuis le cockpit.

4. **Binary judgments** : pass/fail clair + critique détaillé, pas des scores flottants. Pour les évaluations de tâches agents.

---

## 7 Patterns LLM Production (Eugene Yan @ Anthropic)

1. **Evals** — mesurer avant d'optimiser. Eval-Driven Development = TDD pour agents.
2. **RAG** — hybride keyword + sémantique pour context-packs.
3. **Caching** — `data/skill-cache/` correspond à ce pattern. Ne cacher que si on comprend la distribution.
4. **Guardrails** — validation structurale + syntaxique + sémantique + sécurité avant de servir.
5. **Defensive UX** — concevoir pour l'imperfection. Toujours montrer l'attribution, permettre la correction.
6. **Feedback flywheel** — collecter le feedback utilisateur dès le début.
7. **Fine-tuning** — non pertinent MVP, pertinent pour skill summaries Phase 5+.

---

## Patterns de fiabilité multi-agents (production)

Source: https://www.getmaxim.ai/articles/multi-agent-system-reliability

### Métriques clés
- **Race conditions croissent quadratiquement** : N(N-1)/2 pour N agents concurrents. Limiter le parallélisme non coordonné.
- **Handoff latency** : 100-500ms par interaction. 10 handoffs = 1-5 secondes de coordination pure.
- **Budget réel** : agents utilisent 4× plus de tokens que le chat. Multi-agent research = 15×.

### Failure modes courants
1. **Stale state propagation** — solution : event sourcing sur la table `jobs`
2. **Conflicting updates** — solution : atomic claims dans SQLite (pattern déjà utilisé dans `dispatch.ts`)
3. **Partial visibility** — solution : SSE stream + `/trace` dashboard

### Circuit breakers obligatoires
```
budget_exceeded → pause + ask (déjà dans §6 CLAUDE.md)
rate_limit → fallback provider (Phase 3.5 RouterLLMClient)
task_timeout (5 min heartbeat) → mark failed, retry ou escalate
```

---

## Human-in-the-Loop patterns (Redis + Martin Fowler)

**Trois positions sur le loop** (Martin Fowler) :
- **In-the-loop** : pause systématique = `manual`
- **On-the-loop** : surveillance + override possible = `assisted`/`autonomous`
- **Out-of-the-loop** : full auto + reporting = `autopilot`

**Règle critique** : les humains ne sont pas des composants request-response. La latence est imprévisible et non bornée. Le worker **doit être async**, pas synchrone.

**Pattern Pub/Sub pour gates** :
```
Worker → publie `validation_required` dans la table `validations`
UI → s'abonne via SSE → affiche bouton de validation
Humain → clique → worker reprend
```

---

## Plan-Then-Execute Pattern (sécurité)

Source: https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/ + ArXiv 2506.08837

**Règle** : générer le plan complet **AVANT** d'exposer les agents à du contenu non fiable (emails, pages web, logs utilisateur).

```
Mission reçue
  → Mission Planner génère task DAG (contexte propre, pas de contenu externe)
  → Plan validé par Quality Controller
  → SEULEMENT ENSUITE : agents d'exécution touchent les données externes
```

**Note sécurité** : même les meilleures défenses anti-injection sont contournées ~50% du temps avec 10 tentatives. Les guardrails réduisent le risque, ne l'éliminent pas.

---

## Monitoring et Observabilité

| Outil | Stars | Pricing | Priorité |
|-------|-------|---------|----------|
| Langfuse | — | Free self-hosted (MIT) | Haute — Phase 3/4 |
| AgentOps | — | 40$/mois, free trial | Moyenne — Phase 4+ |
| Arize Phoenix | — | Free self-hosted | Basse — Phase 5+ |

**Langfuse** : Standard de facto. Acquis par ClickHouse jan. 2026, MIT préservé. Fonctionnalités : prompt tracking/versioning, execution traces, token/cost tracking, LLM-as-Judge scores. Self-hosted = zéro coût, zéro vendor lock-in.

→ À intégrer dans Phase 3 ou 4 dans le worker pour remplacer/compléter le système de logging actuel.

---

## Règles de construction (synthèse)

```
1. ≤ 7 tools max par agent (source : MLOps Community — 20+ outils = moins performant)
2. Stocker les instructions de mission en DB, pas dans le contexte agent
3. Plan avant exécution — jamais l'inverse
4. Human gates sur §5 uniquement, pas sur chaque tour
5. Event sourcing pour l'état distribué (pas de state shared mutable)
6. Timeouts explicites : 5 min heartbeat pour agents (pattern Agent Teams)
7. Toujours exposer l'attribution des outputs dans le cockpit
```

---

## Autonomy & autopilot safety (Phase 6)

The risk gate is the load-bearing safety property. Surfacing beats cleverness:
the audit log must *prove* nothing high-risk ran unsupervised.

**Risk classifier (`packages/core/src/risk-classifier.ts`).** Pure, deterministic
`classifyRisk()` mirrors **CLAUDE.md §5**'s always-gate list as a hoisted readonly
rule table → `blocking` (`rm`, `git reset --hard`, `git push --force`/`-f`, branch
deletion, `.env`/secrets/keystore writes, `curl | sh`, `eval`, `sudo`). Perms-declared
`high`/`blocking` categories raise to `high`. Shell-ish text with no concrete match
sets `needsLLMFallback` — the Sec-Reviewer refinement seam (mocked). `planMission`
persists the **stricter** of classifier vs planner risk and logs `risk_classified`.

**Autopilot maxRisk breaker (`packages/agents/src/autopilot.ts`).** A `schedules`
row defines the window (HH:MM + days, midnight-wrap aware) and a `maxRisk` cap
(`low`|`medium`). `runAutopilotTick(db, now)` only auto-runs tasks with
`risk ≤ maxRisk`, routing every run through `executeNextTask` so the §5 gate stays
intact; higher-risk tasks are recorded in `skippedHighRisk` and never executed.
All time logic takes an explicit `now: Date` for deterministic tests — no buried
`Date.now()`.

**Daily report (`packages/agents/src/daily-report.ts`).** `buildDailyReport`
counts `missionsAdvanced` / `missionsBlocked` / `tasksDone` / `validationsPending`
and sums `quotaUnits` over the window; `emitDailyReport` logs a `daily_report`
event (rendered in `/trace` + on the dashboard) and writes markdown to
`data/reports/<date>.md`. **Quota units only — never € figures** (CLAUDE.md §11).
Reports go to `data/reports/`, never `data/memory/` (§8 Memory Keeper lock).

---

## Ressources à suivre

| Source | Type | Priorité |
|--------|------|---------|
| https://www.latent.space/ | Newsletter + podcast | Haute |
| https://simonw.substack.com | Newsletter terrain | Haute |
| https://home.mlops.community | Communauté + talks | Haute |
| https://hamel.dev | Blog praticien | Haute |
| https://eugeneyan.com | Blog Anthropic engineer | Haute |
