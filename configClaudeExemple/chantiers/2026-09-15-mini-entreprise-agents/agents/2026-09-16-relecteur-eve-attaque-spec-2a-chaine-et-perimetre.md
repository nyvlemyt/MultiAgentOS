# Rapport brut : relecteur-eve, attaque de la spec du lot 2a, axe chaine et perimetre

Lance dans la nuit du 16/09/2026. Depose tel quel, sans reformulation. Les affirmations
ci dessous n'engagent que l'agent tant que le fil ne les a pas reverifiees (voir `attaques/attaque-spec-lot-2a.md`).

---

Attaque du `design-lot-2a.md`, axe chaine et perimetre. Aucun fichier modifie.

| ID | Ligne visee | Scenario | Confiance | Ce qui manque a la spec |
| --- | --- | --- | --- | --- |
| C1 | l.55 « `cp`, `mv`, `tee`, `sed -i` vers `.env*` refuses » | `_lib._ressemble_a_un_chemin` (`_lib.py`:110-115) rend **False** pour tout token commencant par `.` : `.env`, `.env.dev1`, `.env.bak`. Or `garde_perimetre.py`:88 ne garde comme cibles que ce qui passe ce filtre. Sonde lancee : `tee .env` -> `[]`, `cp x .env` -> `[]`, `rm .env` -> `[]` ; seul `echo A > .env` -> `['.env']`. Filtrer les cibles ne peut donc pas tenir la promesse : cinq des six verbes ne produisent aucune cible. | certain | La chaine oublie `_lib.py`. Et `_lib` est partage avec `garde_donnees` (`extraire_chemins_commande`) : le corriger la change deux verrous, ce que l.37 (« le reste du verrou ne bouge pas ») exclut sans le dire. A trancher dans la spec. |
| C2 | l.54-55 (deux branches seulement) | Branche `SCRIPTS` (`garde_perimetre.py`:102-105) : elle n'extrait que les chemins **absolus** (`_MOTIF_CHEMIN_ABSOLU_LOCAL`). Sonde : `python -c "open(.env,w)"` -> `[]`. Un agent ecrit `.env` par script inline relatif sans aucun refus. | certain | Une ligne pour la branche `SCRIPTS`, ou un « on ne le couvre pas » assume dans l.61-66. |
| C3 | l.56 « `Read .env` et `Bash cat .env` rendent `None` » | Contre `garde_perimetre`, `Read` n'est ni dans `OUTILS_ECRITURE` (l.114) ni dans le matcher (`settings.json`:28) : le test rend `None` par construction, il est tautologique. La vraie garde de lecture est deja testee (`test_gardes.py`:82-83, `GardeDonneesTests`). | certain | Dire que la preuve de lecture reste dans `GardeDonneesTests`, et que le cas `Read` cote perimetre ne prouve rien. |
| C4 | l.58-59 (docs a mettre a jour) | Apres le changement, `.claude/README.md`:14 (« Refuse toute ecriture hors projet ») et la ligne des verrous de `CLAUDE.md` deviennent incompletes. | certain | Ajouter ces deux fichiers a la chaine. |
| C5 | l.57 vs l.72 | « une sonde de plus si utile » contre un critere binaire « 13 OK ». `doctor.py`:47-50 et 154 sondent deja le moteur `.env`. | certain | Trancher avant : pas de sonde (13) ou sonde nommee (14). |
| C6 | l.25-28 et l.61-66 | Le but affiche est de proteger la base partagee ; `DB_CONFIG=... python manage.py test` en ligne reste libre (fiche `developpeur-eve` l.33 : « aucun hook ne regarde `manage.py` »). | probable | Le dire dans « Ce qu'on ne fait pas » : le trou n'est pas ferme, seulement retreci. |
| C7 | l.17 (recours = main de Melvyn) | Installation d'un poste, copie `.env.example` -> `.env`, ou reparation apres bascule : refus. | a verifier | Ecrire le recours dans `securite.md` et verifier `/verif-setup`. |

Synthese : la chaine est incomplete a son maillon le plus bas, `_lib._ressemble_a_un_chemin`, et le perimetre annonce (l.35-37) ne peut pas produire l'effet annonce (l.55) ; C1 et C2 sont bloquants avant implementation, C5 doit etre tranche pour que le critere reste binaire.

Fichiers lus : `design-lot-2a.md`, `.claude\hooks\garde_perimetre.py`, `garde_donnees.py`, `_lib.py`, `.claude\settings.json`, `.claude\agents\developpeur-eve.md`, `.claude\rules\securite.md`, extraits de `doctor.py`, `tests\test_gardes.py`, `.claude\README.md`.
