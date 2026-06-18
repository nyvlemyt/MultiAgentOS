# ECC Harvest — décisions cluster `skill:core-agent` (lot B)

Doer: lot B (6 skills) — mode REPRISE (vague précédente coupée). Worktree `maos-ecc`.
Méthode: intake-audit barre LARGE (keep sauf dup-no-better / stub / unsafe). Source ECC: `affaan-m/ecc` (MIT).
Cible: `packages/skills/library/<slug>/SKILL.md`. Dedup contre `our-assets-index.md`
(24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Sanitize: 4 sources scannées → 0 secret/PII/PAYG.

---

## architecture-decision-records
- **décision**: adapt
- **raison**: capture des décisions d'archi en ADR Nygard sous `docs/decisions/` (le répertoire réservé par §3); le « pourquoi » + alternatives rejetées survivent au-delà du thread.
- **dedup**: non — `intake-audit` décide d'une *entrée* d'item externe et alimente les ADR; il ne les rédige pas. Aucun skill ADR dans la surface.
- **chemin library**: `packages/skills/library/architecture-decision-records/SKILL.md`
- **état**: déjà-boosté, vérifié conforme (7 sections §12, commentaire source `affaan-m/ecc`, summary L1, metadata complet, 0 `@anthropic-ai/sdk`). Pas de Prompt Defense Baseline — correct: skill d'authoring de doc, ne pilote pas un agent autonome.

## autonomous-loops
- **décision**: reject (dup-no-better / consolidé)
- **raison**: la source amont est un **alias de compatibilité DÉPRÉCIÉ** (« canonical name is now continuous-agent-loop »). Notre `continuous-agent-loop` déjà boosté replie explicitement tout le catalogue de patterns d'`autonomous-loops` (commentaire source le cite). Créer un 2e fichier dupliquerait un item que nous possédons déjà en mieux.
- **dedup**: oui — superset = `continuous-agent-loop` (même cluster, déjà en library).
- **chemin library**: aucun (non créé)
- **état**: neuf → rejeté. Le principe (spectre de boucles) est conservé dans `continuous-agent-loop`.

## claude-devfleet
- **décision**: reject (dup-no-better + machinery externe non-épinglée)
- **raison**: orchestration multi-agent (plan→dispatch→monitor→report en DAG, worktrees isolés, auto-merge). MAS possède DÉJÀ cette colonne vertébrale: planner + dispatcher + mécanisme multimission/worktree. DevFleet exige d'installer un serveur MCP tiers (`localhost:18801`, repo externe) — machinery non-épinglée vs le moteur SDK §11. Dup-no-better de notre propre dispatch.
- **dedup**: oui — équivalent au dispatcher MAS + multimission (`runDispatchTick`, concurrency budget) qui est égal-ou-meilleur et natif.
- **chemin library**: aucun (non créé)
- **état**: neuf → rejeté. Lens (orchestration DAG) déjà couvert par la spine MAS; aucun gain à importer un orchestrateur concurrent externe.

## continuous-agent-loop
- **décision**: adapt
- **raison**: couche de décision qui choisit la boucle autonome la moins chère (pipeline séquentiel → PR loop → génération parallèle spec-driven → DAG RFC + merge queue), mappée sur les niveaux d'autonomie §4 et budgets §6; exit dur obligatoire, reviewer ≠ auteur, de-sloppify par passe séparée.
- **dedup**: non — c'est LE skill canonique de boucles (absorbe `autonomous-loops`); aucun équivalent dans la surface `mas-*`.
- **chemin library**: `packages/skills/library/continuous-agent-loop/SKILL.md`
- **état**: déjà-boosté, vérifié conforme — **7 sections présentes** (Overview · When to Use/When NOT · Principles · Process [via Loop Pattern Spectrum + Decision flow] · Rationalizations · Red Flags · Verification Criteria) + Prompt Defense Baseline (pilote des boucles autonomes, correct) + section Maintainer-safe. La note « semble n'avoir que 6 sections » est levée: Overview EST présent, rien à ajouter. Commentaire source double (autonomous-loops body + continuous-agent-loop slug), summary L1, metadata, 0 `@anthropic-ai/sdk`.

## continuous-learning
- **décision**: reject (dup-no-better / superseded)
- **raison**: la source amont est explicitement **DÉPRÉCIÉE 2026-04-28** et déclare `continuous-learning-v2` comme strict superset (hooks PreToolUse/PostToolUse fiables à 100% vs Stop-hook v1, instincts atomiques vs full skills, project-scoped vs global-only). Importer v1 = importer un sous-ensemble obsolète.
- **dedup**: oui — superset = `continuous-learning-v2` (boosté dans ce lot).
- **chemin library**: aucun (non créé)
- **état**: neuf → rejeté au profit de v2.

## continuous-learning-v2
- **décision**: adapt
- **raison**: capture l'apprentissage de session en instincts atomiques (1 trigger → 1 action, confiance 0.3-0.9, domaine, evidence), observation déterministe par hooks, scope projet par défaut (anti-contamination cross-project), promotion globale méritée (2+ projets, conf ≥0.8). Aligné sur le second-brain runtime et la passerelle de persistance (§13).
- **dedup**: non — complémentaire de `mas-memory-keeper`: ce skill *capture/score/propose* (couche MemoryProposal), le Keeper seul *écrit* dans `data/memory/` (§8). Aucun extracteur d'instincts dans la surface.
- **chemin library**: `packages/skills/library/continuous-learning-v2/SKILL.md`
- **état**: neuf, boosté depuis zéro → 7 sections §12 complètes + Prompt Defense Baseline (pilote une capture autonome de session) + section Maintainer-safe (drop CLI/store homunculus externes, instincts→MemoryProposal, local-first §1, Keeper seul writer §8). Frontmatter `name/description/summary` + metadata (origin affaan-m/ecc · MIT · cluster skill:core-agent · tier T1 · status library). 1ère ligne body = commentaire source. 0 `@anthropic-ai/sdk`, 0 secret.

---

## Récap lot B

| slug | décision | état | chemin library |
|---|---|---|---|
| architecture-decision-records | adapt | déjà-boosté, conforme | `packages/skills/library/architecture-decision-records/SKILL.md` |
| autonomous-loops | reject (dup/consolidé) | neuf → rejeté | — |
| claude-devfleet | reject (dup + externe) | neuf → rejeté | — |
| continuous-agent-loop | adapt | déjà-boosté, conforme (7 sections) | `packages/skills/library/continuous-agent-loop/SKILL.md` |
| continuous-learning | reject (déprécié/superseded) | neuf → rejeté | — |
| continuous-learning-v2 | adapt | neuf, boosté §12 complet | `packages/skills/library/continuous-learning-v2/SKILL.md` |

Keepers (3): architecture-decision-records, continuous-agent-loop, continuous-learning-v2.
Rejets (3): autonomous-loops, claude-devfleet, continuous-learning.
