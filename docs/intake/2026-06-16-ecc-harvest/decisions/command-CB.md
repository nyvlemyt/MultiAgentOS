# ECC Harvest — décisions lot commands `CB` (46 commandes)

Doer: lot commands-CB (46 commandes). Worktree `maos-ecc`. Méthode: dedup-map d'abord (CLUSTERS.md §Commands), puis `intake-audit` barre LARGE uniquement sur les WORKFLOW.
Source ECC: `affaan-m/ecc` (MIT), `/tmp/ecc-inspect/commands/<name>.md`. Cible des adoptés: `.claude/commands/<name>.md` réécrits aux conventions MAOS.
Dedup contre `our-assets-index.md` (24 skills, 56 agents, 1 commande, 7 fiches Tier B) + `packages/agents/library/` (dont `language-reviewer`, `build-resolver`) + agents orchestrateurs (`mas-mission-planner/reviewer/sec-reviewer/skill-router`) + router-core (§11.bis) + `promoteSkill`.
Recadrage transverse: MAOS = abonnement (§11), pas de coût per-token (tout chiffre = unités de quota). §5: pas d'exec/egress externe non gated, pas de `--force`, pas de `npx` non-épinglé tiers, pas de modèles externes (Codex/Gemini) hors `RouterLLMClient`.

