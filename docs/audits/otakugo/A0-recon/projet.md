# A0 — Recon projet (`OtakuGO_UP`)

> Produit le 2026-08-12 par un agent lecteur (read-only, très approfondi) depuis la session MAOS
> « pipeline d'audit OtakuGO ». Fait partie de la baseline A0 de
> `docs/audits/2026-08-12-otakugo-audit-pipeline.md`. Rapport verbatim.

`/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP`

## 1. Identité

- **Produit** : app mobile **anime**, née d'un projet étudiant BUT Info (IUT Villetaneuse) sous le nom *SwapAnime* (`README.md`, équipe de 5), **pivotée** vers un **réseau social anime communautaire** avec backend réel dès le MVP (`CLAUDE.md` §Product Direction).
- **Nom non figé** : `CLAUDE.md:27` interdit de coder en dur un nom produit dans les textes UI. Package Dart = `otakugo` (`pubspec.yaml`), repo GitHub privé `Reseau-Social-Anime/OtakuGO_UP`.
- **Stack** : Flutter/Dart (SDK ^3.9.2, Flutter 3.44.2), **Provider/ChangeNotifier**, **Supabase/Postgres** (auth, RLS, 47 migrations, RPC, vues, Edge Functions), Node.js pour le pipeline de données AniList.
- **Deux moitiés du projet** :
  1. **App** (lignée git `main`) : profils, posts, likes, commentaires, follows/amis, communautés, feed, messagerie 1-1, notifs in-app, modération, anti-spoiler, découverte (swipe/tier list/tournoi/coffre hérités).
  2. **Data** (lignée `data/finalize-pipeline`) : lake AniList **4,9 Go** (`data/`, ~5 100 fichiers), pipeline ETL `tools/anilist-pipeline/` (collect → normalize → mapping → model → validate → airing → ops nightly), vues de lecture `app_animes`, `app_anime_search`, `app_catalog_browse`, `app_swipe_deck` (migrations M035→M048).
- Environnements : staging `pxgnchlqkrgrjabxxufj`, prod `laghdgfjccakisidaway` (`config/`, `docs/ENVIRONMENTS.md`).

## 2. Structure (2 niveaux, comptes)

| Top | Contenu N2 | Volume |
|---|---|---|
| `lib/` | `core/` (11 dossiers), `features/` (17 : anime, auth, chest, communities, discovery, feed, messaging, moderation, navigation, notifications, posts, profile, relationships, tierlist, tournament, watchlist, audio), `main.dart` | 309 `.dart` |
| `docs/` | `features/` (20), `missions/` (16 + `_state`/`_reports`), `ai/` (3), `data-model/`, `decisions/`, `audits/`, `superpowers/`, `ai-analysis/`, `nouvelle-archi-ia-analyse/` + ~25 md racine | 118 `.md` |
| `supabase/` | `migrations/` (47), `functions/` (4), `schemas/`, `snapshots/`, `types/`, `audits/`, `MIGRATION_LOG.md`, `seed.sql` | 88 |
| `test/` | `unit`, `widget`, `integration`, `smoke`, `fakes`, `tool` | 80 `.dart` |
| `tools/` | `anilist-pipeline/`, `anilist-etl/` | 832 |
| `scripts/` | `anilist_import.js`, `airing_daily_update.js`, `import_external_ids.js`, `legacy/`, `staging_fixtures/` | 946 (dont node_modules) |
| `data/` | `raw`, `normalized`, `enrich`, `mapping`, `model`, `reports`, `schema`, `obsidian-vault` | 4,9 Go |
| `.claude/` | `agents`(4), `skills`(4), `commands`(3), `hooks`(1), `inbox`(5), `workflows`, **`worktrees/`(17)** | 15 570 |
| Autres | `android ios linux macos windows`, `tool/`(7 scripts de gate), `config/`, `.github/workflows`(checks.yml, discord), `presentation/`, `assets/` | — |

## 3. Historique git

