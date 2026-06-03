# Phase 3 Resource Audit Master Prompt

TL;DR: Use this document to launch a serious audit of all Notion, local docs, GitHub repos, skills, and agents before adding anything to MultiAgentOS. The goal is not to install everything; the goal is to decide what improves the project while preserving token economy, subscription-only billing, safety gates, and the Tier A/Tier B architecture.

TL;DR: The copy-paste prompt is at the end. It forces the agent to verify access, inventory every resource, score usefulness, separate immediate Phase 3 work from later phases, and output a ranked implementation backlog.

## Why This Exists

The two rough prompts are pointing at the right ambition: make MultiAgentOS smarter, more autonomous, more useful, more beautiful, more secure, and less token-hungry.

They need stronger structure because the resource list is huge and mixed:

- Some resources should become direct implementation work.
- Some should become future skills, memory rules, or agent fiche improvements.
- Some are good ideas but too expensive, too broad, obsolete, unsafe, or not compatible with the current phase.
- Some must be audited before installation because skills and agents can execute code, read files, and access secrets.

This prompt turns the mission into an audit pipeline, not a giant "install everything" request.

## Current Project Constraints To Preserve

The auditing agent must treat these as hard constraints:

- MultiAgentOS is a local-first mission cockpit, not a chat UI.
- External projects are registered by absolute path; never copy, move, or clone their source into this repo.
- Billing mode is Claude Code subscription only. PAYG Anthropic API usage is forbidden.
- Runtime LLM access goes through `packages/core/src/llm.ts` / `llm.real.ts`; no scattered SDK clients.
- Tier A agents orchestrate. Tier B agents execute. The dispatcher is the only path between tiers.
- Tier B never calls Tier A.
- Memory writes go through Memory Keeper only.
- Skills use progressive disclosure: summary first, full body only when explicitly hydrated.
- No skill is installed or promoted without a security audit.
- Risky actions require human validation: destructive shell, force push, secrets, payments, outbound sends, cross-project writes, unapproved network.
- Phase discipline matters. Phase 3 is skill registry and summary routing; Phase 3.5 is multi-model routing; Phase 4 is memory.
- Do not add frameworks, external services, or new top-level architecture without an ADR.

## Local Context The Agent Must Read First

Before browsing or touching external resources, the agent must read and summarize these files:

- `CLAUDE.md`
- `AGENTS.md`
- `PRODUCT_SPEC.md`
- `ROADMAP.md`
- `TOKEN_STRATEGY.md`
- `SKILLS_REGISTRY.md`
- `config/skills.policy.json`
- `docs/knowledge/project-doctrine.md`
- `docs/knowledge/skills-reference.md`
- `docs/knowledge/prompting-anthropic.md`
- `docs/knowledge/agent-patterns.md`
- `docs/knowledge/memory-patterns.md`
- `docs/knowledge/production-patterns.md`
- `docs/claude doc/ressources.md`
- `docs/claude doc/skill-sh.md`
- the `sommaire-que-l-IA-lit-avant-de-fouiller-sa-memoire` file under `docs/claude doc/` (resolve exact spelling with `rg --files`, accents may differ)
- the `systeme-qui-fai-tourner-une-distribution-claude` file under `docs/claude doc/` (resolve exact spelling with `rg --files`, accents may differ)
- `packages/agents/fiches/*.md`
- `.claude/agents/EXECUTIVE-BRIEF.md` and `.claude/agents/QUICKSTART.md`

It must also inventory:

- Count of `.claude/agents/*.md` library agents. Expected: more than 50.
- Count and names of `.claude/skills/*/SKILL.md`.
- Existing orchestrator skills: `.claude/skills/mas-*/SKILL.md`.
- Existing cache files under `data/skill-cache/` if present.

## Audit Phases

### Phase 0: Access And Inventory Gate

The agent must verify access before analysis:

1. Confirm whether it can access the Notion resources page.
2. Confirm whether it can access every Google Doc / public doc link.
3. Confirm whether it can access each GitHub repository.
4. Count all resources discovered, not just the resources pasted in the prompt.
5. Mark every item as `accessible`, `blocked`, `duplicate`, `local-only`, or `needs-user-access`.

If Notion access is blocked, the agent must not pretend. It must ask for exported markdown, a public share link, or connector access.

### Phase 1: Resource Understanding

For each resource, produce a short but real analysis:

- What it is.
- Date / recency signal.
- Obsolescence risk.
- Main useful ideas.
- Concrete relevance to MultiAgentOS.
- Token / complexity impact.
- Security or maintenance risk.
- Whether it is a skill, agent, MCP, pattern, prompt, memory method, UI inspiration, or research source.

