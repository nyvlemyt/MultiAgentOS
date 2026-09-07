# ADR 0010 — Mémoire v2 : fiches vivantes, notions, et le graphe comme projection

- **Status**: **Proposed** — quatre clauses (2, 5, 7, 10) portent une réponse *par défaut* en attente de l'arbitrage de Melvyn. Elles sont isolées exprès : un désaccord change une clause, pas l'ADR.
- **Date**: 2026-09-04
- **Origine**: vision utilisateur `docs/backlog/memoire-v2-comprehension-graphify.md` (2026-08-31) · mesures `docs/audits/2026-09-04-gap-retrieval-qmd.md` · ré-audit `docs/intake/2026-09-04-graphify-reaudit-memoire.md`. Rouvre P1-14 (`docs/BACKLOG.md`). Déciseurs : Melvyn + Claude.
- **Étend** ADR 0008 (Living Knowledge OS) — ne le remplace pas. Toutes ses clauses restent en vigueur ; cet ADR en **déclenche deux** (12, 3) et en **étend une** (6).

---

## Contexte

ADR 0008 a gravé le contrat du corpus : états de vie, relations, provenance, `schema_version`.
Le tapis roulant a ensuite tourné pour de vrai : 379 fiches distillées le 2026-08-10. Puis un
symptôme est apparu — le golden `sem-token-cost` régressait, les fiches de cours « noyaient » les
requêtes d'ingénierie. P1-14 a répondu par une **isolation de collection** (PR #72), et Melvyn a
immédiatement objecté que cette réponse **ampute l'agent** d'un savoir qui pourrait servir.

La mesure du 2026-09-04 (`docs/audits/2026-09-04-gap-retrieval-qmd.md`) montre que le diagnostic
initial était faux sur les trois points qui comptent :

