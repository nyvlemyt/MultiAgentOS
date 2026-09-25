---
status: superseded
superseded_by: 0008-recentrage-edmond-14-09 (decision Edmond du 14/09/2026)
date: 2026-09-11
decideur: Melvyn
chantier: chantiers/2026-09-11-socle-modules-bdfg
---

# Quelle forme donne-t-on au module mail partagé, et quel profil de permissions demande-t-on à l'IT ?

Fiche pour décision Melvyn. Rédigée le 11/09/2026, chantier `chantiers/2026-09-11-socle-modules-bdfg`.
Aucune option ne s'exécute dans ce chantier : cette fiche est le livrable.

## L'énoncé (une phrase métier)

Deux conceptions du module mail ont été produites en concurrence, comme le niveau structurant l'exige ; elles convergent sur l'essentiel de la technique et divergent sur la taille du module et sur un arbitrage entre la traçabilité d'un envoi et la surface d'attaque de l'application Azure.

## L'état des lieux

Deux `architecte-eve` ont travaillé en parallèle le 11/09/2026, chacun sous une contrainte poussée à fond, avec les mêmes dix faits vérifiés en entrée (`chantiers/2026-09-11-socle-modules-bdfg/journal.md`).

| | Proposition A, interface minimale | Proposition B, ports et adaptateurs |
| --- | --- | --- |
| Surface publique | **1 fonction**, `send_mail`, 16 noms publics | 7 ports, 4 décorateurs, une fabrique de câblage |
| Volume | **21 fichiers, environ 1 730 lignes** | 58 fichiers, environ 5 370 lignes |
| Tests | 11 tests nommés, hors réseau | **environ 194 tests, moins d'une seconde, hors réseau** |
| Code chez l'appelant | 2 lignes au minimum, 5 pour le compte rendu d'EVE | 13 lignes dont 1 de câblage |
| Auto-évaluation cohérence | 4 sur 5 | **2 sur 5**, assumée |
| Auto-évaluation testabilité | 4 sur 5 | **5 sur 5** |
| Auto-évaluation effort | 3 sur 5 | **2 sur 5** |

### Ce sur quoi ils convergent, et qui est donc solide

Neuf points, trouvés indépendamment par les deux instances. Cette convergence est le résultat le plus utile de l'exercice : elle transforme des choix en acquis.

1. **`requests` et non `httpx`** pour l'adaptateur par défaut. `requests==2.32.5` et `certifi==2026.1.4` sont déjà épinglés dans EVE : **zéro dépendance transitive nouvelle**. `httpx` en coûterait cinq, plus une demande à Edmond et une revalidation du déploiement IIS.
2. **Pas de `msal`.** Le flux client credentials est un `POST` à quatre champs de formulaire. `msal` apporterait `PyJWT` et `cryptography`, donc une roue compilée, donc un risque d'installation réel sous IIS Windows. À reconsidérer le jour où l'on passe du secret au certificat.
3. **Une application Azure par projet**, pas une partagée. Rayon d'explosion, portée RBAC par boîte, rotation indépendante, et attribution par `appId` dans les journaux de connexion.
4. **RBAC for Applications, et retrait du consentement Entra.** Les deux ont retenu le piège de l'union additive.
5. **Un limiteur de débit sous la limite Exchange de 30 messages par minute** (A propose 25). Une boucle d'alertes s'auto-régule au lieu de collectionner des 429.
6. **Jeton mis en cache par processus, verrou et double lecture**, avec réacquisition une seule fois sur 401, jamais en boucle.
7. **Timeouts séparés** par phase, là où CSDR n'en a qu'un global de 30 s.
8. **`POST /sendMail` n'est pas idempotent.** Les deux refusent de rejouer après un délai de lecture sur l'envoi : le serveur a peut-être accepté, et un doublon est pire qu'un échec signalé.
9. **Le `202 Accepted` ne prouve pas la livraison**, et le vocabulaire du module ne doit pas laisser croire le contraire.

