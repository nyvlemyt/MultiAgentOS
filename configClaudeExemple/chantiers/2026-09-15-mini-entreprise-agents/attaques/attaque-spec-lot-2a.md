# Attaque de la spec du lot 2a : findings et verification contradictoire

Trois `relecteur-eve` lances en parallele dans la nuit du 16/09/2026, un axe chacun, sur
`design-lot-2a.md` revision 1 : **niveau de preuve** (P), **chaine et perimetre** (C), **aval et
contrats** (A). Aucun n'a vu le rapport des autres. Rapports bruts dans `../agents/`.

**Verdict d'ensemble : la spec revision 1 etait fausse sur sa portee.** Les trois axes ont trouve
independamment le meme defaut central, et il est fatal : le verrou qu'elle decrit n'aurait refuse
qu'un seul cas sur six, et les tests qu'elle prevoyait seraient passes au vert en le cachant.

---

## Le defaut central, trouve par les trois axes : P1 = C1 = A1

**CONFIRME de ma main.** `_lib._ressemble_a_un_chemin` (`_lib.py:110-115`) se termine par
`and not token.startswith(".")`. Tout token qui commence par un point n'est donc jamais reconnu
comme un chemin, et `_cibles_ecriture` (`garde_perimetre.py:88`) ne garde comme cibles que ce qui
passe ce filtre.

Sonde de ma main, sortie brute :

```text
-- _ressemble_a_un_chemin --
'.env' False
'.env.dev1' False
'data/api.py' True
'.claude/x.md' True
-- _cibles_ecriture par commande --
'sed -i s@a@b@ .env'   [[]]
'tee .env'             [[]]
'cp x .env'            [[]]
'mv x .env'            [[]]
'rm .env'              [[]]
'touch .env.dev1'      [[]]
'echo x > .env'        [['.env']]
'cp x .env.dev1'       [[]]
-- script inline --
'python -c "open(.env, w).write(x)"'  [[]]
```

Un seul des neuf cas produit une cible. Filtrer les cibles de `_cibles_ecriture`, comme la spec le
prevoyait, n'aurait donc rien refuse d'autre que la redirection. Et le test que la spec prevoyait
(« 1 refus par redirection ») aurait ete vert : la preuve aurait valide un verrou troue.

**Ce que ca change dans la conception.** Le correctif ne peut pas se poser sur les cibles deja
filtrees. Deux voies :

| Voie | Ce qu'elle coute | Retenue ? |
| --- | --- | --- |
| Corriger `_ressemble_a_un_chemin` dans `_lib` | `_lib` est partage : `garde_donnees.py:92` s'en sert par `extraire_chemins_commande`. Un token `.env` deviendrait un chemin pour les deux verrous, et tout token commencant par un point avec lui. Effet de bord non borne. | **non** |
| Collecter les cibles protegees separement, dans `garde_perimetre`, sur les tokens bruts | Une fonction de plus dans un seul verrou, sans toucher au socle partage. | **oui** |

C'est la voie que les trois axes recommandent, chacun de son cote (A1 explicitement).

---

## Les autres findings, un par un

| # | Axe | Finding | Verifie de ma main | Retenu |
| --- | --- | --- | --- | --- |
| A2 | aval | La **suppression** est absente de la spec. `rm .env`, `del`, `Remove-Item` detruisent aussi surement qu'une ecriture, et un `.env` n'est pas dans git. | oui : `'rm .env'` rend `[[]]`, sonde ci dessus | **oui**, la regle porte sur « ecriture ou suppression » |
| A3 | aval | Un script du depot ecrit sans passer par le verrou : `python .claude/hooks/nettoyer_caracteres.py .env --appliquer` reecrit le fichier (`nettoyer_caracteres.py:115`) et `garde_perimetre.decision` rend `None`. | oui : `decision(...)` rend `None`, et `--appliquer` reecrit bien (l.115) | **oui**, la branche `SCRIPTS` entre dans la regle |
| P3 / C2 | preuve, chaine | La branche `SCRIPTS` n'extrait que les chemins **absolus** : `python -c "open('.env','w')"` passe. | oui, sonde ci dessus | **oui**, meme correctif qu'A3 |
| A4 / C4 | aval, chaine | Le contrat de `decision` dit « perimetre ». Le message de refus actuel dirait « hors perimetre » pour un fichier **dans** le perimetre : faux, et sans reformulation possible. `.claude/README.md:14`, la ligne des verrous de `CLAUDE.md` et `README.md:48` (« remettre la ligne sqlite ») deviennent faux. | oui, les trois lignes lues | **oui**. La regle se pose en **exclusion** du perimetre d'ecriture, symetrique de `RACINE_BDFG_CORE`, avec son propre message |
| P2 / C5 / A5 | les trois | Le critere « `doctor` rend 13 OK » est **deja vrai avant le correctif** : il ne mesure rien. Et la sonde envisagee en ferait 14, cassant le critere. | oui : `doctor EVE : 13 OK, 0 alerte(s)` ce soir, avant tout changement | **oui**. Tranche : la sonde va dans `autotests()` (section `--complet`, non comptee dans les 13), pas dans `verifications()`. Le critere devient « 13 OK, 0 alerte **et** une ligne de sonde `.env` au vert » |
| P4 | preuve | `assertIsNotNone` reste vert avec le mauvais message. | oui, par lecture | **oui**, le test affirme le motif du message |
| P5 / C3 | preuve, chaine | Les deux cas de lecture sont **tautologiques** cote `garde_perimetre` : `Read` n'est ni dans `OUTILS_ECRITURE` ni dans le matcher de `settings.json`. | oui : matcher `Edit\|Write\|MultiEdit\|NotebookEdit\|Bash\|PowerShell` | **oui**, ils restent comme non regression, dits tautologiques, et la porte d'arret ne porte que sur les refus |
| P6 | preuve | 4 outils d'ecriture, 3 cas annonces. | oui, par lecture | **oui**, un cas par outil |
| A6 | aval | Poste neuf sans `.env` : `doctor._moteur_env` rend un texte contenant « sqlite » (`doctor.py:49`) donc compte OK, alors que creer `.env` deviendrait refuse sans recours ecrit. | oui, ligne 49 lue | **oui**, le recours s'ecrit dans `securite.md` et dans `.claude/README.md` |
| A7 | aval | Une fixture `.env` dans le scratchpad serait refusee. | par lecture de la regle proposee | **oui**, dit dans « ce qu'on ne fait pas », contournement : nommer la fixture autrement et injecter le chemin |
| C6 | chaine | `DB_CONFIG=... python manage.py test` reste libre : le trou de la base partagee est retreci, pas ferme. | plausible, non sonde (hors perimetre du lot) | **oui**, ecrit tel quel dans « ce qu'on ne fait pas », sans le traiter |
| C7 | chaine | Installation d'un poste : copier `.env.example` vers `.env` devient refuse. | meme constat qu'A6 | **fusionne avec A6** |

**Aucun finding ecarte.** Les douze sont retenus ; deux sont fusionnes.

## Ce que l'attaque a coute et rapporte

Trois agents, 147 878 tokens de sous agents au total, environ deux minutes chacun. Elle a evite un
verrou qui n'aurait refuse qu'un cas sur neuf, avec une suite de tests verte pour le prouver. C'est
exactement le defaut que le mode autonome ne peut pas se permettre : personne n'aurait relu le PASS
avant demain matin.