1. **L'isolation n'isole rien.** `data/etudes/` est une copie **octet-pour-octet** de
   `docs/knowledge/resource-*.md` (379/379, une seule ligne de commentaire d'écart). Les deux sont
   indexés. **19,5 % de l'index QMD est un doublon exact.** Le seul effet réel de P1-14 a été de
   retirer `mas-knowledge` de `QMD_MEMORY_COLLECTIONS` — soit de faire tomber le corpus consulté
   en mission à **29 documents sur 1 938 (1,5 %)**.
2. **Le moteur n'est pas le problème.** Ablations sur la requête qui échoue : sans reranker le faux
   positif monte de 0,88 à 1,00 (le reranker Qwen3 *travaille déjà*, il pèse 0,12) ; désambiguïser
   la requête ne rapporte que **+0,05** et ne déloge rien. En revanche, fournir au document le
   vocabulaire qu'il contient réellement fait passer la bonne réponse du **rang 4 (0,38) au
   rang 1 (0,92)**. Le levier est **côté document**.
3. **Il n'y a rien à mettre dans un graphe.** **Zéro `[[wikilink]]` sur 379 fiches**, zéro
   `sources[]`, zéro `superseded_by`. Les seules arêtes sont `part_of` (268, hiérarchique) et
   `derived_from` (379, provenance). Projeter le contrat d'ADR 0008 clause 6 aujourd'hui rendrait
   **l'arborescence des dossiers**. Mais 49 fiches portent déjà un `## See also` rempli de noms de
   notions en texte brut : les arêtes sont **écrites, jamais matérialisées**.

Un quatrième constat commande la partie « fiches vivantes ». La notion « attention » est éclatée
sur **5 fiches** de la matière deepLearning (un chapitre, deux fiches de révision, une préparation
d'examen, une annale), chacune la ré-expliquant partiellement. Répondre à « explique-moi
l'attention » coûte **~5 000 tokens de lecture largement redondante**, sans garantie de complétude.
**Il n'existe aucun objet « notion » dans le corpus.**

Enfin, une contrainte de fond : rien n'a jamais dépassé `distilled`. `lifecycle: active` = 0,
`quality_score` = 0, `retrieval_context` = **0 / 377**. Le socket réservé par ADR 0008 clause 12
est vide, et son déclencheur (« après la première baseline golden ») est désormais **atteint** —
cette baseline, c'est l'audit du 2026-09-04.

---

## Décision

### A. Corpus et accès — la fin de l'isolation par dossier

**1. Un seul exemplaire de chaque fiche.** `data/etudes/` et la collection QMD `mas-etudes` sont
**supprimés**. Les fiches d'études vivent là où elles vivent déjà : `docs/knowledge/resource-*.md`,
la face build-time du corpus unique d'ADR 0008 clause 2. Une troisième face était une violation de
cette clause ; elle disparaît. *Effet mesuré attendu : −379 documents (−19,5 %) sur l'index.*

**2. La sélectivité est portée par un champ, pas par un dossier.** *(réponse par défaut — arbitrage
Melvyn)*
Le backbone taxonomique d'ADR 0008 clause 3 est **appendable** ; on y ajoute **une valeur de `lane` :
`etudes`**. C'est une ligne de donnée, aucun refactor. Le contexte mission
(`buildMemoryContext`) interroge **tout le corpus** et applique un **plafond de places par lane** :

> **Invariant de plafond** — dans les 5 places du bloc mémoire d'une tâche, **au plus 2** peuvent
> venir de `lane: etudes`. Aucune lane n'est jamais exclue ; aucune ne peut jamais noyer.

Le filet devient un **plafond**, pas un mur. C'est la révision de P1-14 demandée : accès sélectif
plutôt qu'isolation dure, réversible d'un chiffre.

*Alternatives écartées, et pourquoi* — (i) *outil explicite « chercher dans mes cours »* : l'agent
ne trouve alors que ce qu'il soupçonnait déjà, or l'intérêt d'un cours est justement d'être
inattendu ; (ii) *garder deux collections dédupliquées* : conserve l'amputation à 1,5 % mesurée en
§Contexte, et la requête de révision continuerait de renvoyer zéro résultat.

**3. `QMD_MEMORY_COLLECTIONS` cesse d'être la frontière.** Les collections restent des **périmètres
de recherche** (utiles au cockpit, au Skill Router, aux tests), plus jamais un **contrôle
d'accès**. Le contrôle d'accès, c'est le plafond de la clause 2.

### B. Structure de fiche — le levier n° 1, activé

**4. `retrieval_context` est déclenché (ADR 0008 clause 12, Q6).** La baseline golden exigée existe.
Chaque fiche porte désormais un `retrieval_context` de **50 à 100 tokens** situant la fiche dans son
corpus — le pattern Contextual-Retrieval d'Anthropic, adapté : nos fiches font ~1 000 tokens, donc
le contexte est **par fiche, pas par chunk**, et il est produit **dans le même appel LLM que la
distillation** — coût marginal nul, aucun second passage.

**5. Le `retrieval_context` s'écrit dans le corps, pas seulement dans le frontmatter.** *(réponse
par défaut — arbitrage Melvyn)*
Première ligne du corps, en citation. Deux raisons mesurées : (i) ~17 % des passages servis par QMD
sont aujourd'hui du **frontmatter YAML** (hits en `line: 1`) — le mettre dans le corps le rend utile
au lieu d'être du bruit ; (ii) le champ `context` renvoyé par QMD est `null` sur **100 %** des hits,
donc on ne peut pas compter sur le moteur pour porter ce cadre. Corollaire : **le frontmatter est
exclu de l'indexation**, sauf `title` et `tags`.

**6. Le titre d'une fiche est son sujet, jamais son fichier d'origine.** Mesure : **270 / 379 (71 %)**
des titres sont des noms de fichiers (`S7 - deepLearning — CH4_RNN_and_Attention.pdf`). La
provenance a déjà son champ (`derived_from`, `source_key`) ; elle n'a rien à faire dans le `H1`.
Le titre devient le sujet distillé ; le nom de fichier reste en frontmatter.

**7. Section obligatoire « À ne pas confondre avec ».** *(réponse par défaut — arbitrage Melvyn)*
C'est la réponse directe à l'échec mesuré : un cours de deep learning a capté une requête de
facturation parce qu'il parle de « minimiser une fonction de **coût** », et **rien dans la fiche
ne disait que ce coût-là n'est pas de l'argent**. Une section qui nomme explicitement les
collisions de vocabulaire injecte dans l'index les termes discriminants qui manquent. Coût :
2 lignes par fiche. Gain mesuré par analogie avec l'ablation C3 : rang 4 → rang 1.

### C. Fiches vivantes — la couche notion

**8. Une notion est un objet de première classe : `kind: notion`.** Une fiche de notion est une
**synthèse dérivée et recalculable** sur N fiches sources. Elle ne remplace pas les fiches sources :
celles-ci restent des **enregistrements immuables par source**, porteuses de la provenance et
protégées par l'invariant archive-never-delete (ADR 0008 clause 5).

- `source_key` de la notion = `notion:<slug>` — **stable à travers toutes les recompositions**.
- `sources[]` = les ids des fiches sources agrégées.
- Les fiches sources gagnent un `[[<notion-slug>]]` sortant.

**9. Recomposer = superseder, jamais éditer en place.** Une recomposition ré-émet la fiche entière
et **superséde** la précédente via son `source_key` stable. Conséquences : l'historique complet
d'une notion est gratuit, les liens survivent, et **`planSupersede` / `applySupersede`
(`packages/memory/src/conveyor/supersede*.ts`, écrits et testés depuis juin, zéro appelant)
reçoivent enfin leur premier appelant réel.** Une ligne au `consolidation-log.md` par recomposition.

**10. « Insérer à sa place logique » est une conséquence du squelette, pas d'un algorithme de fusion.**
*(réponse par défaut — arbitrage Melvyn)*
Le corpus produit déjà quatre squelettes Diátaxis stables (`reference` 217, `tutorial` 78,
`explanation` 49, `howto` 32). La notion en est le **cinquième**, à plan **fixe** :

```
## En une phrase          → la thèse, une phrase
## Pourquoi ça existe     → le problème que la notion résout
## Le mécanisme           → comment ça marche
## Exemples               → cas travaillés   ← un exemple manquant atterrit ICI
## Pièges et contre-exemples                 ← une contradiction atterrit ICI
## Arbitrages             → quand préférer quoi
## À ne pas confondre avec                   ← clause 7
## Notions liées          → [[wikilinks]]
## Sources                → quelle fiche a dit quoi
```

Parce que le plan est fixe et que la recomposition **ré-émet tout** au lieu d'ajouter à la fin, un
complément va mécaniquement dans `Exemples` et une contradiction dans `Pièges`. C'est le point
non-évident de cet ADR : **la « bonne place » s'obtient par un plan stable, pas par un merge
intelligent** — donc à coût quasi nul et de façon vérifiable.

**11. Granularité : le concept nommé, promu à 3 occurrences.** La règle des 3 occurrences existe
déjà (ADR 0008 clause 3 : *2 = coïncidence, > 5 = trop tard*). On la réutilise telle quelle :
**un nom de notion cité par ≥ 3 fiches devient une fiche de notion.** Le corpus décide seul, rien
à décréter. Amorce immédiate et gratuite : les **49 `## See also`** déjà écrits.
**Signal de découpage** : une notion dont le jeu de sources dépasse **12 fiches** n'est pas un
problème de budget, c'est un problème de granularité → elle doit être scindée.

**12. Déclencheur : seuil détecté → proposition → validation humaine.** *(défaut, aligné sur
l'invariant « rien d'untrusted n'est auto-promu »)*
Quatre déclencheurs : (R1) une nouvelle fiche source cite une notion existante ; (R2) la règle des
3 occurrences arme une notion sans fiche → **création** ; (R3) une contradiction est détectée ;
(R4) demande manuelle. Dans tous les cas la recomposition **produit une proposition** dans l'inbox
du Memory Center ; **le Memory Keeper reste le seul écrivain** (CLAUDE.md §8).

**13. Budget, borné avant de partir.** Discipline incrémentale (principe approprié du `--update` de
Graphify, cf. ré-audit §8.5) : **on ne recompose qu'une notion dont le jeu de sources a changé.**
Bornes : **≤ 12 fiches sources en entrée** par recomposition (au-delà → clause 11, on scinde) ;
budget déclaré par lot avec **pause à la borne** (mécanisme d'ADR 0008 clause 11, inchangé) ;
juge **Sonnet** à la recomposition, **Opus** à la promotion (clause 11, inchangée).

### D. Le graphe

**14. QMD trouve, le graphe relie — et le graphe est en aval, pas en amont.** Mesure : 0 arête
sémantique. Adopter un moteur de graphe maintenant reviendrait à lui faire **inventer** les arêtes.
Décision : **aucun moteur de graphe n'est adopté.** Graphify est en `watch`
(`docs/intake/2026-09-04-graphify-reaudit-memoire.md` §7), avec un déclencheur de ré-ouverture
**objectif** : ≥ 500 arêtes sémantiques déclarées dans le corpus.

**15. Le graphe est une projection, produite depuis les arêtes déclarées uniquement.**
Extension d'ADR 0008 clause 6, gravée ici :

> **Un graphe est dérivé et reconstructible, jamais une source de vérité.**
> **Seule une arête déclarée est projetable. Une arête inférée est une *proposition*, soumise au
> Memory Keeper comme n'importe quel candidat mémoire.**

Cible de projection v1, **sans nouvel outil ni nouveau package** : dès que les fiches portent des
`[[wikilink]]`, `data/memory/` **est** un vault Obsidian ouvrable en deux clics
(`docs/knowledge/memory-patterns.md`) — la vue graphe voulue, à coût nul. Export `.graphml` en
option, dérivé du même jeu d'arêtes.

**16. Typologie de confiance des arêtes, reprise de Graphify.** Chaque relation porte
`EXTRACTED | INFERRED | AMBIGUOUS`. Seul `EXTRACTED` est projetable sans revue. C'est le principe
gardé d'un outil dont l'implémentation est écartée (skill `intake-audit`, principe 4).

---

## Conséquences

**Ce qui devient vrai / plus simple**

- **L'agent retrouve son corpus.** De 29 documents (1,5 %) à l'intégralité du corpus dédoublonné,
  avec un plafond par lane au lieu d'un mur. La requête de révision qui renvoyait `[]` (audit §3)
  redevient servie.
- **Le retrieval s'améliore là où c'est mesuré.** Clauses 4-7 attaquent le levier n° 1 (structure) et
  le n° 4 (chunking) ; la clause 1 attaque le n° 2 (doublons) quasi gratuitement. Le n° 5 (ranking),
  mesuré marginal, n'est pas touché — décision assumée.
- **Le supersede sort du placard.** Trois fichiers écrits et testés depuis juin obtiennent leur
  premier appelant (clause 9), et l'historique d'une notion devient gratuit.
- **Le graphe cesse d'être un achat et devient une conséquence.** Écrire les liens produit le vault
  Obsidian ; aucun outil, aucun quota, aucun audit sécu.

**Coûts acceptés**

- **Une passe de re-distillation.** Clauses 4-7 changent le contrat de sortie : les 379 fiches
  existantes doivent être re-émises pour gagner `retrieval_context`, un vrai titre et la section
  « À ne pas confondre avec ». C'est un lot borné, budgété, à passer une fois.
- **Une suppression de données.** Clause 1 supprime `data/etudes/` — sans risque puisque c'est une
  copie exacte de fichiers **suivis par git**, mais c'est une destruction : elle passe par le
  portique §5 (validation humaine explicite), jamais en autonome.
- **La couche notion est du travail réel.** Clauses 8-13 ne sont pas un habillage : c'est un
  nouveau `kind`, un nouveau squelette, un détecteur de seuil et un chemin de proposition.
- **Le plafond par lane est un chiffre arbitraire.** « 2 places sur 5 » n'est pas mesuré ; c'est un
  point de départ réglable, à ajuster sur le golden set après la re-distillation.

**Ce que cet ADR ne fait PAS**

- Il ne remplace pas le moteur de retrieval, ne change pas de reranker, n'ajoute pas de HyDE ni de
  reformulation de requête (mesurés marginaux, audit §4).
- Il n'adopte **aucun** outil externe, n'ajoute **aucune** dépendance, ne crée **aucun**
  `packages/graph`.
- Il ne touche pas au billing (§11), ni au single-writer (§8), ni à la table de transitions fermée
  (ADR 0008 clause 4) : `notion` est un `kind`, pas un état de vie.

---

## Les quatre arbitrages en attente de Melvyn

| # | Clause | Réponse par défaut retenue | Alternative si tu tranches autrement |
|---|---|---|---|
| 1 | **2** | Corpus unique dédoublonné + plafond de 2 places sur 5 pour `lane: etudes` | Outil explicite « chercher dans mes cours », ou deux collections dédoublonnées |
| 2 | **5** | `retrieval_context` en première ligne du corps + frontmatter exclu de l'index | Le laisser en frontmatter seul et indexer le frontmatter |
| 3 | **7 / 11** | Notion = concept nommé, promue à 3 occurrences ; scission au-delà de 12 sources | Notion = chapitre / objectif d'apprentissage (grain plus large, ~200 fiches) |
| 4 | **12** | Seuil détecté → proposition → tu valides | Recomposition automatique à chaque capture, ou en lot uniquement sur demande |

Tant que ces quatre points ne sont pas confirmés, le statut reste `Proposed`. Aucun autre paragraphe
n'en dépend : chaque alternative change une clause et laisse le reste debout.

---

*Références : mesures `docs/audits/2026-09-04-gap-retrieval-qmd.md` · ré-audit
`docs/intake/2026-09-04-graphify-reaudit-memoire.md` · contrat de corpus
`docs/decisions/0008-living-knowledge-os.md` · vision
`docs/backlog/memoire-v2-comprehension-graphify.md`. Aucun code de production n'a été écrit.*
