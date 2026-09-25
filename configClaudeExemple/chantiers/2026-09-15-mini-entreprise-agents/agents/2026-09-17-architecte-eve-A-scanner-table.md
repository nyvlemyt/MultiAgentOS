# Rapport brut : architecte-eve A (interface minimale, table declarative), 17/09/2026

Depose tel quel par le fil. Brief : design-lot-3.md, corpus_contrat.py, les quatre fichiers de verrous, path-guard.ts de MAOS en lecture.

# Proposition A : un scanner, une table, deux fonctions

**Cartographie.** Trois analyseurs (`_lib._index_du_shell` l.106, `garde_perimetre._programmes_invoques` l.158, `garde_git._arguments_git` l.39), douze tables de verbes dans `garde_perimetre.py` (l.31 à 83), repli `commande.split()` dans `_lib.decouper_commande` l.208. Sonde du jour (`scratchpad/sonde_shlex.py`, sortie brute jointe plus bas) : `shlex` non POSIX leve `ValueError` sur `--format='%(x) %(y)'` et sur `@' '@` ; POSIX leve sur le heredoc a apostrophe et mange les antislashs Windows. Aucun reglage de `shlex` ne tient le corpus sans repli : je le remplace par un scanner maison, c'est l'ecart volontaire de cette proposition.

**Interface** (bloc ci-dessous). Quatre types nommes, deux fonctions, une table dans un fichier de donnees pur `_programmes.py` (zero fonction, zero import) lu par `_commande` et `_effets` : c'est ce qui evite le cycle syntaxe/semantique et fait tenir le savoir sur les programmes en un seul endroit. Invariants : `analyser` et `acces` ne levent jamais et ne touchent pas le disque ; `opaque` porte le motif, `invocations` ce qui a ete lu avant ; programme inconnu = aucun acces (limite ecrite, comme aujourd'hui). Deux modes seulement, `LIT` et `ECRIT` : rien dans le corpus ne distingue detruire d'ecrire, `origine` porte le verbe pour le message. `Invocation.amont` remplace `alimentee_par_tube` et `texte_amont` : `analyser` connait les tubes et `find -exec`, `acces` recoit les cibles amont pretes. Ordre : `analyser` une fois, `acces` par invocation, predicat du verrou. Pas de configuration.

**Ce que cache `_commande`.** Un scanner caractere par caractere (etats : nu, `'`, `"`, accent grave, `$(` avec profondeur, corps de heredoc, here-string PowerShell) rendant tokens dequotes, redirections (forme collee `2>/dev/null` comprise) et separateurs. Le corps d'un `<<TAG` est collecte jusqu'au TAG et retire ; il devient le code de l'invocation seulement si le programme est SHELL ou INTERPRETE sans option de code. `$(...)` et accents graves (Bash seulement ; en PowerShell l'accent grave echappe) : texte interne analyse a la meme profondeur, invocations ajoutees, token externe remplace par un espace reserve. Un mot n'est programme qu'en position : tete, apres ENVELOPPE (sauts : `-x`, chiffres, `VAR=x`, declencheurs comme `run`), apres `-exec`, apres `xargs`. SHELL avec code : profondeur +1, refus au dela de 1. INTERPRETE : le litteral de `os.system(` ou `subprocess.` est redecoupe. `eval`, `iex`, `-EncodedCommand`, SHELL sans code alimente par un tube, guillemet ou parenthese non fermee : `opaque`. Mode PowerShell : `[T]::M(` et `).M(` donnent une invocation `::m` ou `.m` dont les arguments sont ceux du groupe.

**Ce que cache `_effets`.** Un dispatch `dict[famille, fonction]`, dix fonctions de moins de quinze lignes ; les redirections deviennent des acces ici. `declencheurs` et `cibles` ont un sens par famille, documente une fois : le prix d'une table unique.

