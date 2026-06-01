<aside>
🎯 Tu as cliqué sur MEMOIRE. Voici exactement ce qu'on t'a promis dans le Reel : les 5 registres à poser dans .claude/memory/, le rituel de fermeture en 3 questions, et le guide pour ouvrir le MÊME dossier dans Obsidian en 2 clics. Tout est gratuit. Fais-en bon usage.

</aside>

## Pourquoi cette page existe

Le Reel t'a montré le cadrage : un outil amplifie ce qui existe, il ne crée jamais la structure. Obsidian n'est pas le problème, c'est l'ordre qui est faux chez 95% des gens.

Cette page te donne la bonne séquence : (1) Construire la doctrine avec 5 registres dans .claude/memory/ + le rituel de fermeture. (2) Ouvrir le MÊME dossier dans Obsidian pour avoir le graph view, les backlinks, le canvas.

À la fin, ton projet a une vraie infrastructure mémoire. Pas une pile de notes. Une gouvernance.

---

<aside>
⚠️ Tu n'as pas encore Claude Code ? Copie ce prompt dans ton IA habituelle (Claude, ChatGPT, Gemini) : « Aide-moi à installer Claude Code sur mon ordinateur. Donne-moi les étapes une par une. Je n'ai jamais utilisé un terminal. » Reviens ici après. Doc officielle : docs.claude.com/en/docs/claude-code/overview

</aside>

<aside>
💡 Tu utilises un autre outil IA (Cursor, Gemini CLI, Copilot, Windsurf, ChatGPT) ? Les 5 registres sont universels. Seul l'emplacement change (.cursor/rules/, racine + GEMINI.md, .github/instructions/). Obsidian marche pareil quel que soit ton outil IA.

</aside>

<aside>
📖 Tu ne codes pas ? Les 5 registres marchent pour TOUS les projets assistés par IA : marketing (décisions = positionnement, learnings = ce qui convertit), consulting (5 fichiers par client), recherche, deal flow. Le support varie (Notion, Drive, dossier local, vault Obsidian), le contenu reste identique.

</aside>

---

# Partie 1 - Les 5 registres .claude/memory/

## Le prompt maître (copier-coller dans Claude Code)

Colle ce prompt dans ta session Claude Code. Il te pose 3 questions sur ton projet, puis crée le dossier .claude/memory/ avec les 5 fichiers adaptés (avec entrées exemples tirées de TON projet), met à jour ton CLAUDE.md, et te donne le rituel de fermeture. 5 à 10 minutes.

```markdown
Tu es un expert en gouvernance de projets assistés par IA.

Ton job : installer dans ce projet les 5 registres standards
de la mémoire agent, dans un dossier `.claude/memory/`.
À la fin, mon projet a une vraie infrastructure mémoire
que tu peux lire à chaque session au démarrage.

## Référence officielle
Doc Claude Code mémoire : https://docs.claude.com/en/docs/claude-code/memory
Vérifie la syntaxe à jour si tu as un doute.

## Étape 1 : diagnostic

Avant d'écrire quoi que ce soit, pose-moi ces 3 questions,
une par une, en attendant ma réponse à chaque fois :

1. Quel est le nom et la mission de ce projet en une phrase ?
2. Est-ce un projet de code (repo git) OU un projet de travail
   (marketing, consulting, recherche, rédaction, stratégie) ?
3. As-tu déjà un dossier `.claude/memory/` existant que je dois
   respecter, ou je pars de zéro ?

Attends mes réponses. Ne devine pas.

## Étape 2 : création des 5 registres

Crée le dossier `.claude/memory/` et les 5 fichiers suivants.
Chaque fichier doit avoir :
- Un header YAML avec le schéma du registre
- Une section d'index (tableau)
- 1 ou 2 entrées-exemples adaptées à MON projet
  (tirées de ce que tu as appris dans l'étape 1)

1. `decisions.md` - ID BDR-XXX, date, titre, décision, pourquoi,
   alternatives considérées, statut.
2. `learnings.md` - ID LRN-XXX, date, pattern observé, contexte,
   application future.
3. `blockers.md` - ID BLK-XXX, date, friction, cause réelle,
   solution, statut (résolu/ouvert).
4. `journal.md` - entrée par date, 3 à 5 lignes max par session.
5. `evals.md` - ID EVAL-XXX, date, output, méthode eval, anomalies,
   action (keep / correct / deprecate).

## Étape 3 : mise à jour du CLAUDE.md

Ajoute dans mon CLAUDE.md à la racine une section qui dit :
- Le dossier .claude/memory/ contient 5 registres
- Au début de chaque session, lire les 5 registres
- Règle de capitalisation par type (décisions, learnings, blockers)

## Étape 4 : vérification

Pour chaque fichier créé, confirme :
- Chemin exact (.claude/memory/[nom].md)
- Header YAML valide
- Index (tableau) prêt
- Au moins 1 entrée exemple réelle (pas 'TODO')
- Accents français corrects

## Étape 5 : récap final

En 5 lignes max :
- Ce qui a été créé
- Comment lancer ta prochaine session (lire .claude/memory/)
- Quand mettre à jour chaque registre
- Le rituel de fermeture (3 questions : décide, appris, bloqué)

C'est parti. Commence par l'étape 1.
```

