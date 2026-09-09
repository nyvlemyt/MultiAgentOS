# A4 — Synthèse & plan de phases (OtakuGO piloté depuis MAOS)

> Produit le 2026-08-13 par le Doer A4 (chef d'orchestre MAOS) — pipeline
> `docs/audits/2026-08-12-otakugo-audit-pipeline.md` §7. Entrées : A1 (chronologie, corrigée F1/F2/F9,
> PASS passe 2 — **lu avec l'avertissement orchestrateur : la note du 13/08 11:37 de §Travaux en vol fait
> foi sur le TL;DR resté pré-bundle**), A2 (22 patterns · 13 cartes, PASS passe 2), A3 (14 constats
> N1-N14, PASS passe 2), A0-recon ×3, verdicts checkers. Côté MAOS : CLAUDE.md §4-5, PRODUCT_SPEC §5/§11,
> ROADMAP (phase courante : **Phase 9 — Exploitation & Auto-construction**, Étape 0 en cours).
> Compléments lus en **lecture seule stricte** dans le cockpit (aucun git mutant, zéro écriture) :
> `docs/missions/README.md` (D1→D5 + Actions Melvyn), `RETOURS-MELVYN.md` (R9/R21/R22/R24),
> `OP-21-regles-donnees-series.md:251-254` (D6→D9), `_reports/OP-21-rapport.md:417` (D9 non implémentée),
> `missions.json` (statuts OP-19/21/26/31-34).
> **Règle absolue du plan : aucune écriture vers les dossiers OtakuGO sans gate humaine — sans exception.**

# TL;DR

Le produit avance plus vite que son filet : l'app est branchée sur le catalogue (PR #91 mergée le 09/08), la vague H (OP-30/31/32/33) est **entièrement exécutée et vérifiée PASS** — mais ses ~70 commits uniques + 3 fichiers non commités ne vivent que sur le Mac (bundle local du 13/08 comme seul filet, sur le même disque), pendant que la sécurité GitHub org reste ouverte (2FA non exigée, 5/5 admins) avec un runner CI self-hosted **online sur ce même Mac**. Le plan tient en **11 phases sur 4 pistes** : S1-S3 sécurisation (push + copies hors disque, org+runner, hygiène locale), H0-H3 reprise de la vague H (resync du board d'abord — il ment encore sur PR #91), V1 vague suivante (OP-07/08/09/23 sont **débloquées de fait**, hygiène migrations avant tout db push), M1-M3 côté MAOS (enregistrement d'OtakuGO en autonomie `manual` + noyau des 13 cartes A2). **25 décisions consolidées, 16 ouvertes**, chacune avec recommandation. Prochaine étape unique : **S1 — Melvyn pousse les 7 branches et copie les bundles hors disque (≈10 min)**.

## État en 1 page

**Image d'ensemble** : OtakuGO est une maison dont le gros œuvre vient d'être terminé… par une équipe dont les plans les plus récents sont restés dans la camionnette — garée dans la rue, portière ouverte. Rien n'est perdu, mais rien de récent n'est à l'abri, et la porte du chantier (l'org GitHub) est sans serrure.

**Le produit (lignée `main`)** — sain et en mouvement.
- App Flutter/Supabase « réseau social anime » branchée sur le catalogue : **PR #91 mergée le 09/08 21:26** (`6981460`, tip de `main`) — AniList direct débranché (A1 §Divergences 1, A3 R9).
- L'équipe humaine (5 comptes) merge activement sur **`dev`** (8 PR, DEV-74/76/68/55, dernier merge 12/08 15:11Z) ; `main` GitHub est figé à `6981460` depuis le 09/08 → le conflit avec la vague H locale est **différé à la promotion dev→main** (A3 N9) : le rebase n'est pas urgent au jour près, le push si.
- CI verte (runs success 09-12/08) mais **exécutée sur le Mac personnel de Melvyn** (runner self-hosted `MacMelvyn` online, 10 jobs `runs-on: self-hosted` — A3 N1).

**La vague H (10→12/08)** — faite, vérifiée, invisible.
- OP-33 (fiche œuvre + recherche 2 régimes) : TERMINÉE, verdict PASS, 439 tests verts, **preuve sur appareil réel** le 12/08 — 24 commits jamais poussés. OP-31 (représentant de carte) : 33 commits, vérif adversariale tierce. OP-32 (ères narratives, cas Dragon Ball) : 12 commits, contre-vérification 2 passes. OP-30-attribution : 10 commits **dont la migration M200 appliquée sur staging** — le schéma staging référence du code qui n'existe sur aucun remote (A1 §Travaux en vol).
- Page Recommandation complète (14 commits propres) et revue 3 étages de PR #91 (3 commits) : jamais poussées.
- **Filet actuel** : bundle `otakugo-toutes-branches-locales.bundle` (86 refs, 13/08 11:37) couvre tous les lots commités **en local seulement** ; restent sans aucun filet les contenus **non commités** (diff DEC-024/025 = seul enregistrement de l'arbitrage des 38 ponts crossover ; HTML d'arbitrage 47 Ko ; paire `color_extractor` — A1 risque 5/4, A3 N4/N14) et la **copie hors disque** des bundles (même disque que le dépôt, dossier non versionné — A3 R6/F8).

