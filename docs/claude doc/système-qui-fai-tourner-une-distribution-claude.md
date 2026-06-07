> **Le système exact qui fait tourner ma distribution avec Claude.**

> Un atelier marketing gouverné par IA, c'est 4 briques structurelles et une arborescence à plat. Tu peux le copier en 15 minutes avec les 3 prompts ci-dessous. Tu peux le comprendre en 5 minutes sans rien coder.

## Prérequis

<aside> ⚠️

**Tu n'as pas encore Claude Code ?**

Copie ce prompt dans ton IA (Claude, ChatGPT, Gemini) :

```
Aide-moi a installer Claude Code sur mon ordinateur.

D'abord, va lire la documentation officielle Anthropic <https://docs.claude.com/en/docs/claude-code/setup> pour verifier la procedure exacte selon mon systeme (Mac / Windows / Linux) et la derniere version disponible. Ne te fie pas a tes connaissances pre-entrainement, la doc officielle est la seule source fiable.

Ensuite, guide-moi etape par etape :
1. Quel est mon OS (Mac/Windows/Linux) ?
2. Quelle est ma version de Node installee (commande pour verifier) ?
3. La commande d'installation a copier-coller
4. Comment verifier que l'install a marche (commande de test)
5. Comment ouvrir un terminal dans le dossier d'un projet et taper 'claude' pour la premiere fois

Je n'ai jamais utilise de terminal. Explique-moi tout, en partant de zero.
```

Ton IA va te guider pas a pas. Reviens ici apres.

</aside>

<aside> ✅

**Tu as déjà Claude Code ?** Continue.

</aside>

<aside> 💡

**Tu utilises un autre outil que Claude Code ?**

Les concepts de cette ressource (constitution du système, spécialistes, mémoire tracée, règles auto-chargées) s'appliquent aussi à d'autres outils IA. Les prompts sont écrits pour Claude Code, mais tu peux les adapter :

