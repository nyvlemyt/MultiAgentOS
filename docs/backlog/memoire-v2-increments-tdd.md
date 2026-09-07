# Mémoire v2 — découpage en incréments TDD

> **Source** : ADR `0010-memoire-v2-graphe-et-fiches-vivantes.md` (statut `Proposed`) ·
> mesures `docs/audits/2026-09-04-gap-retrieval-qmd.md`.
> **Règle** : 1 incrément = 1 session = 1 branche = 1 PR. Aucun ne démarre sans que le précédent
> soit vert sur les **5 checks** (`pnpm -r test` · `pnpm lint` · `pnpm build` ·
> `pnpm --filter @mas/web smoke` · SonarCloud à zéro issue).
> **Verrou** : I1 à I11 ne démarrent qu'après confirmation des 4 arbitrages de l'ADR §« en attente ».
> **I0 est le seul qui peut partir tout de suite** — il ne dépend d'aucun arbitrage.

---

## Vue d'ensemble

| # | Incrément | Clause ADR | Taille | Dépend de | LLM ? |
|---|---|---|---|---|---|
| **I0** | Golden set v2 + baseline gelée | — | S | — | non |
| **I1** | Plafond de places par lane | 2, 3 | M | I0 | non |
| **I2** | Dédoublonnage du corpus | 1 | S | I1 | non |
| **I3** | `retrieval_context` au corps + frontmatter hors index | 4, 5 | M | I0 | non (contrat) |
| **I4** | Titre = sujet + « À ne pas confondre avec » | 6, 7 | M | I3 | non (contrat) |
| **I5** | Re-distillation du lot 379 | coût accepté | L · opération | I3, I4 | **oui** |
| **I6** | `## See also` → wikilinks + notions candidates | 11 (amorce) | M | I0 | non |
| **I7** | `kind: notion` + squelette de notion | 8, 10 | M | I6 | non |
| **I8** | Recomposition = supersede | 9 | M | I7 | **oui** |
| **I9** | Détecteur de seuil + proposition + budget | 11, 12, 13 | L | I8 | **oui** |
| **I10** | Projection vault Obsidian / `.graphml` | 15, 16 | S | I6 | non |
| **I11** | Promotion `distilled → audited → active` | — (débloque) | M | I5 | **oui** |

**Chemin critique** : I0 → I3 → I4 → I5 → I11. C'est celui qui débouche la mémoire.
**Chemin parallèle** : I0 → I6 → I7 → I8 → I9 (la couche notion) et I6 → I10 (le graphe).
I1/I2 sont indépendants et peuvent partir en parallèle du reste dès I0.

---

## I0 — Golden set v2 et baseline gelée

**Pourquoi en premier.** Chaque incrément suivant prétend améliorer le retrieval. Sans harnais qui
mesure, ce sont des opinions. L'audit du 2026-09-04 fournit les chiffres de départ ; I0 les grave
dans du code exécutable.

**Tests d'abord**
1. `runRetrievalEval` sait rapporter un **recall@k agrégé** (aujourd'hui il ne dit que pass/fail par
   ligne) → test sur un retriever bouchonné à hits connus.
2. Un cas golden peut déclarer un **anti-attendu** (`rejectIfTop1: [...]`) → la requête
   `sem-token-cost` échoue tant qu'un cours de deep learning est en tête. Test rouge attendu au
   départ, c'est le point.
3. Un cas golden peut cibler un **cas d'étude** (`"réviser la notion d'attention"`, attendu
   `attention`) → rouge aujourd'hui (0 résultat, audit §3), vert après I1.
4. Le rapport sait sortir un **JSON comparable** entre deux exécutions (baseline vs courante).

**DoD binaire**
- [ ] `pnpm --filter @mas/memory mem:eval --json` écrit un rapport comparable
- [ ] La baseline 2026-09-04 est commitée en fixture (`golden-baseline-2026-09-04.json`)
- [ ] ≥ 3 nouveaux cas golden : anti-attendu, cas d'étude, cas notion
- [ ] Les cas rouges le sont **pour la bonne raison**, documentée dans le fichier

**Ne pas faire** : corriger le retrieval dans cette PR. I0 mesure, il ne répare pas.

---

## I1 — Plafond de places par lane

**Tests d'abord** (fonction pure, aucune I/O)
1. `capByLane(hits, {etudes: 2}, 5)` : 5 hits `etudes` en entrée → 2 en sortie, complétés par les
   lanes suivantes par score décroissant.
2. Aucun hit d'une lane plafonnée → aucune place perdue, les 5 places restent remplies.
3. Moins de hits que de places → tout passe, pas de padding.
4. Ordre stable à score égal (déterminisme du contexte mission).
5. Plafond à 0 = exclusion — l'ancien comportement P1-14 reste atteignable par configuration.

**Puis** : `buildMemoryContext` interroge **toutes** les collections et applique `capByLane`.
`QMD_MEMORY_COLLECTIONS` devient un défaut de périmètre de recherche, plus un contrôle d'accès.

