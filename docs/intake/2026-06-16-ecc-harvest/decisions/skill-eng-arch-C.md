# ECC Harvest — décisions cluster `skill:eng-arch` (lot C)

Doer: lot eng-arch C (7 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (P2, library, deep-boost).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) + skills harness (`superpowers:*`).
Recadrage transverse: MAOS = abonnement (§11), zéro coût per-token; actions sortantes/shell/git/installers = gated (§5); clés provider en `.env.local` (§11.bis).
Sanitize (regex secrets/PII/`@anthropic-ai/sdk`): 6 sources présentes scannées → 0 secret, 0 import SDK. `gget` absent au chemin assigné, alias trouvé (voir section).

---

## product-capability
- **décision**: adapt
- **raison**: lentille PRD→SRS — transforme l'intention produit en contrat de capacité explicite (invariants, frontières de confiance, transitions de cycle de vie, non-goals, questions ouvertes) AVANT travail multi-service. Boosté §12 (Prompt Defense + 7 sections), recadré: artefact durable côté projet externe, état d'audit MAOS en `data/` (§8), surfaces secrets/paiement/deploy signalées comme §5-gated.
- **dedup**: non — `mas-mission-planner` produit le DAG en aval; ce skill produit le brief *amont* que le planner décompose. `product-lens` valide le "pourquoi"; celui-ci spécifie le "quoi exactement". Complémentaires, pas dups.
- **chemin library**: `packages/skills/library/product-capability/SKILL.md`
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 sdk, 0 secret). Pas de Prompt Defense d'origine → ajouté verbatim depuis l'exemplar.

