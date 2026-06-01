# Principes de Prompting Anthropic / Claude

Source : `docs/claude doc/prompt_best_practice.pdf` (à lire), tutorial interactif github.com/anthropics/prompt-eng-interactive-tutorial

## Fondamentaux

- **Clarté avant tout** : une instruction floue = une réponse floue. Être explicite sur le format, la longueur, le ton attendus.
- **Attribution de rôle** : dire à Claude quel expert il est avant la tâche améliore significativement la qualité.
- **Séparer données et directives** : utiliser des balises XML (`<context>`, `<task>`, `<format>`) pour isoler chaque partie du prompt.
- **Exemples few-shot** : 2–3 exemples concrets > 1 longue description abstraite.

## Intermédiaire

- **Format de sortie explicite** : préciser JSON, markdown, liste numérotée, etc. Claude respecte mieux un format montré qu'un format décrit.
- **Chain-of-thought** : demander à Claude de "penser étape par étape" avant de répondre réduit les hallucinations sur les tâches complexes.
- **Prefilling** : commencer la réponse assistant avec `{` force du JSON valide. Commencer avec `Voici` évite les introductions inutiles.

## Avancé

- **Éviter les hallucinations** : demander explicitement "si tu n'es pas sûr, dis-le". Ne pas forcer une réponse quand l'information manque.
- **Prompts modulaires** : construire des blocs réutilisables (rôle + règles + tâche + format) plutôt qu'un prompt monolithique.
- **Gestion des refus** : reformuler la tâche avec plus de contexte professionnel réduit les refus non-nécessaires.
- **Technique 80/20** : identifier les 20% d'améliorations qui résolvent 80% des problèmes de qualité.

## Pour les Agents Spécifiquement

- **System prompt stable** = meilleur cache hit. Mettre les instructions constantes en haut, les variables en bas.
- **Tâches atomiques** : un agent = une responsabilité claire. Éviter les prompts qui demandent plusieurs choses à la fois.
- **Output structuré** : forcer un format JSON défini pour les handoffs inter-agents. Évite les ambiguïtés de parsing.
- **Contexte minimal** : injecter uniquement ce dont l'agent a besoin pour sa tâche. Moins de bruit = meilleure précision.

## Liens

- Tutorial interactif : https://github.com/anthropics/prompt-eng-interactive-tutorial
- System prompts officiels : https://platform.claude.com/docs/en/release-notes/system-prompts
- Console prompting tools : `docs/claude doc/Console_prompting_tools.pdf`
- Best practices PDF : `docs/claude doc/prompt_best_practice.pdf`
