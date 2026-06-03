# VibeFlow — Agents & Skills (patterns extraits)

Patterns issus des ressources Notion @le_gouverneur_ia, catégorie Agents/Skills. Chaque section = pattern extractible + application MAS. Source intégrale fetchée 2026-06-03.

---

## RES-046 — Critère de succès agent : les 3 formes

**Principe** : un critère de succès implicite est invérifiable. Un agent qui s'arrête sur un critère implicite ne réussit jamais, il s'arrête juste. Le critère doit prendre **3 formes combinées** (pas 3 étapes séquentielles).

| Forme | Question | Format |
|-------|----------|--------|
| **Binaire** | La tâche passe oui/non ? | "Passe si : [condition objective 1] ET [condition 2]" — zéro zone grise |
| **Mesurable** | Sur quelles preuves ? | 3 vérifications cochables (pas 2, pas 5) avec résultat OUI/NON + preuve (fichier, chiffre, fait) |
| **Arrêt** | Quand stoppe-t-il même s'il pourrait continuer ? | "Je stoppe dès que : [X fichiers modifiés] OU [dépendance ajoutée] OU [perte de confiance]" |

**Validation externe** : Anthropic Outcomes (public beta mai 2026) formalise ce framework au niveau API avec les "halt conditions".

**Application MAS** :
- Le **critère d'arrêt** = exactement nos `escalate_when` dans les fiches Tier A. Aligner.
- Le **critère binaire/mesurable** = nos `quality_criteria` (fiches) + `## Verification Criteria` (SKILL.md).
- Mission Planner devrait émettre les 3 formes pour chaque tâche du DAG : `passCondition`, `checks[3]`, `haltConditions[]`. À ajouter au schéma `PlannerOutput` en Phase 3.5/4.
- Le critère d'arrêt est critique pour le mode **autopilot** (Phase 6) : sans lui, un agent puissant élargit le scope en silence.

---

## RES-048 — Architecture d'un agent qui tient : template universel + matrice agent/skill

**Principe** : un agent qui tient = **5 éléments maximum** dans le fichier agent. Tout le reste vit dans des skills chargés à la demande. Si le fichier agent dépasse 200-300 lignes, une section devrait être un skill.

**Les 5 éléments d'un agent (et seulement ces 5)** :
1. **Role** : qui, pour qui, périmètre, non-périmètre (3-5 phrases)
2. **Workflow** : 4-7 étapes haut niveau (si une étape > 3 lignes → skill)
3. **Règles** : 3-8 puces "JAMAIS X / TOUJOURS Y" (non-négociables)
4. **Format de sortie** : schéma exact réutilisable du livrable
5. **Interdictions** : 3-5 puces au négatif (garde-fou) + Escalation

**Matrice de décision Agent vs Skill** (le cœur) :

| Contenu | Agent | Skill | Pourquoi |
|---------|-------|-------|----------|
| Role / identité | ✅ | — | ADN, présent à chaque invocation |
| Workflow général (4-7 étapes) | ✅ | — | Doit savoir quoi faire en premier |
| Procédure complexe (10+ étapes) | — | ✅ | Charge à la demande |
| Framework méthodo (OWASP, RICE...) | — | ✅ | 1 framework = 1 skill |
| Taxonomie / glossaire (50+ termes) | — | ✅ | Savoir consulté ponctuellement |
| Exemples (3+) | — | ✅ | Référence, pas instruction permanente |
| Format de sortie fixe | ✅ | — | S'applique toujours au livrable |
| Interdictions structurelles | ✅ | — | Garde-fou permanent |
| Mapping vers autres agents (escalade) | ✅ | — | Coordination structurelle |
| Doc technique outil tiers | — | ✅ | Change indépendamment |
| Checklist QA / critères d'acceptation | — | ✅ | Procédure applicable ponctuellement |

**Application MAS** :
- **Valide notre architecture Tier A fiche + SKILL.md séparés.** La fiche = les 5 éléments (role/workflow/règles/format/interdits + escalade). Le SKILL.md = la procédure détaillée, les exemples, les Verification Criteria. C'est exactement la matrice.
- **Test de cohérence à appliquer aux 6 fiches** : aucune fiche > 200 lignes, aucune procédure > 10 étapes dans la fiche, aucun framework décrit dans la fiche (seulement référencé via `required_skills`).
- Pour Phase 5 (Tier B expansion via agency-agents) : appliquer cette matrice pour décider quoi garder dans la fiche agency vs externaliser en skill MAS.

---

## RES-043 — Agent-auditeur : la 4e couche de gouvernance (template 4 champs)

**Principe** : au-delà des 3 couches classiques (règles CLAUDE.md, mémoire registres, hooks), une **4e couche** : un agent dont l'unique rôle est de juger le travail d'un autre agent. Pattern agent-as-judge. Recherche : You et al. (ICML 2025) — 90% d'accord avec experts humains vs 70% pour LLM-as-Judge classique, -97% coût d'évaluation.

**Règle fondatrice** : un agent qui produit ne valide jamais sa propre sortie. Un autre acteur juge contre des critères explicites et retourne un verdict structuré.

