# Backlog — Skill `intake-audit` (audit universel d'ajout)

**Quand** : fin Phase 4 / pendant Phase 4.5. **Valeur** : haute (gouvernance + anti-dérive + token). **Statut** : concept décidé, version manuelle posée ([`../workflows/intake-audit-template.md`](../workflows/intake-audit-template.md)), skill à construire quand les fondations existent. **Forme cible décidée** : **skill** réutilisable (pas une règle CLAUDE.md, pas d'abord un agent).

## L'idée

Une capacité permanente qui, pour **tout ajout** (ressource / skill / agent / MCP / idée / pattern mémoire / principe / inspiration UI), fait l'audit — l'étudier, le comprendre, décider si on l'utilise, comment se l'approprier, l'améliorer, le rendre moins cher sans perdre en perf, l'adapter au projet ou adapter le projet, estimer effort/gain — produit un **dossier d'intake**, puis **prépare ou lance la mise en place**.

C'est la généralisation + la persistance du master-prompt one-shot [`../workflows/phase3-resource-audit-master-prompt.md`](../workflows/phase3-resource-audit-master-prompt.md), qui était figé sur le lot Notion / Phase 3.

## Séparation nette (piège à éviter)

Deux choses distinctes, à ne **pas** bundler :

1. **Audit d'intake** = décider *si/comment*. → c'est le **skill** (méthode + scoring + dossier). Token-cheap, progressive disclosure.
2. **Mise en place** = implémenter l'item retenu. → réutilise le **mission lifecycle existant** (planner → dispatcher → reviewer → sec-reviewer). Rien à réinventer.

Le dossier produit par le skill alimente l'**Ideas Inbox** + le **Decision Log** de Phase 4.5, puis se convertit en mission.

## Pourquoi pas maintenant (Phase 3)

Le skill généralisé a besoin de briques pas encore là :

| Brique | Phase |
|--------|-------|
| skill-cache + summariser (L1/L2) | 3 (en cours) |
| routing multi-source / recherche | 3.5 |
| compat mémoire (5 registres, Memory Keeper) | 4 |
| Ideas Inbox + Decision Log + scoring déterministe (réceptacle) | 4.5 |

Construire le skill avant = payer des tokens pour du provisoire sans réceptacle. En attendant : **template manuel** lancé à la main à chaque ajout.

## Améliorations du concept (déjà encodées dans le template, à garder dans le skill)

- **KILL criteria** explicites = veto indépendant du score. Un audit qui ne sait pas dire `reject` est biaisé-à-tout-ajouter.
- **3 coûts** : install **+ maintenance + retrait**. La réversibilité est un critère.
- **Date de ré-audit / péremption** par item — les assets pourrissent (cf. bascule billing 15 juin 2026).
- **1 dossier/item + index** (`docs/intake/`), traçable et ré-ouvrable.
- Décision = **enum unique** (`implement_now|adapt_now|backlog_next|watch|reject`).
- Scoring 7 axes repris du master-prompt → comparable d'un audit à l'autre.

## Mapping MAS (quand on construira)

- **Skill** `.claude/skills/intake-audit/SKILL.md` — respecter CLAUDE.md §12 (lire `docs/knowledge/skills-reference.md`, `prompting-anthropic.md` ; corps = Principles + Process + Rationalizations + Red Flags + Verification Criteria ; summary L1 ≤200 tokens).
- **Sortie** : `docs/intake/<date>-<slug>.md` → Ideas Inbox (`ideas` table, Phase 4.5) + Decision Log (`decisions` table).
- **Agent Tier-A optionnel plus tard** : fin "Intake Auditor" qui lance le skill et orchestre l'audit multi-source. Le skill d'abord ; l'agent sans skill = coquille vide.
- **Sécu** : items exécutant du code → passe par `skill-install-policy.md` + Security Reviewer.

## Action

1. **Maintenant** : utiliser le template manuel pour tout ajout. Les PDFs Notion (`docs/resources/`) → lancer le master-prompt existant (mode expert) au jalon "traiter les modules d'apprentissage", pas avant.
2. **Phase 4.5** : construire le skill `intake-audit` + câbler la sortie sur Ideas Inbox / Decision Log. Candidat ADR si on ajoute l'agent Tier-A.
