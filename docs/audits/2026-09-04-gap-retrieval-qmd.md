# Mesure du gap de retrieval QMD — où le corpus échoue vraiment

> **Date** : 2026-09-04 · **Session** : design mémoire v2 (aucun code de prod)
> **Question posée** (`docs/backlog/memoire-v2-comprehension-graphify.md` §1.b) : qu'est-ce qui
> manque réellement à QMD — le **classement** (ranking), le **découpage** (chunking), ou la
> **structure des fiches** ?
> **Réponse mesurée** : la **structure des fiches**. Le ranking fonctionne. Le chunking est un
> contributeur secondaire. Le corpus, lui, est à 19,5 % dupliqué, à 0 % relié, et à 71 % titré
> par un nom de fichier.

Toutes les mesures ci-dessous ont été prises le 2026-09-04 sur l'index QMD réel
(`/Users/melvyn/Documents/02_PROJETS/multiAgentOS/.qmd`, 1 938 documents, `hasVectorIndex: true`,
`needsEmbedding: 0`), avec le moteur en configuration de production
(embed `embeddinggemma-300M`, rerank `qwen3-reranker-0.6b`). Chaque chiffre est reproductible.

---

## 0. L'image en une page

Imagine une bibliothèque de 1 938 livres. Le bibliothécaire (QMD) est bon : il comprend ta
question, il va vite, il te propose 10 livres classés. Le problème n'est pas lui — c'est que :

- **380 livres sont là en double** (même contenu, deux rayons différents) ;
- **270 livres sur 379 ont pour titre le nom du carton dans lequel ils sont arrivés**
  (« S7 - deepLearning — CH4_RNN_and_Attention.pdf ») au lieu de leur sujet (« Attention ») ;
- **aucun livre ne renvoie à un autre** : zéro renvoi croisé sur 379 fiches ;
- et **la fiche cartonnée de chaque livre** (33 lignes de métadonnées YAML) **est rangée
  dans le rayon comme si c'était du contenu** — le bibliothécaire te la tend parfois à la
  place du livre.

Résultat : quand tu demandes « comment réduire ce que je paie par appel de modèle », il te
tend en premier un cours de deep learning — parce que ce cours parle de « minimiser une fonction
de **coût** ». Il n'a pas tort sémantiquement. Il n'a aucun moyen de savoir que ce « coût »-là
n'est pas de l'argent, **parce que la fiche ne le dit nulle part**.

---

## 1. Le corpus réel — inventaire

| Collection QMD | Chemin indexé | Documents | Dans le contexte mission ? |
|---|---|---|---|
| `mas-arsenal` | `data/arsenal-index` | 1 085 | ❌ |
| `mas-knowledge` | `docs/knowledge` | 401 | ❌ (retiré par P1-14) |
| `mas-etudes` | `data/etudes` | 379 | ❌ (retiré par P1-14) |
| `mas-resources` | `docs/resources` | 44 | ❌ |
| `mas-memory` | `data/memory` | 22 | ✅ |
| `mas-workflows` | `docs/workflows` | 7 | ✅ |
| **Total** | | **1 938** | **29 (1,5 %)** |

> **Chiffre-clé n° 1 : au moment d'une mission, l'agent interroge 29 documents sur 1 938 — 1,5 %
> du corpus.** C'est la définition chiffrée de « l'agent est amputé de ses ressources »
> (`memoire-v2-comprehension-graphify.md` §1.a). Ce n'est pas un ressenti, c'est
> `QMD_MEMORY_COLLECTIONS = [QMD_MEMORY, QMD_WORKFLOWS]` (`packages/memory/src/retriever.ts:219`).

### 1.bis Pourquoi seulement 22 documents dans `mas-memory`

Aucune fiche n'a jamais dépassé l'état `distilled` — mesuré sur les 379 fiches d'études :

| Champ frontmatter | Valeur | Comptage |
|---|---|---|
| `lifecycle` | `distilled` | 375 / 377 |
| `lifecycle` | `rejected-kept` | 2 / 377 |
| `lifecycle` | `active` | **0** |
| `trust` | `untrusted` | 377 / 377 |
| `quality_score` | `null` | 377 / 377 |
| `superseded_by` | non-`null` | **0** |
| `retrieval_context` | rempli | **0 / 377** |

Les 22 documents de `mas-memory` sont l'ancien miroir `docs/knowledge/*` de juin, pas les fiches
d'août. Le chemin `distilled → audited → active` n'a toujours aucun appelant.

---

## 2. Expérience A — reproduire l'échec P1-14

**Requête golden `sem-token-cost`** (`packages/memory/src/golden-queries.json`) :
`"techniques to reduce how much I pay the provider for each model call"`.
Attendu : `anthropic-ecosystem` | `production-patterns` | `token` | `prompt-caching`.

