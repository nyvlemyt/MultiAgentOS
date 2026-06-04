# VibeFlow — Gouvernance & Architecture (patterns extraits)

Patterns issus des ressources Notion @le_gouverneur_ia, catégorie Gouvernance. Source intégrale fetchée 2026-06-03.

---

## RES-057 — Base saine : 3 principes d'architecture lisible pour une IA

**Principe** : quand l'IA casse le code en boucle, ce n'est presque jamais le modèle. C'est l'organisation des fichiers. 3 garde-fous :

1. **Un fichier, une job** : seuil ~300 lignes → découper (cible 150-200). Un "god file" force l'IA à tout lire pour changer une chose → casse en cascade.
2. **Ranger par domaine de sens** (panier/paiement/catalogue), pas en dossiers techniques fourre-tout. **Dépendances dans un seul sens** : la logique métier ne dépend jamais des détails techniques (DB, affichage, services externes).
3. **Un filet de vérification qui tourne VRAIMENT** : tests de non-régression relancés à chaque modif. **Piège** : un filet qui ne tourne plus est pire que pas de filet (fausse sécurité).

**Ordre quand le projet casse déjà** : (1) stabiliser le filet d'abord, (2) puis découper les gros fichiers un par un en vérifiant le filet vert après chaque, (3) enfin ranger par domaine.

**Application MAS** :
- **Valide CLAUDE.md §7** "No new top-level files without updating §3" + la structure par packages (core/db/agents/skills/memory/tokens).
- **Valide RES-048** (agent < 200 lignes) au niveau projet : un package = un domaine de sens.
- Le "filet qui tourne vraiment" = nos 28 tests Vitest. Confirme la discipline `pnpm -w test` avant chaque commit (la vérification Phase 3 close).
- **Pattern dépendances unidirectionnelles** : `packages/core` (LLM injection) ne doit pas dépendre de `apps/web`. À vérifier si on ajoute un dependency-cruiser en Phase 5.

---

## RES-042 — OWASP Readiness Toolkit (Top 10 Agentic 2026)

**Principe** : OWASP Top 10 for Agentic Applications 2026 (publié déc 2025, premier cadre officiel sécurité agents). 3 risques les plus fréquents en prod :

| ID | Risque | Couverture MAS |
|----|--------|----------------|
| **ASI03** | Identity & Privilege Abuse (escalade) | Tier A/B mandats + dispatcher seul pont. Chaque agent a identité+role+mandat (fiche). ✅ |
| **ASI02** | Tool Misuse & Exploitation (outils hors mandat) | CLAUDE.md §5 risky actions + hook PreToolUse (Phase 6) + `required_skills` déclaré. ✅ partiel |
| **ASI06** | Memory & Context Poisoning (corruption mémoire) | Memory Keeper seul écrivain + consolidation RES-034 + règle "quoi NE PAS retenir". ⚠️ Phase 4 |

**Mapping complet des 10 (priorité MAS)** :
- ASI01 Goal Hijack — partiel (contracts limitent scope, mais injection indirecte via docs externes non couverte). **Pertinent** : MAS lit des projets externes → risque prompt injection via leurs fichiers. Sec Reviewer à instrumenter.
- ASI04 Supply Chain — non couvert. **Pertinent Phase 6** : audit des MCP servers (QMD, Notion) + skills externes (skills.sh, taste-skill). C'est notre "audit sécu avant install".
- ASI05 RCE — partiel (hook bloque destructif, pas le code généré puis exécuté).
- ASI07 Inter-Agent Comm — non couvert. **Pertinent Phase 5** : messages Tier A↔B via dispatcher.
- ASI08 Cascading Failures — partiel. **Pertinent** : circuit breakers budget (TOKEN_STRATEGY §8).
- ASI10 Rogue Agents — partiel (consolidation détecte drift).

**Application MAS** :
- **Le prompt maître OWASP-readiness = un audit que Sec Reviewer peut tourner sur un projet enregistré.** À intégrer comme skill `mas-sec-reviewer` capability ou `/audit-owasp`.
- Les 3 templates (contracts.md, hook pre-action, consolidate.md) correspondent à : AGENTS.md (contracts), hook PreToolUse Phase 6, Memory Keeper consolidation Phase 4.
- **ASI04 Supply Chain = notre politique "no skill installed without security audit"** (CLAUDE.md). Formaliser en ADR 0005 (Skill Install Policy).

