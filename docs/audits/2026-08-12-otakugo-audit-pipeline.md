# Audit OtakuGO — pipeline de prompts (filled-cycle)

- **Date** : 2026-08-12
- **Demande** : analyser le cockpit OtakuGO existant, comprendre le contexte et les dernières évolutions menées avec l'ancien compte Claude, en tirer ce que MAOS doit absorber, puis préparer les prochaines phases avec un vrai suivi.
- **Méthode** : pattern `filled-cycle` (cf. `docs/learning/2026-06-25-night/PLAN.md` §« Filled cycle prompts ») — un orchestrateur qui reprend depuis un fichier d'état, et par phase un **Doer** (critères d'acceptation binaires) + un **Checker** adversarial (verdict écrit dans un fichier). C'est aussi l'« habitude R33 » du cockpit OtakuGO lui-même (prompteur → exécutant → vérificateur) : les deux systèmes convergent.
- **Périmètre** : `/Users/melvyn/Documents/03_PROFESSIONNEL/{OtakuGO_UP, OtakuGO_UP-cockpit, OtakuGO_UP-archives}` — en **lecture seule absolue**.
- **État vivant** : `docs/audits/otakugo/STATE.md`. Livrables : `docs/audits/otakugo/A*.md`.

## 0. Principes non négociables (hérités de CLAUDE.md MAOS)

1. **Lecture seule sur OtakuGO** : aucun write, aucun git mutant (`checkout`, `fetch`, `pull`, `commit`, `push`, `stash` interdits — seuls `log`, `show`, `status`, `diff`, `branch -a`, `for-each-ref`, `worktree list` sont permis), aucun serveur lancé, aucune installation.
2. **Jamais de copie interne** : MAOS enregistre les projets par chemin absolu (CLAUDE.md §1). On copie des *constats* dans `docs/audits/otakugo/`, jamais du code produit.
3. **Secrets** : jamais collés dans un livrable. Donnée personnelle → signaler le chemin, ne pas citer la valeur.
4. **Réseau** : `gh` en lecture seulement et seulement s'il est déjà authentifié ; sinon marquer NON VÉRIFIABLE. Ne jamais tenter une authentification.
5. **Budget** : ~600k tokens pour la pipeline complète (A0 a coûté ~216k). Dépassement prévisible → pause + demander (TOKEN_STRATEGY.md).

## 1. Baseline A0 — FAIT le 2026-08-12

Trois lecteurs read-only ont cartographié les dossiers. Rapports complets : `docs/audits/otakugo/A0-recon/{cockpit,projet,archives}.md`. L'essentiel :

| Dossier | Nature | Faits structurants |
|---|---|---|
| `OtakuGO_UP` | Dépôt produit : app Flutter/Supabase « réseau social anime » + pipeline data AniList (lake 4,9 Go) | 2 lignées git (`main` app / `data/finalize-pipeline` data), ~60 branches, 17 worktrees, 47 migrations. Protocole missions **transposé de multiAgentOS** (`docs/missions/PROTOCOL.md:6`). Dernier travail : OP-33 (12/08, PASS, **18 commits non poussés**). Blocage actif : clé `anon` staging manquante. |
| `OtakuGO_UP-cockpit` | **Worktree du même dépôt** (branche `data/finalize-pipeline`) : cockpit documentaire (34 fiches OP, `_state/`, `_reports/`, `RETOURS-MELVYN.md` R1→R33) + cockpit web (Node natif + SPA vanilla, 246 tests) | Statut mission **calculé depuis les faits** (`truth.js` : board git + verdict rapport + merge), jamais tapé. Rapports à sections imposées, verdict binaire. `API.md` : « ce que Melvyn voit à l'écran, un agent le lit ici ». Vague H (OP-31→34) préparée le 10/08, non lancée. |
| `OtakuGO_UP-archives` | Une seule mission gelée (audit workflow GitHub, 25-29/07) | Note de gel = pourquoi la direction a été abandonnée. 3 constats sécurité « toujours vrais » (5/5 collaborateurs admin, 2FA org non exigée, protections de branche 403 en plan Free). Findings à recouper : migrations M046/M047 en prod absentes de `main`, `main` cassé, aucun run Actions depuis le 22/07. |

## 2. Architecture de la pipeline

```
A0 Baseline (FAIT) ──┬── A1 Chronologie & travaux en vol ──┐
                     ├── A2 Patterns cockpit → MAOS       ──┼── A4 Synthèse & plan de phases
                     └── A3 Santé & risques du projet     ──┘
```

