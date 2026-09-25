# Journal : socle de modules partagés BDFG

Chantier `2026-09-11-socle-modules-bdfg`. Niveau de rigueur : **structurant**, sans discussion possible. Motifs cumulés : nouveau module, contrat public, architecture, et **authentification**, que `.claude/rules/securite.md` classe en structurant d'office. Le pipeline complet s'applique : deux `architecte-eve` en concurrence, fiche de décision, `/security-review` avant toute PR.

Décision d'architecture : `chantiers/_decisions/0006-socle-de-modules-partages-bdfg.md`.
Chantier amont : `chantiers/2026-09-11-audit-csdr-vers-eve/`, dont deux conclusions sur le mail sont révisées ici.

---

## Phase 0 : le cadrage, 11/09/2026

### Ce qui a ouvert le chantier

Melvyn a reformulé l'objectif après la restitution de l'audit CSDR, et sa reformulation change le cadre de travail, pas seulement le périmètre. Ses mots :

> « Le but final de tout c'est d'avoir des modules de code qu'on réutilise partout [...] pour api ou mail y'a tout le système de connexion, le design, la préparation, la robustesse et autre qui sont des trucs qui ne bougeront jamais et qui doivent être repensés et améliorés au max pour qu'on ait le meilleur partout. Et les p'tits trucs qui changent genre le contenu, la requête [...] peuvent être améliorés et designés et documentés mais ça changera dans les différents projets. »

Et le cadre plus large :

> « Le but c'est de créer les bases pour plus tard pour tous les dev, que ce soit des manières de coder, les archi, les modules utilisés à BDFG, les règles, le setup de Claude. [...] J'ai plein d'idées de projet et c'est pour ça qu'il faut être solide à fond maintenant. »

Et la contrainte de qualité, qui est une exigence métier et non une préférence :

> « Ça doit être vraiment solide pour correspondre aux attentes de vérification et sûreté et efficacité d'une entreprise de gestion d'actif avec tous les contrôles qui vont avec. »

Trois réponses ont été données le même jour, et elles sont actées dans la fiche `0006` : dépôt séparé et paquet installable, mail M365 en premier avec le squelette autour, et le chantier socle d'EVE qui repart en étant conçu pour consommer les modules.

### Ce que ce cadre corrige dans l'audit de la veille

Deux conclusions de `memo-audit.md` sont fausses dans ce cadre, et elles l'étaient déjà par construction : elles reposaient sur une hypothèse implicite, qu'EVE enverrait par SMTP comme CSDR.

1. « La réception Graph ne sert à rien à EVE » : **faux**. Le client Graph de CSDR porte l'authentification OAuth2 app-only, c'est-à-dire exactement la couche qui ne bouge jamais. C'est la brique de référence du module, pas un déchet.
2. `EmailRenderer` retiré au motif qu'aucune décision n'ouvrait le besoin : **la décision est prise**, et la mesure montre par ailleurs que le fichier est bien plus réutilisable que l'audit ne l'avait jugé.

La révision est écrite dans `chantiers/2026-09-11-audit-csdr-vers-eve/memo-audit.md`, section « Révision du 11/09 ».

### Les faits établis, et vérifiés

Recherche menée par un `chercheur-eve` sur le code de `c:\dev\csdr_codex` et sur la documentation publique Microsoft. Aucune valeur réelle, aucun identifiant, aucun secret n'apparaît.

**Fait 1, et il commande tout le module : CSDR n'a aucun client Graph d'envoi.** Graph n'y sert qu'à la réception de pièces jointes (`ingestion/services/mail/`). L'envoi passe par SMTP natif (`mail/transport/smtp_client.py:129-138`, `smtplib.SMTP` sans authentification ni TLS). Deux modules disjoints, deux apps, aucun import commun. **Le client d'envoi est entièrement à écrire.** Ce qui se reprend est la couche authentification et transport du client de réception.

**Fait 2 : ce qui est solide dans `graph_mail_client.py`.** Jeton en cache avec marge de 60 s comparée sur `time.monotonic()`, donc insensible aux sauts d'horloge (`:38-39`, `:131`, `:158`). Scope dérivé de l'URL, pas codé en dur, donc compatible cloud souverain (`:126-128`). Aucun corps de réponse ni jeton journalisé (`:148`, `:171-176`). Contournement documenté du magasin de certificats Windows par `certifi.where()` (`:70-78`). `verify=False` mécaniquement refusé en production (`:79-88`). Transport HTTP injectable, donc testable sans réseau (`:62-64`). Pagination `@odata.nextLink` avec plafond (`:228-234`). Configuration immuable (`graph_mail_config.py:7-40`).