## product-lens
- **décision**: adapt
- **raison**: diagnostic produit (valider le "pourquoi" avant de construire) — 4 modes: diagnostic 7-questions→go/no-go, founder review (signaux PMF), audit user-journey (time-to-value), priorisation ICE. Chaque mode finit en doc actionnable + next step. Boosté §12, recadré sur le mission lifecycle (§9): un "build this" passe à product-capability puis mas-mission-planner, pas d'implémentation depuis cette voie.
- **dedup**: non — aucune voie MAOS ne couvre la diagnose produit (le planner suppose un objectif déjà validé; le reviewer vérifie l'aval). Pair naturel de product-capability.
- **chemin library**: `packages/skills/library/product-lens/SKILL.md`
- **état**: boosté, conforme (8 sections, 0 sdk, 0 secret). Prompt Defense ajouté (absent à l'origine).

## remotion-video-creation
- **décision**: backlog
- **raison**: le corps source est UNIQUEMENT un index de 29 fichiers `rules/*.md` (3d, audio, captions, charts, transitions…) — le contenu opérationnel réel vit dans ces fichiers, NON copiés dans `/tmp/ecc-inspect/skills/remotion-video-creation/`. Sans les rules, c'est un stub-par-référence: rien de boostable en un SKILL §12 autoporteur. Domaine niche (Remotion/React video) + lentille déjà partiellement couverte par le keeper `video-editing` (Layer 4 Remotion).
- **dedup**: chevauchement partiel avec `video-editing` (composition Remotion). Pas un dup-better, juste un index sans corps.
- **chemin library**: aucun (backlog).
- **état**: backlog. Re-audit: SI les 29 `rules/*.md` deviennent disponibles ET qu'un besoin Remotion concret émerge → ré-ingérer comme pack rules `docs/rules/remotion/` (pattern rules-cluster), pas comme SKILL monolithique.

## gget
- **décision**: backlog
- **raison**: skill bioinformatique (CLI/Python `gget` — requêtes génomiques Ensembl/UniProt, BLAST/BLAT, enrichment, reproducibility log). Bien écrit, sûr (venv isolé, `pip`/`uv`, pas de secret, pas d'API payante). MAIS vertical hors-produit (génomique), zéro réutilisation MAOS actuelle ou prévisible. Barre large garde les bons skills de domaine, mais le hint campagne le flaggait "likely niche — confirm at triage": confirmé niche, aucune valeur cockpit.
- **dedup**: non — aucun dup; simplement hors périmètre produit.
- **chemin library**: aucun (backlog).
- **note chemin source**: assigné `/tmp/ecc-inspect/skills/gget/SKILL.md` (inexistant); source réelle trouvée sous l'alias `/tmp/ecc-inspect/skills/scientific-pkg-gget/SKILL.md` (frontmatter `name: gget`). Audité depuis l'alias plutôt que de marquer "source missing" à tort.
- **état**: backlog. Re-audit: SI un projet bioinfo entre dans le roster MAOS (`projects`), alors ingérer comme library vertical; sinon laisser dormant.

## tdd-workflow
- **décision**: adapt
- **raison**: cycle RED→GREEN→refactor strict, MAIS avec deux apports distinctifs au-delà du canonique `superpowers:test-driven-development`: (1) couche **plan-handoff** traitant un `*.plan.md` comme donnée NON fiable (sanitize, allowlist, gate §5 des commandes/installers, "ignore previous rules" documenté pas suivi), (2) **TDD evidence report** (mapping plan-task→RED→GREEN, table de garanties) survivant aux restarts/squash. Recadré sur la stack MAOS: Vitest (§7), git §5-gated, RED valide = compilé+exécuté+échoué pour la bonne raison.
- **dedup**: chevauche `superpowers:test-driven-development` (RED/GREEN) — gardé car dup-BETTER sur l'axe plan-intake-sécurisé + evidence-report, explicitement positionné comme couche au-dessus du canonique, pas en remplacement.
- **chemin library**: `packages/skills/library/tdd-workflow/SKILL.md`
- **état**: boosté, conforme (8 sections + Plan-Handoff dédié, 0 sdk, 0 secret). Exemples Jest source → réécrits Vitest/pnpm.

## ui-to-vue
- **décision**: reject
- **raison**: KILL multiple. (1) Egress données tierces: envoie des screenshots de design (potentiellement données client) à une API modèle externe Alibaba DashScope (`DASHSCOPE_API_KEY`) — outbound send + risque PII, §5/§11.bis. (2) Exécute du code tiers via `npx ui-to-vue-converter` (binding CLI externe). (3) Hors stack: MAOS = Next.js/React, pas Vue/Vant/Element-Plus. (4) Une fois la machinerie CLI+API strippée, il ne reste qu'un wrapper vide — rien de boostable. La seule lentille transférable (batch screenshot→composant) est générique et déjà mieux servie par nos surfaces frontend (`frontend-design`, UI Designer).
- **dedup**: lentille screenshot→UI partiellement couverte par `frontend-design`; le reste = unsafe/hors-stack par construction.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: egress données tierces vers API payante externe (§5/§11.bis) + exécution code tiers + hors-stack Vue + corps = wrapper. Re-audit: non (conflit structurel egress + framework).

## video-editing
- **décision**: adapt
- **raison**: pipeline d'édition vidéo AI (édition de footage réel, pas génération): 6 couches — capture → organize(agent: transcript/EDL) → FFmpeg(coupes déterministes locales) → Remotion(composition) → assets générés(optionnel) → polish humain. Coeur FFmpeg+Remotion sûr et autoporteur. Recadré: les couches génération tierces (ElevenLabs/fal.ai/ASR hébergé) deviennent des étapes **§5-gated** (outbound send, host en `config/permissions.json#allowed_hosts`, clés en `.env.local`, jamais auto-invoquées en batch autonome); préférer la transcription locale sur le `audio.wav` FFmpeg avant toute API.
- **dedup**: non — aucun skill MAOS vidéo; chevauchement Remotion avec le backlog `remotion-video-creation` (que ce keeper subsume en partie, Layer 4).
- **chemin library**: `packages/skills/library/video-editing/SKILL.md`
- **état**: boosté, conforme (8 sections, 0 sdk, 0 secret). Snippets ElevenLabs/fal.ai source (clés en clair + egress auto) → réécrits en étapes gated + clés `.env.local`, exemple Python TTS brut retiré du corps au profit de la règle de gating.

---

## Récap lot C
- **Keepers (4)**: product-capability (adapt), product-lens (adapt), tdd-workflow (adapt), video-editing (adapt) → écrits sous `packages/skills/library/`.
- **Backlog (2)**: remotion-video-creation (index sans corps), gget (vertical bioinfo niche).
- **Reject (1)**: ui-to-vue (egress tiers + code tiers + hors-stack + wrapper).
- Sanitize global: 0 secret / 0 PII / 0 import `@anthropic-ai/sdk` sur les 6 sources présentes (la 7e `gget` via alias scientific-pkg-gget, idem clean).
