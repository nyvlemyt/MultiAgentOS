# ECC Harvest — décisions cluster `agent:reviewer` (Phase C agents)

Doer: cluster reviewer (22 agents `*-reviewer`). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit` au niveau **PATTERN** (CLUSTERS.md §"Agent clusters"), pas une fiche par item.
Source ECC: `affaan-m/ecc` (MIT). Cible fiches: `packages/agents/library/<id>.md` (schéma Tier A/B de notre `reviewer.md`).
Dedup contre nos fiches existantes `packages/agents/fiches/` — surtout `reviewer.md` (mas-reviewer) et `sec-reviewer.md` (mas-sec-reviewer).
Sanitize: 22/22 sources clean — aucun `@anthropic-ai/sdk`, aucun `ANTHROPIC_API_KEY`, aucun secret/PII détecté.
Recadrage transverse: abonnement (§11, aucune métrique $), ≤7 outils/agent (les sources utilisent Read/Grep/Glob/Bash → conforme), reviewers en **lecture seule** (`fs_write: false`) même quand la source ECC déclarait `Write`/`Edit` (database/security/mle) → outils écriture **retirés** pour respecter notre convention "un reviewer propose, n'édite pas".

---

## Audit du PATTERN (décision unique pour les 16 reviewers par langage)

- **décision**: adopt-pattern → UNE fiche template paramétrée `packages/agents/library/language-reviewer.md`.
- **identité**: 16 agents ECC `*-reviewer` partagent une structure quasi identique — frontmatter (`tools: Read/Grep/Glob/Bash`, `model: sonnet`), un bloc `Prompt Defense Baseline` mot-pour-mot identique, un workflow "diff-first → toolchain gate → lattice CRITICAL→LOW → filtre >80% confiance → output sévérité-taggé". La SEULE variation réelle = (globs, commandes toolchain, foci par langage). C'est un paramètre `<lang>`, pas 16 agents.
- **fit**: alimente notre surface `code-review` en Tier B délégable par le dispatcher; comble le manque per-langage que `reviewer` (générique) ne couvre pas.
- **3 coûts**: install = 1 fiche + 1 table 16-lignes (faible); maintenance = 1 fichier à faire évoluer, pas 16 (faible, anti-drift); removal = trivial (1 fichier sous `library/`, réversible).
- **scores (0–5)**: project_fit 4 · token_efficiency 5 (1 fiche vs 16) · safety 5 (read-only, defense baseline) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun déclenché — pas de PAYG, pas de secret, pas d'exécution de code tiers, ≤7 outils, dans le scope Phase C.
- **dedup**: non-dup de `reviewer`/`sec-reviewer` (lane *langage* distincte; voir la table "Boundaries" de la fiche). React et Vue se co-délèguent avec `typescript` (lane TS générique vs lane framework).
- **appropriation MAOS**: schéma de fiche maison; paramètre `<lang>` documenté en frontmatter; `Prompt Defense Baseline` conservé; table langage→foci distillée des 16 sources; commentaire source `// pattern from affaan-m/ecc …`.
- **état**: fiche écrite, conforme (ligne 1 = `---`, commentaire source, `tier: B`, `model: claude-sonnet-4-6`, 4 outils ≤7, `domains:[code-review]`, Prompt Defense + Principles + Process + Red Flags + Verification Criteria + table 16 langages + Output).
- **re-audit**: si ECC ajoute une 17e langue ou si un foci diverge fortement → ajouter une ligne à la table, pas une fiche.

### Les 16 par langage → tous `adopt-pattern` (représentés par `language-reviewer.md`)

## cpp-reviewer
- décision: **adopt-pattern** — sécurité mémoire/concurrence/idiomes modernes; ligne `<lang>=cpp`.
## csharp-reviewer
- décision: **adopt-pattern** — async/.NET/nullable refs; ligne `<lang>=csharp`.
## django-reviewer
- décision: **adopt-pattern** — ORM/migrations/DRF/misconfig; ligne `<lang>=django`.
## fastapi-reviewer
- décision: **adopt-pattern** — auth endpoints/Pydantic/async; ligne `<lang>=fastapi`.
## flutter-reviewer
- décision: **adopt-pattern** — state mgmt/widgets/rebuilds; ligne `<lang>=flutter`.
## fsharp-reviewer
- décision: **adopt-pattern** — idiomes fonctionnels/Result-Option; ligne `<lang>=fsharp`.
## go-reviewer
- décision: **adopt-pattern** — erreurs/concurrence/races; ligne `<lang>=go`.
## java-reviewer
- décision: **adopt-pattern** — injection/JPA/concurrence; ligne `<lang>=java`.
## kotlin-reviewer
- décision: **adopt-pattern** — coroutines/Compose/Android; ligne `<lang>=kotlin`.
## php-reviewer
- décision: **adopt-pattern** — PSR-12/Eloquent/injection; ligne `<lang>=php`.
## python-reviewer
- décision: **adopt-pattern** — injection/type-hints/idiomes; ligne `<lang>=python`.
## react-reviewer
- décision: **adopt-pattern** — hooks/RSC/a11y; ligne `<lang>=react` (co-déléguer `typescript`).
## rust-reviewer
- décision: **adopt-pattern** — unwrap/unsafe/ownership; ligne `<lang>=rust`.
## swift-reviewer
- décision: **adopt-pattern** — ARC/concurrence/POP; ligne `<lang>=swift`.
## typescript-reviewer
- décision: **adopt-pattern** — type-safety/async/Node; ligne `<lang>=typescript`.
## vue-reviewer
- décision: **adopt-pattern** — réactivité/template-sec/Pinia; ligne `<lang>=vue` (co-déléguer `typescript`).