**Fait 3 : les huit défauts à corriger, et le premier est un défaut de sécurité.**

| Défaut | Preuve | Conséquence |
| --- | --- | --- |
| **Le secret client est dans le `__repr__`** : `client_secret: str` sans `field(repr=False)` sur une dataclass | `graph_mail_config.py:34`, à comparer à `email_config.py:43` qui protège son mot de passe | Un `logger.error("...{}", config)` exfiltre le secret dans les journaux |
| Aucun retry, aucune gestion du 429 ni de `Retry-After` | zéro occurrence dans tout le fichier | Graph renvoie 429 avec `Retry-After` : le client lève et perd l'appel. Le client SMTP voisin, lui, a un retry |
| Toutes les erreurs sont des `RuntimeError` génériques | 5 occurrences, plus un `ValueError` | L'appelant ne peut distinguer authentification refusée, throttling, boîte absente et panne réseau. Aucune politique de reprise n'est écrivable au-dessus |
| Aucun retry sur 401 | cache purement temporel, `:130-136` | Un jeton révoqué avant échéance n'est jamais réacquis |
| Cache de jeton perdu à chaque appel métier | `graph_mail_source.py:36`, `:50` | Un jeton par notification |
| Non thread-safe | aucun verrou autour de l'acquisition | Sous IIS multi-thread, acquisitions concurrentes redondantes |
| Timeout unique et global de 30 s | `graph_mail_config.py:40` | Un upload lourd et un GET de métadonnées ont le même budget |
| Pictogrammes dans les messages de log | `:78`, `:88`, `:117`, `:159`, `:212` | Interdits par `.claude/rules/qualite.md` |

**Fait 4 : le port de CSDR est sain dans sa forme, inutilisable dans son contenu.** `MailSource` est un `Protocol` `runtime_checkable` sans héritage imposé, ce qui est bon. Mais sa méthode unique est un **cas d'usage métier et non une capacité** : `fetch_report_attachments(folder_path, subject_contains, filename_contains, has_attachments, max_results, first_to_last)`, six paramètres qui décrivent « trouver le rapport mensuel ». Son type de retour vient du domaine CSDR. Aucun port d'envoi n'existe. La factory lit une configuration globale au lieu de la recevoir. Le journal est un singleton importé. Et le nom de la boîte est dans la configuration de **connexion** alors qu'il devrait être un paramètre d'**appel**.

**Fait 5 : le rendu HTML est à 88 % générique**, et l'audit s'était trompé en le retirant. `mail/renderers/email_renderer.py`, 412 lignes, **zéro occurrence du mot CSDR**. Non réutilisable : 12 lignes (2,9 %), le pied de page français en dur et `lang="fr"` figé. Générique mais charte figée : 38 lignes (9,2 %), couleurs écrites dans le corps des méthodes. Générique : environ 362 lignes (87,9 %), dont l'échappement systématique et les contournements Outlook (conditionnels MSO, table de 600 px, mode sombre, requête média mobile). **La structure MIME n'est pas dans le renderer** : elle est dans `smtp_client.py:144-175`, et elle devient sans objet en envoi Graph JSON.

**Fait 6 : ce que Graph impose pour l'envoi.** Permission d'application `Mail.Send`, marquée « least privileged », qui autorise à envoyer **au nom de n'importe quel utilisateur du tenant**. `Mail.ReadWrite` n'inclut pas le droit d'envoyer. Deux formes : envoi direct (`POST /users/{id}/sendMail`, `202 Accepted`, `Mail.Send` seule) ou création puis envoi (`Mail.ReadWrite` puis `Mail.Send`, brouillon modifiable). **Le `202 Accepted` ne prouve rien de la livraison.** Pièces jointes : moins de 3 Mo en JSON base64 dans l'appel direct ; de 3 à 150 Mo, `createUploadSession` donc la forme longue donc `Mail.ReadWrite`, avec des `PUT` de plages d'octets **sans en-tête `Authorization`** (l'URL porte son jeton), tronçons de moins de 4 Mo, reprise possible via `nextExpectedRanges`.

