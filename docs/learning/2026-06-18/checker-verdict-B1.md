# Checker — Tâche B1 : ADR 0005 « Bibliothèque-arsenal de skills indexée »

- **Cible** : `docs/decisions/0005-skill-arsenal-library.md`
- **Worktree** : `/Users/melvyn/Documents/02_PROJETS/maos-ecc`
- **Date** : 2026-06-18
- **Mode** : lecture seule (ce verdict est la seule écriture)

## Tableau des contrôles

| # | Contrôle | Résultat | Preuve |
|---|----------|----------|--------|
| 1 | Fichier existe et non-vide | PASS | `wc -l` → 81 lignes, 8668 octets |
| 2 | Le numéro 0005 n'écrase aucun ADR | PASS | `ls docs/decisions/` → existaient 0001/0002/0003/0004 ; pas de 0005 antérieur ; `git status --short` ne montre 0005 que comme `??` (nouveau, non suivi) |
| 3 | Décision = décision verrouillée | PASS | §Décision point 1 : `packages/skills/library/<slug>/SKILL.md` + `index.json` (L20-27) ; lu on-demand par `mas-skill-router`, **index.json/L1 only**, hydratation des bodies à la demande (L29) ; **PAS** auto-injecté dans `.claude/skills/` (L20, L32, L56) ; rules→`docs/rules/<lang>/` (L39) ; commands→`.claude/commands/` (L40) ; promotion **on-demand/explicite** vers `.claude/skills/` (L32-35). Conforme mot pour mot au PLAN §8/§10/§11/§13/§16 |
| 4 | Sections présentes | PASS | Statut « Accepted (2026-06-18) » + Date 2026-06-18 (L3-4) ; Contexte (L8) ; Décision (L18) ; Conséquences avec **Positives** (L62) **et** Négatives/coûts (L69) ; Alternatives rejetées = **3** avec motif (a/b/c, L56-58) ; Liens (L75) |
| 5 | CLAUDE.md non modifié | PASS | `git status --short` → seule ligne `?? docs/decisions/0005-skill-arsenal-library.md` ; aucune mention de CLAUDE.md. L77 indique explicitement que la maj §3 est différée en Phase E |
| 6 | Cohérence format avec 0003/0004 | PASS | Même ossature qu'ADR 0003 : en-tête Statut/Date/Décideurs/Sources, puis Contexte → Décision → Rationale → Alternatives → Conséquences → Liens. Structure comparable |
| 7 | Prose en français | PASS | Corps entièrement en français (titres de sections « Consequences »/« Rationale » conservés en anglais comme dans 0003, cohérent — la prose est FR) |
| 8 | Aucun import/mention de `@anthropic-ai/sdk` comme solution (§11) | PASS | `grep '@anthropic-ai/sdk'` → exit 1 (aucune occurrence) |

## Notes (non bloquantes)

- L'ADR cite `mas-sec-reviewer`, la doctrine local-first et « external trees read-only » (CLAUDE.md §8) dans l'alternative (b) — argumentaire solide et conforme aux règles du repo.
- Les titres de sections « Rationale » et « Consequences » sont en anglais (comme dans ADR 0003) : choix de cohérence inter-ADR, pas un défaut de langue de prose.

## Verdict

**PASS** — 8/8 contrôles verts. L'ADR documente fidèlement la décision verrouillée, respecte le format des ADR voisins, ne touche pas à CLAUDE.md, n'introduit aucune mention de la solution PAYG interdite, et est rédigé en français. Aucune correction requise.