**La data (lignée `data/finalize-pipeline`)** — vivante mais sous perfusion manuelle.
- Lake AniList **4,9 Go en copie unique** sur ce Mac (A3 N10) ; nightly automatique morte depuis le 13/07 (TCC launchd), runs manuels jusqu'au 06/08 (donnée vieille de 7 j au 13/08) ; traduction FR sautée depuis au moins le 06/08 (60 synopsis en attente — A3 R4/N8).
- **10 numéros de migration en collision** entre les deux lignées (m028→m037 ; A3 N2) — à assainir avant tout prochain `supabase db push`. Clé anon staging posée le 12/08 (classe publique correcte), runtime à confirmer (`check_anon.sh`, 30 s — A3 R7).

**Le pilotage** — le cockpit a prouvé la méthode, mais son tableau de bord ment.
- 34 missions pilotées ; vague G **livrée** (OP-20/21/22/24/25/27/28/29 mergées #106-112 + 09/08) ; board README et missions.json disent encore « PR #91 draft » et « vague H à lancer » (A3 N3, A1 §Divergences 2/7) — piloter depuis ce board = décider sur infos fausses tant que H0 n'est pas faite.
- Conséquence directe des merges : **OP-07/08/09 (bloquées par OP-06) et OP-23 (bloquée par OP-21+OP-22) sont débloquées de fait** — le board ne le dit nulle part. Restent à lancer : OP-19 (pont OtakuGO↔MAOS), OP-26 (nightly incrémentale), OP-34 (vague H, aucune ref git).

**Ce qui bloque, par ordre de dégât potentiel** : (1) ~70 commits + 3 fichiers uniques tiennent à un seul disque ; (2) org GitHub sans 2FA ni protections, 5/5 admins, **combinée** au runner CI sur le poste perso = un compte compromis exécute du code chez Melvyn ; (3) le suivi désynchronisé ; (4) une file de décisions produit (DEC-025 crossover non commitée, D9 identité non implémentée, GO B1-B4 d'OP-01).

## Plan de phases

Quatre pistes : **S** = sécurisation immédiate · **H** = reprise vague H · **V** = vagues suivantes · **M** = côté MAOS (parallélisable dès S1, aucune écriture OtakuGO). Chaque écriture vers OtakuGO (fichier, commit, push, PR, merge, migration) est **gated** : validation humaine explicite par action, quel que soit le niveau d'autonomie (CLAUDE.md §5). « Melvyn seul » = action que seul l'humain peut/doit faire (réglage système, admin org, push, destruction).

| Phase | Objectif | Pré-requis | Critère de sortie (binaire) | Gates humaines |
|---|---|---|---|---|
| **S1 — Sauvegarde & push (stop-perte)** | Plus aucun travail unique ne dépend du disque : pousser la vague H + annexes, sécuriser les non-commités, copier bundles + lake hors disque | Aucun | (1) `git rev-list --count <br> --not --remotes` = **0** pour les 7 branches : `claude/op-33-fiche-oeuvre-recherche`, `claude/op-31-representant-carte-71900a`, `claude/op-32-eres-narratives-f4a8e6`, `claude/op-30-attribution-listings`, `claude/reco-page-implementation`, `claude/pr91-revue-archi-grille`, `claude/branch-structure-data-0354f5` ; (2) les 3 contenus non commités (diff DEC-024/025 d'`agitated-mendeleev`, `docs/partage/arbitrage-coupures-crossover.html`, paire `color_extractor_service.dart`+test) sont chacun soit commités-poussés sur une branche dédiée, soit copiés hors disque avec chemin consigné ; (3) les 2 bundles existent sur un support hors du Mac ; (4) une copie du lake (4,9 Go) datée existe hors disque interne | **Push + copies hors disque = Melvyn seul** (A3 R6). Commits des non-commités = agent **avec gate** (1 validation par commit) ou Melvyn. Aucune autre écriture |
| **S2 — Sécurité org & runner** | Fermer le vecteur « compte compromis → exécution de code sur le Mac » (A3 R5×N1) | Aucun (parallèle S1) ; prévenir l'équipe avant la 2FA (GitHub retire les membres non conformes) | (1) `gh api orgs/Reseau-Social-Anime` → `two_factor_requirement_enabled:true` ET `default_repository_permission:"write"` ; (2) `gh api repos/…/collaborators` → exactement 1 `role_name:"admin"` (Melvyn) ; (3) runner `MacMelvyn` : arrêté OU migré sous compte macOS dédié/VM — état cible choisi (ND2) constaté via `gh api …/actions/runners` + consigné ; (4) décision protections de branche (ND1-c : Pro / public / différé) consignée au registre | **Tout = Melvyn seul** (admin org + infra du poste) |
| **S3 — Hygiène locale & filets** | Purger la pollution, rallumer la nuit, poser les petits filets | S1 (rien ne se supprime avant réplication) | Checklist 7/7, chaque point vérifié : (1) `git -C OtakuGO_UP-cockpit status --porcelain` ne liste plus les 6 entrées de pollution (P3) ; (2) nightly : run launchd exit 0 + journal `_ops/` postérieur au fix TCC, et `NIGHTLY_TRANSLATE_CMD` définie (60 synopsis traduits au run suivant) ; (3) `./check_anon.sh` → HTTP 200 consigné ; (4) `git for-each-ref --contains b516e77` non vide (tag posé, ND6) ; (5) les 3 dossiers worktree orphelins (N5) supprimés ; (6) e-mail personnel absent de `task-outputs/wyvl6igtj.output` (`grep` = 0, ND7) ; (7) les 5 fichiers de `.claude/inbox/` + `_state/OP-29.md` + `database.types.ts` répliqués (copie versionnée ou archive, chemins consignés — N4/N6) | Purge/suppression/TCC/tag/e-mail = **Melvyn seul** (destructif ou système). Copies inbox = agent **avec gate** |
| **M1 — Enregistrement d'OtakuGO dans MAOS** | Le projet existe dans le cockpit MAOS avec ses garde-fous déclarés (détail : §Enregistrement) | Aucun (côté MAOS uniquement ; lecture seule du path) | (1) ligne `projects` créée avec `path=/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP`, `autonomy=manual`, budget posé ; (2) `config/permissions.json` porte les catégories `otakugo.*` (§Enregistrement) dont `supabase_prod_write: blocking` ; (3) context pack `data/context-packs/<id>.md` généré < 24 h ; (4) dry-run du wizard consigné (stack détectée, coût d'indexation) | Écritures **côté MAOS seulement** (DB + config MAOS) ; zéro écriture OtakuGO. Validation Melvyn du formulaire d'enregistrement |
| **H0 — Resynchronisation du suivi** | Le board cockpit redevient la vérité avant de décider dessus (A3 N3) | S1 (la fiche OP-30-attr n'existe que sur sa branche → poussée d'abord) | Un commit unique (gated) sur le cockpit tel que : (1) OP-06 = « mergée #91 » (board + missions.json) ; (2) OP-30-attribution présente au board ; (3) OP-31/32/33 = « exécutée — review Melvyn en attente » ; (4) `grep « à lancer »` sur OP-15/20/21/22/24/27 → 0 ; (5) OP-07/08/09/23 marquées « débloquées » ; (6) recalcul truth.js → badge « désynchronisé » éteint sur ces missions | Écriture + commit vers OtakuGO = agent **avec gate** (validation du diff par Melvyn avant commit ; jamais de push sans gate). `git fetch` préalable = **Melvyn** (mutation de refs) |
| **H1 — OP-33 : review → PR → merge** | Livrer la fiche œuvre + recherche (le travail le plus abouti : PASS, preuve device) | S1 + H0 + décision ND3 tranchée (taille PR) | (1) PR OtakuGO ouverte **draft label `ia`** depuis `claude/op-33-…` avec la forme choisie en ND3 (label `size:exempt` OU lots ≤ 400) ; (2) vérification R26 faite AVANT merge : fichier `VERIF-<date>-OP33.md` committé, verdict ternaire par point ; (3) review Melvyn consignée ; (4) statut final ∈ {mergée, NEEDS_WORK+findings} écrit au board — rien d'autre | Ouverture PR, VERIF, merge = agent **avec gate** à chaque pas ; le **merge lui-même = clic Melvyn** (précédent R26 : on vérifie avant de merger) |
| **H2 — OP-31 + OP-32 + OP-30-attr : vérif → PR** | Sortir le reste de la vague H du purgatoire, régulariser M200 | S1 + H0 ; pour tout `db push` : ND4 (migrations) d'abord | (1) 3 PR draft label `ia` ouvertes (une par branche) ; (2) 3 fichiers VERIF R26 committés (les verdicts PASS locaux re-vérifiés en session fraîche) ; (3) M200 : la migration présente sur la branche poussée = celle appliquée sur staging (diff = 0) — le staging ne référence plus de code fantôme ; (4) statut final de chaque OP consigné au board | Idem H1 : chaque PR/commit/merge = gate ; merges = **Melvyn**. Tout `supabase db push` = **bloqué** tant que ND4 non tranchée |
| **H3 — OP-34 : exécution (1re mission pilotée depuis MAOS)** | Lancer la dernière mission de la vague H via MAOS (dogfooding réel) | M1 (projet enregistré) ; étage 1 possible dès S1, étages 2-3 après merge OP-33 (missions.json) | (1) trace OP complète : fiche (existante) + `_state/OP-34.md` + rapport + VERIF committés ; (2) verdict ∈ {PASS, NEEDS_WORK} consigné ; (3) branche poussée ≤ 24 h après son dernier commit (règle anti-« travail invisible » née de cet audit) ; (4) la mission apparaît dans MAOS (mission liée au projet, events tracés) | Dispatch MAOS en `manual` : **chaque écriture/exec validée par clic** ; push ≤ 24 h = Melvyn |
| **V1 — Vague I : dette data + missions débloquées** | Exploiter les déblocages (OP-06/21/22 mergées) et solder la dette structurelle | H1-H2 (base saine) ; ND4/ND5 partielles | Jalon par jalon, tous binaires : (1) **hygiène migrations** : `comm` sur `supabase/migrations` des 2 lignées → **0 collision** de numéro (mission héritière de `data/OP-30-hygiene-lignee-data`) ; (2) **OP-19** (conventions agents + pont OtakuGO↔MAOS) livrée : rapport + verdict committés ; (3) OP-07/08/09/23 + OP-26 : chacune a au board un statut ∈ {lancée, planifiée-datée, gelée-motivée} — plus aucune « bloquée » à tort ; (4) décisions produit DEC-025 (crossover) et D9 (identité stable) tranchées et consignées ; (5) file PR GitHub : #87/#110/#114/#115 chacune mergée ou fermée-motivée (0 PR > 30 j sans décision), la paire guard locale N14-b réconciliée avec #110 ; (6) revue franchises : les 34 groupes prioritaires OP-03 tranchés (`source=manual`) | Toute mission = pipeline 3 étages avec gates par écriture ; merges + décisions produit = **Melvyn** ; revue franchises = **Melvyn seul** (arbitrage humain par conception) |
| **M2 — Socle de pilotage MAOS (noyau des cartes A2)** | Donner à MAOS les organes prouvés par le cockpit pour piloter un projet externe sans en perdre le fil | M1 + ND5 tranchée (validation des cartes) | (1) les cartes du noyau validé créées dans `docs/backlog/` ; (2) **C9** livrée : panneau « écritures en attente » liste 2 fichiers modifiés d'un projet externe de test + portique CI anti-commit-auto vert/rouge/vert ; (3) **C4** livrée : prompt à coller généré pour 100 % des missions `planned+`, testé une fois hors MAOS ; (4) **C1** et **C10** livrées selon leurs critères binaires (badge désync ≤ 60 s après mort du worker ; reprise sans perte avec `next_action`) ; (5) **C3** livrée (rapport à sections + verdict + hypothèses de fragilité ≥ 3) ; (6) 5 checks MAOS verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0) | Travail 100 % côté MAOS (aucune écriture OtakuGO) ; PR MAOS en draft, **merge = Melvyn** (ROADMAP §méthode) |
| **M3 — Suite des cartes + verrous de long terme** | Compléter l'absorption A2 et poser les règles qui durent | M2 | (1) chacune des 13 cartes C1-C13 a un statut consigné ∈ {livrée, planifiée-datée, rejetée-motivée} ; (2) C11 (vérification indépendante ternaire) livrée **avant** le premier merge OtakuGO exécuté par le worker MAOS — règle écrite dans la fiche du reviewer (couplage P5↔C11, A2 F9) ; (3) C8 explicitement liée à l'activation autopilot Phase 6 (pas avant — KILL P10) ; (4) C2/C5/C6/C7/C12/C13 livrées ou planifiées-datées ; (5) 5 checks verts | Idem M2 ; toute conséquence touchant OtakuGO reste gated |

**Chemin critique** : S1 → (S2 ∥ S3 ∥ M1) → H0 → H1 → H2 → (H3 ∥ V1) → M2 → M3. S1 est le seul préalable universel : tout le reste suppose que le travail est répliqué.

## Décisions à trancher par Melvyn

Consolidation exhaustive : **D1→D9** hérités du cockpit (board README §D1-D5 + D6→D9 de la fiche OP-21), **P1→P4** de la pipeline d'audit, **4 retours-décisions** du registre cockpit (R9/R21/R22/R24), **8 nouvelles** issues de l'audit (ND1→ND8). Total **25**, dont **16 ouvertes**. Les défauts « appliqués, veto possible » restent véto-ables tant que la réalité n'a pas figé l'option.

### Ouvertes (16) — à trancher, avec recommandation

| # | Décision | Options | Conséquence si non tranchée | Recommandation |
|---|---|---|---|---|
| **D1** | Où tourne la pipeline data (défaut cockpit : GitHub Actions, Mac = secours ; **réalité 13/08 inverse** : nightly locale morte + OP-01 mergée mais « GO B1-B4 en attente ») | (a) donner le GO B1-B4 → orchestration Actions, Mac = secours · (b) rester local : fix TCC seulement · (c) **fix TCC maintenant + GO B1-B4 planifié** | La donnée vieillit (7 j au 13/08) et la traduction FR reste en panne ; le Mac reste un point unique | **(c)** — le fix TCC coûte 2 min (S3) et remet la nuit en marche ; le GO B1-B4 (V1) est la sortie durable, cohérente avec « à retirer une fois la pipeline sortie du Mac » |
| **D9** | Identité stable des séries (slug + `primary_anilist_id` immuables après approbation) — reco « oui » de la fiche OP-21 mais **non implémentée** (rapport OP-21, R4 l.417) | (a) **mission courte dédiée en V1, avant d'ouvrir les communautés DEC-019** · (b) accrocher au périmètre d'une reprise OP-31 · (c) accepter le churn de slugs | Les communautés et validations manuelles se décrochent au premier renommage | **(a)** — c'est un verrou de fondation ; petit périmètre, gros dégât évité |
| **P2** (reste) | Branches jamais poussées — (b) bundles **FAIT** (11:17 + 11:37) ; reste (a) push + copie hors disque | (a) **pousser les 7 branches + copier bundles/lake hors disque (S1)** · (b) s'en tenir aux bundles locaux · (c) rien | Un vol/panne/nettoyage du Mac emporte ~70 commits + l'arbitrage crossover | **(a) aujourd'hui** — c'est LA prochaine étape (cf. fin du document) |
| **P3** | Config Claude Code déversée à la racine du cockpit (6 entrées + transcripts, 09/08) | (a) **déplacer/supprimer toi-même** (copie de sauvegarde hors dépôt d'abord si tu veux garder les transcripts) · (b) laisser | Un `git add -A` committerait history.jsonl + transcripts (données personnelles) dans un repo à 5 comptes | **(a)** en S3 — action destructive = Melvyn seul (CLAUDE.md §5) |
| **R9 / DEC-025** | Découvrabilité des crossovers (trouvable depuis chaque IP sans fusion) — candidate DEC-025 ; l'arbitrage humain des 38 ponts n'existe que dans un **diff non commité** qui crée en plus une **collision de numéro DEC-024** (A1 §Divergences 3) | (a) **sécuriser d'abord** : committer le diff tel quel sur sa branche + pousser (S1), puis trancher DEC-025 et renuméroter la décision crossover (DEC-027+) en V1 · (b) trancher tout de suite · (c) laisser | Perte du seul enregistrement de 5 relecteurs × 38 ponts ; le registre R9 pointe dans le vide | **(a)** — la sauvegarde ne préjuge de rien ; l'arbitrage produit se fait au calme en V1 |
| **R21** | Chantier workflow GitHub (gelé le 29/07 ; spec v4 + 91 Ko de findings panel en inbox) | (a) **rester gelé, artefacts sécurisés** (spec v4 poussée en S1, inbox répliquée en S3) · (b) relancer à la première promotion dev→main · (c) jeter | Les artefacts uniques du chantier restent fragiles ; relancer trop tôt re-braque l'équipe | **(a) maintenant, (b) le moment venu** — la promotion dev→main (N9) est l'occasion naturelle de rouvrir le sujet |
| **R22** | Ménage git : supprimer `dev`/`test`, purger les branches mortes (~20 pré-squash) — suspendu avec R21 ; « le groupe a eu peur » | (a) relancer maintenant · (b) **différer : après push vague H + vérification d'exhaustivité des squashes** (précédent prouvé du « délta manquant #74 », A1 §NON VÉRIFIABLE 2) + tag b516e77 d'abord (ND6) · (c) abandonner | Une purge aveugle peut détruire du contenu que les squashes n'ont pas capturé | **(b)** — purge par lots, chaque lot précédé d'un diff de vérification ; toute suppression = Melvyn seul |
| **R24** | Cible de sauvegarde du lake (le disque Toshiba NTFS refuse l'écriture) | (a) disque externe reformaté exFAT · (b) copie interne + externe · (c) R2/B2 cloud (listé depuis des semaines en « Actions Melvyn ») | Lake 4,9 Go en copie unique (N10) — reconstruction = plusieurs nuits de quotas AniList | **(a) immédiat (S1) + (c) durable (S3/V1)** — un disque à 30 € aujourd'hui, le cloud ensuite |
| **ND1** | Sécurité org GitHub (R5) : 2FA, permission par défaut, protections | 2FA : (a) **exiger org-wide** (prévenir l'équipe : les comptes sans 2FA sont éjectés) · (b) demander sans exiger. Permission : (a) **`default_repository_permission=write`** + 1 seul admin · (b) statu quo. Protections : (a) GitHub Pro (payant) · (b) passer le repo public · (c) **différer, compenser par 2FA+write+runner isolé** | Un seul compte compromis = admin total ; combiné à N1, exécution de code sur ton Mac | **2FA exigée + write + admin unique tout de suite (S2)** ; protections : (c) court terme, trancher Pro vs public quand le budget/la confidentialité seront posés |
| **ND2** | Runner CI self-hosted `MacMelvyn` online sur ton poste (N1) | (a) **isoler : compte macOS dédié sans droits / VM** · (b) migrer sur runners GitHub-hosted (quota minutes à surveiller — le choix self-hosted venait de là, R23) · (c) couper | Chaque `pull_request` de n'importe quel compte exécute du code sur ta session | **(a) en S2**, réévaluer (b) une fois ND1 en place ; à terme sortir la CI du poste perso (cohérent D1) |
| **ND3** | Taille de la PR OP-33 : 8 299 insertions vs règle git 7 « ≤ 400 lignes » (A3 R10) | (a) découper en lots ≤ 400 · (b) **label `size:exempt` assumé** (précédent : PR #91) · (c) hybride docs exempt / code découpé | H1 est bloquée tant que la forme n'est pas choisie | **(b)** — la vérif 3 étages est PASS avec preuve sur appareil ; re-découper 49 fichiers cohérents coûte cher et casse l'atomicité. Consigner l'exemption au board |
| **ND4** | Collision de numérotation de 10 migrations entre lignées (N2) | (a) **renumérotation de la lignée data avant tout `db push`** (chantier `migrations-collision-fix` existant, mission gated) · (b) statu quo + « jeux isolés » à chaque déploiement (la ruse M046/M047) · (c) fusionner les lignées | Chaque déploiement devient un numéro d'équilibriste ; M200 a déjà été appliquée depuis une branche locale | **(a)** en tête de V1 — et **aucun db push d'ici là** (gate dure) |
| **ND5** | Intake des 13 cartes A2 (C1-C13) — validation AVANT création de fichiers backlog | (a) valider les 13 d'un bloc · (b) **valider le noyau pilotage-externe (C9, C4, C1, C10, C3) pour M2 et séquencer le reste en M3** (C2/C5/C6/C7/C12/C13 ; C8 liée Phase 6 ; C11 avant le premier merge piloté worker) · (c) tout différer après la vague H | Sans C9/C4, MAOS pilote OtakuGO sans filet « écritures en attente » ni issue de secours ; sans décision, les cartes restent lettre morte | **(b)** — le noyau sert directement H3/V1 ; rappel couplage A2-F9 : si C11 est écartée, P5 doit être requalifié « partiellement couvert » |
| **ND6** | Commit `b516e77` (merge PR #53) hors de toute ref — purgeable par un futur `git gc` (N13 ; contenu déjà dans `main`, perte de traçabilité seulement) | (a) **tag local avant tout gc/ménage** (30 s) · (b) rien | Un `git gc` efface le dernier témoin des merges de `test` | **(a)** en S3, prérequis de R22 |
| **ND7** | E-mail personnel d'un contributeur dans `task-outputs/wyvl6igtj.output` (archives hors git, N12) | (a) **caviarder l'e-mail** (fichier non versionné, édition simple) · (b) laisser | Donnée nominative qui traîne dans un dossier sans contrôle d'accès | **(a)** en S3 — Melvyn seul (édition d'archive) |
| **ND8** | Paramètres d'enregistrement MAOS (autonomie initiale, budget, catégories risquées) — proposition complète au §suivant | (a) **valider la proposition telle quelle (`manual`, budgets, catégories `otakugo.*`)** · (b) amender (ex. démarrer `assisted`) · (c) différer l'enregistrement | Sans enregistrement, H3 (première mission pilotée MAOS) et M2 n'ont pas de support | **(a)** — `manual` d'abord : chaque geste visible pendant qu'on apprend le projet ; passage `assisted` = décision explicite après 2 missions PASS sans incident |

### Actées / closes — consignées pour mémoire, veto toujours possible (9)

| # | Décision (défaut cockpit) | Statut au 13/08 | Recommandation |
|---|---|---|---|
| D2 | Tempo du branchement app : dès staging assaini | **Close de fait** — OP-06 livrée, PR #91 mergée 09/08 | Rien — actée par les faits |
| D3 | Outil de revue franchises local, verdicts `source=manual` | **Close** — OP-03 livrée ; reste l'action : 275 groupes (34 prioritaires) à trancher | Maintenir ; l'action humaine part en V1-(6) |
| D4 | Spoilers par épisode pour le MVP | **Close** — OP-05 livrée-mergée | Maintenir jusqu'à signal produit contraire |
| D5 | Manga : garder P1, geler le crawl complet | **Close** — OP-04 livrée (DEC-024 ONE_SHOT commitée) | Maintenir ; re-trancher si mission manga |
| D6 | Garde SQL titre/image (reco fiche OP-21 : oui) | **Appliquée** — OP-21 mergée #112 (04/08) | Maintenir |
| D7 | NYR/CANCELLED hors vues par défaut (reco : oui) | **Appliquée** — idem | Maintenir |
| D8 | Garde adulte en SQL, défense en profondeur (reco : oui) | **Appliquée** — idem | Maintenir |
| P1 | Lancer la pipeline d'audit | **FAIT** — option (a), A0→A4 exécutées | — |
| P4 | Où vivent les livrables d'audit | **FAIT** — option (a), `docs/audits/otakugo/` (MAOS) | Maintenir : MAOS = centre de commandement, OtakuGO non touché |

## Enregistrement MAOS proposé

> À valider par toi (= décision **ND8**). Aucune de ces écritures ne touche OtakuGO : tout vit dans la DB et la config MAOS ; le path externe est lu, jamais écrit sans gate.

**Fiche projet** (wizard `/projects/new`, PRODUCT_SPEC §11.1) :

| Champ | Valeur proposée | Pourquoi |
|---|---|---|
| Nom / slug | OtakuGO / `otakugo` | — |
| Path (absolu) | `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP` | Le dépôt racine ; le cockpit (`OtakuGO_UP-cockpit`) est un **worktree du même dépôt** — MAOS le lit via ce path, on n'enregistre pas deux projets |
| Type | `manga-app` | Catégorie native du wizard |
| Stack | Flutter/Dart 3.44 · Supabase/Postgres (47 migrations) · Node (ETL AniList) | Détection + chips |
| **Autonomie initiale** | **`manual`** | Lecture + proposition seulement ; chaque write/exec attend un clic. Pendant S/H, on apprend le projet — et de toute façon **toute écriture vers un projet externe est gated quel que soit le niveau** (CLAUDE.md §5). Passage `assisted` = décision explicite après 2 missions PASS sans incident de gate ; `autonomous`/`autopilot` : pas avant S2 faite ET C1+C9+C11 livrées |
| Mode | `eco` | Défaut produit ; style Caveman réservé au trafic inter-agents |
| Budget | **150 k tokens max par mission** (hard cap → pause + demander, TOKEN_STRATEGY) ; enveloppe **1,5 M tokens/mois** ; champ € du wizard : 5 € nominal (billing réel = abonnement, §11 CLAUDE.md) | Les missions cockpit observées tiennent en 60-130 k ; l'audit complet a coûté ~600 k |

**Catégories risquées à déclarer dans `config/permissions.json`** (le point d'extension unique, CLAUDE.md §5) :

| Catégorie | Risk | Effet |
|---|---|---|
| `otakugo.supabase_prod_write` | **blocking** | JAMAIS la prod, quel que soit le prétexte (doctrine PROTOCOL cockpit §5 — reprise telle quelle) : toujours BLOCK, même en autopilot |
| `otakugo.supabase_staging_push` | high | Tout `db push`/migration staging → gate ; **et refus systématique tant que ND4 (collisions) n'est pas soldée** |
| `otakugo.git_push` | high | Tout push vers `Reseau-Social-Anime/OtakuGO_UP` → gate |
| `otakugo.pr_merge` | high | Merge = clic Melvyn après VERIF R26 committée |
| `otakugo.ci_workflow_edit` | high | Toute écriture `.github/workflows/**` → gate (la CI tourne sur ton Mac, N1) |
| `otakugo.lake_write` | high | Toute écriture sous `data/` (4,9 Go copie unique) → gate ; nightly via runbook uniquement |
| `otakugo.branch_delete_or_gc` | **blocking** | Purge de branches / `git gc` : BLOCK tant que R22-(b) (vérif squash + tag ND6) n'est pas exécutée |
| `allowed_hosts` (ajouts) | — | `graphql.anilist.co` (collecte) · `pxgnchlqkrgrjabxxufj.supabase.co` (staging **seulement** — le host prod `laghdgfjccakisidaway` ne rentre pas dans l'allowlist) |

**Première mission enregistrée** : H0 (resynchronisation du board) — petite, à forte valeur, 100 % gated ; puis H3 (OP-34) comme premier run 3-étages complet piloté depuis MAOS.

## Annexe — traçabilité audit → plan (pour le Checker A4)

**Risques A3 (registre R1-R10 + nouveaux N1-N14) → destination.** Gravité haute en gras ; aucun « bloquant » relevé par A3.

| Constat A3 | Destination |
|---|---|
| R1 migrations revenues (corrigé) · R2 main réparé (corrigé) · R3 CI vivante (corrigé) | Rien à faire — consignés à l'État |
| R4 nightly morte (moyenne) | S3-(2) + décision D1 |
| **R5 sécurité org (haute)** | **S2 + ND1** |
| **R6 branches non poussées (haute)** | **S1 + P2 ; maintenance bundle & règle push ≤ 24 h (H3-(3))** |
| R7 clé anon (faible, runtime à confirmer) | S3-(3) |
| R8 pollution cockpit (moyenne) | S3-(1) + P3 |
| R9 PR #91 tranchée / board périmé | H0 |
| R10 dette de découpage OP-33 (moyenne) | H1 + ND3 |
| **N1 runner self-hosted sur le Mac (haute)** | **S2 + ND2** |
| **N2 collision 10 migrations (haute)** | **V1-(1) + ND4 (+ gate `otakugo.supabase_staging_push`)** |
| N3 board désynchronisé (moyenne) | H0 |
| N4 non-commité vieillissant (moyenne) | S1-(2) (diff DEC-024/025) + S3-(7) (OP-29.md, types) |
| N5 worktrees orphelins (faible) | S3-(5) |
| N6 `.claude/` 3,3 Go + inbox copie unique (moyenne) | S3-(7) |
| N7 fichiers > 800 lignes (faible) | V1-(5) (réconciliation #110 / exemptions legacy) |
| N8 traduction FR en panne (faible) | S3-(2) |
| N9 course équipe vs local (moyenne) | S1 (push vite) + rebase différé à la promotion dev→main (V1/R21-b) + V1-(5) (file PR) |
| N10 lake copie unique (moyenne) | S1-(4) + R24 |
| N11 secrets : rien trouvé · N12-tests : rien trouvé | — (sain) |
| N12 e-mail dans archives (faible) | S3-(6) + ND7 |
| N13 b516e77 orphelin (faible) | S3-(4) + ND6 |
| N14 4 fichiers non commités checkout principal (moyenne) | S1-(2) (paire color_extractor) + V1-(5) (paire guard vs #110) |

**Travaux en vol A1 à risque ≥ 4 → destination** : OP-31 (5) · OP-32 (5) · OP-30-attr + M200 (5) · page Recommandation (5) → **S1-(1)** puis H2 (et la page Reco : PR à ouvrir en V1, décision produit d'activation à ce moment-là) ; diff DEC-024/025 (5) → **S1-(2) + décision R9** ; revue 3 étages PR #91 (4) → **S1-(1)** (mémoire de review, poussée avec le reste) ; HTML d'arbitrage crossover (4) → **S1-(2)**. (Pour mémoire : OP-33 et spec v4, risque 2 car bundlées, sont aussi dans S1-(1).)

**Cartes A2 (13) → destination** : C1, C3, C4, C9, C10 → **M2** (noyau, ND5-b) ; C2, C5, C6, C7, C12, C13 → **M3** ; C8 → **M3**, liée à l'activation autopilot Phase 6 ; C11 → **M3**, livrée avant le premier merge OtakuGO piloté par le worker (couplage P5↔C11). Les 13 passent par la décision **ND5** avant toute création de fichier backlog.

## Prochaine étape recommandée (une seule, explicite)

**Exécuter S1 maintenant — toi seul, ≈ 10 minutes** : dans `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP`, pousser les 7 branches en une commande —
`git push origin claude/op-33-fiche-oeuvre-recherche claude/op-31-representant-carte-71900a claude/op-32-eres-narratives-f4a8e6 claude/op-30-attribution-listings claude/reco-page-implementation claude/pr91-revue-archi-grille claude/branch-structure-data-0354f5`
— puis copier les 2 bundles de `OtakuGO_UP-archives/git-bundles-2026-08-12/` sur un support externe. À partir de cet instant, plus aucun travail commité ne dépend de ce disque, et tout le reste du plan (S2, S3, H0…) peut s'enchaîner sans courir.
