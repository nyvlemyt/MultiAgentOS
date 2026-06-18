# ECC Harvest — décisions cluster `skill:misc` (lot E)

Doer: lot misc-E (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (misc = "gems + quelques rejets"), cible `packages/skills/library/<slug>/SKILL.md`, format §12.
Source ECC: `affaan-m/ecc` (MIT). Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) + CLAUDE.md §5/§7/§8/§11.
Lentille §5 transverse: `google-workspace-ops`, `jira-integration` = écritures API externes / egress → cœur exécutif strippé, lentille analyse/triage gardée → ADAPT. `investor-outreach`, `messages-ops` = le cœur EST l'action sortante / l'accès live → REJECT.
Recadrage §11: MAOS = abonnement, aucun chiffre $/€ (sans objet ici — aucune source ne framait en cash). Sanitize (regex secrets/PII/`@anthropic-ai/sdk`): 8/8 sources clean (jira ne contient que des noms de var d'env placeholder `JIRA_API_TOKEN`, aucune valeur réelle — strippés de toute façon avec la couche exécution).

Bilan: **6 keepers** (flox-environments, git-workflow, google-workspace-ops, investor-materials, jira-integration, marketing-campaign) · **2 rejets** (investor-outreach, messages-ops).

---

## flox-environments
- **décision**: adapt
- **raison**: doctrine d'environnements de dev reproductibles, déclaratifs, cross-plateforme (Nix/Flox) — manifeste unique commité, packages épinglés, hooks idempotents, services locaux. Lentille forte et réutilisable: c'est le kill-switch "works on my machine" pour un projet externe à `projects.path`. Recadré §5 (installs project-scoped/sudo-free dans le sandbox du projet actif, jamais global/cross-projet) + §8 (état MAOS dans `data/`, projet externe = au user) + §11 (jamais de secret dans le manifeste commité — l'anti-pattern "API_KEY in [vars]" devient red-flag binaire).
- **dedup**: non — aucun skill/agent/fiche ne couvre l'environnement de dev reproductible; complémentaire de `mas-context-manager` (qui décrit le projet, ne le provisionne pas).
- **chemin library**: `packages/skills/library/flox-environments/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections dont Overview + Principles citant la source/Process/Rationalizations/Red Flags/Verification binaire). 0 `@anthropic-ai/sdk`, 0 secret. Tutoriel produit-spécifique resserré sur la doctrine transférable.

## git-workflow
- **décision**: adapt
- **raison**: doctrine Git collaborative (stratégies de branche GitHub Flow/trunk/GitFlow, Conventional Commits, merge-vs-rebase sûr, résolution+prévention de conflits, PR discipline, tags SemVer). Lentille forte. Recadré §5 (rm / reset --hard / push --force / suppression de branche = TOUJOURS gated humain, quel que soit le niveau d'autonomie; `--force-with-lease` > `--force`; jamais réécrire l'historique partagé) + §7 (Conventional Commits, sujet ≤ 60 chars).
- **dedup**: partiel — on a un agent "Git Workflow Master" + des conventions §7, mais AUCUN skill git; ce skill est la doctrine opérationnelle complète (manquante côté skills). Recadré pour ne pas dupliquer/contredire §5.
- **chemin library**: `packages/skills/library/git-workflow/SKILL.md`
- **état**: boosté §12 conforme (8 sections, Prompt Defense Baseline). 0 sdk, 0 secret. Anti-pattern "commit .env" conservé comme red-flag; les ops destructives explicitement renvoyées au gate §5.

## google-workspace-ops
- **décision**: adapt (strip exécution + egress)
- **raison**: le cœur "éditer Drive/Docs/Sheets/Slides en place" = écriture API externe / egress (§5) — strippé. Lentille transférable solide gardée: triage d'assets comme système de travail — trouver le canonique, inspecter avant de muter, planifier l'édition précise au plus petit outil, remonter dup/stale (archive/merge/rename). Sortie = rapport structuré ASSET/CURRENT STATE/ACTION/FOLLOW-UPS. La mutation réelle est renvoyée à la couche outil/MCP gated déclarée dans `config/permissions.json` + clic humain.
- **dedup**: non sur la lentille triage; distinct de `docx`/`xlsx`/`pptx` (édition de fichier local téléchargé, pas opération sur le système d'assets partagés).
- **chemin library**: `packages/skills/library/google-workspace-ops/SKILL.md`
- **état**: boosté §12 conforme (8 sections, Prompt Defense Baseline; contenu de doc traité comme untrusted). 0 sdk, 0 secret. Couche cognition/plan uniquement; egress retiré, gate §5 explicite.

## investor-materials
- **décision**: adapt
- **raison**: doctrine de matériaux investisseurs cohérents et défendables — single source of truth AVANT rédaction, réconciliation de chaque chiffre, arc de deck 12 slots, modèle financier (assumptions explicites, bear/base/bull, dépense liée aux milestones, sensibilité), quality gate "défendable en partner meeting". Pure cognition/création, aucun egress. Recadré: l'envoi/distribution est une action sortante séparée (§5), hors scope; Prompt Defense Baseline → ne pas fabriquer de traction.
- **dedup**: non — `internal-comms` = comms internes formatées; ici = discipline de cohérence multi-asset fundraising, distincte.
- **chemin library**: `packages/skills/library/investor-materials/SKILL.md`
- **état**: boosté §12 conforme (8 sections, Prompt Defense Baseline). 0 sdk, 0 secret. Création seulement; "send" exclu et renvoyé §5.

## jira-integration
- **décision**: adapt (strip API/MCP + credentials + egress)
- **raison**: le cœur "create/comment/transition/link via REST/MCP" = écritures API externes / egress (§5) + manipulation de credentials — strippé. Lentille transférable nette gardée: ticket → exigences testables (functional reqs, acceptance criteria, edge/error cases, test types, test data, dependencies) + plan de mise à jour (mapping étape→action Jira, templates de commentaire). Pure cognition. Mutations renvoyées à la couche MCP/outil gated (`config/permissions.json`) + humain; credentials jamais dans le skill.
- **dedup**: non — aucun skill d'analyse de ticket; complémentaire de `mas-reviewer` (vérifie l'output) et de l'agent "Jira Workflow Steward" (gouvernance git-lié), ici = extraction d'exigences testables.
- **chemin library**: `packages/skills/library/jira-integration/SKILL.md`
- **état**: boosté §12 conforme (8 sections, Prompt Defense Baseline). 0 sdk; vars d'env placeholder (`JIRA_API_TOKEN`) retirées avec la couche exécution → 0 secret. Cognition/plan uniquement; REST/MCP + credentials retirés, gate §5 explicite.

## marketing-campaign
- **décision**: adapt
- **raison**: couche d'orchestration de lancement multi-canal — recherche audience/concurrence → positionnement+angle → suite de contenu complète (landing, séquence email, social platform-native, scripts vidéo, variantes ad, calendrier) → review conversion+cohérence. Discipline forte (positionnement avant copy, une voix, quality gate obligatoire, hard bans superlatifs/CTAs génériques). Pure production, aucun egress. Recadré: publier/distribuer = étape sortante séparée (§5), hors scope; Prompt Defense Baseline → inputs de recherche untrusted.
- **dedup**: non — aucun skill marketing/campagne existant; distinct de `brand-guidelines`/`internal-comms`.
- **chemin library**: `packages/skills/library/marketing-campaign/SKILL.md`
- **état**: boosté §12 conforme (8 sections, Prompt Defense Baseline). 0 sdk, 0 secret. Production de la suite uniquement; publication exclue et renvoyée §5. Références aux skills ECC compagnons (`brand-voice`, `content-engine`, `market-research`) reframées comme étapes du process, pas comme dépendances dures.

## investor-outreach
- **décision**: reject
- **raison**: le cœur du skill EST l'action sortante — rédaction + envoi de cold emails, warm intros, follow-ups, updates investisseurs (envoi sortant = §5 `risk: high`). MAOS ne code jamais la machinerie d'envoi sortant; on possède le gate/allowlist (§5 + `config/permissions.json`). Le résidu non-egress (personnaliser, ask low-friction, proof-not-adjectives, cadence de relance) est (a) une playbook de style d'écriture, structurellement *outbound-shaped*, et (b) largement chevauchant `internal-comms` (formats de comms) + la discipline "proof over adjectives" déjà présente dans `investor-materials` (keeper de ce lot). Pas de lentille distincte assez forte pour justifier un keeper.
- **dedup**: oui sur le résidu — la discipline ask/proof/concision recoupe `internal-comms` + `investor-materials`; le reste est unsafe par construction (envoi).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: cœur = envoi sortant (§5 risk:high) que MAOS ne code pas + résidu dup-no-better (`internal-comms`/`investor-materials`). Re-audit: seulement si un agent domaine "outreach/email" est explicitement scopé en ROADMAP, et alors via `config/permissions.json` (déclaration de catégorie risquée), jamais en codant l'envoi.

## messages-ops
- **décision**: reject
- **raison**: le cœur EST la récupération de messages live — lecture iMessage/DM, codes one-time, inspection de thread sur des surfaces de messagerie privées (egress vers comms privées, MFA, accès DB brut potentiel). C'est exactement la machinerie d'accès/egress que MAOS ne doit jamais coder (§5; surface hors sandbox). Le seul résidu transférable — "nomme ta source / récupération bornée / rapporte le blocker exact" — est une mince discipline de preuve, insuffisante en valeur propre et inséparable de la machinerie de messagerie live qui fait toute sa valeur.
- **dedup**: sans objet — pas d'équivalent chez nous, mais l'item est unsafe par construction (accès à une surface de messagerie privée hors sandbox).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: cœur = accès/egress à des surfaces de messagerie live privées hors sandbox (§5) que MAOS ne code pas; résidu (discipline de preuve) trop mince et non-séparable. Re-audit: non (conflit structurel — la valeur du skill est l'accès aux messages privés, que le modèle local-first/gated de MAOS interdit de coder).
