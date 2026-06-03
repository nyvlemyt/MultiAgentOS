# Backlog — Skill Install Policy (méthode audit skills.sh)

**Quand** : Phase 6 prep (ADR 0005). **Valeur** : haute (sécurité). **Source** : `docs/claude doc/skill-sh.md` (guide skills.sh by Vercel).

## Pourquoi pas maintenant

Phase 3 = registry des 6 orchestrateurs. L'install de skills externes (skills.sh, taste-skill, impeccable) = Phase 6/7. Mais la **méthode d'audit** doit être posée AVANT le premier install. C'est le squelette de l'ADR 0005 + une capability du Sec Reviewer.

## Ce que skills.sh apporte (à reprendre)

**Workflow obligatoire : Find → Audit → Install → Use** (dans cet ordre, à chaque fois).

**Règle d'or** : "Never install a skill you haven't audited. Treat every skill like code from a stranger — because it is." Les skills sont des **instruction sets exécutables** avec accès filesystem, shell, API keys. Le marketplace n'a **aucun vetting automatique**.

**Les 6 checks d'audit** (grille → adopter telle quelle pour le Sec Reviewer / `mas-sec-reviewer`) :

| Check | Détecte |
|-------|---------|
| Hidden instructions | commentaires HTML, caractères zero-width, payloads encodés |
| Prompt injection | tentatives d'override des règles de l'agent / jailbreak |
| Command injection | `eval()`, `exec()`, `os.system()`, `shell=True` dangereux |
| Data exfiltration | appels réseau non autorisés, accès credentials/clipboard |
| Path traversal | sortie de répertoire, lecture de fichiers non autorisés |
| Risky dependencies | versions non-pinned, typosquats, CVEs connus |

**Règle de décision** : Green/Low only → safe. Tout Critical/High → ne pas installer tant que pas compris. Doute → skip.

**Power move (lean)** : "Don't hoard skills. Too many active skills bloats context and degrades performance. Install what the current project needs, audit each, remove unused." → aligne TOKEN_STRATEGY §6 + progressive disclosure L1/L2/L3.

## Mapping MAS

- **ADR 0005 `skill-install-policy`** : formaliser Find→Audit→Install→Use comme processus obligatoire. Tout skill externe (skills.sh, taste-skill, impeccable, agency-agents) passe par là.
- **`mas-sec-reviewer` SKILL.md** : ajouter les 6 checks comme grille d'audit skill. Le Sec Reviewer produit un verdict Green/Low/Medium/High/Critical + décision install/skip.
- **CLAUDE.md §5** : déjà "No skill installed or promoted without a security audit" — la méthode skills.sh = l'implémentation concrète de cette règle.
- **OWASP ASI04 Supply Chain** (vibeflow/gouvernance.md, RES-042) : le check "Risky dependencies" couvre ASI04. Les 6 checks ensemble couvrent ASI01 (prompt injection), ASI02 (command injection), ASI06 (data exfil).
- **UI cockpit** : un bouton "Audit before install" sur `/skills` qui lance le Sec Reviewer sur un skill candidat avant promote.

## Note CLI

`npx skills find/add/check/update`. Le skill `find-skills` (#1 du site) : décrire la tâche en langage naturel → trouve le meilleur skill. Pattern utile pour le Skill Router (matching sémantique tâche→skill).

## Action

ADR 0005 à écrire Phase 6 prep. Enrichir `mas-sec-reviewer` Verification Criteria avec les 6 checks dès qu'on touche le premier install externe.
