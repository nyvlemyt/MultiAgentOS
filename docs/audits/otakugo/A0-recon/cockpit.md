# A0 — Recon cockpit (`OtakuGO_UP-cockpit`)

> Produit le 2026-08-12 par un agent lecteur (read-only, très approfondi) depuis la session MAOS
> « pipeline d'audit OtakuGO ». Fait partie de la baseline A0 de
> `docs/audits/2026-08-12-otakugo-audit-pipeline.md`. Rapport verbatim.

Racine : `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP-cockpit`

**Fait structurant** : ce n'est pas un dépôt séparé. `.git` contient `gitdir: /Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP/.git/worktrees/cockpit` → c'est un **git worktree** du dépôt applicatif, sur la branche `data/finalize-pipeline`. Le cockpit vit donc *dans* le code produit (app Flutter + Supabase + pipeline AniList). 1857 fichiers ; 16 worktrees actifs en parallèle (`git worktree list`).

## 1. Structure (fichiers hors node_modules)

```
OtakuGO_UP-cockpit/
├── CLAUDE.md (14 ko) · AGENTS.md (14 ko, copie mot-pour-mot sauf ligne 1/3) · README.md
├── docs/ (245)
│   ├── missions/ (148)  ← LE cockpit documentaire
│   │   ├── OP-01…OP-34-<slug>.md (32 fiches opération)
│   │   ├── PROTOCOL.md · VERIFICATION.md · README.md (board) · RETOURS-MELVYN.md · missions.json
│   │   ├── _state/ (23)   OP-XX.md — état vivant
│   │   └── _reports/ (~120) OP-XX-rapport.md, VERIF-<date>-<objet>.md, OP-XX-captures/*.png
│   ├── data-model/ (7, préfixés 01_→07_) · features/ (14 + templates/) · audits/ (14)
│   ├── nouvelle-archi-ia-analyse/ (27, préfixés 00-→21-) · ai-analysis/ (11) · ai/ (3)
│   ├── superpowers/{plans,specs}/ (5, `AAAA-MM-JJ-opXX-<slug>.md`) · cockpit-notes/ (1)
├── tools/anilist-pipeline/ (129) ── reference/ = LE cockpit logiciel
│   └── reference/{server.js, lib/*.js ×19, public/{index.html,app.js,style.css,tokens.css}, test/*.test.js ×19, API.md}
├── scripts/ (20) · supabase/ (55, migrations M0xx) · tool/check_repository_hygiene.sh
├── lib/ (257, app Flutter) · android/ ios/ macos/ linux/ windows/ · presentation/ (13, pitch HTML+PDF)
└── [pollution non trackée] backups/ cache/ history.jsonl policy-limits.json projects/ sessions/ remote-settings.json
```

**Conventions de nommage** : `OP-NN-slug-en-français.md` (fiche) / `_state/OP-NN.md` / `_reports/OP-NN-rapport.md` / `_reports/VERIF-AAAA-MM-JJ-<objet>.md` / captures `avant-NN-*.png` + `apres-NN-*.png`. Branches `claude/op-XX-<slug>` ou `data/OP-XX-<slug>`. Identifiants transverses : `DEC-0NN` (décisions), `R1…R33` (retours Melvyn), `D1…D9` (décisions à trancher), vagues `A…H`, migrations `M0NN`.

## 2. Fiches

### Fiche opération — squelette (ex. `docs/missions/OP-22-reintegrer-episodes.md`, 73 l. ; forme la plus aboutie : `OP-31-representant-de-carte.md`)

```markdown
---
id: OP-22 | titre: … | modele: claude-opus-4-8 | effort: high
ou: dépôt principal (lake requis)
branche: data/OP-22-reintegrer-episodes depuis data/finalize-pipeline
dependances: [OP-20] | vague: G | domaine: data
statut: à lancer — décision D4 à trancher avant kickoff
---
# OP-22 — Réintégrer épisodes & saisons sans liens morts
| Champ | Valeur |   ← tableau Modèle / Effort / Où lancer / Déclencheur / Investigation
| Déclencheur | Melvyn, 24/07 : « on a décidé de supprimer les épisodes … mais je ne suis pas d'accord » |
## Le constat qui justifie la mission   → « 100 % Crunchyroll, 99,5 % en http://, 9,4 % d'URLs 404 »
## Objectif · ## Périmètre · ## Décision à trancher (D4)  [table Option a/b/c + risque]
## Hors périmètre   → « Le regroupement des saisons en œuvres → OP-21 »
## Risque principal · ## escalate_when
## Pipeline de production (habitude R33 — 3 étages)  [prompteur → exécutant → vérificateur]
## Prompt à coller (au lancement)
```

