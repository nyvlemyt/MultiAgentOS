# Doctrine de Projet pour Agents IA

Sources : `docs/claude doc/vrai-memoire-agent-claude.md`, `docs/claude doc/Le Stack Doctrine.md`, `docs/claude doc/3 checks a faire avant d'upgrader ton modele IA.md`
Auteur : @le_gouverneur_ia

---

## Principe fondamental

> "La puissance est un multiplicateur. Elle multiplie ce qui est là. Pas ce qui manque."

Un modèle plus puissant branché sur un projet sans doctrine amplifie le chaos plus vite. La doctrine se pose **par-dessus** le framework agentique — elle gère le **produit** des sessions, pas le process.

---

## Les 5 registres `.claude/memory/`

Structure complète pour tout projet long-terme (code ou non-code) :

| Fichier | ID Format | Fréquence | Contenu |
|---------|-----------|-----------|---------|
| `decisions.md` | BDR-XXX | 1-2/semaine | Choix structurants + pourquoi |
| `learnings.md` | LRN-XXX | 1-3/semaine | Patterns observés qui changent la façon de faire |
| `blockers.md` | BLK-XXX | À chaque blocage >30 min | Friction + cause réelle + solution |
| `journal.md` | par date | Chaque session | 3-5 lignes factuelles obligatoires |
| `evals.md` | EVAL-XXX | Sur chaque output évalué | Output + méthode + anomalies + action |

### Format BDR-XXX (décision ADR) — 5-10 lignes max
```markdown
## BDR-XXX : [Titre court]
**Date** : YYYY-MM-DD
**Statut** : Active | Deprecated | Superseded by BDR-YYY
### Contexte (2 phrases)
### Décision (1 phrase)
### Alternatives considérées (2-3 puces avec pourquoi rejetées)
### Conséquences (2-3 puces)
```

### Règle d'or cross-référence
Utiliser `[[BDR-001]]`, `[[LRN-005]]` dans les fichiers → Obsidian crée les backlinks automatiquement. Claude Code lit les `[[XXX]]` comme du texte normal.

---

## Les 3 éléments de doctrine (Stack Doctrine)

Hiérarchie minimale à poser **par-dessus** tout framework agentique :

| # | Élément | Fichier | Ce que ça empêche |
|---|---------|---------|-------------------|
| 1 | Registre de décisions | `.claude/memory/decisions.md` | Réinventer les mêmes débats dans 3 mois |
| 2 | Agent auditeur | `.claude/agents/auditor.md` | Dérive invisible entre choix d'hier et aujourd'hui |
| 3 | Rituel close-out | `.claude/memory/learnings.md` + 3 questions | Perdre les patterns appris en cours de session |

### Agent auditeur (`.claude/agents/auditor.md`)

```yaml
---
name: auditor
description: Audit hebdomadaire de cohérence projet — à lancer le vendredi matin
tools: [Read, Grep, Glob, Bash]
---
```

Mission : 4 vérifications (DEC-XXX cohérence / LRN-XXX application / dérives / dette) + scan git log 7 jours + rapport VERT/JAUNE/ROUGE. **Ne modifie aucun fichier.**

Output sauvé dans `.claude/memory/audits/audit-YYYY-MM-DD.md`.

### Rituel de fermeture (5 min, fin de chaque session)
```
[ ] Décide : impact encore là dans 1 mois ? → BDR-XXX
[ ] Appris : change la façon de faire ? → LRN-XXX
[ ] Bloqué : > 30 min aujourd'hui ? → BLK-XXX
+ Journal : 3-5 lignes factuelles dans journal.md (obligatoire)
```
**Règle d'or** : répondre NON aux 3 premières est valide. Ce qui compte = le geste.

---

## Les 3 checks avant upgrade de modèle

À faire **avant** de passer sur un modèle plus puissant (Opus 4.8, Sonnet 5, etc.) :

### Check 1 : CLAUDE.md propre
- Taille cible : ≤200 lignes
- Règles SPÉCIFIQUES uniquement — "code proprement" ≠ règle valide
- Template de règle valide : "JAMAIS d'em-dash dans le contenu", "TOUJOURS dater en YYYY-MM-DD"
- Test : "un modèle peut l'appliquer sans interpréter ?"

