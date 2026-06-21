# ECC Harvest — décisions cluster `skill:eng-arch` (lot B)

Doer: lot eng-arch B (8 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (T2, library, deep-boost EVERYTHING).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B), `frontend-design` (skill canonique), `mcp-builder`, `Accessibility Auditor` (agent).
Recadrage transverse: MAOS = abonnement (§11), AUCUN coût per-token PAYG → tout chiffre = unités de quota. Actions touchant des hôtes hors sandbox (deploy, réseau) = §5 gated, human-validated, jamais en autopilot.
Sanitize (regex secrets/PII/internal refs): 8/8 sources clean. `@anthropic-ai/sdk`: absent des 8 sources (mcp-server-patterns ne nomme que `@modelcontextprotocol/sdk`, légitime). Lint guard non concerné.

---

## deployment-patterns
- **décision**: adapt
- **raison**: doctrine de déploiement prod réutilisable — stratégie par blast radius (rolling/blue-green/canary), Dockerfile multi-stage épinglé/non-root/HEALTHCHECK, pipeline CI/CD, probes liveness/readiness/startup, validation env fail-fast (zod), rollback testé, checklist readiness 4 piliers. Recadré §5: en MAOS un deploy atteint des hôtes hors sandbox → action gated, ce skill planifie/revue, n'exécute jamais en autopilot. Secrets jamais dans l'image (§5).
- **dedup**: non — rien d'équivalent dans nos 24 skills/7 fiches; `DevOps Automator` (agent) est un exécutant, pas une doctrine de patterns.
- **chemin library**: `packages/skills/library/deployment-patterns/SKILL.md`
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## error-handling
- **décision**: adapt
- **raison**: patterns d'erreurs prod TS/Python/Go — hiérarchie typée `AppError`+code, pattern Result no-throw, enveloppe API `{error:{code,message}}`, ErrorBoundary React, retry backoff (transient only, jamais 4xx), messages user≠dev. Recadré §5: contexte loggé scrubbé de tout secret/PII; le worker remonte des codes typés (`budget_exceeded`/`BLOCK`) plutôt que des stack traces.
- **dedup**: non — aucun skill error-handling chez nous; lentille transverse aux 3 langages.
- **chemin library**: `packages/skills/library/error-handling/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## frontend-a11y
- **décision**: adapt
- **raison**: patterns a11y React/Next ciblant les défauts les plus relevés en review — label/htmlFor, erreurs `aria-describedby`+`role=alert`+`aria-invalid`, sémantique vs div+onClick, ARIA juste (label/labelledby/live/expanded), nav clavier, focus modale, alt images, prefers-reduced-motion. C'est la posture des forms + error.tsx du cockpit. Recadré: valider tout contenu non-fiable rendu dans le DOM (Prompt Defense).
- **dedup**: non sur le skill — l'agent `Accessibility Auditor` *audite* (run screen-reader), ce skill *guide la construction*. Complémentaires, frontière explicitée dans le corps.
- **chemin library**: `packages/skills/library/frontend-a11y/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## frontend-design-direction
- **décision**: adapt
- **raison**: lentille direction-design *produit* (pas esthétique générique) — fixer purpose/audience/tone/détail mémorable/contraintes avant de coder, matcher la direction au domaine (ops tool = dense/calme/scannable vs editorial = expressif), build l'expérience utilisable d'abord, réutiliser tokens existants, anti-patterns (purple gradients, blobs, cards-in-cards, hero générique). C'est exactement la posture arrêtée du cockpit (dark-only, dense, IA-first).
- **dedup**: non — ECC ne rebundle PAS le `frontend-design` canonique; ce skill est le salvage direction-produit de PR #1659. Frontière vs notre `frontend-design` (esthétique générale) explicitée; frontière vs `frontend-a11y` (correctness) et `frontend-patterns` (mécanique) explicitée.
- **chemin library**: `packages/skills/library/frontend-design-direction/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## frontend-patterns
- **décision**: adapt
- **raison**: mécanique React/Next réutilisable — composition/compound components, hooks custom (`useToggle`/`useQuery` refetch-stable via refs anti-boucle/`useDebounce`), Context+reducer typé, perf (memo/lazy+Suspense/virtualization), forms contrôlés, ErrorBoundary, anim sobre. Choisir le pattern selon la complexité, pas de sur-abstraction. Recadré: sanitize contenu non-fiable avant render.
- **dedup**: non — couche mécanique du cockpit; distincte de `frontend-a11y` (correctness) et `frontend-design-direction` (look), frontières citées.
- **chemin library**: `packages/skills/library/frontend-patterns/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## frontend-slides
- **décision**: adapt
- **raison**: génération de présentations HTML zéro-dépendance, viewport-fit hard gate, découverte de style par 3 previews visuels, qualité prod (nav clavier/wheel/touch, IntersectionObserver, reduced-motion), conversion PPT via `python-pptx` cross-platform. Lentille distincte du skill `pptx` (qui produit du natif .pptx). Recadré local-first: openers OS natifs, aucun egress tiers; valider le contenu collé/converti (Prompt Defense).
- **dedup**: non — `pptx` (chez nous) = natif PowerPoint; ici = deck HTML autonome. Frontière explicitée.
- **chemin library**: `packages/skills/library/frontend-slides/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## homelab-network-readiness
- **décision**: adapt
- **raison**: checklist planning/review AVANT changement réseau homelab risqué (VLAN/segmentation, DNS local Pi-hole/AdGuard, VPN WireGuard) — first answer read-only (inventaire/zones de confiance default-deny/séquence réversible/validation/rollback), règles sûreté (jamais d'admin panel sur internet public, console out-of-band requise, fallback resolver, chemin retour internet). Recadré §5: en MAOS = action infra hors sandbox → gated, human-validated; ce skill planifie, n'exécute jamais.
- **dedup**: non — aucun skill réseau chez nous. Note: la barre CLUSTERS.md flaggait `homelab-pihole-dns` comme likely-reject niche, mais CET item est un skill de *readiness/sûreté* (planning gated), pas un how-to copy-paste → fort en domaine + aligné §5, donc keep.
- **chemin library**: `packages/skills/library/homelab-network-readiness/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12, 0 sdk, 0 secret).

## mcp-server-patterns
- **décision**: adapt
- **raison**: référence *patterns/décisions* MCP Node/TS — triade tools/resources/prompts, validation Zod schema-first, choix transport stdio vs Streamable HTTP, pièges de version SDK (`tool()` vs `registerTool()` → vérifier docs live, jamais hardcoder). MAOS s'appuie lourdement sur MCP. Recadré: input tool non validé = surface d'injection (Prompt Defense); chaque tool ≈ 500 tokens de surface prompt (TOKEN_STRATEGY) → enregistrer sobrement.
- **dedup**: non — `mcp-builder` (chez nous) = walkthrough build complet (FastMCP + Node); celui-ci = couche patterns/décisions consultée *en cours* de build. Frontière explicitée dans description, principes et table de rationalizations.
- **chemin library**: `packages/skills/library/mcp-server-patterns/SKILL.md`
- **état**: boosté, conforme (Prompt Defense Baseline + 7 sections §12; mention `@modelcontextprotocol/sdk` uniquement = SDK MCP légitime, AUCUN `@anthropic-ai/sdk`, 0 secret).

---

**Bilan lot eng-arch B:** 8 audités → 8 keepers (8 adapt, 0 adopt-tel-quel, 0 backlog, 0 reject). 8 SKILL.md boostés écrits sous `packages/skills/library/`. `ledger.tsv` non touché (réservé session principale).