**Fait 7 : les limites, et elles cadrent le dimensionnement.** Throttling Graph : `429` avec `Retry-After` en secondes, les tentatives immédiates étant explicitement déconseillées puisqu'elles s'imputent sur le quota. Limites Exchange Online en aval : **10 000 destinataires par jour et par boîte**, **30 messages par minute**, 1 000 destinataires par message. Microsoft écrit : « Exchange Online isn't suited to accommodate bulk-mailing scenarios. » Jeton client credentials : **aucun jeton de rafraîchissement n'est émis**, le renouvellement rejoue la demande, scope suffixé `/.default`.

**Fait 8, et c'est le plus important pour l'IT : la procédure de CSDR est périmée sur la sécurité.** CSDR documente la restriction de portée par `New-ApplicationAccessPolicy`. **Microsoft a remplacé les Application Access Policies par RBAC for Applications** (`New-ServicePrincipal`, `New-ManagementScope`, `New-ManagementRoleAssignment -App ... -Role "Application Mail.Send" -CustomResourceScope ...`, vérification par `Test-ServicePrincipalAuthorization`). **Le piège** : les permissions Entra ID et les attributions RBAC sont **additives, en union**. Garder un consentement Entra à l'échelle de l'organisation **et** ajouter une portée RBAC **ne restreint rien du tout**. Il faut retirer le consentement Entra. Propagation du cache de permissions : de 30 minutes à 2 heures, à prévoir dans toute recette.

**Fait 9 : EVE part de zéro, et sans dépendance nouvelle.** Aucune occurrence de `EMAIL_`, `send_mail`, `smtplib`, `django.core.mail`, `graph.microsoft` ni `msal` dans les 92 fichiers Python du dépôt hors venv. Aucune clé mail dans `.env` ni `.env.dev1`. Mais `requests==2.32.5` et `certifi==2026.1.4` sont déjà là : **écrire le client sur `requests` ne coûte aucune dépendance nouvelle à EVE**, là où reprendre le code de CSDR imposerait `httpx`. L'écart à arbitrer est que `httpx` fournit `MockTransport` alors que `requests` demande une session injectée.

### Phase 1 : deux architectes en concurrence

Lancés le 11/09/2026, sous deux contraintes volontairement opposées, avec consigne de pousser chacune à fond plutôt que de chercher l'équilibre.

| Instance | Contrainte | Critère de réussite imposé |
| --- | --- | --- |
| A | **Interface minimale, cas courant trivial.** Un port seulement si une seconde implémentation existe déjà aujourd'hui | Un développeur qui n'a jamais vu le module envoie une notification correcte sans lire la documentation |
| B | **Ports et adaptateurs, substituabilité et testabilité maximales.** Le cœur ne connaît aucune bibliothèque HTTP ni aucun fournisseur | La suite complète tourne hors ligne en moins d'une seconde et couvre les chemins d'erreur |

Les deux reçoivent les neuf faits ci-dessus, les règles d'EVE qui deviennent celles du paquet, et les six mêmes questions de conception. Un point leur est signalé explicitement : **le dépôt EVE ne contient aucun `Protocol` ni classe de base abstraite**, donc en introduire n'est pas neutre et doit être justifié.

### Les contraintes de périmètre, à lever avant toute écriture de code

`.claude/rules/securite.md` borne les écritures de l'assistant à `C:\dev\Eve\EveBackEnd`, la mémoire du bucket, le scratchpad et `~/.claude/settings.json`. Le verrou `garde_perimetre.py` refuse mécaniquement le reste (racines autorisées lues dans `.claude/hooks/garde_perimetre.py:44-52`).

**Conséquence opérationnelle** : la conception se fait ici, dans `chantiers/`. La création du dépôt `bdfg-core` et toute écriture dedans demandent soit une autorisation explicite de Melvyn avec extension de la règle de périmètre, soit une création de sa main. Ce point est à trancher avant la phase d'implémentation, pas pendant.

Constat voisin, relevé en passant : `C:\dev\claude-bdfg` existe depuis le 18/08/2026 (2 commits) et porte les scripts d'installation de Claude Code au poste, la configuration de proxy et les procédures. C'est le voisin du volet « setup de Claude » de l'objectif de Melvyn, pas un doublon du paquet de modules.

### Constats hors périmètre