- Repo git, branche courante **`feature/DEV-83-brancher-catalogue`**, HEAD `31603a2` (2026-08-09).
- `git log --oneline -25` (extraits) : `31603a2 fix(discovery): swipe deck par genre (OP-06)` · `33e6f8c docs(missions): OP-06 clôture — PR #91 draft` · `e5a4032 feat(anime): detail sheet catalogue, AniList retiré` · `59617b3 feat(discovery): swipe app_swipe_deck anti-doublon franchise` · `4543855 feat(discovery): search app_anime_search` · `84f6d51 feat(discovery): rails app_catalog_browse` · `c80ac7a feat(catalog): phase 1 app_animes` · puis DEV-54/82/81/61/62/60/72/57 (CI, git tooling, RLS, deep links) et OP-02.
- **Non commité (7)** : `M lib/core/services/color_extractor_service.dart` ; non suivis : `.claude/`, `check_anon.sh`, `config/staging.dart-defines.json`, `docs/decisions/`, `scripts/check-max-lines.sh`, `test/unit/color_extractor_service_test.dart`. Aucun stash.
- **~60 branches**, 2 lignées. Branches les plus récentes : `claude/op-33-fiche-oeuvre-recherche` (12/08), `claude/op-31-representant-carte-71900a` (11/08), `claude/op-32-eres-narratives`, `claude/op-30-attribution-listings` (10/08).

## 4. État + dernières évolutions

Pilotage par **missions OP-XX** (`docs/missions/PROTOCOL.md`, `missions.json`, `_state/`, `_reports/`), transposé de **multiAgentOS / maos-ecc**.

- **OP-06 (branchement app ↔ catalogue) livré** : rails, recherche, swipe, fiche détail lisent les vues `app_*`, appels AniList directs supprimés — PR **#91 mergée** (`docs/features/discovery.md`, `docs/missions/_reports/OP-06-rapport.md`).
- **Vague H (10/08)** = 4 missions issues de retours produit : **OP-31** représentant de carte, **OP-32** ères narratives (cas Dragon Ball), **OP-33** fiche œuvre & recherche, **OP-34** recherche personnalisée. Fiches dans les worktrees (`.claude/worktrees/fallback-account-token-limit-503ec5/docs/missions/OP-3*.md`).
- **Travail le plus récent = OP-33**, worktree `/.claude/worktrees/op-33-fiche-oeuvre-recherche-3763a4`, branche `claude/op-33-fiche-oeuvre-recherche`, tip `a3bf810` (**12/08 14:31**, la seule activité du jour). État complet : `docs/missions/_state/OP-33.md`.
- OP-33 techniquement **TERMINÉ** : 3 étages (prompteur / exécutant TDD / vérificateur adversarial), tests **371 → 439 verts**, `analyze` 0 issue, mutation testing 42/36 tuées (86 %), verdict **PASS**, 12 findings, 0 BLOCK/MAJOR. **18 commits jamais poussés** sur origin.
- Décisions UX validées par Melvyn : D1-c (section + page « Tout voir »), D2-a (chips « Par œuvre » / « Tous les médias »), D3-a (badge « N médias »), D4-a (remplacement de fiche), D5-A (zéro migration). Dédup mesurée : one piece 57→13, conan 60→6.
- **11/08** : réconciliation des chiffres data (18 012 lignes ; 4 170 groupes `work`, 2 537 univers, univers de dédup 11 874) ; erreur de jointure `anilist_id` vs `media_id` attrapée avant publication.
- **12/08 — blocage actif** : émulateur Android `otakugo_pixel` (Android 16) créé, APK `--flavor staging` construit et lancé (5 onglets confirmés, mode invité OK), **mais la clé `anon` staging manque**. `.env` ne porte qu'un `SUPABASE_SERVICE_KEY` (interdit côté client). Melvyn doit remplir `config/staging.dart-defines.json` depuis `config/examples/staging.dart-defines.example.json` — d'où `check_anon.sh` (créé 12/08 11:18) et le fichier de defines (11:20).
- Piège consigné : sans `--flavor staging`, Gradle échoue sur `:app:validateLocalDebugEnvironmentConfig` (exit 64).
- Findings ouverts hors périmètre : overflow 18 px sur l'écran de connexion à 320 dp (équipe auth) ; R6/OP-32 anti-doublon au niveau univers (884/2 537 univers multi-objets).
- En attente : review Melvyn puis **PR draft label `ia`**, à découper (règle git 7 : ~7 013 insertions ≫ 400 lignes).
- Aucun `TODO`/`FIXME` dans `lib/` (0 occurrence) — la dette est tracée en docs, pas en code.

