# ECC Harvest — décisions cluster `skill:data-ml` (lot G)

Doer: lot data-ml G (3 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2 arsenal, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) et `CLUSTERS.md` (bucket DATA/ML, T2).
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Tout chiffre = unités de quota, jamais $/€.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 3/3 sources clean (scan grep négatif). Aucun import SDK, aucun secret, aucune exécution tierce non-épinglée dans les corps gardés.

---

## data-throughput-accelerator
- **décision**: adapt
- **raison**: doctrine d'accélération de débit data (backfill/ETL/warehouse load/manifest catch-up) qui sépare 6 goulots distincts avant d'optimiser, benchmark des variantes, et exige un bloc d'accounting réconcilié (counts + max-timestamps) comme livrable. Lentille correctness-with-speed forte et réutilisable. Recadré §5 (no silent destructive ops — ne jamais supprimer du raw pour flatter une métrique, ne jamais skip silencieusement un fichier échoué) et §8 (état dans `data/`).
- **dedup**: non — aucun skill `.claude/skills/` ne couvre l'accélération de débit data; les agents `Data Engineer`/`Database Optimizer` sont des *agents* (rôles), pas une procédure opératoire bottleneck-split + accounting. Pas de chevauchement.
- **chemin library**: `packages/skills/library/data-throughput-accelerator/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, frontmatter name/description Use+Do NOT/summary L1/metadata{origin:affaan-m/ecc,license:MIT,cluster:skill:data-ml,tier:T2,status:library}, commentaire source, Prompt Defense Baseline verbatim, 8 sections = Overview + When + Principles(cite source) + Process(+ accounting block) + Rationalizations table + Red Flags + Verification binaire). 0 sdk, 0 secret.

## pytorch-patterns
- **décision**: adapt
- **raison**: arsenal d'idiomes PyTorch (device-agnostic, reproductibilité seeds+cudnn, gestion explicite des shapes, train/eval mode, protection du graphe autograd, checkpoint full-state, AMP/gradient-checkpointing/torch.compile) + liste d'anti-patterns qui corrompent silencieusement (eval mode manquant, in-place cassant autograd, `.item()` avant backward, `torch.save(model)`). Skill de discipline de code/review, pas un trainer. Forte densité de signal, valeur arsenal claire.
- **dedup**: non — `AI Engineer` est un agent généraliste ML; aucun skill ne porte les idiomes PyTorch concrets. Pas de duplicat.
- **chemin library**: `packages/skills/library/pytorch-patterns/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, frontmatter complet, commentaire source, Prompt Defense Baseline verbatim, 8 sections incl Principles citant la source + Verification binaire). Recadrage léger: source déjà framée subscription-neutre (pas de $/€). Snippets de code conservés tels quels (idiomes valides, aucun secret/import SDK). 0 sdk, 0 secret.

## recsys-pipeline-architect
- **décision**: adapt
- **raison**: framework spec-and-scaffold pour pipelines top-K composables — pattern 6 étages Source→Hydrator→Filter→Scorer→Selector→SideEffect (popularisé par le For You de xAI, Apache 2.0; réimplémentation indépendante MIT, aucun code copié). Ordre des étages load-bearing (filtre avant scoring = la lentille coût; side-effects async = correctness). Applicable au-delà des feeds (RAG reranker, triage notifs, task prioritizer) → réutilisable comme arsenal MAOS. Hard rules conservées: pas de benchmarks inventés, discipline d'attribution, pas de branding marque, scaffold qui tourne.
- **dedup**: non — aucun skill/agent MAOS ne couvre l'architecture de pipeline de ranking/recsys. Pas de chevauchement.
- **appropriation/strip**: la mention upstream `npx skills add mturac/...` (exécution tierce non-épinglée) et la section "Upstream contents" promotionnelle ont été **strippées** du corps boosté; seules l'attribution du pattern (xAI Apache 2.0) et l'origine MIT sont conservées. Aucune egress tierce dans le corps gardé.
- **chemin library**: `packages/skills/library/recsys-pipeline-architect/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, frontmatter complet, commentaire source, Prompt Defense Baseline verbatim, 8 sections incl Principles citant la source + Verification binaire). 0 sdk, 0 secret.

---

Re-audit: re-checker si `affaan-m/ecc` publie des révisions majeures de ces skills (>6 mois de drift) ou si un futur usage MAOS concret (mission data/ML, recsys interne) demande de promouvoir un keeper de `library` vers `.claude/skills/`.
