> Tu as clique sur SUPERPOWERS. Voici exactement ce qu'on t'a promis dans le Reel : les 3 fichiers de doctrine a installer dans ton projet pour que ton framework agentique (Superpowers, gstack, LangGraph, CrewAI, ou pas de framework du tout) ne perde pas ta memoire entre les sessions. Un seul prompt a coller, 3 fichiers crees, 30 minutes total. Tout est gratuit. Fais-en bon usage.

---

## Prerequis

<aside> ⚠️

**Tu n'as pas encore Claude Code ?**

Copie ce prompt dans ton IA (Claude, ChatGPT, Gemini) :

```
Aide-moi a installer Claude Code sur mon ordinateur.
Je veux ensuite pouvoir ouvrir un terminal dans le dossier
de mon projet et taper "claude" pour demarrer une session.
Donne-moi les etapes une par une.
Je n'ai jamais utilise un terminal.
```

Ton IA va te guider pas a pas. Reviens ici apres.

Doc officielle :** **[code.claude.com/docs/en/overview](http://code.claude.com/docs/en/overview)

</aside>

<aside> ✅

**Tu as deja Claude Code ?** Continue.

</aside>

---

## Compatibilite autres outils

<aside> 💡

**Tu utilises un autre outil que Claude Code ?**

Les 3 fichiers de cette page sont universels. Le principe "decisions tracees + audit hebdo + rituel close-out" ne depend d'aucun outil IA. Seul l'emplacement des fichiers et la syntaxe de l'agent auditeur changent.

* **Cursor** :** **`.cursor/rules/decisions.mdc` et** **`learnings.mdc` avec** **`alwaysApply: true`. L'agent auditeur devient un prompt sauvegarde dans Cursor Notepads.
* **Gemini CLI** :** **`GEMINI.md` a la racine pointe vers** **`decisions.md` et** **`learnings.md`. L'agent auditeur via** **`.gemini/agents/auditor.md`.
* **Codex CLI / Copilot CLI** :** **`AGENTS.md` ou** **`.github/copilot-instructions.md` referencent les 2 fichiers.
* **Cline** :** **`.clinerules/decisions.md` +** **`.clinerules/learnings.md`.
* **Windsurf** :** **`.windsurf/rules/decisions.md` +** **`learnings.md`.
* **Aider** :** **`decisions.md` et** **`learnings.md` charges via** **`--read`.
* **Sans framework agentique du tout** : les 3 fichiers fonctionnent. Tu colles juste les prompts directement dans Claude Code.

Les noms de dossiers changent, la logique reste identique.

</aside>

---

## Tu ne codes pas ? Lis ceci

<aside> 📖

**"Ca me parle pas, je ne code pas."**

Faux. Les 3 fichiers marchent pour TOUS les projets assistes par IA, pas juste le code.

* **Marketing** :** **`decisions.md` = pourquoi tu as choisi ce positionnement, ce canal, cette offre. Audit hebdo = un agent qui detecte si ton dernier brief contredit une regle de marque tranchee il y a 2 mois. Close-out = 5 min vendredi pour capitaliser ce qui a converti cette semaine.
* **Consulting** :** **`decisions.md` par client. Audit hebdo = agent qui relit les 5 derniers livrables et signale les contradictions methodologiques. Close-out = 5 min apres chaque session client.
* **Redaction / recherche** :** **`decisions.md` = angles refuses, sources rejetees, structure obligatoire. Audit hebdo = agent qui relit tes 5 derniers articles et detecte si tu derives sur le ton.
* **Deal flow / invest** :** **`decisions.md` = pourquoi tu as passe, pourquoi tu as invest. Audit hebdo = agent qui relit les 10 derniers passes.
* **Formation / cours** :** **`decisions.md` = pedagogie choisie, niveau cible, exclusions. Audit hebdo = agent qui relit tes derniers modules.

Tu peux garder tes fichiers dans un dossier local, dans Notion avec 2 sous-pages, dans Drive avec 2 docs, ou dans un vault Obsidian.

</aside>

---

# Pourquoi cette page existe

Les frameworks agentiques (Superpowers, gstack, BMAD, LangGraph, CrewAI, AutoGen) sont concus pour structurer le PROCESS : comment l'agent decoupe les taches, comment il fait du TDD, comment il delegue a des sub-agents, comment il review ses propres outputs. C'est leur job. Ils le font bien.

Mais ils ne tracent PAS le PRODUIT de tes sessions. Le pourquoi de tes choix structurants. Les patterns que tu as appris la semaine derniere. Les blocages qui ont coute 2 heures et leur solution. Cette memoire-la, c'est a TOI de la poser, par-dessus le framework.

Sans cette doctrine, ton framework agentique te fait gagner du temps sur la session courante, mais te fait perdre du temps sur le projet long terme. Chaque nouvelle session redecouvre les memes debats, retombe dans les memes pieges, contredit des choix d'hier avec plus d'assurance.

Avec cette doctrine, tu poses 3 fichiers une fois pour toutes. Le framework agentique tourne par-dessus, tes decisions sont tracees, ton audit hebdo detecte les derives, ton rituel close-out capitalise ce qui change. Tu sors du chaos sans renoncer a la puissance.

Cette page te donne le prompt unique qui cree les 3 fichiers en une seule passe. 30 minutes. Pas plus.

---

# Vue d'ensemble : les 3 elements de doctrine

| #           | Element                                | Fichier ou agent              | Ce que ca empeche                                                        | **1** | **Registre de decisions**       | `.claude/memory/decisions.md`               | Empeche de reinventer les memes debats dans 3 mois        |
| ----------- | -------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| **2** | **Protocole d'audit long terme** | `.claude/agents/auditor.md` | Empeche la derive invisible entre tes choix d'hier et ceux d'aujourd'hui | **3** | **Rituel de session close-out** | `.claude/memory/learnings.md`• 3 questions | Empeche de perdre les patterns appris en cours de session |

Ordre recommande : utiliser le prompt unique ci-dessous qui installe les 3 elements en une seule passe. Temps total : 30 minutes (10 min de Q/R diagnostic, 15 min de creation, 5 min de validation).

---

# Le prompt unique a coller dans Claude Code

Copie-colle ce prompt dans ta session Claude Code. Il va te poser 3 questions, puis creer les 3 fichiers (decisions, agent auditeur, learnings + rituel) avec des entrees-exemples adaptees a TON projet, et te livrer un script bash optionnel pour lancer l'audit hebdo en une commande.

```
Tu es un expert en gouvernance de projets assistes par IA.

Ton job : installer dans ce projet la doctrine minimale qui se pose
PAR-DESSUS un framework agentique (Superpowers, gstack, LangGraph,
CrewAI, ou pas de framework du tout).

Tu vas creer 3 elements :
1. Le registre de decisions (.claude/memory/decisions.md)
2. L'agent auditeur (.claude/agents/auditor.md)
3. Le rituel close-out + le registre learnings (.claude/memory/learnings.md
   + .claude/memory/rituel.md)

Plus en bonus, un script bash optionnel (audit-weekly.sh) pour lancer
l'audit hebdo en une commande.

## Reference officielle
Doc Claude Code memory : <https://code.claude.com/docs/en/memory>
Doc Claude Code sub-agents : <https://code.claude.com/docs/en/sub-agents>
Pattern ADR (decisions) : <https://adr.github.io>

## Etape 1 : diagnostic

Avant d'ecrire quoi que ce soit, pose-moi ces 3 questions, une par
une, en attendant ma reponse a chaque fois :

1. Quel est le nom et la mission de ce projet en une phrase ?
2. Est-ce un projet de code (repo git) OU un projet de travail
   (marketing, consulting, recherche, redaction, formation, deal flow,
   ecom, strategie) ?
3. Cite-moi 2 choix structurants deja faits sur ce projet.

Attends mes reponses. Ne devine pas.

## Etape 2 : creation de .claude/memory/decisions.md

Cree le dossier .claude/memory/ si besoin, puis le fichier decisions.md
avec un header YAML (registre, role, format_id DEC-XXX, regle_or 5 lignes
par decision), un index tableau (ID/Date/Titre/Statut), DEC-001 et
DEC-002 remplies avec les 2 choix structurants donnes a l'etape 1
(Contexte 2 phrases / Decision 1 phrase / Alternatives refusees 2-3
puces / Why long terme), plus un template entree vide.

## Etape 3 : creation de .claude/agents/auditor.md

Cree le dossier .claude/agents/ si besoin, puis le fichier auditor.md
avec frontmatter Claude Code (name: auditor, description, tools: Read
Grep Glob Bash) et le prompt complet de l'agent : mission (4 verifications
au format DEC-XXX/LRN-XXX/derive/dette), process en 4 etapes (lecture
contexte, scan recent via git log 7 jours, croisement, rapport au format
structure VERT/JAUNE/ROUGE), regles (factuel, ne modifie aucun fichier).

## Etape 4 : creation de .claude/memory/learnings.md

Cree le fichier learnings.md avec header YAML (format_id LRN-XXX), index
tableau, LRN-001 a partir d'un pattern reel observe en discutant a
l'etape 1 (Pattern observe / Contexte / Application future, 2 phrases
chacun), plus template entree vide.

## Etape 5 : creation de .claude/memory/rituel.md

Cree le fichier rituel.md avec les 3 questions cocheables : (1) Qu'est-ce
que j'ai appris ? -> LRN-XXX, (2) Qu'est-ce qui m'a bloque ? -> noter
dans learnings.md, (3) Quelle solution a marche ? -> DEC-XXX. Regle d'or :
tu peux repondre NON aux 3.

## Etape 6 : bonus optionnel - script bash audit-weekly.sh

Si projet de code (repo git), cree audit-weekly.sh a la racine qui lance
l'agent auditeur via `claude --agent auditor` et redirige vers
.claude/memory/audits/audit-YYYY-MM-DD.md. Rends-le executable.

## Etape 7 : mise a jour du CLAUDE.md

Ajoute dans le CLAUDE.md une section DOCTRINE PROJET qui pointe vers les
3 fichiers et l'agent. Ajoute la regle : "Au debut de chaque session,
lire decisions.md et learnings.md. A la fin de chaque session, executer
le rituel. Vendredi matin, lancer l'agent auditeur."

## Etape 8 : recap final

En 7 lignes max : fichiers crees avec chemins exacts, DEC-001 et DEC-002
rappelees par titres, LRN-001 (rempli ou vide), commande pour lancer
l'audit hebdo, commande pour le rituel close-out, quand mettre a jour
decisions.md vs learnings.md, mon premier geste a faire MAINTENANT
(idealement tester l'agent auditeur).

C'est parti. Commence par l'etape 1.
```

**Ce qui va se passer** : Claude Code te pose 3 questions sur ton projet, cree les 3 fichiers (decisions, agent auditeur, learnings), cree le rituel, met a jour ton** **[CLAUDE.md](http://claude.md/), et te donne optionnellement un script bash pour lancer l'audit hebdo en une commande. Temps total : 30 minutes (10 min Q/R, 15 min creation, 5 min validation).

---

# Mode d'emploi semaine type

## Quand prendre une decision structurante

Pendant une session, des que tu fais un choix qui aura encore du poids dans 1 mois (choix de stack, de positionnement, de framework, de client, de format), tu ouvres** **`decisions.md` et tu ajoutes une entree DEC-XXX en 5 lignes. Pas un roman. Si tu mets plus de 10 lignes c'est que tu melanges plusieurs decisions, separe-les.

## Vendredi matin : lancer l'agent auditeur

Une fois par semaine, idealement le vendredi matin, tu lances l'agent auditeur en une commande :** **`./audit-weekly.sh` ou en debut de session Claude Code :** **`Active l'agent auditor et lance l'audit hebdo de ce projet.`

L'agent va :

1. Lire** **`decisions.md`,** **`learnings.md`,** **`CLAUDE.md`
2. Scanner ce qui a ete produit / modifie dans les 7 derniers jours (git log si code, ou te demander de lister les livrables sinon)
3. Croiser le recent vs la doctrine
4. Te livrer un rapport structure avec un score global VERT / JAUNE / ROUGE

Le rapport est sauve dans** **`.claude/memory/audits/audit-YYYY-MM-DD.md`. Tu le lis en 5 min, tu corriges les derives signalees, tu ajoutes les decisions ou learnings que l'agent a suggeres si pertinent.

## Fin de chaque session : le rituel close-out

5 minutes avant de fermer ta session Claude Code, tu ouvres** **`rituel.md` et tu te poses les 3 questions :

1. **Qu'est-ce que j'ai appris ?** Si pattern utile -> entree LRN-XXX dans** **[learnings.md](http://learnings.md/)
2. **Qu'est-ce qui m'a bloque ?** Si > 30 min -> noter dans** **[learnings.md](http://learnings.md/) avec le contournement
3. **Quelle solution a marche ?** Si decision durable -> entree DEC-XXX dans** **[decisions.md](http://decisions.md/)

Tu peux tres bien repondre NON aux 3 questions. Une session de routine n'a pas besoin d'entree. Ce qui compte c'est le geste, pas le contenu force.

---

# FAQ

## Et si j'utilise pas Superpowers ?

Cette page s'applique IDENTIQUEMENT. Le principe "doctrine par-dessus le framework" est universel. Tu peux remplacer "Superpowers" par n'importe lequel de ces frameworks et tout ce qui est dans cette page reste valide : gstack, LangGraph, CrewAI, AutoGen, BMAD-METHOD, ou aucun framework. Le seul element qui change : la commande pour lancer l'agent auditeur.

## Et si mon projet est tout petit (juste moi, 1 mois d'existence) ?

Encore plus de raison de poser ces 3 fichiers MAINTENANT. C'est dans les 3 premiers mois que tu prends 80% des decisions structurantes que tu vas re-questionner pendant 2 ans. Tracer DEC-001 a DEC-005 quand tu commences = 30 min d'investissement, gain enorme dans 6 mois.

## L'agent auditeur va modifier mes fichiers sans me demander ?

Non. La regle dans** **`auditor.md` dit : "Tu ne modifies AUCUN fichier. Tu produis un rapport, point." Si Claude Code propose une modif, c'est pour ton OK. Tu valides ou tu refuses. Pas d'auto-edit.

## Combien de temps avant que je voie le ROI ?

* **Semaine 1-2** : tu sens deja moins de re-briefing en debut de session. L'agent te rappelle les decisions tranchees.
* **Mois 1** : tu evite 2-3 debats deja tranches que tu allais reouvrir. L'agent auditeur te signale 1-2 derives invisibles.
* **Mois 3** : tu peux relire** **`decisions.md` en 10 min et reconstituer toute l'histoire structurante du projet.
* **Mois 6+** : tu peux switcher de modele (Sonnet 5, Opus 5, Gemini 3) en 30 secondes parce que la doctrine est posee.

## Pourquoi pas mettre tout dans un seul fichier** **[MEMORY.md](http://memory.md/) ?

Parce que les 3 fichiers ont des frequences de mise a jour differentes :** **`decisions.md` (1-2 entrees / semaine),** **`learnings.md` (1-3 entrees / semaine),** **`auditor.md` (presque jamais modifie une fois cree). Et l'agent auditeur a besoin de LIRE distinctement ces 3 sources pour faire son travail. Un seul fichier melange = audit moins precis.

---

# Checklist : 30 minutes pour poser la doctrine

Pour valider que les 3 elements sont en place, coche 7 cases.

* [ ]** ** **Minute 0 a 3** : prompt unique copie-colle dans Claude Code.
* [ ]** ** **Minute 3 a 13** : 3 questions diagnostic repondues.
* [ ]** ** **Minute 13 a 20** :** **`.claude/memory/decisions.md` cree avec DEC-001 et DEC-002 reels.
* [ ]** ** **Minute 20 a 25** :** **`.claude/agents/auditor.md` cree avec son prompt complet.
* [ ]** ** **Minute 25 a 28** :** **`.claude/memory/learnings.md` cree (LRN-001 rempli ou en attente).
* [ ]** ** **Minute 28 a 30** :** **`.claude/memory/rituel.md` cree,** **`CLAUDE.md` mis a jour.
* [ ]** ** **Bonus** :** **`audit-weekly.sh` cree et rendu executable (si projet de code).

Si tu as utilise le prompt unique, les 7 cases sont cochees en 30 minutes.

---

# Pour aller plus loin

Cette page couvre la base : decisions + agent auditeur + rituel close-out. C'est suffisant pour 95% des projets, qu'ils utilisent Superpowers, gstack, LangGraph, CrewAI, ou aucun framework.

Si tu veux aller plus loin :

* **Ressource MEMOIRE** : la stack complete avec 5 registres + guide Obsidian. Tape** **`MEMOIRE` en commentaire sur le compte.
* **Ressource OPUS** : les 3 checks a faire avant d'upgrader sur un nouveau modele IA. Tape** **`OPUS` en commentaire.
* **Doc officielle Superpowers** :** **[github.com/obra/superpowers](http://github.com/obra/superpowers)
* **Doc officielle Claude Code memory** :** **[code.claude.com/docs/en/memory](http://code.claude.com/docs/en/memory)
* **Doc officielle Claude Code sub-agents** :** **[code.claude.com/docs/en/sub-agents](http://code.claude.com/docs/en/sub-agents)
* **Pattern ADR (reference communaute)** :** **[adr.github.io](http://adr.github.io/)

---

## Un mot sur Superpowers (le vehicule du Reel)

Superpowers (par Jesse Vincent / obra sur GitHub) est un framework agentique MIT cree fin 2025, qui a explose en 2026 (150K+ stars en avril 2026). Il s'integre nativement a Claude Code via le marketplace officiel Anthropic depuis le 15 janvier 2026, et fonctionne aussi avec Cursor, Codex CLI, Gemini CLI, OpenCode et Goose.

Ce qu'il fait bien : enforcer un workflow rigide (brainstorm > git worktree > micro-task plan > execution par sub-agents avec verification a chaque etape). Vraie discipline TDD, principes YAGNI et DRY. Il transforme Claude Code en "senior AI developer" structure.

Ce qu'il ne fait pas (et qu'aucun framework agentique ne fait) : tracer la doctrine de TON projet. Le pourquoi de TES choix structurants. Les patterns que TU as appris la semaine derniere. C'est ca que cette page t'aide a poser, par-dessus.

Le Reel t'a dit : Superpowers contraint le process, pas le produit. Cette page t'a donne les 3 fichiers a poser pour le produit. Une fois en place, tu peux installer Superpowers (ou n'importe quel autre framework) sans hesiter. Le framework gere le process, ta doctrine gere le produit. Les deux ensemble = systeme complet.

---

Cree par** **[@le_gouverneur_ia](https://www.instagram.com/le_gouverneur_ia/)

Si cette page t'a debloque quelque chose, partage tes propres DEC-XXX en commentaire sous le Reel.
