# Rapport brut : inventaire décisionnel des skills, commandes et hooks de MAOS, pour EVE

Agent : `chercheur-eve`. Lancé le 16/09/2026 au soir, axe B de l'audit du lot 2. Déposé tel quel. Lecture seule, aucun fichier modifié par l'agent. Consommation : 232 067 tokens, 52 appels d'outils, 14 minutes.

---

**Question.** Parmi les 26 skills, 8 commandes et 3 hooks de MAOS (`C:\dev\maos`, tronc `knowledge-os/brique-1`, HEAD `377f636` du 07/09/2026), qu'est-ce qui donne à EVE ce qui lui manque pour la vision de Melvyn, et que faut-il changer pour que ça tourne dans EVE ?

**Réponse en trois lignes.** L'intelligence de MAOS que Melvyn ne voit pas encore dans EVE tient dans sept fichiers texte (les six `mas-*`, 723 lignes, et `intake-audit`, 114 lignes) et dans trois documents de doctrine (`CLAUDE.md` §5 à §8 et §11, `TOKEN_STRATEGY.md`, `SKILLS_REGISTRY.md`) : aucun ne dépend réellement de l'application TypeScript, seuls les formats de sortie JSON, les tables SQL et les chemins `data/` le sont. Ils se transposent dans EVE sans clé API, par des moyens natifs de Claude Code : champs `model`, `skills`, `tools`, `disallowedTools` dans le frontmatter des fiches (documentés officiellement), une table de tâches dans `plan.md`, une règle de verdict dans `/revue`, une porte de sécurité au niveau du brief, une doctrine de mémoire avec critères et provenance, et trois hooks réécrits en Python. Les 17 skills Anthropic (bureautique, design, art, API, MCP) sont un arsenal pour d'autres domaines : 15 rejets, 3 en veille ; `explain-diff` est déjà dans EVE.

## 1. Vue chiffrée

| Ensemble | Nombre | Détail sourcé |
| --- | --- | --- |
| Skills vendus dans `.claude/skills/` | 26 | `git ls-files .claude/skills` ; les 3 skills gérés par plugin (`superpowers`, `caveman`, `ui-ux-pro-max`) sont dans `.gitignore:50-52` et absents du dossier sur ce poste |
| dont origine Anthropic (`anthropics/skills`) | 17 | tous ajoutés le 24/05/2026, commit `c11765a` : algorithmic-art, brand-guidelines, canvas-design, claude-api, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx. Licence Apache 2.0 pour la plupart, propriétaire Anthropic pour docx, pdf, pptx, xlsx ; doc-coauthoring sans `LICENSE.txt` |
| dont noyau `mas-*` (maison) | 6 | ajoutés le 02/06/2026, commit `3e5edb5` ; 116 + 123 + 104 + 150 + 119 + 111 = 723 lignes ; épinglés pour l'orchestrateur dans `config/skills.policy.json` |
| dont maison hors noyau | 1 | `intake-audit`, 12/06/2026, `f006ecd`, 114 lignes, motifs cités de affaan-m/ecc |
| dont tiers adaptés | 2 | `explain-diff` (Geoffrey Litt, 10/08/2026, 197 lignes) ; `taste` (affaan-m/ecc, MIT, 21/06/2026, 89 lignes) |
| Commandes `.claude/commands/` | 8 | 831 lignes. 6 réécrites depuis affaan-m/ecc le 21/06/2026 : aside 88, checkpoint 78, pr 178, test-coverage 77, update-codemaps 78, update-docs 93 ; `security-review` 190 lignes (prompt public Anthropic) ; `explain-diff` 49 lignes |
| Hooks `.claude/hooks/` | 3 | bash + `jq` : `frontmatter-validate.sh` 43 lignes, `limit-file-size.sh` 55, `token-watch.sh` 52. Câblage : PreToolUse `Write|Edit` (taille), PostToolUse `*` (tokens), PostToolUse `Write|Edit` (frontmatter), SessionStart |
| Registres | 2 | `SKILLS_REGISTRY.md` (dernier 10/08/2026), `TOKEN_STRATEGY.md` (dernier 27/06/2026) |

