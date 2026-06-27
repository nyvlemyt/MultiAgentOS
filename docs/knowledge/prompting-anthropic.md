# Principes de Prompting Anthropic / Claude

Sources :
- `docs/claude-doc/prompt_best_practice.pdf` (guide officiel Anthropic, couvre Opus 4.8)
- `docs/claude-doc/Console_prompting_tools.pdf` (outils Console)
- https://github.com/anthropics/prompt-eng-interactive-tutorial

---

## 1. Principes généraux

### Clarté et directivité

- Claude = brillant new hire sans contexte. Plus tu es précis, meilleur le résultat.
- **Règle d'or** : montre le prompt à un collègue sans contexte. Si confus → Claude sera confus.
- Spécifier format de sortie, contraintes, longueur attendue explicitement.
- Instructions séquentielles → listes numérotées ou bullets quand l'ordre compte.
- Mauvais : `"Create an analytics dashboard"` → Bon : `"Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation."`

### Contexte et motivation

- Expliquer le **pourquoi** améliore la qualité. Claude est assez intelligent pour généraliser.
- Mauvais : `"NEVER use ellipses"` → Bon : `"Your response will be read aloud by TTS, so never use ellipses since the TTS engine won't know how to pronounce them."`

### Exemples (few-shot)

- 3–5 exemples = un des leviers les plus fiables pour orienter format, ton, structure.
- Les exemples doivent être : pertinents (proches du cas réel), divers (couvrir les edge cases), structurés (dans des `<example>` tags).
- Demander à Claude d'évaluer ou générer des exemples supplémentaires est efficace.

### XML tags pour structurer

```xml
<instructions>...</instructions>
<context>...</context>
<input>...</input>
<examples>
  <example>...</example>
</examples>
```

- Réduit les ambiguïtés de parsing quand le prompt mélange instructions, contexte, exemples, inputs variables.
- Nester les tags pour hiérarchies naturelles.
- Utiliser des noms descriptifs cohérents dans tous les prompts du système.

### Donner un rôle

```python
system = "You are an expert backend architect specializing in distributed systems..."
```

- Une seule phrase de rôle dans le system prompt fait une différence mesurable.

---

## 2. Paramètre Effort (Claude Opus 4.8+)

**Mapping direct avec nos modes eco/standard/expert :**

| Mode MultiAgentOS | Effort Anthropic | Usage |
|-------------------|-----------------|-------|
| `eco` | `low` / `medium` | Tâches courtes, latence-sensitive, non intelligence-intensive |
| `standard` | `high` | Équilibre token/intelligence — défaut pour la majorité |
| `expert` | `xhigh` | Coding, agentic use cases — meilleur réglage |
| — | `max` | Tâches ultra-complexes (attention : diminishing returns + risque overthinking) |

**Règles clés :**
- `xhigh` = meilleur réglage pour coding et agents.
- `low`/`medium` : Claude scope strictement ce qui est demandé, ne va pas au-delà. Risque d'under-thinking sur tâches complexes.
- Si raisonnement superficiel → augmenter effort avant de modifier le prompt.
- À `max`/`xhigh` : prévoir max output tokens élevé (start à 64k tokens).

---

## 3. Comportements spécifiques Opus 4.8

### Thinking adaptatif

- Thinking OFF par défaut → activer avec `thinking: {type: "adaptive"}`.
- Si trop de thinking (gros system prompts) → ajouter : `"Thinking adds latency and should only be used when it will meaningfully improve answer quality — typically for problems that require multi-step reasoning. When in doubt, respond directly."`

### Tool use

- Opus 4.8 favorise le raisonnement sur les appels d'outils. `high`/`xhigh` augmente significativement l'usage des outils en agentic search et coding.
- Si les outils ne sont pas utilisés → augmenter effort + décrire explicitement quand et comment les utiliser.

### Contrôle des sous-agents

