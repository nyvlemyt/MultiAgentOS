# Rapport brut : relecteur-eve, attaque de la spec du lot 2a, axe aval et contrats

Lance dans la nuit du 16/09/2026. Depose tel quel, sans reformulation. Les affirmations
ci dessous n'engagent que l'agent tant que le fil ne les a pas reverifiees (voir `attaques/attaque-spec-lot-2a.md`).

---

Attaque de `design-lot-2a.md`, axe aval et contrats. Aucun fichier modifie.

**A1 CRITIQUE (certain) - spec ligne 55 promet ce que le code ne fera pas.** `_lib._ressemble_a_un_chemin` (_lib.py:115) rend False pour tout token commencant par un point. Donc `garde_perimetre.py:88` construit une liste `chemins` vide pour `cp .env.bak .env`, `tee .env`, `sed -i s/x/y/ .env`, `Set-Content .env` : zero cible, zero refus. Seule la redirection passe (`_cibles_redirections`, lignes 69-80, sans ce filtre). Correctif : appliquer la regle `.env` aux tokens bruts de la sous-commande dans `_cibles_ecriture`, sans toucher `_ressemble_a_un_chemin`, qui est partage avec `garde_donnees` (_lib.py:127 -> garde_donnees.py:92).

**A2 HAUTE (certain) - la suppression est absente.** Lignes 35 et 55 ne parlent que d'ecriture et citent cp, mv, tee, sed. `rm .env`, `del .env`, `Remove-Item .env` produisent la meme perte irreparable decrite ligne 28, et echappent doublement (A1 + verbe non couvert). Ajouter les cas de suppression a la table ligne 50.

**A3 HAUTE (certain) - un script du depot ecrit sans passer par le verrou.** `python .claude/hooks/nettoyer_caracteres.py .env --appliquer` (README.md:16 : `--appliquer` reecrit le fichier) tombe dans la branche SCRIPTS (garde_perimetre.py:102-105), qui n'examine que les chemins absolus et seulement si un indice de `INDICES_ECRITURE_SCRIPT` figure : ici aucun, donc autorise. Dire la limite dans la spec, ou refuser `.env` dans `nettoyer_caracteres` lui-meme.

**A4 HAUTE (certain) - contrat de `decision` et documentation devenue fausse.** Docstring ligne 110 (« ecrit dans le perimetre »), docstring de module lignes 2-5, README.md:14, `CLAUDE.md` section des verrous, et README.md:48 (« remettre la ligne sqlite » devient impossible pour l'assistant). La spec ne cite que `securite.md` (ligne 58). Sans renommer : poser la regle comme une **exclusion** du perimetre d'ecriture, symetrique de `RACINE_BDFG_CORE` (ligne 49), et libeller « REFUS garde_perimetre : zone protegee en ecriture ».

**A5 MOYENNE (probable) - critere contradictoire.** Ligne 72 exige 13 OK ; `verifications()` en produit 13 aujourd'hui, donc la sonde envisagee ligne 57 en ferait 14 et ferait echouer le critere. Trancher.

**A6 MOYENNE (certain) - poste neuf.** `doctor._moteur_env` (doctor.py:50) rend un texte contenant « sqlite » quand `.env` manque, donc compte OK (ligne 154) : installation saine en apparence alors que creer `.env` devient refuse sans recours ecrit. Ajouter la ligne « creation et edition de `.env*` : main de Melvyn ».

**A7 BASSE (certain) - faux positif reel.** Une fixture `.env` dans le scratchpad pour couvrir `_moteur_env` est refusee par le choix « partout » (ligne 46). Contournement a ecrire : fixture nommee autrement, chemin injecte.

Synthese : la spec est juste sur l'intention, fausse sur la portee (A1, A2, A3) et muette sur trois contrats aval (A4, A6, A7).