### Ce sur quoi ils divergent

**Divergence 1, les ports.** A n'en met aucun : EVE contient zéro `Protocol`, zéro `ABC`, zéro `abstractmethod` (vérifié), et sa règle est qu'une abstraction demande deux implémentations qui existent **aujourd'hui**. B en met sept, en les confinant dans `bdfg-core` pour que le code d'EVE n'en déclare aucun, et argue que `Protocol` est structurel donc n'impose aucun héritage, et qu'il apporte la vérification statique par pyright que le typage canard ne donne pas.

**Divergence 2, et c'est la plus importante : la forme d'envoi.** A prend l'envoi direct (`POST /sendMail`) par défaut, et bascule vers la forme longue au-delà de 3 Mo, derrière un drapeau de déploiement. B prend la forme longue (créer le brouillon puis envoyer) **toujours**, quelle que soit la taille, pour trois raisons : elle rend un `internetMessageId`, seule valeur sur laquelle joindre les journaux de suivi Exchange ; elle est sûre au rejeu, un brouillon orphelin n'étant pas un doublon ; et elle supprime une branche conditionnelle, donc une classe de bugs que personne ne testera.

**Divergence 3, la protection du secret.** A utilise `field(repr=False)`. B introduit un type `Secret` dont seul `reveal()` rend la valeur. **B est strictement meilleur, et l'écart n'est pas cosmétique** : `field(repr=False)` protège le `repr` de la dataclass, mais `config.client_secret` reste une `str` ordinaire, donc `f"{config.client_secret}"`, `str(...)` et `json.dumps` la laissent passer. Un type `Secret` ferme ces trois voies.

**Divergence 4, le garde de contenu.** B introduit un `ContentGuard` qui refuse **mécaniquement** d'envoyer un message contenant un motif d'ISIN ou de LEI, avant tout appel réseau. A ne l'a pas. Pour EVE, ce n'est pas un agrément : c'est l'application de `.claude/rules/donnees.md` au seul endroit où une valeur de donnée peut **sortir du système d'information**. La docstring de `StepResult` dit déjà « never carries a data value » ; le garde la rend vérifiable au lieu de déclarative.

## Le point dur, chiffré avant de trancher

**La forme longue exige `Mail.ReadWrite` en plus de `Mail.Send`.** C'est l'arbitrage central, et il n'est pas technique.

| | Profil `Mail.Send` seul | Profil `Mail.Send` + `Mail.ReadWrite` |
| --- | --- | --- |
| Ce que l'app peut faire **sans RBAC** | envoyer au nom de **toute boîte du tenant** | envoyer, **et lire et écrire toute boîte du tenant** |
| Pièces jointes | 3 Mo maximum | jusqu'à 150 Mo |
| Identifiant retourné | **aucun** | `id` Graph et `internetMessageId` |
| Jonction avec le suivi Exchange | impossible | possible |
| Rejeu après un envoi incertain | risque de doublon | sûr |

Il faut nommer la surface d'attaque sans détour, parce qu'elle est la même dans les deux cas et qu'elle est grande : **`Mail.Send` en application autorise à envoyer au nom de n'importe qui dans la société, avec un message qui passe SPF, DKIM et DMARC.** C'est une primitive d'hameçonnage de premier ordre. `Mail.ReadWrite` y ajoute la lecture de toutes les boîtes.

**La conséquence pratique** : RBAC n'est pas une recommandation, c'est la condition d'existence du module. Et la vérification n'est pas optionnelle non plus.

La preuve à exiger avant le premier envoi réel, à exécuter par l'IT après le délai de propagation de 30 minutes à 2 heures :

```powershell
Test-ServicePrincipalAuthorization -Identity <app> -Resource <boite-autorisee>   # attendu : InScope vrai
Test-ServicePrincipalAuthorization -Identity <app> -Resource <autre-boite>       # attendu : InScope faux
```