**Doublons avec le `REGISTRE.md` d'EVE.** Exact : `explain-diff`. Partiels : `intake-audit` contre la procédure d'ajout en 5 étapes ; `skill-creator` contre `writing-for-agents` et `superpowers:writing-skills` ; `mas-reviewer` contre `code-review`, `relecteur-eve` et `/revue` ; `doc-coauthoring` contre `redacteur-eve` ; `frontend-design` contre la charte des dashboards. Côté commandes : `pr` contre `/pr`, `security-review` contre la commande intégrée, `checkpoint` contre `/gate --journal` et `/fin-session`, `test-coverage` contre la couverture de `gate.py`, `update-codemaps` contre `graphify`.

## 2. Le noyau `mas-*`, un paragraphe par skill

### mas-mission-planner (116 lignes) : adapt_now, T1, lot 2 du brief

Décompose un brief en DAG de 4 à 8 tâches atomiques, après au plus 3 questions de clarification. Chaque tâche : `agentHint` unique, `dependsOn` minimal, `budgetTokens` 1200/2500/4000, `risk` low/medium/high/blocking. Portes obligatoires : porte sécurité avant toute tâche touchant `.env`, secrets, `push --force`, API externe ; **revue finale toujours dernière tâche**. Critères binaires : description >= 20 mots, dernière tâche `reviewer`, toute tâche `high` précédée d'une porte sécurité, JSON valide. **Générique** : Plan-Then-Execute, chaîne de pensée en 6 étapes, test d'auto-cohérence (« trois planificateurs produiraient-ils le même DAG ? »), densité de signal, description de tâche écrite comme un prompt précis. **Lié à MAOS** : sortie `PlannerOutput` JSON, identifiants d'agents de `AGENTS.md`, états du cockpit. **Ce qu'EVE a** : `/chantier` §4 produit `plan.md` par `superpowers:writing-plans`, chaque tâche avec sa vérification à la couche nommée, plan attaqué par `relecteur-eve` ; l'ordre est en prose ou en ASCII. **Ce qui manque** : les champs par tâche (agent, dépend de, risque, budget) et la règle écrite « dernière tâche = porte de revue, porte sécurité avant toute tâche risquée ». **Adaptation** : pas de JSON ; une table Markdown `tâche | agent | dépend de | risque | preuve à la couche` dans `plan.md` ; vocabulaire de risque mappé sur EVE (haut = liste structurante de `securite.md` plus migration ; bloquant = actions de la main de Melvyn) ; « <= 3 questions » compatible avec « une question à la fois ». Portage dans une fiche `planificateur-eve` au lot 2.

### mas-skill-router (123 lignes) : adapt_now, T1, mais en configuration statique

Pour chaque tâche : `requiredSkills` <= 3, `favoriteSkills` <= 2, `tierBAgents` <= 2, modèle par risque (`high/blocking` vers opus, `medium` vers sonnet, `low` vers haiku, coûts relatifs 1x, 5x, 25x), `requires_validation: true` sur signaux d'escalade (paiement, envoi de message, déploiement, `push to main`, `rm -rf`, `eval`, `sudo`, `curl | sh`, « api key », « secret », `.env`, « password »), rationale <= 3 lignes. Lit seulement les métadonnées L1. **Générique** : le routage par risque, la densité de signal, <= 7 outils par agent, la liste d'escalade. **Lié à MAOS** : `SkillRouterDecision` JSON, bibliothèque froide de 878 skills, noms de modèles datés. **Ce qu'EVE a** : cinq fiches avec `name`, `description`, `tools` seulement. **Adaptation** : avec 5 ou 6 fiches et 12 skills, un routeur dynamique est disproportionné. Reprendre le principe en **statique** : champ `model:` et champ `skills:` dans chaque fiche, plus une colonne au REGISTRE. La liste d'escalade est déjà mécanique dans EVE ; à compléter des mots EVE (`migrate`, `manage.py test` sans `DB_CONFIG`, `EveDev`, `merge`). Inconnue : quel modèle pour quelle fiche.