* **Cursor** : la constitution devient** **`.cursor/rules/00-constitution.mdc` (alwaysApply: true), les spécialistes deviennent des** **`.cursor/rules/*.mdc` scopés par glob, la mémoire reste en markdown dans** **`docs/decisions/` ou similaire
* **Gemini CLI** : la constitution devient** **`GEMINI.md`, les spécialistes deviennent** **`.gemini/agents/*.md` (équivalent direct des sub-agents Claude Code)
* **ChatGPT /** **[Claude.ai](http://claude.ai/) (sans CLI)** : la structure reste pertinente comme arborescence de fichiers que tu charges en contexte au début de chaque session. Tu colles le contenu des fichiers clés ([CLAUDE.md](http://claude.md/) équivalent + mémoire récente) au début de ton prompt.

Les noms de fichiers et commandes changent, mais la logique reste la même : un endroit qui dit qui tu es, des spécialistes pour les tâches, une mémoire qui tient dans le temps.

</aside>

## Pourquoi cette ressource

La plupart des fondateurs et créateurs qui font de la distribution avec l'IA tombent dans un même piège : ils utilisent Claude comme un copywriter à la demande. Une session pour rédiger un mail, une session pour un post LinkedIn, une session pour un brief campagne. Chaque session repart à zéro, sans mémoire, sans cohérence, sans capitalisation.

Le système décrit ici inverse la logique. L'atelier est l'endroit où tu** ****gouvernes** ta distribution avec Claude, pas l'endroit où tu lui demandes des choses ponctuelles. Tu poses une constitution qui dit ce que tu cherches, tu actives des spécialistes pour les tâches récurrentes, tu traces les décisions de canal pour que les erreurs ne se répètent pas, et tu charges automatiquement les bonnes règles selon le canal sur lequel tu travailles (référencement, publicité, email, contenu).

La différence se voit après 4-6 semaines : ton coût d'acquisition baisse parce que tu arrêtes de retester ce qui a déjà échoué, tes campagnes deviennent cohérentes entre canaux, et tu peux confier des tâches à un spécialiste sans devoir lui réexpliquer ta cible à chaque fois.

## L'arborescence à copier

Voici la structure complète du système, universelle, applicable à tout projet de distribution (SaaS B2B, B2C, app mobile, créateur de contenu, agence, freelance).

```
mon-projet-marketing/
├── CLAUDE.md                            # CONSTITUTION (auto-chargée par Claude Code)
│                                        # Qui tu es, ce que tu cherches, règles non-négociables
│
├── docs/                                # DOCUMENTATION VIVANTE (l'état actuel)
│   ├── REFERENCE.md                     # Source de vérité (cible, métrique nord, modèle économique)
│   ├── OBJECTIVES.md                    # Objectifs chiffrés 6 mois / 12 mois
│   ├── STRATEGY.md                      # La stratégie marketing du projet (3-4 pages)
│   └── channels/                        # Un dossier par canal piloté
│       ├── README.md                    # Dashboard de tous les canaux (statut, prochaines actions)
│       ├── 01-seo/PLAN.md
│       ├── 02-publicite-search/PLAN.md
│       └── 03-email/PLAN.md
│
├── .claude/                             # CERVEAU IA
│   │
│   ├── memory/                          # MÉMOIRE PERSISTANTE (6 registres typés)
│   │   ├── DECISIONS.md                 # Décisions tracées (canal, audience, outil, positionnement)
│   │   ├── LEARNINGS.md                 # Patterns capitalisés (ce qui marche, ce qui ne marche pas)
│   │   ├── BLOCKERS.md                  # Pièges connus, hypothèses éliminées, fuites du funnel
│   │   ├── JOURNAL.md                   # Trace continue des cycles de travail
│   │   ├── EVALS.md                     # Évaluations qualité des sorties IA (min 1 par cycle)
│   │   └── EXPERIMENTS.md               # Registre des EXP-XXX (hypothèse, métriques, résultats)
│   │
│   ├── agents/                          # LES SPÉCIALISTES
│   │   ├── strategist.md                # Le chef d'orchestre (oriente, délègue, reconcilie)
│   │   ├── researcher.md                # Recherche canaux, audiences, concurrents
│   │   ├── analyzer.md                  # Analyse rapide des métriques (lecture seule)
│   │   ├── reporter.md                  # Rapports de campagne lisibles, partageables
│   │   ├── seo-strategist.md            # Autorité sur le canal référencement
│   │   ├── paid-ads-strategist.md       # Autorité sur la publicité payante
│   │   ├── email-marketing-strategist.md  # Autorité sur le canal email
│   │   └── content-strategist.md        # Création contenu, messaging, copywriting
│   │
│   ├── rules/                           # RÈGLES AUTO-CHARGÉES SELON LE CONTEXTE
│   │   ├── global.md                    # Règles partout (ton, budget, seuils, capitalisation)
│   │   ├── methodology-guard.md         # Protection des fichiers méthodologiques
│   │   └── reports.md                   # Standards des rapports de campagne
│   │
│   ├── skills/                          # CATALOGUE D'EXPERTISES INJECTABLES
│   │   ├── seo-strategy/SKILL.md        # Expertise référencement
│   │   ├── keyword-research/SKILL.md    # Expertise recherche de mots-clés
│   │   ├── google-ads/SKILL.md          # Expertise publicité Google
│   │   ├── email-workflows/SKILL.md     # Expertise séquences email
│   │   └── analytics-strategy/SKILL.md  # Expertise tracking et analytics
│   │
│   └── bootstrap.md                     # Chargement auto des outils universels
│                                        # (procédures de sécurité, anti-blocage, vérification)
│
└── reports/                             # HISTORIQUE
    └── experiments/                     # Rapports par campagne testée
```

C'est plat, lisible, et chaque dossier a un rôle précis. Pas de magie, pas de framework opaque, juste des fichiers texte que tu maintiens à la main (ou que Claude maintient pour toi).

## Les 6 briques structurelles (à comprendre)

### Brique 1 — La constitution ([CLAUDE.md](http://claude.md/))

C'est le fichier le plus important. Claude le lit automatiquement à chaque session. Il dit :

* **Qui tu es** : nom du projet, cible, ce que tu vends ou diffuses
* **Ce que tu cherches** : ta métrique nord (la métrique qui prouve que tu progresses), tes objectifs 6 mois et 12 mois
* **Comment tu travailles** : ton workflow standard (5 étapes ICE/AARRR), tes outils, ta cadence
* **Ce qui est non-négociable** : 8 règles JAMAIS / TOUJOURS / MAXIMUM (voir section "8 règles" plus bas)
* **Où trouver le reste** : pointeurs vers la mémoire, les spécialistes, l'état actuel

La règle d'or : moins de 150 lignes. Si c'est plus long, personne ne le lit (toi non plus). Tout ce qui est détail va dans des fichiers séparés ([REFERENCE.md](http://reference.md/),** **[OBJECTIVES.md](http://objectives.md/),** **[STRATEGY.md](http://strategy.md/)).

### Brique 2 — La mémoire en 6 registres typés (.claude/memory/)

Six registres distincts. Pas un seul gros fichier. Chaque type d'information a son endroit, parce que ce qui compte c'est de pouvoir retrouver vite la bonne décision quand tu en as besoin.

* [**DECISIONS.md**](http://decisions.md/) : à chaque fois que tu choisis un canal, une audience, un outil, un positionnement, tu traces la décision avec son raisonnement. Format : ID + date + contexte + options envisagées + choix + conséquences. Comme ça dans 6 mois quand tu te demanderas** ** *"pourquoi on avait abandonné LinkedIn déjà ?"* , la réponse est écrite.
* [**LEARNINGS.md**](http://learnings.md/) : chaque pattern qui marche ou qui ne marche pas, tu le capitalises.** ***"Les emails du jeudi 10h ouvrent 18% mieux que ceux du lundi 14h sur notre cible."* C'est un learning. Tu l'écris une fois, Claude le respecte ensuite.
* [**BLOCKERS.md**](http://blockers.md/) : les pièges connus, les fuites du funnel, les hypothèses éliminées. Tu l'écris une fois, ça ne revient pas te coûter.
* [**JOURNAL.md**](http://journal.md/) : trace continue des cycles. À la fin de chaque session, 3 lignes : ce que j'ai fait, ce qui bloque, prochaine action.
* [**EVALS.md**](http://evals.md/) : évaluation qualité des sorties IA. Au moins 1 par cycle. Tu notes si la sortie de Claude était bonne, moyenne ou faible, et pourquoi. C'est ça qui te dit si ton système s'améliore ou se dégrade dans le temps.
* [**EXPERIMENTS.md**](http://experiments.md/) : registre des expériences en cours. Une par ligne : ID + hypothèse + score ICE + métriques cible + statut + résultat + lien vers le learning capitalisé.

La magie : Claude lit ces fichiers à chaque session. Il ne te fait jamais répéter une décision déjà prise.

### Brique 3 — Les spécialistes (.claude/agents/)

Ce sont des fiches qui décrivent les rôles que Claude peut jouer dans ton atelier. Chacune contient : qui il est, ce qu'il fait, ce qu'il ne fait pas, son format de sortie, sa procédure d'escalation quand il bloque.

Les spécialistes méthodo (universels, dans tout système marketing) :

* **strategist** : le chef d'orchestre. Quand tu lui poses une question stratégique, il décide s'il fait lui-même ou s'il délègue à un autre spécialiste.
* **researcher** : recherche canaux, audiences, concurrents, opportunités.
* **analyzer** : analyse rapide des métriques. Lecture seule (il ne modifie rien), juste comprendre ce qui se passe dans les chiffres.
* **reporter** : rapports de campagne lisibles, partageables à un client ou à toi-même dans 3 mois.

Les spécialistes par canal (un par canal activé) :

* **seo-strategist** : autorité sur tout ce qui touche au référencement (mots-clés, contenu, technique, autorité de domaine).
* **paid-ads-strategist** : autorité sur la publicité payante (Google Ads, Meta Ads, tracking, conformité RGPD).
* **email-marketing-strategist** : autorité sur le canal email (séquences, déliverabilité, segmentation, retention).
* **content-strategist** : autorité sur la création de contenu (articles, scripts, copywriting, messaging).

Tu n'actives que les spécialistes des canaux que tu pilotes. Un projet qui n'a pas de publicité payante n'a pas besoin de paid-ads-strategist. Tu l'ajouteras quand tu en auras besoin.

### Brique 4 — Les règles auto-chargées (.claude/rules/)

La fonctionnalité la moins connue de Claude Code, et la plus puissante pour la distribution. Tu peux écrire des fichiers de règles qui se chargent automatiquement quand Claude travaille sur certains dossiers ou certains types de fichiers.

Trois fichiers de base :

* [**global.md**](http://global.md/) : règles partout dans le projet (langue, format de dates, conventions d'identifiants, capitalisation obligatoire, interdictions absolues).
* [**methodology-guard.md**](http://methodology-guard.md/) : protège les fichiers méthodologiques (constitution, agents, registres) contre les modifications non tracées.
* [**reports.md**](http://reports.md/) : standards des rapports de campagne (structure obligatoire, métriques minimum, format de capitalisation).

Tu peux en ajouter par canal :

```
---
paths:
  - "docs/channels/01-seo/**"
  - "content/blog/**"
---

Quand tu travailles sur le référencement :
- Titre principal avec mot-clé visé (60 caractères max)
- Toujours une FAQ en fin d'article pour l'optimisation moteurs IA
- 3 liens internes minimum par article
- Vérifier que le mot-clé apparaît dans les 100 premiers mots
```

Quand tu demandes à Claude de rédiger un article dans** **`content/blog/`, ces règles se chargent automatiquement sans que tu doives les lui rappeler. C'est ce qui fait passer ton atelier d'un copywriter à la demande à un système qui respecte ses propres standards.

### Brique 5 — Le catalogue d'expertises (.claude/skills/)

Une expertise est un fichier qui contient le mode d'emploi détaillé d'un domaine technique pointu. Différent d'un spécialiste : le spécialiste** ****est** un rôle, l'expertise** ****est** un savoir.

Exemples d'expertises pertinentes pour la distribution :

* `seo-strategy` : comment structurer une stratégie référencement long-terme
* `keyword-research` : comment trouver les bons mots-clés (intention, volume, difficulté)
* `google-ads` : comment configurer et optimiser une campagne Google Ads
* `email-workflows` : comment monter une séquence email lifecycle
* `analytics-strategy` : comment poser un tracking propre avec attribution

Quand un spécialiste a besoin d'une expertise précise (le seo-strategist veut une recherche de mots-clés), il invoque l'expertise correspondante. Tu n'as pas à charger toute l'expertise du monde à chaque session : seules celles utiles dans le contexte sont activées.

### Brique 6 — Le bootstrap (.claude/[bootstrap.md](http://bootstrap.md/))

Un petit fichier qui se charge automatiquement au démarrage de chaque session. Il contient les procédures universelles que Claude doit avoir sous la main en permanence :

* Comment exécuter une expérience complexe étape par étape
* Comment vérifier une affirmation avant de la considérer comme vraie ("pas de claim sans preuve")
* Comment détecter qu'on accumule de la dette dans le projet (signaux faibles)
* Comment se débloquer quand on tourne en rond depuis 30 minutes

Ce ne sont pas des règles spécifiques au marketing. Ce sont des procédures de sécurité cognitive. Tu peux les copier d'un projet à l'autre, elles ne changent pas.

## Le workflow standard (5 étapes universelles)

Quelle que soit l'expérience marketing que tu lances, elle passe par ces 5 étapes. Si tu sautes une étape, tu perds en capitalisation.

1. **Identifier** un levier de croissance. Pas une idée vague, un levier précis :** ***"améliorer la conversion Step 1 → Step 2 du funnel"* ou** ** *"capter l'intent sur la requête extension maison"* .
2. **Scorer ICE** : Impact (1-10) × Confiance (1-10) × Effort inverse (10-1), divisé par 3. Un score ICE < 5, tu skip. Un ICE > 7, tu lances en priorité.
3. **Exécuter** avec une expérience structurée : EXP-XXX dans** **[EXPERIMENTS.md](http://experiments.md/), hypothèse écrite AVANT le lancement, métrique cible définie AVANT le lancement, durée fixée.
4. **Mesurer** vs métriques cible et étape AARRR (Acquisition / Activation / Revenue / Retention / Referral). Toute expérience est rattachée à UNE étape AARRR.
5. **Capitaliser** : LRN dans** **[LEARNINGS.md](http://learnings.md/) (que tu aies gagné ou perdu, l'apprentissage compte autant), DEC dans** **[DECISIONS.md](http://decisions.md/) si la conclusion structure le futur.

Maximum 3 expériences en parallèle. Au-dessus, tu disperses ton attention et tu corromps les signaux (variables confondues).

## Les 8 règles non-négociables

Ces 8 règles sont auto-chargées dans** **[CLAUDE.md](http://claude.md/). Elles s'appliquent quel que soit le canal, quel que soit le moment.

1. **JAMAIS** d'expérience sans hypothèse mesurable écrite AVANT le lancement.
2. **JAMAIS** de campagne sans métrique de succès définie AVANT (pas de rétro-fit).
3. **TOUJOURS** scorer ICE avant de lancer (si tu ne peux pas scorer, c'est que tu ne comprends pas le levier).
4. **TOUJOURS** capitaliser le learning (win ou fail, indifférent, c'est l'apprentissage qui compte).
5. **TOUJOURS** rattacher chaque expérience à UNE étape AARRR (Acquisition, Activation, Revenue, Retention, Referral).
6. **MAXIMUM** 3 expériences en parallèle (au-dessus, tu disperses et tu corromps les signaux).
7. **UNE** North Star Metric, jamais plus (une seule métrique qui dit "on progresse vraiment").
8. **CONSENT** RGPD obligatoire avant tout email marketing (double opt-in, base légale claire).

## Les 3 prompts pour bâtir ton système

### Prompt 1 — Bootstrap l'arborescence complète

Copie ce prompt dans Claude Code, dans le dossier où tu veux créer ton système :

```
Je veux bâtir mon système de distribution gouverné dans ce dossier. Tu vas créer la structure complète d'un atelier marketing piloté par IA.

D'abord, lis la documentation officielle Claude Code <https://docs.claude.com/en/docs/claude-code/memory> et <https://docs.claude.com/en/docs/claude-code/sub-agents> pour confirmer les conventions actuelles (noms de dossiers, format YAML frontmatter, hiérarchie de chargement). Ne te fie pas à tes connaissances pré-entraînement.

Ensuite, pose-moi ces questions une par une (attends ma réponse avant la suivante) :

1. Nom du projet et type (SaaS B2B / SaaS B2C / app mobile / créateur de contenu / agence / freelance / autre)
2. La métrique nord (la métrique unique qui prouve que ton projet progresse : exemples MRR, nouveaux abonnés payants, dossiers payés par mois, leads qualifiés, téléchargements)
3. Ta cible principale en 1 phrase (qui c'est, ce qu'elle cherche, son émotion à l'entrée du tunnel)
4. Les 3 canaux d'acquisition que tu veux tester en priorité (référencement, publicité search, publicité social, email lifecycle, contenu vidéo, partenariats, communauté)
5. Ton budget mensuel marketing total et le coût d'acquisition maximum acceptable

Une fois mes 5 réponses obtenues, crée la structure suivante :

- CLAUDE.md (constitution, moins de 150 lignes, sections WHY / WHAT / HOW / RÈGLES NON-NÉGOCIABLES avec les 8 règles ci-dessus)
- docs/REFERENCE.md (source de vérité : métrique nord, cible, modèle économique, canaux prioritaires, budget, seuil CAC)
- docs/OBJECTIVES.md (objectifs chiffrés M+6 et M+12 sur la métrique nord)
- docs/STRATEGY.md (3-4 pages : vision, persona, funnel AARRR, pyramide des canaux)
- docs/channels/README.md (dashboard de tous les canaux avec en-tête prêt)
- docs/channels/01-[premier-canal]/PLAN.md (plan détaillé du canal 1)
- docs/channels/02-[deuxième-canal]/PLAN.md (plan détaillé du canal 2)
- docs/channels/03-[troisième-canal]/PLAN.md (plan détaillé du canal 3)
- .claude/memory/DECISIONS.md (en-tête + 1 entrée exemple DEC-001 = choix des 3 canaux prioritaires basé sur la cible)
- .claude/memory/LEARNINGS.md (en-tête + format LRN-XXX)
- .claude/memory/BLOCKERS.md (en-tête + format BLK-XXX)
- .claude/memory/JOURNAL.md (en-tête + entrée d'ouverture datée d'aujourd'hui)
- .claude/memory/EVALS.md (en-tête + format EVAL-XXX)
- .claude/memory/EXPERIMENTS.md (en-tête + format EXP-XXX)
- .claude/agents/strategist.md (le chef d'orchestre, format fourni dans le prompt 3)
- .claude/rules/global.md (règles partout : ton, budget, seuils KPI, langue, conventions IDs)
- .claude/bootstrap.md (chargement auto des procédures universelles)
- reports/experiments/ (dossier vide)

À la fin, affiche-moi l'arborescence générée et confirme-moi que les 5 réponses sont bien injectées dans REFERENCE.md, OBJECTIVES.md et CLAUDE.md.
```

Temps d'exécution : 5-10 minutes. Tu réponds aux 5 questions, Claude génère le squelette complet.

**Adaptation Cursor / Gemini CLI / ChatGPT** : le même prompt fonctionne, remplace juste "Claude Code" par ton outil et** **`.claude/` par le dossier équivalent (`.cursor/rules/` pour Cursor,** **`GEMINI.md` +** **`.gemini/` pour Gemini CLI). Pour ChatGPT sans CLI, le prompt te génère les fichiers en réponse texte et tu les sauves à la main dans Notion ou ton dossier local.

### Prompt 2 — Durcir ta constitution ([CLAUDE.md](http://claude.md/) opérationnel)

Le Prompt 1 te génère un** **[CLAUDE.md](http://claude.md/) de base. Celui-ci le durcit avec les règles non-négociables et le vocabulaire qui font la différence dans le temps.

```
Dans ce projet de distribution, j'ai un CLAUDE.md de base. Je veux le durcir pour qu'il devienne une constitution réellement opérationnelle.

D'abord, lis la doc officielle Claude Code <https://docs.claude.com/en/docs/claude-code/memory> pour confirmer les conventions actuelles de CLAUDE.md.

Ensuite, lis le CLAUDE.md actuel et le REFERENCE.md du projet.

Puis pose-moi ces questions une par une (attends ma réponse avant la suivante) :

1. Confirme ou ajuste les 8 règles non-négociables standard : (a) jamais d'expérience sans hypothèse mesurable, (b) jamais de campagne sans métrique avant lancement, (c) toujours scorer ICE avant de lancer, (d) toujours capitaliser le learning, (e) toujours rattacher à une étape AARRR, (f) max 3 expériences en parallèle, (g) une seule métrique nord, (h) consent RGPD avant email marketing. Tu peux en ajouter, en retirer, en reformuler.
2. Quel vocabulaire métier spécifique à TON domaine doit être verrouillé (exemples : pour un SaaS B2B "MQL / SQL / Free trial / Paid trial", pour un créateur "follower / souscripteur / lecteur engagé", pour un service "lead / prospect chaud / client signé"). Donne-moi 5-10 termes que tu veux verrouiller dans une table.
3. Quelles sont les audiences ou canaux que tu refuses absolument de tester (raisons éthiques, légales, stratégiques) ?
4. Quelle est ta cadence de capitalisation : à quelle fréquence tu mets à jour DECISIONS / LEARNINGS / JOURNAL ? Réponse type : "JOURNAL à chaque session, DECISIONS dès qu'une décision structurante est prise, LEARNINGS dès qu'un pattern émerge".
5. Quels sont les pointeurs externes à intégrer (autre projet connecté, doc produit, dossier livrables clients) ?

Une fois mes réponses obtenues, réécris le CLAUDE.md en respectant :

- Structure WHY / WHAT / CONTEXTE PROJET / CANAUX PRIORISÉS / NORTH STAR & MÉTRIQUES / HOW / RÈGLES NON-NÉGOCIABLES / VOCABULAIRE / COMMANDES PRINCIPALES
- Sous 150 lignes total
- Section RÈGLES NON-NÉGOCIABLES en bullet points JAMAIS / TOUJOURS / MAXIMUM
- Section VOCABULAIRE en table à 2 colonnes (terme | définition)
- Pointeurs vers tous les autres fichiers du système (REFERENCE.md, OBJECTIVES.md, STRATEGY.md, mémoire, spécialistes, règles)

À la fin, affiche-moi le CLAUDE.md final et explique-moi en 3 lignes pourquoi chaque règle non-négociable protège ton projet dans le temps (la capitalisation des erreurs évitées).
```

Temps d'exécution : 10-15 minutes. C'est le fichier qui te coûtera le moins de churn dans 6 mois.

### Prompt 3 — Générer les spécialistes par canal

Ce prompt produit les fiches de spécialistes adaptées aux 3 canaux que tu as choisis en Prompt 1. Tu peux en ajouter d'autres plus tard.

```
Dans ce projet de distribution, je veux générer les fiches des spécialistes de mon système. Chaque fiche est un fichier markdown dans .claude/agents/ qui décrit le rôle, l'input, l'output, les contraintes et l'escalation, avec un frontmatter YAML conforme à la doc officielle Claude Code.

D'abord, lis la doc officielle Claude Code <https://docs.claude.com/en/docs/claude-code/sub-agents> pour confirmer les conventions actuelles (frontmatter YAML, format, comment ils sont invoqués, comment ils héritent des outils).

Ensuite, lis le CLAUDE.md, le REFERENCE.md, et docs/channels/README.md pour comprendre la cible, la métrique nord et les 3 canaux prioritaires.

Puis génère les fiches suivantes :

A) Les 4 spécialistes méthodo (universels) :

--- 1. .claude/agents/strategist.md ---
Rôle : chef d'orchestre. Reçoit toute demande, décide s'il fait lui-même ou délègue.
Input : une question / demande stratégique ou opérationnelle
Output : soit la réponse directe, soit une délégation explicite vers un autre spécialiste avec un contrat clair (sujet, canal, audience, objectif, format attendu)
Contraintes : JAMAIS lancer une expérience sans hypothèse mesurable. TOUJOURS vérifier DECISIONS, BLOCKERS, LEARNINGS avant de répondre.
Escalation : si la demande contredit le CLAUDE.md ou dépasse le budget, STOP et remonte à l'utilisateur.

--- 2. .claude/agents/researcher.md ---
Rôle : recherche canaux, audiences, concurrents, opportunités.
Input : une question d'exploration (nouveau canal à tester, concurrent à analyser, audience à profiler)
Output : un rapport structuré avec sources, données chiffrées, recommandations actionnables
Contraintes : croiser au moins 3 sources, distinguer faits et opinions, citer les sources.
Escalation : si données introuvables ou contradictoires, signale-le, ne devine pas.

--- 3. .claude/agents/analyzer.md ---
Rôle : analyse rapide des métriques. Lecture seule (jamais d'écriture).
Input : une question sur les chiffres ("pourquoi le CTR a chuté la semaine 12 ?")
Output : analyse factuelle + hypothèses possibles + données qui les supportent
Contraintes : JAMAIS d'interprétation sans donnée. TOUJOURS distinguer faits et hypothèses.
Escalation : si données manquantes, signale-le, ne devine pas.

--- 4. .claude/agents/reporter.md ---
Rôle : transformer une campagne ou expérience terminée en rapport lisible.
Input : une campagne dont les métriques sont collectées
Output : rapport markdown structuré (hypothèse, résultats, learnings, prochaines actions) dans reports/experiments/
Contraintes : format identique pour toutes les campagnes (cohérence dans le temps). Toujours mettre à jour LEARNINGS.md si nouveau pattern détecté.
Escalation : si la campagne n'a pas d'hypothèse documentée AVANT lancement, signale-le.

B) Les spécialistes par canal — un par canal prioritaire choisi en Prompt 1.

Pour chaque canal (référencement, publicité search, publicité social, email, contenu, partenariats, communauté), génère une fiche avec :
- Frontmatter YAML : nom, description, model (opus pour les autorités, sonnet pour les tâches plus simples), memory: project, tools: Read/Write/Edit/Glob/Grep/WebSearch/WebFetch, skills: liste des expertises injectées (à inférer du canal — par exemple seo-strategist → skills: [seo-strategy, keyword-research])
- Mandat d'autorité : "Toute stratégie sur ce canal DOIT être validée par cet agent avant exécution"
- Périmètre : ce qu'il fait / ce qu'il ne fait pas
- Workflow : étapes obligatoires (recherche → planification → exécution → mesure → capitalisation)
- Format de sortie standard
- Contraintes spécifiques au canal (par exemple : RGPD pour email, Consent Mode v2 pour publicité, E-E-A-T pour référencement)
- Escalation : quand il s'arrête et remonte au strategist

Garde chaque fiche sous 100 lignes (max 250 si le canal le justifie). Frontmatter YAML conforme à la doc officielle.

À la fin, affiche-moi toutes les fiches générées + un schéma ASCII qui montre comment les spécialistes s'orchestrent (le strategist au centre, les autres en étoile autour, avec les flux d'invocation possibles).
```

Temps d'exécution : 15-25 minutes selon le nombre de canaux. À la fin de ce prompt, ton système est opérationnel.

## Comment utiliser ce système au quotidien

### Si tu es développeur ou tech-friendly

Tu ouvres un terminal dans le dossier du projet, tu tapes** **`claude`, et tu poses ta question. Claude charge automatiquement** **[CLAUDE.md](http://claude.md/), les règles applicables au canal sur lequel tu travailles, et la mémoire récente. Les spécialistes sont invoqués automatiquement par le strategist, ou tu peux les invoquer directement (`@seo-strategist`,** **`@email-marketing-strategist`, etc. selon la version Claude Code que tu utilises, vérifie la doc).

Rythme conseillé :

* **Lundi matin** : session de pilotage. Tu lis** **`docs/channels/README.md` (dashboard), tu décides les expériences de la semaine, tu mets à jour** **`EXPERIMENTS.md` avec les EXP-XXX nouveaux.
* **Mardi à jeudi** : sessions d'exécution. 1 canal à la fois, 1 session = 1 expérience avancée.
* **Vendredi** : session de capitalisation. Tu alimentes** **`LEARNINGS.md` avec les patterns détectés, tu mets à jour** **`JOURNAL.md`, tu produis 1 rapport dans** **`reports/experiments/` via le reporter.

### Si tu es non-dev (créateur de contenu, marketeur, fondateur non-tech)

Tu n'as pas besoin de toucher le terminal pour comprendre la structure. Tu peux :

1. **Copier l'arborescence dans Notion** : crée une page par fichier ([CLAUDE.md](http://claude.md/),** **[DECISIONS.md](http://decisions.md/),** **[LEARNINGS.md](http://learnings.md/), etc.) et tiens-les à jour à la main. Tu colles ensuite le contenu de ces pages dans** **[Claude.ai](http://claude.ai/) ou ChatGPT au début de chaque session. La structure pédagogique reste la même, c'est juste le support qui change.
2. **Demander à Claude (sans Claude Code) de faire le travail** : tu colles** **[CLAUDE.md](http://claude.md/) +** **[REFERENCE.md](http://reference.md/) +** **[DECISIONS.md](http://decisions.md/) dans un nouveau chat, et tu travailles ensuite normalement. La mémoire ne se sauvegarde pas automatiquement, donc à la fin de la session tu demandes à Claude** ***"liste-moi les décisions / learnings / blockers que je dois ajouter à mes fichiers"* et tu les recopies à la main.
3. **Engager un freelance Claude Code pour le montage initial** : tu peux engager un freelance familier avec Claude Code à 1-2 heures pour qu'il te monte le système complet dans ton dossier projet à partir des 3 prompts ci-dessus. C'est plus rapide que d'apprendre Claude Code de zéro, et tu te concentres sur ce que tu sais faire (la stratégie).

La valeur du système n'est pas dans l'outil. Elle est dans la STRUCTURE des 6 briques (constitution + mémoire 6 registres + spécialistes + règles auto-chargées + catalogue d'expertises + bootstrap). Tu peux la reproduire sur n'importe quelle plateforme IA.

## Principe extractible

<aside> 🎯

**Un atelier de distribution gouverné par IA, ce n'est pas une stack d'outils. C'est une constitution, une mémoire typée en plusieurs registres, des spécialistes par canal, des règles qui se chargent toutes seules. Quand ces briques tiennent, ton IA ne te fait plus répéter la même décision, et tes campagnes deviennent cohérentes dans le temps.**

</aside>

## Checklist actionnable

* [ ] J'ai créé un dossier** **`mon-projet-marketing/` (ou équivalent) dédié à mon système de distribution
* [ ] J'ai lancé le Prompt 1 et répondu aux 5 questions (cible, métrique nord, canaux, budget, seuil CAC)
* [ ] L'arborescence des 6 briques est créée ([CLAUDE.md](http://claude.md/) + docs/ + .claude/memory/ + .claude/agents/ + .claude/rules/ + .claude/skills/ + .claude/[bootstrap.md](http://bootstrap.md/))
* [ ] J'ai lancé le Prompt 2 et durci mon** **[CLAUDE.md](http://claude.md/) avec les 8 règles non-négociables et le vocabulaire métier
* [ ] J'ai lancé le Prompt 3 et généré les fiches de spécialistes (4 méthodo + 1 par canal prioritaire)
* [ ] J'ai tracé ma première décision dans** **[DECISIONS.md](http://decisions.md/) (le choix initial des 3 canaux prioritaires avec raisonnement)
* [ ] J'ai planifié une session hebdo (lundi pilotage + vendredi capitalisation)
* [ ] J'ai noté quelque part comment je vais migrer vers cette structure si je n'utilise pas Claude Code (Notion, ChatGPT, ou freelance)

## Pour aller plus loin

* **Documentation officielle Claude Code memory** :** **[https://docs.claude.com/en/docs/claude-code/memory](https://docs.claude.com/en/docs/claude-code/memory) (pour** **[CLAUDE.md](http://claude.md/), conventions actuelles)
* **Documentation officielle Claude Code sub-agents** :** **[https://docs.claude.com/en/docs/claude-code/sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents)(pour les fiches de spécialistes, frontmatter YAML, comment ils sont invoqués)
* **Documentation officielle Claude Code skills** :** **[https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) (pour les expertises injectables, format** **[SKILL.md](http://skill.md/))
* **Documentation officielle Claude Code setup** :** **[https://docs.claude.com/en/docs/claude-code/setup](https://docs.claude.com/en/docs/claude-code/setup) (installation, mise à jour)
* **Ressources complémentaires du Hub** :
  * *Le starter kit 3 fichiers* (RES-013) si tu veux la version minimaliste avant de monter au système complet
  * *Ma doctrine : trio Claude Code* (RES-049) pour la version générique non-marketing (constitution + registres + usage)
  * *Mémoire agent : 5 registres* (RES-029) pour aller plus profond sur le système de mémoire (la version 6 registres du système marketing en est une extension directe)
  * *Doctrine portable multi-CLI* (RES-033) si tu veux porter ton système vers Cursor / Gemini CLI / autre outil

---

Créé par @le_gouverneur_ia
