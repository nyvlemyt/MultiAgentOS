# Rapport brut : architecte-eve B (objets, registre de familles, ports et adaptateurs), 17/09/2026

Depose tel quel par le fil (bloc de code illustratif inclus). Brief : design-lot-3.md, corpus_contrat.py, les quatre fichiers de verrous, path-guard.ts de MAOS en lecture.

## Proposition B : objets, registre de familles, ports et adaptateurs

Fichiers lus : `design-lot-3.md`, `corpus_contrat.py`, `_lib.py`, `garde_perimetre.py`, `garde_git.py`, `garde_donnees.py` (même dossier), `path-guard.ts` de MAOS (motif : fonction pure, dépendances injectées, échec fermé). Aucun fichier modifié. Une sonde `shlex` dans le scratchpad (sortie ci-dessous), rien d'autre exécuté.

**Fait mesuré qui commande la conception** (sonde, `.venv` du projet) : `shlex` non POSIX lève `ValueError` sur `--format='%(x) %(y)'`, sur `@'...'@` et casse `bash -c "rm \"x\""` en deux tokens ; `shlex` POSIX lit ces trois formes mais lève sur l'apostrophe d'un corps de heredoc. Conclusion : le corps des documents en ligne et les substitutions se retirent **avant** le lexeur par un balayeur maison conscient des guillemets ; `shlex` POSIX ne voit qu'une ligne propre. Incidemment, le refus que mon propre appel a essuyé (`REFUS ... /dev/null;`) est le faux positif du matin, rejoué en direct.

### 1. Interface

