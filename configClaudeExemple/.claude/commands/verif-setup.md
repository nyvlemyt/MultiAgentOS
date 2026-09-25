---
description: Vérifier le dispositif Claude Code du poste (verrous, outils, exclusions, base, branche, mémoire, graphe) avec les auto-tests, et proposer les réparations.
allowed-tools: Bash(python .claude/hooks/doctor.py:*), Bash(python .claude/hooks/tests/test_gardes.py:*), Bash(git check-ignore:*), Bash(git status:*), Read
---

# /verif-setup

1. Lance `python .claude/hooks/doctor.py --complet` et montre la sortie telle quelle.
2. Lance `python .claude/hooks/tests/test_gardes.py` et montre la dernière ligne.
3. Vérifie que rien du dispositif n'apparaît dans `git status --porcelain` et que `git check-ignore CLAUDE.md .claude chantiers ruff.toml pyrightconfig.json graphify-out` les liste tous.
4. Pour chaque ALERTE : explique en une phrase ce qu'elle signifie et propose la réparation (commande exacte, extraite de `.claude/README.md`). N'applique une réparation que sur le mot de Melvyn, sauf si elle est strictement locale au dispositif et réversible (recréer le graphe, réinstaller ruff dans le venv).
5. Si les hooks ne semblent pas actifs dans la session (aucune ligne `doctor EVE :` au démarrage, ou un verrou testé à la main qui ne se déclenche pas) : dis-le clairement, la cause habituelle est une session ouverte avant la modification de `.claude/settings.json` ; la réparation est de relancer Claude Code.
