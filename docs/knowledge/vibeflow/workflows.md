# VibeFlow — Workflows, Doctrine & Modèles (patterns extraits)

Patterns issus des ressources Notion @le_gouverneur_ia, catégorie Workflows. Source intégrale fetchée 2026-06-03.

---

## RES-052 — Features natives vs skills custom (TABLEAU 23 — mine d'or)

**Principe** : "Une feature native, c'est un manuel pour personne. Un skill custom, c'est un manuel pour TON projet." Anthropic sort des features (Ultra Things, Plan Mode) = démos grand public. Un skill custom ancré dans le projet les bat.

**Tableau des 23 skills custom** (✅ équivalent natif existe / ⚠️ basique / ❌ pure création de valeur) — **directement mappable sur les skills MAS à créer** :

| # | Skill custom | Natif ? | Composant MAS correspondant |
|---|--------------|---------|------------------------------|
| 1 | `think-custom` (réflexion structurée) | ✅ Ultra Things | effort=xhigh + CoT dans mas-mission-planner |
| 2 | `multi-perspective` (3 angles) | ❌ | self-consistency (skills-reference.md) |
| 3 | `red-team-thinking` (devil's advocate) | ❌ | **Quality Controller adversarial** |
| 4 | `plan-custom` | ✅ Plan Mode | superpowers:writing-plans (déjà installé) |
| 5 | `safe-execute` (5 phases) | ❌ | dispatcher execution loop |
| 6 | `decompose-wbs` | ❌ | **mas-mission-planner** (DAG) |
| 7 | `close-out` (capitalisation) | ❌ | **mas-memory-keeper** (RES-044) |
| 8 | `memory-consolidate` | ⚠️ Memory | **mas-memory-keeper** job mensuel (RES-034) |
| 9 | registres EDR/LRN/FRC | ❌ | **data/memory/ 5 registres** (RES-029) |
| 10 | CLAUDE.md durci | ✅ natif | CLAUDE.md (RES-022/036) |
| 11 | agent-auditeur 4 champs | ⚠️ sub-agents | **mas-reviewer / quality-controller** (RES-043) |
| 12 | audit-owasp | ❌ | **mas-sec-reviewer** (RES-042) |
| 13 | agent-success-criteria | ❌ | fiches `quality_criteria` (RES-046) |
| 14 | 3 modes STRICT/AUDIT/SHADOW | ❌ | **Quality Controller risk modes** (RES-037) |
| 15 | eval-silent-drift | ❌ | **Quality Controller EVAL-XXX** (RES-040) |
| 16 | compétence métier | ❌ | skills lib (frontend-design, etc.) |
| 17 | dont-do-check | ❌ | CLAUDE.md anti-patterns |
| 18 | harden-rules | ❌ | pipeline LRN→règle (RES-036) |
| 19 | skill-or-agent | ❌ | **mas-skill-router** (RES-035) |
| 20 | hooks lifecycle | ✅ natif | Phase 6 hooks |
| 21 | SOUSTRAIRE (désactivation) | ❌ | audit setup (RES-051) |
| 22 | sortir du terminal | ⚠️ | apps/web cockpit (déjà fait) |
| 23 | doctrine portable multi-CLI | ❌ | RES-033 (404) |

**Application MAS** : ce tableau est la **carte de couverture**. Sur 23 patterns, MAS implémente déjà ou planifie ~18. Les 6 skills `mas-*` couvrent les patterns 6, 7, 8, 11, 12, 14, 15, 19. Les manquants à considérer : `red-team-thinking` (#3) et `multi-perspective` (#2) pour le Quality Controller.

**Principe extractible clé** : ne pas attendre les features Anthropic. Reconstruire en custom ancré dans MAS. Mais utiliser les natifs quand ils suffisent (effort param, hooks, CLAUDE.md auto-load).

---

## RES-051 — Doctrine : le trio Constitution + Registres + Usage

**Principe** : pour que Claude Code travaille selon TON contexte (pas une moyenne tiède du web), 3 fichiers :

1. **Constitution** (`CLAUDE.md`, <200 lignes) : WHY / WHAT / HOW / Règles non-négociables / Interdictions / Audience
2. **Registres** (3 fichiers) : DECISIONS / APPRENTISSAGES / FRICTIONS (format ADR/LRN/FRC allégé)
3. **Doctrine d'usage** (`usage.md`) : rituels / skills utilisés / format livrables / ton / escalades

**Distinction clé** : Constitution = qui tu es (stable). Usage = comment TU utilises l'IA (change avec l'outil). Test : "ça change si je change d'outil ?" → oui = usage, non = constitution.

**Anti-patterns (de la doc Anthropic citée)** :
- Règle vague "Format code properly" ❌ → spécifique "Use 2-space indentation" ✅
- CLAUDE.md 800 lignes ❌ → <200 + le reste en skills/rules path-scoped ✅
- "If an entry is a multi-step procedure or only matters for one part of the codebase, move it to a skill or a path-scoped rule"

**Application MAS** :
- **Valide l'architecture MAS** : CLAUDE.md (constitution) + AGENTS.md/SKILLS_REGISTRY.md (rules) + data/memory (registres) + usage implicite dans les fiches.
- **Notre CLAUDE.md fait ~180 lignes** — dans la cible <200. Garder lean. Si dépassement → externaliser en docs/knowledge ou rules.
- **MAS génère ce trio pour les projets externes enregistrés** : quand on enregistre un projet (ex OtakuGO_UP), Context Manager peut proposer de scaffolder son CLAUDE.md + registres si absents. Feature Phase 4/5.
- Anti-pattern "règle vague" → critère pour le linter de fiches : toute règle doit être vérifiable (binaire).

---

## RES-053 — Le système qui fait tourner ma distribution (déjà local)

Contenu intégral dans `docs/claude doc/système-qui-fai-tourner-une-distribution-claude.md`. Architecture complète orchestrateur + sous-agents + skills d'un Lab réel (ContentFlow). Valide le pattern Orchestrator-Workers de MAS.

---

## RES-032 / RES-031 (déjà local)

- RES-032 "Superpowers stack + doctrine" → `docs/claude doc/Le Stack Doctrine.md`. Doctrine par-dessus le framework (auditor agent + audit-weekly.sh).
- RES-031 "3 checks avant upgrade" → `docs/claude doc/3 checks a faire avant d'upgrader ton modele IA.md`. Checklist pour ADR 0002 multi-model.

---

## Ressources 404 (Workflows)

RES-050 (SOUSTRAIRE), RES-049 (procédure custom mode plan), RES-039 (parcours vibe coder), RES-038 (Poor Man's Ultraplan), RES-033 (doctrine portable multi-CLI), RES-030 (6 modes Claude Code), RES-028 (vibe→gouvernance), RES-012 (DON'T/DO). Voir INDEX.md.

**Note RES-030 "6 modes Claude Code"** (404, à récupérer) : Plan/Auto/Fast/Ultra/Verbose/Direct → utile Phase 3.5 pour mapper eco/standard/expert sur les modes natifs.

---

## Synthèse — Mapping Workflows

| Pattern | Composant MAS | Phase |
|---------|---------------|-------|
| 23 skills custom (052) | carte de couverture skills MAS | ref |
| Trio Constitution/Registres/Usage (051) | CLAUDE.md + AGENTS.md + data/memory + scaffold projets externes | validé, 4/5 |
| Système distribution (053) | Orchestrator-Workers Tier A/B | validé |
| red-team-thinking + multi-perspective | Quality Controller (à ajouter) | 3.5 |
