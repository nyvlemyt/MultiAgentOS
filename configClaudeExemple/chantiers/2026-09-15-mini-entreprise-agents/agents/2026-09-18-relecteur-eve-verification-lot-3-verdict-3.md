# Rapport brut : relecteur-eve, verification contradictoire du lot 3, verdict 3 (le dernier), 18/09/2026

Depose tel quel par le fil. Brief : les deux rapports precedents, les 900 dernieres lignes du journal
(les onze regles des cycles 1 et 2), les six fichiers de verrous, les trois regles de doctrine ; fabriquer
ses propres entrees dans un script du scratchpad, ne pas rejouer le corpus, frapper la ou les deux
premiers n'ont pas frappe ; 400 mots au plus.

Verdict : BLOCK. Trois classes neuves rouvrent les interdits de `git.md` et l'ecriture de `.env` : le
quoting ANSI-C n'est pas decode, `find -exec` n'analyse pas la commande qu'il lance, et `python -m`
ecrit sans etre vu.

| Sev | Axe | Entree exacte | Obtenu | Attendu et doctrine | Cause |
| --- | --- | --- | --- | --- | --- |
| CRITIQUE | scanner | quoting ANSI-C des octets de git ou de rm, en direct, sous enveloppe et sous shell imbrique | PASSE | REFUS. securite.md nomme cette forme parmi les formes couvertes ; git.md « quelle que soit la facon d'appeler git ». Le shell du poste decode | `_commande.py:222-224` traite cette forme comme une quote simple, les echappements restent litteraux ; `canon` (`:87`) retire les antislashs et rend un programme inconnu, donc aucune invocation git |
| CRITIQUE | git, perimetre, zone | `find . -name '*.py' -exec bash -c 'git push --force' ;` et ses variantes (`-exec env git ...`, `-exec python -c ...`, `-execdir sh -c ...`, `-exec cmd /c del`, `-exec xargs rm`) | PASSE | REFUS. securite.md annonce `-exec` couvert ; temoins verts : `-exec git push --force` et `-exec rm <hors>` sont refuses | `_commande.py:816-830` : la branche FIND fabrique l'invocation directement, sans passer par `_position_du_programme` ni par le traitement SHELL, INTERPRETE, ENVELOPPE |
| CRITIQUE | perimetre, zone | `python -m pip install --target <hors perimetre>`, `python -m json.tool <source> .env`, `python -m zipfile -c <hors>` (aussi `python3`, `py`, `uv run python`) | PASSE | REFUS. securite.md : ecrivent sous une option, `pip --target` nomme ; `pip install --target <hors>` est bien refuse en direct | `_effets.py:328-343` : famille INTERPRETE sans option de code, tous les positionnels sont LIT ; `-m <module>` n'est pas modelise, la regle des paquets de `_programmes.py:128` est court-circuitee |
| HAUTE | git | `git --config-env=core.hooksPath=EVIL status`, et sa forme espacee | PASSE | REFUS. git.md : une cle qui execute du code ne s'ecrit ni ne s'injecte, et les equivalents valent aussi. La forme `-c` est bien refusee. git 2.55 du poste supporte cette option | `garde_git.py:112` ne teste que l'egalite avec `-c`, alors que l'option longue est dans la table des options globales avec valeur (`_programmes.py:204`) |
| MOYENNE | zone, perimetre | `gzip .env`, `xz .env`, `bzip2 .env`, `zstd --rm .env`, `gzip <hors perimetre>` | PASSE | REFUS selon la zone protegee ; ces verbes detruisent leur source. Couvert a la lettre par la limite ecrite « un programme absent de la table ne produit aucun acces » : a trancher | table `_programmes.py:58-149`, famille compression absente |
| BASSE | donnees | lecture d'un fichier de donnees par un objet git | PASSE | Sans portee reelle : les deux dossiers de donnees sont dans `.gitignore` (verifie), rien n'est dans l'objet git. Signale, pas compte comme fuite |

Sorties brutes (extraits recopies) :

```text
ESSAYES : {'scanner': 10, 'perimetre': 18, 'zone': 21, 'git': 22, 'donnees': 12, 'faux_refus': 35} TOTAL 118
ECARTS : 16
ECART att REFUS obt PASSE | find -exec + shell      | find . -name '*.py' -exec bash -c 'git push --force' ;
ECART att REFUS obt PASSE | find -exec + enveloppe  | find . -name '*.py' -exec env git push --force ;
ECART att REFUS obt PASSE | python -m ecrit la zone | python -m json.tool chantiers/x/a.json .env
OK    att REFUS obt REFUS | find -exec git direct   | find . -name '*.py' -exec git push --force ;
OK    att REFUS obt REFUS | xargs + shell           | echo x | xargs bash -c 'git push --force'
ROUND 2 : 18 entrees, 8 ecarts
ROUND 3 : 18 entrees, 9 ecarts
$ git --version                      git version 2.55.0.windows.5
$ git check-ignore -v data_import_files tmp_uploads
.gitignore:2:data_import_files   .gitignore:226:tmp_uploads/
```

Les trois lignes ANSI-C du round 2 sont invalides : le heredoc du relecteur avait resolu l'echappement ;
seuls les rounds 1 et 3, a chaines reconstruites, font foi (le relecteur le signale lui meme).

Le compte : 154 entrees fabriquees (scanner 16, perimetre 18, zone protegee 21, git 22, donnees 12,
combinaisons `find -exec` 10, `python -m` 7, quotidien 45 et plus), 33 ecarts en 6 classes, **0 faux
refus** sur 45 commandes du travail courant. Rien n'a ete execute des commandes d'attaque, aucun fichier
du projet touche.

Limites confirmees, conformes a la doctrine : `patch -p1 -i p.diff` ; `xargs -I{} rm {}` alimente par un
fichier ; une variable de shell qui porte la sous-commande (git.md l'exclut explicitement).

A trancher, pas compte en ecart : la limite « un programme absent de la table ne produit aucun acces »
couvre a la lettre `gzip .env` ; faut-il la tenir pour suffisante sur la zone protegee, ou fermer la
famille compression ?

Script : `scratchpad/attaque_lot3_v3.py` et ses rounds 2 et 3.

Synthese : la refondation tient tout ce que les deux verificateurs precedents ont ouvert, et aucune
commande legitime n'est refusee ; mais trois chemins jamais joues laissent passer `push --force`,
`reset --hard` et l'ecriture de `.env`. BLOCK ; les deux cycles etant consommes, le lot se ferme
« livre non valide » avec ces cinq causes localisees.
