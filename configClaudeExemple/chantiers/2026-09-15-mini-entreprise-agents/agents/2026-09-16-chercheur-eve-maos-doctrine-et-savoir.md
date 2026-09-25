# Rapport brut : ce que MAOS sait, et qu'EVE ne sait pas encore

Agent : `chercheur-eve`. Lancé le 16/09/2026 au soir, axe C de l'audit du lot 2. Déposé tel quel. Lecture seule. **Note du fil** : mémo complet livré, puis l'agent a été coupé par une limite de session de l'abonnement (HTTP 429) sur son dernier tour.

---

**Question.** Quels principes, quel savoir distillé et quelles décisions de MAOS manquent au dispositif EVE, lesquels y sont déjà sous un autre nom, lesquels ne s'y appliquent pas.

**Réponse en trois lignes.**
1. EVE possède déjà, souvent mieux verrouillés mécaniquement, les principes de sûreté de MAOS ; il lui manque quatre choses nommées : la discipline tokens, la grille d'intake en cinq valeurs avec critères KILL et tiers, la posture « vérificateur indépendant qui répond NEEDS_WORK par défaut », et la référence explicite au savoir distillé de MAOS.
2. Le savoir réutilisable de MAOS tient en 22 fichiers de `docs/knowledge/`, 4 runbooks de `docs/workflows/`, le protocole doer/checker de `docs/learning/`, 13 dossiers d'intake et une récolte de **1 296 items externes déjà tranchés** (ECC, cybersec, awesomeclaude) : EVE n'a aucun de ces audits à refaire.
3. Tout le reste de MAOS est une application (monorepo TypeScript, cockpit, Knowledge OS) dont le runtime n'est même pas présent sur ce poste (`data/` absent) : la méthode se transpose, le code non.

**Ce que Melvyn a déjà pris de MAOS**, contrairement à « je ne la vois pas » : le skill `explain-diff`, le format des fiches d'agents (REGISTRE : « d'après les fiches maos »), les seuils ECC du gate, le §14 style et dashboard recopié dans `communication.md`, la charte visuelle.

## 1. La doctrine MAOS en 14 sections, face à la doctrine EVE

