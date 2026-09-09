# A0 — Recon archives (`OtakuGO_UP-archives`)

> Produit le 2026-08-12 par un agent lecteur (read-only, passe moyenne) depuis la session MAOS
> « pipeline d'audit OtakuGO ». Fait partie de la baseline A0 de
> `docs/audits/2026-08-12-otakugo-audit-pipeline.md`. Rapport verbatim.

## 1. Structure

`/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP-archives`
**756 Ko · 8 fichiers utiles (+2 `.DS_Store`) · 3 répertoires · non versionné (aucun dépôt git)**

```
OtakuGO_UP-archives/
└── github-workflow-audit-2026-07-25/     <- seule archive existante
    ├── README.md                          3,3 Ko  (note de gel)
    ├── WORKFLOW_GITHUB_SPEC_V2.md       113 Ko    (1 298 l., 14 sections + annexe)
    ├── research/                          253 Ko  (3 papiers académiques en .txt)
    │   ├── baum_checklist.txt  115 Ko  ├── esem2012.txt  78 Ko  └── google_mcr.txt  60 Ko
    └── task-outputs/                      365 Ko  (3 sorties d'agents brutes, JSON)
        ├── wyvl6igtj.output 265 Ko ├── wqxouzcov.output 71 Ko └── wepsoxiup.output 29 Ko
```

## 2. Contenu archivé

**Une seule catégorie : une mission gelée volontairement**, pas un dépotoir historique.

| Type | Détail |
|---|---|
| Mission gelée | Audit workflow GitHub, conçu le 25/07/2026, gelé le 28/07/2026 |
| Spec supersédée | `WORKFLOW_GITHUB_SPEC_V2.md` — modèle `main` seule, incompatible avec le flux `test`→`dev`→`main` retenu par l'équipe dans `main` |
| Snapshots d'exécution | 3 `.output` JSON = traces brutes multi-agents (8, 22 et 24 agents), avec logs d'échec `CLAUDE_CODE_MAX_OUTPUT_TOKENS` |
| Corpus de recherche | 3 papiers (ESEM 2012 branches/qualité, Google Modern Code Review, checklist Baum/Wurzel) |

**Plage de dates : 28/07/2026 20:06 → 29/07/2026 17:35** (fenêtre de 21 h). Contenu produit en une salve le 28/07, README rédigé le 29/07. Aucune archive antérieure ni postérieure — le dossier n'a pas été réalimenté depuis.

**Duplication vérifiée : nulle.** Aucun des 7 fichiers de contenu n'existe dans `OtakuGO_UP` ni `OtakuGO_UP-cockpit` (recherche par nom sur spec, IDs de tâches, papiers). L'archive est référencée depuis `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP-cockpit/docs/missions/RETOURS-MELVYN.md` (et ses copies dans les worktrees).

## 3. Valeur unique — à lire avant un audit

1. **`.../github-workflow-audit-2026-07-25/README.md`** — la note de gel elle-même : arbitrage explicité, table des choix équipe (commits `77a307e`, `35e951f`, `c02b3bb`) contre la recommandation inverse de l'archive. Le seul endroit qui documente *pourquoi* la direction a été abandonnée.
2. **`README.md` §« Ce qui reste vrai »** — 3 constats sécurité mesurés, indépendants du modèle de branches : 5/5 collaborateurs `admin` (cause racine : `default_repository_permission = admin`, une commande corrige), 2FA org non exigée, protections de branche impossibles (403, privé + plan Free). Directement réutilisable en audit.
3. **`WORKFLOW_GITHUB_SPEC_V2.md` (l. 1-28)** — état GitHub mesuré en direct le 25/07/2026 avec commandes `gh` reproductibles : plan org `free`, dépôt `private`, rulesets 403, branch protection 403. Baseline datée pour mesurer une dérive.
4. **`WORKFLOW_GITHUB_SPEC_V2.md` §Annexe (l. 1278-1298)** — 10 points explicitement **non vérifiés** (scope `admin:org` manquant, checksum Supabase, plan Supabase Branching, facturation des jobs `if`-skippés, auto-approbation par GitHub App…) + 2 réserves méthodologiques sur ESEM 2012 et DORA. Rare : une spec qui liste ses propres trous.
5. **`task-outputs/wyvl6igtj.output`** — audit du modèle de branches, le plus riche : 3 commits orphelins sur `origin/test` (PR #51/#52/#53) absents de `main`, **migrations M046/M047 « Applied remotely » en production mais absentes de `main`**, collision de numérotation `Mxxx` annoncée comme garantie, `main` cassé (3 tests lisent un `ci.yml` supprimé par la PR #54), aucun run Actions abouti depuis le 22/07. À recouper : ces défauts ont-ils été corrigés depuis ?
6. **`task-outputs/wqxouzcov.output`** — spec alternative « Tronc unique, sas machine, deux étages de déploiement » (24 agents, jury) : direction de conception abandonnée, non commitée.
7. **`task-outputs/wepsoxiup.output`** — premier passage du même audit (22 agents, plusieurs recherches en échec) ; utile seulement pour comparer avec `wqxouzcov`, sinon redondant.
8. **`WORKFLOW_GITHUB_SPEC_V2.md` §8 Agents IA (l. 640-734) et §12 garanties/non-garanties (l. 981-1043)** — modèle de délégation aux agents et périmètre assumé, sans équivalent dans les dépôts vivants.

**Piste hors archive signalée par le README** : spec v4 (258 l.) commitée mais **non poussée** sur la branche locale `claude/branch-structure-data-0354f5` → `docs/specs/2026-07-22-git-workflow-design.md`. La ref existe bien : `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP/.git/refs/heads/claude/branch-structure-data-0354f5`. Fragile (perte si nettoyage local).

## 4. Signaux d'alerte

- **Aucun secret réel détecté.** Les correspondances dans `WORKFLOW_GITHUB_SPEC_V2.md` (l. 658, 721, 908, 1189) sont des *mentions documentaires* de nommage (`sb_secret_`, `service_role`) dans un runbook de rotation de clé — pas de valeur. Recherche haute entropie (`ghp_`, `github_pat_`, JWT `eyJ`, `sk-`, `AKIA`) : zéro résultat.
- **Donnée personnelle (faible) :** `task-outputs/wyvl6igtj.output` contient une adresse e-mail personnelle de contributeur (Gmail) issue de `git log`, avec SHA et attribution de commits. Non secret, mais donnée nominative dans un fichier non versionné.
- Les 6 autres e-mails sont ceux d'auteurs académiques dans `research/*.txt` (domaines `.uzh.ch`, `.uni-hannover.de`, `microsoft.com`, `google.com`, `cs.queensu.ca`) — publics.
- **Hygiène :** 2 `.DS_Store` (10 Ko chacun) ; dossier hors git donc **aucune sauvegarde ni historique** — un `rm` est définitif.
