# Mémoire centralisée MAOS — état des lieux et spécification d'intégration

> **Date de l'audit** : 2026-08-25 · **Branche** : `knowledge-os/brique-1` (réconciliée origin, #68 inclus)
> **Public** : ce rapport est autonome — il se lit sans connaître le repo. Il sert de
> spécification d'intégration pour brancher une application externe de prise de notes
> (vault markdown : `Inbox/`, `Projets/`, `Cours/`, `Idees/` avec frontmatter YAML).
> Chaque affirmation a été vérifiée dans le code le 2026-08-25 (références `fichier:ligne`).

---

## 0. L'image d'ensemble

La mémoire de MAOS est un **tapis roulant en 4 postes** : on dépose un document à l'entrée,
il est transformé en markdown, mis en attente dans un sas, distillé en « fiche » structurée
par un LLM, puis (en théorie) promu dans le corpus consultable par les agents.

```
   (1) CAPTURE                (2) SAS / QUAI              (3) DISTILLATION            (4) CONSULTATION
fichier / URL ──► extracteurs ──► porte unique ──► attente humaine ──► 1 appel LLM ──► fiche YAML ──► index sémantique
(pdf docx pptx     → markdown     captureCandidates()   data/sas/quai/    (Sonnet)      docs/knowledge/   QMD + FTS5
 html url youtube)                → SQLite               *.md                           resource-*.md      ↓
                                   memory_candidates                                        │          buildMemoryContext()
                                                                                            │ pnpm mem:seed   ↓
                                                                                            ▼          prompt système
                                                                              data/memory/_global/knowledge/   des missions
```

**État réel en une phrase : les postes 1-3 sont construits, testés et ont tourné en vrai
(379 fiches produites le 10/08) ; le poste 4 est bouché** — les fiches ne sont ni promues,
ni indexées, ni commitées, et le « second cerveau » que lisent les agents ne voit encore
qu'un ancien instantané de juin.

Quatre invariants gouvernent tout (ADR 0008, `docs/decisions/0008-living-knowledge-os.md`) :

1. **Une seule porte d'écriture des candidats** : `captureCandidates()` — toute source y passe.
2. **Un seul écrivain du store runtime** : l'agent Memory Keeper (verrou dans le code).
3. **Rien d'`untrusted` n'est auto-promu** : une fiche distillée naît en `distilled`, jamais en `active`.
4. **On n'efface jamais** : remplacer = flip de statut `superseded` + trace, jamais de delete.

---

## 1. Architecture — ce qui existe réellement

### 1.1 Les composants (tous dans `packages/memory/src/`, 7 549 lignes, 274 tests verts)

