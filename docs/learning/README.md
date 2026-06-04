# docs/learning/ — Protocole doer → checker → orchestrator

Boucle multi-session pour l'apprentissage build-time (distillation des ressources). Chaque session **écrit son résultat dans un fichier** (+ résumé terminal). L'orchestrateur lit les fichiers, jamais les souvenirs d'une autre session.

## Les 3 rôles

| Rôle | Session | Fait | Écrit dans |
|------|---------|------|------------|
| **Doer** (builder/distiller) | session A | distille / reconcile / corrige, touche les `docs/knowledge/` | `build-report.md` |
| **Checker** (verifier) | session B, indépendante | vérifie depuis les sources, ne corrige RIEN, sceptique par défaut | `verify-report.md` |
| **Orchestrator** | **session fraîche** (file-driven, pas besoin de l'historique) | lit les 2 rapports, analyse, tranche le commit, prépare le cycle suivant | (rien — pilote) |

**Séquence d'un cycle (jamais en parallèle)** : Doer (session A) → écrit `build-report.md`, laisse le working tree → Checker (session B fraîche) → écrit `verify-report.md` → Orchestrator (session C fraîche) → lit les 2, tranche commit + prépare le cycle suivant. Le Checker dépend de la sortie du Doer ; l'Orchestrator dépend des deux. Les 3 sont séquentiels.

## Convention de fichiers

Un **cycle** = un dossier daté sous `docs/learning/` :

```
docs/learning/
  README.md                       ← ce fichier (le protocole)
  <YYYY-MM-DD>-<slug>/
    build-report.md               ← le Doer écrit ici
    verify-report.md              ← le Checker écrit ici
```

Le Doer crée le dossier du cycle s'il n'existe pas. Le Checker écrit dans le même dossier.

## Règles dures

- Doer **et** Checker : toujours écrire le rapport-fichier AVANT le résumé terminal. Le fichier est la source de vérité, le terminal n'est qu'un aperçu.
- Checker : **indépendant** (session fraîche), ne fait confiance à aucune affirmation du Doer, vérifie contre les PDFs/sources réels, ne modifie aucun fichier.
- Doer : ingère le `verify-report.md` du cycle précédent comme input s'il existe (corrige les findings avant d'ajouter du neuf).
- **Doer ne commite PAS.** Il laisse le working tree modifié + propose le commit dans son rapport. Le Checker audite le **working tree non commité** (`git diff` / `git status`). L'**orchestrateur tranche le commit** après lecture des 2 rapports. Rien n'entre dans git avant verdict.
- Orchestrator : ne fait ni le travail ni la vérif. Lit, analyse, prépare la suite, tranche le commit.
- Aucun code/config runtime touché pendant un cycle d'apprentissage. Docs uniquement.

## Format des rapports

**build-report.md** : périmètre · table RES↔PDF · table décisions (implement/adapt/backlog/watch/reject) · fichiers touchés · fidélité (écarts corrigés) · contradictions signalées (pas intégrées en silence) · questions ouvertes · commit proposé.

**verify-report.md** : VERDICT (PASS / NEEDS_WORK / BLOCK) · table findings (`fichier:ligne | sévérité 🔴🟠🟡 | problème | correction`) · couverture (X/N vérifiés contre source) · garde-fous (§11, CLAUDE.md non édité en silence, superseded ignorés, statuts INDEX exacts, aucun code touché) · ce qui n'a PAS pu être vérifié.