| § MAOS | Ce que MAOS impose | Ce qu'EVE a | Écart | Décision |
| --- | --- | --- | --- | --- |
| 1 | Mission control local | `CLAUDE.md` « EVE en dix lignes » | aucun | n/a |
| 2 Stack verrouillée, pas de framework sans ADR | ADR obligatoire | `qualite.md` : dépendance demandée, épinglée, au REGISTRE | aucun | déjà là |
| 3 Layout tenu | arborescence documentée | `.claude/README.md`, `INDEX.md` | pas de règle « toute pièce nouvelle s'inscrit dans README.md » | adapt_now T2 |
| 4 Niveaux d'autonomie runtime | curseur affiché | niveaux de rigueur léger/standard/structurant : un axe de profondeur de processus, pas d'autonomie | un humain, un projet, un mode : le réglage n'a pas d'objet | reject T0 ; « autopilot = lot long puis rapport » est déjà le mode jalon |
| 5 Actions risquées toujours gardées | enum risk, high et blocking pausent | `garde_git`, `garde_perimetre`, `garde_donnees`, `securite.md` structurant d'office | **Fait important** : MAOS n'applique §5 que dans son runtime ; ses trois hooks sont taille, tokens, frontmatter. EVE est plus fort sur git et données. **Trous EVE** : aucune garde d'écriture sur `.env`, `.env.dev1`, `token_api.txt` ; rien sur `curl | sh` ni `eval` | adapt_now T1 : refus d'écriture sur `.env*` et `token_api.txt` |
| 6 Discipline tokens | 3 modes, hiérarchie de budgets, pause à 80 %, plafond 32 k | rien de nommé ; morceaux sans nom (rapports bornés, « ouvre au plus 10 fichiers », graphify avant lecture) | écart réel ; aucun compteur côté Claude Code | adapt_now T1 : une règle courte sans compteur. Fait : ADR 0009 note qu'un agent consomme ~4x et une mission multi-agents ~15x le quota d'un chat |
| 7 Conventions et seuils machine-enforced | fn<50 file<800 bloquant, couverture bloquante | mêmes seuils en avertissement ; `/gate` ; `verif_style` | MAOS refuse, EVE avertit ; le dépôt a un fichier de 6 092 lignes et Edmond décide | watch |
| 8 Mémoire : Keeper seul écrivain | 5 registres runtime | bucket écrit par le fil ; « un fichier, un écrivain » ; `_decisions/` joue BDR | le principe est là sans être nommé ; pas de candidat ni promotion | adapt_now T1 pour la phrase ; reject des 5 registres runtime |
| 9 En cas de doute, relire, demander, ne jamais inventer | | « Où lire », « pas de promesse d'infaillibilité » | aucun | déjà là |
| 9.bis Voie 2 : porter le motif pas le code, citer la source | règle permanente | « rechercher et réutiliser avant de créer » ; REGISTRE | « porter le motif, citer la source en tête » non écrite | adapt_now T2 |
| 10 Phase par phase, feu vert explicite | | « aucune étape sautée », point d'étape | aucun | déjà là |
| 11 Isolement de facturation : abonnement seul, PAYG interdit | cinq règles dures | brief §4 ; `securite.md` MCP | pas de règle « clé API ou facturation = rejet automatique » dans `securite.md` ni KILL au REGISTRE | adapt_now T1 |
| 12 Savoir obligatoire avant tout SKILL.md ou fiche ; <=7 outils | | `writing-for-agents` obligatoire ; fiches au format ; 4 à 6 outils | EVE n'a pas de `docs/knowledge/` et ne référence pas celui de MAOS : **c'est le constat exact de Melvyn** | adapt_now T1 : lecture obligatoire en lecture seule des fichiers T1 de MAOS avant toute fiche ou skill EVE |
| 13 Bootstrap : pré-vol intake par phase, self-audit | | REGISTRE en 5 pas | REGISTRE = intake-audit allégé : 3 valeurs au lieu de 5, pas de KILL, pas de tiers, pas de sanitize, pas de PDB | adapt_now T1 : porter REGISTRE au format intake-audit |
| 14 Style et rapports, dashboard | | `communication.md` reprend les 7 points ; charte | aucun : la mieux transposée | déjà là |

## 2. `AGENTS.md` et le contrat d'exécution

Deux tiers (Tier A : 10 fiches livrées avec modèle et budget ; Tier B : 60 fiches brutes plus 32 froides indexées). Schéma canonique de fiche Tier A : `role`, `domains`, `responsibilities`, `limits`, `favorite_skills`, `required_skills`, `permissions`, `budget {default_tokens, model}`, `quality_criteria`, `output_format`, `common_mistakes`, `escalate_when`. Surface <= 7 outils. Contrat runtime `TaskResult` à quatre formes (`done`, `blocked`, `needsValidation`, `delegate`). Motifs interdits : Tier A appelant Tier A sans dispatcher ; écriture mémoire hors Keeper.

**Ce qu'il vaut de prendre** : `escalate_when` comme section de prose dans chaque fiche EVE (adapt_now T1) ; l'interdiction écrite « un agent ne lance pas un autre agent ; le fil orchestre » (adapt_now T1) ; le champ `model` par fiche (watch, lot routeur) ; la bibliothèque froide comme réservoir à interroger, jamais à recopier en bloc (ADR 0005 : vendre des centaines de skills injecte leur frontmatter à chaque session) (backlog_next T2). Sans objet : `git apply --check`, caveman, `MissionContext`.

## 3. Les décisions de MAOS