## 5. Setup Claude

- **`CLAUDE.md` (535 l.)** et **`AGENTS.md` (~570 l., + « Teaching Mode »)** : rôle lead Flutter senior, direction produit/MVP, **8 règles git** (jamais de push sur `main`/`data/finalize-pipeline`, jamais `--force`, nommage `feature|fix|chore/DEV-XX` vs `data/OP-XX`, lignée ticket→`main` / mission→`data/finalize-pipeline`, PR **toujours draft label `ia`** avec sponsor humain, **≤400 lignes de diff**, branches exploratoires locales), architecture feature-first, flux Page→Controller→Repository→Supabase (Widget→Supabase interdit), RLS obligatoire, jamais de `service_role` en Flutter, anti-spoiler, 5 onglets de navigation, Definition of Done.
- **`.claude/agents/`** : `engineering-code-reviewer` (opus, vérifie les 8 pr-checks), `engineering-devops-automator` (CI économe, 2000 min/mois), `engineering-git-workflow-master`, `engineering-minimal-change-engineer` (diff minimal, anti scope-creep).
- **`.claude/skills/`** (portage MAOS) : `mas-mission-planner`, `mas-skill-router` (routage 3 tiers opus/sonnet/haiku), `mas-reviewer`, `mas-sec-reviewer` (gate obligatoire risk:high, grille d'audit 6 checks).
- **`.claude/commands/`** : `checkpoint.md`, `pr.md`, `update-docs.md`. **Hook `PreToolUse` Write|Edit** → `.claude/hooks/limit-file-size.sh` (plafond **800 lignes**, doublé par `scripts/check-max-lines.sh` et `docs/decisions/file-size-guard.md`).
- `.claude/inbox/` : `OP-19-draft.md`, `OP-20-mission-lisibilite-oeuvre-univers.md`, `data-model-findings.md`, `spec-v4-panel-r1-findings.json`.
- Gates repo : `tool/git_doctor.sh`, `check_coverage.sh`, `check_pull_request_body.sh`, `check_repository_hygiene.sh`, `validate_environment_config.dart`, `.githooks/pre-push`.

## 6. Liens avec le cockpit

- **`OtakuGO_UP-cockpit` est un git worktree du même dépôt**, enregistré sous `.git/worktrees/cockpit`, sur la branche **`data/finalize-pipeline`** (HEAD `b5c16fb`) — confirmé par `git worktree list`.
- Convention partagée : `docs/GIT_WORKFLOW.md:17` définit `data/finalize-pipeline` comme « lignée DATA (pipeline AniList, **cockpit**, missions) » ; `:58` indique que le **statut des missions est calculé par le cockpit** à partir de `missions.json`.
- Le code du cockpit vit côté data : `tools/anilist-pipeline/reference/{server.js, public/app.js, lib/data.js}` (cité dans `.claude/inbox/data-model-findings.md:245`) — absent de la lignée app. Traces locales : `.claude/cockpit-server.log`, worktree `.claude/worktrees/op-18-cockpit-v31`, missions OP-18/OP-20/OP-23/OP-27 (lisibilité Œuvre/Univers, compteurs 25-vs-23).
- Le projet référence explicitement **multiAgentOS** comme source du protocole de missions (`docs/missions/PROTOCOL.md:6`).