Le bloc « Prompt à coller » type :

```text
Lis docs/missions/PROTOCOL.md et applique-le intégralement (state file …, rapport …,
done binaire, escalade). Lis ensuite docs/missions/OP-22-….md …
Preuve exigée : compte d'épisodes produits, compte de liens rejetés par règle …
```

### Fiche rapport — sections **imposées** par `docs/missions/PROTOCOL.md` §2 (verbatim), illustrées par `_reports/OP-05-rapport.md` (81 l.)

```markdown
# OP-XX — rapport
**TL;DR (2 lignes max)** : Contrat app ↔ catalogue livré (…) ; 3 questions ouvertes non bloquantes.
## Verdict            → PASS | NEEDS_WORK | BLOCK (binaire, pas de score flou)
## Périmètre couvert / non couvert   → « Aucune requête exécutée contre staging (mission design-only) »
## Décisions prises   [table : décision | justification | réversible ?]
## Fichiers touchés   [chemins exacts]
## Vérifications      [commande exacte + sortie collée] → « status: media.status || null, »
## Contradictions & risques détectés (même hors périmètre)
## Questions ouvertes pour Melvyn   → « Q3 — seuil "anime connu" (50 000) : valider par … »
## Prochaine étape recommandée
```

Et le state file (`_state/OP-XX.md`) : `## Board` (table `# | Tâche | Statut | Preuve`), `## Log chronologique` (« PROCHAINE ACTION SUR REPRISE : … »), `## Reprise` (prompt).

## 3. Suivi des missions — statut **calculé**, jamais tapé

Triple support : `docs/missions/README.md` (board humain, table `ID | Mission | Modèle | Effort | Où | Dépend de | Statut` + graphe **mermaid** des vagues), `missions.json` (14 ko, schéma `{id, fichier, titre, modele, effort, ou, dependances[], vague, statut, domaine}`), et le cockpit web.

PROTOCOL.md §2 : « **Le statut d'une mission ne s'édite plus jamais à la main.** Il est CALCULÉ par le cockpit (`tools/anilist-pipeline/reference/lib/truth.js`, OP-14) à partir des FAITS : le board du state file le plus frais (toutes branches confondues, lu via `git show`), le verdict du rapport, et l'état de merge. Le champ `statut` de `missions.json` n'est plus qu'un "déclaré" historique ; s'il diverge, le cockpit affiche un badge "désynchronisé". »

Machine à états (`truth.js` `computeStatus`, ordre strict) : verdict NEEDS_WORK/BLOCK → `ATTENTION` ; tâche BLOCKED → `BLOQUÉE` ; PASS+merged → `LIVRÉE` ; PASS seul → `PASS—MERGE EN ATTENTE` ; board non vide → `EN COURS` ; branche seule → `LANCÉE` ; sinon `À LANCER`. Statuts de tâche autorisés : `TODO → DOING → DONE(verdict)` ou `BLOCKED`.

## 4. Zones data & documents

- **`data/`** : vide ici (0 fichier) — le data lake AniList (~3,5 Go, gitignoré) vit dans le dépôt principal ; d'où la règle « une seule mission "dépôt principal" à la fois ».
- **Documents** : `docs/` = 203 `.md`. Zones typées — `data-model/` (dictionnaire, modèle cible, audits datés), `features/` (1 fiche par feature + `FEATURE_INDEX.md` + `templates/FEATURE_TEMPLATE.md` à 18 sections dont `Current Progress` / `Next Step For AI`), `audits/anilist_codex_audit/` (audit croisé Codex↔Claude : `PROMPT_FOR_CLAUDE.md`, `CLAUDE_HANDOFF.md`), `nouvelle-archi-ia-analyse/` (00→21 + `ai-handoff-template.md`), `superpowers/{plans,specs}`. Le cockpit indexe ces docs (`/api/ressources`, `/api/doc`) et les rend éditables (« Notion interne »).

## 5. Tech

Serveur **Node natif** `tools/anilist-pipeline/reference/server.js` (1484 l., port 4400/4401) + SPA **vanilla JS** `public/app.js` (4481 l.), `style.css` (1079 l.) et `tokens.css` (design tokens). Aucun framework, aucun build. 19 modules `lib/` (truth, missions, writes, alerts, staging, media360, omni, gitinfo, pushplan…) chacun doublé d'un `test/*.test.js` (246 tests). API documentée pour les agents : `reference/API.md` — « ce que Melvyn voit à l'écran, un agent le lit ici ». Écritures git-tracked jamais auto-commitées (bandeau « à committer », `/api/writes/pending`).