| Fiche | Une ligne | Éclaire EVE ? |
| --- | --- | --- |
| 0001 | Piloter par l'Agent SDK sous abonnement, jamais l'API brute ; Voie 2 permanente | oui : « abonnement seul » et « porter le motif, citer la source » |
| 0002 | Routeur multi-comptes et multi-fournisseurs | non |
| 0003 | Mémoire = Markdown source de vérité + index dérivé ; Keeper seul écrivain | principe déjà tenu ; QMD reject |
| 0004 | Intake = candidats, promotion par le Keeper ; audit sécurité avant toute lecture de dépôt externe | oui : le REGISTRE est la porte |
| 0005 | Bibliothèque arsenal hors `.claude/skills/` pour éviter le bloat tokens | oui : « peu et choisis » |
| 0006 (proposée) | Scoring de risque à 4 axes au dessus de l'enum §5 | oui comme vocabulaire pour `securite.md` |
| 0007 | « QMD cherche, le Router décide, le Markdown stocke » ; agents froids suggérés, jamais lancés seuls | oui : « suggérer, jamais lancer un agent non audité » |
| 0008 | Living Knowledge OS : archive jamais supprimer | oui pour « archive, jamais supprimer » |
| 0009 | Isolement de facturation ; agents ~4x, missions multi-agents ~15x | oui : le chiffre pour le budget de recherche |

Le **format** ADR avec amendements datés est déjà celui d'EVE.

## 4. Inventaire de `docs/`

Comptes : audits 14, backlog 46, claude-doc 7, decisions 15, intake 178, knowledge 401, learning 128, resources 2, rules 109, superpowers 21, workflows 7.

### 4.1 `docs/knowledge/` : 379 fiches `resource-*` sans valeur pour EVE (T0), et 22 fichiers de savoir

**T1 à lire avant toute fiche ou skill EVE** : `README.md` (règle « une décision tenue par une seule source est à vérifier, par deux familles est solide ») ; `agent-patterns.md` (Quality Controller distinct du Reviewer, orchestrator-workers, test binaire skill ou agent, <=7 outils) ; `production-patterns.md` (12-factor agents, OWASP agents, HITL, échecs multi-agents, **boucle de correction bornée**) ; `prompting-anthropic.md` (XML tags, chain of thought, prompt de revue) ; `skills-reference.md` (découverte oui, auto-install jamais, L1/L2/L3) ; `claude-code-context-and-modes.md` (3 couches de contexte, `.claude/rules/` ciblées par chemins, 6 modes de permission) ; `vibeflow/agents-skills.md` (critère de succès en 3 formes : binaire, mesurable, arrêt ; agent-as-judge) ; `vibeflow/gouvernance.md` (base saine, OWASP ASI, lean CLAUDE.md < 200 lignes) ; `continuous-learning-and-memory-lifecycle.md` (contrat hooks : SessionStart borné, PreCompact, Stop = porte qualité).

**T2** : `memory-patterns.md`, `project-doctrine.md`, `vibeflow/memoire.md`, `vibeflow/workflows.md`, `risk-scoring-and-session-orchestration.md`, `mcp-connector-policy-and-catalog.md`, `anthropic-ecosystem.md` (27 événements de hooks, facturation), `frameworks-comparison.md`, `vibeflow/INDEX.md`, `vibeflow/hooks.md`, `references.md`. **T0** : `consolidation-log.md`, `sonar-recurring-rules.md`.

### 4.2 `docs/intake/` : 13 dossiers, déjà tranchés

