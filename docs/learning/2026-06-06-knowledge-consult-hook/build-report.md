# Build-report — mini-cycle `2026-06-06-knowledge-consult-hook` (DOER)

**Rôle** : Doer (BUILD/config, petit). **Date** : 2026-06-06. **Working tree** : modifié, **NON commité**. Outil : skill `update-config`.

## Objectif

Fermer la faille « build-time pull-not-push » : pousser à chaque session un rappel de consulter `docs/knowledge/` + l'INDEX **avant** tout travail de connaissance (skills/agents/mémoire/ADR), en renfort de CLAUDE.md §12.

## Fichier touché

`/.claude/settings.json` — **NOUVEAU**, **versionné** (checked-in, team-wide). PAS `settings.local.json` (perso, gitignored), PAS `~/.claude/settings.json` (global, intouché).

Preuve versionnable : `git check-ignore .claude/settings.json` → **non ignoré**. `git status` → `?? .claude/settings.json` (seul nouveau).

## Contenu du hook

Hook `SessionStart`, type `command`, **additif** (aucun matcher = tourne à chaque démarrage de session, en plus des hooks globaux). Émet un JSON `hookSpecificOutput.additionalContext` injecté dans le contexte du modèle :

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ {
        "type": "command",
        "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"additionalContext\":\"Radar savoir = docs/knowledge/vibeflow/INDEX.md. AVANT de créer/modifier un skill, agent, fichier mémoire ou ADR : consulte docs/knowledge/ (CLAUDE.md §12). Cycles apprentissage = docs/learning/.\"}}'",
        "timeout": 5,
        "statusMessage": "Rappel: consulter docs/knowledge/ (CLAUDE.md §12)"
      } ] }
    ]
  }
}
```

Nudge injecté (concis, 1 phrase) :
> Radar savoir = docs/knowledge/vibeflow/INDEX.md. AVANT de créer/modifier un skill, agent, fichier mémoire ou ADR : consulte docs/knowledge/ (CLAUDE.md §12). Cycles apprentissage = docs/learning/.

*(Note rédaction : « Cycles apprentissage » au lieu de « Cycles d'apprentissage » — l'apostrophe casserait le single-quote bash de la commande `echo`. Reformulé pour robustesse, pas de perte de sens.)*

## Preuve : JSON valide

- `python3 -m json.tool .claude/settings.json` → **VALID JSON**.
- `jq -e '.hooks.SessionStart[] | .hooks[] | select(.type=="command") | .command' .claude/settings.json` → **exit 0** + imprime la commande (nesting correct).
- **Round-trip** : `CMD=$(jq -r '...command') ; eval "$CMD" | python3 (json.load)` → `additionalContext` extrait sans erreur (la commande émet bien du JSON parsable).

## Preuve : non-collision

| Source | Hooks SessionStart | Action |
|--------|--------------------|--------|
| `~/.claude/settings.json` (global) | `caveman-activate.js` (+ superpowers) | **intouché** (lecture seule) ; `git -C ~/.claude status` vide |
| `.claude/settings.json` (projet) | **ce hook** (echo nudge) | créé |
| `.claude/settings.local.json` (local) | **aucun** (`jq '.hooks'` → vide ; keys = `permissions` seul) | intouché |

Claude Code **merge** les hooks des 3 sources → le nudge projet s'ajoute, ne remplace ni le caveman global ni rien dans local. **Zéro duplication, zéro écrasement.** Idempotent : relancer ce cycle ne dupliquerait pas (aucun hook équivalent préexistant dans les fichiers projet).

## Comment testé que le hook est reconnu

- **Pipe-test de la commande** (skill update-config étape 3) : commande exécutée seule → sortie = JSON valide, `additionalContext` extrait. ✅
- **Validation schéma** : `jq -e` sur le chemin `.hooks.SessionStart[].hooks[]` → exit 0 (forme conforme au schéma settings).
- **Limite (honnête)** : `SessionStart` **ne se déclenche pas dans le tour courant** — il fire au **prochain démarrage de session**. Je ne peux donc pas prouver le firing en live ce tour-ci.
- **Watcher** : `.claude/` contenait déjà `settings.local.json` au démarrage de cette session → le watcher surveille `.claude/`, donc le nouveau `settings.json` devrait être rechargé. Si le nudge n'apparaît pas au prochain start : ouvrir `/hooks` une fois (recharge la config) ou redémarrer Claude Code.

## Garde-fous

- **Aucun secret** : `grep -iE "api[_-]?key|secret|token|password|ANTHROPIC"` → rien.
- **Aucun code applicatif / .env / `~/.claude`** touché. CLAUDE.md non touché.
- §11 : sans objet (pas de LLM, pas de PAYG).

## Commit proposé (NE PAS exécuter avant validation)

```bash
git add .claude/settings.json docs/learning/2026-06-06-knowledge-consult-hook/
git commit -m "chore(claude): SessionStart hook nudging docs/knowledge consult (§12)"
```

`.claude/settings.json` = versionné volontairement (team-wide, parle de CE repo). Exclure `pnpm-lock.yaml` + carry-over des cycles précédents.

**STOP** — pas de commit, pas d'autre build. Working tree laissé modifié.
