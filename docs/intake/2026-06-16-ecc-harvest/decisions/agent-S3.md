# ECC Harvest — décisions agents singletons (lot S3)

Doer: lot agent-S3 (7 agents singletons). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit` plein cycle, un audit par agent, barre LARGE (garde tout ce qui est non-dup / non-stub / performant / fort-dans-son-domaine — la spécificité-domaine n'est PAS un motif de rejet).
Source ECC: `affaan-m/ecc` (MIT). Cible keeper: `packages/agents/library/<name>.md` (Tier B boosté, format fiche MAOS).
Dedup HARD contre `packages/agents/fiches/` (7 fiches Tier A: mission-planner, skill-router, context-manager, memory-keeper, reviewer, sec-reviewer, quality-controller).
Recadrage transverse: MAOS = abonnement (§11), tout chiffre = unités de quota jamais $/€. Tout exec/egress externe (device config push, envois réseau sortants, WebSearch/WebFetch) = strippé ou marqué §5-gated (gate humain). `≤7 tools` respecté partout. `@anthropic-ai/sdk`: absent des 7 sources.
Sanitize (regex secrets/PII/internal): 7/7 sources clean.

Les 7 agents sont des **keepers** (5 adopt, 2 adapt). Aucun dup-not-better, aucun stub, aucun unsafe-par-construction. Le lot couvre 3 verticales: agentic-infra (harness-optimizer, loop-operator), image-gen (gan-planner, complète le trio GAN), networking (homelab-architect, network-architect, network-troubleshooter) + 1 marketing (marketing-agent).

---

## gan-planner
- **décision**: adopt
- **raison**: complète le trio GAN (generator/evaluator audités ailleurs). Persona Product-Manager qui transforme un prompt d'une ligne en spec produit complète (vision, design direction anti-AI-slop, features priorisées par sprint, rubrique d'évaluation pondérée, plan de sprint). Domaine image/app-gen distinct de `mission-planner` (qui produit un DAG de tâches typées, pas une spec produit narrative avec rubrique design). Forte valeur de cadrage créatif.
- **dedup**: non — `mission-planner` (Tier A) décompose une mission en DAG ; ici on produit une *spec produit* + rubrique d'éval consommée par le Generator/Evaluator. Lentilles orthogonales (planification d'exécution vs cadrage produit).
- **recadrage §5/§11**: écrit sa spec sous `gan-harness/` (sandbox projet) — aucun egress, aucun exec. Tools = Read/Write/Grep/Glob (4 ≤ 7). Aucun coût $.
- **chemin library**: `packages/agents/library/gan-planner.md`
- **état**: keeper. Boosté au format fiche MAOS (frontmatter complet tier B, model opus car cadrage à fort levier sur tout le pipeline GAN aval, Prompt Defense Baseline conservé, Principles citant la source, Process, Red Flags, Verification Criteria binaires). Re-audit: si le trio GAN est retiré du backlog image-gen.

## harness-optimizer
- **décision**: adopt
- **raison**: agentic-infra à fort levier — optimise la *configuration du harness* (hooks, evals, routing, contexte, sécurité) sans réécrire le code produit. Lentille mesure-baseline → top-3 leviers → changements minimaux réversibles → validation → deltas avant/après. Aucune fiche ne couvre l'auto-amélioration de la surface harness. Pilier de la doctrine "l'outil qui construit doit être construit avec le meilleur harness" (CLAUDE.md §13).
- **dedup**: non — `quality-controller` vérifie le respect des règles par les outputs ; ici on *tune la config* qui produit les outputs. Distinct de `context-budget` (skill, audit de surface de prompt statique) : ici c'est hooks/evals/routing runtime.
- **recadrage §5/§11**: `Edit` peut toucher `config/` → tout changement config = §5-gated (gate humain) car modifie le comportement du harness (routing, safety). `Bash` borné read-only (collecte baseline). $ → unités de quota (cost drift = budget window §8). `/harness-audit` ECC réancré sur l'audit interne MAOS (events + budgets), pas une commande externe épinglée.
- **chemin library**: `packages/agents/library/harness-optimizer.md`
- **état**: keeper. Boosté (model opus — high-risk, édite la config qui gouverne tous les agents). Re-audit: à l'ajout d'un système d'evals runtime MAOS (alors recadrer la baseline scorecard dessus).

## loop-operator
- **décision**: adapt
- **raison**: opère des boucles d'agents autonomes avec stop-conditions, observabilité, recovery. Lentille run-safe : checkpoints, détection stall/retry-storm, réduction de scope sur échec répété, reprise après vérif. Recadré sur l'autopilot scheduler MAOS (Phase 6) + table `budgets`.
- **dedup**: chevauche l'autopilot scheduler (Phase 6, déjà construit) MAIS la lentille *opérateur* (surveiller une boucle en vol, intervenir sur stall, recovery gradué) est exécution-time et distincte du *scheduler* (qui décide quoi lancer). Reframé pour s'appuyer sur les gates existants (quality gates actifs, eval baseline, rollback path, isolation worktree) plutôt que de les redéfinir.
- **recadrage §5/§11**: `cost drift outside budget window` → `budget_exceeded` (§8, table `budgets`, unités de quota). `Edit`/`Bash` bornés à la reprise/réduction-de-scope sandbox ; toute action risquée (rm, reset, push) reste §5-gated. Isolation worktree obligatoire (déjà une required-check de la source).
- **chemin library**: `packages/agents/library/loop-operator.md`
- **état**: keeper (adapt). Boosté (model sonnet — opération normale, escalade vers gate humain). Re-audit: après l'intégration delegate-into-dispatch live (5b) pour vérifier non-redondance avec runDispatchTick.

## homelab-architect
- **décision**: adopt
- **raison**: verticale networking forte-en-domaine — plan réseau home/small-lab depuis inventaire matériel + objectifs + niveau opérateur, avec phases sûres et rollback anti-lockout. Planning/review only (≤2 tools), défauts de sécurité explicites (pas d'exposition management, pas de désactivation firewall comme raccourci). Spécificité-domaine ≠ rejet (barre large).
- **dedup**: non — aucune fiche networking dans MAOS. Distinct de `network-architect` (enterprise/multi-site) : ici home/lab, opérateur souvent débutant, vocabulaire expliqué.
- **recadrage §5/§11**: déjà planning-only — ne présente AUCUNE config copy-paste tant que plateforme/topologie/backup/console/rollback inconnus. Toute pousse de config device = §5-gated (gate humain, hors sandbox MAOS). Tools Read/Grep (2). Aucun egress.
- **chemin library**: `packages/agents/library/homelab-architect.md`
- **état**: keeper. Boosté (model sonnet). Re-audit: si une verticale "infra/réseau" est explicitement scopée en ROADMAP (alors enrichir avec skills réseau dédiés en favorite_skills).

## marketing-agent
- **décision**: adapt
- **raison**: stratège marketing + copywriter conversion (campagne, recherche audience, positionnement, landing/email/social/ad/vidéo, content calendar, gate copy-review). Workflow ordonné positionnement→deliverables, hard-bans clichés, checklist de revue. Fort dans son domaine.
- **dedup**: chevauche le skill `marketing-campaign` (référencé par la source elle-même) MAIS la source EST l'*agent persona + gate copy-review* qui orchestre ce skill ; pas un dup, une couche au-dessus. Reframé pour déléguer au futur skill `marketing-campaign` plutôt que dupliquer son contenu.
- **recadrage §5/§11**: `WebSearch`/`WebFetch` = egress réseau → §5-gated (recherche audience/concurrence via hosts allowlistés `config/permissions.json#allowed_hosts`, sinon refus). Tools réduits à Read/Grep/Glob + WebSearch/WebFetch (5 ≤ 7, les 2 egress marqués gated). Aucun $ (ROI = qualité, pas dépense pub réelle — MAOS ne paie aucune campagne).
- **chemin library**: `packages/agents/library/marketing-agent.md`
- **état**: keeper (adapt). Boosté (model sonnet). Re-audit: à l'ingestion du skill `marketing-campaign` (alors câbler en required_skills + dédup finale du workflow).