| Ressource | Décision MAOS | Utile à EVE ? |
| --- | --- | --- |
| Graphify (06/08) | backlog_next, veto sécurité | déjà tranché côté EVE |
| QMD (06/08, ré-audit 06/22) | implement_now | reject pour EVE (2 à 4,4 Go, MCP, Node 22) |
| agentmemory (06/12) | backlog_next | reject |
| skills.sh et find-skills (06/13) | adapt_now comme source de découverte ; `npx skills add` jamais auto | oui : source pour la phase 2 |
| Patterns ECC vers intake-audit (06/16) | adapt_now : sanitize, PDB, maintainer-safe, barre large | **oui : c'est la grille à porter dans REGISTRE** |
| **ECC harvest** (06/16, ledger 1 296 items, 143 shards) | 1 050 intégrés, 244 rejetés ; produit 878 skills froids, 32 agents, 109 rules | **oui, à ne pas refaire**. Shards à lire pour EVE : `skill-eng-lang-H.md` (python-patterns, python-testing, django-patterns, django-tdd, django-verification : 7 adapt T2) ; `skill-core-security-SA.md` (`django-security`) ; `agent-reviewer.md` (`django-reviewer`, `python-reviewer`, `database-reviewer` avec sûreté des migrations) ; `skill-core-agent-A.md` (agent-eval, agent-self-evaluation) ; `skill-core-eval-J.md` (ai-regression-testing : « self-review blind spot ») |
| ECC résiduel (06/21) | distillé en 3 fichiers knowledge | oui via les 3 fichiers |
| awesomeclaude.ai (06/21, 50 items) | 6 fold, 2 adapt, 21 register, 14 reject ; aucune compétence nouvelle | oui : évite de re-parcourir |
| Pipeline doer/checker réel 0b (06/24) | adapt_now : évaluateur-optimiseur borné (2 itérations) | oui : boucle bornée pour `/revue` |
| Karpathy LLM wiki (06/27) | adapt_now principe | faible |
| gsap-skills, RooFlow (07/10) | adapt / reject | non ; RooFlow est un reject bien justifié |
| explain-diff Litt (07/31) | adapt_now HTML ; reject Notion | déjà pris |
| God-file guardrails (07/31) | adapt_now hook | référence si Edmond durcit |
| 13 cartes A2 OtakuGO (08/14) | C1 statut vérité, C12 alertes, C3 rapport de mission : implement_now | partiel : patrons de « retour riche vers Melvyn » |

### 4.3 Les autres dossiers

