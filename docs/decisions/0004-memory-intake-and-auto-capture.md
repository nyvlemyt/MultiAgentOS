# ADR 0004 — Memory & knowledge intake + auto-capture (Phase 4.5)

- **Status**: Accepted — **both halves shipped**. Producer half built 2026-06-12 (Checker PASS 2026-06-13 on `phase/4.5-memory-intake`); receptacle half (Ideas Inbox / Decision Log / prioritization) since shipped — `/ideas`, `/priorities`, the `decisions` table. See the 2026-06-27 amendment.
- **Date**: 2026-06-09
- **Deciders**: Melvyn + Claude (pre-flight Phase 4.5)
- **Sources**: `docs/backlog/intake-audit-skill.md`, `docs/backlog/second-brain-cross-project.md`, `docs/workflows/intake-audit-template.md`, `docs/knowledge/memory-patterns.md` (§agentmemory), `docs/knowledge/project-doctrine.md` (close-out ritual, 5 registers), `CLAUDE.md §5/§8/§11/§12`, ADR 0003 (storage/retrieval seam), Phase 4 capture BDR (`packages/memory/src/capture.ts` `CAPTURE_DECISION`).

## Context

Phase 4 built the memory **substrate**: 5 registers, the Memory Keeper write-lock, the `memory_candidates` → `promoteCandidate()` pipeline, the FTS5 retriever, the persistence bridge, and the `captureCandidates()` **seam**. But Phase 4 deliberately stopped at an **explicit** capture gesture (the close-out ritual) — auto-capture was deferred (capture BDR) so it would be wired cleanly in a dedicated phase rather than bolted on.

Phase 4.5 must now answer: **how does the world get *into* memory, safely and cheaply?** Two producers feed one substrate:
1. **Missions** — a completed mission should durably capture its decisions/learnings/blockers without a manual step.
2. **External knowledge** — a new resource (repo / note / course / skill / pattern) should be audited, classified, and (if kept) become memory.

Hard constraints (unchanged): subscription-only, no PAYG (§11); Memory Keeper is the **sole writer** (§8); risky actions are gated (§5); ≤5 global items injected per call (§12); reversibility is a first-class cost (intake-audit §3); local-first.

This phase is **re-sequenced before Phase 3.5** (the multi-account router): the router *consumes* grounded project memory, so the producer of that memory must exist first.

## Decision

**1. Auto-capture trigger = the `mission-complete` event, routed through the existing `captureCandidates()` seam.**
- A worker hook on mission completion runs the close-out ritual (zero-LLM, deterministic) and calls `captureCandidates(db, taskId, items[])` → `memory_candidates` rows (status=pending). **No new write path is introduced** — the Phase 4 seam is the only door.
- The **agentmemory** hooks (SessionStart/PostToolUse/Stop), deferred in the Phase 4 capture BDR, become an **optional** auto-capture backend behind that same `captureCandidates()` API — adopted only if it earns its keep via an intake-audit; FTS5/ritual already clear the bar.

**2. Intake is candidate-only; promotion stays Memory-Keeper-exclusive.**
- Every producer (mission auto-capture, external resource) emits **candidates**, never register entries. Promotion is `promoteCandidate()` behind the write-lock (Phase 4). Auto-capture cannot, by construction, write memory directly.

**3. Multi-source intake produces an *intake dossier* first.**
- Sources: repo / note / course / skill / pattern. Each is audited into `docs/intake/<date>-<slug>.md` (skeleton in `intake-audit-template.md`; `docs/intake/` already holds graphify + qmd dossiers). The dossier — not the raw source — is what flows to the Ideas Inbox / Decision Log and, on acceptance, to a memory candidate.

**4. `intake-audit` is a *skill*, not a rule and not an agent** (backlog decision, `intake-audit-skill.md`).
- Reusable, token-cheap, progressive disclosure. Authored per CLAUDE.md §12 (Principles → Process → Rationalizations → Red Flags → Verification Criteria). It produces the dossier and a keep/adapt/reject decision with a re-audit date.