## network-architect
- **décision**: adopt
- **raison**: verticale networking enterprise/multi-site forte-en-domaine — design implémentable depuis exigences business/technique (adressage, segmentation, domaines de routage, management-plane, redondance, monitoring, séquencement de migration), route le détail vers des skills réseau focalisés au lieu d'inventer des runbooks device-specific. Design/review only (≤2 tools).
- **dedup**: non — distinct de `homelab-architect` (home/lab) par l'échelle et la posture (capacity classes, pas de modèles hardware exacts, gates de validation par phase). Aucune fiche enterprise-net dans MAOS.
- **recadrage §5/§11**: déjà design-only — n'applique aucune config, ne présente de commandes que si explicitement read-only. Toute pousse device = §5-gated (console/OOB + backup + fenêtre + rollback requis avant recommandation). Tools Read/Grep (2). Aucun egress.
- **chemin library**: `packages/agents/library/network-architect.md`
- **état**: keeper. Boosté (model sonnet). Re-audit: avec `homelab-architect` si verticale réseau scopée.

## network-troubleshooter
- **décision**: adopt
- **raison**: diagnostic réseau read-only par couches OSI (L1/L2/L3/DNS/policy-firewall), workflow systématique symptôme→couche→evidence→root-cause→vérif, guardrails explicites (jamais retirer ACL/firewall/auth pour tester). Fort dans son domaine.
- **dedup**: non — aucun agent de diagnostic réseau dans MAOS. Complémentaire des deux architectes (eux conçoivent, lui diagnostique).
- **recadrage §5/§11**: `Bash` borné aux commandes de diagnostic READ-ONLY (show/ping/traceroute/dig) ; toute commande qui change l'état = labellisée remédiation, jamais diagnostic, et §5-gated. Ne retire jamais de contrôle de sécurité. Tools Read/Bash/Grep (3). Aucun egress sortant initié (commandes locales/lecture).
- **chemin library**: `packages/agents/library/network-troubleshooter.md`
- **état**: keeper. Boosté (model sonnet). Re-audit: avec la verticale réseau.

---

## Synthèse lot S3
7 audités · 7 keepers (5 adopt, 2 adapt) · 0 reject.
- adopt: gan-planner, harness-optimizer, homelab-architect, network-architect, network-troubleshooter
- adapt: loop-operator (vs autopilot scheduler P6), marketing-agent (vs skill marketing-campaign)
Tous écrits sous `packages/agents/library/`. Aucun `ledger.tsv`/git touché. Recadrages §5 (egress/device-config gated) + §11 (quota, pas de $) appliqués partout. `≤7 tools` respecté.
