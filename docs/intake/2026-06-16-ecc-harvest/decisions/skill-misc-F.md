# ECC Harvest — décisions cluster `skill:misc` (lot F)

Doer: lot misc-F (7 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (Phase C, P2 misc = "gems + a few rejects").
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Recadrage transverse: MAOS = abonnement (§11), AUCUN chiffre $/€ per-token; tout coût = unités de quota. §5: sends sortants / writes d'API externe / shell destructif / hors-sandbox = TOUJOURS gatés, déclarés via `config/permissions.json` — MAOS ne code jamais la machinerie d'envoi sortant.
Sanitize (regex secrets/PII/internal/`@anthropic-ai/sdk`): 7/7 sources clean côté secrets et import SDK. Note `x-api`: noms d'env placeholder (`X_BEARER_TOKEN`, `X_CONSUMER_*`) + username réel `affaanmustafa` dans des exemples de requêtes → non porté (item rejeté).

Bilan lot: 6 keepers (1 adopt + 5 adapt) · 1 reject.

---

## nodejs-keccak256
- **décision**: adopt
- **raison**: gem de correction factuelle — `crypto.createHash('sha3-256')` de Node = NIST SHA3-256, PAS le Keccak-256 d'Ethereum; outputs divergents, aucun warning, casse silencieusement sélecteurs/topics/EIP-712/slots/dérivation d'adresse. Lentille read-only (audit grep + helpers ethers/viem/web3), pas d'exécution, pas de LLM, pas de réseau. Fort dans son domaine (Web3/EVM), réutilisable tel quel.
- **dedup**: non — aucun skill crypto/hashing/EVM dans `our-assets-index.md`. Distinct des agents Solidity (eux = logique contrat, ici = pitfall de hashing JS/TS).
- **chemin library**: `packages/skills/library/nodejs-keccak256/SKILL.md`
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 8 sections dont Overview + Principles citant la source + Process + Rationalizations + Red Flags + Verification binaire). 0 secret, 0 import SDK.