### mas-context-manager (104 lignes) : adapt_now, T2, comme gabarit de brief

Construit un pack de contexte par projet <= 4 000 tokens, rafraîchi si > 24 h, sections : fichiers clés (chemins seulement), architecture (3 à 5 puces), activité git 7 jours résumée, mémoire présente. **Générique** : test de densité de signal, « context rot », récupération juste à temps (un chemin coûte 5 tokens, le fichier 500). **Ce qu'EVE a** : `CLAUDE.md` « EVE en dix lignes », `PLAN.md`, `graphify`, `handoff.md`, brief collé aux relecteurs. **Adaptation** : un `chantiers/<chantier>/contexte.md` <= 4 000 tokens écrit par le fil à chaque point d'étape.

### mas-memory-keeper (150 lignes) : adapt_now, T1, comme doctrine et gabarits

Seul écrivain de la mémoire. Promeut si les 4 critères tiennent : non évident, durable >= 1 mois, nouveau, actionnable ; rejette si éphémère, redondant, faible confiance, dérivable du code. Cinq registres : `decisions.md` BDR, `learnings.md` LRN, `blockers.md` BLK, `journal.md`, `evals.md` EVAL. <= 5 éléments globaux injectés par mission. **Ce qu'EVE a** : bucket mémoire avec fiches typées ; `_decisions/` qui est exactement le gabarit BDR ; `journal.md` ; « Constats hors périmètre ». **Ce qui manque** : les critères de promotion écrits, les registres BLK et EVAL, et une ligne de **provenance** (agent, chemin du rapport, date) dans chaque fiche de mémoire. **Adaptation** : une règle `memoire.md` ou une section de `communication.md`.

### mas-reviewer (119 lignes) : adapt_now, T1, dans `/revue` (lot 3 du brief)

Principe **couverture avant filtrage** : rapporter tout, y compris incertain et mineur, avec confiance et sévérité ; l'humain filtre. Verdict binaire `PASS | NEEDS_WORK | BLOCK` **dérivé mécaniquement** des sévérités. Chaque finding : fait, où, pourquoi, confiance. Contrôle de dérive. Six contrôles. **Ce qu'EVE a** : `relecteur-eve` par axe avec table sévérité, fichier:ligne, constat, preuve, correctif ; `/revue` avec vérification contradictoire et contre-relecture. **Ce qui manque** : un verdict de la revue entière dérivé mécaniquement, la colonne **confiance**, et la phrase « rapporte aussi le peu sûr, la vérification contradictoire filtre ». Point de tension : le plafond de 400 mots de `relecteur-eve` contre « couverture avant précision ».

### mas-sec-reviewer (111 lignes) : adapt_now, T1, comme porte de brief (lot 4 du brief)

Porte dure avant toute tâche `high` ou `blocking`. Verdict `PASS | BLOCK` seulement. Six catégories : sortie de périmètre, shell dangereux, écriture de secrets, git destructif, réseau hors liste blanche, vecteur d'injection. **Générique** : la triade létale de Willison (données privées + entrée non maîtrisée + action à conséquence = BLOCK), OWASP LLM01, refus par défaut. **Ce qu'EVE a** : les catégories sont mécaniques au moment de l'appel d'outil (`garde_perimetre`, `garde_git`, `garde_donnees`) ; `/security-review` sur le diff. **Ce qui manque** : une porte **au niveau du brief**, avant de lancer `developpeur-eve` sur une tâche à risque haut. **Adaptation** : un mode « attaque de brief, axe sécurité » de `relecteur-eve` ou une fiche `securite-eve`, PASS ou BLOCK.

### skill-creator (485 lignes, Anthropic, Apache 2.0) : adapt_now, T1 pour la boucle d'évaluation