---

# Partie 2 - Le rituel de fermeture (5 min, fin de session)

La structure sans rituel, c'est des fichiers vides qui vieillissent. Le rituel est ce qui fait respirer la structure.

## Les 3 questions (template papier, à épingler)

```
[ ] Décide
    Qu'est-ce que j'ai décidé aujourd'hui qui aura encore de
    l'importance dans 1 mois ?
    -> Si oui, ajouter une entrée dans decisions.md (BDR-XXX)

[ ] Appris
    Qu'est-ce que j'ai observé qui change ma façon de faire ?
    -> Si oui, ajouter une entrée dans learnings.md (LRN-XXX)

[ ] Bloqué
    Qu'est-ce qui m'a coûté plus de 30 minutes aujourd'hui ?
    -> Si oui, ajouter une entrée dans blockers.md (BLK-XXX)

+ Toujours : ajouter la date du jour dans journal.md avec
  3 à 5 lignes factuelles.
```

<aside>
💡 Règle d'or : tu peux très bien répondre NON à décide/appris/bloqué. Une session de routine n'a pas besoin de BDR. Ce qui est obligatoire, c'est la ligne dans journal.md. Ça prouve que tu as ouvert le fichier et que tu l'as fait vivre.

</aside>

## Le prompt du rituel (copier-coller en fin de session)

Claude Code scanne ta session, te propose des entrées formatées pour chaque registre, tu valides, il ajoute dans les fichiers. 3 à 5 minutes.

```markdown
Tu vas m'aider à exécuter le rituel de fermeture de session.
Ça prend 5 minutes. 3 questions.

## Étape 1 : audit de ma session

Relis le contexte de notre session d'aujourd'hui. Identifie :
- Les décisions structurantes (celles qui auront encore du poids
  dans 1 mois)
- Les patterns observés (ce qui a vraiment marché, ce qui a changé
  ma façon de faire)
- Les blocages qui m'ont coûté plus de 30 minutes (même si on les
  a résolus)

## Étape 2 : propose les entrées

Pour chacun des 3 registres (decisions.md, learnings.md,
blockers.md), propose-moi :
- Soit une entrée formatée prête à ajouter
- Soit un 'rien à ajouter aujourd'hui' argumenté

Format proposé pour chaque entrée :
- ID (BDR-XXX / LRN-XXX / BLK-XXX, incrémenté par rapport
  au dernier déjà dans le fichier)
- Titre
- Contenu complet selon le template du registre

Pose-moi UNE question si tu hésites sur quelque chose.

## Étape 3 : journal.md (obligatoire)

Génère SYSTÉMATIQUEMENT une entrée pour journal.md avec :
- La date du jour
- 3 à 5 lignes factuelles (ce qui a été fait, les BDR/LRN/BLK
  générés, prochaine étape)

## Étape 4 : validation

Affiche-moi les entrées proposées. Attends mon OK.
Si OK, ajoute-les dans les fichiers correspondants.
Si pas OK, corrige selon mon feedback.

## Étape 5 : récap

En 3 lignes :
- Ce qui a été ajouté aujourd'hui
- Les 3 entrées les plus importantes de la semaine
- Alerte si un registre n'a rien reçu depuis plus de 2 semaines

Commence par l'étape 1.
```