**5. Classifier = deterministic rules first, light LLM only on abstain.**
- A rule table maps a candidate/dossier to a **register** (BDR / LRN / BLK / journal / EVAL) + **scope** (`project` | `global`) from cheap signals (source type, keywords, the emitting task's tags, explicit user tag). Only when the rules **abstain** does a single light LLM call (subscription, eco/medium effort) classify — and that call is logged to `/trace`. No embeddings, no PAYG (§11).

**6. Security audit is mandatory before ingesting a repo or executing any source code.**
- `mas-sec-reviewer` must PASS before reading an external repo's contents into intake or running any code from a source. `risk: blocking` → always human (§5). Repo ingestion writes nothing outside `data/`; the external tree is read-only (§8 / CLAUDE.md "all state in `data/`").

**7. Auto-file for trusted sources = config-driven auto-triage, still through the Keeper write-path.**
- A `config/intake.trust.json` allowlist lets high-confidence sources skip *manual* triage: their candidates are auto-promoted by the Keeper path (not a new writer, not a §5 bypass). Anything not on the list lands in the inbox.

## Rationale

- Reuses the Phase 4 seam → **no second write path to audit**; the §8 write-lock invariant is preserved automatically.
- Deterministic-first honors §11 + the token budget (most candidates classify with zero LLM); the LLM is a typed, logged fallback, not the default.
- The security gate is the price of "ingest any repo" — without it, intake becomes an arbitrary-code/read-anything hole. Routing it through the existing `mas-sec-reviewer` skill avoids inventing a parallel gate.
- Making intake-audit a **skill** matches the backlog's settled form and keeps it composable across the producer + receptacle.
- Re-sequencing before 3.5 means the router has real memory to consume on day one (no empty-store cold start).

## Alternatives considered

- **Bolt auto-capture onto Phase 4** — rejected: the capture BDR deliberately deferred it; doing it under the Phase 4 gate would expand a verified phase and skip a dedicated security/doctrine pre-flight.
- **agentmemory as the primary capture backend now** — rejected for the MVP: a 12-hook + 53-tool MCP stdio server from a single-maintainer young repo, for retrieval (RRF) the gate doesn't need. Kept as an optional backend behind the seam (decision 1).
- **LLM-first classification** — rejected: burns quota on cases cheap rules solve; violates the token discipline (§6/§12). LLM is the abstain fallback only.
- **Direct auto-write for trusted sources** (skip candidates) — rejected: breaks the §8 single-writer invariant. Trust = skip *manual triage*, not skip the Keeper.
- **A new `intake-keeper` agent** — rejected: ≤7-tool/agent discipline + the backlog's "skill, not agent" decision. The Memory Keeper still owns writes; intake-audit is a skill the orchestrator runs.

## Consequences

- New: `mission-complete` worker hook; an intake module (likely `packages/memory/src/intake.ts` + a `classifier.ts`); `config/intake.trust.json`; the `intake-audit` skill under `.claude/skills/`.
- `memory_candidates` likely gains intake-provenance columns (source kind, dossier path, classifier decision, `auto_filed` bool) → one migration.
- The `mas-sec-reviewer` skill becomes a hard pre-step in the intake path (wired in the dispatcher, not re-implemented).
- `/memory` (Memory Center) gains an intake-source filter; the receptacle (`/ideas`, Decision Log) receives dossiers.
- **Scope risk**: Phase 4.5 now spans producer + receptacle. If too large, split at the pre-flight gate — producer (this ADR) before 3.5, receptacle (Ideas/Decisions/prioritization UI) after 3.5. Documented in ROADMAP "Build order".
- Deferred to later: agentmemory backend adoption (own intake-audit), Graphify codebase indexing (future **ADR 0008-context-indexing** — number reserved; *not* 0006, which is risk-scoring), cross-project second-brain promotion (`second-brain-cross-project.md`, candidate ADR). *(QMD retriever — originally deferred here to ADR 0003 §4.x — has since shipped as the live primary retriever; see the 2026-06-27 amendment.)*

## Amendement (2026-06-27) — état réel

- **Receptacle livré.** La moitié receptacle (Ideas Inbox / Decision Log / prioritization), notée « follows Phase 3.5 » à l'origine, est en place : routes `/ideas` et `/priorities`, table `decisions` (`packages/db/src/schema.ts`).
- **QMD vivant.** Le retriever QMD, listé en « deferred » ci-dessus (ADR 0003, 4.x), a été promu **retriever primaire en production** en Phase 9a2 (2026-06-23), avec FTS5 en fallback. Le seam `MemoryRetriever` de cet ADR reste l'interface ; QMD en est l'implémentation par défaut.
- **Correction de renvoi.** L'indexation de code « Graphify » était renvoyée à un « future ADR 0006 ». Le numéro **0006** a en réalité été attribué au scoring de risque 4-axes ; l'ADR context-indexing reste **0008** (numéro réservé). Renvoi corrigé ci-dessus.

## Amendement (2026-09-07) — les 5 registres ne reçoivent pas d'ingéré

> Déclencheur : `docs/backlog/classifieur-faux-positifs-cours.md`. En promouvant les 51 candidats
> classés (P1-8), les 51 se sont révélés être 51 documents de cours, et les trois quarts des
> rangements étaient faux. La clause 5 ci-dessus est corrigée ici, pas réécrite.

### Le constat

La table de mots-clés de la clause 5 avait été calibrée en juin sur de la prose de **mission** —
les phrases courtes qu'un agent écrit sur sa propre exécution (« Decided to… », « We learned
that… »). Le tapis roulant d'ingestion (Brique 6) lui a ensuite servi de la prose de **cours**.
Les mots du registre y sont aussi les mots du domaine enseigné :