- **A1, A2, A3 sont indépendantes** → lançables en parallèle (3 sous-agents Doer). Chaque Doer rendu → son Checker part aussitôt.
- **A4 ne démarre que si A1+A2+A3 sont PASS** (ou NEEDS_WORK corrigé).
- Chaque phase écrit son livrable dans `docs/audits/otakugo/`, le Checker écrit `A<N>-checker-verdict.md`, l'orchestrateur met à jour `STATE.md`.

## 3. Prompt orchestrateur (à coller dans une session fraîche, cwd = racine MAOS)

```text
Tu es l'orchestrateur de l'audit OtakuGO. Tu ne produis aucun contenu d'audit toi-même :
tu dispatches, tu vérifies les verdicts, tu tiens l'état.

1. Lis docs/audits/otakugo/STATE.md puis docs/audits/2026-08-12-otakugo-audit-pipeline.md
   (les prompts Doer/Checker de chaque phase y sont — utilise-les tels quels).
2. Reprends à la première phase non DONE. A1, A2, A3 sont indépendantes : dispatche les
   Doers restants EN PARALLÈLE (sous-agents). Dès qu'un Doer rend son livrable, dispatche
   son Checker sans attendre les autres.
3. Une phase est DONE uniquement quand : livrable écrit + verdict checker PASS. NEEDS_WORK
   → une seule passe de correction par le Doer, puis re-check. BLOCK → stop, note dans
   STATE.md, continue les autres phases.
4. A4 ne démarre que quand A1+A2+A3 sont DONE.
5. Après chaque verdict : mets à jour STATE.md (table + log daté + « prochaine action sur
   reprise »). Le statut d'une phase ne se déclare jamais sans pointer livrable + verdict.
6. Règles absolues pour tout sous-agent : dossiers OtakuGO en LECTURE SEULE (git lecture
   uniquement : log/show/status/diff/branch/for-each-ref/worktree list) ; écritures
   uniquement dans docs/audits/otakugo/ du repo MAOS ; aucun secret collé ; gh lecture
   seule si déjà authentifié sinon NON VÉRIFIABLE ; budget total ~600k tokens — si tu
   prévois de dépasser, pause et demande.
7. Contexte plein → écris une note de reprise dans STATE.md (§Reprise) et arrête-toi
   proprement. À la toute fin : rapport §14 (essentiel d'abord, plan des prochaines
   étapes, recommandation explicite) + dashboard de suivi.
```

## 4. Phase A1 — Chronologie & travaux en vol

- **Objectif** : reconstruire ce qui s'est passé (surtout les 8 dernières semaines) et cartographier tout le travail **en vol** (non poussé, non mergé, non traité) avant qu'il se perde.
- **Livrable** : `docs/audits/otakugo/A1-chronologie.md`.

### Prompt Doer A1

```text
Tu es un enquêteur git en lecture seule. Objectif : reconstruire l'histoire récente du
projet OtakuGO et inventorier le travail en vol. Pourquoi : ces évolutions ont été menées
avec un ancien compte Claude dont l'historique de sessions est perdu — seuls les fichiers
et le git font foi ; et du travail fragile (branches locales jamais poussées) risque de
disparaître à la première maladresse.

Contexte : lis d'abord docs/audits/otakugo/A0-recon/{projet,cockpit,archives}.md (baseline
du 2026-08-12). Dépôt : /Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP (2 lignées :
main = app, data/finalize-pipeline = data+cockpit ; ~60 branches ; 17 worktrees).

Process :
1. git log des 2 lignées + `git log --all --date-order --since="8 weeks ago" --oneline`
   + `git for-each-ref --sort=-committerdate refs/heads refs/remotes` ; `git worktree list`.
2. Pour chaque branche locale : ahead/behind de son origin (`git rev-list --left-right
   --count`) → liste des branches JAMAIS poussées ou en avance, avec contenu résumé.
   Cas déjà connus à confirmer : claude/op-33-fiche-oeuvre-recherche (18 commits locaux),
   claude/branch-structure-data-0354f5 (spec v4 non poussée).
3. Croise avec docs/missions/RETOURS-MELVYN.md (R1→R33), missions.json, _state/, _reports/
   et .claude/inbox/ pour raconter l'histoire PAR VAGUES (A→H) : dates, déclencheur, résultat.
4. Inventaire « en vol » : branches non poussées · commits ahead · PR drafts en attente ·
   inbox non traitée · fichiers modifiés non commités · worktrees actifs.

Contraintes : git en LECTURE SEULE STRICTE (log/show/status/diff/branch/for-each-ref/
rev-list/worktree list uniquement — jamais checkout/fetch/pull/stash). Aucune écriture hors
docs/audits/otakugo/. Aucun secret collé. gh lecture seule si déjà authentifié, sinon
marque NON VÉRIFIABLE.

Livrable docs/audits/otakugo/A1-chronologie.md, sections imposées :
# TL;DR (3 lignes max)
## Chronologie par vagues [table : période | vague | OP | fait marquant | preuve (sha ou path:line)]
## 10 jalons clés (du pivot SwapAnime→OtakuGO à aujourd'hui)
## Travaux en vol [table : objet | où (branche/worktree/inbox) | ahead de origin | contenu | risque de perte 1-5]
## Divergences constatées (ex. PR #91 « mergée » côté projet vs « draft » côté cockpit — trancher preuve à l'appui)
## NON VÉRIFIABLE (liste explicite + pourquoi)
Chaque affirmation datée porte une preuve (sha, path:line, ou sortie de commande citée).
```

