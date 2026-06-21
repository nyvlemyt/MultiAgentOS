# ECC Harvest — décisions agents lot S4 (singletons pipeline open-source + perf/test/plan)

Doer: lot S4 (6 agents singletons). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: `intake-audit` cycle complet par agent, barre AGENTS.md (Tier B = fonction appelable, ≤7 outils, schema fiche §2).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/agents/library/<name>.md` (format fiche MAOS).
Dedup contre: roster Tier A (`mas-mission-planner`, `mas-reviewer`), library Tier B existante (`code-architect`, `architect`, `doc-updater`, `mle-reviewer`), skill `intake-audit` (étape sanitizer déjà absorbée en B2).
Recadrage transverse: MAOS = abonnement (§11) → tout `$/€` devient unités de quota. §5 → strip exécution/egress externe (curl|sh, push, git-history rewrite, network). §8 → l'arbre du projet externe est read-only-by-default; un agent *propose* un diff, il ne réécrit pas l'arbre source.
Sanitize (regex secrets/PII/internal): 6/6 sources clean. `@anthropic-ai/sdk`: absent des sources.

Verdict: **3 keepers** (`performance-optimizer`, `pr-test-analyzer`, `opensource-packager` recadré scaffolder) · **3 rejects** (`planner`, `opensource-forker`, `opensource-sanitizer`).

---

## performance-optimizer
- **décision**: adapt
- **raison**: lentille d'ingénierie de performance dense et autonome — profiling (bottlenecks, fuites mémoire), budget de bundle, complexité algorithmique (O(n²)→Map), anti-patterns React (memo/callback/keys), N+1 et index SQL, réseau (Promise.all, cache, debounce), Core Web Vitals. Aucun équivalent dans le roster: `mas-reviewer` vérifie la correction du diff, pas la perf; `code-architect` conçoit, ne profile pas. Valeur en propre dans son domaine, conforme à la barre BROAD.
- **dedup**: non — distinct de Reviewer (correction) et des `*-reviewer` (style/idiomes par langage). Recouvre la place du futur `testing-performance-benchmarker` (§6 AGENTS.md, non encore fiché) → cet agent **est** ce gate, en plus riche.
- **recadrage**: read-only (`fs_write: false`) — il *propose* un rapport + diffs, il ne réécrit pas l'arbre (§8). Bash scopé inspection/profiling local; chiffres = quota/latence, jamais `$`. Outils ramenés à 5 (Read, Grep, Glob, Bash + Edit pour patch proposé) — sous le plafond ≤7.
- **chemin library**: `packages/agents/library/performance-optimizer.md`
- **état**: keeper, fiche écrite au format §2 (frontmatter complet, Prompt Defense Baseline, Principles citant la source, Process, Red Flags, Verification Criteria binaires). model: sonnet (analyse, pas haut-risque).

## pr-test-analyzer
- **décision**: adapt
- **raison**: reviewer de *qualité de couverture de test* — mappe le code modifié → tests existants, traque chemins non testés, exige couverture comportementale (edge cases, chemins d'erreur) plutôt que des assertions no-throw, note les lacunes par impact (critical/important/nice-to-have). Complète la doctrine TDD (`superpowers:test-driven-development`) et le gate Reviewer. Lentille unique, performante.
- **dedup**: non — `mas-reviewer` juge la correction du diff, `mle-reviewer` est ML-spécifique; aucun n'audite la *suffisance comportementale de la suite de tests*. Angle orthogonal réutilisable sur tout PR.
- **recadrage**: déjà read-only à la source (Read/Grep/Glob/Bash, 4 outils ≤7). Reframe: rattaché au pipeline de vérification MAOS (avant le gate Reviewer), pas un outil PR GitHub autonome; Bash scopé lecture/exécution de tests locale, pas d'egress. model: sonnet.
- **chemin library**: `packages/agents/library/pr-test-analyzer.md`
- **état**: keeper, fiche écrite au format §2.

## opensource-packager
- **décision**: adapt (recadrage lourd → "project scaffolder")
- **raison**: la machinerie open-source (git-history, LICENSE de release, `.github/`, `setup.sh` exécutable, publication) sort du scope MAOS (§5 egress/exécution, §8 no-copy). MAIS une lentille distincte survit: **bootstrap à froid d'un projet fraîchement enregistré** — analyser le stack et *proposer* un `CLAUDE.md` d'onboarding (contexte Claude Code) + un scaffold d'amorçage. Cela mappe directement le flux d'onboarding MAOS (stack-detect → context-pack → CLAUDE.md proposé).
- **dedup**: partiel mais non bloquant — `doc-updater` *maintient/synchronise* des docs existantes (refresh, drift, timestamp), scopé surface docs; le packager fait du *cold-start* (rien n'existe encore) et produit un `CLAUDE.md` d'onboarding, pas une codemap de maintenance. Delta non-dup. La fiche défère explicitement la synchro continue à `doc-updater` pour éviter le chevauchement.
- **recadrage**: `fs_write: false` — *propose* un diff (CLAUDE.md + README d'onboarding), n'écrit jamais dans l'arbre externe (§8 read-only-by-default). Strip: réécriture git-history, LICENSE de release, `.github/ISSUE_TEMPLATE`, `chmod +x setup.sh`, toute publication/egress (§5). Outils: Read, Grep, Glob, Bash (lecture stack) = 4 ≤7. Tout `$` → quota. model: sonnet.
- **chemin library**: `packages/agents/library/opensource-packager.md`
- **état**: keeper recadré, fiche écrite au format §2. Note: garde l'`id: opensource-packager` (traçabilité origine) mais rôle = "Project Scaffolder".

## planner
- **décision**: reject
- **raison**: agent de planification (Read/Grep/Glob, opus) produisant un plan d'implémentation phasé. Dup-not-better de notre Tier A `mas-mission-planner` (NL → questions de clarification → DAG typé avec dépendances/risque/budget, schema JSON) couplé au Tier B `code-architect` (blueprint concret, build dependency-ordered) et `architect` (design + ADR). La lentille phasing/sizing (phases livrables indépendamment, red flags >50 lignes/nesting) est déjà couverte par `code-architect` (séquence build) et `mas-mission-planner` (décomposition 3–7 tâches). Rien d'unique à ajouter.
- **dedup**: oui — recouvrement frontal avec `mas-mission-planner` (planification/DAG) + `code-architect` (blueprint phasé). Garder un troisième planner = doublon de surface, coûteux (opus).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: dup-not-better d'un agent Tier A déjà construit (`mas-mission-planner`) + d'un Tier B existant (`code-architect`); aucune lentille résiduelle non absorbée. Re-audit: non — conflit structurel (MAOS a déjà sa couche planification). Re-ouvrir seulement si `mas-mission-planner` était retiré du roster.

## opensource-forker
- **décision**: reject
- **raison**: première étape du pipeline open-source: **copie** un projet dans un staging, strip secrets (20+ regex), remplace références internes, réécrit l'historique git (`git init` + commit unique), génère `.env.example`. Contredit la doctrine fondatrice MAOS: §1/§8 — MAOS **ne copie/déplace/clone jamais** le code externe dans le repo; les projets sont enregistrés par chemin absolu, read-only-by-default. La seule lentille sûre (regex de détection de secrets) est **déjà absorbée** dans le skill `intake-audit` (étape sanitizer, Phase B2).
- **dedup**: oui — la détection de secrets/PII = déjà dans `intake-audit`; la copie/staging = interdite par construction (§8).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: viole §1/§8 (copie d'arbre externe dans le repo) + réécriture git-history (§5) + lentille secrets = dup déjà folded dans `intake-audit`. Re-audit: non (conflit structurel avec le modèle local-first read-only).

## opensource-sanitizer
- **décision**: reject
- **raison**: deuxième étape du pipeline: audit read-only de sanitisation pré-release (scan secrets/PII/refs internes/fichiers dangereux/historique git, verdict PASS/FAIL). Sa lentille a été **explicitement foldée dans le skill `intake-audit`** (étape sanitizer) en Phase B2 — `intake-audit` exige déjà un scan secrets/PII/internal clean avant ingestion (cf. en-têtes des shards: "Sanitize (regex secrets/PII/internal): clean"). Adopter un agent séparé = redéclarer la même capacité.
- **dedup**: oui — déjà absorbé dans `intake-audit` (sanitizer stage). Le résidu (verdict open-source-release) sort du scope MAOS (§8: MAOS ne publie pas de repos).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: capacité déjà foldée dans `intake-audit` (Phase B2) → dup-not-better; le delta restant (release-gate open-source) = hors-scope §8. Re-audit: non (capacité déjà possédée).