| Règle | Ce qu'elle cherchait | Ce qu'elle a frappé | N |
|---|---|---|---|
| `kw-learning` | « we **learned** that… » | « Deep **Learning** », « Machine **Learning** » | 43 |
| `kw-blocker` | « **blocked** on… » | la consigne d'un TD : « don't stay **blocked** » | 7 |
| `kw-eval` | « **benchmark**: 4ms » | le titre « **Score** Report » (anglais) | 1 |

La règle ne pouvait pas distinguer les deux sens, **parce qu'elle n'avait jamais eu à le faire** :
il lui manquait une frontière, pas des mots.

### La question de fond, tranchée

**Un document ingéré n'entre pas dans les 5 registres de mission.** Pas de 6ᵉ registre
`resources` non plus. Quatre raisons, dans l'ordre de poids :

1. **Les registres sont un journal de bord à la première personne.** Les 5 registres viennent du
   rituel de clôture (`project-doctrine`) : *qu'avons-nous décidé / appris / qu'est-ce qui nous a
   bloqués / qu'avons-nous fait / mesuré*. Chaque entrée répond d'une question sur **notre propre
   exécution**. Un cours de Deep Learning ne répond d'aucune : ce n'est pas « nous avons appris X »,
   c'est « quelqu'un enseigne X ».
2. **Le besoin de retrieval est déjà servi ailleurs.** Le miroir études (P1-14, collection QMD
   `mas-etudes`) existe précisément pour que le stock `untrusted` non promu reste cherchable sans
   entrer dans le contexte mission (`seed.ts` `isEtude`). Il n'y a donc **aucun trou de retrieval**
   à combler en forçant les cours dans les registres. Un registre `resources` serait un second
   domicile pour les mêmes documents : deux copies, deux ids, provenance scindée.
3. **La mécanique des registres est hostile aux documents longs — constat, pas théorie.** Un corps
   portant ses propres titres `##` a été déchiqueté en entrées fantômes (`Contents`,
   `2.1 Variable cible`) et a fait frapper LRN-044 en LRN-082 ; `deriveTitle` a produit 51 entrées
   titrées par un commentaire HTML (`<!-- part_of: … -->`). Les deux bugs sont apparus le jour où
   les premiers cours ingérés ont atterri dans un registre. Un fichier de registre est une liste
   d'entrées **courtes** ; l'extraction d'un PDF de 40 pages est une autre forme de donnée.