### Critères d'acceptation A1 (binaires)

1. Chaque jalon/vague a une preuve vérifiable (sha ou path:line).
2. L'inventaire « en vol » croise les 4 sources (branches × worktrees × inbox × non-commité) — pas seulement les cas déjà connus.
3. La divergence PR #91 est tranchée (ou NON VÉRIFIABLE argumenté).
4. `git -C OtakuGO_UP status` avant/après identique (zéro mutation).
5. Section NON VÉRIFIABLE présente (même vide, avec justification).

### Prompt Checker A1

```text
Utilise le skill mas-reviewer. Vérifie docs/audits/otakugo/A1-chronologie.md contre ses
5 critères d'acceptation (section A1 de docs/audits/2026-08-12-otakugo-audit-pipeline.md).
Méthode adversariale : échantillonne ≥6 affirmations datées (dont ≥2 de « Travaux en
vol ») et RE-EXÉCUTE les commandes de preuve en lecture seule sur
/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP. Chaque affirmation testée reçoit
PROUVÉ / RÉFUTÉ / NON VÉRIFIABLE. Signale tout ce que tu trouves, même incertain ou mineur
— une passe de filtrage séparée s'en chargera ; ton but ici est la couverture.
Écris docs/audits/otakugo/A1-checker-verdict.md : verdict global PASS / NEEDS_WORK / BLOCK
+ table des findings (gravité, preuve, correction demandée).
```

## 5. Phase A2 — Patterns cockpit → MAOS