### A1 — configuration mission actuelle (`mas-memory` + `mas-workflows`)

| Rang | Score | Document | Verdict |
|---|---|---|---|
| 1 | 0,88 | `mas-memory/…/prompting-anthropic.md` ligne 107 (« Code review ») | passage hors-sujet |
| 2 | 0,50 | `mas-memory/…/anthropic-ecosystem.md` ligne 27 (`CLAUDE_CONFIG_DIR`) | passage hors-sujet |
| — | — | *(rien d'autre : la collection ne contient que 29 docs)* | |

### A2 — corpus complet (1 938 docs, aucune restriction)

| Rang | Score | Document | Verdict |
|---|---|---|---|
| 1 | **0,88** | `mas-knowledge/…deeplearning-intro-to-deep-learning.pdf` — *« minimising a loss function through gradient descent »* | ❌ **faux positif** |
| 2 | 0,50 | `mas-memory/…/prompting-anthropic.md` | passage hors-sujet |
| 3 | 0,44 | `mas-resources/Le-sommaire-que-ton-IA-lit…` | partiel |
| **4** | **0,38** | `mas-arsenal/skill/cost-aware-llm-pipeline.md` | ✅ **la bonne réponse** |
| 6 | 0,34 | `mas-etudes/…intro-to-large-language-models` | bruit |
| 8 | 0,33 | `mas-arsenal/skill/scanning-own-network-with-nmap.md` | bruit total |

> **Chiffre-clé n° 2 : la bonne réponse existe (`cost-aware-llm-pipeline`, score 0,38, rang 4) et
> elle est inatteignable dans les DEUX configurations** — hors périmètre en A1, noyée sous un faux
> positif à 0,88 en A2.
>
> **Ce que ça dit de P1-14 : l'isolation ne corrige pas la requête, elle rend juste le corpus trop
> petit pour qu'il y ait quelque chose à se tromper.** La régression `sem-token-cost` n'était pas
> causée par les cours ; les cours l'ont seulement rendue visible.

---

## 3. Expérience B — l'amputation, mesurée

**Requête** : `"comment réviser la notion d'attention pour mon examen de deep learning"`
**Périmètre** : `mas-memory` + `mas-workflows` (ce que voit une mission aujourd'hui).

```
Résultat : { "results": [] }
```

> **Chiffre-clé n° 3 : zéro résultat**, alors que le corpus contient **5 fiches** qui traitent
> exactement cette notion (§5). C'est le cas d'usage « préparation / révision / rappel » de
> `memoire-v2-comprehension-graphify.md` §1.a — mesuré comme totalement inaccessible.

---

## 4. Expérience C — trois ablations qui désignent le vrai levier

Même besoin d'information que l'expérience A, trois variantes.

| Variante | Rang de `cost-aware-llm-pipeline` | Son score | Rang 1 obtenu |
|---|---|---|---|
| **C0** — vectoriel + rerank (référence) | 4 | 0,38 | cours deep learning · 0,88 |
| **C1** — vectoriel, **rerank désactivé** | 3 | 0,33 | cours deep learning · **1,00** |
| **C2** — vectoriel + `intent` désambiguïsant côté requête | 4 | 0,43 | cours deep learning · 0,88 |
| **C3** — vectoriel **+ ancres lexicales** (`"prompt caching" token budget cost`) | **1** | **0,92** | ✅ la bonne réponse |

Lecture de chaque ligne :

- **C1 — le reranker travaille déjà.** Sans lui, le faux positif monte à 1,00 ; avec lui, il
  redescend à 0,88. Le reranker Qwen3 corrige donc l'erreur… de 0,12. **Il n'est pas le
  goulot d'étranglement : il est déjà au bout de ce qu'il peut faire avec ce que les documents
  lui donnent.** Remplacer le reranker par « plus fort » achèterait des marges de cet ordre.
- **C2 — désambiguïser côté requête ne suffit pas.** Ajouter explicitement « facturation d'API
  LLM, PAS les fonctions de coût en machine learning » fait gagner **+0,05** à la bonne réponse
  et **ne déloge pas** le faux positif. La reformulation de requête, l'intent detection, le
  HyDE — tous côté requête — plafonnent ici.
- **C3 — fournir le vocabulaire côté document règle tout.** Dès qu'on injecte les termes que le
  bon document contient réellement (`prompt caching`, `token budget`), il passe **rang 4 → rang 1**
  et **0,38 → 0,92**.

> **Chiffre-clé n° 4 : le même besoin d'information passe de « rang 4, score 0,38 » à
> « rang 1, score 0,92 » sans toucher au moteur — uniquement en changeant le vocabulaire exposé
> à l'index.** Le levier est **côté document**, pas côté moteur ni côté requête.

---

## 5. Expérience D — une notion, combien de fiches ?

Matière `deepLearning`, 12 fiches. Occurrences de `attention|LSTM|GRU|backprop` par fiche :

| Occurrences | Fiche |
|---|---|
| 36 | `Maitrise_4_Notions_Examen.pdf` |
| 23 | `Fiches_Revision_DeepLearning.pdf` |
| 17 | `CH4_RNN_and_Attention.pdf` |
| 8 | `Prepa_Examen_DeepLearning.pdf` |
| 8 | `CH2_Backpropagation.pdf` |
| 8 | `S7 - deepLearning` *(le manifeste de matière)* |
| 6 | `Intro To Deep Learning.pdf` |
| 5 | `DE annee derniere.pdf` |
| 1 | `CH5_Encoder-Decoder Models.pdf` · `CH3 Regularisation.pdf` |
| 0 | `PW CNN.pdf` · `Note_explicative_video.pdf` |

Une recherche « attention » sur `mas-etudes` remonte **5 fiches distinctes** dans le top-4
(chapitre, 2 fiches de révision, préparation d'examen, sujet d'annale) — **aucune n'est
« la » fiche Attention**, chacune la ré-explique partiellement.

> **Chiffre-clé n° 5 : répondre à « explique-moi l'attention » coûte la lecture de ~5 fiches
> ≈ 20 Ko ≈ 5 000 tokens, dont l'essentiel est redondant, et sans garantie de complétude.**
> Il n'existe aucun objet « notion » dans le corpus — c'est exactement le manque que les
> « fiches vivantes » (`memoire-v2-comprehension-graphify.md` §1.d) veulent combler.

### 5.bis Le corpus sait déjà nommer les notions — il n'a juste rien où les accrocher

`49 / 379` fiches portent une section `## See also`. Son contenu réel (fiche `CH4_RNN_and_Attention`) :

```markdown
## See also

- Transformer / self-attention (successor architecture)
- Bidirectional RNN
- Encoder-Decoder (seq2seq) framework
- Vanishing gradient problem
- Bahdanau attention mechanism
```

Ce sont **des noms de notions, en texte brut** — des liens qui pendent dans le vide.

| Type de relation | Occurrences sur 379 fiches |
|---|---|
| `part_of` (enfant → matière) | 268 |
| `derived_from` (→ `sha256:`) | 379 |
| `## See also` (texte non lié) | 49 |
| **`[[wikilink]]`** | **0** |
| **`sources[]` non vide** | **0** |
| **`superseded_by`** | **0** |

> **Chiffre-clé n° 6 : zéro lien sémantique sur 379 fiches.** Les seules arêtes existantes sont
> hiérarchiques (`part_of`) et de provenance (`derived_from`). Un graphe qui serait — comme
> l'exige ADR 0008 clause 6 — une **projection** de ce contrat de relations produirait
> exactement l'arborescence des dossiers : 109 matières, 268 feuilles, **aucun lien transversal**.

---

## 6. Expérience E — 19,5 % de l'index est un doublon

Comparaison `data/etudes/` ↔ `docs/knowledge/resource-*.md` :

- **379 fichiers de chaque côté, 379 noms communs (100 %)** ;
- diff sur 20 fiches : **exactement 1 ligne d'écart à chaque fois**, et c'est
  `<!-- source: docs/knowledge/resource-….md -->`.

`data/etudes/` est donc une **copie octet-pour-octet** de `docs/knowledge/resource-*.md`,
plus une ligne de commentaire. Les deux dossiers sont indexés dans deux collections QMD.

> **Chiffre-clé n° 7 : 379 des 1 938 documents indexés (19,5 %) sont des doublons exacts.**
> Preuve visible dans l'ablation C1 : la *même* fiche remonte deux fois dans le même top-6 —
> `mas-knowledge/…intro-to-deep-learning` (score 1,00) **et**
> `mas-etudes/…intro-to-deep-learning` (score 0,20).
>
> **Conséquence directe sur P1-14 : les cours n'ont jamais été isolés — ils ont été copiés.**
> La collection `mas-etudes` a été créée, mais les originaux sont restés dans `mas-knowledge`.
> Le seul effet réel de P1-14 a été de retirer `mas-knowledge` de `QMD_MEMORY_COLLECTIONS`.
> Toute requête non restreinte (c'est-à-dire toute recherche manuelle, tout usage MCP, toute
> future recherche cockpit) voit **toujours** les 379 cours — et les voit **deux fois**.

---

## 7. Expérience F — le chunking, contributeur secondaire mais réel

Longueur du frontmatter YAML des fiches (lignes avant le second `---`), sur 40 fiches :
**min 31 · médiane 33 · max 40**. Le corps commence donc vers la ligne 34.

Sur les requêtes exécutées, plusieurs hits renvoient `line: 1` — le **meilleur passage retenu est
le bloc YAML lui-même** :

- `mas-etudes/…Grille dévaluation_Grand portrait…` → ligne 1
- `mas-etudes/…Lab 3 Stack Exercises.pdf` → ligne 1
- `mas-knowledge/…s6-optimisation-et-complexite-projet.pdf` → ligne 1
- `mas-knowledge/…business-plan…` → ligne 3 (`id:`, `slug:`)

Soit **~2 hits sur 12** dans un top-12 mesuré (≈ 17 %) où le passage servi est un en-tête de
métadonnées à valeur informationnelle nulle. À cela s'ajoute que le champ `context` renvoyé par
QMD est **`null` sur 100 % des hits** — le slot de contexte du moteur n'est jamais alimenté.

> **Chiffre-clé n° 8 : ~17 % des passages servis peuvent être du frontmatter, et 0 % des chunks
> portent un contexte.** C'est réel, mais c'est un ordre de grandeur en dessous des effets
> mesurés en §2 et §4 : le chunking est un **contributeur, pas la cause**.

---

## 8. Verdict — le levier, classé

| # | Levier | Preuve | Gain attendu | Effort |
|---|---|---|---|---|
| **1** | **Structure de fiche** — vocabulaire et cadre exposés à l'index (`retrieval_context`, titre = notion, section « à quoi ça ne sert pas ») | C3 : rang 4→1, score 0,38→0,92 · §5.bis : 0 lien · 71 % de titres = noms de fichiers | **décisif** | moyen (1 passe LLM par fiche) |
| **2** | **Dédoublonnage du corpus** — `data/etudes` = copie exacte de `docs/knowledge/resource-*` | §6 : 19,5 % de l'index | fort, quasi gratuit | faible (suppression d'une collection) |
| **3** | **Objet « notion »** — une notion = une fiche recomposée | §5 : 5 fiches ≈ 5 000 tokens pour une notion | fort sur le coût de réponse | élevé (recomposition) |
| 4 | **Chunking** — exclure le frontmatter, alimenter `context` | §7 : ~17 % de passages vides | moyen | faible (config d'index) |
| 5 | **Ranking / reranker** — modèle plus fort, reformulation, HyDE | C1 : le reranker ne pèse que 0,12 · C2 : l'intent ne pèse que +0,05 | **marginal** | élevé |

### Les trois phrases à retenir

1. **Le moteur n'est pas le problème.** Le reranker Qwen3 corrige déjà l'erreur de 0,12 et la
   désambiguïsation côté requête n'achète que +0,05. Investir dans « du deep learning plus fort »
   côté ranking achèterait des gains de cet ordre de grandeur.
2. **Le problème est que les fiches ne disent pas ce qu'elles sont.** Un titre qui est un nom de
   fichier (71 %), un `retrieval_context` vide (100 %), zéro lien sortant (100 %) : le document
   n'a aucun moyen de se défendre contre une collision de vocabulaire. Quand on lui donne ses
   propres mots (C3), le classement devient parfait immédiatement.
3. **P1-14 n'a pas isolé les cours, il les a dupliqués.** L'isolation par collection ne protège
   que les requêtes qui pensent à se restreindre — et coûte l'accès à 98,5 % du corpus pour
   toutes les autres.

---

## 9. Ce que ces chiffres impliquent pour l'ADR mémoire v2

- **Contre un remplacement du moteur de retrieval** : mesuré marginal (§4, C1/C2).
- **Pour l'activation du socket `retrieval_context`** (ADR 0008 clause 12, réservé, 0 % rempli) :
  c'est exactement le levier n° 1, et la clause existe déjà — il n'y a pas d'ADR à créer, il y a
  une clause à **déclencher**. Le déclencheur prévu était « après la première baseline golden » ;
  cette baseline, la voici.
- **Contre l'adoption d'un graphe *maintenant*** : §5.bis mesure **0 arête sémantique**. Un graphe
  construit aujourd'hui n'aurait rien à projeter (clause 6) — ou devrait *inventer* ses arêtes par
  LLM, ce que la clause 6 interdit explicitement (« une projection, jamais une ré-écriture »).
  Le graphe est **en aval** de la couche notion, pas en amont.
- **Pour la révision de P1-14** : l'isolation est à remplacer, pas à durcir — elle est à la fois
  inefficace (§6) et amputante (§3).

---

*Reproductibilité — les mesures §1 à §7 s'obtiennent avec l'outil MCP `qmd` (`status`, `query`)
sur l'index `/.qmd` du dépôt, et des comptages `grep`/`diff` sur `data/etudes/` et
`docs/knowledge/`. Aucun code de production n'a été écrit ni exécuté pour produire ce rapport.*