Capture d'intention en 4 questions, écriture du `SKILL.md`, puis **boucle de test** : 2 ou 3 prompts réalistes dans `evals/evals.json`, exécution en parallèle de deux sous-agents par cas, **avec skill et sans skill** (baseline), assertions, tokens et durée capturés, notation par un sous-agent lecteur de `agents/grader.md`, agrégation `aggregate_benchmark.py`, itération. **Optimisation de description** par `claude -p` en sous-processus, sans clé API. **Dépendances** : les HTML chargent des polices Google et `xlsx.full.min.js` depuis un CDN : appels réseau sortants à retirer pour EVE ; chemins `/tmp` et `~/Downloads` à rediriger. **Ce qu'EVE a** : `writing-for-agents`, `superpowers:writing-skills`, et un banc manuel : les 4 fixtures de `developpeur-eve`. **Ce qui manque** : la mesure quantitative (baseline contre skill, tokens, taux de réussite). **Adaptation** : reprendre `evals.json`, `grader.md`, `aggregate_benchmark.py`, le mode `--static`, sans CDN ; ranger sous `fixtures/`.

## 3. Table des 26 skills

| Skill | Origine | Une ligne | Tier | Décision | Motif |
| --- | --- | --- | --- | --- | --- |
| mas-mission-planner | mas | DAG de 4 à 8 tâches, risque par tâche, porte sécurité, revue finale obligatoire | T1 | adapt_now | table de tâches dans `plan.md`, fiche `planificateur-eve` |
| mas-skill-router | mas | modèle par risque, <= 3 skills, signaux d'escalade | T1 | adapt_now | en statique : `model:` et `skills:` par fiche |
| mas-context-manager | mas | pack de contexte <= 4 k tokens, chemins pas contenus | T2 | adapt_now | gabarit `contexte.md` par chantier |
| mas-memory-keeper | mas | écrivain unique, 4 critères de promotion, 5 registres, provenance | T1 | adapt_now | doctrine et gabarits ; registres BLK et EVAL à créer |
| mas-reviewer | mas | couverture avant filtrage, verdict PASS/NEEDS_WORK/BLOCK dérivé | T1 | adapt_now | verdict en tête de `revue.md`, colonne confiance |
| mas-sec-reviewer | mas | porte PASS/BLOCK avant tâche risquée, 6 catégories, triade létale | T1 | adapt_now | porte de brief en lecture |
| intake-audit | maison | audit « faut-il l'ajouter », 3 coûts, KILL, 5 décisions, sanitize, Prompt Defense | T1 | adapt_now | déjà imposé par le brief ; dossiers dans `chantiers/<chantier>/intake/` |
| skill-creator | Anthropic | création et évaluation quantitative de skills, baseline contre skill | T1 | adapt_now | boucle d'évaluation reprise, CDN retirés |
| explain-diff | Litt via MAOS | page HTML pédagogique et quiz par diff | T0 | reject | déjà dans EVE |
| doc-coauthoring | Anthropic | co-rédaction en 3 étapes, test lecteur par sous-agent | T2 | watch | `redacteur-eve` couvre |
| xlsx | Anthropic, propriétaire | tableurs | T2 | watch | risque de contournement de `garde_donnees` par script |
| docx | Anthropic, propriétaire | Word | T2 | watch | besoin non exprimé |
| pdf | Anthropic, propriétaire | PDF | T0 | reject | l'outil Read lit déjà les PDF |
| pptx | Anthropic, propriétaire | présentations | T0 | reject | domaine absent |
| claude-api | Anthropic | applications sur l'API | T0 | reject | **clé API** : rejet automatique |
| mcp-builder | Anthropic | serveurs MCP | T0 | reject | aucun MCP non validé ; `npx` non épinglé |
| webapp-testing | Anthropic | Playwright | T0 | reject | EVE est une API Django |
| frontend-design | Anthropic | interfaces web | T0 | reject | charte des dashboards fixée |
| web-artifacts-builder | Anthropic | React, Tailwind | T0 | reject | domaine absent |
| theme-factory | Anthropic | thèmes | T0 | reject | domaine absent |
| brand-guidelines | Anthropic | charte d'Anthropic | T0 | reject | hors sujet |
| canvas-design | Anthropic | affiches | T0 | reject | domaine absent |
| algorithmic-art | Anthropic | art génératif | T0 | reject | domaine absent |
| slack-gif-creator | Anthropic | GIF Slack | T0 | reject | domaine absent |
| internal-comms | Anthropic | communications internes | T0 | reject | `communication.md` couvre |
| taste | affaan-m/ecc | direction créative | T0 | reject | domaine absent |

