# Rapport brut : relecteur-eve, attaque de la spec du lot 2a, axe niveau de preuve

Lance dans la nuit du 16/09/2026. Depose tel quel, sans reformulation. Les affirmations
ci dessous n'engagent que l'agent tant que le fil ne les a pas reverifiees (voir `attaques/attaque-spec-lot-2a.md`).

---

## Attaque de spec, axe niveau de preuve : `chantiers/2026-09-15-mini-entreprise-agents/design-lot-2a.md`

| # | Ligne visee | Scenario qui casse | Confiance |
| --- | --- | --- | --- |
| **P1** | l.55 « redirection, `cp`, `mv`, `tee`, `sed -i` vers `.env*` refuses » + l.70 « 1 refus par redirection » | Un token nu `.env` n'est **jamais** vu comme un chemin : `_lib._ressemble_a_un_chemin` (`_lib.py` l.115) finit par `and not token.startswith(".")`. Donc `_cibles_ecriture` (`garde_perimetre.py` l.88) rend une liste vide. Sonde brute : `'.env' False` / `'.env.dev1' False` / `'sed -i s@a@b@ .env' [[]]` / `'tee .env' [[]]` / `'cp x .env' [[]]` / `'mv x .env' [[]]` / `'rm .env' [[]]` / `'touch .env.dev1' [[]]` / `'echo x > .env' [['.env']]`. Seule la redirection sort une cible (`_cibles_redirections` l.69-80 n'appelle pas le detecteur). La spec ne teste que ce seul cas qui marche : `tee .env`, `cp x .env`, `sed -i ... .env` partiraient verts et non couverts. Correctif : filtrer sur le nom de fichier avant le test « ressemble a un chemin », et un cas de test par verbe annonce l.55. | certain |
| **P2** | l.72 « Mesurable : `doctor --complet` rend 13 OK, 0 alerte » | Sortie brute d'aujourd'hui, avant tout correctif : `doctor EVE : 13 OK, 0 alerte(s).` Le critere est deja satisfait, il ne mesure rien. Correctif : soit la sonde `.env` est obligatoire (pas « si utile », l.57) et le critere devient 14 OK, soit on retire le critere. | certain |
| **P3** | l.35-36 « toute ecriture ... ou qu'elle soit » | Branche `SCRIPTS` (`garde_perimetre.py` l.102-105) : seuls les chemins **absolus** sont extraits (`_MOTIF_CHEMIN_ABSOLU_LOCAL`, l.41). Sonde : `python -c "open('.env','w').write('x')" [[]]`. Aucun cas de test script dans les six. Correctif : un cas `python -c ... open('.env','w')` ou restreindre l'affirmation. | certain |
| **P4** | l.48 « Message de refus distinct de celui du perimetre » | Aucune preuve en face (l.52-59). Un test en `assertIsNotNone` reste vert avec le message actuel, qui dirait « ecriture hors perimetre sur .env » (l.132) pour un fichier **dans** le perimetre : message faux, reformulation introuvable. Correctif : `assertIn("env", msg)` sur le motif du nouveau message. | certain |
| **P5** | l.56 et l.70 « 2 lectures autorisees » vs l.73 « si le test ne peut pas rougir » | `Read` n'est ni dans `OUTILS_ECRITURE` ni dans `OUTILS_SHELL` (l.114-119) et `cat` n'est dans aucun jeu de verbes : ces deux cas sont verts avant le correctif et le resteront quoi qu'on ecrive dans `_cibles_ecriture`. Ils gardent une valeur de non regression, mais la porte d'arret doit porter sur les 4 refus seulement. | certain |
| **P6** | l.54 (4 outils) vs l.70 (« 3 refus par outil d'ecriture ») | Un outil des quatre reste sans cas ; si c'est `NotebookEdit`, c'est justement celui qui passe par une autre clef (`notebook_path`, `_lib.py` l.139). Correctif : 4 cas, un par outil. | probable |

Verifie et solide : l.71, `grep -c "def test_"` rend bien `58`.

Synthese : la spec vise juste le bon verrou, mais son unique preuve shell tombe sur le seul chemin qui fonctionne deja ; quatre des cinq mecanismes d'ecriture annonces l.55 resteraient ouverts, et le critere « mesurable » est vert avant le correctif.