**Les six cas.** `heredoc_projet_apostrophe` : corps retire avant tout lexage, `cat` LIT, `>` ECRIT `chantiers/x/note.md` dans le projet, PASSE. `for_each_ref_format` : le scanner entre en etat `'` au milieu du token, `(` y est litteral, un seul argument d'option, `git` META, PASSE. `xargs_rm_projet` : `rm` avec `amont = (".", "*.pyc")`, relatifs donc dans le projet, PASSE ; `echo .env | xargs rm` donne `amont=(".env",)`, REFUS zone. `python_lit_env` : INTERPRETE, `.env` cite, aucun indice d'ecriture (`open(` nu n'en est plus un, seuls `'w'`, `.write(`, `os.remove`... le sont), LIT, PASSE ; avec `'w'` c'est ECRIT, REFUS. `substitution_dollar` : `git push --force` extrait de `$(...)`, invocation `git`, `garde_git._verifier` refuse. `env_push_force` : `env` ENVELOPPE, `git` en position, `enveloppes=("env",)`, meme refus ; `timeout 5`, `nice -n 5`, `uv run`, `GIT_TRACE=1` suivent la meme regle de sauts.

**Dependances.** En memoire : `re`, `typing`, `_lib` (socle chemin). `garde_git._est_un_fichier_existant` garde son `is_file`, preexistant, hors analyse.

**Migration**, une etape par fichier, retour = copie inverse depuis `etat-depart/lot-3/` : 1. `test_contrat.py` rouge, liste au journal. 2. `_programmes.py` + `_commande.py` + tests unitaires ; rien ne consomme, 98 verts. 3. `_effets.py` + tests par famille + test d'egalite sur les onze commandes de `garde_donnees`. 4. `garde_git` (section git du corpus verte). 5. `garde_perimetre` (perimetre, zone, `.git/`, PowerShell verts). 6. `garde_donnees` (balayage brut conserve). 7. Elagage de `_lib`, `doctor --complet`, puis doctrine reecrite depuis le corpus.

**Compromis.** Profondeur haute dans `_commande` (environ 150 lignes, la seule vraie complexite ; un lexeur maison a ses propres bugs, mitiges par le corpus et les mesures `shlex`). `_effets` volontairement plat. Champs de `Regle` surcharges par famille. Programme inconnu ouvert, comme aujourd'hui. Casse : tests couples a `decouper_commande`, `premier_mot`, `_programmes_invoques`, `_cibles_*`, `_arguments_git` (a reecrire sur `analyser` et `acces`) ; `grep` compte son motif comme chemin LIT (inoffensif : seul `garde_donnees` lit les LIT).

**Criteres.** Coherence 4 : signatures, `_verifier`, messages, style `frozenset`/NamedTuple conserves ; ecart : plus de `shlex`, un fichier de donnees en plus. Rayon 3 : cinq fichiers de la barriere, trois nouveaux, une quinzaine de tests a reecrire, aucun fichier suivi par git, aucun contrat `decision` change. Reversibilite 4 : etape par fichier, modules nouveaux supprimables, elagage de `_lib` en dernier. Testabilite 5 : deux fonctions pures sans E/S, table lisible, corpus, test d'egalite. Effort 2 : le scanner et ses tests coutent une journee et demie de fil avant les cycles contradictoires ; un `shlex` rafistole couterait moins et garderait un repli.

```python
# _programmes.py : la table, rien d'autre
class Regle(NamedTuple):
    famille: str                        # ENVELOPPE SHELL INTERPRETE XARGS FIND TOUT DESTINATION DEPLACE SI_OPTION OPTION_CIBLE LIT META
    declencheurs: tuple[str, ...] = ()  # ENVELOPPE : mots sautes ; SI_OPTION : options qui font ecrire ; SHELL/INTERPRETE : options portant le code
    cibles: tuple[str, ...] = ()        # options dont la valeur est une cible (curl -o, dd of=, tar -C, -Destination) ; XARGS : options a valeur

PROGRAMMES: dict[str, Regle] = {
    "env": Regle("ENVELOPPE"), "timeout": Regle("ENVELOPPE"), "uv": Regle("ENVELOPPE", ("run",)),
    "bash": Regle("SHELL", ("-c", "-lc")), "pwsh": Regle("SHELL", ("-command", "-c")), "cmd": Regle("SHELL", ("/c", "/k")),
    "python": Regle("INTERPRETE", ("-c",)), "node": Regle("INTERPRETE", ("-e",)),
    "xargs": Regle("XARGS", cibles=("-n", "-I", "-P")), "find": Regle("FIND"),
    "rm": Regle("TOUT"), "tee": Regle("TOUT"), "set-content": Regle("TOUT", cibles=("-path",)),
    "cp": Regle("DESTINATION", cibles=("-destination",)), "mv": Regle("DEPLACE"),
    "sed": Regle("SI_OPTION", ("-i", "--in-place")), "tar": Regle("SI_OPTION", ("-x", "x"), ("-C",)),
    "curl": Regle("OPTION_CIBLE", cibles=("-o", "--output")), "dd": Regle("OPTION_CIBLE", cibles=("of=",)),
    "::delete": Regle("TOUT"), ".delete": Regle("TOUT"), "::copy": Regle("DESTINATION"),
    "cat": Regle("LIT"), "grep": Regle("LIT"), "ls": Regle("META"), "git": Regle("META"), "npm": Regle("META"),
}

# _commande.py
class Invocation(NamedTuple):
    programme: str; args: tuple[str, ...]; redirections: tuple[tuple[str, str], ...]
    enveloppes: tuple[str, ...]; profondeur: int; amont: tuple[str, ...]; texte: str
class Analyse(NamedTuple):
    invocations: tuple[Invocation, ...]; opaque: str | None
def analyser(commande: str, outil: str) -> Analyse: ...     # jamais d'exception, jamais de disque

# _effets.py
class Acces(NamedTuple):
    chemin: str; mode: str; origine: str                     # mode : "LIT" | "ECRIT"
def acces(inv: Invocation) -> list[Acces]: ...              # programme inconnu : []

# garde_perimetre.decision, branche shell, signature inchangee
analyse = _commande.analyser(commande, nom_outil)
if analyse.opaque:
    return f"REFUS garde_perimetre : {analyse.opaque}. Regle securite.md : une commande doit etre lisible..."
ecrits = [a for inv in analyse.invocations for a in _effets.acces(inv) if a.mode == "ECRIT"]
protege = next((a.chemin for a in ecrits if _zone_protegee(a.chemin)), None)
sous_git = next((a.chemin for a in ecrits if _sous_dot_git(a.chemin, racine)), None)
hors = next((a.chemin for a in ecrits if not _dans_perimetre(a.chemin, racine, autorisees)), None)
```

**Preuve de la sonde `shlex`** (python 3, scratchpad, aucun fichier du projet modifie) :
```
for_each_ref    posix=False ValueError: No closing quotation
for_each_ref    posix=True  OK ['git', 'for-each-ref', '--sort=-committerdate', '--format=%(committerdate:short) %(refname:short)', ...]
herestring_ps   posix=False ValueError: No closing quotation
heredoc         posix=False OK (le corps est lexe : 'rm', 'C:/dev/maos/CLAUDE.md' deviennent des tokens)
heredoc         posix=True  ValueError: No closing quotation
guillemets_ko   posix=False ValueError: No closing quotation
subst           posix=False OK ['echo', '$', '(', 'git', 'push', '--force', ')']
bash_c_echappes posix=False OK ['bash', '-c', '"rm \\"', 'chantiers/x/tmp.txt\\""']   (token casse en deux)
```

**Fait durable a proposer au fil** (je n'ecris pas en memoire) : `shlex` non POSIX avec `punctuation_chars=True` echoue sur une quote ouverte au milieu d'un token (`--format='...'`) et sur les here-strings PowerShell ; le mode POSIX echoue sur les heredocs a apostrophe. Mesure le 17/09/2026.

Fichiers lus : design-lot-3.md, corpus_contrat.py, _lib.py, garde_perimetre.py, garde_git.py, garde_donnees.py, `origin/feat/path-guard-s5:packages/core/src/path-guard.ts` de MAOS (motif : dependances injectees, echec ferme, `.git/` refuse). Sonde ecrite dans le scratchpad de la session. Aucun fichier du projet modifie, aucune donnee lue.