Grille de lecture : si la seconde commande rend vrai, **la portée n'est pas posée** et le consentement Entra à l'échelle de l'organisation n'a probablement pas été retiré. Dans ce cas, aucun envoi ne doit partir, quel que soit le profil retenu.

## Options

### Option A : la proposition « interface minimale » telle quelle

- Effet aval : un module de 1 730 lignes, une fonction publique, appel en 2 lignes.
- Effet sur le dépôt EVE : 1 ligne de `requirements.txt`, 5 lignes de `LOGGING`, 4 clés de `.env`, 1 fichier de 24 lignes.
- Effort : environ 1 730 lignes de source, 600 de tests, 21 fichiers.
- Réversibilité : totale côté EVE. Côté paquet, la forme minimale est une porte à sens unique : passer à l'injection explicite changerait la signature.
- Risque : la protection du secret est insuffisante (voir divergence 3), il n'y a pas de garde de contenu, et l'absence d'identifiant retourné ferme la jonction avec le suivi Exchange.

### Option B : la proposition « ports et adaptateurs » telle quelle

- Effet aval : un module de 5 370 lignes, 7 ports, environ 194 tests hors ligne sous la seconde.
- Effet sur le dépôt EVE : identique à A, plus un fichier de rendu.
- Effort : environ 5 370 lignes et 58 fichiers pour envoyer un mail.
- Réversibilité : bonne, migration en quatre étapes réversibles décrites par l'auteur.
- Risque : le volume. Et un écart de style assumé, sept `Protocol` dans un écosystème qui n'en a aucun, qu'Edmond devra valider si EVE en dépend.

### Option C, recommandée : la forme de A, les garanties de B

On prend la surface publique de A et les quatre garanties où B est objectivement meilleur.

De A : **une fonction publique `send_mail`**, la configuration par environnement mémorisée par processus, `requests` en direct, et le refus de tout point d'entrée de plus bas niveau qui permettrait de sauter le retry.