`workflows/` : **`commander-feedback-loop.md`** (revue du commandant après PASS du checker, 5 destinations : fold-in-PR, phase corrective, backlog, mémoire, CLAUDE.md ; « une idée n'est jamais jetée ») et `knowledge-bootstrap.md` : T1. `learning/` : `README.md` protocole doer, checker, orchestrateur (sessions séparées, le fichier avant le terminal, le checker ne fait confiance à rien et ne modifie rien, le doer ne committe pas) ; `AUTONOMOUS-PIPELINE.md` (« ne pas croire le sous-agent sur parole, relancer les checks soi-même », « lire le fichier du verdict, pas le retour du chat ») : T1. `rules/python/` : T2 référence. `audits/` : patron « audit d'existant en étapes, chacune vérifiée » pour la mission 1 : T2. `backlog/` : `verification-independante-ternaire.md`, `frameworks-to-mine.md`, `self-audit-lean-claude-md.md` : T2. `STRUCTURE.md` : 4 squelettes Diátaxis réutilisables pour `documentation/` : T2.

## 5. La roadmap et le recouvrement avec la vision

Phases 0 à 7 fusionnées dans `main` avant le 14/06. Phase 9 validée le 22/06 : mémoire vivante, vrai pipeline doer/checker (boucle bornée à 2), roster Tier A, arsenal. Living Knowledge OS briques 1, 4, 6 ; brique 5 non faite. Couche live non faite. Sur ce poste : `data/` absent, le runtime n'a jamais tourné ici.

| Mot de Melvyn | MAOS l'a | EVE l'a |
| --- | --- | --- |
| orchestrateur | fiche `orchestrator` + `dispatch.ts` | le fil principal (`0009`) |
| plan avec audit | `mission-planner` (DAG, dernière tâche = revue, <= 3 questions) ; pré-vol intake §13 | `/chantier` |
| code / exécutif | Tier B, diff validé, worktree | `developpeur-eve` |
| review | `reviewer` (couverture avant précision, PASS/NEEDS_WORK/BLOCK), `quality-controller`, `agent-evaluator`, `reality-checker`, boucle bornée | `/revue` : 4 axes, vérification contradictoire, contre-relecture ; pas de « NEEDS_WORK par défaut » ni de boucle bornée nommée |
| pentest | `sec-reviewer` (gate §5), 754 skills cybersec auditées, jamais exécutées | `/security-review` |
| se contredisent, s'améliorent | doer, checker, orchestrateur en sessions séparées ; revue du commandant ; `agent-evaluator` | attaque de spec et de plan, contre-relecture ; pas de rétro par chantier |
| fil non inondé | « le fichier est la source de vérité, le terminal un aperçu » | bloc jalon, rapports dans `agents/` |
| mémoire qui fait quoi | table `events`, 5 registres, Keeper | journal, `agents/`, bucket ; lot mémoire non ouvert |
| les meilleurs skills | 878 skills en bibliothèque + routeur | 12 skills vendus, REGISTRE |

**Ce que MAOS n'a pas et qu'EVE a** : la confidentialité des données (`garde_donnees`), les contraintes git d'équipe, le quiz explain-diff, les fixtures de fiche.

Attention sur `EXECUTIVE-BRIEF.md` : ses chiffres (73 %, 40 à 60 %) ne citent aucune source ; c'est un brief de vente de la collection d'origine.

## 6. Générique contre spécifique

**Générique, transposable** : doctrine §5 (complétée par `.env*`), §6 (idée), §8 (écrivain unique nommé), §9.bis, §11 (clé API = KILL), §12, §13 ; fiches : `escalate_when`, `limits`, `common_mistakes`, `quality_criteria` ; intake-audit complet ; protocole doer, checker, orchestrateur ; revue du commandant et ses 5 destinations ; boucle bornée ; NEEDS_WORK par défaut ; « suggérer un agent non audité, jamais le lancer » ; « archive, jamais supprimer » ; les 22 fichiers de savoir ; les shards Python et Django ; les décisions déjà prises.

**Spécifique, n'entre pas** : monorepo TypeScript, niveaux d'autonomie runtime, routeur multi-comptes, QMD, Living Knowledge OS, cockpit, bibliothèque `index.json`, NEXUS comme modes de déploiement, `docs/rules/` hors `python/`.

## 7. Sanitize

0 clé, 0 AWS, 0 JWT, 0 clé privée, 0 email personnel, 0 IP privée, 0 `C:\Users\`. 4 correspondances « chemin de profil macOS », tronquées : `ROADMAP.md:64, :82`, `docs/learning/AUTONOMOUS-PIPELINE.md:68`, `docs/intake/2026-08-14-cartes-a2-otakugo.md:31`. Présents, personnels mais non secrets : nom de code du projet manga de Melvyn et une clé de projet SonarCloud. Aucun nom interne BDF Gestion. **Si un fichier MAOS est copié dans EVE, retirer ces chemins.**

**Inconnues** : les branches non fusionnées (lues par l'axe D) ; la promotion mémoire après le 25/08 ; les gardes EVE et `.env*` (grep négatif seulement, à lever par sonde : `echo '{"tool_name":"Write","tool_input":{"file_path":"C:/dev/Eve/EveBackEnd/.env"}}' | python .claude/hooks/garde_perimetre.py`) ; le coût réel des sous-agents (~4x, ~15x, non revérifié).

## Sources

MAOS : `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, `PRODUCT_SPEC.md`, `TOKEN_STRATEGY.md`, `SKILLS_REGISTRY.md`, `EXECUTIVE-BRIEF.md`, `intake-audit/SKILL.md`, les 3 hooks, `settings.json`, `docs/decisions/0001` à `0009` et `PIVOT_BRIEF.md`, `docs/STRUCTURE.md`, `MEMOIRE-CENTRALISEE-ETAT.md`, `BACKLOG.md`, les 22 fichiers de savoir, 4 workflows, `learning/README.md`, `PROMPTS.md`, `AUTONOMOUS-PIPELINE.md`, 13 intakes, `ecc-harvest/PLAN.md`, `ledger.tsv`, 6 shards, `awesomeclaude/README.md`. EVE : `CLAUDE.md`, les 5 règles, `README.md`, `settings.json`, les 3 gardes (grep), les 5 fiches, `revue.md`, `chantier.md`, `REGISTRE.md`, le brief, `0009`, `PLAN.md`.