1. La procédure Azure de CSDR (`docs/MAIL_GRAPH_MIGRATION.md:35-44`) prescrit un mécanisme que Microsoft a remplacé, et le piège de l'union des permissions n'y figure pas. **C'est un sujet de sécurité réel pour CSDR**, mais CSDR n'est pas le périmètre de ce chantier : à signaler à Melvyn, qui décidera.
2. Le client Graph de CSDR télécharge le contenu des pièces jointes avant de les filtrer par nom (`graph_mail_source.py:95` puis `:100`), sans borne de taille. Même remarque.

### Fait 10, trouvé en vérifiant l'architecte A : EVE contourne le proxy d'entreprise

Le seul appel sortant d'EVE force explicitement le contournement du proxy, aux deux endroits de la pagination GLEIF :

```text
$ sed -n '531,537p' data/functions.py
        resp: req.Response = req.get(
            gleif_url,
            params=params,
            proxies={"http": "", "https": ""},
            timeout=30,
        )
$ sed -n '551,556p' data/functions.py   -> meme forme dans la boucle de pagination
```

Et zéro `Protocol`, zéro `ABC`, zéro `abstractmethod` dans `data/`, `eve_back/` et `users/` : le fait annoncé aux deux architectes est confirmé.

**La question que ça ouvre, et elle n'était posée nulle part.** CSDR accommode un proxy qui ré-signe le trafic (d'où le bundle CA et le contournement du magasin de certificats Windows, `graph_mail_client.py:70-78`). EVE, elle, sort **en direct**. Les deux dépôts tournent pourtant sur le même réseau d'entreprise. Trois lectures possibles, et aucune n'est établie :

1. GLEIF est joignable en direct et Microsoft 365 ne l'est pas, auquel cas le module doit gérer le proxy.
2. Le contournement de GLEIF est un vestige qui marche par chance.
3. Les deux serveurs n'ont pas la même configuration réseau.

**À trancher avant le premier envoi réel**, par un essai depuis le serveur qui hébergera EVE. La conception doit de toute façon rendre le proxy configurable et ne jamais le coder en dur, dans un sens comme dans l'autre. Question à ajouter à celles destinées à l'IT.

---

## Phase 1, résultat : les deux propositions, et ce qu'elles ont appris

Les deux `architecte-eve` ont rendu le 11/09/2026. Arbitrage : fiche `chantiers/_decisions/0007-forme-du-module-mail-partage.md`.

### Le résultat le plus utile : neuf convergences

Trouvées indépendamment par les deux instances, donc acquises plutôt que choisies.

1. `requests` et non `httpx` : zéro dépendance transitive nouvelle pour EVE, contre cinq.
2. Pas de `msal` : le flux client credentials est un `POST` à quatre champs ; `msal` apporterait `PyJWT` et `cryptography`, donc une roue compilée, donc un risque d'installation sous IIS Windows. À reconsidérer au passage au certificat.
3. Une application Azure par projet, pas une partagée.
4. RBAC for Applications, et retrait du consentement Entra à l'échelle de l'organisation.
5. Un limiteur sous la limite Exchange de 30 messages par minute.
6. Jeton en cache par processus, verrou et double lecture, réacquisition une seule fois sur 401.
7. Timeouts séparés par phase.
8. **`POST /sendMail` n'est pas idempotent** : ne jamais rejouer après un délai de lecture sur l'envoi, un doublon étant pire qu'un échec signalé.
9. Le `202 Accepted` ne prouve pas la livraison, et le vocabulaire du module ne doit pas laisser croire le contraire.

### Proposition A, interface minimale : ce qu'elle apporte

21 fichiers, environ 1 730 lignes. **Une seule fonction publique, `send_mail`**, 16 noms publics au total, tout le reste préfixé par un souligné. Appel minimal en 2 lignes, compte rendu des 23 étapes d'EVE en 5 lignes d'envoi.

Son argument le plus fort, et il est de sûreté et non de confort : **il n'existe aucun point d'entrée public de plus bas niveau**, donc un développeur pressé ne peut pas écrire un chemin qui saute le retry. Deux des huit défauts de CSDR (jeton perdu par appel, absence de verrou) disparaissent par construction de cette forme.

Son argument sur les ports : EVE contient zéro `Protocol`, zéro `ABC`, zéro `abstractmethod` (vérifié). Une abstraction demande deux implémentations qui existent **aujourd'hui**. La seam de test est prise chez `requests`, par `session.mount()` sur un `HTTPAdapter`, qui est un point d'extension documenté de la bibliothèque : zéro indirection dans le code du module.