De B : le type **`Secret`** ; le **garde de contenu** exécuté avant tout appel réseau ; le **vocabulaire de la preuve**, c'est-à-dire un reçu dont le type refuse de dire « livré » ; et **trois ports seulement**, ceux qui ont une seconde implémentation réelle **aujourd'hui** (le transport, pour les tests et pour l'adaptateur `httpx` dont CSDR a besoin ; l'horloge, pour tester le retry sans dormir ; l'expéditeur, pour le mode simulation et la capture en test). Les quatre autres ports de B (`TokenSource`, `AuditSink`, `ContentGuard`, `SecretResolver`) deviennent des classes concrètes, remplaçables par argument nommé sans être des `Protocol`.

- Effet aval : appel en 2 lignes comme A, garanties de B sur le secret, le contenu et la preuve.
- Effet sur le dépôt EVE : identique à A et B.
- Effort estimé : **environ 2 400 à 2 800 lignes, 30 fichiers**, entre les deux. Cette estimation est une extrapolation des deux propositions, elle n'est pas mesurée.
- Réversibilité : bonne. Les trois ports retenus permettent d'ajouter l'adaptateur `httpx` pour CSDR sans toucher au cœur.
- Risque : une synthèse n'a été éprouvée par aucun des deux architectes. Le risque est de récupérer les défauts des deux formes plutôt que leurs qualités, et il se traite en écrivant les tests avant le code, comme la règle l'impose déjà.

## Recommandation

**Option C pour la forme, et le profil `Mail.Send` + `Mail.ReadWrite` avec RBAC prouvé pour les permissions.**

Sur la forme : les quatre emprunts à B ne sont pas des préférences. Le type `Secret` corrige un trou réel de A. Le garde de contenu applique une règle d'EVE à l'endroit précis où une donnée peut quitter la société. Le vocabulaire de la preuve empêche le module de mentir sur ce qu'il sait. Et trois ports au lieu de sept retire l'indirection là où elle ne sert à rien, tout en gardant celle dont CSDR aura besoin.

Sur les permissions, l'argument est le métier de la maison : dans une société de gestion soumise à contrôle, **pouvoir répondre « voici l'identifiant du message, voici sa trace dans le suivi Exchange » vaut plus que l'économie d'un droit**, à condition que RBAC soit posé et prouvé. Sans RBAC prouvé, aucun des deux profils n'est acceptable, donc la question ne se pose plus en ces termes.

Ce qui ferait changer d'avis : si l'IT refuse `Mail.ReadWrite`, on tombe en `Mail.Send` seul, on perd l'identifiant et la jonction avec le suivi Exchange, et on plafonne les pièces jointes à 3 Mo. Le compromis devient explicite au lieu d'être subi, et le module doit alors lever une erreur claire plutôt que de basculer en silence.

## Questions fermées pour Melvyn

> **1. Quelle forme retient-on pour le module mail partagé ?**
> A. La proposition « interface minimale » telle quelle, 1 730 lignes.
> B. La proposition « ports et adaptateurs » telle quelle, 5 370 lignes.
> C. La forme de A avec les quatre garanties de B, environ 2 400 à 2 800 lignes. **(recommandé)**

> **2. Quel profil de permissions demande-t-on à l'IT ?**
> A. `Mail.Send` + `Mail.ReadWrite`, forme longue toujours, identifiant retourné, pièces jointes jusqu'à 150 Mo, jonction possible avec le suivi Exchange. **(recommandé)**
> B. `Mail.Send` seul, surface plus petite, aucun identifiant, pièces jointes plafonnées à 3 Mo.
>
> Dans les deux cas, RBAC for Applications est posé **et prouvé** par `Test-ServicePrincipalAuthorization` avant le premier envoi, et le consentement Entra à l'échelle de l'organisation est retiré.

Réponse / date : **Melvyn, 11/09/2026. Question 1 : option C. Question 2 : option A.**

Ses mots sur la forme : « Option C, la forme de A avec les quatre garanties de B. Pas de compromis sur la qualité : solide, cohérent, bien conçu, en reprenant ce qui est bon chez CSDR. Chaque endroit où tu t'écartes de CSDR, tu l'expliques, pourquoi ce choix est différent et meilleur ici. »

**Une exigence s'ajoute à la décision, et elle devient une règle du dépôt `bdfg-core`** : chaque écart avec `csdr_codex` s'explique dans `docs/ECARTS_CSDR.md`, avec ce que fait CSDR, ce qu'on fait ici, et pourquoi c'est meilleur pour ce dépôt. Le document existe et porte déjà vingt et un écarts, plus la liste de ce qui est repris tel quel.

Ses mots sur les permissions : « `Mail.Send` + `Mail.ReadWrite`, comme tu recommandes. Je porte la demande à l'IT en direct, sans l'habiller : c'est une app qui peut envoyer au nom de n'importe quelle boîte du tenant, avec RBAC en condition, pas en option. »

## Verrouillage une fois la décision prise

- **Option 1C** : écrire la spec du module dans `chantiers/2026-09-11-socle-modules-bdfg/design.md`, en nommant explicitement les trois ports retenus et les quatre classes concrètes issues de B, puis passer à l'implémentation en TDD. Les deux propositions complètes restent archivées dans le journal du chantier comme alternatives écartées.
- **Option 1A ou 1B** : même chose, avec la proposition retenue, et consigner ici le motif du refus de la synthèse.
- **Option 2A** : la demande à l'IT porte les deux permissions et la procédure RBAC complète. `SendMode` n'a qu'une valeur, la forme longue, et le module ne contient aucune branche conditionnelle de taille.
- **Option 2B** : la demande à l'IT porte `Mail.Send` seul. Le module plafonne les pièces jointes à 3 Mo et lève une erreur nommant la taille et le seuil. `SendReceipt` ne porte aucun identifiant, et la documentation dit que la jonction avec le suivi Exchange est impossible.
- **Dans tous les cas** : la question du proxy (fait 10 du journal) est tranchée par un essai depuis le serveur d'EVE avant le premier envoi, et le résultat est écrit au journal.