Automatisation : `.github/workflows/nightly-data.yml` (pipeline nocturne, **non armé** : `workflow_dispatch` seul, dry-run par défaut, garde-fou anti-prod codé en dur, lake sur Cloudflare R2), `tool/check_repository_hygiene.sh`, `CLAUDE.md`+`AGENTS.md` jumeaux (26 sections : archi feature-first, RLS, anti-spoiler, Definition of Done). **Aucun dossier `.claude/` ici** (il est dans le dépôt principal, avec `.claude/inbox/` et `.claude/worktrees/`).

## 6. Récence & état

| Date | Fichier |
|---|---|
| 2026-08-10 00:28 | `docs/missions/OP-34-recherche-personnalisee.md` · `docs/missions/missions.json` |
| 00:27 / 00:26 / 00:25 | `OP-33-fiche-oeuvre-recherche-app.md` · `OP-32-eres-narratives.md` · `OP-31-representant-de-carte.md` + `RETOURS-MELVYN.md` |
| 2026-08-10 00:06 | `tool/check_repository_hygiene.sh` · `supabase/MIGRATION_LOG.md` · `_state/OP-24.md` · `_reports/OP-24-rapport.md` · `_reports/VERIF-2026-08-09-OP24.md` |
| 2026-08-09 21:10 | `tools/anilist-pipeline/validate/lib/validators.js` · `supabase/migrations/20260809120000_m058_episode_subjects.sql` |

Dernier commit : `b5c16fb docs(missions): vague H — retours produit du 10/08 en 4 missions (OP-31→OP-34)`.

**État d'avancement** = le board `docs/missions/README.md` + `RETOURS-MELVYN.md`. Synthèse : OP-01→OP-05, OP-10/11, OP-16→OP-18 **livrées-mergées** ; OP-06 en PR #91 draft ; OP-22/OP-24/OP-25/OP-27/OP-28/OP-29 livrées PASS (plusieurs PR draft en attente de vérification, principe R26) ; OP-07/08/09/23 **bloquées** par dépendances ; OP-15/19/20/21/26 à lancer ; OP-31→34 = vague H préparée le 10/08, non lancée. Trois blocages non-IA listés en « Actions Melvyn » : fix TCC launchd (nightly morte depuis le 13/07), infra R2 (B2), décisions D1→D9 et R9/R22/R24 en attente d'arbitrage.

## 7. Style de travail

- **Le fichier est la source de vérité** : « Melvyn pilote via les FICHIERS, jamais via la mémoire d'une session — si ce n'est pas écrit, ça n'existe pas » (PROTOCOL §1).
- **`RETOURS-MELVYN.md`** : registre R1→R33 de chaque phrase du patron, datée, avec statut (`mission`/`décision`/`livré`/`à cadrer`) et le fichier qui la porte. Créé « parce que les retours vivaient dans `.claude/inbox/` et dans l'historique de sessions Claude : invisibles pour la session suivante ».
- **Deux protocoles miroirs** : `PROTOCOL.md` (production, 10 sections : done binaire, table des rationalisations excuse→réalité, routage modèle/effort, gates data deny-by-default) et `VERIFICATION.md` (contrôle externe, 7 règles, verdict ternaire PROUVÉ/RÉFUTÉ/NON VÉRIFIABLE, gabarit de prompt à coller).
- **Prompts sauvegardés** : chaque fiche finit par un bloc « Prompt à coller » ; prompt universel de reprise « Lis PROTOCOL.md puis _state/OP-XX.md et continue à la première tâche non DONE ».
- **Habitude R33 (10/08)** : chaque mission = pipeline 3 étages *agent prompteur → agent exécutant → agent vérificateur adversarial*, orchestrateur qui ne code pas.
- **Restitution au patron** : `_reports/OP-20-passe6-REVEIL.md` — rapport « ☀️ Réveil » écrit pour une lecture au matin (« Ce que tu vas remarquer en 2 minutes », serveur laissé allumé), + captures `avant-/apres-`. Notes de décision datées et signées : `docs/cockpit-notes/decisions-op-01-b1-b4.md` (réponses via AskUserQuestion).

**Point d'hygiène** : `backups/`, `cache/`, `history.jsonl`, `policy-limits.json`, `projects/` (2 transcripts `.jsonl` de sessions), `remote-settings.json`, `sessions/` sont **non trackés** (`git status` → `??`), déposés le 09/08 18:07-18:08 — un répertoire de config Claude Code déversé par erreur à la racine du worktree.
