# Intake : le motif « path guard » et la table de risque de MAOS, pour le lot 3

Grille : `.claude/skills/REGISTRE.md`, procedure d'ajout (version EVE de `intake-audit`). Ecrit le 17/09/2026
par le fil, avant d'ecrire une ligne du lot 3.

## 0. Contraintes dures

Aucune ne s'applique : pas de cle API, pas de code non epingle (rien n'est installe), rien ne sort de la
machine, pas de doublon (EVE n'avait pas d'analyseur unique). Touche la configuration du poste (les
verrous) : **niveau structurant**, tenu (deux architectes, spec et plan attaques, verification
contradictoire).

## 1. Identite

- `C:\dev\maos`, branche `origin/feat/path-guard-s5` (commits `396881a`, `feeaf3b`, `a591769` du
  15/09/2026), fichiers `packages/core/src/path-guard.ts` (179 lignes) et `path-guard.test.ts` (199 lignes) :
  le pendant « chemin » du §5 de la doctrine MAOS (« any write to a path outside the project »).
- `origin/main` (`d8a14f7`, 13/09/2026) : `packages/core/src/risk-classifier.ts` (table `BLOCKING_RULES`,
  fonction pure sans E/S) et `docs/backlog/perms-category-matcher-brittleness.md`.
- Lus a la source le 17/09/2026 apres `git fetch` (aucun merge). Fraicheur : deux jours.

## 2. Ce que ca ameliore, concretement

Les verrous `garde_perimetre`, `garde_git`, `garde_donnees` et leur socle. Quatre motifs portes, jamais le
code (TypeScript, runtime Node, `realpath` injecte : rien de tout cela n'existe dans un hook Python) :

1. **Fonction pure, cas de contrat en table, zero disque dans les tests** : `corpus_contrat.py` (318 cas),
   `_commande.analyser` et `_effets.acces` sans E/S.
2. **Echec ferme** (« a wrong split can only produce a bogus path, which fails CLOSED ») : `Analyse.opaque`
   refuse au lieu du repli `split()` ; `_lib.executer` refuse quand un verrou leve.
3. **`.git/` jamais ecrit** (hooks = execution de code) : troisieme regle de `garde_perimetre`.
4. **Une table en lecture seule, source unique, pas de litteraux disperses** (`BLOCKING_RULES`) :
   `_programmes.py`.

Ce que MAOS dit lui-meme de ses limites, et qu'EVE ne reprend pas : « la sous-chaine n'est pas de la
comprehension » (le classifieur de risque compare du texte de tache par `.includes()`) ; EVE analyse des
commandes shell, pas des titres de taches, donc le scanner remplace la sous-chaine.

Qui couvrait deja la fonction : trois analyseurs divergents dans les verrous d'EVE. C'est la dette que le
lot ferme.

## 3. Les trois couts

| Cout | Reponse |
| --- | --- |
| Installation | rien a installer ; quatre modules ecrits au format EVE, 1 704 lignes de hooks au total, tous testes |
| Maintien | la table `_programmes.py` est le seul endroit a tenir ; une famille ajoutee vaut pour les trois verrous ; le corpus dit ce qui est promis |
| Retrait | copies de depart dans `etat-depart/lot-3/` ; apres T7 le retour est total (six fichiers), ecrit au plan r2 |

## 4. Lecture integrale et assainissement

Les deux fichiers TypeScript et le backlog lus en entier. Aucun appel reseau, aucun script, aucune
dependance emportee : rien n'est copie. Assainissement sans objet (aucun contenu exterieur n'entre dans
EVE, seulement des idees).

## 5. Decision

**`adapter`.** Le motif vaut, l'implementation non : hook Python sans dependance contre module Node avec
`realpath` injecte ; la resolution des liens symboliques (jonctions) est notee comme limite, non portee.

## 7. Ce qui devient la version EVE

`_programmes.py`, `_commande.py`, `_effets.py`, `_lib.executer`, la regle `.git/` de `garde_perimetre`,
`corpus_contrat.py`. Source citee en tete de chaque fichier.

## 8. Re-audit

2026-12, avec les fiches d'agents : relire `origin/feat/path-guard-s5` si elle a ete fusionnee (Melvyn)
et comparer la liste des cas de `path-guard.test.ts` au corpus.