| Composant | Fichier | Rôle | État |
|---|---|---|---|
| Contrat de fiche | `fiche.ts` | schéma Zod du frontmatter + machine à états du cycle de vie | ✅ gelé (v1) |
| Porte de capture | `capture.ts` | `captureCandidates()` : SAS d'admission → dédoublonnage → insert | ✅ éprouvé (373 docs, 35 doublons refusés) |
| Tapis roulant | `conveyor/pipeline.ts` | 1 source → 1 candidat ; 1 dossier → 1 « matière » (mère + enfants) | ✅ |
| Extracteurs | `conveyor/extractors/` | pdf, docx/pptx, html collé, url, youtube → markdown | ✅ 6 extracteurs |
| Garde réseau | `conveyor/net-guard.ts` | allowlist d'hôtes + anti-SSRF, re-vérifié à chaque redirect | ✅ |
| Anti-injection | `conveyor/anti-injection.ts` | fence `<untrusted-source>` avant tout passage au LLM | ✅ |
| Distillation | `conveyor/distill.ts` | 1 appel Sonnet → fiche Diátaxis validée Zod, budget pré-vol | ✅ (robustesse #63) |
| Supersede | `conveyor/supersede*.ts` | remplacement archive-never-delete | ⚠️ écrit + testé, **zéro appelant** |
| Store runtime | `registers.ts` | les 5 registres + verrou Keeper + miroir knowledge | ⚠️ registres **jamais écrits** |
| Retrieval | `retriever.ts` | QMD (sémantique) primaire, FTS5 (SQLite) fallback, jamais silencieux | ✅ mais index périmé |
| Injection mission | `context.ts` + `packages/agents/src/mission-llm.ts` | bloc « second cerveau » ≤ 5+5 items dans le prompt de chaque tâche | ✅ câblé |
| Classifieur | `classifier.ts` | 5 règles regex → registre ; LLM léger jamais câblé en capture | ⚠️ abstient à 86 % |
| Auto-capture | `auto-capture.ts` | rituel de fin de mission (zéro LLM, idempotent) | ✅ câblé au dispatcher |
| Doctor | `doctor-cli.ts` | sonde retrieval + binaires (python3, markitdown, pdftotext, yt-dlp) | ✅ `pnpm mem:doctor` |

### 1.2 La machine à états d'une fiche (donnée, pas du code — `fiche.ts:33-43`)

```
captured → triaged → distilled → audited → active → superseded → archived
    │          │          │           │                  
    │          │          └→ rejected-kept (terminal, récupérable)
    │          └→ capture_failed → triaged (ré-entrée après réparation)
    └→ capture_failed / rejected-kept
```

**Constat central : aucune fiche n'a jamais dépassé `distilled`.** Le chemin
`distilled → audited → active` n'a pas d'appelant dans le code. C'est LE chaînon manquant.

---

## 2. Stockage — formats exacts et emplacements

La mémoire vit sur **quatre supports**, deux formats de métadonnées :

### 2.1 `docs/knowledge/` — le corpus de fiches (source de vérité, versionné git)

**Format** : markdown + frontmatter YAML conforme à `FicheSchema` (`packages/memory/src/fiche.ts:12-28`) :

```yaml
---
id: resource-td1-chap-1-optimisation-647cf9a3   # identité (= slug en v1)
slug: resource-td1-chap-1-optimisation-647cf9a3
source_key: 'sha256:647cf9a3…'                  # adresse de contenu, clé de dédup
derived_from: 'sha256:647cf9a3…'                # provenance (= source_key depuis #68)
part_of: null / order: null                     # structure parent/enfant (matières)
lifecycle: distilled                            # cycle de vie (enum fermé, cf. §1.2)
trust: untrusted                                # trusted | untrusted | low
kind: resource / register: learnings / scope: global
doc_type: reference                             # Diátaxis : tutorial|howto|reference|explanation
actionability: resource                         # PARA : project|area|resource|archive
lane: knowledge                                 # string libre (taxonomie émergente)
tags: [linear-programming, …] / domain: …       # émergent, façonné par le LLM
schema_version: '1'
---
```

Corps : un des **4 squelettes Diátaxis gelés** (reference = Summary/Fields/Constraints/Examples ;
howto = Problem/Solution/Variations/Pitfalls ; tutorial ; explanation).

**État réel** : 396 fichiers, dont **379 fiches distillées non commitées** (produites le 10/08,
51 runs de `data/scripts/distill-quai.sh`). Distribution : 100 % `lifecycle: distilled`,
100 % `trust: untrusted`, `doc_type` = 239 reference / 72 tutorial / 47 explanation / 21 howto.
**281/379 (74 %) ont un titre dégénéré** (`resource-cand-<uuid>-<hash>-<hash>.md`) : leur document
source n'avait pas de H1, le titre est retombé sur le nom de fichier du quai. Les 17 fichiers
suivis par git sont les fiches de connaissance historiques (patterns, doctrine).

### 2.2 `data/mas.db` (SQLite) — la file d'attente et la télémétrie

Table pivot **`memory_candidates`** : `id, source_task_id, type(user|feedback|project|reference),
body(markdown complet), status(pending|accepted|rejected|capture_failed), source_kind, dossier_path,
classifier_decision, auto_filed, source_key(indexé, clé anti-doublon), trust, createdAt`.

**État réel** : 379 `pending` + 29 `capture_failed` (motifs visibles : `ocr_empty`, 429 YouTube,
markitdown absent). ⚠️ Trois défauts de données : `createdAt` corrompu (secondes/millisecondes
mélangées → affiche 1970), `source_kind` NULL sur 100 % des lignes (le conveyor ne le renseigne
pas → le filtre du Memory Center UI est mort), et les corps des dead-letters contiennent des
chemins de worktrees éphémères non rejouables.

Tables annexes : `memory_items` (2 lignes de démo, **RESERVED — jamais lue au runtime**,
ADR 0003), `ideas` + `decisions` (le réceptacle Ideas/Décisions de l'ADR 0004), `fiche_revisions` (vide).

### 2.3 `data/sas/quai/` — le quai d'attente (par machine, gitignoré)

376 + 3 fichiers markdown extraits **à la main** de la base (le pont DB→distillation n'est pas
codé — carte `distill-from-db-candidate.md`). Deux formes : document enfant avec un commentaire
HTML `<!-- part_of: S7 - ml2 order: 18 -->`, et manifeste mère (table des matières en wikilinks).
**Aucun code du repo ne lit ni n'écrit ce dossier** — c'est le maillon manuel du pipeline.

### 2.4 `data/memory/` — le store runtime (ce que lisent les agents)

- `_global/knowledge/` : **401 fichiers**, miroir de `docs/knowledge/` posé par `pnpm mem:seed`
  (pont idempotent, `seed.ts:26-40`). ⚠️ Le pont **corrompt le frontmatter** : il préfixe un
  commentaire `<!-- source: … -->` AVANT le `---` (`registers.ts:189`) et double le suffixe
  (`.md.md`). À réparer avant tout usage sérieux.
- Les **5 registres** (`decisions.md` BDR-xxx, `learnings.md` LRN-xxx, `blockers.md` BLK-xxx,
  `journal.md` daté, `evals.md` EVAL-xxx) : format markdown maison `## <ID> — <titre>` **sans
  frontmatter YAML**. Écriture verrouillée à l'identité `memory-keeper`
  (`registers.ts:115-119`). **Aucun registre n'existe encore sur disque** — jamais écrits.
- `index.db` : index FTS5 dérivé (reconstruit quand le hash du corpus change).
- ⚠️ Pollution : le dossier a été ouvert dans Obsidian (`.obsidian/`, `Sans titre*`, `Users/`,
  `otaku/`) et `projectIds()` (`registers.ts:232-237`) traite ces dossiers comme des projets.

---

## 3. Ingestion — comment une information entre aujourd'hui

### 3.1 Les portes d'entrée existantes

| Porte | Commande / déclencheur | LLM ? | État |
|---|---|---|---|
| Capture fichier/URL | `pnpm mas capture <path\|url>` | non (règles seules) | ✅ |
| Capture HTML collé (paywall) | `pnpm mas capture --html [file\|-]` | non | ✅ |
| Capture dossier (inbox) | `pnpm mas capture --inbox [dir]` (défaut `docs/resources/inbox`) | non | ✅ |
| Fin de mission (auto) | rituel de close-out à `validated\|blocked\|archived` | non | ✅ câblé |
| Intake gouverné | `intakeSource()` — dossier d'intake + candidat ; repo/course exigent une revue sécurité | non | ✅ |
| Note manuelle UI | `POST /api/memory/note` → append registre sous Keeper | non | ✅ |
| Distillation | `pnpm mas distill --all data/sas/quai` | **oui** (1 appel Sonnet/doc, budget 32 k tokens/run) | ✅ |

### 3.2 Le chemin complet d'un document (vérifié pas à pas)

1. `pnpm mem:doctor` — sonde les binaires (python3/markitdown/pdftotext/yt-dlp).
2. `pnpm mas capture --inbox <dossier>` — un sous-dossier = une « matière » (1 manifeste mère
   + N enfants, chaque enfant garde son `source_key` propre) ; un fichier isolé = 1 candidat.
3. Garde-fous **avant** extraction : > 50 MiB → dead-letter `oversize` ; type inconnu →
   `unknown_source_kind` ; hôte hors `config/permissions.json#allowed_hosts` → `host_not_allowed`.
4. Extraction → markdown, `source_key = <kind>:sha256(bytes)`, `trust: untrusted`.
5. Classification **règles seules** (5 regex sur les 200 premiers caractères — pensées pour des
   comptes-rendus de mission, pas des cours → **86 % d'abstention** sur le corpus réel).
6. Porte unique : SAS d'admission (source résolvable + contenu + ≥ 1 signal) → dédup sur
   `source_key` → INSERT `pending`. Sortie : `CaptureResult {pending, failed, rejected, duplicate}`.
7. **[MAILLON MANUEL]** Export du corps vers `data/sas/quai/*.md`.
8. `pnpm mas distill --all data/sas/quai` — pré-vol budget → 1 appel Sonnet (corps fencé
   anti-injection) → validation Zod stricte (aucune demi-fiche) → écrit
   `docs/knowledge/<id>.md` en `lifecycle: distilled`. Idempotent (skip si la fiche existe).
9. **[MANQUANT]** Promotion `distilled → audited → active` : pas de code appelant.
10. `pnpm mem:seed` — miroir vers `data/memory/_global/knowledge/` (le pont corrompteur, cf. §2.4).
11. `pnpm qmd:setup` + `qmd update` + `qmd embed` — indexation sémantique. **Aucun de ces deux
    derniers pas n'est automatique** — d'où l'index périmé.

### 3.3 Preuve de fonctionnement (mesuré)

Capture de masse EFREI du 13/07 : **373 documents avalés en ~25 min, 35 doublons refusés par le
portier, 23 échecs avec motif visible**. Distillation du 10/08 : 51 runs, 379 fiches. Le pipeline
est rejouable (relancer ne crée pas de doublons).

---

## 4. Consultation — comment un agent lit la mémoire

### 4.1 Recherche : QMD primaire, FTS5 fallback (ADR 0003 amendé)

- **QMD** (moteur sémantique local, dépendance externe optionnelle ~4,4 Go) : collections
  déclarées dans `.qmd/index.yml` — `mas-knowledge` (docs/knowledge), `mas-memory` (data/memory),
  `mas-workflows` (docs/workflows), `mas-arsenal` (index L1 des skills). Une 5ᵉ, `mas-resources`,
  est un socket enregistré mais volontairement hors contexte mission (matière brute).
- **FTS5** : index BM25 dans `data/memory/index.db`, reconstruit sur changement de hash du corpus.
- `UnifiedRetriever` : QMD d'abord, bascule FTS **sur erreur seulement** ; la dégradation n'est
  jamais silencieuse (`retrievalDoctor`, messages actionnables en français).

**État réel de l'index QMD (mesuré le 25/08)** : `mas-knowledge` 21 docs indexés sur 396 sur
disque ; `mas-memory` 21/411 ; dernière mise à jour **22 juin**. **Les 379 fiches d'août sont
invisibles à la recherche sémantique.**

### 4.2 Injection dans les missions

À chaque dispatch de tâche (`packages/agents/src/dispatch.ts:634,764`), le worker appelle
`memoryContextFor(projectId, next.title)` → `buildMemoryContext()` (`context.ts:72-105`) qui
construit un bloc `## Project memory (second brain)` : **≤ 5 items projet + ≤ 5 items globaux**
(cap CLAUDE.md §12), pertinence d'abord, récence en secours, chaîne vide si rien (jamais
d'injection creuse). Le bloc entre dans le `system` du prompt, à côté du contexte projet et des
skills routés. ⚠️ La requête de recherche est **le titre de la tâche** — pas l'objectif de la
mission (amélioration possible, pas bloquante).

### 4.3 Le flux de promotion candidat → mémoire

- UI **Memory Center** (`/memory`) : liste les candidats `pending` ; boutons promote
  (`promoteCandidate` → append dans un **registre** sous identité Keeper, statut `accepted`),
  reject, edit. Skill `mas-memory-keeper` : critères (non-évident, durable ≥ 1 mois, nouveau,
  actionnable), cap 5 items globaux.
- ⚠️ Il existe donc **deux chemins de promotion distincts** : candidat → *registre* (câblé,
  jamais utilisé — 0 registre sur disque) et fiche `distilled` → *corpus actif* (pas codé).
  Le type de tâche `MemoryProposal` est doctrinal (CLAUDE.md §8) — le véhicule réel est la
  ligne `memory_candidates`.

---

## 5. Point d'intégration externe — brancher un vault de notes markdown

> Cible : vault avec `Inbox/`, `Projets/`, `Cours/`, `Idees/` et frontmatter YAML
> (`type`, `projet`, `statut`, `échéance`, `tags`).

### 5.1 La réponse à la question « source ingérée, morceau de mémoire, ou les deux ? »

**Les deux, dans cet ordre :**

- **V1 — le vault est une SOURCE ingérée** (recommandé pour démarrer, quasi zéro refactor).
  Le vault reste chez toi, MAOS le lit par une porte d'ingestion dédiée. Ta note traverse le
  tapis roulant comme n'importe quel document et devient une fiche du corpus. Avantages :
  aucune contrainte sur ton vault, sécurité conservée (SAS, dédup, anti-injection), réversible.
- **V2 — le vault devient une FACE du corpus** (plus tard). Les notes « mûres » sont promues
  fiches `active` et synchronisées bidirectionnellement. À ne faire qu'après la promotion (§6,
  item 4) et le nettoyage des deux dialectes de métadonnées (§5.4).

### 5.2 L'interface concrète V1 (conçue pour l'existant)

1. **Un extracteur `note` additif** — le point d'accroche est prévu par design :
   `ExtractorRegistry.register('note', …)` (`conveyor/extractor.ts:17-21`, le `sourceKind` est
   une string ouverte, pas un enum fermé). Une note est déjà du markdown → l'extracteur lit le
   fichier, sépare frontmatter/corps, renvoie
   `{markdown, source_key: 'note:sha256(contenu)', trust: 'trusted'}`.
2. **Une porte CLI** : `pnpm mas capture --inbox <vault>/Inbox` fonctionne déjà mécaniquement,
   mais classerait tout `unknown_source_kind` (l'inférence est par extension/URL,
   `conveyor/cli.ts:18-29`). Ajouter : extension `.md` → kind `note`.
3. **Mapping frontmatter vault → backbone MAOS** (à appliquer dans l'extracteur ou un adapter) :

   | Vault | MAOS (FicheSchema) | Règle |
   |---|---|---|
   | `type: cours` | `doc_type: tutorial\|reference` + `lane: knowledge` | Cours/ → resource |
   | `type: idee` | `register: learnings` + réceptacle `ideas` | Idees/ → candidat `type: project` |
   | `projet: <slug>` | `scope: project` + projectId | sinon `scope: global` |
   | `statut` | ne PAS mapper sur `lifecycle` en V1 | lifecycle appartient à MAOS |
   | `échéance` | `freshness: {ttl_days}` / `next_audit` | convertir en date absolue |
   | `tags: […]` | `tags: […]` | copie directe |
   | dossier `Inbox/ Projets/ Cours/ Idees/` | `actionability` (PARA) | Inbox→triage, Projets→project, Cours→resource, Idees→area |

4. **`trust: 'trusted'`** : ton vault local est le premier candidat légitime (tout le corpus
   actuel est `untrusted`). Attention : `canAutoPromote()` n'a aucun appelant aujourd'hui —
   « trusted » n'ouvre rien tant que la promotion (§6 item 4) n'est pas branchée.
5. **Court-circuit de distillation** : une note déjà structurée (frontmatter complet + corps
   court) n'a pas besoin d'un appel LLM — la fiche peut être forgée directement depuis la note
   (chemin « fiche directe », nouvelle petite fonction à côté de `distill()`).

### 5.3 Prérequis côté MAOS (bloquants pour l'intégration, dans l'ordre)

1. **Lire le frontmatter à l'entrée** — aujourd'hui `sasDocToInput()`
   (`conveyor/distill-cli.ts:64-71`) **jette toute métadonnée YAML** de la source et ne lit ni
   `part_of` ni `order`. Toute note perdrait ses tags/type/projet. C'est LE patch n° 1.
2. **Provenance** : `derived_from = source_key` (adresse de contenu `sha256:…`, décision #68,
   ADR 0008 clause 6). Un chemin de vault hors du repo ne sera jamais résolvable par le gardien
   CI — l'adresse de contenu, si. Rien à faire, juste : ne pas mettre de chemins.
3. **Chaîne d'indexation automatique** : écrire une fiche ne la rend pas consultable
   (`mem:seed` + `qmd update`/`embed` manuels). Sans hook post-écriture, les notes ingérées
   seraient invisibles — même trou que les 379 fiches actuelles.
4. **Réparer le pont miroir** (`.md.md` + frontmatter corrompu, §2.4) avant de brancher quoi
   que ce soit qui lise `data/memory/_global/knowledge/`.
5. Le filtre `source_kind` du Memory Center (mort aujourd'hui) devient utile dès qu'un
   deuxième kind (`note`) arrive — le renseigner à la capture.

### 5.4 Points de vigilance

- **Deux dialectes de métadonnées** coexistent : FicheSchema YAML (`docs/knowledge/`) vs format
  maison `## ID — titre` (`data/memory/` registres). Un vault YAML parle le premier. La V2
  exigera de trancher (probable : tout converger vers FicheSchema).
- `config/permissions.json#allowed_hosts` ne concerne que le réseau — un vault local n'y touche
  pas. `obsidian.md` y est déjà autorisé si l'app veut lire la doc Obsidian.
- La forme d'affichage de l'Inbox cockpit est **gelée** : `CaptureResult` (`capture.ts:45-58`) —
  toute UI d'ingestion (Brique 5) rendra `{pending, failed, rejected, duplicate}` tel quel.

---

## 6. Reste à faire pour finaliser la mémoire centralisée (ordonné, avec tailles)

> S ≤ 2 h · M ≈ ½–1 j · L = plusieurs sessions. Réfs = `docs/BACKLOG.md` (P1-x).

| # | Travail | Taille | Réf |
|---|---|---|---|
| 1 | **Trier les 379 fiches** : re-distiller les 281 dégénérées avec titre hérité du manifeste parent (le H1 manquant est la cause racine), rejeter les fragments sans valeur, committer le corpus sain | L | P1-2 |
| 2 | **Réparer le pont miroir** : frontmatter intact (commentaire source APRÈS le `---` ou en champ YAML), suffixe `.md.md` corrigé | S | P1-3 |
| 3 | **Ré-indexer** : `mem:seed` + `qmd update` + `qmd embed` + enregistrer `mas-resources` dans `.qmd/index.yml` | S | P1-4 |
| 4 | **Brancher la promotion** `distilled → audited → active` : appelant pour `applySupersede`/`markSuperseded` + juge qualité (Opus @ promotion, remplit `quality_score`) | L | P1-6 |
| 5 | **Hook post-distillation/post-écriture** : toute fiche écrite déclenche seed + réindexation | M | P1-5 |
| 6 | **Réparer les données candidats** : `createdAt` (ms), `source_kind` renseigné, `part_of`/`order` propagés à la distillation (aujourd'hui perdus : 379 × `part_of: null`, wikilinks des manifestes orphelins) | M | P1-7 |
| 7 | **Premiers registres réels** : promouvoir les 51 candidats déjà classés (43 learnings, 7 blockers, 1 eval) via le Memory Center | S | P1-8 |
| 8 | **Nettoyer `data/memory/`** de la pollution Obsidian + garde-fou dans `projectIds()` | S | P1-9 |
| 9 | **Brique 5 — onglet cockpit Ressources/Connaissances** : Inbox (`CaptureResult`), triage humain des 328 abstentions, badges lifecycle/trust, panneau santé | L | P1-10 |
| 10 | **`mas distill --candidate <id>`** : distiller depuis la base, supprimer le maillon manuel du quai | M | P1-11 |
| 11 | **Extracteur `note` + mapping frontmatter vault** (la V1 du §5.2 — dépend de 2, 3, 5, 6) | M | nouveau |
| 12 | Capture Sorbonne S1-S3 (USB) puis re-distillation | S | P1-12 |
| 13 | Merge `brique-1 → main` en un bloc (clôture du chantier) | M | P1-13 |

**Chemin critique pour « mémoire utilisable »** : 2 → 3 → 1 → 4 → 5. À partir de là, une
fiche écrite est trouvable et promue — le vault (11) peut se brancher.

---

## 7. Annexe — commandes utiles

```bash
pnpm mem:doctor        # santé retrieval + binaires d'extraction
pnpm mas capture --inbox <dir>   # ingérer un dossier
pnpm mas distill --all data/sas/quai   # distiller le quai
pnpm mem:seed          # pont docs/knowledge → data/memory
pnpm qmd:setup         # (ré)enregistrer les collections QMD
pnpm mem:eval          # golden set — recall du retrieval
```

Docs de référence : ADR 0003 (stockage), ADR 0004 (intake), ADR 0008 (Living Knowledge OS),
`docs/STRUCTURE.md` (charte), `docs/superpowers/specs/2026-06-27-{fiche,capture}-contract.md`.