---

## RES-040 — 3 dérives silencieuses : EVAL-XXX + protocoles

**Principe** : l'hallucination est une propriété statistique des LLMs, pas un bug. On ne la corrige pas avec un meilleur modèle, on l'encadre par un rituel d'évaluation. (Anthropic a laissé tourner une régression Sonnet "thinking medium au lieu de high" pendant 34 jours sans la voir.)

**3 dérives** :
| Dérive | Symptôme | Détection |
|--------|----------|-----------|
| Hallucination factuelle | cite API/chiffre/référence qui n'existe pas, avec assurance | cross-check 2e LLM (autre famille) sur rubrique 5 critères |
| Biais d'ancrage | l'output reflète le prompt plus que la réalité | reformuler en 3e personne neutre, comparer (écart >30% = manipulé) |
| Dérive temporelle | template 6 mois cite prix/règles/outils périmés | revue trimestrielle 4 questions |

**Template EVAL-XXX (8 champs)** : Date / Output évalué / Contexte / Méthode (LLM-as-Judge | cross-check | confrontation réalité | reformulation) / Score qualitatif (rubrique 5 critères /5) / Anomalies / Cause probable / Action (Keep/Correct/Deprecate/Escalation) / Learning associé.

**Table de fréquence d'éval** :
- Décision structurante (BDR) → confrontation réalité J+30
- Prédiction quantitative → J+30, J+60, J+90
- Template/contenu → trimestriel
- Agent/skill → à chaque update majeur
- Output critique prod publique → mensuel
- One-shot non engageant → aucune éval

**Slogan** : "Pas tout, pas tout le temps. Mais quelque chose, tout le temps."

**Application MAS Phase 3.5** :
- **EVAL-XXX = le format de sortie exact du Quality Controller.** `data/memory/<projectId>/evals/EVAL-<timestamp>.md`. 8 champs.
- **Cross-check par modèle d'autre famille** → argument FORT pour le multi-model router (Phase 3.5) : QC en o1-mini ou Gemini évalue un output produit par Claude → évite la boucle fermée (Piège 1 : "évaluer avec le même LLM hallucine sur les mêmes biais").
- **Protocole 2 (reformulation neutre, écart >30%)** → Mission Planner devrait, pour les décisions structurantes, générer 2 formulations et comparer (anti-ancrage). Lien avec self-consistency (skills-reference.md).
- **Piège 2 : "tests passent ≠ bon raisonnement"** → confirme la distinction Reviewer (P5-Vérifier la forme) vs Quality Controller (P8-Évaluer le raisonnement). Les deux, dans l'ordre.
- **Table de fréquence** → cadence d'éval par type de tâche, à encoder dans le risk classifier.

---

## RES-036 — DURCIR : les 3 niveaux de durcissement des règles

