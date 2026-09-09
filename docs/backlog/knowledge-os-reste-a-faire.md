# Knowledge OS — reste à faire après les briques d'ingestion (audit 2026-07-10)

> **Carte de reprise pour une nouvelle session.** Audit croisé des 6 debriefs de sessions
> (compte Claude secondaire, machine macOS) contre l'historique git de `knowledge-os/brique-1`.
> Tout le code annoncé est vérifié livré ; il reste 4 actions, listées ici avec le contexte
> complet pour démarrer sans ré-enquêter.

## État vérifié (2026-07-10)

Mergé sur `brique-1` (vérifié dans `git log`, pas sur parole) :

| PR | Livrable | Commit |
|----|----------|--------|
| #57 | Dashboard workflow + CLAUDE §14.7 | `fd68ba4` (aussi sur `main`) |
| #58 | Fix YouTube 429 — une seule piste de sous-titres | `af61183` |
| #59 | `mem:doctor` sonde les binaires de capture (python/markitdown/pdftotext/yt-dlp) | `2988e91` |
| #60 | Extracteurs docx/pptx via markitdown | `a94058d` |
| #61 | Étage distillation — SAS doc → fiche distillée | `e664e3b` |
| #62 | Garde-fou anti-doublons dans `captureCandidates` (le « demi-travail » du debrief 4 a bien été terminé) | `0c51808` |

Le tapis roulant d'ingestion (Brique 6) est **complet et rejouable**. `brique-1` n'est pas encore mergée dans `main` (voulu — voir tâche 4).

## Tâches restantes (dans l'ordre)

### 1. Fichier `.url` du dashboard + règle de reprise — ✅ FAIT (2026-07-13)

Livré depuis la machine macOS (commit `286498e`) : `docs/resources/dashboards/ingestion-cours.url`
+ règle de reprise dans `docs/workflows/dashboard-visuel-de-suivi.md`. Réconcilié avec le
poste Windows dans le merge `d50eb7f`.

### 2. Capture de masse S1→S7 + première distillation — MACHINE macOS UNIQUEMENT — ⏳ EN COURS

`data/` est local par machine ; la capture vit sur la machine macOS (USB Sorbonne monté,
python 3.14 rebuildé, markitdown installé). Invérifiable depuis le poste Windows.

État 2026-07-13 (session macOS) :

- **EFREI ✅** : 373 documents avalés, 35 doublons refusés par le portier (#62 vérifié en
  live), 23 échecs visibles avec motif (PDF scannés `ocr_empty`, faux .docx). 379 candidats
  en attente au SAS. ~25 min, rejouable.
- **Sorbonne S1-S3 ⏸** : USB pas branché — rejouable dès qu'il l'est.
- **Distillation ⛔ bug réel** : la 1ʳᵉ distillation échoue — le modèle renvoie des objets
  JSON là où le schéma exige des strings markdown, et le CLI avale le motif d'échec.
  Fix TDD en cours sur `knowledge-os/distill-robustesse` (**poussée sur origin le
  2026-07-13**, commit `10d91cd`) : 4 tests RED commités (coercition array/objet→markdown
  + motifs visibles, re-confirmés 4 failed / 25 passed avant commit).
  Reste : GREEN, gate 5/5, PR base `brique-1`. Puis re-distiller le quai + dashboard v6.
- Le portier anti-doublons (#62) rend la capture **rejouable** : relancer ne crée pas de doublons.

### 3. Brique 5 — onglet cockpit Ressources/Connaissances — PAS COMMENCÉE

Dernière brique du chantier. Aucune trace dans `apps/web`.

- Sous-plan : `docs/superpowers/plans/2026-06-27-knowledge-os-round2.md` §Task 4 (ligne ~555),
  à étendre en plan propre à son tour.
- La forme de données que l'Inbox rend est déjà figée : `CaptureResult` dans
  `packages/memory/src/capture.ts` (commentaire ligne 44).
- Session dédiée, **worktree basé `brique-1`**, branche d'incrément `knowledge-os/brique-5`,
  PR base `brique-1`, gate 5/5 (§7).

### 4. Merge `brique-1` → `main` d'un bloc

Après validation de la capture de masse (tâche 2) et livraison de la Brique 5 (tâche 3).
`brique-1` = branche d'intégration du chantier Living Knowledge OS (ADR 0008) ; elle rejoint
`main` en un bloc cohérent, pas au fil de l'eau.

## Répartition deux machines (2026-07-13)

Le chantier tourne désormais sur deux postes ; le partage suit ce que chaque machine
possède physiquement (`data/`, USB, `gh`, branches locales) :

| Poste | Prend | Pourquoi |
|-------|-------|----------|
| **macOS (compte secondaire)** | Fix `distill-robustesse` (GREEN + 5/5 + PR) → re-distillation du quai → dashboard v6 → capture Sorbonne (USB) → Brique 5 cockpit | La branche du fix, le `data/` peuplé (373 docs EFREI), l'USB et `gh` sont là-bas |
| **Windows (ce compte)** | File d'intake visual-effects (7 audits, pure docs) · préparation des documents/specs à transmettre · réconciliations git | Travail 100 % docs, aucune dépendance à `data/` ni à `gh` |

Point de synchro : tout passe par `origin/knowledge-os/brique-1` — **chaque session pousse
avant de se terminer** (voir discipline ci-dessous).

## Rappels de discipline (pièges vécus)

- **Pousser avant de fermer une session** — le commit `83fe731` (poste Windows) n'avait
  jamais été poussé ; la session macOS a dû reconstruire le fichier de mémoire, puis un
  merge de réconciliation (`d50eb7f`) a été nécessaire. En multi-machine, un commit local
  non poussé n'existe pas pour les autres. Même règle pour les branches d'incrément
  (`distill-robustesse` corrigée : poussée sur origin le 2026-07-13).
- Jamais coder directement sur `main` ni `brique-1` — toujours une branche d'incrément
  (`git checkout -b <nom> brique-1`), PR dans `brique-1`.
- En début de session worktree : vérifier le socle (`git log --oneline -1` doit montrer
  la tête de `brique-1`, pas `main`) — une session a dû rebaser pour l'avoir ignoré.
- `gh` n'est pas installé sur le poste Windows (opérations PR à faire depuis la machine
  qui l'a, ou l'installer).