Son point faible, qu'elle nomme elle-même : la configuration venant de l'environnement, un relecteur ne voit pas dans le code quelle boîte envoie, et une erreur de `.env` se découvre au premier envoi.

### Proposition B, ports et adaptateurs : ce qu'elle apporte

58 fichiers, environ 5 370 lignes, 7 ports, 4 décorateurs, environ 194 tests hors ligne sous la seconde. Le cœur n'importe ni `requests`, ni `httpx`, ni `datetime.now`, ni `time.sleep`.

Quatre apports sont objectivement supérieurs, et ils sont repris dans la recommandation :

- **Le type `Secret`.** `field(repr=False)` ne protège que le `repr` de la dataclass ; la valeur reste une `str` ordinaire, donc `f"{config.client_secret}"`, `str(...)` et `json.dumps` la laissent passer. `Secret`, dont seul `reveal()` rend la valeur, ferme ces trois voies.
- **Le garde de contenu.** `GuardedMailSender` est le décorateur le plus externe : il s'exécute **avant** tout appel réseau et refuse un message contenant un motif d'ISIN ou de LEI, dans le sujet, le HTML, le texte et les noms de pièces jointes. Pour EVE ce n'est pas un agrément : c'est l'application de `.claude/rules/donnees.md` au seul endroit où une valeur de donnée peut **sortir du système d'information**. La docstring de `StepResult` dit déjà « never carries a data value » ; le garde la rend vérifiable au lieu de déclarative.
- **Le vocabulaire de la preuve.** `DeliveryClaim` n'a que deux valeurs, `ACCEPTED` et `STORED`. **Il n'y a pas de valeur `DELIVERED`**, parce qu'aucune réponse Graph ne la justifie. Le type système refuse de mentir.
- **La forme d'envoi longue par défaut** (créer le brouillon puis envoyer), parce qu'elle rend un `internetMessageId`, seule valeur sur laquelle joindre les journaux de suivi Exchange, et parce qu'un brouillon orphelin n'est pas un doublon.

Son point faible, qu'elle nomme elle-même : 58 fichiers pour envoyer un mail, et sept `Protocol` dans un écosystème qui n'en a aucun. Elle s'auto-évalue 2 sur 5 en cohérence avec l'existant, et 2 sur 5 en effort.

### Les quatre divergences, et laquelle est une vraie décision

| Divergence | A | B | Verdict |
| --- | --- | --- | --- |
| Les ports | aucun | sept | Arbitrable : trois suffisent, ceux qui ont une seconde implémentation aujourd'hui |
| La protection du secret | `field(repr=False)` | type `Secret` | **B a raison, et l'écart n'est pas cosmétique** |
| Le garde de contenu | absent | décorateur le plus externe | **B a raison pour EVE, c'est une règle du dépôt** |
| La forme d'envoi | directe, bascule à 3 Mo | longue toujours | **Vraie décision** : elle exige `Mail.ReadWrite`, donc elle arbitre entre traçabilité et surface d'attaque |

La quatrième n'est pas technique. Elle oppose la capacité de prouver qu'un message est parti, et de le retrouver dans le suivi Exchange, à l'étendue de ce qu'un secret fuité permettrait. C'est la question fermée n°2 de la fiche `0007`.

### Ce que les deux propositions ont en commun sur la sécurité, et qu'il faut dire à l'IT en toutes lettres

`Mail.Send` en permission d'**application** autorise à envoyer **au nom de n'importe quelle boîte du tenant**, avec un message qui passe SPF, DKIM et DMARC. C'est une primitive d'hameçonnage de premier ordre. `Mail.ReadWrite` y ajoute la lecture de toutes les boîtes.

RBAC n'est donc pas une recommandation, c'est la condition d'existence du module, et sa vérification n'est pas optionnelle :

```powershell
Test-ServicePrincipalAuthorization -Identity <app> -Resource <boite-autorisee>   # attendu : InScope vrai
Test-ServicePrincipalAuthorization -Identity <app> -Resource <autre-boite>       # attendu : InScope faux
```

Si la seconde rend vrai, la portée n'est pas posée et le consentement Entra n'a probablement pas été retiré. Aucun envoi ne doit partir dans ce cas.