**Principe** : la mémoire est passive, le comportement est actif. Une règle écrite n'est pas une règle appliquée. Pour qu'une règle soit respectée, il faut la **durcir** (la promouvoir d'un niveau passif à exécutoire) et l'**auditer trimestriellement**.

**Les 3 niveaux** :
```
NIVEAU 3 — DOCTRINE (exécutoire)   → CLAUDE.md / fiche agent. Lu à chaque exécution, ne peut pas l'ignorer.
        ↑ si ignorée malgré contract OU criticité haute
NIVEAU 2 — CONTRACT (procédural)   → AGENTS.md / .claude/rules/. Chaque agent doit la respecter.
        ↑ si ignorée 2-3 fois
NIVEAU 1 — MÉMOIRE (consultatif)   → data/memory/. L'agent PEUT la consulter, PEUT l'ignorer.
```

**Critères de promotion** :
- 1→2 : ignorée 2-3× OU concerne plusieurs agents OU impact bloquant OU stable (testée 3+×)
- 2→3 : ignorée malgré contract OU criticité haute (légale/financière/identitaire) OU filtre systémique OU non-négociable partout
- **Saut direct 1→3** : criticité haute immédiate (copyright, leak, violation publique) OU ignorée dès la 1ère chance OU pattern systémique

**Rituels** :
- `drift-log.md` : journal des règles ignorées (date capitalisation / date détection dérive / délai durcissement / niveau initial→final)
- **Circuit Breaker** : 2h/trimestre, **SANS IA ouverte** (sinon l'agent valide ses propres règles = Delegation Feedback Loop). L'humain décide.
- Audit trimestriel par agent (4 questions : mandat valide ? périmètre exact ? critères corrects ? sources actives ? + "Si je découvrais cet agent aujourd'hui, signerais-je ce mandat ?")

**Application MAS** :
- **C'est le pipeline LRN → CLAUDE.md** formalisé en 3 niveaux. Le Memory Keeper promeut : learning récurrent (niveau 1) → règle projet (niveau 2, AGENTS.md/rules) → doctrine (niveau 3, CLAUDE.md). Seuil de promotion déterministe.
- **Le `drift-log.md` = un registre MAS** : quand un agent ignore une règle (détectable via Quality Controller), tracer. Si une famille dérive en <7 jours → écrire directement niveau 3.
- **Circuit Breaker SANS IA** = rituel humain de Melvyn (pas un agent). MAS peut le *préparer* (exporter BDR/EDR/fiches) mais ne le *conduit* pas. Phase 6+.
- **Audit trimestriel par agent** = le `quarterly-agent-audit.md`. MAS peut générer le rapport, l'humain tranche.
- **"Delegation Feedback Loop"** : danger architectural majeur — un agent ne valide jamais ses propres règles. Confirme : Quality Controller ≠ exécutant (instance séparée).

---

## RES-055 — Anthropic 15 juin : billing (déjà dans CLAUDE.md §11)

Intégré : Agent SDK subscription = crédit mensuel séparé de Claude.ai depuis 2026-06-15. Voir CLAUDE.md §11 + `docs/knowledge/anthropic-ecosystem.md`.

---

## RES-024 — Audite tes agents en 10 min : 4 piliers + verdict PROD/STAGING/BLOQUÉ/ARRÊTER

**Principe** : un agent « qui tourne » n'est pas un agent « sous contrôle ». Avant de laisser un agent décider/agir sans relecture systématique, il doit cocher **4 piliers** ; une case vide = un gap. Le PDF cadre la question par : « si chacun de tes agents partait en vrille demain matin, le saurais-tu dans l'heure ? » (RES-024 = auditer l'existant ; le framework 4-piliers **détaillé** + le chiffre « 40 % Gartner » sont dans le PDF compagnon « Structurer la gouvernance AVANT de déployer », distillé juste après — au Batch 1 ce chiffre avait été attribué à tort à ce PDF-ci.)

**Les 4 piliers** (réponse écrite obligatoire par agent) :

| Pilier | Question | Si manquant |
|--------|----------|-------------|
| **Mandat** | mission en 1 phrase (sans le mot « tout ») + ≥3 interdictions + humain décideur nommé ? | l'agent décide seul de son rôle, dérive garantie |
| **Périmètre** | allowlist tools/fichiers/APIs + budget max (tokens/$/turns) ? | périmètre illimité, coût et dégâts incontrôlables |
| **Checkpoints** | actions destructives → validation humaine + logs vers une destination regardée ? | accident à l'échelle dès le 1er bug |
| **Escalade** | conditions d'arrêt auto + humain alerté + **kill switch accessible HORS de la stack qui l'exécute** ? | l'agent continue même en dérive, tu ne peux plus l'arrêter |

**Grille de verdict** (checklist 10-Q : Mandat 2 / Périmètre 3 / Checkpoints 3 / Escalade 2) :
- **10/10 → PRÊT PROD**
- **8-9 → PRÊT STAGING** (corriger sous 2 sem., priorité Escalade > Checkpoints > Périmètre > Mandat)
- **5-7 → BLOQUÉ** (ne doit pas tourner en prod avant correction)
- **0-4 → À ARRÊTER IMMÉDIATEMENT**
- **Cas spécial** : pas de kill switch externe (Q10) + agent en prod = **À ARRÊTER** quoi que disent les autres réponses.

**Risques systémiques** (au-delà de l'agent isolé) : agents qui s'invoquent mutuellement sans limite (deadlock), tools/credentials partagés sans isolation, logs qui partent dans le vide, secrets hardcodés, pas de budget global (runaway), pas de kill switch global externe.

**`contract.yaml` minimal** (par agent BLOQUÉ/ARRÊTER) : `name / owner (humain nommé) / status / deployment / mission / prohibitions[≥3] / human_decision_maker / allowed_resources / denied_resources / limits(max_budget, timeout) / human_validation_required_for / logs_go_to / alert_on / stop_conditions / escalation_recipient / kill_switch (procédure externe)`.

**Application MAS** :
- **Cadre de gouvernance qui sous-tend tout MAS.** Les 4 piliers mappent 1:1 : Mandat = fiche Tier A (role + interdits) ; Périmètre = `tools≤7` + budget mission (TOKEN_STRATEGY §8) + sandbox projet ; Checkpoints = CLAUDE.md §5 (validation humaine actions risquées) + table `events` ; Escalade = `escalate_when` + `budget_exceeded` + kill switch.
- **La grille PROD/STAGING/BLOQUÉ/ARRÊTER est un verdict plus riche que VALIDÉ/AJUSTÉ/REJETÉ (RES-043).** Le Quality Controller (Phase 3.5) peut l'adopter pour auditer chaque fiche AVANT activation d'un mode autonome.
- **Kill switch « hors de la stack »** : le worker MAS doit pouvoir être arrêté indépendamment (kill du process, flag DB `paused`), jamais via une commande passant par l'agent lui-même. À vérifier Phase 6 (autonomy gates).
- **`contract.yaml` = la version par-agent de `config/permissions.json`** (catégories risquées + allowlist hosts = registre central). Candidat enrichissement Phase 6.
- Risques systémiques déjà couverts : « agents s'invoquent sans limite » → depth=1 (agent-patterns.md, Tier B ne spawn pas) ; « runaway budget » → circuit breaker TOKEN_STRATEGY §8 ; « logs vers le vide » → table `events` + SSE.
- **Self-audit** : faire tourner cette grille sur les 6 fiches Tier A au gate Phase 3.5 (cf. `docs/backlog/self-audit-lean-claude-md.md`).

---

## Structurer la gouvernance AVANT de déployer — framework 4 piliers détaillé (compagnon RES-024)

**Mapping RES** : PDF `docs/ressources/Structurer la gouvernance AVANT de déployer tes agents IA.pdf` (14 p.). Ne porte pas de numéro RES dans son texte ; **candidat RES-023** au sens de la description INDEX (« governance agents IA, cadrage→monitoring ») ET référencé par RES-024 (« la version longue 100+ lignes du contrat est dans RES-023 »). À ne pas confondre avec le PDF « Gouverner tes Agents IA Templates + Prompts » (4 prompts + 5 patterns de contrats, distillé dans `agents-skills.md`). **Mapping RES-023 entre ces deux PDFs non tranché à 100 %** — voir `docs/learning/2026-06-04-vibeflow-reaudit/build-report.md`. **C'est la source réelle du « 40 % Gartner » mal attribué à RES-024 au Batch 1.**

**Principe** : Managed Agents (beta 8 avril 2026) fournit les murs *techniques* (sandbox, scoped permissions, observabilité) ; la couche *projet* (gouvernance) reste à construire. Avant tout déploiement, répondre par écrit à 4 questions : **qui** décide quoi quand l'agent tourne sans toi · **quel** périmètre exact · **qui** valide à chaque étape critique · **qu'est-ce qui se passe** quand il hésite/se trompe. Chiffre cité : **40 % des initiatives agentiques sont annulées avant la fin (source : Gartner)** — pas par échec technique, par absence de gouvernance.

**Les 4 piliers → 4 fichiers par agent** (version détaillée du tableau condensé de RES-024) :

| Pilier | Fichier généré | Contenu |
|--------|----------------|---------|
| Mandat | `MANDATE.md` | mission (1 phrase, sans « tout ») · valeur livrée · interdictions JAMAIS · sources d'autorité · humain décideur · critères de succès |
| Périmètre | `SCOPE.md` | tools autorisés (allowlist Read/Write/Bash/WebFetch) · tools interdits (denylist) · ressources externes (APIs + rate limits) · limites (max tokens/turns/timeout/budget$) |
| Checkpoints | `CHECKPOINTS.md` | validations humaines (trigger/validator/format) · logs structurés (event/schema/destination/rétention) · hooks lifecycle (PreToolUse/PostToolUse/OnError/OnComplete) · métriques + seuils · rapport de session |
| Escalade | `ESCALATION.md` | conditions d'arrêt (technique/sévérité/action) · chemins info/warning/critical · format message · modes dégradés · **stop conditions globales = « dead man's switches »** |

**Checklist pre-deploy (10-Q, AVANT le 1er deploy)** — distincte de la 10-Q d'audit de RES-024 : Mandat 2 (mission 1 phrase sans « tout » / ≥3 interdictions) · Périmètre 2 (liste exhaustive fichiers-APIs écrits / budget max tokens-$-turns) · Checkpoints 2 (action destructive → validation humaine / logs vers un endroit regardé) · **Escalade 4** (3+ conditions d'arrêt à action immédiate / humain nommé reçoit les escalades / mode dégradé si API tombe / **kill switch sans Claude, hors de la stack déployée**). Règle : « l'audit post-déploiement coûte 10× plus cher que la prévention ».

**`contract.yaml` long-form (100+ lignes)** = version canonique du contrat minimal de RES-024. Arbre complet : `mandate{mission, value_delivered, prohibitions[], authority_sources, human_decision_maker, success_criteria[]}` · `scope{allowed_tools{read,write,bash,web_fetch,subagents}, denied_tools[], resource_limits{max_tokens, max_turns, timeout, max_budget}}` · `checkpoints{human_validation_required, structured_logs{event,schema,destination,retention}, lifecycle_hooks{pre_tool_use,post_tool_use,on_error,on_complete}, metrics, alert_threshold}` · `escalation{stop_conditions[], escalation_paths{warning,critical}, degraded_modes, global_stop_conditions[]}` · `metadata{deployment, kill_switch, rollback_procedure, review{last_audit_date, next_audit_date, audit_frequency}}`.

**Application MAS** :
- **Le contract.yaml long-form = le super-set de `config/permissions.json` + fiche Tier A + budget.** Mapping : `mandate` → fiche (role + interdits + escalate_when) ; `scope.allowed_tools/denied_tools` → `tools≤7` + permissions.json (allowlist hosts) ; `resource_limits` → TOKEN_STRATEGY §8 (budget mission) ; `checkpoints.human_validation_required` → CLAUDE.md §5 ; `lifecycle_hooks` → hooks Phase 6 ; `escalation.global_stop_conditions` (dead man's switch) → kill switch worker ; `metadata.review.audit_frequency` → cadence EVAL-XXX (RES-040). **Candidat enrichissement schema permissions Phase 6** (à valider en ADR, pas adopter tel quel).
- **Découpage 4 fichiers (MANDATE/SCOPE/CHECKPOINTS/ESCALATION.md) vs notre fiche unique** : MAS garde **une fiche par agent** (RES-048, ≤200 lignes) — le multi-fichier est plus verbeux et n'apporte rien pour un single-user ; on extrait la **structure des champs**, pas le découpage. Pas de changement d'archi.
- **Pre-deploy 10-Q (poids Escalade ×4)** confirme que l'escalade/kill switch est le point faible le plus dangereux → à prioriser dans l'audit self (gate Phase 3.5, cf. backlog self-audit).
- ⚠️ Le doc cible **Managed Agents** (cloud, PAYG) comme destination de déploiement — **interdit §11** ; MAS applique le framework **en local uniquement** (cf. RES-016, agents-skills.md). Framework adopté, cible cloud rejetée — pas d'intégration silencieuse.

---

## RES-008 — Audit des 3 dettes invisibles : documentaire / technique / cognitive

**Principe** : « ça tourne » ≠ « c'est sain ». 3 dettes s'accumulent en silence dans tout projet piloté par l'IA et se révèlent quand le projet grossit. Chacune a un prompt d'audit, une checklist 7-questions et un score /10 (0-3 sain, 4-6 attention, 7-10 critique). Score global /30.

| Dette | Ce qui s'accumule | Symptôme visible | Note |
|-------|-------------------|------------------|------|
| **Documentaire** | décisions prises jamais tracées | l'IA contredit une décision d'il y a 2 semaines | fondation des 2 autres |
| **Technique** | code/config sans structure | un changement anodin casse 3 autres choses | — |
| **Cognitive** | complexité que personne ne comprend | « pourquoi on a fait ça déjà ? » chaque semaine | ⚠️ **la pire** : écart entre ce que le projet fait et ce que les humains en comprennent |

**Ordre de réduction** : documentaire d'abord (la fondation), technique ensuite, cognitive en dernier. Plan : CLAUDE.md + registre décisions (EDR) → mémoire active → hook PreToolUse destructif → glossaire projet → documenter le « pourquoi » des décisions majeures.

**Application MAS** :
- **MAS est conçu contre ces 3 dettes.** Documentaire = ADRs (`docs/decisions/`) + `docs/backlog/` + Decision Log (Phase 4.5). Technique = filet Vitest + structure packages (RES-057). Cognitive = `docs/knowledge/` + CLAUDE.md + le présent travail de distillation.
- La checklist documentaire valide notre discipline (décisions tracées ADR/EDR, conventions écrites, onboarding < 30 min) ; la checklist technique valide nos garde-fous (tests sur fonctions critiques, pas de duplication, hook destructif Phase 6, dépendances à jour).
- **Self-audit** : faire tourner les 3 prompts d'audit sur MAS lui-même au gate Phase 3.5 — score /30 attendu en zone « sain » si la discipline tient (cf. backlog self-audit).
- ⚠️ **Dette cognitive = argument pour le pont de persistance** (`knowledge-bootstrap.md §5.bis`) : sans le pont docs/knowledge → mémoire Phase 4, le savoir build-time devient dette cognitive runtime.

---

## RES-012 — Checklist 5 DON'T/DO (les habitudes qui scalent)

**Principe** : 95 % des projets Claude Code fonctionnent en « question-réponse » et s'effondrent quand ils grossissent. Les 5 % qui scalent **gouvernent AVANT d'automatiser**.

| # | DON'T | DO | MAS |
|---|-------|----|-----|
| 1 | coder sans CLAUDE.md | constitution avant le code (**< 200 lignes, chaque instruction vérifiable**) | ✅ CLAUDE.md — ⚠️ longueur à auditer (backlog lean-claude-md) |
| 2 | un agent par tâche | skills d'abord, agents si isolation requise | ✅ matrice agent/skill (RES-048/035) |
| 3 | auto mode sans filet | hooks de sécurité avant de lâcher la bride | ⏳ Phase 6 (PreToolUse bloque rm/force push/drop) |
| 4 | chaque session repart de zéro | mémoire auto + capitalisation | ⏳ Phase 4 (Memory Keeper) |
| 5 | 10 MCP « au cas où » (50k+ tokens) | CLI par défaut, MCP si justifié (connexion persistante/équipe) | ✅ token discipline + Tool Search lazy |

**Application MAS** :
- DON'T#1 énonce la règle **CLAUDE.md < 200 lignes, instructions vérifiables** — notre CLAUDE.md la dépasse → **candidat self-audit** (backlog). Ne pas éditer CLAUDE.md ici.
- DON'T#5 « CLI > MCP » valide la discipline token (TOKEN_STRATEGY) et l'usage de Tool Search (chargement paresseux des schémas d'outils).
- DON'T#3 (hooks avant auto mode) cadre les autonomy gates Phase 6 : `--dangerously-skip-permissions` interdit, PreToolUse obligatoire.
- Ordre RES-012 « constitution → skills → hooks → mémoire ». MAS place la mémoire (Phase 4) avant les hooks (Phase 6) — choix de séquençage assumé, sans contradiction de fond (la constitution reste première).

---

## RES-013 — Starter kit : les 3 types de fichiers (Constitution / Agents / Mémoire)

**Principe** : tout projet piloté par l'IA tient sur 3 types de fichiers texte — pas du code, pas un framework : de l'infrastructure documentaire.

| Type | Fichier(s) | Rôle | Quand lu |
|------|-----------|------|----------|
| **1. Constitution** | CLAUDE.md | règles du jeu : organisation, conventions, contraintes | à chaque session, en premier |
| **2. Agents** | `.claude/agents/*.md` | qui fait quoi : mandat, territoire, contrats | quand une tâche est déléguée |
| **3. Mémoire** | `.claude/memory/*.md` | ce que le projet a appris : décisions, blocages, itérations | à la demande, via un index |

**Les 5 registres mémoire** (Type 3) : `EDR.md` (décisions), `LEARNINGS.md` (apprentissages), `BLOCKERS.md` (blocages + résolution), `ITERATION_LOG.md` (journal de session), `CONTEXT.md` (état/priorités). **`MEMORY.md` = index** : chargé à chaque session, contient liens + résumés d'une ligne (**pas** le contenu) → charge le minimum, détail à la demande.

**Application MAS** :
- Valide notre triple structure : Constitution = CLAUDE.md (+ AGENTS.md, PRODUCT_SPEC.md…) ; Agents = `packages/agents/fiches/` ; Mémoire = `data/memory/<projectId>/` (Phase 4).
- **Les 5 registres = corpus de seed pour la mémoire Phase 4** (cf. `knowledge-bootstrap.md §5.bis`, le pont de persistance). À aligner avec les 5 registres de `project-doctrine.md` et la mémoire 4-niveaux (agent-patterns.md / agentmemory).
- **`MEMORY.md` = index (liens + 1 ligne), pas le contenu** : exactement le pattern du sommaire RES-056 (vibeflow/memoire.md) ET de notre propre auto-mémoire (`MEMORY.md` + cartes). Convergence forte → conforter en Phase 4.
- Différence agent vs skill (« exécutant » vs « livre de connaissance ») : redondant avec RES-035 (déjà intégré), non re-distillé.

---

## Synthèse — Mapping Gouvernance

| Pattern | Composant MAS | Phase |
|---------|---------------|-------|
| Base saine 3 principes (057) | structure packages + filet test | validé |
| OWASP 3 risques (042) | Sec Reviewer audit + ASI04 install policy | 3.5, 6 |
| EVAL-XXX 8 champs + 3 dérives (040) | Quality Controller output format + multi-model cross-check | 3.5 |
| DURCIR 3 niveaux (036) | pipeline LRN→rules→CLAUDE.md + drift-log + circuit breaker | 4, 6 |
| 4 piliers + verdict PROD/STAGING/BLOQUÉ/ARRÊTER (024) | QC audit fiches + kill switch worker + contract.yaml ↔ permissions.json | 3.5, 6 |
| Framework 4 piliers détaillé + contract.yaml long-form (Structurer AVANT) | contract ↔ permissions.json + fiche + budget ; cible cloud rejetée §11 | 3.5, 6 |
| 3 dettes invisibles + score /30 (008) | ADR/EDR + filet test + docs/knowledge ; self-audit MAS | 3.5 |
| 5 DON'T/DO (012) | constitution<200l (self-audit) + CLI>MCP + hooks avant auto | 3.5, 6 |
| 3 types fichiers + 5 registres (013) | triple structure + seed mémoire Phase 4 | 4 |

**Distillation Batch 1 (2026-06-04)** : RES-024, 008, 012, 013 ✅ intégrés ici depuis `docs/ressources/`. RES-022 (lean CLAUDE.md) : **PDF absent** → `docs/backlog/self-audit-lean-claude-md.md`. RES-006/004/003 : superseded (cf. INDEX.md). RES-023/015/016 → `agents-skills.md`.

**Ré-audit cycle `2026-06-04-vibeflow-reaudit`** : (1) « 40 % Gartner » **re-sourcé** — il vient du PDF « Structurer AVANT », pas de RES-024 ; corrigé dans l'ouverture RES-024. (2) Framework 4 piliers **détaillé** + checklist pre-deploy 10-Q + **contract.yaml long-form** distillés (lus mais non distillés au Batch 1). Mapping RES-023 entre « Gouverner Templates+Prompts » et « Structurer AVANT » signalé non tranché.