## project-flow-ops
- **décision**: adapt
- **raison**: lentille de gouvernance de backlog (triage issues/PR, classification merge/port-rebuild/close/park, décision "mérite une lane interne ?", diff>title, CI-red=block). Transférable. §5: les mutations cross-surface (merge/push/close, écriture GitHub/Linear) sont des writes externes gatés — strippées de la machinerie d'exécution; le skill DÉCIDE, le mission lifecycle EXÉCUTE le write gaté. Linear recadré en "lane d'exécution interne" générique (pas de couplage produit-tiers).
- **dedup**: non — pas de skill de triage backlog chez nous; distinct de `mas-mission-planner` (DAG de mission neuve) et `mas-reviewer` (review d'un diff).
- **chemin library**: `packages/skills/library/project-flow-ops/SKILL.md`
- **état**: boosté §12, conforme exemplar. Machinerie d'écriture externe strippée; séparation decide-vs-execute explicite (§5). 0 secret, 0 import SDK.

## social-graph-ranker
- **décision**: adopt (adapt léger)
- **raison**: moteur de ranking de graphe pondéré, déterministe et explicable (bridge score B(m) à décroissance λ, expansion 2e ordre α, ajustement engagement β; tiers T1/T2/T3). Le cœur N'EST PAS un send sortant — c'est le moteur de scoring; les skills sœurs (lead-intel/outreach) font l'outbound. §5: le fetch du graphe via API plateforme = egress gaté hors-scope, et le drafting/envoi de messages = hors-scope; gardé "data in → ranking out". Fort en domaine, non-dup.
- **dedup**: non — aucun skill de graph-ranking/réseau dans l'index.
- **chemin library**: `packages/skills/library/social-graph-ranker/SKILL.md`
- **état**: boosté §12, conforme exemplar. Egress fetch + outreach explicitement hors-scope/gatés; math conservée intégralement. 0 secret, 0 import SDK.

## terminal-ops
- **décision**: adapt
- **raison**: workflow opérateur evidence-first (resolve surface → read failing surface → fix étroit → mots de statut exacts: inspected/changed locally/verified locally/committed/pushed/blocked). Lentille distincte: le VOCABULAIRE de statut anti-surclaim + read-only-on-audit. Recadré sur §4 (ce qui s'exécute auto est borné par le niveau d'autonomie) et §5 (git destructif `rm`/`reset --hard`/force-push/branch-delete + writes hors-sandbox TOUJOURS gatés — surfacés, jamais exécutés par le skill).
- **dedup**: non (no-better) — chevauche `agentic-engineering` (décompo/vérif d'unité) et le quality-controller, mais le reporting de statut terminal exact est une lentille propre et complémentaire.
- **chemin library**: `packages/skills/library/terminal-ops/SKILL.md`
- **état**: boosté §12, conforme exemplar. Gates §4/§5 injectés; ops destructives surfacées en `blocked`-pending-approval. 0 secret, 0 import SDK.

## ui-demo
- **décision**: adapt
- **raison**: enregistreur de vidéo-démo UI polie via Playwright; discipline 3-phases Discover→Rehearse→Record (anti-échec silencieux de sélecteur). Garde la lentille; bulk des helpers verbatim condensé en forme-pattern (inventaire nommé, corps non assumé). Recadré: distinct de `webapp-testing` (présentation vs assertion); surface enregistrée = surface du projet enregistré uniquement (§5).
- **dedup**: non (no-better) — `webapp-testing` partage le moteur Playwright mais sert l'assertion fonctionnelle; ui-demo sert la présentation (curseur/pacing/sous-titres/story). Distinction explicitée dans le corps.
- **chemin library**: `packages/skills/library/ui-demo/SKILL.md`
- **état**: boosté §12, conforme exemplar. Distinction vs webapp-testing + cadrage §5 sur la surface. 0 secret, 0 import SDK.

## unified-notifications-ops
- **décision**: adapt
- **raison**: lentille de DESIGN de politique de notification (pipeline Capture→Classify→Route→Collapse→Attach; modèle de sévérité Critical/High/Medium/Low; digest-first; dédup avant d'ajouter des canaux). Le cœur transférable est la cognition de triage/routing/dédup, PAS l'envoi. §5: tout send sortant (webhook/chat/email/réseau) = action risquée déclarée dans `config/permissions.json`, exécutée par le mission lifecycle gaté — MAOS ne code jamais la machinerie d'envoi (aucune présente dans la source de toute façon). Canaux recadrés sur surfaces MAOS; "prefer existing skill/hook/agent over connector".
- **dedup**: non — pas de skill de politique de notification chez nous; renvoie à `project-flow-ops` quand la cause racine est le backlog.
- **chemin library**: `packages/skills/library/unified-notifications-ops/SKILL.md`
- **état**: boosté §12, conforme exemplar. Send sortant marqué action §5 (config/permissions.json), jamais codé; règle "never expose tokens/webhook secrets" conservée. 0 secret, 0 import SDK.

## x-api
- **décision**: reject
- **raison**: le cœur du skill EST la machinerie d'envoi sortant / write d'API externe — poster tweets/threads, upload média, flux d'écriture OAuth 1.0a vers `api.x.com`. C'est §5 par construction (send réseau sortant + write d'API externe = toujours gaté) et MAOS ne code jamais cette machinerie d'envoi. La seule lentille transférable (backoff sur `x-rate-limit-*`, discipline token read-only, "return draft for approval before posting") est générique et faible, déjà couverte par §5 + `config/permissions.json` + budgets/quota. Ce qui reste d'unique = le binding d'envoi X lui-même, qui ne doit pas exister dans la library. Sanitize: noms d'env placeholder + username réel `affaanmustafa` → non porté.
- **dedup**: oui sur la partie sûre (gating/allowlist/rate-limit = déjà chez nous via §5 + budgets); le reste = egress/outbound par construction.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: outbound network send + external-API write (§5, toujours gaté) comme cœur du skill; lentille rate-limit/approval = dup-no-better. Re-audit: seulement si un domaine "social/posting agent" est explicitement scopé en ROADMAP, et alors via `config/permissions.json` (déclaration de catégorie risquée) + un MCP/connector gaté, jamais en codant l'envoi dans une library skill.
