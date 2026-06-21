# ECC Harvest — décisions cluster `skill:core-eval` (lot M)

Doer: lot M (6 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Note lot: `security-review`/`verification-loop` recoupent `mas-sec-reviewer`/`mas-reviewer` + doctrine 5-checks
(§7) ; angle distinct = keeper, dup-pur = reject. `repo-scan` = gem signalé.

Slugs sources réels: `repo-scan`, `scientific-thinking-literature-review` (→ `literature-review`),
`scientific-thinking-scholar-evaluation` (→ `scholar-evaluation`), `security-review`, `seo`,
`verification-loop`.

---

## repo-scan
- **décision**: adapt (keeper — gem)
- **raison**: audit structurel d'appartenance d'un projet externe (code projet / tiers embarqué / artefact de build) + verdicts par module Core/Extract/Rebuild/Deprecate. Aligné §10 (prise en main d'un repo enregistré) + §8 (source externe read-only).
- **dedup**: non — `mas-context-manager` construit un context pack (≤4k tok), ne classe pas l'appartenance ni le code mort ; `mas-reviewer` revoit un diff vs brief, pas l'ownership d'un arbre entier.
- **chemin library**: `packages/skills/library/repo-scan/SKILL.md`
- **sanitize**: bloc `git fetch`/installer upstream retiré (intake gated §5, hors méthode). Sortie = rapport sous `data/` MAS, 0 écriture dans `projects.path`.
- **état**: neuf (source ECC non-stub ; frontmatter MAS T1/library + Prompt Defense Baseline — lit de la source externe non fiable ; corps §12 réécrit/enrichi MAS, non recopié).

## literature-review (source: scientific-thinking-literature-review)
- **décision**: adapt (keeper)
- **raison**: workflow reproductible de revue de littérature (protocole → log → dedup → screening → extraction → synthèse thématique avec niveaux de confiance → vérif citations). Aligné P4 second-brain/recherche.
- **dedup**: non — rien dans notre surface ne couvre la synthèse documentaire ; `market-research`/`deep-research` (autres lots) ≠ revue académique citée.
- **chemin library**: `packages/skills/library/literature-review/SKILL.md`
- **sanitize**: discipline tokens (§6) — résumés compacts, jamais les abstracts bruts injectés ; renommé `literature-review` (slug lot).
- **état**: neuf (corps §12 enrichi MAS, non recopié ; pas de Prompt Defense Baseline — méthode de recherche, ne pilote pas un agent à actions).

## scholar-evaluation (source: scientific-thinking-scholar-evaluation)
- **décision**: adapt (keeper)
- **raison**: évaluation d'un artefact académique unique via rubrique 9 dimensions (1-5, preuve par dimension, vérif des claims forts vs sources).
- **dedup**: non — distinct de `mas-reviewer` (gate d'une livraison de mission vs brief) et de `agent-eval`/`agent-self-evaluation` (évaluent un agent/modèle, pas un papier). Complète `literature-review`.
- **chemin library**: `packages/skills/library/scholar-evaluation/SKILL.md`
- **état**: neuf (corps §12 enrichi MAS, non recopié ; pas de Prompt Defense Baseline — méthode d'éval, ne pilote pas un agent à actions).

## security-review
- **décision**: adapt (keeper — angle distinct)
- **raison**: bibliothèque de patterns de **secure-coding au moment de l'écriture** (FAIL→PASS + checklists secrets/input/injection/authn-z/XSS/CSRF/rate-limit/exposition/deps). Informe comment le code est écrit, n'autorise pas une action.
- **dedup**: angle distinct — `mas-sec-reviewer` = gate PASS/BLOCK sur catégories d'actions risquées (§5) ; `.claude/skills/security-review` (commande) = revue d'un diff de branche ; doctrine §7 = vérif pré-merge. Ce skill ≠ ces gates ; il rend le code défendable avant eux.
- **chemin library**: `packages/skills/library/security-review/SKILL.md`
- **sanitize**: `OPENAI_API_KEY` → `SERVICE_API_KEY` générique ; section Blockchain/Solana (`@solana/web3.js`) **supprimée** (hors scope MAS) ; cadrage §11 (MAS lui-même n'utilise aucune clé API ; patterns destinés au projet utilisateur).
- **état**: neuf (corps §12 réécrit/enrichi MAS + recadrage gate, non recopié ; pas de Prompt Defense Baseline — bibliothèque de patterns, ne pilote pas un agent).

## seo
- **décision**: adapt (keeper)
- **raison**: audit/plan/implémentation SEO d'un projet web enregistré (technique → on-page → schema → CWV → keyword mapping → maillage interne). Légitime : un projet enregistré peut être un site (ex. OtakuGO).
- **dedup**: non — aucun skill SEO dans notre surface ; `market-research` (autre lot) ≠ SEO technique.
- **chemin library**: `packages/skills/library/seo/SKILL.md`
- **sanitize**: §8 ajouté — émettre des diffs, pas d'édition silencieuse de `projects.path` ; `Related Skills` orphelins (seo-specialist/frontend-patterns/brand-voice) retirés.
- **état**: neuf (corps §12 enrichi MAS, non recopié ; pas de Prompt Defense Baseline — skill de contenu/audit, ne pilote pas un agent à actions).

## verification-loop
- **décision**: reject (dup-pur)
- **raison**: redite générique et plus faible de notre doctrine §7 « 5 checks » (test · lint · build · smoke · Sonar) déjà obligatoire + `mas-reviewer` qui gate déjà les outputs. La version ECC propose build/types/lint/test/security-grep/diff — strictement couvert et moins précis que notre boucle (pas de smoke, pas de Sonar, seuil coverage arbitraire 80%).
- **dedup**: oui — recouvre §7 + `mas-reviewer` ; aucun angle distinct apporté.
- **re-audit**: ne pas re-auditer sauf si ECC ajoute un mécanisme non couvert par notre boucle 5-checks (ex. boucle auto-correctrice persistée). KILL: redondance pure → reject définitif.

---

### Récap
- 5/6 keepers (`adapt`) · 1 reject (`verification-loop`, dup-pur).
- Keepers neufs: `repo-scan`, `literature-review`, `scholar-evaluation`, `security-review`, `seo`.
- Prompt Defense Baseline: présent sur `repo-scan` (lit source externe non fiable) ; absent (correct) sur les 4 autres (méthodes/patterns, ne pilotent pas un agent à actions).
- Garde-fous: 0 `@anthropic-ai/sdk`, 0 secret/PAYG dans les 5 outputs (secret générique env-only dans `security-review` = pattern pédagogique, pas de runtime).