**DoD binaire**
- [ ] Le cas golden « cas d'étude » d'I0 passe au vert
- [ ] Le cas `sem-token-cost` ne régresse pas
- [ ] Le plafond est une **valeur de config**, pas une constante en dur
- [ ] `capByLane` : couverture 100 % branches (fonction pure, aucune excuse)

---

## I2 — Dédoublonnage du corpus

**Tests d'abord**
1. Un script de vérification prouve que `data/etudes/<f>` et `docs/knowledge/<f>` ne diffèrent que
   par la ligne `<!-- source: … -->` — sur les **379**, pas sur un échantillon.
2. `COLLECTION_ROOT` sans `mas-etudes` : un hit legacy `qmd://mas-etudes/...` ne crashe pas le
   mapping, il est ignoré proprement (compat descendante).
3. Un backfill idempotent stampe `lane: etudes` sur les fiches concernées ; rejouable sans effet.

**DoD binaire**
- [ ] `qmd status` : 1 559 documents (1 938 − 379), aucune collection `mas-etudes`
- [ ] `.qmd/index.yml`, `retriever.ts` et le doctor sont cohérents
- [ ] La suppression de `data/etudes/` est passée par une **validation humaine explicite** (§5)
- [ ] Aucune régression sur le golden set

**Ne pas faire** : supprimer quoi que ce soit sous `docs/knowledge/` — c'est la face suivie par git,
la seule source.

---

## I3 — `retrieval_context` au corps, frontmatter hors index

**Tests d'abord**
1. Le schéma de sortie de `distill` **exige** `retrieval_context` non vide, 50-100 tokens → une
   sortie LLM sans lui est rejetée par Zod (`safeParse`, jamais `any`).
2. L'écrivain de fiche place le contexte en **première ligne du corps**, en citation, ET dans le
   frontmatter (le frontmatter reste le champ canonique, le corps est la copie indexable).
