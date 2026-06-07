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

## RES-059 — Gouverner tes agents : 3 principes + 5 patterns de contrats + fiche template *(PDF « Gouverner Templates+Prompts », ex-candidat RES-023)*

**Principe** : un agent est un multiplicateur — de structure ou de chaos. Ajouter des agents sans gouvernance = ajouter des moteurs sans châssis. 3 principes fondateurs + des contrats explicites entre agents.

> **Source / mapping (résolu 2026-06-05)** : cette section distille le PDF **« Gouverner tes Agents IA Templates + Prompts »** (4 prompts + 5 patterns de contrats). **RES-023 a été tranché par l'utilisateur = « Structurer la gouvernance AVANT de déployer » (`023-…pdf`)**, distillé dans `vibeflow/gouvernance.md` (framework 4-piliers + contract.yaml long-form). Le présent PDF « Gouverner Templates+Prompts » **n'est donc PAS RES-023** : il a été **renuméroté RES-059** (n° local attribué 2026-06-05, source Notion en 404 — à confirmer au ré-export). Sa distillation ci-dessous reste valable. Voir `docs/learning/2026-06-04-vibeflow-index-reconciliation/build-report.md`.

**3 principes de gouvernance** :
1. **Un agent = un mandat** — chaque agent fait UNE chose (le rédacteur rédige, le relecteur relit).
2. **Territoire défini** — chaque agent sait où il peut agir et où non (l'analyste observe, ne modifie rien).
3. **Contrats d'interaction explicites** — qui valide quoi, qui passe le relais à qui (jamais implicite).

**Les 5 patterns de contrats inter-agents** (le net-new vs RES-035/048) :

| Pattern | Quand | Exemple |
|---------|-------|---------|
| Chaîne séquentielle | le travail passe d'un agent à l'autre | Rédaction → Relecture → Publication |
| Autorité de domaine | un agent a le dernier mot sur un sujet | Qualité valide avant mise en prod |
| Séparation des pouvoirs | empêcher qu'un agent fasse tout | celui qui écrit ne publie pas |
| Escalation | un agent ne sait pas quoi faire | si doute, remonter au coordinateur |
| Parallélisme | agents en même temps sur tâches indépendantes | recherche + rédaction en parallèle |

**Prompt d'audit (6 checks)** : Mandat clair / Territoire défini / Contraintes explicites / Chevauchements / Zones grises / Escalation → rapport avec score gouvernance /10 + problèmes par gravité + 3 actions prioritaires.

**Template fiche agent** : `name / description / tools / model (haiku|sonnet|opus) / memory: project / skills[]` + corps Markdown (mission / territoire / contraintes / escalade / format de sortie).

**Application MAS** :
- **Les 5 patterns de contrats = le cœur de la communication Tier A↔B (Phase 5).** Le dispatcher implémente déjà : chaîne séquentielle (DAG), autorité de domaine (un décideur par territoire, RES-035), séparation des pouvoirs (exécutant ≠ Reviewer ≠ Sec Reviewer), escalation (`escalate_when`), parallélisme (tâches DAG indépendantes). **À formaliser explicitement en `contracts` dans AGENTS.md.**
- Le prompt d'audit 6-checks + score /10 = capacité Quality Controller (complète RES-043 4 champs + RES-024 4 piliers).
- **« Zones grises = responsabilité que personne ne couvre »** : garde-fou Mission Planner — toute tâche du DAG doit avoir un agent assigné, sinon escalade.
- Template fiche aligné Claude Code sub-agent format ; nos fiches ajoutent `budget`, `escalate_when`, `output_format`, `tools≤7`.

---

## RES-015 — Guide vrais agents : test 3-Q automatisation vs agent + 10-Q gouverné + 6 erreurs

**Principe** : 90 % des « agents IA » sont des automatisations déguisées. Une automatisation suit un chemin fixe (pas besoin de gouvernance) ; un agent **décide** (s'effondre sans gouvernance). Le test précède toute structuration. (Complète RES-035 : même logique, framing « chemin fixe vs décide ».)

**Test en 3 questions** :

| # | Question | Automatisation | Agent |
|---|----------|----------------|-------|
| 1 | chemin fixe ou décide ? | A→B→C, aucune variation | perçoit le contexte, choisit le chemin |
| 2 | mandat clair ? | pas besoin, le chemin EST la gouvernance | DOIT avoir mandat + territoire + limites |
| 3 | peut escalader ? | non, échoue/plante hors chemin | oui, remonte à un orchestrateur |

→ 3× automatisation = automatisation (très bien, ne pas sur-gouverner). **Mix = hybride** (la partie qui décide a besoin de gouvernance, la partie fixe non). 3× agent = vrai agent.

**Checklist « Mon agent est-il gouverné ? » (10-Q)** : mission 1 phrase non-ambiguë / territoire délimité / outils au strict nécessaire / contraintes absolues listées / règles d'escalade / format de sortie standardisé / contrats si 2+ agents / territoires disjoints / mémoire persistante / **testé sur un cas limite**. Score : 10 gouverné, 7-9 trous, 4-6 fondations sans cadre, 0-3 automatisation déguisée.

**Les 6 erreurs classiques** (titre du PDF ; tableau **tronqué au rendu PDF**) — **confirmées verbatim** : (1) agent couteau suisse = fait tout → travail moyen partout ; (2) pas d'escalade = tourne en rond. Les 4 autres non lisibles au rendu ; **à confirmer** (recoupent les thèmes du doc : chevauchements de territoire, absence de contraintes, pas de format de sortie standardisé, jamais testé sur cas limite).

**Format de sortie exemplaire** (fiche « analyst ») : `Fait (observation factuelle) / Evidence (données précises) / Impact (conséquence concrète) / Recommandation (action suggérée)` — sortie structurée, pas de texte libre.

**Application MAS** :
- **Le test 3-Q + « Mix/hybride » affine notre test binaire RES-035** : une tâche du DAG peut être partiellement déterministe (scoring sans LLM) + partiellement décisionnelle. Le risk classifier peut router la partie fixe en logique pure, la partie décisionnelle en agent.
- **« Testé sur un cas limite » (Q10)** = critère absent de nos fiches actuelles → ajouter aux Verification Criteria des SKILL.md / fiches.
- **Format Fait/Evidence/Impact/Recommandation** = excellent `output_format` par défaut pour les agents d'analyse (Reviewer, Quality Controller). À adopter.
- « Agent couteau suisse » → confirme `tools≤7` + « un mandat = une chose » (RES-048).

---

## RES-016 — Managed Agents vs Local : matrice de décision (⚠️ valide le local-first MAS)

**Principe** : Anthropic Managed Agents (beta publique 8 avril 2026) = agents qui tournent dans le cloud Anthropic, facturés **$0.08/heure de session + tokens standard** (donc PAYG). 5 questions de gouvernance décident local vs cloud. **Dès qu'une réponse pointe « Local obligatoire », la question est réglée.**

| Question | Local obligatoire si | Managed OK si |
|----------|----------------------|---------------|
| 1. Autonomie | (supervise en direct) | tourne sans toi, la nuit, async |
| 2. **Accès local** | besoin filesystem / réseau privé | données cloud / API externes |
| 3. Maturité | (déjà gouverné = pas urgent) | part de zéro = accélération |
| 4. Coût | >1000 sessions/jour = calcule | <50 sessions/jour = négligeable |
| 5. **Compliance** | données sensibles / réglementées | données non sensibles |

**Architecture Managed (Brain / Hands / Session)** : Brain (Claude + harness : prompt caching, compaction) ; Hands (sandboxes + outils, interface `execute(name, input)`) ; Session (event log durable append-only, reprise via `wake(sessionId)`). **Ce qui N'EXISTE PAS en Managed** : CLAUDE.md auto-chargé, hooks déterministes, `.claude/rules/`, mémoire fichier versionnée Git.

**⚠️ Conclusion pour MAS — contradiction billing résolue par éviction** :
- **Managed Agents = mode PAYG facturé à l'heure + tokens → INTERDIT par CLAUDE.md §11** (subscription only). MAS n'utilise PAS Managed Agents. Cette ressource ne s'intègre pas comme « feature à adopter ».
- **MAIS la matrice VALIDE le choix local-first** : MAS lit des projets externes par chemin absolu (Q2 « accès filesystem » → **toujours Local obligatoire**) ; single-user local-first (Q5 données locales → Local). Les 5 questions pointent toutes vers « Local » pour notre cas d'usage. RES-016 est donc une **preuve externe de la doctrine**, pas une feature.
- Le pattern **Session event log durable + `wake(sessionId)`** reste intéressant pour la reprise de mission MAS (cf. Inspiration Voie 2, session resume) — à miner sans adopter Managed.
- « Ce qui n'existe pas en Managed (CLAUDE.md auto, hooks, mémoire Git) » = exactement ce que MAS garde en local → notre valeur est dans la couche gouvernance locale, pas dans l'exécution cloud.

---

## Synthèse — Comment ces patterns informent MAS

| Pattern | Fichier MAS | Phase |
|---------|-------------|-------|
| 3 formes critère succès (RES-046) | schéma PlannerOutput + escalate_when fiches | 3.5 |
| Matrice agent/skill (RES-048) | valide fiche+SKILL.md split ; test ≤200 lignes | 3 (audit), 5 (Tier B) |
| Template auditeur 4 champs (RES-043) | quality-controller.md fiche | 3.5 |
| 3 modes STRICT/AUDIT/SHADOW (RES-037) | risk enum → mode QC ; risk classifier | 3.5, 6 |
| Test binaire skill/agent (RES-035) | mas-skill-router Verification Criteria | 3 (fait) |
| 3 principes + 5 patterns contrats (RES-059, ex-candidat RES-023) | `contracts` AGENTS.md (Tier A↔B) ; QC audit /10 | 5, 3.5 |
| Test 3-Q + Mix/hybride + 10-Q gouverné (RES-015) | affine risk classifier ; output Fait/Evidence/Impact/Reco ; « cas limite » → Verification Criteria | 3.5 |
| Managed vs Local (RES-016) | ⚠️ Managed = PAYG interdit §11 ; matrice valide local-first ; pattern session-resume à miner | doctrine |

**Distillation Batch 1 (2026-06-04)** : RES-015, 016 + **RES-059** (« Gouverner Templates+Prompts », ex-candidat RES-023) ✅ intégrés ici depuis `docs/ressources/`. **RES-023 tranché (2026-06-05) = « Structurer la gouvernance AVANT de déployer »** → `vibeflow/gouvernance.md` (4 piliers + verdict). RES-009a/009b : superseded (cf. INDEX.md).