- **Objectif** : extraire du cockpit les patterns de travail qui ont fait leurs preuves, juger chacun contre ce que MAOS a déjà (verdict d'intake avec critères KILL), et produire des cartes backlog prêtes à valider.
- **Livrable** : `docs/audits/otakugo/A2-patterns-cockpit.md`.

### Prompt Doer A2

```text
Tu es architecte produit de MultiAgentOS et juge d'intake. Objectif : décider ce que MAOS
doit absorber du cockpit OtakuGO. Pourquoi : ce cockpit est la meilleure preuve d'usage
réel dont on dispose (34 missions pilotées, protocole transposé de MAOS puis ayant évolué
seul) — mais MAOS vise plus simple et plus intelligent : on porte des PATTERNS, jamais du
code, et on doit savoir dire non (critères KILL).

Contexte : lis d'abord docs/audits/otakugo/A0-recon/cockpit.md, puis les sources primaires
dans /Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP-cockpit/ (lecture seule) :
docs/missions/PROTOCOL.md · VERIFICATION.md · RETOURS-MELVYN.md · README.md (board) ·
missions.json · la fiche la plus aboutie OP-31-representant-de-carte.md · un _state/ et un
_reports/ récents · tools/anilist-pipeline/reference/{API.md, lib/truth.js} ·
docs/features/templates/FEATURE_TEMPLATE.md.
Côté MAOS : CLAUDE.md · PRODUCT_SPEC.md §5 (mission lifecycle) · packages/db/src/schema.ts
· docs/backlog/ (format des cartes) · docs/workflows/intake-audit-template.md (méthode).

Process :
1. Liste ≥12 patterns candidats. Attendus au minimum : statut calculé depuis les faits
   (truth.js) · registre des retours patron (RETOURS-MELVYN R1→R33) · trio fiche/état/
   rapport à sections imposées · verdict binaire + vérifications « commande + sortie
   collée » · pipeline 3 étages R33 · « Prompt à coller » par fiche · escalate_when par
   fiche · vagues + décisions D1→D9 · API.md agents-lisent-ce-que-l'humain-voit · rapport
   « Réveil » · écritures jamais auto-commitées (bandeau « à committer ») · registre des
   rationalisations excuse→réalité.
2. Pour CHAQUE pattern : (a) description 3 lignes ; (b) preuve d'usage (path cockpit) ;
   (c) équivalent MAOS actuel (path MAOS, ou « absent ») ; (d) verdict enum
   {adopter | adapter | déjà-couvert | rejeter} ; (e) critère KILL évalué honnêtement
   (qu'est-ce qui ferait rejeter ce pattern ? coût, doublon, complexité) ; (f) si
   adopter/adapter : quelle brique MAOS le porte (schéma DB, worker, UI, skill).
3. Pour chaque adopter/adapter : rédige une carte backlog (format docs/backlog/ : contexte,
   travail, critère de sortie binaire) — EN ANNEXE du livrable, pas en fichiers séparés
   (Melvyn valide d'abord).

Contraintes : lecture seule sur le cockpit ; aucune copie de code produit (citations
courtes ≤10 lignes pour preuve uniquement) ; écriture uniquement dans docs/audits/otakugo/.

Livrable docs/audits/otakugo/A2-patterns-cockpit.md :
# TL;DR · ## Table des patterns [pattern | preuve cockpit | équivalent MAOS | verdict |
carte] · ## Détail par pattern · ## Annexe : cartes backlog proposées · ## Rejets argumentés
```

### Critères d'acceptation A2 (binaires)

1. ≥12 patterns, chacun avec preuve cockpit (path) ET comparant MAOS (path ou « absent »).
2. Verdict enum sur chaque pattern + critère KILL évalué (pas de « tout est bon » : ≥1 `rejeter` ou `déjà-couvert` argumenté).
3. Chaque carte backlog proposée a un critère de sortie binaire.
4. Aucun bloc de code produit copié >10 lignes.

### Prompt Checker A2

```text
Utilise le skill mas-reviewer. Vérifie docs/audits/otakugo/A2-patterns-cockpit.md contre
ses 4 critères d'acceptation (section A2 de la pipeline). Méthode : (1) échantillonne ≥5
patterns et vérifie leurs preuves (le path cockpit existe et dit bien ça ; le comparant
MAOS existe et dit bien ça) ; (2) cherche les patterns MANQUANTS : relis PROTOCOL.md et
VERIFICATION.md en entier — tout mécanisme notable absent de la table est un finding ;
(3) teste la sincérité des verdicts : un « adopter » dont l'équivalent MAOS couvre déjà
90 % est un finding. Signale tout, même mineur — couverture d'abord. Écris
docs/audits/otakugo/A2-checker-verdict.md : PASS / NEEDS_WORK / BLOCK + findings.
```

## 6. Phase A3 — Santé & risques du projet

- **Objectif** : re-vérifier AUJOURD'HUI chaque risque connu (les constats d'archives datent du 25-29/07) et en chercher de nouveaux — pour savoir sur quoi les prochaines phases doivent marcher en premier.
- **Livrable** : `docs/audits/otakugo/A3-risques-projet.md`.

### Prompt Doer A3

