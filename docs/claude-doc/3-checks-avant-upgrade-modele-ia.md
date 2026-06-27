<aside> 🎯

Tu as clique sur OPUS. Voici ce qu'on t'a promis dans le Reel : les 3 elements a verifier avant de basculer sur un nouveau modele (Opus 4.7, Sonnet 5, GPT-5.5, Gemini 3, ou n'importe quel futur modele). Un modele puissant branche sur un projet gouverne, ca decolle. Un modele puissant branche sur un projet flou, ca crash plus vite. Cette page te donne la check-list, les prompts et les templates.

</aside>

## Pourquoi cette page existe

Chaque fois qu'un nouveau modele sort, 90% des builders se precipitent pour switcher. Basculer les agents. Relancer les projets. En esperant que la puissance va debloquer ce qui coincait avant.

Sauf qu'un modele plus puissant ne resout pas un contexte flou. Il l'amplifie plus vite. Sur une base floue, il produit du contenu flou plus vite. Sur des decisions pas tracees, il reinvente les memes mauvais choix plus vite. Sur des regles vagues, il les contourne plus vite.

**La puissance est un multiplicateur. Elle multiplie ce qui est la. Pas ce qui manque.**

Cette page te donne les 3 checks a faire AVANT de switcher. Si les 3 sont clairs, le modele amplifie ta structure. Si un seul est flou, il amplifie ton chaos.

---

<aside> ⚠️

**Tu n'as pas encore Claude Code ?** Copie ce prompt dans ton IA habituelle (Claude, ChatGPT, Gemini) :

```
Aide-moi a installer Claude Code sur mon ordinateur.
Je veux ensuite pouvoir ouvrir un terminal dans le dossier
de mon projet et taper "claude" pour demarrer une session.
Donne-moi les etapes une par une. Je n'ai jamais utilise un terminal.
```

Reviens ici apres. Doc officielle :** **[code.claude.com/docs/en/overview](http://code.claude.com/docs/en/overview)

</aside>

<aside> 💡

**Tu utilises un autre outil IA ?** Les 3 checks sont universels. Le principe "regles claires + decisions tracees + learnings actifs" ne depend d'aucun outil. Seul l'emplacement change : Codex CLI ([AGENTS.md](http://agents.md/)), Cursor (.cursor/rules/ *.mdc), Gemini CLI ([GEMINI.md](http://gemini.md/)), Copilot CLI (.github/[copilot-instructions.md](http://copilot-instructions.md/)), Windsurf (.windsurf/rules/* .md), Cline (.clinerules + memory-bank/), Aider ([CONVENTIONS.md](http://conventions.md/)). Les noms changent, la logique reste identique.

</aside>

<aside> 📖

**Tu ne codes pas ?** Les 3 checks marchent pour TOUS les projets assistes par IA. Marketing (regles = ton de marque, decisions = positionnement, learnings = ce qui convertit). Consulting (5 fichiers par client, methodologie, templates). Redaction (style obligatoire, angles refuses, formats qui performent). Deal flow (criteres GO/NO GO, raisons de pass, patterns recurrents). Ecom (workflow produit, choix de plateforme, A/B tests valides). Support : dossier local, Notion, Drive, vault Obsidian. Le support varie, le contenu reste identique.

</aside>

---

# Vue d'ensemble : les 3 checks

| #           | Check                                     | Fichier a verifier                                 | Ce que ca empeche                                            |
| ----------- | ----------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| **1** | **Regles de projet propres**        | `CLAUDE.md` a la racine                          | Empeche le modele de contourner des regles vagues plus vite  |
| **2** | **Decisions structurantes tracees** | `.claude/memory/decisions.md` ou `docs/ADR/`   | Empeche le modele de reinventer des debats deja tranches     |
| **3** | **Registres de learnings actifs**   | `.claude/memory/learnings.md` • `blockers.md` | Empeche le modele de faire refaire des erreurs deja apprises |

Ordre recommande : executer les 3 checks dans l'ordre (1 puis 2 puis 3). Chaque check prend 10 a 15 minutes avec les prompts ci-dessous. Total : 30 a 45 minutes de preparation. Une fois que c'est fait, tu peux switcher de modele en 30 secondes sans rien preparer de plus.

---

# Check 1 : Regles de projet propres ([CLAUDE.md](http://claude.md/))

## Pourquoi ce check

Le** **`CLAUDE.md` c'est le fichier que l'IA lit AVANT de toucher quoi que ce soit. Les regles specifiques sont le seul rempart contre un modele qui "interprete bien" mais fait n'importe quoi. Un modele plus puissant a plus de liberte pour interpreter. Si tes regles sont vagues, il les contourne avec plus d'assurance.

<aside> ❌

**Regles vagues (a eliminer)** : "code proprement", "suis les bonnes pratiques", "respecte le style du projet", "fais attention aux details".

</aside>

<aside> ✅

**Regles specifiques (a installer)** : "JAMAIS d'em-dash dans le contenu". "TOUJOURS du francais pour les commentaires". "Nomme les fichiers en** **[YYYY-MM-DD-titre-court.md](http://yyyy-mm-dd-titre-court.md/)". "Ne modifie jamais** **`config/production.env` sans me demander". "Limite les fonctions a 30 lignes max". Des regles qu'un modele peut appliquer sans interpreter.

</aside>

## Le prompt maitre (copier-coller dans Claude Code)

Colle ce prompt dans ta session Claude Code pour auditer et ameliorer ton** **`CLAUDE.md` actuel :

```markdown
Tu es un expert en gouvernance de projets assistes par IA.

Ton job : auditer le CLAUDE.md de ce projet et proposer une version
amelioree avec des regles SPECIFIQUES qu'un modele peut appliquer
sans interpreter.

## Reference officielle
Doc Claude Code memory : <https://code.claude.com/docs/en/memory>
Verifie la syntaxe a jour si tu as un doute. Taille recommandee :
< 200 lignes.

## Etape 1 : diagnostic

Avant d'ecrire quoi que ce soit, pose-moi ces 3 questions,
une par une, en attendant ma reponse a chaque fois :

1. Quel est le nom et la mission de ce projet en une phrase ?
2. Est-ce un projet de code (repo git) OU un projet de travail
   (marketing, consulting, recherche, redaction, ecom, strategie) ?
3. Liste les 3 erreurs les plus frequentes que ton modele actuel
   fait sur ce projet (ce que tu lui repetes a chaque session).

Attends mes reponses. Ne devine pas.

## Etape 2 : lecture du CLAUDE.md actuel

Lis mon CLAUDE.md a la racine (ou a `.claude/CLAUDE.md`).
S'il n'existe pas, dis-le et cree-en un en partant de zero.

S'il existe, identifie :
- Les regles vagues ("code proprement", "bonnes pratiques", etc.)
- Les regles qui manquent (celles qui devraient exister pour empecher
  les 3 erreurs frequentes identifiees a l'etape 1)
- Les regles qui se contredisent entre elles
- Les sections trop longues (sur-detail, redondances)
- Les sections manquantes : WHY / WHAT / HOW / REGLES / ARCHITECTURE

## Etape 3 : propose une version amelioree

Propose une version V2 du CLAUDE.md avec :
- Les 5 sections (WHY / WHAT / HOW / REGLES / ARCHITECTURE)
- Regles SPECIFIQUES, jamais vagues. Chaque regle passe le test
  "un modele peut l'appliquer sans interpreter ?". Si non, reecrire.
- Taille cible : < 200 lignes
- Format markdown propre (headers, listes, code blocks)
- Exemples concrets quand utile

Presente la V2 AVANT de modifier le fichier.

## Etape 4 : validation et mise a jour

Affiche-moi la V2 complete. Attends mon OK.
Si OK, sauvegarde l'ancien CLAUDE.md en CLAUDE.md.old et ecris
la V2.
Si pas OK, corrige selon mon feedback.

## Etape 5 : recap

En 5 lignes :
- Ce qui a ete change (V1 > V2)
- Les regles vagues remplacees par des regles specifiques
- Taille finale en lignes
- Ce qu'on ajoute eventuellement dans `.claude/rules/` (regles
  scopees a un sous-dossier si le projet est gros)
- Ton prochain check (Check 2 : decisions tracees)

Commence par l'etape 1.
```

**Ce qui va se passer** : Claude Code te pose 3 questions sur ton projet et tes erreurs frequentes, lit ton** **[CLAUDE.md](http://claude.md/)actuel, propose une V2 avec des regles specifiques qui adressent TES erreurs reelles, tu valides, il ecrit le fichier. Temps total : 10 a 15 minutes.

## Template** **[CLAUDE.md](http://claude.md/) minimal (copier si tu pars de zero)

Si tu n'as pas de** **[CLAUDE.md](http://claude.md/) du tout, utilise ce squelette comme base. Remplace les parties entre** **`[ ]` par ton contexte.

```markdown
# CLAUDE.md - [Nom du projet]

## WHY

[1-2 phrases : pourquoi ce projet existe, quel probleme il resout]

## WHAT

- **Nature** : [projet de code / projet marketing / consulting / ecom / etc.]
- **Stack** : [si code : langages, frameworks. Sinon : outils principaux]
- **Livrable** : [ce que le projet produit concretement]
- **Audience** : [qui utilise ou consomme ce que tu produis]

## HOW

### Organisation
- [Ou se trouvent les fichiers cles]
- [Convention de nommage]
- [Workflow principal]

### Outils
- [Commandes / outils a utiliser par defaut]

## REGLES NON-NEGOCIABLES

Les regles ci-dessous s'appliquent a CHAQUE session, sans exception.

- **JAMAIS** [regle specifique 1 : ex "d'em-dash dans le contenu"]
- **JAMAIS** [regle specifique 2 : ex "modifier config/production.env sans me demander"]
- **TOUJOURS** [regle specifique 3 : ex "dater les fichiers en YYYY-MM-DD"]
- **TOUJOURS** [regle specifique 4 : ex "commentaires en francais"]
- **MAX** [regle de seuil : ex "30 lignes par fonction"]

## ARCHITECTURE

- **Decision 1** : [ce qui a deja ete decide et ne se rediscute pas]
- **Decision 2** : [idem]
- **Decision 3** : [idem]

Pour les decisions detaillees voir `.claude/memory/decisions.md`.

## MEMOIRE

- Decisions structurantes : `.claude/memory/decisions.md`
- Learnings (patterns reutilisables) : `.claude/memory/learnings.md`
- Blockers (obstacles > 30 min + solutions) : `.claude/memory/blockers.md`

Au debut de chaque session, lire ces 3 fichiers pour avoir le contexte
complet du projet.
```

Taille cible : 40 a 80 lignes pour ce squelette de base. Tu l'enrichis dans le temps.

## Exemple concret (projet marketing social)

```markdown
# CLAUDE.md - Le Gouverneur IA (compte Instagram)

## WHY

Produire du contenu educatif qui eduque les builders a gouverner
leurs projets IA plutot que subir les outils.

## WHAT

- **Nature** : projet de contenu social
- **Plateformes** : Instagram (FR, Reels + carousels), X (EN)
- **Livrable** : 3-4 Reels/semaine + 1 carousel/semaine
- **Audience** : developpeurs, builders, fondateurs techniques

## HOW

### Organisation
- Scripts dans `pipeline/scripts/YYYY-MM-DD-SCR-XXX-titre.md`
- Ressources dans `pipeline/resources/`
- Index pipeline dans `docs/PIPELINE.md`

### Workflow
- Ideation > Script > Validation ig-creator > Validation naturalite
- > Cover Reel > Adaptation X > Publication

## REGLES NON-NEGOCIABLES

- **JAMAIS** d'em-dash ni double tiret dans les scripts
- **TOUJOURS** les accents francais (regle, systeme, decision)
- **JAMAIS** publier sans validation naturalite (score >= 70)
- **MAX** 3 Reels par semaine en phase 0-5K followers
- **TOUJOURS** dater les fichiers en YYYY-MM-DD
- **JAMAIS** mentionner SaaS ou projets perso dans le contenu

## ARCHITECTURE

- **Niche** : ecosysteme Anthropic (Claude Code, Claude API)
- **Ton de reference** : SCR-005 (conversationnel, pauses, vecu)
- **Format defaut** : face cam 1min+ (ecran scinde = exception)

Pour les decisions voir `.claude/memory/decisions.md`.
```

Tu vois la difference entre "code proprement" et "MAX 3 Reels par semaine en phase 0-5K followers". La deuxieme est verifiable sans interpretation.

---

# Check 2 : Decisions structurantes tracees (ADR)

## Pourquoi ce check

ADR c'est "Architectural Decision Record". L'idee : chaque choix structurant que tu prends est trace avec 5 lignes. Contexte, decision, alternatives refusees, consequences. Pas un roman. Juste ce qu'il faut pour que dans 3 mois, toi ou ton modele retrouve pourquoi tu as choisi ca.

<aside> ⚠️

 **Sans ADR** , un modele plus puissant va : reproposer le framework que tu as deja refuse il y a 2 mois. Reinventer les memes debats que tu as deja tranches. Te demander "pourquoi as-tu choisi X ?" a chaque session. Contredire des decisions d'hier avec plus d'assurance.

</aside>

<aside> ✅

 **Avec ADR** , il te dit direct "je vois que tu as choisi X en telle date pour ces raisons, on continue sur cette base ?". Zero re-briefing.

</aside>

## Le prompt maitre (copier-coller dans Claude Code)

Colle ce prompt dans ta session Claude Code pour generer ton registre de decisions a partir de l'historique de ton projet :

```markdown
Tu es un expert en gouvernance de projets assistes par IA.

Ton job : creer `.claude/memory/decisions.md` dans ce projet avec
les decisions structurantes deja prises (meme retrospectivement), au
format ADR (Architectural Decision Record).

## Reference officielle
Pattern ADR : <https://adr.github.io>
Claude Code memory : <https://code.claude.com/docs/en/memory>

## Etape 1 : diagnostic

Avant d'ecrire quoi que ce soit, pose-moi ces 3 questions,
une par une, en attendant ma reponse a chaque fois :

1. Depuis combien de temps ce projet existe (en semaines ou mois) ?
2. Cite-moi 3 choix structurants que tu as faits dans ce projet
   (exemple : choix de stack, choix de format de contenu, choix de
   framework, choix de positionnement, choix de client cible).
3. Y a-t-il des decisions que tu remets en question en ce moment ?
   Lesquelles ?

Attends mes reponses. Ne devine pas.

## Etape 2 : scan du projet

Analyse les fichiers du projet (README, CLAUDE.md, code, docs,
commits git si accessible) pour identifier d'autres decisions
implicites qui n'ont pas ete tracees mais qui sont visibles dans le
code ou la structure.

Liste-moi les decisions detectees en 1 ligne chacune.

## Etape 3 : creation du fichier

Cree `.claude/memory/decisions.md` avec le header YAML et l'index
(tableau ID / Date / Titre / Statut). Pour chaque decision
identifiee aux etapes 1 et 2, cree une entree BDR-XXX au format :

- Titre
- Date
- Statut (Active / Deprecated / Superseded)
- Contexte (2 phrases)
- Decision (1 phrase)
- Alternatives considerees (2-3 puces avec pourquoi rejetees)
- Consequences (2-3 puces : workflow change, fichier cree, regle ajoutee)

Format court : 5-10 lignes par decision, pas plus. Pas de roman.

## Etape 4 : mise a jour du CLAUDE.md

Ajoute dans mon CLAUDE.md a la racine une ligne dans la section
MEMOIRE : `- Decisions structurantes : .claude/memory/decisions.md`

Et une ligne dans HOW : `- Lire .claude/memory/decisions.md au
debut de chaque session pour connaitre les choix deja tranches.`

## Etape 5 : recap

En 5 lignes :
- Nombre de decisions tracees
- Les 3 plus importantes (IDs + titres)
- La prochaine a documenter (celle qu'on est en train de prendre)
- Ton prochain check (Check 3 : learnings actifs)

Commence par l'etape 1.
```

**Ce qui va se passer** : Claude Code te pose 3 questions sur les choix structurants de ton projet, scanne ton code et tes fichiers pour detecter d'autres decisions implicites, cree** **`.claude/memory/decisions.md` avec toutes les decisions au format ADR court, met a jour ton** **[CLAUDE.md](http://claude.md/) pour pointer vers ce fichier. Temps total : 10 a 15 minutes.

## Template ADR (5 lignes par decision)

```markdown
## BDR-XXX : [Titre court de la decision]

**Date** : YYYY-MM-DD
**Statut** : Active | Deprecated | Superseded by BDR-YYY

### Contexte
[2 phrases : situation, contrainte, declencheur]

### Decision
[1 phrase : ce qui a ete decide]

### Alternatives considerees
- **Option A** : [pourquoi rejetee]
- **Option B** : [pourquoi rejetee]

### Consequences
[Ce qui decoule : workflow change, fichier cree, regle ajoutee]
```

<aside> 💡

**Regle d'or** : si ta decision tient en plus de 10 lignes c'est que tu melanges plusieurs decisions. Separe-les.

</aside>

## Exemple concret (projet de contenu social)

```markdown
## BDR-001 : Niche ecosysteme Anthropic (pas Cursor ni Windsurf)

**Date** : 2026-03-28
**Statut** : Active

### Contexte
Je commence un compte Instagram autour de la gouvernance IA. Le
marche des outils est sature (Cursor, Windsurf, Copilot, Codex,
Cline). Je dois choisir une niche.

### Decision
Me concentrer sur l'ecosysteme Anthropic (Claude Code, Claude API,
agents Claude). Pas Cursor, pas Windsurf, pas multi-outils.

### Alternatives considerees
- **Option A : generaliste outils IA** : rejetee, pas de signature
  distinctive, concurrence forte avec des comptes deja installes
- **Option B : focus Cursor** : rejetee, marche sature, ADN moins
  aligne avec "gouvernance structurelle"
- **Option C : multi-outils comparatifs** : rejetee, dilue le
  positionnement "structurer quand Claude construit pour toi"

### Consequences
- Toute production referentielle : outils Claude Code
- Les outils concurrents sont mentionnes dans les ressources en
  "Compatibilite autres outils" mais JAMAIS en sujet principal
- Revisite dans 6 mois si 5K+ followers pour elargir
```

Tu vois : 15 lignes, tout est la. Dans 3 mois, quand quelqu'un te dit "pourquoi tu fais pas du Cursor ?", tu ouvres BDR-001 et tu sais.

---

# Check 3 : Registres de learnings actifs

## Pourquoi ce check

Les decisions c'est le "pourquoi on a choisi X". Les learnings c'est "ce qu'on a appris en avancant qui change la facon de faire". Les blockers c'est "les obstacles qui nous ont coute plus de 30 minutes + la solution".

Ces deux registres sont la vraie memoire operationnelle de ton projet. Sans eux, un modele plus puissant :

* Te propose des solutions qui contredisent celles d'hier
* Te fait refaire des erreurs deja apprises
* Te suggere des approches que tu as deja essayees sans succes
* Plus vite. Avec plus d'assurance.

Avec eux, il te dit "je vois que t'as deja teste X le 15 mars sans succes (BLK-003), on passe directement a Y".

## Le prompt maitre (copier-coller dans Claude Code)

Colle ce prompt pour initialiser tes 2 registres learnings + blockers ET installer le rituel de fermeture de session :

```markdown
Tu es un expert en gouvernance de projets assistes par IA.

Ton job : creer `.claude/memory/learnings.md` et
`.claude/memory/blockers.md` dans ce projet, puis installer un
rituel de fermeture de session en 3 questions que je pourrai
executer a chaque fin de session.

## Reference officielle
Claude Code memory : <https://code.claude.com/docs/en/memory>

## Etape 1 : diagnostic

Avant d'ecrire quoi que ce soit, pose-moi ces 3 questions,
une par une, en attendant ma reponse a chaque fois :

1. Cite-moi 2 patterns que tu as appris recemment sur ce projet
   (exemple : "les hooks a base de chiffres + metaphore simple
   performent 2x mieux que les hooks descriptifs").
2. Cite-moi 1 blocage qui t'a coute plus de 30 minutes et comment
   tu l'as resolu.
3. A quelle frequence fais-tu des sessions de travail sur ce projet
   (quotidien, 2-3 fois / semaine, hebdomadaire) ?

Attends mes reponses. Ne devine pas.

## Etape 2 : creation de learnings.md

Cree `.claude/memory/learnings.md` avec header YAML + index
(ID / Date / Pattern / Contexte) + 2 entrees LRN-XXX tirees des
patterns mentionnes a l'etape 1. Format par entree :

- Pattern observe (2 phrases max)
- Contexte (2 phrases)
- Application future (2 phrases)

## Etape 3 : creation de blockers.md

Cree `.claude/memory/blockers.md` avec header YAML + index
(ID / Date / Friction / Statut) + 1 entree BLK-XXX tiree du
blocage mentionne a l'etape 1. Format par entree :

- Friction (2 phrases)
- Cause reelle (2 phrases, creuser jusqu'a la vraie cause)
- Solution / Workaround (2 phrases)

## Etape 4 : mise a jour du CLAUDE.md

Ajoute dans mon CLAUDE.md a la racine, dans la section MEMOIRE :
- Learnings (patterns reutilisables) : `.claude/memory/learnings.md`
- Blockers (obstacles > 30 min + solutions) : `.claude/memory/blockers.md`

Et dans HOW : "Lire .claude/memory/learnings.md et blockers.md au
debut de chaque session pour ne pas refaire les memes erreurs ni
contredire les patterns deja valides."

## Etape 5 : rituel de fermeture

Cree `.claude/memory/rituel.md` avec le template suivant :

- Titre : Rituel de fermeture de session (5 min, fin de session)
- 3 questions cocheables : (1) Decide (impact 1 mois+ -> BDR-XXX),
  (2) Appris (change facon de faire -> LRN-XXX), (3) Bloque
  (> 30 min -> BLK-XXX)
- Regle d'or : tu peux tres bien repondre NON aux 3. Une session de
  routine n'a pas besoin d'entree. L'important c'est d'avoir ouvert
  le fichier et pose les 3 questions.

## Etape 6 : recap

En 5 lignes :
- Nombre de learnings crees
- Nombre de blockers crees
- Le rituel installe (rappel : 5 min en fin de session)
- Comment activer le rituel (me demander a la fin de chaque session
  "on execute le rituel de fermeture ?")
- Les 3 checks sont faits, tu peux upgrader ton modele.

Commence par l'etape 1.
```

**Ce qui va se passer** : Claude Code te pose 3 questions, cree les 2 fichiers avec les entrees reelles tirees de tes reponses, installe le rituel de fermeture, met a jour ton** **[CLAUDE.md](http://claude.md/). Temps total : 10 a 15 minutes.

## Bonus : prompt du rituel de fermeture (fin de session)

Une fois le rituel installe, colle ce prompt a la fin de chaque session pour executer le rituel en 3 minutes :

```markdown
Execute le rituel de fermeture de ma session d'aujourd'hui.

## Etape 1 : audit de la session

Relis le contexte de notre session. Identifie :
- Les decisions structurantes (poids dans 1 mois+)
- Les patterns observes (ce qui a vraiment marche)
- Les blocages qui m'ont coute plus de 30 minutes (meme resolus)

## Etape 2 : propose les entrees

Pour chacun des 3 registres (decisions, learnings, blockers),
propose-moi soit une entree formatee prete a ajouter, soit un
"rien a ajouter aujourd'hui" argumente.

## Etape 3 : validation

Affiche-moi les entrees proposees. Attends mon OK.
Si OK, ajoute-les dans les fichiers correspondants.
Si pas OK, corrige selon mon feedback.

Commence par l'etape 1.
```

## Templates bruts (copier si tu preferes faire a la main)

**`.claude/memory/learnings.md`** :

```markdown
---
registre: learnings
role: Patterns reutilisables decouverts qui changent la facon de faire
format_id: LRN-XXX (Learning Record)
frequence: A chaque pattern reellement observe
regle_or: "On capitalise les patterns qui MARCHENT, pas les idees"
---

# Learnings

## Index

| ID | Date | Pattern | Contexte |
|---|---|---|---|
| LRN-001 | YYYY-MM-DD | [Pattern en 1 ligne] | [Contexte] |

---

## LRN-XXX : [Pattern en une phrase]

**Date** : YYYY-MM-DD

### Pattern observe
[Ce qui a marche, tres concretement. 2 phrases max.]

### Contexte
[Quand c'est arrive, sur quelle tache, avec quels inputs. 2 phrases.]

### Application future
[Dans quelles conditions reutiliser ce pattern, quels signes
declencheurs. 2 phrases.]
```

**`.claude/memory/blockers.md`** :

```markdown
---
registre: blockers
role: Obstacles > 30 min + solution ou workaround
format_id: BLK-XXX (Blocker Record)
frequence: A chaque blocage > 30 min
regle_or: "Si un blocker revient 2 fois, le promouvoir en decision"
---

# Blockers

## Index

| ID | Date | Friction | Statut |
|---|---|---|---|
| BLK-001 | YYYY-MM-DD | [Friction en 1 ligne] | Resolu |

---

## BLK-XXX : [Friction en une phrase]

**Date** : YYYY-MM-DD
**Statut** : Resolu | Workaround | Ouvert

### Friction
[Le symptome concret, ce qui a coince. 2 phrases.]

### Cause reelle
[Pourquoi ca a coince, pas juste le symptome. Creuser jusqu'a la
vraie cause. 2 phrases.]

### Solution / Workaround
[Comment c'est contourne ou resolu aujourd'hui. 2 phrases.]
```

**`.claude/memory/rituel.md`** :

```markdown
# Rituel de fermeture de session (5 min, fin de session)

3 questions a te poser avant de fermer Claude Code :

[ ] 1. Decide
    Qu'est-ce que j'ai decide aujourd'hui qui aura encore de
    l'importance dans 1 mois ?
    -> Si oui, ajouter une entree dans decisions.md (BDR-XXX)

[ ] 2. Appris
    Qu'est-ce que j'ai observe qui change ma facon de faire ?
    -> Si oui, ajouter une entree dans learnings.md (LRN-XXX)

[ ] 3. Bloque
    Qu'est-ce qui m'a coute plus de 30 minutes aujourd'hui
    (meme si resolu) ?
    -> Si oui, ajouter une entree dans blockers.md (BLK-XXX)

Regle d'or : tu peux tres bien repondre NON aux 3 questions.
Une session de routine n'a pas besoin d'entree. Ce qui compte c'est
d'avoir ouvert le fichier et pose les 3 questions.
```

---

# Checklist 30 minutes : les 3 checks bouclees

Pour valider que tu es pret a switcher sur n'importe quel nouveau modele, coche 6 cases.

* [ ]** ** **Minute 0 a 5** : Prompt Check 1 colle dans Claude Code. 3 questions repondues.
* [ ]** ** **Minute 5 a 15** :** **`CLAUDE.md` V2 valide et ecrit a la racine. Regles specifiques. < 200 lignes.
* [ ]** ** **Minute 15 a 20** : Prompt Check 2 colle dans Claude Code. Decisions structurantes listees.
* [ ]** ** **Minute 20 a 25** :** **`.claude/memory/decisions.md` cree avec les ADR au format court.
* [ ]** ** **Minute 25 a 28** : Prompt Check 3 colle dans Claude Code. Learnings + blockers crees.
* [ ]** ** **Minute 28 a 30** :** **`rituel.md` en place. 3 questions epinglees quelque part (post-it, Notion, ou le fichier lui-meme).

Si tu as utilise les 3 prompts maitres dans l'ordre, les 6 cases sont cochees en 30 minutes. Si tu as fait a la main, prevois 45-60 minutes.

---

# Point de verification : les 3 questions

Tu peux upgrader sur n'importe quel nouveau modele si tu reponds OUI aux 3 questions suivantes.

<aside> 1️⃣

**Est-ce qu'un nouveau modele qui lit ton** **`CLAUDE.md` peut respecter tes regles sans rien interpreter ?**

Si oui, Check 1 est valide. Si non, retourne sur Check 1 : tes regles sont encore vagues.

</aside>

<aside> 2️⃣

**Si un modele te propose un framework / approche / choix, peux-tu verifier en 30 secondes si tu as deja decide sur cette question ?**

Si oui, Check 2 est valide. Si non, retourne sur Check 2 : ton** **`decisions.md` est vide ou incomplet.

</aside>

<aside> 3️⃣

**Si un modele te propose une solution a un probleme, peux-tu verifier en 30 secondes si tu as deja essaye sans succes (blockers) ou deja valide un pattern (learnings) ?**

Si oui, Check 3 est valide. Si non, retourne sur Check 3 : tes registres sont vides ou inactifs.

</aside>

<aside> 🎯

**Les 3 OUI** : ton projet a une doctrine. Tu peux installer Opus 4.7 (ou Sonnet 5, ou GPT-5.5, ou Gemini 3 Ultra). Le modele va amplifier ta structure.

**1 ou plusieurs NON** : ne switch pas encore. La puissance est un multiplicateur. Sans la structure, tu amplifies ton chaos.

</aside>

---

# Un mot sur Opus 4.7 (le vehicule du Reel)

Opus 4.7 est disponible depuis le 2026-04-16. Les chiffres :

* **87.6% sur SWE-bench Verified** (+6.8 points vs Opus 4.6)
* **64.3% sur SWE-bench Pro** (+10.9 points)
* **Pricing** : $5 / $25 M tokens (input / output)
* **Nouveau mode** : "xhigh effort" disponible
* **Plateformes** : Claude plans + Bedrock + Vertex AI + Microsoft Foundry

Modele le plus puissant de l'histoire Anthropic sur les benchmarks publics.

Le Reel t'a dit : Opus 4.7 est genuinement puissant. Le probleme c'est pas le modele, c'est l'ordre des choses. Doctrine d'abord, modele ensuite pour amplifier.

Cette page t'a donne la doctrine. Une fois que tes 3 checks passent, installe Opus 4.7 (ou n'importe quel autre modele) sans hesiter. Tu es pret.

**Reference officielle** :** **[anthropic.com/news](http://anthropic.com/news) (chercher "Opus 4.7" sur leur blog).

---

# Pour aller plus loin

Cette page couvre la base :** **[CLAUDE.md](http://claude.md/) + decisions + learnings + blockers + rituel. C'est suffisant pour 95% des projets.

Si tu veux aller plus loin :

* **Ressource MEMOIRE** (cross-promo) : la stack complete avec 5 registres (decisions, learnings, blockers, journal, evals) + rituel detaille + guide pour ouvrir ton** **`.claude/memory/` dans Obsidian en 2 clics pour avoir un graph view humain. Tape** **`MEMOIRE` en commentaire sur le Reel dedie.
* **Ressource STRUCTURE** (cross-promo) : les 3 types de fichiers pour structurer un projet IA de zero (constitution + agents + memoire) avec 5 prompts maitres. Tape** **`STRUCTURE` en commentaire.
* **Doc officielle Claude Code memoire** :** **[code.claude.com/docs/en/memory](http://code.claude.com/docs/en/memory)
* **Pattern ADR (reference communaute)** :** **[adr.github.io](http://adr.github.io/)
* **Doc officielle Claude Code sub-agents** :** **[code.claude.com/docs/en/sub-agents](http://code.claude.com/docs/en/sub-agents)

---

[Cree par @le_gouverneur_ia](https://www.instagram.com/le_gouverneur_ia/)
