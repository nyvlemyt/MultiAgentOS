# Pipeline de sessions — reprise MAOS (runbook opérationnel)

> Écrit le 2026-08-31. Chaque session = un `claude` lancé **dans le repo MAOS**
> (`cd /Users/melvyn/Documents/02_PROJETS/multiAgentOS`), un sujet, une branche.
> Colle le bloc « PROMPT » tel quel. Respecte modèle / effort / worktree indiqués.

## Règles communes (rappel — valent pour toute session de code)
- **Worktree dédié** basé sur la branche indiquée (skill `using-git-worktrees`).
- **TDD** : test rouge d'abord, puis code minimal (skill `test-driven-development`).
- **5 checks verts** avant de finir : `pnpm -r test` · `pnpm lint` · `pnpm build` ·
  `pnpm --filter @mas/web smoke` · Sonar (`scripts/sonar-pr-issues.sh <pr>` exit 0,
  après pose de l'analyse du bon sha).
- **PR en draft**, base indiquée, **merge = Melvyn**.
- **Commits sans aucun footer** (pas de `Co-Authored-By`, pas d'e-mail). PR sans e-mail.
- **Pousser avant de fermer** la session.

## Carte des dépendances (ordre & parallélisation)

```
[0] Housekeeping (merges #71/#72 + rebase)  ← FAIRE EN PREMIER, court
        │
        ├──► TRACK MÉMOIRE (séquentiel sur brique-1, packages/memory)
        │      [A] Promotion distilled→active + 51 candidats
        │      [B] Nettoyages données (createdAt, source_kind, Obsidian, hook reseed)
        │      [C] Brique 5 — onglet cockpit  (apps/web → parallélisable avec A/B)
        │      [E] Merge brique-1 → main       ← APRÈS A,B,C
        │
        ├──► TRACK DESIGN (docs seuls, démarrable tout de suite, en parallèle)
        │      [D] Mémoire v2 : intake Graphify + mesure gap QMD + ADR  (AUCUN code)
        │
        └──► TRACK EXPLOITATION (branches basées MAIN, parallèle total)
               [X1] C3 rapport de mission  ← débloque les suivantes
               [X2] C10 reprise · [X3] C9 écritures · [X4] C4 prompt
               [X5] C8 réveil · [X6] C11 vérif ternaire · [X7] C5+C13 routage
```

Règle d'or : **tout ce qui touche `packages/memory` reste séquentiel sur `brique-1`** ;
les cartes C-x vivent sur des branches **basées `main`** et n'entrent jamais en conflit.

## Tableau récap

| # | Sujet | Base | Worktree | Modèle | Effort | Dépend de |
|---|-------|------|----------|--------|--------|-----------|
| 0 | Housekeeping | brique-1 | non | Sonnet | low | — |
| A | Promotion mémoire (P1-6+P1-8) | brique-1 | oui | **Opus** | **high** | 0 |
| B | Nettoyages données (P1-7/9/5) | brique-1 | oui | Sonnet | medium | 0 |
| C | Brique 5 cockpit (P1-10) | brique-1 | oui | **Opus** | high | 0 |
| D | Mémoire v2 design (ADR) | brique-1 (docs) | non | **Opus** | **max** | — |
| E | Merge brique-1 → main (P1-13) | main | non | Sonnet | low | A,B,C |
| X1 | C3 rapport mission | main | oui | Opus | high | E (ou brique-1 mergé) |
| X2 | C10 reprise nextAction | main | oui | Opus | medium | X1 |
| X3 | C9 écritures externes | main | oui | Opus | medium | X1 |
| X4 | C4 prompt à coller | main | oui | Opus | medium | X1,X2 |
| X5 | C8 rapport réveil | main | oui | Sonnet | medium | X1 |
| X6 | C11 vérif ternaire | main | oui | Opus | high | X1 |
| X7 | C5+C13 routage par nature | main | oui | Opus | high | X1 |

---

## [0] Housekeeping — PROMPT
> Modèle Sonnet · effort low · pas de worktree · branche `knowledge-os/brique-1`.

```
Housekeeping de reprise. 1) Vérifie l'état des PR #70 #71 #72 (gh pr view) : lesquelles
sont mergées dans knowledge-os/brique-1 ? 2) Mets brique-1 à jour (git pull --ff-only) et
confirme que le corpus (docs/knowledge), le pont miroir réparé, la collection études et le
fix scope global sont bien présents. 3) Lance mem:eval → doit afficher 12/12 backend qmd ;
sinon rejoue mem:seed + qmd update + qmd embed et rediagnostique. 4) Fais le point sur les
worktrees restants (git worktree list) et les 3 branches héritées à finir/jeter
(heuristic-curie=seed-roster, distracted-kare=coverage-gate, determined-solomon=mobile) :
dis-moi pour chacune finir ou supprimer, ne tranche pas seul. Rapport visuel court à la fin.
```

## [A] Promotion distilled→active + 51 candidats — PROMPT
> Modèle **Opus** · effort **high** · worktree basé `brique-1` · branche `knowledge-os/promotion` · PR base brique-1.

```
Chantier mémoire S3b : brancher la PROMOTION des fiches. Aujourd'hui distilled→audited→active
n'a AUCUN appelant : applySupersede/markSuperseded (packages/memory/src/conveyor/supersede-apply.ts)
sont écrits+testés mais jamais invoqués, et 379 fiches sont figées en 'distilled'. En TDD :
1) un juge qualité (Opus @ promotion, ADR 0008 clause 11) qui note une fiche distillée en
   ReviewerVerdict (PASS/NEEDS_WORK/BLOCK) → remplit quality_score, et sur PASS promeut
   distilled→audited→active via la machine à états (fiche.ts isLegalTransition) ;
2) quand une fiche active partage le source_key d'une entrante, applique le supersede en
   attente (archive-never-delete, jamais de unlink) et trace au consolidation-log ;
3) une commande CLI `mas promote` (--all ou par id) sur le même modèle d'injection LLM que
   distill (claudeCodeLLM, §11). Puis P1-8 : promeus les 51 candidats déjà classés en base
   (43 learnings, 7 blockers, 1 eval) vers les 5 registres via le Memory Center / promoteCandidate,
   pour créer les PREMIERS registres réels (data/memory/*/decisions.md etc. sont vides aujourd'hui).
Après promotion : rejoue seed+qmd et vérifie qu'une fiche promue migre du miroir études vers la
mémoire mission (le routage seed est par cycle de vie). Respecte les règles communes du runbook.
```

## [B] Nettoyages données mémoire — PROMPT
> Modèle Sonnet · effort medium · worktree basé `brique-1` · branche `knowledge-os/memory-cleanups` · PR base brique-1.

```
Nettoyages de données mémoire (P1-7, P1-9, P1-5), en TDD, chacun isolé :
1) P1-7 : la colonne memory_candidates.createdAt est corrompue (affiche 1970 — mélange
   secondes/millisecondes) ; corrige l'écriture ET fournis une migration/backfill. Renseigne
   aussi source_kind à la capture (aujourd'hui NULL sur 408 lignes → le filtre du Memory Center
   apps/web/.../memory/page.tsx:27 est mort).
2) P1-9 : data/memory/ est pollué par Obsidian (.obsidian/, "Sans titre", Users/, otaku/) que
   projectIds() (registers.ts) prend pour des projets ; ajoute un garde-fou (allowlist de sous-
   dossiers projet valides) + nettoie le dossier.
3) P1-5 : ajoute un hook post-distillation/post-écriture — toute fiche écrite déclenche mem:seed
   + qmd update (plus jamais de corpus invisible, cf. le trou de juin). Rends-le idempotent.
Règles communes du runbook. NE touche pas au code de promotion (chantier A, branche séparée).
```

## [C] Brique 5 — onglet cockpit Ressources/Connaissances — PROMPT
> Modèle **Opus** · effort high · worktree basé `brique-1` · branche `knowledge-os/brique-5` · PR base brique-1.

```
Construis la Brique 5 : l'onglet cockpit Ressources/Connaissances (apps/web). Lis d'abord
docs/superpowers/plans/2026-06-27-knowledge-os-round2.md §Task 4 (les 6 surfaces attendues) et
le contrat de données GELÉ CaptureResult (packages/memory/src/capture.ts:45). Surfaces : (1)
Inbox d'ingestion avec les 5 gates + voie dead-letter capture_failed + compteur de dette de
revue ; (2) visionneuse de dossier d'intake + revue de la décision classifieur ; (3) promotion
cold→hot explicite ; (4) badges par ressource (provenance/derived_from/lifecycle/trust/fraîcheur/
next_audit) ; (5) navigation par lane/doc_type/matière(part_of)/tag ; (6) panneau santé (diffs de
consolidation proposés + recall@k du golden set + santé collections QMD). Lit de VRAIES lignes
(aucune divergence fixture/seed). Utilise le skill frontend-design : ≥4 qualités de design
intentionnelles (hiérarchie, rythme, profondeur, hover/focus dessinés), jamais du Tailwind/shadcn
brut (§7 anti-template). smoke couvre la nouvelle route. Règles communes du runbook.
```

## [D] Mémoire v2 — design (Graphify + fiches vivantes) — PROMPT
> Modèle **Opus** · effort **max** · pas de worktree (docs) · branche `knowledge-os/brique-1` ou branche docs dédiée. **AUCUN code de prod.**

```
Session de DESIGN (aucun code de prod) pour la mémoire v2. Lis d'abord
docs/backlog/memoire-v2-comprehension-graphify.md (la vision de Melvyn). Produis :
1) Un intake-audit (skill intake-audit) de "Graphify" — identifie précisément l'outil/la
   bibliothèque, ce qu'il stockerait (fiches + relations part_of/derived_from/notions), où il
   vivrait (packages/graph ? à côté de QMD ?), coûts, KILL criteria, décision enum.
2) Une MESURE du vrai gap de retrieval QMD sur notre corpus : reproduis pourquoi un cours capte
   une requête d'ingénierie (embeddings vs chunking vs structure de fiche), chiffres à l'appui.
   Conclus : le levier est-il le ranking, le découpage, ou la structure des fiches ?
3) Un ADR "mémoire v2 : graphe + fiches vivantes" tranchant : (a) révision de P1-14 (accès
   sélectif aux cours plutôt qu'isolation dure) ; (b) fiches vivantes — déclencheur de
   recomposition, budget tokens, granularité d'une notion, insertion d'un complément/contre-
   exemple à sa place logique ; (c) rôle du graphe vs QMD. 
4) Un découpage en incréments TDD (backlog) prêt à exécuter en sessions suivantes.
Pose-moi les questions ouvertes AVANT de figer l'ADR. Ne code rien — c'est de la conception.
```

## [E] Merge brique-1 → main — PROMPT
> Modèle Sonnet · effort low · pas de worktree · sur `main` (ou PR brique-1→main).

```
Clôture du chantier Knowledge OS : merge knowledge-os/brique-1 dans main d'un bloc (ADR 0008).
Vérifie d'abord que A (promotion), B (nettoyages), C (Brique 5) sont mergés dans brique-1 et que
les 5 checks + Sonar sont verts sur brique-1 à jour. Ouvre la PR brique-1→main (draft), boucle
Sonar, et laisse Melvyn merger. Mets à jour ROADMAP.md, docs/backlog/README.md et le dashboard
docs/resources/dashboards/etat-maos-2026-08-25.html (chantier mémoire = terminé). Règles communes.
```

## [X1] C3 — contrat de rapport de mission — PROMPT
> Modèle Opus · effort high · worktree basé **main** · branche `feat/c3-rapport-mission` · PR base main.

```
Livre la carte C3 (docs/backlog/contrat-rapport-mission.md). Remplace le SEAM mock de
apps/web/lib/mission-report.ts:27 par le vrai agrégateur (LLM grounded sur les task reports +
skills), ajoute reports.verdict en base (migration), et branche le générateur de rapport
structuré. C'est la carte pivot : C10, C9, C4, C8, C11 en dépendent. TDD, règles communes du
runbook, PR base main.
```

## [X2–X7] Cartes exploitation restantes
> Toutes : worktree basé **main**, PR base main, TDD, règles communes. Une carte = une session = une branche `feat/<carte>`.

- **X2 · C10 reprise** (Opus, medium) : `docs/backlog/reprise-universelle-next-action.md` — colonne `tasks.nextAction` écrite à chaque tick + bouton « Reprendre ». Dépend de X1.
- **X3 · C9 écritures externes** (Opus, medium) : `docs/backlog/ecritures-externes-a-committer.md` — panneau diffs en attente + portique CI anti-commit externe. Dépend de X1.
- **X4 · C4 prompt à coller** (Opus, medium) : `docs/backlog/prompt-a-coller-par-mission.md` — exporteur de prompt lancement/reprise dérivé du vrai builder du worker. Dépend de X1,X2.
- **X5 · C8 rapport réveil** (Sonnet, medium) : `docs/backlog/rapport-reveil-autopilot.md` — 5 sections sur le daily report existant (habillage). Dépend de X1.
- **X6 · C11 vérif ternaire** (Opus, high) : `docs/backlog/verification-independante-ternaire.md` — mode re-exécution du skill mas-reviewer. VERROU avant tout merge d'un projet externe piloté par le worker. Dépend de X1.
- **X7 · C5+C13 routage** (Opus, high) : `docs/backlog/contrat-tache-nature-escalate.md` — `nature` + `escalateWhen` sur PlannerTask, routage max(risque, nature). Dépend de X1.

## Conseil de cadence
Une session à la fois côté mémoire (elles partagent `packages/memory`). En parallèle tu peux
lancer D (design, docs) et une carte X (main) sans risque de collision. Ne mélange jamais deux
sujets dans une session, ni deux sessions sur le même worktree.