`_commande.py`
- `Redirection(operateur, cible)`, `Invocation(programme, args, redirections, enveloppes, profondeur, alimentee_par_tube, texte_amont, corps_document, outil, texte)`, `Analyse(invocations, opaque)` : dataclasses gelées.
- Port `Lexeur` (Protocol) : `segments(texte) -> Segments`, où `Segments` porte `liste: list[Segment]` et `opaque: str | None` ; `Segment` porte `tokens`, `separateur_avant` (`|` marque un tube), `corps_document`, `substitutions: list[str]`.
- Adaptateurs : `LexeurBash` (balayeur : heredoc `<<`/`<<-`, `$(...)` avec profondeur de parenthèses, accents graves ; puis `shlex` POSIX `punctuation_chars`) et `LexeurPowerShell` (here-strings `@'..'@`, `@"..."@`, accent grave = échappement, pas substitution). Registre `LEXEURS = {"Bash": ..., "PowerShell": ...}`. Deux adaptateurs réels, donc la seam est justifiée.
- Registres d'objets : `ENVELOPPES` (`Enveloppe(nom, consomme_numerique, options_avec_valeur, sous_commandes)` : `env`, `timeout`, `nice -n`, `stdbuf`, `command`, `nohup`, `sudo`, `winpty`, `start`, `uv run`, `xargs` avec `tube=True`), `SHELLS` (`Shell(nom, options_commande, option_encodee)`), `OPAQUES` (`eval`).
- `analyser(commande, outil, lexeur=None) -> Analyse` : pure, aucune exception ne sort, aucune E/S ; `opaque` reçoit le motif exact (guillemets non équilibrés après retrait des documents, plus d'un niveau de shell, encodé, `eval`, shell alimenté par un tube ou un document sans `-c`, ce dernier devient commande interne au niveau 1). Les substitutions s'analysent au même niveau ; un shell imbriqué au niveau +1.

`_effets.py`
- `Mode = LIT | ECRIT | DETRUIT | LISTE` (`LISTE` est mon écart à la spec : `ls_token` doit refuser quand `ls_provider` passe, donc la famille métadonnées doit rendre un accès typé, pas rien).
- `Acces(chemin, mode, origine)`.
- Classe de base `Famille(programmes: frozenset[str])` avec `reconnait(inv) -> bool` (défaut : nom) et `acces(inv) -> list[Acces]`. Sous-classes : `ToutesCibles(mode, options_cible)`, `Destination(options)`, `Deplacement`, `EditionEnPlace`, `OptionCible(options, mode)` (curl, wget, dd, tar, patch), `Find`, `Interprete`, `Lecteur`, `Metadonnees`, `GestionnaireDePaquets`, `DotNet` (reconnaît `::`/`).` si `outil == "PowerShell"`), `Inconnue`. `Redirections` s'applique à toute invocation.
- `Registre.enregistrer(f)`, `Registre.pour(inv) -> Famille` (jamais None : `Inconnue`). `acces(inv) -> list[Acces]` est la façade que la spec nomme ; `texte_amont` vit dans l'invocation.

Ordre : `analyser` puis si `opaque` refus, puis `acces` par invocation, puis prédicat du verrou. Signatures `garde_*.decision` inchangées.

### 2. Ce que la seam cache
Le lexeur, les séparateurs, la reconnaissance des enveloppes et de leur argument numérique, `find -exec` et `xargs` (le programme aval reçoit `alimentee_par_tube` et `texte_amont`), l'extraction des redirections (`2`, `>`, `/dev/null` en trois tokens POSIX : le chiffre isolé devant `>` est un descripteur), le redécoupage des shells, les indices d'écriture des interprètes.

### 3. Dépendances
En mémoire : `shlex`, `re`, `dataclasses`, `typing.Protocol`. Substituable localement : `Lexeur`. Distante possédée : `_lib` (socle chemin conservé). Externe : aucune.

### 4. Les six cas
- `heredoc_projet_apostrophe` : `LexeurBash` détache le corps avant `shlex` ; `cat` est `Lecteur`, `>` rend `ECRIT PROJET`, le corps n'est relu que si le programme est `Shell` ou `Interprete` : PASSE.
- `for_each_ref_format` : `shlex` POSIX rend un token `--format=%(...) %(...)` ; `%(` n'est pas `$(` ; `git` sans famille d'écriture, `head` lecteur : PASSE, aucun `/dev/null;`.
- `xargs_rm_projet` : `Enveloppe("xargs", tube=True)` donne `rm`, `alimentee_par_tube`, `texte_amont = "find . -name '*.pyc'"` ; `ToutesCibles(DETRUIT)` prend les chemins cités en amont (`.`, `*.pyc`), dans le projet : PASSE (`xargs_rm_hors` et `xargs_rm_env` refusent par le même chemin).
- `python_lit_env` : `Interprete` rend `LIT .env` (indice d'écriture = `open(..., 'w|a|x|+')`, `.write(`, `os.remove`, `shutil.`... absents) ; la zone protégée ne juge que `ECRIT|DETRUIT` : PASSE.
- `substitution_dollar` : le balayeur extrait `git push --force`, réanalysé au même niveau, invocation `git`, `_verifier` REFUS.
- `env_push_force` : `Enveloppe("env")` traversée, programme `git`, `args = push --force` : REFUS ; une seule résolution pour les trois verrous.

### 5. Migration réversible
0. Copies dans `etat-depart/lot-3/`, `test_contrat.py` rouge, liste au journal.
1. `_commande.py` + tests unitaires : rien ne l'importe, tout reste vert.
2. `_effets.py` + registre : idem.
3. `garde_git.decision` bascule ; `_arguments_git` se réduit au retrait des options globales sur `inv.args`. Vert : 98 tests, cas git du corpus.
4. `garde_perimetre.decision` bascule ; `VERBES_*` supprimées ; prédicat `.git/` ajouté.
5. `garde_donnees._decision_shell` bascule ; balayage brut conservé hors famille `Metadonnees` ; test d'égalité des onze commandes.
6. `_lib` amputé ; tests internes réécrits sur `analyser`/`acces`.
7. `doctor`, README, doctrine après mesure.
Retour à chaque étape : recopie du fichier depuis `etat-depart`, les nouveaux modules restent inertes.

### 6. Compromis
Profondeur haute sur `_commande` (le balayeur maison est le seul code délicat, environ 80 lignes) et sur le registre (une famille ajoutée vaut pour trois verrous). Profondeur faible sur `DotNet` et `Interprete` : de l'heuristique textuelle, limite à écrire. Ça casse : les tests couplés à `decouper_commande`, `premier_mot`, `_cibles_*`. Le style objets (Protocol, sous-classes) n'existe nulle part dans `.claude/hooks/` aujourd'hui, tout est frozensets et fonctions : c'est un écart assumé, qui se paie en lignes.

### 7. Critères
- Cohérence avec l'existant : 3. Découpage et signatures de la spec respectés ; le style objets est nouveau dans les hooks.
- Rayon d'impact : 3. Deux fichiers créés, quatre modifiés, zéro table, zéro contrat public ; une vingtaine de tests internes à réécrire.
- Réversibilité : 4. Une bascule par fichier, copie inverse à chaque étape ; seul le retrait de `_lib` (étape 6) est irréversible sans réécriture des tests.
- Testabilité : 5. Lexeur injecté, `analyser` pure sans E/S, chaque famille testable seule, corpus contre `decision()`.
- Effort : 2. Une douzaine de classes et un balayeur maison : deux à trois jours de fil, plus que la variante table.

```python
# Illustratif, pas de production.
class Lexeur(Protocol):
    def segments(self, texte: str) -> Segments: ...

@dataclass(frozen=True)
class Invocation:
    programme: str; args: tuple[str, ...]; redirections: tuple[Redirection, ...]
    enveloppes: tuple[str, ...]; profondeur: int; alimentee_par_tube: bool
    texte_amont: str; corps_document: str | None; outil: str; texte: str

class Famille:
    programmes: frozenset[str] = frozenset()
    def reconnait(self, inv: Invocation) -> bool: return inv.programme in self.programmes
    def acces(self, inv: Invocation) -> list[Acces]: return []

class ToutesCibles(Famille):
    def __init__(self, programmes, mode, options_cible=frozenset()): ...
    def acces(self, inv):
        cibles = [a for a in inv.args if not a.startswith("-")] + _valeurs(inv.args, self.options_cible)
        if inv.alimentee_par_tube: cibles += _chemins_cites(inv.texte_amont)
        return [Acces(c, self.mode, "toutes_cibles") for c in cibles if _cible_reelle(c)]

REGISTRE = Registre([ToutesCibles({"rm", "del", "remove-item"}, Mode.DETRUIT), Deplacement({"mv", "move-item"}),
                     Interprete({"python", "node"}), Find(), DotNet(), Metadonnees({"ls", "get-childitem"}), Inconnue()])

def decision(nom_outil, entree_outil, racine=None, racines_autorisees=None):   # garde_perimetre, signature inchangee
    analyse = analyser(entree_outil.get("command", ""), nom_outil)
    if analyse.opaque: return f"REFUS garde_perimetre : {analyse.opaque}. ..."
    for inv in analyse.invocations:
        for a in (x for x in acces(inv) if x.mode in {Mode.ECRIT, Mode.DETRUIT}):
            if _zone_protegee(a.chemin): return "... zone protegee ..."
            if _sous_git_dir(a.chemin, racine) or not _dans_perimetre(a.chemin, racine, autorisees): return "... hors perimetre ..."
    return None
```

Fait à proposer pour la mémoire (le fil décide) : `shlex` POSIX est le bon mode pour les hooks à condition de retirer les documents en ligne avant ; le non POSIX est la source des deux `ValueError` du matin.