### Phase 2: Decision Scoring

Score every resource from 0 to 5 on:

- Project fit.
- Token efficiency.
- Safety.
- Implementation effort.
- Evidence / maturity.
- User value.
- Phase compatibility.

Then assign exactly one decision:

- `implement_now`: fits current phase and has clear ROI.
- `adapt_now`: useful idea, but implement a smaller local version.
- `backlog_next`: valuable, but belongs to Phase 3.5 / 4 / 5+.
- `watch`: interesting but not enough evidence.
- `reject`: incompatible, unsafe, duplicate, too expensive, or off-scope.

### Phase 3: Architecture Mapping

Map approved ideas to MultiAgentOS surfaces:

- Tier A agent fiche update.
- Tier B delegation map update.
- Skill creation or skill update.
- Skill registry / routing policy update.
- Memory architecture update.
- Context Manager update.
- Security / permissions update.
- UI page or cockpit workflow update.
- ADR candidate.
- Test / evaluation harness.

For each proposed implementation, include:

- Files likely touched.
- Phase target.
- Required tests or verification.
- Token budget estimate.
- Human validation requirement.
- What not to do.

### Phase 4: Output And Backlog

The final output must contain:

- Executive TL;DR in 10 lines maximum.
- Access audit table.
- Resource matrix.
- Top 10 immediate recommendations.
- Phase 3-safe implementation plan.
- Phase 3.5 / 4 / 5+ backlog.
- Skill and agent candidates.
- Memory and context strategy.
- Security concerns.
- ADR candidates.
- Open questions for the user.

## Agent Decomposition For The Audit

Use this decomposition if the runtime supports subagents. If not, simulate it as sections.

| Agent / Role | Responsibility | Output |
|--------------|----------------|--------|
| Context Manager | Read local repo, docs, fiches, current phase state | Project context pack |
| Researcher | Inspect Notion, GitHub, public docs, dates, replacements | Resource evidence table |
| Skill Auditor | Audit installable skills / MCPs / repos for safety and bloat | PASS / NEEDS_WORK / REJECT |
| Architect | Map useful ideas to MultiAgentOS architecture and phases | Architecture deltas |
| Skill Router | Decide required skills, Tier B agents, and budget per implementation task | Routing matrix |
| Memory Architect | Decide memory strategy: markdown, SQLite FTS5, summaries, Graphify/Obsidian | Memory roadmap |
| Quality Controller | Check process compliance with CLAUDE.md, phase rules, no PAYG, token discipline | Process verdict |
| Reviewer | Review the final plan for contradictions, missing tests, and vague tasks | Findings |
| Security Reviewer | Gate high-risk actions, installs, network, secrets, external writes | Risk verdict |

Respect the actual project rule: Tier A agents do not call each other directly; route through dispatcher semantics.

## Resource List Seed

The audit must include the pasted resources and any additional resources found in Notion or local docs.

Seed links:

- `https://tangible-mink-e9a.notion.site/Ressources-62124138fc8c834cb89581026c259dcd?source=copy_link`
- `https://github.com/github/spec-kit`
- `https://github.com/Leonxlnx/taste-skill`
- `https://github.com/pbakaus/impeccable`
- `https://github.com/obra/superpowers`
- `https://github.com/codecrafters-io/build-your-own-x`
- `https://github.com/voltagent/awesome-design-md`
- `https://emilkowal.ski/skill`
- `https://github.com/21st-dev/magic-mcp`
- `https://skillui.vercel.app`
- `https://github.com/msitarzewski/agency-agents`
- `https://www.skills.sh`
- `https://unmuteai.com/value-gift/claude-code-layers`
- Google Doc design skills link from the user prompt
- Google Doc Graphify link from the user prompt
- Local docs under `docs/claude doc/`
- Local docs under `docs/knowledge/`

## Copy-Paste Master Prompt

