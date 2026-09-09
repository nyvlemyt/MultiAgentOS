# Backlog MAOS — plan de travail priorisé

> Généré par l'audit d'orchestration du 2026-08-25 (Phase 2). Ce fichier est la **source de
> vérité des priorités** ; le détail de chaque carte vit dans `docs/backlog/<fiche>.md`.
> Règle de priorité (mandat) : **(1)** finaliser l'inachevé des dernières sessions,
> **(2)** mémoire centralisée, **(3)** le reste.
>
> Tailles : **S** ≤ 2 h · **M** ≈ ½ à 1 jour · **L** = plusieurs sessions.
> Gate de sortie par item de code : 5 checks (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

## P0 — Finaliser l'inachevé des dernières sessions (9–17 août)

| ID | Item (une ligne) | Taille | Dépend de | Où / source |
|----|------------------|--------|-----------|-------------|
| P0-1 | Réconcilier `brique-1` avec origin : pull `#68` (provenance portable) + push `9812c63` | S | — | repo principal ; divergence 1/1 constatée à l'audit |
| P0-2 | Finir l'option B alertes : compléter `alerts.test.ts` (âge des validations : fait absent, 20 min → warning, 3 h → danger, la plus ancienne gagne, seuil injectable), 4 checks locaux, décision consignée dans la carte, commit | M | — | worktree `maos-statut-verite`, 6 fichiers en vol (session `598447a3`) |
| P0-3 | Rebaser `phase9/statut-verite-alertes` sur `main` (#65 explain-diff, #66 garde 800 lignes) + re-vérifier Sonar sur le nouveau sha | S | P0-2 | worktree `maos-statut-verite` |
| P0-4 | Sortir la PR #69 du draft → merge (clic Melvyn) — débloque C3 | S | P0-3 | GitHub PR #69 |
| P0-5 | Committer la dette docs de `brique-1` : 6 cartes backlog, dossier d'intake A2, audits OtakuGO, `.claude/launch.json` (hors fiches `resource-*`, voir P1-2) | S | P0-1 | repo principal, 389 fichiers non trackés depuis le 14/08 |
| P0-6 | Trier les 3 worktrees porteurs de travail non committé (`heuristic-curie` seed-roster, `distracted-kare` coverage-gate, `determined-solomon` scripts mobile) : finir ou jeter, décision par worktree | S | — | `.claude/worktrees/` |
| P0-7 | Clore l'incident `joshua-trustabl` : blocage GitHub (`gh auth refresh -s user` puis blocage) + signalement spam (texte déjà rédigé) | S | — | session `c76938c5` |

## P1 — Mémoire centralisée (chantier Knowledge OS, ADR 0008)

| ID | Item (une ligne) | Taille | Dépend de | Où / source |
|----|------------------|--------|-----------|-------------|
| P1-1 | Rapport d'état `docs/MEMOIRE-CENTRALISEE-ETAT.md` (Phase 4 du mandat) — spec d'intégration pour l'app de notes externe | S | P0-1 | matière déjà collectée à l'audit |
| P1-2 | Trier les 379 fiches distillées non commitées : décision sur les 281 dégénérées (`resource-cand-<uuid>…`) — re-distiller avec titre hérité du manifeste parent, ou rejeter — puis committer le corpus sain | L | P0-1, décision Melvyn | `docs/knowledge/` |
| P1-3 | Réparer le pont de persistance `writeKnowledge` : commentaire `<!-- source -->` placé APRÈS le frontmatter (il le rend illisible), suffixe `.md.md` corrigé | S | — | `packages/memory/src/registers.ts:178-189` |
| P1-4 | Ré-indexer la connaissance : `pnpm mem:seed` + `qmd update` + `qmd embed` (l'index est gelé au 22/06 : 21 fiches vues sur 396) + enregistrer `mas-resources` dans `.qmd/index.yml` | S | P1-2, P1-3 | `scripts/qmd-setup.sh` |
| P1-5 | Hook post-distillation : toute distillation déclenche seed + réindexation (plus jamais de corpus invisible) | M | P1-4 | `packages/memory/src/conveyor/distill-cli.ts` |
| P1-6 | Brancher la promotion `distilled → audited → active` : appelant réel pour `applySupersede`/`markSuperseded` + juge qualité (Opus @ promotion, `quality_score`) — le code est écrit et testé, zéro appelant aujourd'hui | L | P1-2 | `packages/memory/src/conveyor/supersede-apply.ts` |
| P1-7 | Réparations données candidats : `createdAt` (corrompu, affiche 1970), `source_kind` renseigné par le conveyor (le filtre du Memory Center est mort — NULL sur 408 lignes), `part_of`/`order` propagés à la distillation (structure parent/enfant perdue : 379 × `part_of: null`) | M | P0-1 | `pipeline.ts`, `distill-cli.ts:64-71`, `apps/web/app/(cockpit)/memory/page.tsx:27` |
| P1-8 | Premier contenu réel des 5 registres : promouvoir les 51 candidats déjà classés (43 learnings, 7 blockers, 1 eval) via le Memory Center — aucun registre n'a jamais été écrit | S | — | `data/mas.db` `memory_candidates`, UI `/memory` |
| P1-9 | Nettoyer `data/memory/` : pollution Obsidian (`.obsidian/`, `Sans titre*`, `Users/`, `otaku/`) traitée comme des projets par `projectIds()` | S | — | `packages/memory/src/registers.ts:232-237` |
| P1-10 | Brique 5 — onglet cockpit Ressources/Connaissances : Inbox (`CaptureResult` gelé), triage humain des 328 candidats en abstention, badges lifecycle/trust, panneau santé | L | P1-4 (utile), P0-4 (socle propre) | plan `2026-06-27-knowledge-os-round2.md` §Task 4 ; branche `knowledge-os/brique-5` |
| P1-11 | `mas distill --candidate <id>` : distiller depuis une ligne `memory_candidates` (supprime le maillon manuel du quai `data/sas/`) | M | P1-7 | carte `distill-from-db-candidate.md` |
| P1-12 | Capture Sorbonne S1–S3 (USB à brancher) puis re-distillation du quai restant | S (opération) | matériel + P1-5 | carte `knowledge-os-reste-a-faire.md` §2 |
| P1-13 | Merge `brique-1` → `main` d'un bloc (fin du chantier Knowledge OS) | M | P1-2, P1-10, P1-12 | carte `knowledge-os-reste-a-faire.md` §4 |
| P1-14 | Retrieval : isoler les fiches de cours du savoir produit (le golden `sem-token-cost` régresse — les 283 fiches de cours noient les requêtes d'ingénierie ; décision : collection/lane dédiée vs scope projet) | M · décision Melvyn | P1-2 fait | constat S2 2026-08-27, `mem:eval` 10/11 |

## P2 — Le reste

### Phase 9 — cartes OtakuGO (ordre imposé par l'intake du 2026-08-14)

| ID | Item | Taille | Dépend de | Fiche |
|----|------|--------|-----------|-------|
| P2-1 | C3 — contrat de rapport de mission + `reports.verdict` (débranche le `reportVerdict: null` et remplit le SEAM de `mission-report.ts`) | M | P0-4 | `contrat-rapport-mission.md` |
| P2-2 | C10 — `tasks.nextAction` + reprise universelle (bouton « Reprendre ») | M | P2-1 | `reprise-universelle-next-action.md` |
| P2-3 | C9 — panneau « écritures externes en attente » + portique CI anti-commit externe | M | P2-1 | `ecritures-externes-a-committer.md` |
| P2-4 | C4 — exporteur de prompt à coller (lancement / reprise), dérivé du vrai builder du worker | M | P2-1, P2-2 | `prompt-a-coller-par-mission.md` |
| P2-5 | C8 — rapport « ☀️ réveil » : 5 sections sur le daily report existant (habillage, pas construction) | M | P2-1 | `rapport-reveil-autopilot.md` |
| P2-6 | C11 — vérification indépendante ternaire (mode du skill mas-reviewer) — **verrou avant tout merge externe piloté par le worker** | M | P2-1 | `verification-independante-ternaire.md` |
| P2-7 | C5+C13 — `nature` + `escalateWhen` sur `PlannerTask`, routage `max(risque, nature)` (un arbitrage `risk:low` ne part plus sur haiku) | M | P2-1 | `contrat-tache-nature-escalate.md` |
| P2-8 | ROADMAP Étape 1 — couche live simple : chat branché sur le vrai LLM + vrai pipeline (remplace `*-script.ts`) | L | noyau lot 1 | `ROADMAP.md` Phase 9 |

### Dette technique & gouvernance

| ID | Item | Taille | Dépend de | Source |
|----|------|--------|-----------|--------|
| P2-9 | Split `dispatch.ts` (821 lignes > cap 800 — le garde #66 arrive avec P0-3) | M | P0-3 | audit code |
| P2-10 | Promouvoir la couverture en 6ᵉ check (worktree `distracted-kare` déjà en cours) | M | P0-6 | `test-coverage-measurement-gap.md` |
| P2-11 | Persistance de l'état de quota du `RouterLLMClient` (perdu au restart) | S | — | `router-window-state-persistence.md` |
| P2-12 | Drift doc quota fenêtre 5 h vs schéma `budgets` réel | S | — | `quota-window-doc-schema-drift.md` |
| P2-13 | `.env.example` absent (variables attendues documentées nulle part) | S | — | audit code |
| P2-14 | Resynchroniser ROADMAP + `docs/backlog/README.md` + journal (chantier Knowledge OS et cartes A2 absents ; journal arrêté fin juin) | S | Phase 5 du mandat | audit docs |
| P2-15 | Renommage résiduel `docs/claude doc/` (espace) + noms `docs/resources/` hors charte (espaces, emoji) — attention : des `source_key` sont déjà mintés | S | décision Melvyn | `STRUCTURE.md` §6 |

### Décisions en attente (hors code MAOS — rappels)

| ID | Décision | Contexte |
|----|----------|----------|
| D-1 | find_location_Paris : merger la PR #4 ? paliers de légende (une décimale ou fusion) ? suppression de `node_modules.backup-frontend` (393 Mo) ? | session `be53b988` |
| D-2 | OtakuGO : R24 destination des copies hors disque · ND1/ND2 2FA + admin unique + isoler le runner CI · ND8 enregistrer OtakuGO dans MAOS (`manual`, 150 k/mission) | audit A4, 16 décisions ouvertes |
| D-3 | Cartes C6/C2/C7 : volontairement sans fiche jusqu'à leur déclencheur (re-audit 2026-10-13 au plus tard) | intake 2026-08-14 |