3. Backfill idempotent : une fiche déjà pourvue n'est pas retouchée.
4. Le contexte ne contient jamais le nom du fichier source (sinon on recrée le bruit d'I4).

**Puis** : `.qmd/index.yml` exclut le frontmatter de l'indexation, `title` et `tags` exceptés.

**DoD binaire**
- [ ] 0 hit en `line: 1` sur un échantillon de 20 requêtes (audit §7 mesurait ~17 %)
- [ ] Une fiche neuve sans `retrieval_context` ne peut pas s'écrire
- [ ] Golden set : aucune régression, `sem-token-cost` mesuré avant/après

---

## I4 — Titre = sujet, et « À ne pas confondre avec »

**Tests d'abord**
1. Le titre produit ne contient ni `.pdf` ni `.docx` ni `.pptx` → un test de contrat sur la sortie
   de `distill` (aujourd'hui **71 %** des titres échoueraient : c'est la mesure de départ).
2. La section `## À ne pas confondre avec` est obligatoire sur `doc_type: explanation` et
   `reference`, et contient ≥ 1 entrée.
3. Le nom du fichier d'origine reste accessible en frontmatter (aucune perte de provenance).

**DoD binaire**
- [ ] Contrat de sortie durci, tests rouges → verts sur des fixtures réelles
- [ ] Un cas golden prouve qu'une collision de vocabulaire est désormais départagée

---

## I5 — Re-distillation du lot 379 (opération)

Pas de nouveau code : c'est l'exécution du contrat d'I3+I4 sur l'existant.

**DoD binaire**
- [ ] Budget déclaré **avant** de lancer, pause à la borne (ADR 0008 clause 11)
- [ ] Exécution par lots reprenables, journalisée dans `consolidation-log.md`
- [ ] Rapport avant/après sur le golden set, chiffré
- [ ] Aucune fiche perdue : 379 entrantes, 379 sortantes, ids stables

---

## I6 — `## See also` → wikilinks et notions candidates

Zéro LLM. C'est de l'extraction sur ce que le corpus a **déjà écrit** (49 sections).

**Tests d'abord**
1. Parser d'une section `## See also` → liste de noms de notions ; les parenthèses explicatives
   (`(successor architecture)`) sont écartées du nom, conservées en annotation.
2. Normalisation : `Bahdanau attention mechanism` et `attention (Bahdanau)` convergent vers un
   même slug.
3. Comptage d'occurrences par notion sur tout le corpus → **la règle des 3 occurrences** arme les
   notions candidates (ADR 0008 clause 3).
4. Une notion citée mais sans fiche produit un **wikilink pendant**, et c'est **légal** (il marque
   un trou à combler, ce n'est pas une erreur).

**DoD binaire**
- [ ] Un registre de notions candidates est produit, avec compte d'occurrences et fiches citantes
- [ ] Le nombre d'arêtes déclarées est **publié** — c'est le compteur du seuil de ré-ouverture de
      Graphify (≥ 500, ré-audit §7)
- [ ] Le gardien de frontmatter accepte les wikilinks pendants

---

## I7 — `kind: notion` et son squelette

**Tests d'abord**
1. `FicheSchema` accepte `kind: 'notion'` ; `source_key` doit valoir `notion:<slug>`.
2. Un validateur de squelette : les 9 sections de l'ADR clause 10, dans l'ordre, sinon rejet.
3. `sources[]` d'une notion : ≥ 1, tous résolvables vers des ids de fiches existantes.
4. Une notion ne peut pas avoir `part_of` (elle n'appartient pas à une matière — c'est
   transversal par nature).

**DoD binaire**
- [ ] Le squelette est une **donnée** (liste de titres de sections), pas du code — ajouter une
      section = une ligne
- [ ] Le gardien CI valide les notions comme les autres fiches

---

## I8 — Recomposition = supersede

C'est l'incrément qui **débranche trois fichiers dormants depuis juin**.

**Tests d'abord**
1. Recomposer une notion existante appelle `planSupersede` avec `source_key = notion:<slug>` →
   l'ancienne version passe `superseded`, la nouvelle naît, une ligne au log.
2. Première recomposition (aucune version antérieure) → `planSupersede` rend `null`, écriture simple.
3. Transition illégale → `markSuperseded` lève (garde de la table fermée d'ADR 0008 clause 4).
4. **Le test qui porte la vision** : un ajout d'exemple sur une notion existante se retrouve dans
   `## Exemples`, pas à la fin du fichier — vérifié sur le **rang de la section**, pas sur le texte.
5. Idem pour une contradiction → `## Pièges et contre-exemples`.

**DoD binaire**
- [ ] `applySupersede` a un appelant en production
- [ ] L'historique d'une notion est reconstituable depuis `superseded_by`
- [ ] Les tests 4 et 5 passent sur des fiches réelles du corpus deepLearning

---

## I9 — Seuil, proposition, budget

**Tests d'abord**
1. Détecteur : une nouvelle fiche source citant une notion existante arme R1 ; 3 occurrences sans
   fiche arment R2 (création) ; une contradiction arme R3.
2. Une notion dont le jeu de sources **n'a pas changé** n'est **jamais** recomposée (discipline
   incrémentale, clause 13).
3. Jeu de sources > 12 → pas de recomposition, mais une **proposition de scission** (clause 11).
4. La recomposition produit une **proposition** en inbox ; aucun octet n'est écrit sous
   `data/memory/` hors Memory Keeper (§8).
5. Le budget de lot est vérifié **avant** l'appel, et la pause est testée.

**DoD binaire**
- [ ] Aucune écriture automatique : la validation humaine est prouvée par un test
- [ ] Le coût d'une recomposition est mesuré et journalisé
- [ ] Rejouer le détecteur sans changement de sources ne coûte **aucun** token

---

## I10 — Projection vault Obsidian / `.graphml`

**Tests d'abord**
1. Seules les arêtes `EXTRACTED` sont projetées ; `INFERRED` et `AMBIGUOUS` sont exclues et
   comptées à part (ADR clause 16).
2. La projection est **idempotente** et entièrement reconstructible depuis les fiches — supprimer
   la sortie et la régénérer donne un fichier identique (invariant clause 15).
3. Un wikilink pendant n'invalide pas la projection.

**DoD binaire**
- [ ] `data/memory/` s'ouvre comme vault Obsidian, la vue graphe affiche les notions
- [ ] Aucune sortie de projection n'est commitée ni traitée comme source

---

## I11 — Débouchage de la promotion `distilled → audited → active`

Le chaînon manquant identifié dans `docs/MEMOIRE-CENTRALISEE-ETAT.md` : **aucune fiche n'a jamais
dépassé `distilled`**, ce qui explique les 22 documents de `mas-memory`.

**Tests d'abord**
1. `audited` exige un `quality_score` (`ReviewerVerdict`, ADR 0008 clause 11) ; sans lui → refus.
2. `active` exige `audited` + écriture par le Memory Keeper ; toute autre origine → refus.
3. `trust: untrusted` ne peut **jamais** atteindre `active` sans validation humaine tracée.
4. Idempotence : re-promouvoir une fiche déjà `active` est un no-op.

**DoD binaire**
- [ ] `qmd status` : `mas-memory` passe de 22 à un nombre à trois chiffres
- [ ] Le golden set mesure le gain, chiffré, contre la baseline d'I0
- [ ] `lifecycle: active` > 0 pour la première fois depuis la création du corpus

---

## Ce qu'aucun incrément ne fait

- Changer de moteur de retrieval, de reranker, ajouter HyDE ou de la reformulation de requête
  (mesurés marginaux — audit §4, ablations C1/C2).
- Installer Graphify ou tout autre moteur de graphe (`watch`, ré-audit §7 ; seuil de ré-ouverture
  publié par I6).
- Créer un `packages/graph`.
- Écrire sous `data/memory/` depuis autre chose que le Memory Keeper (§8).
- Promouvoir automatiquement de l'`untrusted` (invariant ADR 0008).