```text
Tu es l'agent d'audit strategique de MultiAgentOS. Tu es expert en prompting, agents IA, skills, memory, architecture locale, securite, UX produit, et economie de tokens.

Mission:
Faire un audit complet des ressources Notion, docs locales, repos GitHub, skills, agents, MCPs, prompts et idees fournis pour determiner quoi integrer dans MultiAgentOS, quoi adapter, quoi reporter, quoi rejeter, et comment le faire sans casser les contraintes du projet.

Objectif final:
Rendre MultiAgentOS beaucoup plus pratique, autonome, precis, rapide, beau, sur, memoriel, et extensible, tout en consommant le moins de tokens possible et en restant compatible avec la vision de depart.

<hard_constraints>
- MultiAgentOS est local-first et single-user.
- Ce n'est pas un chat UI: c'est un cockpit de missions multi-agents.
- Les projets externes sont references par chemin absolu; ne jamais les copier/deplacer/cloner dans ce repo.
- Paiement: Claude Code subscription only. Anthropic PAYG API est interdit.
- Aucun import runtime de @anthropic-ai/sdk hors exception explicitement ADRisee.
- Tier A orchestre, Tier B execute. Le dispatcher est le seul passage entre tiers.
- Tier B ne doit jamais appeler Tier A.
- Memory Keeper est le seul agent qui ecrit dans data/memory/.
- Charger les summaries de skills avant les bodies complets.
- Ne jamais installer/promouvoir un skill, agent, MCP ou repo sans audit securite.
- Toute action destructive, secret, paiement, envoi externe, force push, write cross-project, ou network non autorise exige validation humaine.
- Respecter ROADMAP.md: Phase 3 = Skill Registry; Phase 3.5 = Multi-model Router; Phase 4 = Memory.
- Ne pas ajouter de framework/service majeur sans ADR.
</hard_constraints>

<local_context_first>
Avant de naviguer sur le web, lis et resume:
1. CLAUDE.md
2. AGENTS.md
3. PRODUCT_SPEC.md
4. ROADMAP.md
5. TOKEN_STRATEGY.md
6. SKILLS_REGISTRY.md
7. config/skills.policy.json
8. docs/knowledge/project-doctrine.md
9. docs/knowledge/skills-reference.md
10. docs/knowledge/prompting-anthropic.md
11. docs/knowledge/agent-patterns.md
12. docs/knowledge/memory-patterns.md
13. docs/knowledge/production-patterns.md
14. docs/claude doc/ressources.md
15. docs/claude doc/skill-sh.md
16. Le fichier `sommaire-que-l-IA-lit-avant-de-fouiller-sa-memoire` sous docs/claude doc/; utilise `rg --files` pour trouver son orthographe exacte si accents/espaces different
17. Le fichier `systeme-qui-fai-tourner-une-distribution-claude` sous docs/claude doc/; utilise `rg --files` pour trouver son orthographe exacte si accents/espaces different
18. packages/agents/fiches/*.md
19. .claude/agents/EXECUTIVE-BRIEF.md
20. .claude/agents/QUICKSTART.md

Ensuite inventorie:
- nombre de .claude/agents/*.md; il doit y en avoir plus de 50;
- noms et nombre de .claude/skills/*/SKILL.md;
- presence des 6 skills orchestrateurs mas-*;
- presence de data/skill-cache si existant.
</local_context_first>

<resources_to_audit>
Audit au minimum:
- Page Notion ressources: https://tangible-mink-e9a.notion.site/Ressources-62124138fc8c834cb89581026c259dcd?source=copy_link
- github/spec-kit
- Leonxlnx/taste-skill
- pbakaus/impeccable
- obra/superpowers
- codecrafters-io/build-your-own-x
- voltagent/awesome-design-md
- emilkowal.ski/skill
- 21st-dev/magic-mcp
- skillui.vercel.app
- msitarzewski/agency-agents + page Notion associee
- skills.sh
- unmuteai Claude Code layers
- Google Doc design skills fourni
- Google Doc Graphify fourni
- docs/claude doc/*
- docs/knowledge/*

Si tu decouvres plus de ressources depuis Notion, ajoute-les a l'inventaire.
</resources_to_audit>

<access_gate>
Commence par verifier les acces:
- Notion accessible ou non?
- Google Docs accessibles ou non?
- GitHub repos accessibles ou non?
- Nombre total de ressources trouvees?
- Ressources bloquees?

Ne fais aucune supposition silencieuse. Si une ressource est inaccessible, marque-la needs_user_access et continue avec les ressources accessibles.
</access_gate>

<audit_method>
Pour chaque ressource:
1. Identifie ce que c'est: skill, agent, MCP, prompt, memory pattern, UI inspiration, research, repo, doc, autre.
2. Note la date ou le signal de recence. Si la date est absente, dis-le.
3. Evalue l'obsolescence: low / medium / high.
4. Resume les idees utiles en 3-6 bullets.
5. Dis exactement comment cela pourrait ameliorer MultiAgentOS.
6. Evalue le cout tokens/contexte.
7. Evalue le risque securite/maintenance.
8. Score de 0 a 5:
   - project_fit
   - token_efficiency
   - safety
   - implementation_effort
   - evidence_maturity
   - user_value
   - phase_compatibility
9. Decision unique:
   - implement_now
   - adapt_now
   - backlog_next
   - watch
   - reject
10. Justification en 2-4 lignes.
</audit_method>

<implementation_mapping>
Pour chaque ressource implement_now ou adapt_now:
- phase cible: Phase 3, Phase 3.5, Phase 4, Phase 5+;
- surface touchee: agent fiche, skill, registry, dispatcher, memory, UI, docs, ADR, tests;
- fichiers probables;
- agents Tier A impliques;
- Tier B agents appeles;
- skills requises;
- budget tokens estime;
- tests/verifications;
- risques;
- choses a ne pas faire.
</implementation_mapping>

<important_decision_rules>
- Ne propose pas d'installer 50 skills "au cas ou".
- Si une ressource est bonne mais lourde, propose une adaptation locale plus petite.
- Si une ressource contient un super pattern mais trop de dependances, extrais le principe et backloge l'implementation.
- Si un repo/skill/MCP peut executer du code, il doit passer un audit de securite avant installation.
- Si l'idee touche a l'email, trading, finance, paiement, envoi externe, deploy, secrets ou force push, Security Reviewer obligatoire.
- Si l'idee touche a la memoire, verifier compatibilite avec les 5 registres, summaries, Markdown+SQLite/FTS5, et Memory Keeper.
- Si l'idee touche aux skills, respecter progressive disclosure: L1 summary, L2 SKILL.md, L3 references/scripts/assets.
- Si l'idee touche au design, viser cockpit dense et utile, pas landing page marketing.
- Si l'idee ajoute un agent, verifier qu'il a une responsabilite distincte, un budget, des limites, escalate_when, et max 7 tools.
</important_decision_rules>

<expected_output>
Rends un rapport Markdown avec:

## TL;DR
10 lignes maximum.

## Access Audit
Table: resource, type, status, count/date, notes.

## Project Context Summary
Ce que tu as compris de MultiAgentOS en 15 lignes maximum.

## Resource Matrix
Table complete: resource, type, recency, usefulness, token impact, risk, score, decision.

## Top 10 Recommendations
Classement strict, avec raison et phase cible.

## Phase 3 Safe Plan
Seulement ce qui peut etre fait maintenant sans deriver de ROADMAP.md.

## Backlog Phase 3.5 / 4 / 5+
Ce qui est bon mais doit attendre.

## Skills To Create Or Improve
Pour chaque skill: trigger, negative trigger, domain, summary L1, body L2 outline, verification criteria.

## Agents To Create Or Improve
Pour chaque agent: Tier, role, responsibilities, limits, tools <= 7, budget, output_format, escalate_when.

## Memory And Context Strategy
Choisir entre sommaires markdown, SQLite FTS5, Graphify/Obsidian, mem0/MemOS/etc. Dire quoi faire maintenant et quoi reporter.

## Security Review
Risques critiques, installs interdits, validations humaines necessaires.

## ADR Candidates
Liste des decisions qui meritent un ADR.

## Implementation Backlog
Table: task, phase, files, owner agent, skills, estimated tokens, risk, DoD.

## Open Questions
Questions vraiment bloquantes seulement.

Style:
- Francais clair.
- Pas de blabla.
- Pas de promesses vagues.
- Chaque recommandation doit etre reliee a une contrainte ou un fichier du projet.
- Si tu n'as pas acces a une ressource, dis-le explicitement.
</expected_output>
```

## Recommended First Run

Run the master prompt in `expert` mode only for the audit and planning step, because it requires cross-source reasoning. Then execute the resulting implementation backlog in smaller `standard` or `eco` missions:

1. Audit and score resources.
2. Approve the top recommendations manually.
3. Turn only approved Phase 3 items into an implementation plan.
4. Run implementation task-by-task.
5. Quality Controller checks process.
6. Reviewer checks code/artifacts.
7. Security Reviewer gates installs, network, memory writes, secrets, and external actions.

## My Recommended Bias

Given the current repo state, the best first audit outcome is likely:

- Keep Phase 3 narrow: finish robust skill summaries, routing policy, and `/skills` UX.
- Create an audited backlog for external skills instead of installing them immediately.
- Add a Quality Controller agent in Phase 3.5 or as a scoped Phase 3.5 prep item, not as surprise Phase 3 scope creep.
- Treat memory systems as Phase 4: Markdown plus SQLite FTS5 first, Graphify/Obsidian as human visualization or later semantic layer.
- Treat marketplace resources as inspiration until they pass install audit.
- Prefer extracting principles from heavy repos over copying their stack.
