# RESUME PROMPT — nouvelle session : upgrades connaissance + récolte awesomeclaude.ai

> Coller tout ce qui suit la ligne dans une session Claude Code fraîche ouverte sur MultiAgentOS.
> Mémoires `project_ecc-harvest`, `feedback_*`, `project_linked_memory`, `project_ui_arsenal_console` portent le contexte. Worktree de travail : `/Users/melvyn/Documents/02_PROJETS/maos-ecc` (branche `phase/ecc-harvest`, PR #32 DRAFT). Ne pas toucher le checkout principal.

---

Tu reprends MultiAgentOS après la campagne ECC Harvest (terminée : 877 skills + 32 agents froids, doctrine distillée dans `docs/knowledge/`). **Deux chantiers**, full-auto, PR #32 reste DRAFT (l'utilisateur merge). Budget : ~100€/mois (cf. `user_token-budget`), quota pas un frein mais surveiller le session-limit (~4 h reset Europe/Paris).

## CHANTIER 1 — Appliquer les distillations citées (connaissance + archi)

Trois distillations ECC existent déjà dans `docs/knowledge/` mais ne sont pas encore *appliquées*. Les transformer en améliorations concrètes (connaissance affinée + backlog/ADR pour l'archi ; ne PAS coder le runtime sans go séparé) :

1. **Scoring de risque 4-axes** (`docs/knowledge/risk-scoring-and-session-orchestration.md`) — base-tool-risk / file-sensitivity / blast-radius / irreversibility → composite 0-1 → Allow/Review/RequireConfirmation/Block. → Proposer l'upgrade du classifieur de risque actuel (CLAUDE.md §5 enum binaire low/medium/high/blocking → composite 4-axes) pour Phase 6. Livrable : ADR `docs/decisions/000X-risk-scoring-4axes.md` + carte backlog si pas implémenté tout de suite. Les listes permission allow/deny de `config/project-stack-mappings.json` (clone ECC) alimentent l'axe base-tool.
2. **Cycle de vie mémoire / apprentissage continu** (`docs/knowledge/continuous-learning-and-memory-lifecycle.md`) — SessionStart inject pack borné / PreCompact+SessionEnd → MemoryProposal / observer background → score → promote (mémoire puis skill froid via `promoteSkill`). → C'est le pont §13 + P4. Livrable : ADR/backlog précisant les hooks MAOS à créer + lien `docs/backlog/second-brain-cross-project.md`.
3. **Règle connecteur MCP** (`docs/knowledge/mcp-connector-policy-and-catalog.md`) — Universal + MCP-beats-CLI, défauts <10. → Doctrine pour la surface MCP du cockpit (opt-in par projet) + §11.bis. Livrable : note d'archi/backlog ; candidats mémoire MCP (omega-memory/squish/longhand) pour P4 déjà notés dans `project_linked_memory`.

Méthode : pour chaque, décider distillation-connaissance vs ADR vs backlog vs code (le code runtime = go séparé). Garder CLAUDE.md §12/§13.

## CHANTIER 2 — Récolte complète de https://awesomeclaude.ai (moteur intake-audit, comme les 2 repos)

Inspecter **tout le site** + le repo GitHub source, et pour chaque ressource : **intégrer** (distiller dans `docs/knowledge/` ou la bibliothèque si skill/agent), **apprendre**, **améliorer l'existant**, ou **supprimer/skip** si déjà couvert (ne pas dupliquer). Les **PDF de sortie** (system cards, supports de cours) sont des références à capturer.

### Pages à traiter (WebFetch chacune ; le contenu peut évoluer, re-mapper au début)
- `https://awesomeclaude.ai/` (home — grande liste curatée : SDKs officiels, Claude Code/MCP, listes communautaires, extensions, apps, cours, communauté)
- `https://awesomeclaude.ai/code-cheatsheet` (Claude Code cheatsheet)
- `https://awesomeclaude.ai/vibe-coding-guide` (guide vibe-coding)
- `https://awesomeclaude.ai/ralph-wiggum` (pattern/technique — à caractériser)
- `https://awesomeclaude.ai/awesome-claude-skills` (Agent Skills — liste de skills)
- `https://awesomeclaude.ai/top-mcp-servers` (top serveurs MCP — croiser avec `docs/knowledge/mcp-connector-policy-and-catalog.md`)
- Repo source : `github.com/webfuse-com/awesome-claude` (utiliser `gh` pour cloner/lister ; source de vérité des liens)
- PDFs référencés (ex : Claude Opus 4.5 System Card) → capturer en référence.

### Moteur (identique aux 2 récoltes précédentes)
1. **Pré-flight** : WebFetch home + `gh repo clone webfuse-com/awesome-claude` (lecture seule) pour avoir la liste exacte des items.
2. **Ledger + dossiers** : `docs/intake/2026-06-21-awesomeclaude/ledger.tsv` (type, page, name, status pending→integrated|rejected, decision adapt/adopt/reject/fold, dossier) + `decisions/*.md` (un dossier par page/lot, prose FR, item par item). Résumable : ne traiter que `pending`.
3. **Intake-audit par item** (invoquer le skill `intake-audit`) : identité → fit MAOS → 3 coûts → KILL criteria (doit pouvoir dire reject) → décision → adaptation → intégration → date de ré-audit. **Reject si déjà couvert** (croiser avec les 877 skills, 32 agents, `docs/knowledge/`, le catalogue MCP). Doublons cyber/skills déjà massivement couverts → reject sans hésiter.
4. **Intégration** : connaissance transférable → `docs/knowledge/<fichier>.md` (cité, source+licence) ; un vrai skill/agent réutilisable et non-dupliqué → bibliothèque froide (même forme §12 que la récolte ECC, regen index) ; un lien/ressource externe → `reference_links_registry` + `docs/backlog/`. **Jamais copier d'infra harness / installeurs**.
5. **Gate 5 checks** par vague : `pnpm lint && pnpm -r test && pnpm build && pnpm --filter @mas/web smoke` + scan secrets/SDK sur les nouveaux fichiers. Commit `feat/docs(...): awesomeclaude wave<N> — …`. Push, puis Sonar : `bash scripts/sonar-pr-issues.sh 32` jusqu'à rc=0 ; **vérifier la CI via `gh run list` sur le HEAD sha** (le champ Sonar `revision` = merge-base, pas le HEAD — ne pas s'y fier). `index.json` (skills+agents) sont **gitignored** (artefacts générés ; ne pas les committer).
6. Mettre à jour `project_ecc-harvest` ou une nouvelle mémoire `project_awesomeclaude-harvest` + `reference_links_registry`.

### Garde-fous
- Sécurité §5 : aucune arme/exploit. Reframe défensif sinon reject (le garde-fou cyber d'Anthropic bloque les sous-agents offensifs — ne PAS contourner, décider en session principale, documenter).
- Tokens §6 : froid par défaut, jamais d'auto-injection ; lire les résumés L1, pas les corps.
- §12/§13 : `docs/knowledge/` = consultation obligatoire avant créer/modifier skill/agent/mémoire.

## Première action de reprise
Chantier au choix de l'utilisateur (demander l'ordre s'il n'a pas dit). Par défaut : commencer Chantier 2 pré-flight (mapper le site + cloner le repo + créer le ledger), car c'est le plus volumineux et résumable ; Chantier 1 (3 ADR/backlog) est plus court et peut s'intercaler.

## Décision laissée en suspens (issue du brainstorming, à ne pas perdre)
« Câbler l'arsenal froid dans le runtime » (dispatch.ts → `loadLibraryIndex` dans le SkillRouter + promote-on-demand) + « créer des agents domaine qui le consomment (ex : agent Sécurité défensive sur les 754 skills cyber) » — **prérequis** pour que les 877 skills soient réellement utilisés. Constat : aujourd'hui le dispatcher n'importe que `TIER_B_DELEGATION_MAP`, pas l'index library → arsenal inerte. À rebrainstormer/câbler quand l'utilisateur donne le go (séparé des 2 chantiers ci-dessus).
