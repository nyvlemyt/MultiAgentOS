# Intake — Graphify, ré-audit pour l'usage « graphe du corpus mémoire / documents » (2026-09-04)

> **Ré-audit** du dossier [`2026-06-08-graphify.md`](2026-06-08-graphify.md), qui avait tranché
> `backlog_next` **pour un usage différent** : indexation de **codebase** au service du Context
> Manager. La demande de 2026-08-31 (`docs/backlog/memoire-v2-comprehension-graphify.md` §1.c)
> porte sur un **autre usage** : un graphe de connaissance sur **le corpus mémoire et les
> documents** (fiches, notions, liens entre fichiers, navigation cockpit). Un usage différent = un
> passage d'audit différent.
>
> **Décision de tête : `watch`** pour l'usage mémoire (précondition mesurée absente), le
> `backlog_next` de juin restant valide et inchangé pour l'usage codebase. Détail en §7.

---

## 0. Garde-fous projet (étape 0)

| Contrainte | Statut face à Graphify |
|---|---|
| Local-first, single-user | ✅ tout tourne en local, sorties dans le dossier projet |
| **Subscription only, PAYG interdit (§11)** | ⚠️ **pas d'auto-reject** : la passe sémantique s'exécute via les sub-agents Claude Code (quota d'abonnement), pas via `ANTHROPIC_API_KEY`. Mais le coût quota est **non documenté et non mesuré**. |
| LLM uniquement via `packages/core/src/llm.ts` | ❌ Graphify appelle son propre backend LLM, hors de notre point d'injection unique |
| **Memory Keeper seul écrivain de `data/memory/` (§8)** | ⚠️ `--watch` + hooks git écrivent en continu ; il faudrait interdire toute écriture sous `data/memory/` |
| **Actions risquées gatées (§5)** | ❌ **exécute du code et télécharge des parsers** → `mas-sec-reviewer` PASS obligatoire avant install. **Jamais obtenu** (déjà noté en juin, toujours pas fait). |
| Pas de framework majeur sans ADR | ⚠️ nécessiterait une clause d'ADR ; le présent dossier alimente l'ADR 0010 |
| Discipline de phase | ⚠️ l'usage mémoire n'a pas de phase ouverte ; l'usage codebase est fléché Phase 5 |

Deux violations dures (`llm.ts`, `mas-sec-reviewer`) ⇒ **`implement_now` est exclu d'office**,
quel que soit le score.

---

## 1. Identité

- **Quoi** : outil open-source qui transforme un dossier (code **et** documents) en **graphe de
  connaissance** interrogeable, livré comme *skill* pour Claude Code / Cursor / Codex / Gemini CLI.
- **Source** : [`Graphify-Labs/graphify`](https://github.com/Graphify-Labs/graphify) ·
  paquet PyPI `graphifyy` (double `y`) · commande CLI `graphify` · site `graphify.com`.
- **Licence** : Apache-2.0 / MIT (double licence).
- **Récence / obsolescence** : actif 2026, versions `v3`/`v4`/`v8` visibles, traductions
  multilingues du README. Obsolescence **low**.
- **Correction d'un chiffre du dossier de juin** : le dossier 2026-06-08 annonçait « ~35k⭐ ».
  Relevé du 2026-09-04 : **~114 k⭐**. Le tirage a triplé — la popularité n'est pas un critère de
  décision (cf. table des rationalisations), mais un chiffre faux dans un dossier d'intake doit
  être corrigé (CLAUDE.md §14.5).

**Ce qu'il fait, concrètement :**

- **Passe 1 — AST déterministe (0 appel LLM)** : tree-sitter parse classes, fonctions, imports,
  call-graphs sur 37+ langages. *« Rien ne quitte votre machine. »*
- **Passe 2 — extraction sémantique (appels LLM)** : documents (`.md .mdx .qmd .html .txt .rst`),
  PDF, images, audio/vidéo, Google Workspace → concepts, relations, rationale.
- **Passe 3 — clustering Leiden (local, 0 LLM)** : détection de communautés par densité d'arêtes.
- **Passe 4 — nommage des communautés (appels LLM)**.
- **Arêtes typées par confiance** : `EXTRACTED` (lu dans l'arbre syntaxique) · `INFERRED`
  (déduit par le LLM) · `AMBIGUOUS`.
- **Sorties** dans `graphify-out/` : `graph.html` (viz force-directed), `GRAPH_REPORT.md`
  (nœuds-clés, communautés, questions suggérées), `graph.json` (graphe complet, « GraphRAG-ready »).
  Exports optionnels : `.graphml`, cypher Neo4j/FalkorDB, SVG, **vault Obsidian**, wiki markdown.
- **Interrogation** : `graphify query "…"`, `graphify path A B`, `graphify explain "X"`, et un
  **serveur MCP** (`graphify ./raw --mcp`, outils `query_graph`, `get_node`, `shortest_path`).
- **Incrémental** : `--update` (ne ré-extrait que les fichiers changés), `--watch`, hooks git.
- **Install** : `uv tool install graphifyy` puis `graphify install` ; Python ≥ 3.10 ; extras
  `pdf`, `office`, `google`, `video`.

**Zones d'ombre relevées dans la doc publique** (elles pèsent sur `evidence_maturity`) :

1. **aucun drapeau documenté pour désactiver la passe LLM** (pas de mode « déterministe seul ») ;
2. aucun coût documenté pour un corpus **documents-only** — la promesse « **$0 en crédits LLM** »
   est explicitement conditionnée à `code-only` ;
3. schéma des types de nœuds/arêtes non publié ;
4. rien sur le traitement du **frontmatter YAML** d'un markdown.

---

## 2. Fit — ce que ça améliorerait, mesuré

### 2.a Le besoin est réel et chiffré

`docs/audits/2026-09-04-gap-retrieval-qmd.md` §5 mesure exactement ce que Melvyn décrit :
répondre à « explique-moi l'attention » demande de lire **5 fiches ≈ 5 000 tokens**, largement
redondantes, sans objet « notion » nulle part. Un graphe qui relierait ces 5 fiches à un nœud
`Attention` répondrait à ce besoin. **Le besoin n'est pas en cause dans cet audit.**

### 2.b La précondition, elle, est absente — et c'est mesuré

| Ce qu'un graphe projette | Ce que le corpus contient réellement (379 fiches) |
|---|---|
| liens sémantiques entre fiches | **0 `[[wikilink]]`** |
| `sources[]` résolus | **0** |
| remplacements tracés | **0 `superseded_by`** |
| hiérarchie | 268 `part_of` (fichier → matière) |
| provenance | 379 `derived_from` (→ `sha256:`) |

ADR 0008 clause 6 est explicite : *« Un futur graphe de connaissance est une **projection** de
cette table, jamais une ré-écriture de celle-ci. »*

**Projeter le contrat actuel donne l'arborescence des dossiers** : 109 matières, 268 feuilles,
zéro arête transversale. Autrement dit : **il n'y a rien à mettre dans le graphe.**

Pour produire un graphe utile aujourd'hui, Graphify devrait **inventer** les arêtes par LLM — ce
sont précisément ses arêtes `INFERRED` / `AMBIGUOUS`. **C'est le geste que la clause 6 interdit.**

> **Le point d'articulation de tout ce dossier :** ce n'est pas « Graphify est-il bon ? » (il
> l'est), c'est « **le graphe est-il en amont ou en aval de la couche notion ?** ». La mesure
> répond : **en aval**. Tant que les fiches n'émettent pas de liens, un moteur de graphe ne peut
> que les fabriquer, et des liens fabriqués dans un `graph.json` opaque sont pires qu'absents —
> ils sont invérifiables et non gouvernés.

### 2.c Ce que le corpus a déjà, et que Graphify n'apporterait pas

`49 / 379` fiches portent une section `## See also` remplie de **noms de notions en texte brut**
(« Bahdanau attention mechanism », « Vanishing gradient problem »). Ce sont des arêtes que
**notre propre passe de distillation a déjà produites**, gratuitement, et qu'on n'a simplement
jamais matérialisées en liens. Les extraire coûte un `grep`, pas un ré-index LLM du corpus.

### 2.d Doublon fonctionnel avec l'existant

| Ce que Graphify apporte | Ce qu'on a déjà |
|---|---|
| extraction LLM de concepts depuis les docs | `conveyor/distill.ts` — 1 appel Sonnet → fiche Diátaxis validée Zod, écrite dans **notre** contrat de frontmatter |
| recherche dans le corpus | QMD (BM25 + vecteurs + rerank Qwen3), déjà branché derrière `MemoryRetriever` |
| vue graphe humaine | vault Obsidian sur `data/memory/` — **2 clics, rien à convertir** (`memory-patterns.md`), dès qu'il y a des `[[wikilink]]` |
| clustering en communautés (Leiden) | ❌ **rien** — c'est le seul apport réellement neuf |
| blast radius / AST codebase | ❌ rien — mais c'est l'**usage codebase**, pas l'usage mémoire |

**Sur l'usage mémoire, le seul apport net est le clustering Leiden.** Et un clustering n'a de sens
que sur un graphe dense — qui n'existe pas (§2.b).

### 2.e Où ça vivrait (question 2 du backlog)

Réponse : **nulle part pour l'instant.** Aucun `packages/graph`. Si l'usage codebase est un jour
retenu (Phase 5), Graphify est un **outil externe invoqué**, pas une dépendance de package :
sorties sous `data/graph/<projectId>/`, jamais sous `data/memory/` (§8), jamais commitées.

---

## 3. Les trois coûts

**Install** — `uv tool install graphifyy` + Python ≥ 3.10 + extras (`pdf`, `office`, `video` →
tree-sitter, Whisper). Effort **moyen**. Précédé obligatoirement d'un `mas-sec-reviewer` PASS (§5).

**Maintenance** — ré-index par corpus ; `--update` incrémental ; `.graphifyignore` ; hooks git à
gouverner (ils déclencheraient des reconstructions non validées). **Coût quota récurrent non
mesuré** : notre corpus est **100 % markdown**, donc la passe AST gratuite ne traite **rien**, et
**100 % des 780 documents** (379 études + 401 knowledge) passent par la passe LLM. La promesse
« $0 en crédits » ne s'applique littéralement pas à notre cas.

**Retrait** — l'outil est facile à désinstaller (sorties isolées dans `graphify-out/`). **Mais** :
si le cockpit se met à naviguer par le graphe et si des arêtes `INFERRED` sont référencées par des
fiches, le retrait devient un chantier de données, pas une désinstallation. **Réversible tant que
le graphe reste un artefact dérivé et jetable ; enraciné dès qu'il devient une source.**
→ Invariant à graver si adoption : **le graphe est toujours dérivé et reconstructible ; jamais une
source de vérité.**

---

## 4. Sanitize (étape 4.bis)

**Non applicable en l'état, et c'est délibéré.** Aucun contenu du dépôt Graphify n'a été ingéré :
cet audit s'appuie sur la page publique du dépôt et sur des recherches web, en lecture de triage.
Aucun clone, aucune distillation, aucune installation.

**Conséquence de procédure** : *lire le dépôt pour l'intégrer, c'est déjà l'ingérer* (table des
rationalisations du skill). Toute étape suivante — clone, install, lecture de code — exige un
`sec_review_verdict: PASS` **préalable**. Il n'existe pas. C'est un **gate ouvert**, pas une
formalité oubliée.

---

## 5. Score (0–5) — usage mémoire / documents

| Axe | Note | Justification |
|---|---|---|
| `project_fit` | **2** | Le besoin (§2.a) est réel, mais l'objet à projeter n'existe pas (§2.b). Bon outil, mauvais moment. |
| `token_efficiency` | **2** | Corpus 100 % markdown ⇒ la passe gratuite ne traite rien ; 780 docs en passe LLM, coût non documenté. |
| `safety` | **2** | Exécute du code, télécharge des parsers, appelle un LLM hors de `llm.ts`, écrit en continu avec `--watch`. |
| `implementation_effort` | **3** | Install simple, mais gouvernance (chemins, hooks, quota, ADR) non triviale. |
| `evidence_maturity` | **3** | ~114 k⭐, licence claire, incrémental et MCP documentés — mais 4 zones d'ombre matérielles (§1). |
| `user_value` | **3** | Fort **si** la couche notion existe ; nul avant. La valeur est conditionnelle, pas immédiate. |
| `phase_compatibility` | **1** | Aucune phase ouverte pour un graphe mémoire ; la session en cours est explicitement **design, aucun code**. |

---

## 6. KILL criteria (veto — indépendants du score)

| Critère | Verdict |
|---|---|
| Clé API payante / PAYG | ❌ non déclenché — abonnement Claude Code, pas `ANTHROPIC_API_KEY` |
| **Exécute du code sans audit sécu** | ⛔ **DÉCLENCHÉ** — bloqué jusqu'à `mas-sec-reviewer` PASS (§5), jamais obtenu depuis juin |
| **Conflit avec un invariant d'ADR gelé** | ⛔ **DÉCLENCHÉ** — arêtes `INFERRED`/`AMBIGUOUS` = ré-écriture des relations, interdite par **ADR 0008 clause 6** |
| Framework lourd | ⚠️ partiel — extraire le **principe** (couche notion + communautés), pas l'implémentation |
| Hors phase | ⚠️ oui — `backlog_next` au mieux, jamais d'installation par la porte de derrière |
| Preuve faible | ⚠️ oui sur notre cas d'usage précis : **aucun chiffre publié pour un corpus documents-only** |

**Deux vetos actifs.** `implement_now` et `adapt_now` sont exclus.

---

## 7. Décision

### `watch` — pour l'usage « graphe du corpus mémoire / documents »

Le besoin est réel et mesuré (5 fiches / 5 000 tokens pour une notion), mais **la précondition est
mesurée absente : 0 arête sémantique sur 379 fiches**. Adopter Graphify maintenant reviendrait à
lui faire **inventer** les liens que le corpus n'a jamais écrits — exactement ce qu'ADR 0008
clause 6 interdit — et à payer une passe LLM sur 780 documents pour un résultat invérifiable.
Le graphe est **en aval** de la couche notion, pas en amont : on écrit d'abord les liens, on les
projette ensuite.

**Condition de ré-ouverture (déclencheur objectif, pas une date)** : ré-auditer dès que le corpus
porte **≥ 500 arêtes sémantiques déclarées** (`[[wikilink]]` résolus + `sources[]` + relations
notion↔fiche), c'est-à-dire quand une projection a de la matière. À ce moment, la question devient
« Graphify vs une projection maison de 200 lignes vers `.graphml` / vault Obsidian », et elle se
tranchera sur pièces.

### `backlog_next` — usage codebase (Context Manager), **inchangé depuis juin**

Le dossier 2026-06-08 reste valide : Phase 5, précédé de `mas-sec-reviewer` PASS + benchmark
contre `codegraph` (colbymchenry). C'est le seul usage où la passe AST gratuite travaille
réellement, donc le seul où la promesse « $0 » s'applique. **Ce ré-audit ne le modifie pas.**

---

## 8. Appropriation — ce qu'on garde de Graphify sans l'installer

*Principe 4 du skill : le principe peut être conservé quand l'implémentation est rejetée.*

1. **La couche « communauté » devient notre fiche de notion.** Graphify nomme des communautés par
   LLM après un Leiden sur un graphe inféré. Notre version : la **fiche de notion** est le nœud, et
   ses arêtes sont **déclarées** (les noms de notions déjà présents dans les 49 `## See also`,
   promus en liens réels), pas inférées. Même objet, provenance vérifiable.
2. **La typologie de confiance des arêtes, gardée telle quelle.** `EXTRACTED | INFERRED |
   AMBIGUOUS` est un bon contrat, et il est compatible clause 6 **à condition que seul `EXTRACTED`
   soit projetable sans revue humaine**. À reprendre comme champ de relation.
3. **L'export vault Obsidian, obtenu gratuitement.** Dès que les fiches portent des
   `[[wikilink]]`, `data/memory/` **est** un vault Obsidian (`memory-patterns.md`) — la vue graphe
   humaine que veut Melvyn, sans outil, sans quota, sans audit sécu.
4. **`GRAPH_REPORT.md` comme forme de sortie.** L'idée « le graphe produit un rapport en langage
   clair (nœuds-clés, connexions surprenantes, questions suggérées) » est excellente et
   réutilisable telle quelle pour le panneau santé du cockpit.
5. **`--update` incrémental comme discipline.** Ne retraiter que ce qui a changé : c'est
   exactement la règle de budget à graver pour la recomposition des fiches vivantes.

---

## 9. Plan d'intégration — **aucun, volontairement**

`watch` ⇒ rien à installer, rien à câbler, aucun budget tokens engagé. Les seules actions ouvertes
par ce dossier sont **documentaires** et vivent dans l'ADR 0010 :

- graver l'invariant **« un graphe est dérivé et reconstructible, jamais une source »** ;
- graver **« seules les arêtes déclarées sont projetables ; une arête inférée est une
  proposition, soumise au Memory Keeper »** (extension naturelle d'ADR 0008 clause 6) ;
- inscrire au backlog l'extraction des 49 `## See also` en liens réels — c'est le premier pas
  vers la condition de ré-ouverture du §7.

**Ce qu'il ne faut PAS faire** : installer Graphify « juste pour voir » sur `data/etudes/` ; le
laisser écrire sous `data/memory/` ; poser un hook git de reconstruction ; committer un
`graph.json` ; ou traiter une arête `INFERRED` comme une relation du corpus.

---

## 10. Ré-audit

- **Déclencheur principal** : corpus ≥ 500 arêtes sémantiques déclarées (§7).
- **Déclencheur secondaire** : pré-vol de la phase Context Manager (usage codebase, Phase 5) —
  benchmark Graphify vs `codegraph` vs context-pack statique.
- **Déclencheur d'invalidation** : si Graphify publie un mode déterministe sans LLM pour les
  documents, ou des chiffres de coût sur un corpus documents-only, rouvrir immédiatement — cela
  supprimerait le principal coût inconnu de ce dossier.

---

*Aucun code, aucune dépendance, aucune installation n'a été produite par cet audit.
Mesures à l'appui : `docs/audits/2026-09-04-gap-retrieval-qmd.md`.*