```text
Do not spawn a subagent for work you can complete directly in a single response.
Spawn multiple subagents in the same turn when fanning out across items or reading multiple files.
```

- Comportement steerable via prompt — Opus 4.8 spawn moins de sous-agents par défaut.

### Instruction following littéral

- À effort bas : Claude suit les instructions à la lettre sans généraliser. Préciser explicitement la portée : `"Apply this formatting to every section, not just the first one"`.

### Code review

- Opus 4.8 a une précision plus haute mais peut avoir un recall plus bas si le prompt dit "only report high-severity issues".
- Prompt recommandé pour maximiser coverage :

```text
Report every issue you find, including ones you are uncertain about or consider low-severity.
Do not filter for importance or confidence at this stage — a separate verification step will do that.
Your goal here is coverage: better to surface a finding that later gets filtered than to silently drop a real bug.
For each finding, include your confidence level and an estimated severity.
```

---

## 4. Console Tools (outils pour construire des prompts)

### Prompt Generator

- Résout le "blank page problem" : génère un template de prompt complet depuis une description de tâche.
- Détermine automatiquement les variables nécessaires et les inclut dans le template.
- Utile comme point de départ pour itération.

### Prompt Templates et Variables

- Séparation **contenu fixe** (instructions, contexte constant) / **contenu variable** (inputs utilisateur, RAG, résultats d'outils).
- Variables notées `{{double_brackets}}` dans la Console.
- Bénéfices : consistance, testabilité, scalabilité, version control du prompt.

```text
Translate this text from English to Spanish: {{text}}
```

- Wrapper les variables dans des XML tags pour plus de clarté : `<text>{{text}}</text>`.

### Prompt Improver

4 étapes automatiques :
1. **Identification des exemples** existants dans le prompt
2. **Draft initial** : structure avec sections claires et XML tags
3. **Chain-of-thought** : ajout d'instructions de raisonnement détaillées
4. **Amélioration des exemples** : démontrent le nouveau processus de raisonnement

Résultat : prompts plus lents mais significativement plus précis pour tâches complexes.
À éviter pour applications latency-sensitive.

**Exemple de transformation :**

Avant :
```text
From the following list of Wikipedia article titles, identify which article this sentence came from.
Respond with just the article title.
```

Après (prompt improver) : ajoute rôle, XML tags, steps de raisonnement (list key concepts → compare → rank top 3 → select), analyse wrappée dans `<analysis>`.

---

## 5. Design et Frontend (pour UX Critic / Frontend Builder)

- Opus 4.8 a un style maison par défaut : fond crème chaud (`#F4F1EA`), serif (Georgia, Fraunces), accents terracotta/amber.
- Instructions génériques ("don't use cream") shift vers une autre palette fixe, pas de variété.
- Approche 1 : spécifier palette concrète avec hex codes.
- Approche 2 : demander 4 directions visuelles proposées avant de build.

Anti-"AI slop" prompt :
```text
<frontend_aesthetics>
NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial), cliched color schemes (purple gradients), predictable layouts, and cookie-cutter design.
Use unique fonts, cohesive colors and themes, and animations for micro-interactions.
</frontend_aesthetics>
```

---

## 6. Implications pour MultiAgentOS

| Principe | Application dans MultiAgentOS |
|----------|-------------------------------|
| Effort = eco/standard/expert | Mapper `project.defaultMode` → effort param dans `claudeCodeLLM` |
| System prompt stable = cache | Instructions constantes en haut, variables en bas — déjà appliqué |
| XML tags inter-agents | Format de handoff JSON wrappé dans `<task>`, `<context>`, `<output_format>` |
| Subagent spawning contrôlé | Instructions explicites dans chaque fiche Tier A sur quand escalader |
| Code review coverage | Quality Controller : utiliser le prompt de coverage (cf. §3) |
| Templates + variables | Chaque fiche agent = template avec variables injectées par le dispatcher |
