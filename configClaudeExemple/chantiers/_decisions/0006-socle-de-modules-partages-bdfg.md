---
status: superseded
superseded_by: 0008-recentrage-edmond-14-09 (decision Edmond du 14/09/2026)
date: 2026-09-11
decideur: Melvyn
chantier: chantiers/2026-09-11-socle-modules-bdfg
---

# Les briques réutilisables de BDFG vivent dans un dépôt séparé, et le premier module est le mail M365

Décision prise par Melvyn le 11/09/2026, en réponse aux trois questions posées à la clôture de l'audit CSDR.

## Ce qui a motivé la décision

Melvyn l'a formulé ainsi le 11/09/2026 : « le but final de tout c'est d'avoir des modules de code qu'on réutilise partout », « pour api ou mail y'a tout le système de connexion, le design, la préparation, la robustesse et autre qui sont des trucs qui ne bougeront jamais et qui doivent être repensés et améliorés au max pour qu'on ait le meilleur partout », et « le but c'est de créer les bases pour plus tard pour tous les dev, que ce soit des manières de coder, les archi, les modules utilisés à BDFG, les règles, le setup de Claude ».

La distinction qu'il pose est la clé de découpage de tout le socle :

| Ce qui ne bouge jamais | Ce qui change par projet |
| --- | --- |
| L'authentification et la connexion | Le contenu des messages |
| La préparation de la requête, le transport | Les destinataires |
| La robustesse : retry, timeout, throttling, pagination | Le schéma métier de la requête |
| La gestion d'erreur et la journalisation | Les libellés et la mise en forme propre au projet |
| Le design du module et ses frontières | |

La colonne de gauche est le périmètre du socle partagé. La colonne de droite reste dans chaque projet, documentée et typée, mais pas partagée.

## La décision

**1. Les modules partagés vivent dans un dépôt séparé**, sous forme de paquet Python versionné et épinglé. Les projets (EVE, CSDR, et les suivants) le déclarent en dépendance. Nom de travail : `bdfg-core`, à confirmer.

**2. Le premier module est le mail Microsoft 365**, avec le squelette du paquet construit autour de lui. Motif : c'est le besoin nommé et concret, il porte les deux couches stables à la fois (l'authentification Azure app-only et le rendu), et un squelette qui s'éprouve sur un module réel vaut mieux qu'un squelette écrit dans le vide.

**3. Le chantier socle d'EVE repart**, avec les douze révisions de `revisions-design.md`, et ses interfaces sont dessinées dès maintenant pour que l'étape 2 branche les modules partagés sans réécriture.

## Alternatives écartées

**Un paquet `core/` dans EveBackEnd, copié ensuite.** Le plus rapide à démarrer. Écarté pour deux raisons établies par l'audit du 11/09 : EVE est le dépôt d'Edmond (469 commits, dont 101 de lui et 1 de Melvyn), et y faire vivre du code qui ne la concerne pas lui impose une relecture dès le premier jour ; et la réutilisation par copier-coller garantit la dérive entre projets, qui est exactement ce que le socle doit supprimer.

**Un monorepo BDFG.** Le plus propre sur le papier : refactorisation transverse en un commit, versions toujours cohérentes. Écarté parce qu'il impose de déplacer EVE et CSDR, donc une décision qui engage l'IT et l'historique git d'EVE, et qui dépasse largement ce chantier. **Rien n'interdit d'y venir plus tard** : un paquet séparé est un pas vers un monorepo, pas un pas contre.

**Commencer par le client HTTP.** Défendable : c'est la couche la plus stable de toutes, EVE en a besoin deux fois (le chantier JUMP, et l'appel GLEIF actuel qui n'a aucun retry, `data/functions.py:531-537`), et le mail Graph en dépendrait puisque Graph est du HTTP. Écarté parce que le mail est le besoin nommé, mais **le module HTTP reste le second de la liste**, et la conception du mail doit prévoir qu'il s'appuiera dessus.

**Le squelette et les conventions seuls, modules ensuite.** Écarté sur un motif de méthode : des conventions écrites sans code réel pour les éprouver vieillissent mal.

## Conséquences

**Sur le périmètre d'écriture de l'assistant.** `.claude/rules/securite.md` borne les écritures à `C:\dev\Eve\EveBackEnd`, la mémoire du bucket et le scratchpad. Le verrou `garde_perimetre.py` refusera mécaniquement toute écriture dans un dépôt nouveau. **La conception se fait dans `chantiers/2026-09-11-socle-modules-bdfg/` ; la création du dépôt et les écritures dedans demandent une autorisation explicite de Melvyn, ou se font de sa main.** La règle de périmètre devra être étendue explicitement le jour où le dépôt existe.

**Sur le niveau de rigueur.** Le chantier est **structurant** sans discussion : nouveau module, contrat public, architecture, et authentification. `.claude/rules/securite.md` classe l'authentification en structurant d'office. Le pipeline complet s'applique : deux `architecte-eve` en concurrence, fiche de décision, `/security-review` avant toute PR.

**Sur l'outillage.** L'audit du 11/09 recommandait de ne pas introduire `pyproject.toml`, `pre-commit` ni pytest **dans EVE**. Cette recommandation tient toujours pour EVE et **ne s'applique pas au dépôt séparé** : un paquet distribuable a besoin d'un `pyproject.toml`, c'est sa forme normale. Il n'y a pas de contradiction, il y a deux dépôts avec deux contraintes différentes.

**Sur Edmond.** Il n'est concerné que le jour où EVE déclare la dépendance. Ce jour là, c'est une entrée dans `requirements.txt` et une PR, pas un paquet à relire. C'est le principal avantage du dépôt séparé.

**Sur l'audit du 11/09.** Deux de ses conclusions sur le mail sont révisées, et c'est écrit dans `chantiers/2026-09-11-audit-csdr-vers-eve/memo-audit.md`, section « Révision du 11/09 ». Le SMTP de CSDR n'est plus la cible ; le client Graph, que l'audit avait jugé sans usage pour EVE, devient au contraire la brique de référence pour l'authentification.

Implémentation : chantier `2026-09-11-socle-modules-bdfg`.
