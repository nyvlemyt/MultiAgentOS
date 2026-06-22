# Phase 9 · 0a renforcée — Retrieval unifié (le « cerveau » de MultiAgentOS)

> **Statut** : décidé avec l'utilisateur le 2026-06-22, en cours (Phase 9, on ne passe pas à 0b avant la fin).
> **But** : faire de la couche retrieval **le moteur de recherche unique** sur tout ce que le système sait et possède, posé sur une base Markdown, exploitable par l'humain (Obsidian) ET par les agents (QMD) — assez solide pour porter un futur **Jarvis** et N projets **sans rework**.

## 1. Le modèle validé

Tout est stocké en **Markdown + frontmatter** (source de vérité, versionnée, lisible). Une seule recherche, **QMD**, couvre trois familles :

| Famille | Contenu | Où |
|--------|---------|-----|
| **Outils (arsenal)** | skills, agents, règles, commandes | `packages/skills/library/`, `packages/agents/library/`, `.claude/agents/`, `docs/rules/`, `.claude/commands/` |
| **Connaissances** | docs formatés distillés | `docs/knowledge/`, `docs/workflows/` |
| **Mémoire** | décisions / learnings / blockers / journal / evals, par projet + global | `data/memory/` (5 registres) |

- **QMD = chercher.** Il indexe (résumés L1 + frontmatter pour l'arsenal ; corps pour savoir/mémoire) et répond aux requêtes — pour l'humain *et* pour les agents (serveur MCP).
- **Obsidian = la couche humaine.** Lire / éditer / ajouter / voir le graphe (wikilinks `[[…]]`) sur les mêmes fichiers.
- **Frontière non négociable — 3 rôles séparés :**
  - **Stocker** = Markdown (vérité). Le Memory Keeper est le seul scripteur de la mémoire (§8).
  - **Chercher** = QMD (index dérivé, jetable, reconstructible).
  - **Décider** quoi charger en mission = le **Skill Router** (politique runtime, budget/domaine) — il *interroge* QMD pour ses candidats, mais reste le décideur. Pas deux sélecteurs concurrents.

## 2. Les 8 principes de fondation durable (Jarvis + N projets, sans rework)

1. **Le texte est la vérité, l'index est jetable.** Markdown+frontmatter versionné ; QMD/FTS = cache reconstructible. → changer de moteur de recherche à vie, sans rien perdre. Anti-lock-in.
2. **Un seul schéma de frontmatter pour TOUT** (doc, mémoire, skill, agent, règle, commande) : `id, type, title, summary (L1 ≤200 tok), tags, domain, scope, source, status, created, updated, related[[…]]`. → recherche homogène + **filtres** transverses sur objets hétérogènes.
3. **Recherche hybride + filtres.** Mots-clés (BM25/FTS) + sémantique (vecteurs) + reranker (QMD) ; **FTS en fallback** si les modèles QMD ne chargent pas ; filtrable par type/domaine/scope/projet/statut. → rappel de qualité, pas juste du "match".
4. **Le cerveau est un service (MCP), découplé du cockpit.** → un futur **Jarvis**, Claude Code, Obsidian, n'importe quelle app branchent le **même** cerveau via une API stable. Un cerveau, plusieurs visages. C'est le principe-clé qui prépare Jarvis.
5. **Provenance + statut + dates + passe de consolidation.** On *supersède* (jamais d'effacement destructif) ; une passe régulière dédoublonne et marque le périmé (cf. `continuous-learning-and-memory-lifecycle.md`). → le cerveau vieillit bien à l'échelle ; les imports massifs (cours) ne le polluent pas.
6. **Pipeline d'ingestion propre.** Déposer cours/PDF/note → normalisation Markdown+frontmatter → gate sécu/qualité (`intake-audit` + classifieur déterministe) → écriture par le Keeper → indexation auto. Schéma **prêt pour le multimodal** (transcription cours vidéo → markdown, ultérieur). → verser du matériel en masse sans corvée.
7. **Harnais d'évaluation du retrieval en CI.** Jeu de requêtes-or → documents attendus, rejoué à chaque changement de moteur/collections. → faire évoluer (FTS→QMD, +arsenal) **sans régression silencieuse**. Assurance "jamais re-bosser". Relié au registre EVAL + l'agent évaluateur (0c).
8. **Discipline préservée.** Keeper seul scripteur (l'index ne réécrit jamais la vérité), retrieval **à la demande** (pas d'auto-injection au boot), **≤5** items injectés, résumés d'abord, hydratation sur besoin. → confiance + coût maîtrisé sur abonnement, même avec un énorme cerveau.

## 3. Périmètre 0a renforcée (ce qui se fait MAINTENANT)

S'ajoute à la mémoire de base déjà livrée (PR #35, `phase/9a-memory`) :

- **Installer QMD pour de vrai** derrière l'interface `MemoryRetriever` (`QmdRetriever`) — local, pas de clé API, Node ≥22 (v22.22.3 ✓). **Garder `FtsRetriever` en fallback.** Audit supply-chain : épingler versions/hash des modèles téléchargés (§5).
- **Collections** : `mas-knowledge` (`docs/knowledge/`, `docs/workflows/`), `mas-memory` (`data/memory/`), **`mas-arsenal`** (skills + agents froids + `.claude/agents/` + `docs/rules/` + `.claude/commands/`) — indexer **résumés L1 + frontmatter**, pas les corps entiers.
- **Recherche mémoire projet par pertinence** : brancher `scope:'project'` (déjà supporté par le retriever) dans `buildMemoryContext` — aujourd'hui injecté par récence (3 derniers) seulement.
- **Schéma frontmatter unifié** (principe 2) : passe légère pour que les 3 familles partagent les champs cœur (`id/type/title/summary/tags/domain/scope/source/status/dates/related`).
- **Exposer la recherche en MCP** (principe 4) : un outil `query` interrogeable par les agents *et* réutilisable hors cockpit (socle Jarvis). QMD sert déjà du MCP natif.
- **Harnais d'éval retrieval** (principe 7) : petit jeu de requêtes-or en CI (golden queries → docs attendus).
- **Amender ADR 0003** : QMD **maintenant** (plus différé) ; retrieval **unifié** savoir + mémoire + arsenal ; FTS = fallback ; frontière stocker/chercher/décider.

### Critères de sortie 0a renforcée
- Une requête **sémantique** ("comment éviter d'oublier entre sessions") retrouve le bon doc savoir.
- Une requête **arsenal** ("skill pour auditer une PR", "agent revue sécu") retrouve le bon skill/agent froid.
- La **mémoire projet** est retrouvée par pertinence (pas seulement récence).
- **Fallback FTS** opérationnel si QMD est coupé.
- La recherche est **interrogeable en MCP** (preuve : un appel `query` hors du worker répond).
- Harnais d'éval **vert** en CI ; 5 checks + Sonar exit 0.

## 4. Différé (volontairement, hors 0a)
- **Graphify/codegraph** (indexation de **code** pour le Context Manager) — Phase 5, ADR `0007-context-indexing` + audit sécu. Différent de la recherche savoir/mémoire/arsenal.
- **Multimodal d'ingestion** (transcription cours vidéo) — schéma prêt, implémentation ultérieure.
- **KG temporel** (Graphiti/Zep) pour très longue durée — option future ; les `dates`/`status` posés maintenant suffisent à le préparer.

## 5. Pourquoi ça sert directement Jarvis et la suite
Le cerveau devient un **service MCP autonome** sur une base Markdown : tout ce que tu apprends, tous tes outils, toute ta mémoire de projet sont cherchables par n'importe quel agent ou app. Un Jarvis ultérieur ne « refait » rien — il se **branche** sur le même cerveau. C'est la fondation d'entreprise demandée : posée une fois, étendue ensuite, jamais réécrite.