Bilan : 7 en T1 adapt_now, 1 en T2 adapt_now, 3 en veille, 15 rejets.

## 4. Table des 8 commandes et des 3 hooks

| Nom | Ce que ça fait | Équivalent EVE | Décision |
| --- | --- | --- | --- |
| `/aside` (ecc) | question latérale en lecture seule, gel de la tâche, reprise au point exact | aucun | adapt_now, T2 : `/aparte`, effort minime |
| `/checkpoint` (ecc) | journalise nom, date, SHA court après la porte de vérification | `/gate --journal` sans SHA | reject, T0 ; **principe à garder** : ajouter le SHA court à la ligne `GATE PASS` du journal |
| `/explain-diff` (Litt) | porte d'entrée du skill, résolution de la cible | le skill est appelé directement | adapt_now, T2 : `/explique-diff` avec base `develop` |
| `/pr` (ecc) | valide, **pousse** (`git push -u`, `--force-with-lease`), crée une PR par `gh` | `/pr` d'EVE rédige, aucun push | reject, T0 : push automatique, `--force-with-lease` interdit |
| `/security-review` (Anthropic) | revue de sécurité du diff, sous-tâches, seuil de confiance 8/10, 17 exclusions | commande **intégrée** à Claude Code | adapt_now, T1 : copie locale sous un nom distinct (`/revue-securite`), base `develop`, exclusions relues pour EVE |
| `/test-coverage` (ecc) | couverture, **génère les tests manquants** | `gate.py` en information | reject, T0 : contredit « pas de tant qu'on y est » |
| `/update-codemaps` (ecc) | cartes d'architecture | `graphify` | reject, T0 : graphify fait mieux |
| `/update-docs` (ecc) | régénère les sections marquées, signale les docs > 90 jours | `documentation/` à la main | backlog_next, T2 : proposition à Edmond |
| `frontmatter-validate.sh` | PostToolUse : valide le frontmatter des `.md` de savoir via `pnpm` | aucun contrôle de frontmatter | adapt_now, T1 : réécrit en Python, cible `.claude/agents/*.md`, `commands/*.md`, `skills/*/SKILL.md` ; répond à l'exigence 3 du brief |
| `limit-file-size.sh` | PreToolUse : refuse une écriture qui porterait un fichier > 800 lignes | `gate.py` seuils en information | adapt_now, T2, **seulement en variante « n'aggrave pas »** : tel quel, toute édition de `data/schemas/issuer_data.py` (6 092 lignes) serait refusée |
| `token-watch.sh` | PostToolUse `*` : lit le transcript, calcule le pourcentage de fenêtre, injecte un avertissement à 98 % | aucun | adapt_now, T1 : réécrit en Python, seuil 85 à 90 % pour laisser place à `/fin-session` ; à vérifier par sonde que le hook reçoit `transcript_path` |

Note commune aux trois hooks : ils dépendent de `jq`, absent du PATH ici ; deux contiennent un emoji et des tirets typographiques que `verif_style` refuserait.

## 5. `TOKEN_STRATEGY.md` et `SKILLS_REGISTRY.md`

