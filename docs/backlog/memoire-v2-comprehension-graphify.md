# Mémoire v2 — compréhension active, graphe (Graphify) & retrieval intelligent

> **Statut** : VISION CAPTURÉE le 2026-08-31 (Melvyn, à froid). **Ne pas exécuter** — préparé pour
> une session dédiée après reset des tokens. Ce document fige l'intention et pose les questions à
> trancher avant de coder. Il **rouvre P1-14** (`docs/BACKLOG.md`) et va au-delà.

## 1. Ce que Melvyn veut (reformulé)

### 1.a Ne pas amputer l'agent de ses ressources (révision de P1-14)
La décision P1-14 « isoler les cours du contexte mission » (livrée en PR #72) résout le bruit
mais **prive l'agent d'un savoir potentiellement utile** : un cours peut servir à une préparation,
une révision, un rappel — on ne sait pas à l'avance. Melvyn veut plutôt un **retrieval plus
intelligent** qui sait aller chercher la bonne ressource au bon moment, cours compris, sans se
laisser noyer. Donc : l'isolation `mas-etudes` devient un **filet par défaut, pas une frontière
définitive** — l'objectif cible est un accès *sélectif et pertinent* à TOUT le corpus.

### 1.b Retrieval « comme le fait un humain intelligent » (deep learning / sémantique avancé)
Aller au-delà du BM25 + embeddings actuels : ranking plus fin (reranker fort, requêtes
reformulées, intention détectée), éventuellement un modèle dédié. Deux voies à arbitrer :
outils existants vs briques algo maison. **Question ouverte à instruire** : qu'est-ce qui manque
réellement à QMD aujourd'hui (le reranker Qwen3 est déjà branché) — le classement, le
découpage (chunking), ou la structure des fiches elles-mêmes ?

### 1.c Graphify — graphe de connaissance, pas que pour la mémoire
Mettre en place **Graphify** (graphe) et l'utiliser **au-delà de la mémoire** : gestion des
documents, liens entre fichiers, navigation. Le mixer avec QMD (QMD = recherche sémantique
plate ; graphe = relations explicites entre notions/fiches/cours). Idée : QMD trouve, le graphe
relie et explique *pourquoi* deux fiches se parlent.

### 1.d Fiches vivantes, re-questionnées à chaque ajout (le cœur de la vision)
Aujourd'hui une fiche distillée est **figée** une fois écrite. Melvyn veut des **fiches vivantes** :
- à chaque nouvel apport (un cours ajouté), **remettre en cause tout le corpus concerné** ;
- **recomposer des fiches complètes** par notion : une fiche = une notion, découpée proprement,
  synthétisant *toutes* les infos qu'on a dessus (plusieurs sources fusionnées) ;
- si une nouvelle notion **complète ou contredit** un point déjà vu (ex. un exemple qui manquait),
  l'**intégrer à sa place logique** dans la fiche existante, pas l'empiler à la fin ;
- revue croisée de tous les fichiers pour amélioration continue (liens, cohérence, comblement des trous).

C'est un passage d'un pipeline **« ingest → distille → fige »** à un pipeline
**« ingest → distille → RÉCONCILIE avec l'existant → recompose la fiche de notion »**.

## 2. Ce qui existe déjà et sert de socle (à ne pas réinventer)
- Machine à états de fiche avec `superseded`/`superseded_by`, `part_of`/`order`, `derived_from`
  (`packages/memory/src/fiche.ts`) — la structure pour lier et remplacer est là.
- `planSupersede` / `applySupersede` (`conveyor/supersede*.ts`) — écrits, **jamais branchés** :
  c'est exactement le point d'accroche du « re-questionner l'existant ».
- Manifestes mère/enfant (matière → notions) — l'ossature « une matière, N notions » existe déjà.
- `consolidation-log.md` — journal des événements de gouvernance, prêt à tracer les recompositions.
- ADR 0008 clause 12 : `retrieval_context` (Contextual-Retrieval) réservé, socket nommé — voie
  d'amélioration du retrieval déjà anticipée.

## 3. Questions à trancher AVANT de coder (session dédiée)
1. **P1-14** : garder `mas-etudes` comme défaut et ajouter un accès sélectif (l'agent décide quand
   puiser dans les cours), ou fusionner et tout miser sur un meilleur ranking ? (reco : garder le
   filet, ajouter l'accès sélectif — réversible, pas de régression.)
2. **Graphify** : lequel exactement (bibliothèque/produit — à identifier), stocke quoi (fiches +
   relations `part_of`/`derived_from`/notions), et vit où (nouveau `packages/graph` ? à côté de QMD ?).
   Périmètre 1re étape : mémoire seule, ou aussi navigation de documents dans le cockpit ?
3. **Fiches vivantes** : quel déclencheur de recomposition (à chaque capture ? à la demande ?),
   quel budget tokens (recomposer une notion = relire N sources — coûteux), et quelle granularité
   d'une « notion » (le manifeste actuel = 1 fichier ; une notion peut couvrir plusieurs fichiers) ?
4. **Retrieval intelligent** : d'abord mesurer où QMD faiblit (chunking vs ranking vs structure),
   avant de choisir outil vs maison. Intake-audit obligatoire sur tout nouvel outil (Graphify inclus).

## 4. Prochaine étape (à la reprise)
Session dédiée, worktree basé `brique-1`. Ordre proposé : (a) intake-audit Graphify + mesure du
gap QMD ; (b) ADR « mémoire v2 : graphe + fiches vivantes » ; (c) découpage en incréments TDD.
Rien avant le go explicite de Melvyn et le reset des tokens.
