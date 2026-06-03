> **Comment faire pour que ton IA lise sa mémoire intelligemment.**

> Au lieu de tout relire à chaque fois, elle lit d'abord un sommaire, repère la bonne entrée, et saute directement au bon passage. Tu repars avec le template de sommaire, la règle de lecture à imposer, et un prompt pour que ton IA le maintienne toute seule.

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

Le principe de cette ressource (un sommaire en tête de fichier mémoire, une règle de lecture, un petit script qui maintient le sommaire à jour) s'applique à tout assistant IA qui lit des fichiers texte. Les prompts sont écrits pour Claude Code, mais tu peux les adapter :

* **Cursor** : la règle de lecture va dans** **`.cursor/rules/00-lecture-memoire.mdc` (alwaysApply: true). Le sommaire reste en tête de tes fichiers markdown de mémoire.
* **Gemini CLI** : la règle de lecture va dans** **`GEMINI.md`. Même logique de sommaire en tête de fichier.
* **ChatGPT /** **[Claude.ai](http://claude.ai/) (sans outil en ligne de commande)** : tu colles le sommaire en début de session et tu demandes à l'IA de ne charger que la section utile. Le petit script de mise à jour, tu le lances à la main ou tu demandes à l'IA de recalculer les numéros de ligne.

Les noms de fichiers changent, la logique reste la même : un sommaire d'abord, un saut direct au bon passage ensuite.

</aside>

## Pourquoi cette ressource

Quand ton IA travaille sur un projet qui dure, sa mémoire grossit. Décisions, apprentissages, pièges connus, tout s'accumule dans des fichiers texte. Au début ça va. Puis le fichier fait 800 lignes, et chaque fois que ton IA veut retrouver une info, elle relit tout. C'est lent, c'est cher en attention, et au passage elle se noie dans le bruit.

La solution est la même que pour un humain face à un gros livre : tu ne relis pas le livre en entier pour retrouver un chapitre. Tu ouvres le sommaire, tu repères la ligne, tu sautes à la bonne page. Cette ressource te donne exactement ça pour ta mémoire IA : le template de sommaire, la règle de lecture à lui imposer, et un prompt qui met le sommaire en place et le maintient à jour automatiquement.

## Le principe en une image

```
SANS sommaire :                          AVEC sommaire :

┌────────────────────────┐               ┌────────────────────────┐
│  Fichier mémoire        │              │  SOMMAIRE (en tête)     │
│  ligne 1                │              │  - Sujet A ... ligne 12 │
│  ligne 2                │              │  - Sujet B ... ligne 47 │
│  ...                    │  ← relit     │  - Sujet C ... ligne 90 │
│  ligne 400 (l'info)     │    TOUT      ├────────────────────────┤
│  ...                    │              │  ... saut direct →      │
│  ligne 800              │              │  ligne 47 (l'info)      │
└────────────────────────┘               └────────────────────────┘
   Coûteux, lent, bruité                    Léger, ciblé, propre
```

Le sommaire est en haut du fichier. Chaque entrée pointe vers un numéro de ligne. L'IA lit le sommaire, trouve la bonne entrée, et saute directement à la section indiquée. Elle ne relit jamais le fichier entier.

## Brique 1 : le template de sommaire (à coller en tête de fichier)

Mets ce bloc tout en haut de chaque fichier mémoire un peu volumineux. Chaque ligne du sommaire a trois éléments : un titre court, un résumé en une phrase, et le numéro de ligne où c'est rangé.

```
# SOMMAIRE (lire en premier, sauter directement au bon passage)
#
# | Titre court        | Résumé en une phrase                                  | Ligne |
# |--------------------|-------------------------------------------------------|-------|
# | Choix de la base   | Pourquoi on a pris Postgres et pas Mongo              | 24    |
# | Tarification       | La grille de prix actuelle et l'historique des hausses| 58    |
# | Piège déploiement  | L'erreur de migration qui nous a coûté un week-end    | 96    |
# | Cible client       | Qui on vise vraiment et qui on a arrêté de viser      | 130   |
#
# Fin du sommaire. Le contenu détaillé commence ci-dessous.
# =====================================================================
```

Trois colonnes, c'est tout. Le titre court sert à scanner vite. Le résumé en une phrase évite d'avoir à ouvrir la section pour savoir si c'est la bonne. Le numéro de ligne est l'adresse exacte où sauter.

Note importante : le numéro de ligne pointe vers la bonne** ** **section** , pas vers une ligne unique magique. L'IA saute à cette zone du fichier et lit le passage concerné, pas le fichier entier.

## Brique 2 : la règle de lecture (à imposer à ton IA)

Un sommaire ne sert à rien si ton IA ne sait pas qu'elle doit l'utiliser. Tu dois lui donner la règle de lecture. Colle ce bloc dans le fichier d'instructions de ton IA (le** **`CLAUDE.md` pour Claude Code, ou l'équivalent de ton outil) :

```
## Règle de lecture de la mémoire

Quand tu as besoin d'une information dans un fichier mémoire :
1. Lis d'abord le SOMMAIRE en tête du fichier (les premières lignes).
2. Repère l'entrée qui correspond à ce que tu cherches (titre + résumé).
3. Saute directement au numéro de ligne indiqué et lis cette section.
4. Ne relis JAMAIS le fichier entier. Si le sommaire ne couvre pas
   ce que tu cherches, lis le sommaire d'un autre fichier mémoire,
   pas tout le contenu.
5. Si tu modifies le fichier (ajout d'une section), mets à jour le
   sommaire en conséquence (titre + résumé + numéro de ligne).
```

Cette règle change le comportement par défaut. Sans elle, ton IA charge tout par réflexe. Avec elle, elle scanne le sommaire et cible le bon passage.

## Brique 3 : le prompt prêt à coller (pour que l'IA fasse tout)

C'est le cœur actionnable. Tu colles ce prompt dans ton IA (Claude Code ou autre assistant). Il génère le sommaire sur tes fichiers mémoire existants, calcule les numéros de ligne, installe la règle de lecture, et met en place un petit script qui régénère le sommaire automatiquement quand un fichier change.

Le prompt est ouvert à tout type de projet : code, marketing, consulting, écriture, gestion de communauté. Tu n'as pas besoin de coder pour l'utiliser.

```
Je veux que tu organises mes fichiers mémoire pour que tu puisses
les relire intelligemment, sans tout recharger à chaque fois.

D'abord, lis la documentation officielle Anthropic
<https://docs.claude.com/en/docs/claude-code/memory> pour confirmer
les conventions actuelles des fichiers mémoire et où ranger une règle
de lecture. Ne te fie pas à tes connaissances pré-entraînement, la
doc officielle est la seule source fiable.

Ensuite, pose-moi ces questions une par une (attends ma réponse
avant la suivante) :

1. Quels sont mes fichiers mémoire (donne-moi les chemins ou
   laisse-moi te les pointer) ? Ce sont les fichiers où s'accumulent
   mes décisions, apprentissages, pièges, notes de projet.
2. Quel type de projet (code / marketing / consulting / écriture /
   communauté / autre) ? Ça m'aide à nommer les entrées du sommaire
   dans TON vocabulaire.
3. À partir de combien de lignes tu veux que je crée un sommaire
   (par défaut : dès qu'un fichier dépasse 150 lignes) ?

Une fois mes réponses obtenues :

A) Pour chaque fichier concerné, crée un SOMMAIRE en tête, avec une
   ligne par section. Chaque ligne contient :
   - un titre court (3-5 mots)
   - un résumé en une phrase de ce que contient la section
   - le numéro de ligne où commence la section dans le fichier
   Calcule les vrais numéros de ligne en lisant le fichier.

B) Crée (ou complète) une règle de lecture dans mon fichier
   d'instructions principal. La règle doit dire : lis le sommaire
   d'abord, repère la bonne entrée, saute directement au passage,
   ne relis jamais le fichier entier, et mets à jour le sommaire
   quand tu modifies le fichier.

C) Écris un petit script de mise à jour (dans le langage le plus
   simple disponible sur mon système) qui relit un fichier mémoire,
   détecte les sections, et régénère le sommaire avec les bons
   numéros de ligne. Explique-moi en deux phrases comment le lancer
   quand je modifie un fichier. Si je ne suis pas à l'aise avec les
   scripts, propose-moi à la place une version où c'est TOI qui
   régénères le sommaire sur demande, sans script.

À la fin, montre-moi un fichier mémoire avant / après, et
explique-moi en trois lignes ce qui a changé dans ta façon de lire.
```

Temps d'exécution : 10 à 15 minutes selon le nombre de fichiers. À la fin, tes fichiers mémoire ont un sommaire, ton IA a la règle de lecture, et tu as un moyen de garder le sommaire à jour.

## Pourquoi ça marche (la preuve)

Ce n'est pas une astuce de confort, c'est appuyé sur de la recherche solide.

* **Anthropic recommande exactement cette approche.** Dans son article sur l'ingénierie de contexte pour les agents IA, Anthropic conseille de garder des repères légers (chemins de fichiers, liens, requêtes) et de charger l'information à la demande plutôt que tout d'un coup. Citation :** ***"Every new token introduced depletes this budget by some amount"* (chaque nouveau bout de texte introduit épuise ce budget d'attention). Le sommaire est précisément un repère léger qui permet ce chargement à la demande.
* **Trop de contexte dégrade les réponses.** L'étude** ***"Lost in the Middle"* (Liu et al., Stanford, 2024) a montré que les modèles retrouvent moins bien une info quand elle est noyée au milieu d'un long texte. Le rapport** ***"Context Rot"* (Chroma, 2025, testé sur 18 modèles dont Claude Opus 4) confirme que la qualité des réponses baisse à mesure que le contexte s'allonge.
* **Conclusion pratique.** Faire lire moins, mais lire juste, donne de meilleures réponses qu'un dump complet. Le sommaire est le mécanisme le plus simple pour obtenir ça sur tes fichiers mémoire.

Un mot d'honnêteté : ne t'attends pas à un gain chiffré précis (genre "trois fois moins de texte lu"). Le gain dépend de la taille de tes fichiers et de tes requêtes. Ce qui est sûr, c'est la direction : moins de bruit, des réponses plus ciblées.

## Comment l'utiliser au quotidien

### Si tu utilises Claude Code (ou un outil en ligne de commande)

Tu lances le prompt de la Brique 3 une fois, dans le dossier de ton projet. Ton IA installe le sommaire sur tes fichiers et la règle de lecture dans ton fichier d'instructions. Ensuite, à chaque fois que tu ajoutes une section à un fichier mémoire, tu lances le petit script de mise à jour (une seule commande) pour recalculer les numéros de ligne. Le sommaire reste juste, l'IA reste rapide.

### Si tu es non-codeur (créateur, fondateur, consultant)

Tu n'as pas besoin du script. Deux options :

1. **Tu colles le sommaire à la main.** Quand tu ajoutes une grosse section à un fichier (dans Notion, un doc, un fichier texte), tu ajoutes une ligne au sommaire en tête : titre court, résumé en une phrase, et l'endroit où c'est rangé. Pour un doc Notion, le "numéro de ligne" peut devenir le nom de la section ou un lien d'ancre.
2. **Tu demandes à l'IA de régénérer le sommaire.** À la fin d'une session, tu colles le fichier dans ton assistant et tu demandes :** ** *"régénère-moi le sommaire en tête, avec un titre court, un résumé en une phrase et l'emplacement de chaque section"* . Tu recopies le résultat en haut du fichier.

Dans les deux cas, le principe est identique : un sommaire d'abord, un saut direct ensuite. Le support change, pas la logique.

## Principe extractible

<aside> 🎯

**Une IA n'a pas besoin de tout relire pour bien se souvenir. Elle a besoin d'un sommaire qui lui dit où regarder, et d'une règle qui lui dit de sauter directement au bon passage. Donne-lui la carte, pas tout le territoire à chaque fois.**

</aside>

## Checklist

* [ ] J'ai repéré mes fichiers mémoire qui dépassent 150 lignes
* [ ] J'ai collé un sommaire en tête de chaque fichier concerné (titre court + résumé en une phrase + numéro de ligne)
* [ ] J'ai ajouté la règle de lecture dans le fichier d'instructions de mon IA
* [ ] J'ai lancé le prompt de la Brique 3 pour que l'IA fasse tout automatiquement
* [ ] J'ai un moyen de mettre à jour le sommaire quand je modifie un fichier (script ou régénération à la demande)
* [ ] J'ai vérifié que mon IA lit bien le sommaire d'abord (teste : pose-lui une question et regarde si elle saute au bon passage au lieu de tout relire)

## Pour aller plus loin

* **Anthropic, ingénierie de contexte pour les agents IA** :** **[https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (la source de référence sur le chargement à la demande et le budget d'attention)
* **Documentation officielle Claude Code memory** :** **[https://docs.claude.com/en/docs/claude-code/memory](https://docs.claude.com/en/docs/claude-code/memory)(conventions actuelles des fichiers mémoire et règles)
* **Documentation officielle Claude Code setup** :** **[https://docs.claude.com/en/docs/claude-code/setup](https://docs.claude.com/en/docs/claude-code/setup) (installation, mise à jour)
* **Ressources complémentaires du Hub** :
  * *Mémoire agent : 5 registres* (RES-029) pour structurer la mémoire en plusieurs fichiers typés avant d'y poser des sommaires
  * *Mémoire IA : 3 niveaux* (RES-041) pour comprendre stockage, rappel et décision
  * *Rituel consolidation mémoire* (RES-034) pour garder ta mémoire utile dans le temps

---

Créé par @le_gouverneur_ia