---

### Les 2 généralistes → `reject` (dup-not-better de nos fiches)

## code-reviewer
- décision: **reject**
- raison: dup-not-better de notre `packages/agents/fiches/reviewer.md` (mas-reviewer, Tier A). La source ECC = revue générique qualité/sécu/maintenabilité avec verdict PASS/NEEDS_WORK/BLOCK et filtre >80% confiance — exactement le rôle de notre `reviewer`. La seule valeur transférable (filtre confiance, consolidation des findings) est déjà reflétée dans `language-reviewer` (Principes 3, Process 5). Ne PAS recréer.
- dedup: oui — `reviewer.md` couvre intégralement.
- chemin library: aucun.
- re-audit: non (recouvrement structurel).

## security-reviewer
- décision: **reject**
- raison: dup-not-better de notre `packages/agents/fiches/sec-reviewer.md` (mas-sec-reviewer, Tier A, gate §5). La source ECC = OWASP/secrets/injection/SSRF avec verdict de gate — c'est notre `sec-reviewer`, qui en plus cite la catégorie `config/permissions.json` déclenchée (granularité supérieure). La source ECC déclare `Write`/`Edit` (remédiation) — incompatible avec notre convention reviewer read-only de toute façon. Ne PAS recréer.
- dedup: oui — `sec-reviewer.md` couvre, en mieux (ancrage permissions.json + default NEEDS_CHANGES).
- chemin library: aucun.
- re-audit: non.

---

### Les 4 verticaux → jugés individuellement

## database-reviewer
- décision: **adopt** (petite fiche propre)
- raison: delta domaine fort et non-dup — performance de requêtes (plans, sargabilité, N+1), design de schéma, **sécurité migration** (locks ACCESS EXCLUSIVE, perte de données, ordre online-safe), RLS/Supabase. Ni `reviewer`, ni `sec-reviewer`, ni `language-reviewer` ne couvrent la couche data. Source déclarait `Write/Edit` → **retirés** (read-only, `shell: scoped` pour EXPLAIN proposé en finding seulement).
- dedup: non — lane database absente de notre roster.
- chemin library: `packages/agents/library/database-reviewer.md`
- état: écrite, conforme (Tier B, sonnet-4-6, ≤7 outils, Prompt Defense + Principles + Process + Red Flags + Verification + Output, escalade migration-perte-données → sec-reviewer).

## mle-reviewer
- décision: **adopt** (petite fiche propre)
- raison: barre d'acceptation BROAD (CLUSTERS.md §6 — valeur dans son domaine même sans usage MAOS courant). Delta non-dup: data-leakage, reproductibilité d'entraînement (seeds/versions pinnées), rigueur d'évaluation offline/online, promotion+rollback de modèle. La source *réutilise* explicitement les lanes existantes (langage/sécu) → recadrée pareil chez nous. Verticaux ML cohérent et réutilisable comme arsenal.
- dedup: non — aucune lane ML chez nous.
- chemin library: `packages/agents/library/mle-reviewer.md`
- état: écrite, conforme (Tier B, sonnet-4-6, ≤7 outils, leakage/irreproductibilité = blocking, escalade promotion-sans-rollback + PII/PHI → sec-reviewer).

## network-config-reviewer
- décision: **reject**
- raison: vertical hors-produit — revue de configs routeurs/switchs (stale refs, fenêtres de changement risquées, garde-fous opérationnels réseau). Aucune surface MAOS (cockpit local-first multi-agent dev, pas d'infra réseau). Faible réutilisabilité, domaine orthogonal. KILL: out-of-product (CLUSTERS.md "VERTICAL: out-of-product → keep if strong in domain, else reject"); ici pas d'ancrage MAOS.
- dedup: n/a (pas de recouvrement, mais aucun usage).
- chemin library: aucun.
- re-audit: si un projet "infra/network" est explicitement enregistré dans MAOS.

## healthcare-reviewer
- décision: **reject**
- raison: vertical hors-produit — sécurité clinique, exactitude CDSS, conformité PHI, intégrité de données médicales (EMR/EHR). Domaine réglementaire spécialisé sans surface MAOS; `model: opus` (coûteux) pour un domaine que l'utilisateur ne cible pas (projet réel = OtakuGO manga, voir mémoire). La sécurité générique (PII/secrets) est déjà couverte par `sec-reviewer`. KILL: out-of-product + coût modèle opus non justifié.
- dedup: partiel — la part PII/secrets recoupe `sec-reviewer`; le reste (clinique/CDSS) = hors scope.
- chemin library: aucun.
- re-audit: si un projet santé est explicitement enregistré dans MAOS.

---

## Récap (22)

| # | agent | décision | cible |
|---|---|---|---|
| 1–16 | cpp/csharp/django/fastapi/flutter/fsharp/go/java/kotlin/php/python/react/rust/swift/typescript/vue | adopt-pattern | `library/language-reviewer.md` |
| 17 | code-reviewer | reject | dup `reviewer.md` |
| 18 | security-reviewer | reject | dup `sec-reviewer.md` |
| 19 | database-reviewer | adopt | `library/database-reviewer.md` |
| 20 | mle-reviewer | adopt | `library/mle-reviewer.md` |
| 21 | network-config-reviewer | reject | out-of-product |
| 22 | healthcare-reviewer | reject | out-of-product |