4. **Un invariant de sécurité l'interdisait déjà.** ADR 0008 clause 6 / `canAutoPromote` :
   `untrusted` n'est **jamais** auto-promouvable, allowlist ou pas. Un classifieur qui rendait une
   décision routable sur un corps `untrusted` fabriquait le prétexte d'une écriture qu'un autre
   invariant refusait. La porte ci-dessous met les deux d'accord au lieu de les faire courir l'un
   contre l'autre.

Le domicile durable d'un ingéré reste donc le chemin fiche : `mas capture` → `mas distill` →
`mas promote` → miroir études, et sa promotion en mémoire mission passe par son cycle de vie
(`active`/`audited`, P1-6), jamais par la table de mots-clés.

### Ce que la clause 5 devient

- **Une porte de provenance précède la table** (`isIngestedProvenance`, `classifier.ts`). Elle lit
  trois champs **déjà remplis** par les producteurs — le tampon `trust` d'un extracteur, le type
  `reference` que l'intake donne à toute source documentaire, et `source_kind` — et **échoue
  fermée** : un seul suffit. Ce n'est pas un modèle de plus, c'est un `if`.
- **Les 5 règles de mission sont inchangées.** Elles sont justes dans leur domaine ; le défaut
  était l'absence de frontière. `note` reste jugé par elles (une note est écrite par l'utilisateur),
  ce qui préserve l'auto-file de la clause 7.
- **Le signal « source type » de la clause 5 est retiré** (`skill`/`pattern`/`repo`/`course` →
  `learnings`). Il ne visait que des kinds documentaires, donc son domaine entier est désormais
  hors bornes : le garder aurait fait croire à un lecteur que l'ingéré route encore.
- **Le fallback LLM n'est pas consulté sur un ingéré.** « Lequel des 5 registres de mission ? »
  n'est pas une question dont un cours a la réponse : la poser à un modèle ne ferait que blanchir
  la même erreur de catégorie, à un appel de quota par document. Le seam optionnel de
  classification-sur-abstention du tapis roulant disparaît donc, et le chemin de capture devient
  **zéro-LLM par construction** et non plus par défaut — un §11 plus fort qu'avant.
- **Un tag utilisateur explicite passe outre la porte.** Un humain qui a étiqueté un document l'a
  regardé, et ce jugement surclasse toute heuristique de provenance. C'est la seule voie par
  laquelle de l'ingéré atteint encore un registre.
- **Les décisions déjà stockées sont retirées, pas réinterprétées** (`mas reclassify`,
  `reclassify.ts`). `promoteClassifiedCandidates` exécute fidèlement la décision qu'il lit — il ne
  la fabrique pas — donc corriger le classifieur ne suffisait pas : les 51 décisions de juin
  étaient de la donnée. La passe ne fait que **retirer** (jamais inventer un registre), est
  idempotente et possède un `--dry-run`.

### Conséquences

- `data/memory/<projectId>/*.md` ne contient que du savoir de mission.
- **Les 379 candidats ingérés sont `rejected`, pas `pending`** (décision Melvyn, 2026-09-09 —
  correction d'un premier jet qui les laissait en attente). Si aucun ingéré n'est jamais du
  matériau de registre, alors « en attente d'une décision humaine » est un mensonge : la décision
  est prise. Et une boîte de réception saturée à 379 pour toujours cesse d'être un signal. Le rejet
  ne ferme la porte **que du registre** : le document vit dans `docs/knowledge` + le miroir études
  et reste cherchable (`mem:eval` le couvre), le statut se défait d'un `UPDATE`, et le dédoublonnage
  par `source_key` matche toujours une ligne rejetée — donc fermer ne peut pas déclencher de boucle
  de réingestion. Passe : `mas reclassify --reject [--dry-run]`.
- `mas promote --candidates` sur un lot purement ingéré promeut **0** — ce n'est pas une panne,
  c'est la bonne réponse.
- `PipelineDeps` perd `llm` et `budgetBlocked` ; `buildDeps` (mas-cli) n'injecte plus rien.
- Reste ouvert : une table de classement propre aux ressources (kind, matière, niveau) si le triage
  humain des 379 se révèle trop coûteux. Elle classerait vers des attributs de fiche, **pas** vers
  les 5 registres — le présent amendement ferme cette voie-là.
