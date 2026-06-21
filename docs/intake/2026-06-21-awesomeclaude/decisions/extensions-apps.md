# Lot — Extensions, thèmes & apps (home)

Garde-fou dominant : **« jamais copier d'infra harness / installeurs »** (CLAUDE.md §9.bis / resume-prompt). Tout ce lot = surface du harness Claude Code, hors périmètre MAOS.

| Item | Type | KILL / raison | Décision |
|---|---|---|---|
| Claude Code for VS Code (officiel) | ext IDE | infra harness ; on est *dans* une extension VSCode, pas en train d'en livrer une | `reject` |
| Claude Code for JetBrains (Beta) | ext IDE | idem | `reject` |
| Claude Code Chat (andrepimenta) | ext IDE | UI chat tierce dans VS Code | `reject` (mais cf. `project_ui_chat_space_vision` : référence UX *conceptuelle* notée là, pas un import) |
| Claude Code Theme / Claude VSCode Theme ×2 | thème | cosmétique, hors scope | `reject` |
| Claude for Chrome (Beta) | ext navigateur | infra harness (déjà notée en register côté claude-code-and-mcp) | `reject` ici (doublon de listing) |
| Claude Usage Tracker | ext navigateur | suivi usage claude.ai ; notre `budgets` table fait le suivi côté MAOS | `reject` |
| Claude Desktop | app | infra officielle | `reject` (lien déjà couvert) |
| Claude Desktop Debian (aaddrick) | app non-officielle | packaging Linux tiers | `reject` |

## Note
Aucune valeur intégrable : ce sont des produits finis (extensions/apps) ou du cosmétique. La seule retombée = la **référence UX conceptuelle** « chat space façon app-Claude » qui vit déjà dans la mémoire `project_ui_chat_space_vision` (réf. mammouth.ia), sans rien importer d'ici.

**Re-audit** : aucun (catégorie structurellement hors périmètre).
