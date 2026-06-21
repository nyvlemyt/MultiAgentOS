# Per-provider subscription / plan awareness

**Demande user (2026-06-21, "appliquer tout le temps") :** l'app doit *dans tous les cas* savoir **quel abonnement / plan on a pour chaque IA** pour bien travailler. Contexte donné : abonnement Claude à **100 €/mois** (Max). Cette exigence est permanente — toute feature provider/budget doit en tenir compte.

## Le gap

`config/model-routing.json` décrit les **providers** (`claude`, `gemini-free`, `openai`, `perplexity`) et leur routage par domaine, mais **aucun champ ne décrit le plan/abonnement** :
- pas de tier (Claude **Max / Pro**, OpenAI **PAYG / Team**, Gemini **free**, Perplexity **Pro**)
- pas de quota mensuel attaché au plan (le 100 € Max ouvre un quota Agent-SDK *séparé* — CLAUDE.md §11 billing change 2026-06-15)
- pas de coût (fixe mensuel vs per-token) → impossible d'arbitrer correctement le routage coût/quota
- le gate budget tout neuf (`packages/agents/src/budget-gate.ts`, PR #33) lit `budgets` mais ne sait pas **à quel plan** le cap se rattache.

## Ce qu'il faut (esquisse, à raffiner en intake-audit)

1. **Champ `plan` par provider** dans `config/model-routing.json`, ex :
   ```json
   "claude": { "plan": "max", "billing": "subscription", "monthlyCostEur": 100,
               "agentSdkQuota": { "window": "month", "unit": "messages|tokens", "cap": <n> } }
   ```
2. **Quota par plan** distinct du quota interactif Claude.ai (§11 : Agent SDK = crédit séparé ; agents ≈ 4×, recherche multi-agent ≈ 15×).
3. **Surface UI** : le cockpit (topbar / token meter) affiche le plan actif par IA + quota restant estimé.
4. **Le budget-gate** (PR #33) doit pouvoir résoudre le cap depuis le plan du provider, pas seulement depuis une ligne `budgets` globale anonyme.
5. **Source de vérité** : un plan ne peut pas être déduit à 100 % par API → champ déclaré par l'user, vérifié au boot (warning si clé présente mais plan non déclaré).

## Pourquoi pas tout de suite

Touche routing + budgets + UI + ADR 0002/§11.bis → mérite une **intake-audit** dédiée puis une phase (candidat : extension du budget-gate, ou bloc dans la séquence master P5 "axes"). Ne pas câbler à la volée.

## Re-audit

À traiter au prochain gate touchant providers/budget. Lié : [[budget-gate]] (PR #33), `llm-selection-audit.md`, CLAUDE.md §11 / §11.bis, ADR 0002.