**Structure recommandée CLAUDE.md** :
```
## WHY (1-2 phrases)
## WHAT (nature, stack, livrable, audience)
## HOW (organisation, outils, workflow)
## RÈGLES NON-NÉGOCIABLES (JAMAIS / TOUJOURS / MAX)
## ARCHITECTURE (décisions déjà tranchées)
## MÉMOIRE (pointeurs vers .claude/memory/)
```

### Check 2 : Décisions tracées
- `.claude/memory/decisions.md` existe avec BDR-XXX
- Format ADR court (5-10 lignes par décision)
- Test : "puis-je vérifier en 30 secondes si cette question est déjà tranchée ?"

### Check 3 : Registres actifs
- `learnings.md` + `blockers.md` avec au moins 1 entrée réelle
- `rituel.md` en place
- Test : "puis-je vérifier en 30 secondes si j'ai déjà essayé cette approche ?"

---

## Implications directes pour MultiAgentOS

### Phase 4 (Memory) — architecture enrichie
La mémoire par projet doit implémenter les 5 registres, pas un stockage plat :

```
data/memory/<projectId>/
├── decisions.md     # BDR-XXX — ADR format
├── learnings.md     # LRN-XXX
├── blockers.md      # BLK-XXX
├── journal.md       # entrée par session
├── evals.md         # EVAL-XXX
└── audits/          # rapport agent auditeur
    └── audit-YYYY-MM-DD.md
```

### Quality Controller = agent auditeur automatisé
Le Quality Controller de AGENTS.md **est** l'agent auditeur de cette doctrine, mais déclenché automatiquement :
- Vendredi matin → audit hebdo VERT/JAUNE/ROUGE
- Avant chaque merge en `autonomous` + `autopilot` → vérification cohérence BDR

### CLAUDE.md de chaque projet externe
Quand un projet est enregistré dans MultiAgentOS, vérifier et potentiellement initialiser son `.claude/memory/` selon les 5 registres. Cela renforce la qualité des context-packs du Context Manager.

### Gate "3 checks" avant hausse d'autonomie
Avant de passer un projet de `manual` → `assisted` → `autonomous` → `autopilot`, les 3 checks doivent passer. Encoder dans le cockpit comme condition de validation.

---

## Obsidian pour visualisation humaine

Ouvrir `.claude/memory/` comme vault Obsidian (sans rien modifier) donne :
- **Graph view** (`Cmd+G`) : carte des 5 registres + liens inter-BDR/LRN/BLK
- **Backlinks panel** : toutes les décisions qui référencent un learning donné
- **Canvas** : mapper les patterns émergents visuellement

→ Compatible avec MultiAgentOS : les fichiers restent dans `data/memory/<projectId>/`, Obsidian les lit en read-only.

---

## Project templates & autonomy floors (Phase 7)

Le wizard "New project" enregistre un projet à partir d'un **modèle** (`apps/web/lib/templates.ts`).
Chaque modèle porte des valeurs par défaut sensées — type, **plancher d'autonomie**, mode, modèle,
stack — plus une mémoire de départ (seed) et une politique d'agents/compétences.

| Modèle | Type DB | Plancher autonomie | Pourquoi |
|--------|---------|--------------------|----------|
| `manga-app` | `manga-app` | `assisted` | édits internes OK ; shell/git/sorties gardés |
| `bot` | `bot` | `assisted` | intégrations + envois sortants gardés |
| `business-website` | `business-website` | `manual` | site client : aucune écriture/déploiement sans clic |
| `personal-automation` | `automation` | `autopilot` | lots perso à faible risque (résumés, indexation) |

**Règle d'or — le plancher est un défaut, pas un override de §5.** Un plancher `autopilot` ne lève
**jamais** les portes de §5/§5-risk : toute tâche `risk: high | blocking` reste gatée et attend un
clic humain, quel que soit le plancher. Le plancher fixe seulement le point de départ de l'autonomie
du projet ; il peut être resserré (jamais élargi au-delà des gardes-fous) par projet/session.

**Mémoire seed → candidats uniquement (§8).** La mémoire de départ d'un modèle est insérée comme
lignes `memory_candidates` en statut `pending`, mappées sur les 5 registres (decisions/learnings/
blockers/journal/evals). Le **Memory Keeper** est le seul à promouvoir vers `data/memory/` ; le wizard
et l'API n'écrivent **jamais** le store directement.
