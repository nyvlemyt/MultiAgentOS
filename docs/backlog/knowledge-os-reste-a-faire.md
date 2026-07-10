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

### 1. Fichier `.url` du dashboard + règle de reprise (≈5 min) — JAMAIS FAIT

Le « fix 5 minutes » promis au debrief 5 n'existe nulle part. Sans lui, les sessions
parallèles perdent le dashboard (l'URL n'est stockée que dans des mémoires par-machine).

- Créer `docs/resources/dashboards/ingestion-cours.url` contenant :
  `https://claude.ai/code/artifact/46beb401-3477-4a2b-a82a-f7ce7d477c53`
- Ajouter dans `docs/workflows/dashboard-visuel-de-suivi.md` la règle :
  *au démarrage d'une session touchant une mission à dashboard, lire le fichier `.url`
  correspondant → WebFetch de la page → calculer le delta → redéployer (même URL, via le
  paramètre `url` de l'outil Artifact) avant le rapport.*
- Commit docs direct ou micro-PR base `brique-1`.

### 2. Capture de masse S1→S7 + première distillation — MACHINE macOS UNIQUEMENT

`data/` est local par machine ; la capture vit sur la machine macOS (USB Sorbonne monté,
python 3.14 rebuildé, markitdown installé). Invérifiable depuis le poste Windows.

- Vérifier/lancer la capture des ~879 docs de cours (S1→S7 : Sorbonne S1-S3 sur USB, EFREI S5-S7 —
  280 PDF + 92 Office + 128 md réels, exclure le code étudiant / node_modules).
- Puis `mas distill --all` sur les fiches en attente au quai (5 au dernier pointage).
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

## Rappels de discipline (pièges vécus)

- Jamais coder directement sur `main` ni `brique-1` — toujours une branche d'incrément
  (`git checkout -b <nom> brique-1`), PR dans `brique-1`.
- En début de session worktree : vérifier le socle (`git log --oneline -1` doit montrer
  la tête de `brique-1`, pas `main`) — une session a dû rebaser pour l'avoir ignoré.
- `gh` n'est pas installé sur le poste Windows (opérations PR à faire depuis la machine
  qui l'a, ou l'installer).