---

# Partie 3 - Ouvrir le MÊME dossier dans Obsidian en 2 clics

Maintenant que ta doctrine existe (5 registres + rituel), Obsidian devient puissant. Ce dossier .claude/memory/ c'est du markdown plat dans des dossiers. Un dossier bien structuré est déjà un vault Obsidian valide. Rien à convertir.

## Les 2 clics

1. Installe Obsidian (gratuit, Mac/Windows/Linux) : obsidian.md
2. Clic 1 : lance Obsidian, clique sur 'Open folder as vault' sur l'écran d'accueil
3. Clic 2 : navigue jusqu'au dossier .claude/memory/ de ton projet. Sélectionne-le. Valide.

C'est fini. Obsidian ouvre ton dossier comme un vault, sans rien modifier. Tes fichiers restent au même endroit, lus par ton agent IA ET visualisés par toi.

## Les 3 vues qui amplifient

### 1. Graph view (Cmd+G sur Mac / Ctrl+G sur Windows)

Tu vois tes 5 registres comme des nœuds. Les liens inter-fichiers (quand tu mentionnes un BDR-XXX dans un LRN-XXX via la syntaxe [[BDR-001]]) apparaissent comme des arêtes. Au début tu as 5 nœuds isolés. Au bout d'un mois, tu as une carte vivante de ta gouvernance.

### 2. Backlinks panel (clic droit sur un onglet > 'Backlinks')

Quand tu es dans learnings.md et que tu regardes LRN-005, le panel te montre TOUTES les décisions (BDR-XXX) et blockers (BLK-XXX) qui référencent ce learning. Tu vois le réseau sans cliquer partout.

### 3. Canvas (Cmd+N > New canvas)

Pour mapper des patterns émergents : prends 5 à 10 BDR / LRN / BLK liés, dépose-les dans un canvas, relie-les à la main. Tu obtiens une carte mentale qui rend visible ce que les fichiers gardent en texte.

<aside>
💡 Pattern avancé : dans tes 5 fichiers, utilise la syntaxe Obsidian [[ID]] pour les références. Exemple : 'Généré suite à [[BLK-001]]'. Obsidian crée automatiquement les backlinks. Claude Code lit toujours le markdown normalement (les [[XXX]] sont juste des chaînes de texte). Tu gagnes la navigation visuelle SANS rien perdre côté agent.

</aside>

---

## Checklist 30 minutes

- [ ] Minute 0-3 : dossier .claude/memory/ créé à la racine du projet
- [ ] Minute 3-8 : decisions.md avec header YAML + index + 1 entrée BDR réelle
- [ ] Minute 8-12 : learnings.md avec header YAML + index + 1 entrée LRN réelle
- [ ] Minute 12-16 : blockers.md avec header YAML + index + 1 entrée BLK
- [ ] Minute 16-20 : journal.md avec entrée du jour + template
- [ ] Minute 20-24 : evals.md avec 1 entrée EVAL initiale + template
- [ ] Minute 24-27 : CLAUDE.md mis à jour pour référencer le dossier mémoire au démarrage
- [ ] Minute 27-30 : Obsidian ouvert sur le dossier .claude/memory/ + graph view activé

---

## Doc officielle (point de vérification)

- Claude Code mémoire : docs.claude.com/en/docs/claude-code/memory
- Obsidian vaults : help.obsidian.md/vaults
- Obsidian graph view : help.obsidian.md/plugins/graph-view

---

Créé par @le_gouverneur_ia