**`TOKEN_STRATEGY.md`** (124 lignes) : le budget est un quota d'abonnement, jamais de l'argent ; trois modes ; hiérarchie de budgets (part du projet <= 40 % de la fenêtre de 5 h, à 80 % avertissement, à 100 % pause) ; quatre couches de cache ; **plafond dur 32 k tokens d'entrée par appel** ; marges >= 30 % libres ; anti-motifs (réinjecter le README, boucler un prompt, charger les corps superpowers, missions expert sans relecteur, agents > 1 k tokens de prose par tour). **Ce qu'EVE peut reprendre** : les anti-motifs (trois déjà appliqués sans le dire : `CLAUDE.md` compact, `/revue` obligatoire, plafonds de mots des fiches) ; un budget par chantier et par phase au dashboard ; le résumé de mission <= 500 tokens à la clôture (le `handoff.md`) ; l'avertissement à 80 % via le hook ; le modèle par tier via `model:`. **À rejeter** : Caveman (les rapports sont lus par Melvyn) ; le plafond de 32 k non réglable hors SDK.

**`SKILLS_REGISTRY.md`** (138 lignes) : quatre tiers (Pinned, Project-pinned, On-demand, Methodology chargé à la phase du cycle) ; combinaisons interdites ; affectation de skills par agent. **Ce qu'EVE peut reprendre** : la colonne « phase du pipeline et déclencheur » au REGISTRE ; une section « combinaisons interdites » ; l'affectation par agent qui devient le champ `skills:` du frontmatter.

## 6. Sanitize

Balayage par les motifs d'`intake-audit` sur `.claude/skills`, `.claude/commands`, `.claude/hooks`, `SKILLS_REGISTRY.md`, `TOKEN_STRATEGY.md` : **0** clé ou jeton, **0** courriel personnel, **0** IP privée, **0** chemin de profil. Le mot `ANTHROPIC_API_KEY` apparaît dans 20 fichiers, toujours comme nom de variable en documentation. Hors périmètre : `config/model-routing.json` porte des noms de variables de clés tierces et le coût mensuel de l'abonnement de Melvyn (information personnelle à ne pas recopier). Appels sortants dans `skill-creator` (polices Google, `cdn.sheetjs.com`) à retirer avant adoption. **Côté EVE, un point** : `plan.md` du chantier contient le chemin complet du profil Windows (`D:\Users\mpomm...`) aux lignes 23, 151, 209, 256 ; hors dépôt, mais le motif d'`intake-audit` ne couvre que `C:\Users\`, à étendre.

## Inconnues et comment les lever

1. Une commande locale `security-review` coexiste-t-elle avec l'intégrée ? Lever par un nom distinct.
2. `revue.md:25` dit « appelle le Skill tool avec `security-review` » : aucun skill de ce nom dans `.claude/skills/`. Vérifier que l'appel résout vers la commande intégrée.
3. Le hook PostToolUse reçoit-il `transcript_path` sur ce poste ? Sonde en lecture.
4. Le champ `skills:` du frontmatter : son effet se prouve par une fixture.
5. Quel modèle pour quelle fiche : décision de Melvyn.
6. Coût en fenêtre d'abonnement des boucles `claude -p` de `skill-creator`.
7. Origine de `doc-coauthoring` (aucun `LICENSE.txt`).

## Sources

EVE : `REGISTRE.md`, `chantier.md`, `revue.md`, `gate.md`, `pr.md`, `relecteur-eve.md`, les 5 fiches, `gate.py`, `verif_style.py`, `doctor.py`, `garde_git.py`, `garde_perimetre.py`, `settings.json`, les 5 règles, le brief, `design.md`, `plan.md`, superpowers 6.1.1. MAOS : les 8 `SKILL.md` du noyau en entier, frontmatter des 18 autres, `skill-creator/scripts/*`, les 8 commandes et 3 hooks en entier, `settings.json`, `SKILLS_REGISTRY.md`, `TOKEN_STRATEGY.md`, `CLAUDE.md` (l.61-125, 150-167), `AGENTS.md` (l.59-140), `config/*.json`, `.gitignore`, licences, `git log` par fichier. Public : centre d'aide Anthropic « Automated Security Reviews in Claude Code » (août 2025) ; `anthropics/claude-code-security-review` ; documentation Subagents (champs de frontmatter).
