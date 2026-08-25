# A3 — Santé & risques du projet OtakuGO (état au 2026-08-13)

> Produit le 2026-08-13 par le Doer A3 (auditeur risques, lecture seule stricte) — pipeline
> `docs/audits/2026-08-12-otakugo-audit-pipeline.md` §6. Dossiers audités :
> `/Users/melvyn/Documents/03_PROFESSIONNEL/{OtakuGO_UP, OtakuGO_UP-cockpit, OtakuGO_UP-archives}`.
> `gh` était déjà authentifié (lecture seule) → les points GitHub ont pu être re-mesurés en direct.
> Zéro mutation prouvée : `git status --porcelain` et HEAD identiques avant/après audit sur les
> deux worktrees (diff = vide, HEADs `31603a2` / `b5c16fb` inchangés).

# TL;DR

Le projet va **mieux que ne le disaient les archives de fin juillet** : 4 des 10 risques connus sont corrigés (migrations M046/M047 revenues sur `main`, `main` réparé et CI verte, runs Actions réguliers jusqu'au 12/08, clé anon staging posée le 12/08) et la divergence PR #91 est tranchée (**mergée** le 09/08). En revanche **la sécurité GitHub org est inchangée** (5/5 admin, 2FA non exigée, protections impossibles), **le travail jamais poussé est plus étendu qu'annoncé** (41 branches avec ≥1 commit non poussé, dont 15 avec ≥8 — le bundle complet du 13/08 11:37 les couvre toutes **localement**, mais rien n'est poussé), et l'audit révèle **2 risques nouveaux sérieux** : un runner GitHub Actions self-hosted **online sur le Mac de Melvyn** (toute la CI y passe), et la **collision de numérotation confirmée de 10 migrations** entre les deux lignées. La passe de correction post-checker (13/08) ajoute 2 constats : les commits orphelins des PR #51/#52/#53 sont **sans perte de contenu** (tout est dans `main` via la promotion #58, seuls les sha de merge sont orphelins — N13), et **4 fichiers non commités** dorment dans le checkout principal, dont une retouche `color_extractor` + son test répliqués nulle part (N14).

## Registre

| # | Risque (constat fin juillet) | Statut au 13/08 | Preuve (commande → sortie, détail en §Détail) | Gravité | Action recommandée | Qui |
|---|---|---|---|---|---|---|
| 1 | Migrations M046/M047 « appliquées en prod » mais absentes de `main` | **corrigé** | `git show main:supabase/migrations` → `20260723120000_m046_…` + `20260723234000_m047_…` présents ; `MIGRATION_LOG.md` main l.86-87 = « Applied remotely » | faible (résiduel) | Rien à faire sur ce point ; l'état réel côté Supabase prod reste déclaratif (cf. NON VÉRIFIABLE) | — |
| 2 | `main` cassé : 3 tests lisant un `ci.yml` supprimé (PR #54) | **corrigé** (25/07, PR #58) | `git grep "ci.yml" main -- test/` → 0 occurrence ; les 3 tests lisent `checks.yml` qui existe ; run CI `schedule` sur main = `success` le 10/08 | faible | Rien à faire | — |
| 3 | Aucun run GitHub Actions abouti depuis le 22/07 | **corrigé / obsolète** | `gh run list` → `success` les 09, 10 et 12/08 (dont `Checks / main / schedule` 10/08) | faible | Rien à faire | — |
| 4 | Nightly data morte depuis le 13/07 (TCC launchd) | **toujours vrai (automatisation), atténué (runs manuels)** | `launchctl list` → `- 78 com.otakugo.nightly` (chargé, en échec) ; journaux manuels 03, 04, 06/08 ; dernière donnée : 06/08 14:12 (7 j d'ancienneté) | moyenne | Fix TCC 2 min (Réglages Système → Accès complet au disque → `/bin/bash`, cf. README cockpit §Actions Melvyn) ; définir `NIGHTLY_TRANSLATE_CMD` (60 synopsis en attente) | **Melvyn seul** (réglage système + env local) |
| 5 | Org GitHub : 5/5 collaborateurs admin, 2FA non exigée, protections 403 (plan Free) | **toujours vrai — re-mesuré au 13/08** | `gh api orgs/Reseau-Social-Anime` → `default_repository_permission:"admin"`, `two_factor_requirement_enabled:false`, plan `free` ; 5/5 `role_name:"admin"` ; branch protection → HTTP 403 | **haute** (aggravée par le risque nouveau N1) | Exiger la 2FA org ; passer `default_repository_permission` à `write` (1 commande) ; trancher Pro/public pour les protections | **Melvyn seul** (admin org) |
| 6 | Branches jamais poussées : `claude/op-33-…` (24 commits) + `claude/branch-structure-data-0354f5` (3 commits) | **toujours vrai, périmètre AGGRAVÉ** (41 branches ≥1 commit non poussé, dont 15 ≥8 ; mitigation locale complète depuis le 13/08 11:37) | `git rev-list --count <br> --not --remotes` → 24 et 3 ; 2 bundles vérifiés (`git bundle list-heads`) : 11:17 = 2 refs, 11:37 = **86 refs** ; balayage → op-31=33, op-20=29, data/OP-01=25… | **haute** (perte de travail) | Pousser vague H + spec v4 ; maintenir le bundle après chaque commit local ; copier les bundles hors disque | push + copie hors disque = **Melvyn seul** ; maintenance bundle = agent **avec gate** |
| 7 | Clé anon staging manquante (`config/staging.dart-defines.json`) ; vérifier qu'aucun `SUPABASE_SERVICE_KEY` côté client | **corrigé sur disque (12/08 11:20)** — fonctionnement runtime à confirmer | Clé `SUPABASE_ANON_KEY` renseignée, classe `sb_publishable_` (clé publique), URL = projet staging ; `git grep SUPABASE_SERVICE_KEY main -- lib/` → 0 ; `.env` non tracké et ignoré (`.gitignore:42`) | faible | Exécuter `./check_anon.sh` (30 s, attend `HTTP 200`) pour valider le runtime | **Melvyn seul** (appel réseau) |
| 8 | Config Claude Code déversée à la racine du worktree cockpit (09/08) | **toujours vrai, inchangé** (rien ajouté depuis le 09/08 18:07-18:08) | `git status` cockpit → `?? backups/ cache/ history.jsonl policy-limits.json projects/ remote-settings.json` ; 2 transcripts `.jsonl` dans `projects/` ; **non ignorés** par .gitignore | moyenne | Déplacer/supprimer les 8 éléments (P3 de la pipeline) ; en attendant, ne jamais faire `git add -A` dans le cockpit | **Melvyn seul** (action destructive) |
| 9 | Divergence PR #91 : « mergée » vs « draft » | **tranché : MERGÉE le 09/08 19:26 UTC** ; le board cockpit reste désynchronisé | `gh pr view 91` → `"state":"MERGED","mergedAt":"2026-08-09T19:26:46Z"`, mergeCommit `6981460` = tip de `main` ; board + missions.json committés 3 h APRÈS la merge disent encore « draft » | faible (le stale board = risque nouveau N3) | Rafraîchir board/missions.json cockpit (« désynchronisé » assumé par truth.js sinon) | agent **avec gate** (écriture vers OtakuGO) |
| 10 | Dette de découpage : OP-33 ~7 013 insertions vs règle git 7 « PR ≤ 400 lignes » | **toujours vrai, légèrement aggravé** (8 299 insertions au 12/08) | `git diff --shortstat main..claude/op-33-…` (base réelle = `6981460`) → `49 files changed, 8299 insertions(+)` dont 4 661 hors docs ; règle : `CLAUDE.md:102` | moyenne | Décider : découpage en lots ≤ 400 ou label `size:exempt` assumé (précédent : PR #91) ; puis exécuter | décision **Melvyn** ; découpage par agent **avec gate** |

## Détail par risque

### R1 — Migrations M046/M047 : corrigé

Constat de juillet (`OtakuGO_UP-archives/github-workflow-audit-2026-07-25/task-outputs/wyvl6igtj.output`) : M046/M047 « Applied remotely » en prod mais absentes de `main`.

```
$ git show main:supabase/migrations | grep -iE "m04[5-9]"
20260720210000_m045_lock_post_interactions.sql
20260723120000_m046_notification_pagination.sql
20260723234000_m047_atomic_report_quota.sql
20260724130000_m048_cursor_paginated_comments_progress.sql
```

`git show main:supabase/MIGRATION_LOG.md | grep -n "M046\|M047"` → lignes 86-87 : les deux entrées documentent « Applied remotely », déploiement les 23-24/07 « via un jeu de migrations isolé, sans appliquer M035-M044 réservées au staging ». Les fichiers sont donc revenus sur `main` avec leur log. Sur `data/finalize-pipeline`, MIGRATION_LOG ne mentionne pas M046/M047 (normal : lignées séparées — mais voir risque nouveau N2 sur la numérotation). `main` compte 47 migrations, la lignée data 36.

### R2 — `main` cassé (tests → ci.yml) : corrigé le 25/07

```
$ git show main:.github/workflows          →  checks.yml, discord_notifications.yml   (ci.yml absent)
$ git grep -n "ci.yml" main -- test/ tool/ →  AUCUNE occurrence
$ git grep -n "checks.yml" main -- test/
test/unit/edge_function_contracts_test.dart:58:       read('.github/workflows/checks.yml')
test/unit/environment_build_contract_test.dart:105:   File('.github/workflows/checks.yml')…
test/unit/supabase_integration_gate_contract_test.dart:46: File('.github/workflows/checks.yml')…
```

Les 3 tests de contrat pointent désormais `checks.yml`, présent sur `main`. Dernier commit les touchant : `c02b3bb 2026-07-25 17:20 "Promotion test → main : DEV-73, DEV-80, DEV-70 et DEV-47 (#58)"` — la réparation a donc suivi de peu l'audit de juillet. Preuve dynamique : le run planifié `Checks / main / schedule` du **10/08 06:07 = success** (via `gh run list`). `docs/features/qa.md:131` (main) documente le changement (« deleted legacy ci.yml is no longer treated as active »).

### R3 — Runs GitHub Actions : corrigé / obsolète

`gh run list -R Reseau-Social-Anime/OtakuGO_UP --limit 20` (13/08) — extraits :

```
2026-08-12T15:10:08Z  success  Checks  feature/DEV-74-remove-audio                pull_request
2026-08-12T12:51:34Z  success  Checks  feature/DEV-76-lot3-auth-signin-signout    pull_request
2026-08-12T08:36:11Z  failure  Checks  feature/DEV-76-lot1-…                      pull_request
2026-08-12T08:49:02Z  success  Checks  feature/DEV-76-lot1-…                      pull_request
2026-08-10T06:07:52Z  success  Checks  main                                       schedule
2026-08-09T19:26:49Z  success  Discord PR Notifications  feature/DEV-83-brancher-catalogue
```

La CI vit : runs verts les 09, 10 et 12/08 (le seul `failure` du 12/08 08:36 est re-passé vert 13 min après). Constat annexe important : **l'équipe humaine est active** (DEV-74 remove-audio, DEV-76 lots 1-3, DEV-68, DEV-55 — le 12/08), pendant que la vague H locale n'est pas poussée → risque de conflits, cf. N9.

### R4 — Nightly data : toujours vrai (automatisation morte), atténué (runs manuels)

```
$ launchctl list | grep -iE "otaku|anilist|nightly"
4101  0   actions.runner.Reseau-Social-Anime-OtakuGO_UP.MacMelvyn
-     78  com.otakugo.nightly
$ ls ~/Library/LaunchAgents/ | grep -i otakugo
com.otakugo.nightly.plist        (13 juil. 17:05)
```

Le job launchd est chargé mais **en échec** (pas de PID, dernier code de sortie 78 ; le README cockpit documentait « Operation not permitted, exit 126 » — même famille : blocage TCC). La consigne de fix est écrite noir sur blanc dans `OtakuGO_UP-cockpit/docs/missions/README.md` §« Actions Melvyn » (l.131-137) : Full Disk Access pour `/bin/bash`, « À retirer une fois la pipeline sortie du Mac ».

Atténuation mesurée : des **runs manuels** ont eu lieu — journaux `data/anilist/raw/_ops/journal-2026-{07-18,07-20,07-24,08-03,08-04,08-06}.md`. Dernier : **06/08 14:12** (généré par `nightly.sh`), soit 7 jours d'ancienneté au 13/08. Le lake n'est donc pas figé au 13/07, mais rien d'automatique ne tourne. Dans ce dernier journal : étape traduction FR **sautée** (`NIGHTLY_TRANSLATE_CMD` non définie, 60 synopsis en attente) — cf. N8.

### R5 — Sécurité GitHub org : toujours vrai, re-mesuré aujourd'hui

```
$ gh api orgs/Reseau-Social-Anime --jq '{default_repository_permission, two_factor_requirement_enabled, plan_name: .plan.name}'
{"default_repository_permission":"admin","plan_name":"free","two_factor_requirement_enabled":false}
$ gh api repos/Reseau-Social-Anime/OtakuGO_UP/collaborators --jq '[.[] | {login, role_name}]'
[oumaimaekdo, nyvlemyt, SKGE93, Zideee, DiarraKonte]  → 5/5 role_name = "admin"
$ gh api repos/Reseau-Social-Anime/OtakuGO_UP/branches/main/protection
HTTP 403 — "Upgrade to GitHub Pro or make this repository public to enable this feature."
```

Les 3 constats des archives (25/07) sont **inchangés au 13/08**. La cause racine (`default_repository_permission=admin`) se corrige par une commande d'admin org. Gravité relevée à haute parce que le risque nouveau N1 (runner self-hosted sur le Mac) transforme « compte collaborateur compromis » en « exécution de code sur le poste de Melvyn ».

### R6 — Branches jamais poussées : confirmé, et le périmètre réel est bien plus large

```
$ git rev-list --count claude/op-33-fiche-oeuvre-recherche --not --remotes   → 24
$ git rev-list --count claude/branch-structure-data-0354f5 --not --remotes  → 3
$ git log -1 claude/op-33-fiche-oeuvre-recherche → ad798be 2026-08-12 14:48 "docs(op-33): rendu réel sur appareil…"
```

Le state file (`.claude/worktrees/op-33-…/docs/missions/_state/OP-33.md`) disait « 18 commits jamais poussée » au 10/08 → **6 commits de plus** les 11-12/08. Mission OP-33 : TERMINÉE, verdict PASS, 439 tests verts, en attente de review Melvyn — tout ce travail n'existe que sur ce disque.

**Mitigation vérifiée — complétée le 13/08 à 11:37 (amendé en passe de correction, Checker F1)** : DEUX bundles existent dans `OtakuGO_UP-archives/git-bundles-2026-08-12/` :

- `otakugo-branches-non-poussees.bundle` (13/08 11:17, 148 691 983 octets) — 2 refs, tips à jour : op-33 (`ad798be`) + spec v4 (`20eb94b`) — vérifié par ce Doer (`git bundle list-heads`) ;
- `otakugo-toutes-branches-locales.bundle` (13/08 **11:37**, 162 209 165 octets) — **86 refs**, incluant `op-30`, `op-31` (×2), `op-32`, `op-33` (tip `ad798be`) et `branch-structure-data-0354f5` — vérifié par le Checker A3 (`git bundle list-heads`, 13/08).

L'action « étendre le bundle » est donc **déjà FAITE**. Restent : (a) **pousser** les branches — le bundle n'est qu'un filet local ; (b) **maintenir** le bundle après chaque nouveau commit local ; (c) réserve (Checker F8) : les bundles vivent dans `OtakuGO_UP-archives`, dossier **non versionné, sans sauvegarde, sur le même disque** que le dépôt (A0 archives §4 : « un rm est définitif ») — une copie hors disque est à prévoir (**Melvyn seul**).

**Aggravation** : le balayage complet (`git rev-list --count <branche> --not --remotes` sur les 86 branches locales) montre que le problème ne se limite pas à 2 branches :

```
33  claude/op-31-representant-carte-71900a    (vague H, non mergée)
29  data/OP-20-lisibilite-oeuvre-univers      29  claude/op-20-…-90bc9a
25  data/OP-01-orchestration-hors-mac         25  claude/reco-page-implementation
24  data/OP-05-contrat-app-catalogue          24  claude/op-33-… (ci-dessus)
23  data/OP-04-manga-etat-reel                22  data/OP-11-hygiene-docs
17  data/OP-10-qualite-continue               12  data/OP-16-media-360
12  claude/op-32-eres-narratives-f4a8e6       11  feature/DEV-83-brancher-catalogue
10  claude/op-30-attribution-listings          8  data/OP-25-atelier-de-regles
```

Nuance honnête : pour les branches déjà **squash-mergées** (ex. `feature/DEV-83` → PR #91, plusieurs `data/OP-XX` livrées), le *contenu* est répliqué sur GitHub même si les *commits* ne le sont pas — perte faible. Le travail réellement **unique et non répliqué sur le remote** = la **vague H** (`op-31` 33 commits, `op-32` 12, `op-30` 10, `op-33` 24) + spec v4 — depuis le 13/08 11:37, le bundle 2 (86 refs) les couvre **tous en local** (op-30, op-31 ×2, op-32, op-33, spec v4). Restent sans filet : les **contenus non commités** (worktrees N4, checkout principal N14) et les commits hors de toute branche (N13 — contenu déjà dans `main`), que le bundle — fait de refs de branches — ne peut pas couvrir ; et la **copie hors disque** des bundles (réserve F8 ci-dessus).

### R7 — Clé anon staging : corrigée sur disque le 12/08 ; aucun service key côté client

`config/staging.dart-defines.json` (mtime 12/08 11:20, non tracké) inspecté **sans afficher aucune valeur** (clés + longueurs + classe de préfixe uniquement) :

```
APP_ENV len=7 · SUPABASE_URL len=40 (contient l'id du projet staging pxgnchlqkrgrjabxxufj)
SUPABASE_ANON_KEY len=46 — préfixe « sb_publishable » (clé publique) : OUI ·
  préfixe « sb_secret » (clé secrète, interdite côté client) : NON · forme JWT : NON
GOOGLE_WEB_CLIENT_ID len=41
```

La clé posée est bien de la **classe publique** (`sb_publishable_`, faite pour le client) — pas une clé secrète. Le blocage du 12/08 (champ vide) est donc levé côté fichier ; seul le test réseau (`./check_anon.sh`, script de 6 lignes qui attend `HTTP 200`) reste à faire — non exécuté par cet audit (appel réseau sortant), cf. NON VÉRIFIABLE.

Côté fuite service key :
- `git grep -l "SUPABASE_SERVICE_KEY" main -- lib/` → **0** ; `git grep -l "service_role" main -- lib/` → **0**.
- Les 15 fichiers trackés qui mentionnent `SUPABASE_SERVICE_KEY` sont des docs + scripts Node **côté serveur** (`scripts/*.js`, `tools/anilist-pipeline/ops/*.md`) qui lisent la variable d'environnement — nom de variable seulement, aucune valeur committée.
- `.env` (disque, 21/07) : non tracké (`git ls-files` → 0 fichier `.env*`), couvert par `.gitignore:42` (`.env*`). Il porte un `SUPABASE_SERVICE_KEY` (nom relevé par A0) : usage serveur local uniquement — fichier volontairement **non lu** par cet audit.

### R8 — Config Claude Code à la racine du cockpit : toujours vrai, inchangé

```
$ git -C OtakuGO_UP-cockpit status --porcelain
?? backups/  ?? cache/  ?? history.jsonl  ?? policy-limits.json  ?? projects/  ?? remote-settings.json
$ ls -lad backups cache history.jsonl policy-limits.json projects sessions remote-settings.json
→ tous datés 9 août 18:07-18:08 · volumes : cache 484K, backups 168K, projects 20K (2 transcripts .jsonl)
```

Rien n'a été ajouté depuis le 09/08 (pas d'aggravation), mais rien n'a été nettoyé non plus. Danger concret : ces fichiers ne sont **pas dans .gitignore** (ils apparaissent en `??`) — un `git add -A` dans le cockpit committerait `history.jsonl` et les transcripts de sessions (données personnelles, prompts, chemins) dans un repo partagé par 5 comptes. `sessions/` existe sur disque mais est vide (invisible pour git). Décision P3 de la pipeline : déplacement/suppression = action destructive → **Melvyn seul** (CLAUDE.md MAOS §5).

### R9 — PR #91 : tranchée, MERGÉE ; les sources « draft » sont datées ou périmées

```
$ gh pr view 91 --json state,isDraft,mergedAt,mergeCommit
{"isDraft":false,"mergeCommit":{"oid":"698146070c1ede9be9dbb9bdd85c4cc412a780ef"},
 "mergedAt":"2026-08-09T19:26:46Z","number":91,"state":"MERGED", …}
$ git log -1 --format="%h %ci %s" main
6981460 2026-08-09 21:26:46 +0200 feat(catalog): brancher l'app sur le catalogue, débrancher AniList direct (OP-06) (#91)
```

`main` == `origin/main` == le commit de merge. Chronologie de la divergence :
- 31/07 21:59 — `33e6f8c docs(missions): OP-06 clôture — PR #91 draft ouverte` (vrai à cette date) ;
- 09/08 21:26 (19:26 UTC) — merge effective ;
- 10/08 00:29 — `b5c16fb` (tip cockpit) committe board + missions.json disant **encore** « livrée — PR #91 draft…, review en attente » (`docs/missions/README.md:77`, `missions.json` OP-06) — **3 h après la merge**.

Verdict : mergée. Le résidu est un problème de fraîcheur du board (cf. N3).

### R10 — OP-33 vs règle « PR ≤ 400 lignes » : toujours vrai, légèrement aggravé

Base réelle de la branche = `main` (`git merge-base main claude/op-33-…` → `6981460`, confirmé par le state file « base main 6981460 ») :

```
$ git diff --shortstat 6981460..claude/op-33-fiche-oeuvre-recherche
 49 files changed, 8299 insertions(+), 45 deletions(-)
   ventilation : docs 3634 · test 2884 · lib 1777 · racine 4
   hors docs (lib/ test/ supabase/ tool/) : 36 fichiers, 4661 insertions
```

La fiche parlait de ~7 013 insertions → 8 299 au 12/08 (les 6 commits des 11-12/08). La règle est `CLAUDE.md:102` (main) : « ≤ 400 lignes de diff par PR (hors pubspec.lock, types générés, snapshots…) ». Même en ne comptant que le code (4 661), on est à ~12× la règle. Précédent utilisable : la PR #91 portait le label `size:exempt` (state OP-06, tâche 9). C'est une **décision produit** (découper vs exempter), pas un simple geste technique.

## Risques nouveaux

Recherche active menée sur : runners/launchd, numérotation des migrations, hygiène worktrees, fichiers non commités anciens, `.env`/exemples, tailles de fichiers vs plafond 800, verdicts rouges dans les state files récents, balayage secrets, webhook Discord, PR ouvertes, sauvegarde du lake — puis, en passe de correction (Checker F3/F4) : commits orphelins des PR fermées et non-commité du checkout principal. **Quatorze constats** (N13-N14 ajoutés le 13/08 en passe de correction), dont deux « rien trouvé » explicites (N11, N12-tests).

| N | Risque nouveau | Preuve | Gravité | Action recommandée | Qui |
|---|---|---|---|---|---|
| N1 | **Runner GitHub Actions self-hosted ONLINE sur le Mac personnel** (`MacMelvyn`, LaunchAgent du 30/07, pid 4101) + un 2ᵉ runner `BookOfJohann` (Linux, offline). Toute la CI (`checks.yml` : 9 jobs `runs-on: self-hosted`, + `discord_notifications.yml`) s'exécute sur ces machines. Combiné à R5 (2FA non exigée, 5 admins, aucune protection de branche), un seul compte compromis = exécution de code arbitraire sur le poste de Melvyn à chaque `pull_request`. | `gh api …/actions/runners` → `MacMelvyn status:online` ; `launchctl list` → pid 4101 ; `git grep "runs-on" main -- .github/workflows/` → 10 occurrences self-hosted (9 jobs `checks.yml` + 1 `discord_notifications.yml` ; corrigé post-Checker F6) | **haute** | Exiger la 2FA (R5) en priorité ; isoler le runner (utilisateur macOS dédié / VM, pas le compte principal) ; à terme sortir la CI du poste perso | **Melvyn seul** (infra + org) |
| N2 | **Collision de numérotation Mxxx confirmée : 10 numéros** (m028→m037) existent sur les DEUX lignées avec des fichiers différents. Cas parlant : `…_m035_anilist_raw_canonical_app_schema.sql` (main) est le MÊME fichier que `…_m028_anilist_raw_canonical_app_schema.sql` (data) — renuméroté différemment selon la lignée. Plages : main m018→m048, data m018→m058. Le déploiement M046/M047 a déjà dû ruser (« jeu de migrations isolé, sans appliquer M035-M044 réservées au staging », MIGRATION_LOG main l.86). | boucle `comm` sur `git show <lignée>:supabase/migrations` → `collisions=10` ; exemples collés en §R1/N2 | **haute** | Faire aboutir l'hygiène de numérotation (chantier déjà ouvert : worktree `migrations-collision-fix-3ff281`, branche `data/OP-30-hygiene-lignee-data`) avant tout prochain `db push` | agent **avec gate** (c'est une mission OP) ; arbitrage de la convention = Melvyn |
| N3 | **Board cockpit désynchronisé des faits** : `README.md:77` + `missions.json` (committés 10/08 00:29) disent « PR #91 draft, review en attente » 3 h après la merge. Le statut « calculé, jamais tapé » (truth.js) n'a pas été recalculé/committé depuis. Piloter la suite depuis ce board = décisions sur infos fausses. | cf. R9 (chronologie) | moyenne | Recalculer/rafraîchir board + missions.json (et re-committer) avant de lancer la vague H | agent **avec gate** |
| N4 | **Travail non commité vieillissant dans 2 worktrees** : `agitated-mendeleev-a77b4e` porte 2 docs MODIFIÉS non commités (`docs/nouvelle-archi-ia-analyse/10-open-questions.md`, `11-decision-log.md` — worktree du 14/07) ; `happy-moore-25ab94` porte `docs/missions/_state/OP-29.md` **non tracké** (state file = copie unique, contraire au protocole « le fichier est la source de vérité »). | Re-mesuré 13/08 (post-Checker F7) — `git -C …/agitated-mendeleev-a77b4e status --porcelain` → ` M docs/nouvelle-archi-ia-analyse/10-open-questions.md` + ` M docs/nouvelle-archi-ia-analyse/11-decision-log.md` ; `git -C …/happy-moore-25ab94 status --porcelain` → `?? data/` + `?? docs/missions/_state/OP-29.md` (le `?? data/` ne contient qu'un symlink `anilist` vers le lake du dépôt principal, 0 octet propre — négligeable) | moyenne | Committer ou rapatrier ces 3 fichiers ; sinon les inventorier avant tout nettoyage de worktrees | agent **avec gate** (commit) ou Melvyn |
| N5 | **3 dossiers worktree orphelins** sur disque non enregistrés par git (`agent-a22facb49bc6f940a`, `agent-a7ca2499eee1e1a90` — 24/07, `eager-robinson-da0b69` — 14/07) ; quasi vides (squelettes `.github/.run/.vs`, 0 octet utile) ; `git worktree list --porcelain` → aucun prunable (ils ne sont même plus connus de git). Compte réel : 17 dossiers sur disque, 14 worktrees enregistrés (+ dépôt + cockpit = 16 checkouts). | `ls .claude/worktrees/` vs `git worktree list` ; `du -sh` → 0B | faible | Supprimer les 3 dossiers lors d'un nettoyage validé | **Melvyn seul** (`rm` = gated par principe) |
| N6 | **`.claude/` entier non tracké = 3,3 Go**, dont `inbox/` avec 5 fichiers en copie unique (`OP-19-draft.md`, `OP-20-mission-lisibilite-oeuvre-univers.md`, `data-model-findings.md`, `spec-v4-panel-r1-findings.json`, `presentation-team-git.html` — ce dernier absent du recon A0) et 14 worktrees. Un nettoyage disque maladroit détruirait specs + worktrees + branches locales d'un coup. | `git status` → `?? .claude/` ; `du -sh .claude/` → 3,3G ; `ls .claude/inbox/` | moyenne | Sauvegarder l'inbox (la verser au cockpit docs/ ou au bundle) ; documenter que `.claude/worktrees` porte du travail vivant | agent **avec gate** (copie) ; nettoyage = Melvyn |
| N7 | **Fichiers trackés au-delà du plafond 800 lignes** (hook `limit-file-size.sh` + PR #110 draft « guard CI ») : lignée data — `app.js` 4481, `server.js` 1484, `style.css` 1079 ; lignée app — `scripts/anilist_import.js` 2063, `lib/features/posts/widgets/post_detail_components.dart` 977. Le hook ne bloque que les écritures Claude ; le guard CI (#110) n'est pas mergé. | Re-mesuré 13/08 (post-Checker F7), `git show <lignée>:<chemin> \| wc -l` : `data/finalize-pipeline` → `tools/anilist-pipeline/reference/public/app.js` **4481** · `…/reference/server.js` **1484** · `…/reference/public/style.css` **1079** ; `main` → `scripts/anilist_import.js` **2063** · `lib/features/posts/widgets/post_detail_components.dart` **977** | faible | Merger #110 (avec liste d'exemptions legacy) ou assumer l'exemption ; pas d'urgence | équipe/agent **avec gate** |
| N8 | **Traduction FR en panne silencieuse** : depuis au moins le 06/08, l'étape translate de la nightly est sautée (`NIGHTLY_TRANSLATE_CMD` non définie), 60 synopsis en attente ; fallback `coalesce(fr,en)` masque le manque. | `data/anilist/raw/_ops/journal-2026-08-06.md` (fin de fichier, collée en R4) | faible | Définir la commande (runbook `RUNBOOK-nuit-traduction-fr.md`) au prochain run manuel | **Melvyn seul** (env local) |
| N9 | **Course équipe vs travail local non poussé** (corrigé post-Checker F2) : l'équipe merge activement sur **`dev`**, pas `main` — les 8 dernières PR mergées ont `base=dev` et `main` GitHub est **figé à `6981460` depuis le 09/08** (preuves `gh` re-exécutées par le Checker). La vague H locale (op-31/32/33, basées sur `6981460`) reste donc alignée sur `main` aujourd'hui ; le conflit est réel mais **différé à la prochaine promotion dev→main** — d'autant que DEV-74 retire une feature (`audio`). Le rebase n'est pas urgent au jour près ; le push, si. 4 PR ouvertes : #115 (draft), #114, #110 (draft, 01/08), #87 (31/07 — 2 semaines sans merge). | `gh run list` + `gh pr list` (sorties en R3/registre) | moyenne | Pousser la vague H vite (cf. R6) ; planifier le rebase pour la promotion dev→main ; purger la file #87/#110 | push = **Melvyn** ; rebase/PR = agent **avec gate** |
| N10 | **Lake data 4,9 Go en copie unique** sur ce Mac (gitignoré, hors bundle) ; la sauvegarde R2/B2 est listée depuis des semaines dans « Actions Melvyn » (README cockpit) et n'existe toujours pas. Reconstruction possible via l'API AniList mais coûteuse (plusieurs nuits de collecte + quotas). | `du` A0 (4,9 Go) ; README cockpit §Actions Melvyn (infra R2/B2 en attente) | moyenne | Mettre en place la copie R2/B2 (ou un simple disque externe en attendant) | **Melvyn seul** (comptes cloud / matériel) |
| N11 | **Balayage secrets dans les fichiers trackés : RIEN TROUVÉ** (à dire explicitement). 6 patterns de préfixes — JWT, clé secrète Supabase, jetons GitHub (2 formes), clé AWS, clé « sk » (littéraux exacts : prompt Checker A3, pipeline §6 — volontairement non reproduits ici pour ne pas déclencher les scanners) — × 2 lignées → 0 fichier. Webhook Discord : 0 URL littérale, usage propre de `${{ secrets.DISCORD_WEBHOOK }}` (`discord_notifications.yml:13`). | `git grep -lE <pattern> <lignée>` → 0 partout | — (sain) | Rien | — |
| N12 | **Verdicts rouges récents : RIEN TROUVÉ** — 0 `NEEDS_WORK`/`BLOCK` dans les 15 derniers rapports du cockpit (les plus récents : VERIF-2026-08-09-OP24/OP22/OP27) ; board OP-33 : 100 % `DONE(PASS)`, `flutter test +439 ~62 All tests passed!` au 10/08. Reste vrai : donnée personnelle connue (adresse e-mail d'un contributeur) toujours présente dans `OtakuGO_UP-archives/github-workflow-audit-2026-07-25/task-outputs/wyvl6igtj.output` (chemin signalé, valeur non citée — fichier hors git). | `grep -l "NEEDS_WORK\|BLOCK"` sur les 15 derniers `_reports/*.md` → vide | faible (donnée perso archives) | Purger/caviarder l'e-mail du fichier d'archive à l'occasion | **Melvyn seul** (édition d'archive non versionnée) |
| N13 | **Commits orphelins des PR #51/#52/#53 — TRANCHÉ : contenu répliqué dans `main`, perte nulle** (item « à recouper » des archives A0 §3 item 5 ; ajouté post-Checker F3). La branche `test` est supprimée (locale ET GitHub) ; les 3 merge commits — sha de merge officiels GitHub : `c461fdc` (#51 DEV-73, 23/07), `86ca761` (#52 DEV-80, 23/07), `b516e77` (#53 DEV-70 « make report quota atomic », 24/07) — ne sont ancêtres d'aucune branche. `c461fdc`/`86ca761` survivent dans l'historique d'`origin/codex/dev-70-…` et `dev-80-…` ; **`b516e77` n'est contenu dans AUCUNE ref locale** (ni branche ni tag) → hors du bundle 86 refs (fait de refs de branches), il ne tient que par l'objet git local (purgeable par un futur `git gc`) et la ref PR GitHub. MAIS le **contenu** des 3 PR est intégralement dans `main` via la promotion #58 (head=`test` → base=`main`, squash `c02b3bb` à 1 parent, ancêtre de `main`, mergée le 25/07 — titre citant DEV-73/DEV-80/DEV-70). | 13/08 : `git branch -a \| grep test` → 0 branche `test` (2 faux positifs `*-tests`) ; `gh api …/branches/test` → **HTTP 404** ; `git merge-base --is-ancestor <sha> main` → **exit 1 ×3** ; `git branch -a --contains b516e77` → **vide** ; `git for-each-ref --contains b516e77` → vide. Contenu : `git diff b516e77 main --` sur `…m046_notification_pagination.sql` + `…m047_atomic_report_quota.sql` + `supabase/audits/dev70_production_smoke.sql` → **0 ligne** ; sur `lib/features/moderation/` (4 fichiers #53) → **vide** ; sur `lib/features/notifications/` (#52) → **vide** ; sur `lib/features/navigation/main_screen.dart` (#51) → **vide** (seul `test/widget/navigation_shell_test.dart` a évolué depuis — évolution, pas perte) ; `git diff --name-only b516e77 c02b3bb` → 53 fichiers, tous du travail POSTÉRIEUR à #53 (DEV-47/m048, workflows) + docs partagés | faible | Rien d'obligatoire (contenu dans `main`) ; option : taguer localement `b516e77` avant tout `git gc` si l'on tient à la traçabilité des merges de `test` ; solder l'item « à recouper » des archives | tag = **Melvyn seul** (écriture de ref) ; sinon — |
| N14 | **4 fichiers non commités dans le checkout PRINCIPAL** (branche `feature/DEV-83-brancher-catalogue`, déjà squash-mergée via #91) — angle mort de N4, qui ne couvrait que les worktrees (ajouté post-Checker F4). (a) `M lib/core/services/color_extractor_service.dart` + `?? test/unit/color_extractor_service_test.dart` (09/08 19:43-19:44, ~1 h 45 avant la merge #91) : retouche + test **répliqués nulle part** — copie unique vraie, au même titre que OP-29.md (N4) ; (b) `?? docs/decisions/file-size-guard.md` + `?? scripts/check-max-lines.sh` (07/08 04:29) : matière de la PR #110 draft, mais **variante locale divergente** de la version poussée (`chore/DEV-84-god-file-guard`, locale + origin) — la version poussée est plus à jour (job `Gate / Policy` de `checks.yml`, exemption `supabase/types/*` ; la locale cite encore l'ancien `ci.yml` supprimé). Aucun bundle ne couvre le non-commité. | 13/08 : `git status --porcelain` (checkout principal) → ` M lib/core/services/color_extractor_service.dart` · `?? test/unit/color_extractor_service_test.dart` · `?? docs/decisions/` (seul contenu : `file-size-guard.md`) · `?? scripts/check-max-lines.sh` (les 3 autres `??` — `.claude/`, `check_anon.sh`, `config/staging.dart-defines.json` — déjà traités en N6/R7) ; `ls -ld` → 09/08 19:43 (3 541 o) · 09/08 19:44 (1 181 o) · 07/08 04:29 (4 217 o) · 07/08 04:29 (1 048 o, exécutable) ; `git show origin/chore/DEV-84-…:<f> \| diff - <local>` → les 2 fichiers guard **diffèrent** | moyenne | (a) committer la paire `color_extractor` sur une branche dédiée — elle est perdue si ce checkout est nettoyé ou rebasculé ; (b) réconcilier la paire guard avec #110 puis supprimer les doublons locaux ; a minima, inventorier les 4 fichiers avant tout nettoyage | commit/réconciliation = agent **avec gate** ; suppression de doublons = **Melvyn seul** |

Observation annexe (non classée risque) : `.git/FETCH_HEAD` du dépôt principal date du **12/08 15:41** — un `git fetch` a eu lieu pendant la fenêtre OP-33/A0 (session Claude ou action manuelle, auteur non déterminable). Les refs `origin/*` utilisées ici sont donc fraîches à ±1 jour, et cet audit-ci n'a lancé **aucun** fetch.

## NON VÉRIFIABLE

1. **Fonctionnement runtime de la clé anon staging** (attendu `HTTP 200`) — exigerait un appel réseau sortant vers `…supabase.co`, hors périmètre d'un audit lecture seule. Le script `check_anon.sh` est prêt ; 30 s pour Melvyn.
2. **État réellement appliqué de M046/M047 sur le projet Supabase de production** — la preuve disponible est déclarative (`MIGRATION_LOG.md`) ; la confirmation demanderait `supabase migration list --linked` avec login (Melvyn seul).
3. **Exécution locale de la suite de tests `main`** — lancer `flutter test` écrirait des artefacts dans le dépôt (interdit ici). Compensé par une preuve dynamique externe : run CI `schedule` vert sur `main` le 10/08.
4. **Contenu des transcripts** `OtakuGO_UP-cockpit/projects/*.jsonl` — volontairement non lus (données personnelles) ; seule leur existence/date est constatée.
5. **2FA individuelle des 5 comptes collaborateurs** — l'API org n'expose la liste `2fa_disabled` qu'à un owner org via un appel dédié, non tenté ; seul le réglage org (`two_factor_requirement_enabled=false`) est prouvé.
6. **Machine hébergeant le runner `BookOfJohann`** (Linux, offline) — enregistrement visible via l'API, localisation physique inconnue depuis ce poste.

---

> **Corrigé le 2026-08-13 (passe unique post-checker, verdict `A3-checker-verdict.md`) : F1-F8.**
> F1 — bundle 2 (86 refs, 13/08 11:37) intégré au TL;DR, au registre R6 et au §R6, y compris la fin de section
> (la phrase « le bundle ne couvre ni op-31, ni op-32, ni op-30 » était périmée). F2 — N9 corrigé (« dev », pas
> « main » ; urgence du rebase requalifiée). F3 — N13 ajouté (orphelins PR #51/#52/#53 : contenu vérifié dans
> `main` via #58, perte nulle). F4 — N14 ajouté (4 fichiers non commités du checkout principal). F5 — chiffres
> 41 branches / 15 ≥ 8 commits (TL;DR + R6). F6 — 10 occurrences `runs-on: self-hosted` (N1). F7 — sorties N4/N7
> re-mesurées le 13/08 et collées dans les cellules de preuve. F8 — réserve même-disque des bundles ajoutée au §R6.
> F9/F10 — aucune correction requise (verdict Checker). Zéro mutation re-vérifiée après la passe :
> `git status --porcelain` et HEAD identiques sur les dépôts OtakuGO.
