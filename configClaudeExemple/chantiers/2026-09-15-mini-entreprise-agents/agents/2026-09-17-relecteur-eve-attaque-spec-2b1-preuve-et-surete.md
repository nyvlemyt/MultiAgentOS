# Rapport brut : relecteur-eve, attaque de la spec du lot 2b tranche 1, axe niveau de preuve et surete

Lance dans la nuit du 16 au 17/09/2026. L'agent a **prototype** le correctif propose avant de juger.
Depose tel quel, sans reformulation.

---

Attaque de spec, axe niveau de preuve et surete. Reponse courte : **non**, le redecoupage tel qu'il est specifie ne produit pas l'effet annonce (3 des 4 shells du critere l.95 restent ouverts), et il casse deux cas legitimes. Aucun fichier modifie.

| Sev | Ligne visee | Constat | Preuve (sortie brute de sonde) | Correctif |
| --- | --- | --- | --- | --- |
| CRITIQUE | `etat-depart/empreintes.py:35` ; spec l.65-71 | S1 `rglob` sur un chemin de FICHIER ne leve rien et rend `[]` : ajouter `CLAUDE.md` a `SURVEILLES` est un no-op **silencieux**. La consequence ecrite (« apparaitront comme AJOUT ») est fausse : ils n'apparaitront pas du tout. | `rglob sur un fichier rend: []` / `relever() avec SURVEILLES = fichiers : {}` | `relever` : `if (racine/d).is_file(): traiter le fichier seul else rglob`. Preuve = test unitaire sur `relever()`, pas une relecture du comparateur (certain) |
| CRITIQUE | spec l.42 et l.81 | S2 `bash -c "bash -c 'rm <hors>'"` **passe toujours** : le token interne se re-decoupe en `['bash','-c','rm','<chemin>']`, l'option ne porte plus que `rm`, le chemin est orphelin. La borne de profondeur n'est donc jamais atteinte et le test l.81 est inecrivable. | `PASSE -> PASSE \| bash -c "bash -c 'rm C:/dev/maos/x'"` | prendre **tout le reste des tokens** apres l'option, pas le suivant ; puis ecrire le test de profondeur (certain) |
| HAUTE | spec l.50 et l.95 | S3 `cmd /c del <chemin>` non guillemete et `pwsh -Command` / `-NoProfile -Command` echappent : la liste d'options ignore `-command` a un tiret (forme reelle de PowerShell) et `-EncodedCommand`. Le critere « binaire » est faux tel qu'ecrit. | `PASSE -> PASSE \| cmd /c del C:\dev\maos\x` et `\| pwsh -NoProfile -Command "Remove-Item C:/dev/maos/x"` | meme correctif que S2 + ajouter `-command`, `-encodedcommand`, `-file` (certain) |
| HAUTE | spec l.47 | S4 Faux positif neuf : des guillemets echappes eclatent la commande des le niveau 1 ; l'option porte `rm \` et le verrou refuse sur `\` (racine du lecteur). Une ecriture **dans** le projet est refusee, avec un message absurde. | `PASSE -> REFUS sur \ \| bash -c "rm \"chantiers/x\""` | ignorer un token vide ou `\` comme cible ; cas de non regression a ajouter (certain) |
| MOYENNE | spec l.49 | S5 `pwsh -c "Copy-Item -Path <hors> -Destination <projet>"` bascule PASSE -> REFUS : `_cibles_ecriture:242-253` prend `-Path` (la SOURCE) via `OPTIONS_DESTINATION`, l'asymetrie deja corrigee dans `_cibles_protegees` par `OPTIONS_VRAIE_DESTINATION`. Copier depuis l'exterieur vers le projet est une lecture autorisee (test l.211). | `PASSE -> REFUS sur C:/dev/maos/x/a.md` | aligner `_cibles_ecriture` sur `OPTIONS_VRAIE_DESTINATION` dans la meme tranche (certain) |
| MOYENNE | spec l.42-43 | S6 « on refuse d'analyser » est ambigu. La bonne lecture est **refuser l'appel** : le contrat du hook est exit 0 = autorise, donc laisser passer transforme la limite en mode d'emploi du contournement, et aucun usage legitime du poste n'imbrique trois shells. | contrat `_lib.refuser`/`autoriser` (`_lib.py:155-164`) | l'ecrire dans la spec et dans `securite.md`, avec un test sur le message (certain) |
| BASSE | spec l.96 | S7 « les 81 tests restent verts » ne prouve rien : avec le redecoupage prototype branche, les 30 tests de perimetre et de zone protegee restent verts, S4 et S5 compris. Restent aussi ouverts hors critere : `echo "rm <hors>" \| bash`, `bash script.sh`. | `Ran 81 tests ... OK` (base) puis `Ran 30 tests ... OK` (prototype) | remplacer le critere par des cas neufs rouges avant correctif, et borner le mot « binaire » aux formes `-c` (certain) |

Synthese : le mecanisme est juste sur le cas de la sonde d'origine, mais la regle « le token qui suit l'option » est trop etroite (S2, S3) et trop large (S4) ; la spec doit fixer le decoupage, la liste d'options, le sort de la profondeur, et donner un test unitaire a `relever()` avant implementation.

Sondes dans le scratchpad de session. Aucun fichier du depot modifie.