```text
Tu es auditeur risques, en lecture seule. Objectif : établir l'état de santé réel du projet
OtakuGO au 2026-08-12. Pourquoi : les derniers constats datent de fin juillet (archives) ;
avant de piloter de nouvelles phases depuis MAOS, il faut savoir ce qui est encore cassé,
ce qui s'est aggravé, et ce qui n'est vérifiable que par Melvyn.

Contexte : lis d'abord docs/audits/otakugo/A0-recon/{archives,projet,cockpit}.md.
Dossiers : /Users/melvyn/Documents/03_PROFESSIONNEL/{OtakuGO_UP,OtakuGO_UP-cockpit,
OtakuGO_UP-archives} (lecture seule stricte, mêmes règles git que la pipeline §0).

Risques connus à RE-VÉRIFIER un par un (statut : toujours vrai | corrigé | aggravé |
NON VÉRIFIABLE, avec commande + sortie collée comme preuve) :
1. Migrations M046/M047 « appliquées en prod » mais absentes de main (source :
   archives task-outputs/wyvl6igtj.output) — vérifier supabase/migrations/ +
   MIGRATION_LOG.md sur main ET data/finalize-pipeline.
2. main cassé : 3 tests lisant un ci.yml supprimé par la PR #54 (même source).
3. Aucun run GitHub Actions abouti depuis le 22/07 (gh lecture seule si authentifié).
4. Nightly data morte depuis le 13/07 (TCC launchd) — cockpit « Actions Melvyn ».
5. Sécurité GitHub org : 5/5 collaborateurs admin (default_repository_permission=admin),
   2FA non exigée, protections de branche impossibles (403, plan Free).
6. 18 commits OP-33 jamais poussés (branche claude/op-33-fiche-oeuvre-recherche) +
   spec v4 non poussée (claude/branch-structure-data-0354f5) — risque de perte.
7. Clé anon staging manquante (config/staging.dart-defines.json, check_anon.sh du 12/08) ;
   vérifier qu'aucun SUPABASE_SERVICE_KEY ne traîne côté client.
8. Config Claude Code déversée à la racine du worktree cockpit le 09/08 (backups/, cache/,
   history.jsonl, projects/ avec transcripts, sessions/) — non trackée.
9. Divergence de statut PR #91 (mergée vs draft selon la source).
10. Dette de découpage : OP-33 ~7013 insertions vs règle git 7 « PR ≤400 lignes ».

Puis CHERCHE des risques nouveaux (couverture maximale : signale tout, même incertain ou
mineur — le Checker filtrera) : hygiène worktrees (17 !), fichiers non commités anciens,
migrations en collision (numérotation Mxxx), .env/exemples, tailles de fichiers vs hook
800 lignes, tests rouges éventuels dans les state files récents.

Contraintes : jamais de valeur de secret collée (nom de variable + fichier seulement) ;
donnée personnelle → chemin sans citation ; gh non authentifié → NON VÉRIFIABLE.

Livrable docs/audits/otakugo/A3-risques-projet.md :
# TL;DR · ## Registre [# | risque | statut au 12/08 | preuve (commande+sortie) | gravité
faible/moyenne/haute/bloquante | action recommandée | qui (Melvyn seul / agent avec gate)]
· ## Détail par risque · ## Risques nouveaux · ## NON VÉRIFIABLE
```

### Critères d'acceptation A3 (binaires)

1. Les 10 risques connus ont chacun un statut daté + preuve (commande + sortie collée) ou NON VÉRIFIABLE justifié.
2. ≥3 risques nouveaux cherchés activement (même si conclusion = rien trouvé, le dire).
3. Zéro valeur de secret dans le livrable (noms de variables/fichiers acceptés).
4. Chaque action recommandée précise « qui » (Melvyn seul vs agent avec gate).
5. Zéro mutation des dépôts OtakuGO.

### Prompt Checker A3

```text
Utilise le skill mas-reviewer. Vérifie docs/audits/otakugo/A3-risques-projet.md contre ses
5 critères d'acceptation (section A3 de la pipeline). Méthode adversariale : re-exécute
les commandes de preuve d'au moins 5 risques (dont M046/M047 et les branches non
poussées) et compare les sorties ; verdict par risque testé PROUVÉ / RÉFUTÉ / NON
VÉRIFIABLE. Scanne le livrable pour toute fuite de secret (patterns : eyJ, sb_secret_,
ghp_, github_pat_, sk-, AKIA — présence = BLOCK immédiat). Signale tout, même mineur.
Écris docs/audits/otakugo/A3-checker-verdict.md : PASS / NEEDS_WORK / BLOCK + findings.
```

## 7. Phase A4 — Synthèse & plan de phases

- **Objectif** : croiser A1+A2+A3 pour livrer l'état en une page, le plan des prochaines phases OtakuGO **pilotées depuis MAOS**, et le registre des décisions qui n'appartiennent qu'à Melvyn.
- **Livrable** : `docs/audits/otakugo/A4-synthese-plan.md`.

### Prompt Doer A4

