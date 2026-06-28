# Backlog — Audit de sélection LLM (méthodologie + plan)

**Quand** : Phase 3.5 (alimente ADR 0002 multi-model router). **Valeur** : critique (perf + coût). **Statut** : méthodologie posée ici, audit à exécuter avant de coder le router.

## Le problème

La sélection du LLM par tâche/agent/skill est **éparpillée sur 4 dimensions qui se contredisent**, sans précédence définie ni preuve.

| Dimension | Source | Règle actuelle |
|-----------|--------|----------------|
| **Mode** (coût) | TOKEN_STRATEGY §2 | eco→haiku · standard→haiku→sonnet retry · expert→sonnet/opus |
| **Fiche agent** | `packages/agents/fiches/*.md` `budget.model` | mission-planner=sonnet, skill-router=haiku, reviewer=sonnet, sec-reviewer=sonnet, context-manager=haiku, memory-keeper=haiku |
| **Domain** (provider) | ROADMAP §3.5 table | research→Perplexity · code-execution→Claude · code-review→Codex · planning→Claude · memory→Gemini · security→Claude · ux→GPT-4o · writing→GPT-4o · search→Perplexity |
| **Risk** | skills-reference.md (wshobson) | high→opus · medium→sonnet · low→haiku |

**Conflits non résolus** :
- mission-planner fiche=`sonnet` MAIS mode eco=`haiku` → ?
- domain `planning`→Claude MAIS quel modèle Claude (haiku/sonnet/opus) ?
- risk `high`→opus MAIS mode eco veut haiku → ?
- effort param (eco→medium, standard→high, expert→xhigh) = 5e axe orthogonal

**Aucune preuve** : la table ROADMAP est "best-effort, iterable". Rien ne prouve codex > claude pour l'audit, ou gemini > claude pour la mémoire.

## La méthodologie cible (à encoder dans le router)

### 1. Modèle de résolution — précédence stricte

Une tâche porte : `{mode, agentId, domain, risk, quotaState, languageMode}`. Résolution proposée (à valider par l'audit) :

```
1. HARD CONSTRAINTS (non négociable)
   - code-execution (file/bash/git) → Claude Agent SDK ONLY (CLAUDE.md §11)
   - security/blocking → jamais un modèle non-audité
2. QUOTA STATE (circuit breaker)
   - Claude quota épuisé → fallback chain du domain (token fallback §3.5)
3. RISK override
   - risk=blocking|high → tier haut (opus/sonnet ou modèle le + fiable du domain)
4. MODE budget cap
   - eco plafonne au tier bas SAUF si risk override (3) l'exige
5. DOMAIN provider
   - choisit le provider (Claude/Codex/Gemini/Perplexity) dans le budget restant
6. AGENT default
   - fiche budget.model = défaut si rien au-dessus ne tranche
```

**Règle d'or** : sécurité > quota > risque > coût > domaine > défaut agent. À confirmer/ajuster par l'audit.

### 2. L'audit à exécuter (evidence-based, pas hypothèse)

Pour chaque **type de tâche** (les 9 domaines × 3 niveaux risk), mesurer sur un échantillon représentatif :

| Métrique | Comment |
|----------|---------|
| **Qualité** | rubrique 5 critères (RES-040 EVAL-XXX) + cross-check modèle d'autre famille (anti-biais) |
| **Coût** | tokens × prix provider (ou quotaUnits pour Claude subscription) |
| **Latence** | temps réponse médian |
| **Fiabilité** | taux de sortie valide (JSON schema, format attendu) |
| **Disponibilité** | rate-limit observé sur le forfait |

Sortie : une table `domain × risk → modèle optimal` **justifiée par les chiffres**, pas par intuition. Remplace la table "best-effort" du ROADMAP.

**Échantillon de tâches** : réutiliser de vraies tâches MAS (decompose mission, route skill, review diff, audit OWASP, write summary, search docs). Pas de benchmark synthétique.

### 3. Préférences user explicites (input ADR 0002)

- research → **Perplexity** · dev → **Claude** · audit/code-review → **Codex** · manager/verif → **Codex ou Claude**
- Cross-check Quality Controller = modèle d'AUTRE famille que celui qui a produit (RES-040 anti-boucle : "évaluer avec le même LLM hallucine sur les mêmes biais").
- Fallback quota Claude ↔ ChatGPT.

### 4. Cadence de ré-évaluation (anti-dérive)

- **RES-031 "3 checks avant upgrade"** (`docs/claude-doc/3 checks...IA.md`) : avant de switcher sur un nouveau modèle (Opus 5, Gemini 3...), vérifier règles propres + décisions tracées + learnings actifs. Un modèle puissant amplifie le chaos d'une base floue.
- **RES-040 dérive temporelle** : la table de routing est un "template" qui périme. Re-auditer trimestriellement (nouveaux modèles, prix changés, deprecations).
- **RES-030 "6 modes Claude Code"** (404, à ré-exporter) : mapper eco/standard/expert sur les modes natifs.

## Mapping MAS

| Élément | Fichier | Action |
|---------|---------|--------|
| ADR 0002 | `docs/decisions/0002-multi-model-router.md` | décision : précédence + table evidence-based + amend CLAUDE.md §11 |
| Config | `config/model-routing.json` | `{domain, risk} → {provider, model, fallback[]}` |
| Router | `packages/core/src/llm.router.ts` | applique la précédence (1→6) |
| LLMRequest | `packages/core` | gagne `domain`, `risk` (déjà `mode`) |
| Fiches | `packages/agents/fiches/*.md` | `budget.model` devient un DÉFAUT (niveau 6), plus une règle dure |
| Quality Controller | fiche + SKILL.md | cross-check d'autre famille (RES-040) |
| `/tokens` page | apps/web | breakdown par provider (déjà ROADMAP §3.5) |

## Réponse à "c'est bien prévu ?"

**Non, pas rigoureusement.** Le router est planifié (ROADMAP §3.5) mais :
- la table de routing est une hypothèse non prouvée
- les 4 dimensions ne sont pas réconciliées (précédence absente)
- aucun audit evidence-based n'est défini

→ Cette carte pose la méthodologie. L'**audit doit tourner au début de Phase 3.5**, avant de coder `llm.router.ts`. C'est un prérequis d'ADR 0002.