**Bilan**: 4 adoptés (WORKFLOW génériques) · 42 skips (WRAPPER d'agents/skills déjà possédés, ou DUP/tool-specific/egress).

---

## pr
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: flux de création de PR (validate → discover template → push → create → verify) que MAOS ne possède pas en commande. Générique, pas d'egress. Recadré §5/§7: `git push --force` interdit (seul `--force-with-lease` après rebase propre autorisé), STOP si branche = `main`, jamais de `reset --hard`/suppression de branche pour "réparer" une divergence, PR ouverte en **draft** par défaut, titre Conventional Commits ≤60 (§7), section Testing = les 5 checks. N'invoque aucun agent → pas de Prompt Defense Baseline requis.
- **chemin**: `.claude/commands/pr.md`

## test-coverage
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: flux générique detect-framework → analyse worst-first → génère les tests manquants → vérifie, vers un seuil 80%. Pas d'egress, aligne directement §7 (Vitest + TDD). Recadré MAOS: Vitest par défaut + `pnpm --filter` pour scoper le workspace, et **mock LLM obligatoire** dans les tests unitaires (§6). N'invoque aucun agent.
- **chemin**: `.claude/commands/test-coverage.md`

## update-codemaps
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: génère des cartes d'architecture token-lean (chemins + signatures) sous `docs/CODEMAPS/`. Lentille DISTINCTE de `mas-context-manager`: codemap = doc durable d'archi versionnée; context-pack = injection runtime ≤4k cachée sous `data/`. Cadrage explicite de la différence dans le corps + exemples MAOS (monorepo pnpm, `packages/core/src/llm.ts` injection point). Seuil token <1000 aligné §6. Pas d'egress, n'invoque aucun agent.
- **chemin**: `.claude/commands/update-codemaps.md`

## update-docs
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: synchronise la doc depuis les sources de vérité (scripts `package.json`, `.env.example`, routes, exports), sections générées uniquement. Workflow génératif distinct du skill `doc-coauthoring` (rédaction guidée) — ici c'est de la dérivation mécanique. Recadré §5/§11: ne jamais imprimer de valeur secrète (placeholders `.env.example` seulement), `ANTHROPIC_API_KEY` = smell à signaler pas à documenter; §3 (pas de top-level sans MAJ CLAUDE.md), §7 (gate 5 checks dans CONTRIBUTING). Pas d'egress, n'invoque aucun agent.
- **chemin**: `.claude/commands/update-docs.md`

---

## Skips — WRAPPER (couvert par un agent/skill déjà possédé)

## python-review
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `python-reviewer` → couvert par notre `packages/agents/library/language-reviewer`.

## react-review
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `react-reviewer`+`typescript-reviewer` → couvert par `language-reviewer`.

## rust-review
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `rust-reviewer` → couvert par `language-reviewer`.

## vue-review
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `vue-reviewer`+`typescript-reviewer` → couvert par `language-reviewer`.

## react-build
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `react-build-resolver` → couvert par notre `build-resolver`.

## rust-build
- **tag**: WRAPPER · **décision**: skip · **raison**: appelle `rust-build-resolver` → couvert par notre `build-resolver`.

## react-test
- **tag**: WRAPPER · **décision**: skip · **raison**: flux TDD React → couvert par `superpowers:test-driven-development` + `test-coverage` adopté.

## rust-test
- **tag**: WRAPPER · **décision**: skip · **raison**: flux TDD Rust → couvert par `superpowers:test-driven-development` + `test-coverage` adopté.

## plan
- **tag**: WRAPPER · **décision**: skip · **raison**: planification restate→risks→steps → couvert par `mas-mission-planner` (produit le DAG).

## plan-prd
- **tag**: WRAPPER · **décision**: skip · **raison**: génère un PRD puis délègue à plan → couvert par mission-planner + notre spec PRD (§9).

## review-pr
- **tag**: WRAPPER · **décision**: skip · **raison**: review multi-agent d'une PR → couvert par `mas-reviewer` + `.claude/commands/security-review.md`.

## skill-create
- **tag**: WRAPPER · **décision**: skip · **raison**: génère des SKILL.md → couvert par notre skill `skill-creator` (et la doctrine §12).

## refactor-clean
- **tag**: WRAPPER · **décision**: skip · **raison**: suppression de dead-code vérifiée → couvert par l'agent `refactor-cleaner` (déjà cible du harvest agents).

## promote
- **tag**: WRAPPER · **décision**: skip · **raison**: promeut des instincts ECC → équivalent conceptuel de notre `promoteSkill`; en plus dépendant du CLI instinct ECC.

## orch-build-mvp
- **tag**: WRAPPER · **décision**: skip · **raison**: wrapper de la skill ECC GAN-harness `orch-build-mvp` (non adoptée) → notre lifecycle planner→dispatch→review couvre.

## orch-add-feature
- **tag**: WRAPPER · **décision**: skip · **raison**: wrapper skill ECC `orch-add-feature` (non adoptée) → couvert par le lifecycle.

## orch-change-feature
- **tag**: WRAPPER · **décision**: skip · **raison**: wrapper skill ECC `orch-change-feature` (non adoptée) → couvert par le lifecycle.

## orch-fix-defect
- **tag**: WRAPPER · **décision**: skip · **raison**: wrapper skill ECC `orch-fix-defect` (non adoptée) → couvert par le lifecycle.

## orch-refine-code
- **tag**: WRAPPER · **décision**: skip · **raison**: wrapper skill ECC `orch-refine-code` (non adoptée) → couvert par le lifecycle.

---

## Skips — DUP / tool-specific / unsafe (egress, runtime externe, §5/§11)

## model-route
- **tag**: DUP · **décision**: skip · **raison**: recommande un tier modèle → c'est notre `RouterLLMClient` + `config/model-routing.json` (§11.bis).

## multi-plan
- **tag**: tool-specific/egress · **décision**: skip · **raison**: requiert runtime externe `ccg-workflow` (`npx ccg-workflow`) + modèles Codex/Gemini hors `RouterLLMClient` (§5/§11.bis).

## multi-workflow
- **tag**: tool-specific/egress · **décision**: skip · **raison**: idem ccg-workflow + Codex/Gemini; workflow 6 phases = notre lifecycle.

## multi-backend
- **tag**: tool-specific/egress · **décision**: skip · **raison**: idem ccg-workflow, Codex-led; exec/egress externe non gated.

## multi-frontend
- **tag**: tool-specific/egress · **décision**: skip · **raison**: idem ccg-workflow, Gemini-led; exec/egress externe non gated.

## multi-execute
- **tag**: tool-specific/egress · **décision**: skip · **raison**: idem ccg-workflow; exécution multi-modèle = notre dispatcher (Claude seul écrit, §11.bis).

## pm2
- **tag**: tool-specific · **décision**: skip · **raison**: génère des commandes de service PM2; hors périmètre MAOS (local-first, worker `tsx`).

## setup-pm
- **tag**: tool-specific · **décision**: skip · **raison**: configure le package-manager; MAOS = pnpm verrouillé (CLAUDE.md §2), non négociable.

## santa-loop
- **tag**: DUP/egress · **décision**: skip · **raison**: dual-review adversarial avec un modèle externe (egress, §5); revue = `mas-reviewer`/`quality-controller`.

## project-init
- **tag**: tool-specific · **décision**: skip · **raison**: onboarding ECC (`.claude/` install manifests ECC); MAOS enregistre les projets par chemin absolu (detectStack déjà construit).

## projects
- **tag**: tool-specific · **décision**: skip · **raison**: liste le registry d'instincts ECC via CLI continuous-learning; MAOS a sa propre table projects.

## sessions
- **tag**: tool-specific · **décision**: skip · **raison**: gère l'historique de sessions Claude Code (`~/.claude/session-data/`); hors état MAOS (`data/`, §8).

## resume-session
- **tag**: tool-specific · **décision**: skip · **raison**: recharge un fichier de session ECC; resume = surface SDK/worker MAOS, pas une commande.

## save-session
- **tag**: tool-specific · **décision**: skip · **raison**: écrit un fichier de session daté ECC hors `data/` (§8); non aligné.

## skill-health
- **tag**: tool-specific · **décision**: skip · **raison**: dashboard via CLI skill-health ECC (sparklines/amendments); dépend du runtime ECC, pas de notre registry.

## prune
- **tag**: tool-specific · **décision**: skip · **raison**: supprime les instincts ECC >30j via `instinct-cli.py`; dépend du runtime continuous-learning ECC.

## quality-gate
- **tag**: DUP/tool-specific · **décision**: skip · **raison**: pilote le hook ECC `scripts/hooks/quality-gate.js` + env `ECC_QUALITY_GATE_*`; notre qualité = gate 5 checks (§7) + `quality-controller`.

## security-scan
- **tag**: WRAPPER/egress · **décision**: skip · **raison**: wrappe AgentShield (`npx ecc-agentshield` non épinglé + action GitHub `affaan-m/agentshield@v1` = egress, §5); couvert par `mas-sec-reviewer` + `security-review.md`.

## prp-prd
- **tag**: WRAPPER/DUP · **décision**: skip · **raison**: générateur PRD interactif → recouvre `plan-prd`/mission-planner + notre spec PRD.

## prp-plan
- **tag**: WRAPPER/DUP · **décision**: skip · **raison**: plan d'implémentation détaillé → couvert par `mas-mission-planner`.

## prp-implement
- **tag**: DUP · **décision**: skip · **raison**: exécute un plan avec validation-loops → c'est notre dispatcher + gate de vérification.

## prp-commit
- **tag**: DUP · **décision**: skip · **raison**: staging NL + commit; recoupe la discipline commit §7, et conflit avec "commit seulement si demandé".

## prp-pr
- **tag**: DUP · **décision**: skip · **raison**: corps quasi identique à `pr` (+ habillage PRP); `pr` adopté couvre, recadré §5.