```text
Tu es le chef d'orchestre MAOS. Objectif : transformer l'audit OtakuGO en plan d'action.
Pourquoi : c'est le but final de la demande — « préparer la suite des phases de la
meilleure des manières possibles, avec un vrai suivi ».

Entrées : docs/audits/otakugo/A1-chronologie.md, A2-patterns-cockpit.md,
A3-risques-projet.md + leurs verdicts checker + A0-recon/. Côté MAOS : CLAUDE.md §4-5
(autonomie, actions risquées), PRODUCT_SPEC.md §5, ROADMAP.md (phase courante).

Process :
1. État OtakuGO en 1 page (où en est le produit, où en est la data, ce qui bloque).
2. Plan de phases piloté depuis MAOS, dans l'ordre : (a) sécurisation immédiate (risques
   bloquants/hauts de A3 : sauvegarde des branches non poussées, décisions sécurité org) ;
   (b) reprise de la vague H (OP-33 review+PR, OP-31/32/34) ; (c) vagues suivantes depuis
   le backlog cockpit (OP-15/19/20/21/26, bloquées OP-07/08/09/23). Chaque phase : objectif,
   pré-requis, critère de sortie BINAIRE, gates humaines (toute écriture vers OtakuGO =
   gated, CLAUDE.md §5).
3. Registre des décisions Melvyn : D1→D9 hérités du cockpit + décisions nouvelles issues
   de l'audit — chacune avec options a/b/c, conséquence, et TA recommandation explicite.
4. Proposition d'enregistrement d'OtakuGO comme projet MAOS : path, niveau d'autonomie
   initial (recommande manual ou assisted), budget tokens, catégories risquées à déclarer
   dans config/permissions.json.

Contrainte : aucun engagement d'écriture vers les dossiers OtakuGO — le plan les prévoit
TOUJOURS derrière une gate humaine.

Livrable docs/audits/otakugo/A4-synthese-plan.md :
# TL;DR · ## État en 1 page · ## Plan de phases [phase | objectif | pré-requis | sortie
binaire | gates] · ## Décisions à trancher par Melvyn [décision | options | reco] ·
## Enregistrement MAOS proposé · ## Prochaine étape recommandée (une seule, explicite)
```

### Critères d'acceptation A4 (binaires)

1. Toutes les phases du plan ont un critère de sortie binaire et leurs gates explicites.
2. Toutes les décisions ouvertes (D1→D9 + nouvelles trouvées en A1-A3) sont consolidées, chacune avec recommandation.
3. Aucune action d'écriture vers OtakuGO sans gate humaine dans le plan.
4. Le document se termine par UNE prochaine étape recommandée, explicite.

### Prompt Checker A4

```text
Utilise le skill mas-reviewer. Vérifie docs/audits/otakugo/A4-synthese-plan.md contre ses
4 critères d'acceptation (section A4 de la pipeline). Méthode : (1) traçabilité — chaque
risque haut/bloquant de A3 et chaque « travail en vol » à risque de perte ≥4 de A1 doit
être adressé quelque part dans le plan (sinon finding) ; (2) chaque carte « adopter/
adapter » de A2 apparaît soit dans le plan soit dans une décision (sinon finding) ;
(3) chasse les critères de sortie non binaires (« améliorer », « avancer » = finding).
Écris docs/audits/otakugo/A4-checker-verdict.md : PASS / NEEDS_WORK / BLOCK + findings.
```

## 8. Décisions à trancher par Melvyn (avant ou pendant la pipeline)

| # | Décision | Options | Recommandation |
|---|---|---|---|
| P1 | Lancer la pipeline | (a) maintenant, session fraîche avec le prompt orchestrateur §3 · (b) après ta relecture de ce document | **(a)** — A1/A2/A3 sont en lecture seule, risque nul ; ta relecture peut se faire en parallèle |
| P2 | Branches jamais poussées (18 commits OP-33, spec v4) | (a) tu pousses depuis ton poste/compte · (b) sauvegarde locale `git bundle` en attendant · (c) rien | **(b) immédiatement puis (a)** — c'est le seul travail non répliqué ; un nettoyage local le détruirait |
| P3 | Config Claude Code déversée à la racine du cockpit (transcripts inclus) | (a) déplacer/supprimer toi-même · (b) laisser | **(a)** — action destructive donc à toi (jamais un agent, CLAUDE.md §5) |
| P4 | Où vivent les livrables d'audit | (a) repo MAOS `docs/audits/otakugo/` (fait) · (b) dans OtakuGO | **(a)** — MAOS est le centre de commandement ; OtakuGO reste non touché |

## 9. Coût estimé

A0 (fait) ≈ 216k tokens sous-agents. Estimation restante : A1 ≈ 120k · A2 ≈ 130k · A3 ≈ 120k · A4 ≈ 60k · checkers ≈ 4×40k → **total ≈ 590k**. Gate budget : dépassement prévisible → pause + demander.