**Template 4 champs** (`.claude/agents/auditor.md`) :
1. **ROLE** : "Tu es un auditeur dédié. Tu ne produis rien. Tu juges contre une grille. Tu ne réécris pas." + autorité (verdict final) + humilité (escalade si ambigu)
2. **INPUT** : le livrable + le contexte + les références. Si un des 3 manque → demande, n'invente pas.
3. **VERDICT** : format strict — ID AUD-XXX, table critères /10, score global /100, signaux détectés (gravité), verdict `VALIDÉ ≥70 | AJUSTÉ 40-69 | REJETÉ <40`, justification 2-3 phrases
4. **ESCALATION** : hors domaine / critères ambigus / risque non couvert / 2 rejets sans compréhension (= problème dans les critères)

**Application MAS** :
- **C'est exactement le Quality Controller** (Phase 3.5, AGENTS.md §4). Le template 4 champs = le squelette de `packages/agents/fiches/quality-controller.md`.
- Notre Reviewer + Sec Reviewer SONT déjà des agent-auditeurs (couche 4). QC ajoute l'audit du PROCESSUS (vs Reviewer = code, Sec Reviewer = sécurité).
- Le format verdict AUD-XXX → aligner avec EVAL-XXX (le format MAS du Quality Controller, RES-040).
- Règle "auditeur ≠ exécutant" → notre dispatcher garantit ça (QC est une instance séparée appelée après exécution).

---

## RES-037 — 3 modes d'audit en prod : STRICT, AUDIT, SHADOW

**Principe** : auditer ≠ relire les traces. 3 modes coexistent, chacun répond à une question :

| Mode | Question | Comportement | Quand |
|------|----------|-------------|-------|
| **STRICT** | Cette action est-elle autorisée ? | Bloque AVANT exécution | Sécurité, finance, écritures prod, envois externes |
| **AUDIT** | Faut-il pouvoir y revenir dans 3 mois ? | Trace dans registre, non-bloquant | Refactorings, intégrations, changements structurels, décisions |
| **SHADOW** | Quels patterns émergent ? | Observe en parallèle, dataset, recommande après 1-2 sem | Nouveaux flux/agents, migrations, phases pilotes |

**Règles de mix** :
1. STRICT a priorité absolue (si STRICT bloque, AUDIT n'a rien à tracer)
2. SHADOW → AUDIT → STRICT : promotion progressive quand le pattern est clair
3. SHADOW jamais > 4-6 semaines (sinon tu observes mal ou tu ne décides pas)
4. Max 3 STRICT par agent (sinon l'agent fait trop → découpe)
5. Revue trimestrielle humain seul SANS IA (évite que l'IA valide ses propres patterns)

**Application MAS** :
- **Mappe directement sur le `risk` enum** : `risk: high|blocking` → STRICT (pause humaine, CLAUDE.md §5) ; `risk: medium` → AUDIT (table `events`, trace) ; `risk: low` → SHADOW (observe, autopilot).
- Le Quality Controller (Phase 3.5) implémente ces 3 modes selon le risk de la mission.
- "Max 3 STRICT par agent" → garde-fou pour le risk classifier : si trop de tâches `blocking` sur un agent, re-décomposer.
- "Revue trimestrielle SANS IA" → pattern pour un rituel humain de Melvyn (pas un agent). Phase 6+.

**Erreurs classiques à éviter** (intégrer dans QC) :
- Tout en STRICT → agent inutilisable
- AUDIT sans relecture → registre cimetière
- SHADOW indéfini → jamais de décision
- Auditeur = exécutant → cross-check biaisé
- Confondre LOG technique et AUDIT sémantique (AUDIT = légitimité + justification, pas juste payload)

---

## RES-035 — Skill ou Agent : test binaire + Orchestrator-Workers

(Détail complet dans `docs/knowledge/agent-patterns.md` §Pattern Test Binaire.)

**Résumé** : "Est-ce que ça doit ARBITRER ?" → OUI = agent (mandat + décisions + escalade), NON = skill. Pattern Anthropic Orchestrator-Workers : 1 orchestrateur (délègue, ne produit pas) + N sous-agents (1 par territoire) + M skills partagés. Checklist 16 points d'audit. **Un seul décideur par territoire.**

---

## Synthèse — Comment ces patterns informent MAS

| Pattern | Fichier MAS | Phase |
|---------|-------------|-------|
| 3 formes critère succès (RES-046) | schéma PlannerOutput + escalate_when fiches | 3.5 |
| Matrice agent/skill (RES-048) | valide fiche+SKILL.md split ; test ≤200 lignes | 3 (audit), 5 (Tier B) |
| Template auditeur 4 champs (RES-043) | quality-controller.md fiche | 3.5 |
| 3 modes STRICT/AUDIT/SHADOW (RES-037) | risk enum → mode QC ; risk classifier | 3.5, 6 |
| Test binaire skill/agent (RES-035) | mas-skill-router Verification Criteria | 3 (fait) |

**Ressources 404 à récupérer pour compléter cette catégorie** : RES-015 (guide agents), RES-016 (managed agents : sub-agents vs teams), RES-024 (audit 10 min : stop/validation/logs/kill switch/budget). Voir INDEX.md.
