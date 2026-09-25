---
description: Lancer la gate qualité (ruff, pyright, forme, tests, couverture) sur les fichiers touchés et montrer le verdict.
argument-hint: "[--sans-couverture] [--sans-pyright] [--base develop]"
allowed-tools: Bash(python .claude/hooks/gate.py:*), Read
---

# /gate $ARGUMENTS

1. Détermine le chantier courant (dernier dossier de `chantiers/` mentionné dans la session, sinon demande) et lance :

```text
python .claude/hooks/gate.py --journal chantiers/<chantier>/journal.md $ARGUMENTS
```

2. Montre la sortie **telle quelle** (verdict en tête, bloquants, informations). Ne résume pas un FAIL en « quelques points à voir ».

3. Si FAIL : corrige uniquement les findings **nouveaux** listés comme bloquants, dans le périmètre du chantier, puis relance. Les findings préexistants du dépôt ne sont pas à corriger dans ce chantier : ils vont dans « Constats hors périmètre ». Ne modifie jamais `ruff.toml`, `pyrightconfig.json` ni les seuils pour obtenir un PASS.

4. Si ERREUR (code 2) : lis le message, répare l'environnement (venv, worktree temporaire, npx) et relance ; ne contourne pas.

5. La couverture des fichiers touchés et les seuils ECC sont des informations : signale-les à Melvyn, propose, ne fais rien de plus.

Une gate PASS ne vaut que montrée : la ligne `GATE PASS (...)` et le nombre de tests apparaissent dans ta réponse et dans le journal.
