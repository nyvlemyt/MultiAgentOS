"""
De l'invocation aux acces : ce qu'une commande lit, ecrit ou liste, chemin par chemin.

`acces(invocation)` rend la liste des `Acces(chemin, mode, origine)` que l'invocation produit, d'apres
la famille de son programme dans `_programmes.PROGRAMMES`. C'est le seul catalogue d'effets du poste :
une famille ajoutee ici vaut d'un coup pour le perimetre, la zone protegee et les donnees. C'est la
reponse a la dette des deux tables divergentes (`revue-lot-2b1.md`, finding 3).

Trois modes. `ECRIT` : le chemin est cree, modifie, supprime ou deplace. `LIT` : son contenu est lu.
`META` : seuls son nom, sa taille ou ses dates sont lus. Detruire n'est pas distingue d'ecrire (aucune
regle du poste ne le demande) ; `origine` porte le verbe pour le message de refus.

Les chemins sont rendus **bruts**, tels que cites, sauf qu'un chemin relatif est prefixe du repertoire
courant quand un `cd` precede dans la meme ligne. Un chemin peut porter un glob (`*.pyc`), une accolade
(`.{env,bak}`) ou la marque d'une valeur inconnue : la resolution, la normalisation et les predicats (hors
perimetre, zone protegee, donnees) restent aux verrous. Une seule lecture du disque : savoir si une destination est un dossier (noms seulement).
"""
import os
import re
from typing import NamedTuple

import _lib
import _programmes as P
from _commande import MARQUE_INCONNU, MARQUE_TUBE, Invocation

LIT = "LIT"
ECRIT = "ECRIT"
META = "META"


class Acces(NamedTuple):
    chemin: str
    mode: str
    origine: str


_MOTIF_AFFECTATION = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")
# Un chemin absolu Windows (C:\x, C:/x), Git Bash (/c/x) ou UNC, y compris a l'interieur de code cite.
_MOTIF_CHEMIN_ABSOLU = re.compile(r"""(?:[A-Za-z]:[\\/]|/[A-Za-z]/|\\\\)[^\s"'`()<>|;,]+""")
# Un litteral entre guillemets qui ressemble a un chemin relatif (`'chantiers/x/a.txt'`, `'tmp_uploads/x.parquet'`).
_MOTIF_LITTERAL_CHEMIN = re.compile(r"""['"]([^'"\s]*[\\/][^'"\s]*|[^'"\s/\\]+\.[A-Za-z0-9]{1,6})['"]""")
_MOTIF_LITTERAL = re.compile(r"""'([^']*)'|"((?:[^"\\]|\\.)*)"|`([^`]*)`""")
# Le nom d'un fichier de configuration d'environnement a l'interieur de code : ancre a gauche pour ne pas
# attraper `os.environ`, `config.env` ni `.venv`.
_MOTIF_FICHIER_ENV = re.compile(r"(?<![A-Za-z0-9_.])\.env[A-Za-z0-9._-]*")
_MOTIF_MODE_ECRITURE = re.compile(P.MOTIF_MODE_ECRITURE)
_MOTIF_OPTION_I = re.compile(r"^-[A-Za-z]*i")


# Un commutateur a la mode Windows : `/Y`, `/MIR`, `/S`, `/E`, `/LOG:x`.
_MOTIF_COMMUTATEUR = re.compile(r"^/[A-Za-z][A-Za-z0-9]*(:[^\s]*)?$")

def _cible_reelle(candidat: str) -> bool:
    """Faux pour un residu de decoupage (`\\`, `/`, vide) et pour une substitution de processus (un tube,
    pas un fichier). Une valeur inconnue (marque) est gardee : les verrous la refusent en position
    d'ecriture plutot que de l'ignorer."""
    return bool(candidat.strip("\"'\\/ \t")) and MARQUE_TUBE not in candidat


def _positionnels(args: tuple[str, ...]) -> list[str]:
    # Un commutateur Windows (`/Y`, `/MIR`, `/S`) n'est pas un positionnel : le compter faisait glisser
    # la destination d'un rang, et le commutateur lui meme passait pour une cible ecrite (lot 4, cycle 2).
    return [a for a in args
            if a and not a.startswith("-") and not _MOTIF_COMMUTATEUR.match(a)
            and not _MOTIF_AFFECTATION.match(a) and a not in {";", "+", "{}"}]


def _correspond(option: str, cible: str, powershell: bool) -> bool:
    """`-o` vaut `-o` ; en PowerShell, `-Dest` vaut `-Destination` (prefixe non ambigu, trois caracteres au moins)."""
    if option == cible:
        return True
    return powershell and len(option) >= 3 and cible.startswith(option) and cible.startswith("-")


def _consommes_par_options(args: tuple[str, ...], options: tuple[str, ...], powershell: bool) -> tuple[list[str], set[int]]:
    """Les valeurs des options nommees, sous toutes leurs formes, et les indices des tokens consommes."""
    valeurs: list[str] = []
    consommes: set[int] = set()
    basses = tuple(o.lower() for o in options)
    for i, a in enumerate(args):
        bas = a.lower()
        for o in basses:
            if o.endswith("="):
                if bas.startswith(o):
                    valeurs.append(a[len(o):])
                    consommes.add(i)
            elif _correspond(bas, o, powershell):
                if i + 1 < len(args):
                    valeurs.append(args[i + 1])
                    consommes.update({i, i + 1})
            elif bas.startswith(o + "=") and o.startswith("--"):
                valeurs.append(a[len(o) + 1:])
                consommes.add(i)
            elif len(o) == 2 and not o.startswith("--") and bas.startswith(o) and len(a) > 2 and a[2] not in "=":
                valeurs.append(a[2:])  # `-oC:/dev/maos`, `-dDIR`
                consommes.add(i)
            elif len(o) == 2 and o.startswith("-") and not o.startswith("--") and bas.startswith("-") and not bas.startswith("--") \
                    and len(bas) > 2 and bas[-1] == o[1] and bas[1:-1].isalpha() and i + 1 < len(args):
                valeurs.append(args[i + 1])  # `-sSo FICHIER` : l'option est en fin de groupe court
                consommes.update({i, i + 1})
    return valeurs, consommes


def _positionnels_hors_options(args: tuple[str, ...], options: tuple[str, ...], powershell: bool) -> list[str]:
    _, consommes = _consommes_par_options(args, options, powershell)
    # Meme lecture que `_positionnels` : un commutateur Windows n'est pas un positionnel.
    return [a for i, a in enumerate(args)
            if i not in consommes and a and not a.startswith("-") and not _MOTIF_COMMUTATEUR.match(a)
            and not _MOTIF_AFFECTATION.match(a) and a not in {";", "+", "{}"}]


def _declenche(args: tuple[str, ...], declencheurs: tuple[str, ...]) -> bool:
    """Vrai si une option de declenchement est presente : `-i`, `-i.bak`, `--in-place`, `--in-place=x`."""
    for a in args:
        for d in declencheurs:
            if not d:
                continue
            if d.startswith("--"):
                bas = a.lower()
                if bas == d or bas.startswith(d + "="):
                    return True
                continue
            # Option courte d'une seule lettre : la casse compte. `xz -C crc32` est une somme de
            # controle, pas `-c`, et `xz -T0` est un nombre de fils, pas `-t` (lot 3bis, cycle 2).
            # Une option a nom long sans double tiret (`-DestinationPath` de PowerShell) reste
            # insensible a la casse, comme PowerShell la lit (lot 4, cycle 3).
            if len(d) > 2:
                bas = a.lower()
                if bas == d.lower() or bas.startswith(d.lower() + "=") or bas.startswith(d.lower()):
                    return True
            elif a == d or a.startswith(d + "=") or a.startswith(d):
                return True
            # Un groupe d'options courtes vaut ses lettres : `-dc` vaut `-d -c`, `-9c` aussi (le
            # niveau de compression ne change rien a la sortie sur le tube). Ce qui protege de
            # confondre `-T0` avec `-t`, c'est la casse, verifiee juste au-dessus.
            if len(d) == 2 and a.startswith("-") and not a.startswith("--"):
                corps = a[1:].split("=", 1)[0]
                if corps.isalnum() and d[1] in corps:
                    return True
    return False


def _litteral_est_un_chemin(litteral: str) -> bool:
    """Faux pour une sequence d'echappement (`\\u2014`, `\\n`) : un antislash sans lecteur ni barre oblique n'est pas un chemin."""
    if "\\" not in litteral:
        return True
    return "/" in litteral or bool(re.match(r"^[A-Za-z]:\\", litteral)) or litteral.startswith("\\\\\\\\")


def _chemins_dans_le_code(code: str) -> list[str]:
    # Dans du code, `\\u2014` (deux antislashs puis une lettre) est une sequence d'echappement ecrite en
    # source, pas un chemin UNC : un vrai UNC s'y ecrit avec quatre antislashs.
    chemins: list[str] = [m.group(0).rstrip(".:") for m in _MOTIF_CHEMIN_ABSOLU.finditer(code) if _litteral_est_un_chemin(m.group(0))]
    chemins.extend(m.group(1) for m in _MOTIF_LITTERAL_CHEMIN.finditer(code) if _litteral_est_un_chemin(m.group(1)))
    chemins.extend(_MOTIF_FICHIER_ENV.findall(code))
    vus: list[str] = []
    for c in chemins:
        if c not in vus:
            vus.append(c)
    return vus


def code_ecrit(code: str) -> bool:
    """Vrai si un script inline porte un indice d'ecriture ou un mode d'ouverture en ecriture."""
    bas = code.lower()
    return any(i in bas for i in P.INDICES_ECRITURE_SCRIPT) or bool(_MOTIF_MODE_ECRITURE.search(code))


def _script_du_depot(args: tuple[str, ...]) -> tuple[str | None, tuple[str, ...]]:
    """Le premier positionnel s'il est un script connu du depot, et les options qui le font ecrire."""
    for a in _positionnels(args):
        nom = a.replace("\\", "/").rsplit("/", 1)[-1].lower()
        if nom in P.SCRIPTS_DU_DEPOT_QUI_ECRIVENT:
            return a, P.SCRIPTS_DU_DEPOT_QUI_ECRIVENT[nom]
        break
    return None, ()


def _prefixe_base(chemin: str, base: str | None) -> str:
    if base is None or re.match(r"^([A-Za-z]:|/|~|\\\\|\$)", chemin):
        return chemin
    return base.rstrip("/\\") + "/" + chemin


def _acces_git(inv: Invocation) -> list[tuple[str, str]]:
    """`rm`, `mv`, `clean`, `clone`, `init`, `worktree add` ecrivent ; ce qui n'est pas en lecture seule
    ecrit dans le depot de `-C` ; le reste ne fait que des metadonnees."""
    args = list(inv.args)
    base: str | None = None
    i = 0
    while i < len(args) and args[i].startswith("-"):
        if args[i] in P.GIT_OPTIONS_GLOBALES_AVEC_VALEUR and i + 1 < len(args):
            if args[i] == "-C":
                base = args[i + 1]
            i += 2
        else:
            i += 1
    if i >= len(args):
        return [(base, META)] if base else []
    sous, reste = args[i], tuple(args[i + 1:])
    positionnels = _positionnels(reste)
    resultat: list[tuple[str, str]] = []
    if base is not None:
        resultat.append((base, META if _git_lit_seulement(sous, reste, positionnels) else ECRIT))
    if sous in P.GIT_SOUS_COMMANDES_QUI_ECRIVENT and "--cached" not in reste:
        cibles = positionnels or ([base] if sous == "clean" and base else ["."] if sous == "clean" else [])
        resultat.extend((_prefixe_base(p, base), ECRIT) for p in cibles)
    elif sous == "clone":
        cible = positionnels[1] if len(positionnels) >= 2 else (positionnels[0].rstrip("/").rsplit("/", 1)[-1].removesuffix(".git") if positionnels else "")
        if cible:
            resultat.append((_prefixe_base(cible, base), ECRIT))
    elif sous == "init":
        resultat.append((_prefixe_base(positionnels[0] if positionnels else ".", base), ECRIT))
    elif sous == "worktree" and positionnels[:1] == ["add"] and len(positionnels) >= 2:
        resultat.append((_prefixe_base(positionnels[1], base), ECRIT))
    else:
        mode = LIT if sous == "rm" else META
        resultat.extend((_prefixe_base(p, base), mode) for p in positionnels)
    return resultat


def _git_lit_seulement(sous: str, reste: tuple[str, ...], positionnels: list[str]) -> bool:
    """Vrai si cette sous-commande git ne modifie pas le depot : `log`, `stash list`, `branch -a`, `config --get`..."""
    if sous not in P.GIT_SOUS_COMMANDES_LECTURE_SEULE:
        return False
    if sous == "stash":
        return positionnels[:1] in (["list"], ["show"])
    if sous == "worktree":
        return positionnels[:1] == ["list"]
    if sous == "reflog":
        return positionnels[:1] not in (["delete"], ["expire"])
    if sous == "remote":
        return positionnels[:1] in ([], ["show"], ["get-url"], ["-v"])
    if sous == "branch":
        return not any(o in {"-d", "-D", "-m", "-M", "-c", "-C", "-f", "--delete", "--move", "--copy", "--force", "--set-upstream-to", "-u", "--unset-upstream", "--edit-description"} for o in reste) and len(positionnels) == 0
    if sous == "tag":
        return not positionnels and not any(o in {"-d", "--delete", "-a", "-s", "-f"} for o in reste)
    if sous == "config":
        return len(positionnels) <= 1 and not any(o in {"--unset", "--unset-all", "--add", "--replace-all", "--edit", "-e", "--rename-section", "--remove-section"} for o in reste)
    if sous == "symbolic-ref":
        return len(positionnels) <= 1
    return True


def _acces_find(inv: Invocation) -> list[tuple[str, str]]:
    args = inv.args
    departs: list[str] = []
    debut = 0
    # Les options globales de find precedent ses points de depart : sans les sauter, `find -L <chemin>`
    # perdait son chemin (trou 2 du lot 4).
    while debut < len(args) and args[debut] in P.FIND_OPTIONS_GLOBALES:
        debut += 1 + (1 if args[debut] in P.FIND_OPTIONS_GLOBALES_AVEC_VALEUR else 0)
    for a in args[debut:]:
        if a.startswith("-") or a in {"(", ")", "!"}:
            break
        departs.append(a)
    resultat: list[tuple[str, str]] = []
    valeurs, _ = _consommes_par_options(args, tuple(P.FIND_OPTIONS_QUI_ECRIVENT_VALEUR), False)
    resultat.extend((v, ECRIT) for v in valeurs)
    if any(a.lower() in P.FIND_ACTIONS_QUI_ECRIVENT for a in args):
        motifs, _ = _consommes_par_options(args, tuple(P.FIND_OPTIONS_MOTIF), False)
        departs = departs or ["."]  # sans point de depart, find prend le dossier courant
        resultat.extend((d, ECRIT) for d in departs)
        if motifs:
            resultat.extend((m, ECRIT) for m in motifs)
        else:
            # Sans motif de nom, la suppression peut atteindre n'importe quel fichier du point de depart :
            # on le dit par un glob, que le verrou juge (il atteint `.env`).
            resultat.extend((d.rstrip("/") + "/*", ECRIT) for d in departs)
        return resultat
    resultat.extend((d, META) for d in departs)
    return resultat


def _acces_tar(inv: Invocation) -> list[tuple[str, str]]:
    """`tar xf a.tar m -C d` : mode dans le premier groupe de lettres, archive apres `f`, membres ensuite."""
    args = inv.args
    lettres = ""
    for a in args:
        if a.startswith("--"):
            continue
        if a.startswith("-") and len(a) > 1:
            lettres += a[1:]
        elif not lettres and a and a[0] in "xctru" and a.isalpha():
            lettres += a  # forme sans tiret : `tar xf`
            break
        else:
            break
    longues = {a.lower() for a in args if a.startswith("--")}
    extrait = "x" in lettres or "--extract" in longues or "--get" in longues
    cree = any(m in lettres for m in "cru") or "--create" in longues or "--append" in longues or "--update" in longues
    dossiers, _ = _consommes_par_options(args, ("-C", "--directory"), False)
    fichiers, _ = _consommes_par_options(args, ("--file",), False)
    positionnels = [p for p in _positionnels_hors_options(args, ("-C", "--directory", "--file"), False) if not (p.isalpha() and p[0] in "xctru" and p == positionnels_premier(args))]
    archive: str | None = fichiers[0] if fichiers else None
    if archive is None and "f" in lettres and positionnels:
        archive = positionnels.pop(0)
    resultat: list[tuple[str, str]] = []
    if extrait:
        resultat.extend((d, ECRIT) for d in dossiers)
        resultat.extend((_prefixe_base(m, dossiers[0] if dossiers else None), ECRIT) for m in positionnels)
        if not dossiers and not positionnels:
            # Sans `-C` ni membre nomme, l'extraction se deverse dans le dossier courant, comme `unzip`.
            # Le dire, au lieu de laisser la regle generique refuser faute de cible (cloture du lot 4).
            resultat.append((inv.repertoire or ".", ECRIT))
        if archive:
            resultat.append((archive, LIT))
    elif cree:
        if archive:
            resultat.append((archive, ECRIT))
        resultat.extend((m, LIT) for m in positionnels)
    else:
        if archive:
            resultat.append((archive, LIT))
        resultat.extend((m, LIT) for m in positionnels)
    return resultat


def positionnels_premier(args: tuple[str, ...]) -> str:
    p = _positionnels(args)
    return p[0] if p else ""



def _est_un_dossier(chemin: str, base: str | None = None) -> bool:
    """Vrai si le chemin designe un dossier : par sa forme (`x/`, `.`, `..`), ou sur le disque.

    Le disque se lit **depuis le dossier de la commande** : sans cela, la meme copie etait jugee
    differemment selon l'endroit d'ou le hook est lance (cloture du lot 4).
    """
    if not chemin:
        return False
    if chemin.endswith(("/", "\\")) or chemin in {".", "..", "~"}:
        return True
    # Un chemin relatif se resout contre le dossier de la commande, sinon contre la racine du projet :
    # le dossier du processus du hook n'est pas une reference (cloture du lot 4).
    racine = str(_lib.racine_projet())
    depart = racine if not base else (base if os.path.isabs(base) else os.path.join(racine, base))
    try:
        return os.path.isdir(os.path.join(depart, chemin))
    except (OSError, ValueError):
        return False


def _fichiers_crees(sources: list[str], destination: str, base: str | None = None) -> list[str]:
    """Les fichiers qui naissent dans un dossier de destination : leur nom vient de la source.

    Quand la destination est un dossier, le nom du fichier cree n'est pas sur la ligne. Sans cela,
    une copie vers un dossier pouvait ecraser un fichier de la zone protegee sans etre vue.
    """
    if not _est_un_dossier(destination, base):
        return []
    base = destination.rstrip("/\\") or destination
    crees: list[str] = []
    for source in sources:
        nom = source.replace("\\", "/").rstrip("/").split("/")[-1]
        if nom and nom not in {".", ".."}:
            crees.append(base + "/" + nom)
    return crees

def _acces_par_famille(inv: Invocation, regle: P.Regle) -> list[tuple[str, str]]:
    famille = regle.famille
    args = inv.args
    ps = inv.powershell
    if famille == "TOUT":
        valeurs, _ = _consommes_par_options(args, regle.cibles, ps)
        return [(p, ECRIT) for p in _positionnels_hors_options(args, regle.cibles, ps)] + [(v, ECRIT) for v in valeurs]
    if famille == "PREMIER":
        positionnels = _positionnels(args)
        return [(positionnels[0], ECRIT)] if positionnels else []
    if famille == "DESTINATION":
        destinations, _ = _consommes_par_options(args, regle.cibles, ps)
        positionnels = _positionnels_hors_options(args, regle.cibles, ps)
        # Les accolades d'un `xargs -I` sont une source : sans elles, il ne restait qu'un positionnel
        # et la destination etait declassee en lecture (trou 5 du lot 4).
        if "{}" in args and len(positionnels) == 1:
            positionnels = ["{}"] + positionnels
        if destinations:
            crees = [c for d in destinations for c in _fichiers_crees(positionnels, d, inv.repertoire)]
            return ([(p, LIT) for p in positionnels] + [(d, ECRIT) for d in destinations]
                    + [(c, ECRIT) for c in crees])
        if len(positionnels) >= 2:
            crees = _fichiers_crees(positionnels[:-1], positionnels[-1], inv.repertoire)
            return ([(p, LIT) for p in positionnels[:-1]] + [(positionnels[-1], ECRIT)]
                    + [(c, ECRIT) for c in crees])
        return [(p, LIT) for p in positionnels]
    if famille == "DEUXIEME":
        # `robocopy <source> <destination> [fichiers...]` : la destination est le deuxieme mot.
        positionnels = _positionnels(args)
        if len(positionnels) >= 2:
            sources = [positionnels[0]] + positionnels[2:]
            crees = _fichiers_crees(sources, positionnels[1], inv.repertoire)
            return ([(positionnels[0], LIT), (positionnels[1], ECRIT)]
                    + [(p, LIT) for p in positionnels[2:]] + [(c, ECRIT) for c in crees])
        return [(p, ECRIT) for p in positionnels]
    if famille == "DEPLACE":
        valeurs, _ = _consommes_par_options(args, regle.cibles, ps)
        return [(p, ECRIT) for p in _positionnels_hors_options(args, regle.cibles, ps)] + [(v, ECRIT) for v in valeurs]
    if famille == "SI_OPTION":
        ecrit = _declenche(args, regle.declencheurs)
        valeurs, _ = _consommes_par_options(args, regle.cibles, ps)
        mode = ECRIT if ecrit else LIT
        return [(p, mode) for p in _positionnels_hors_options(args, regle.cibles, ps)] + [(v, mode) for v in valeurs]
    if famille == "SAUF_OPTION":
        # gzip et ses pareils : la source est remplacee, sauf si une option la preserve.
        lit = _declenche(args, regle.declencheurs)
        mode = LIT if lit else ECRIT
        return [(p, mode) for p in _positionnels(args)]
    if famille == "TAR":
        return _acces_tar(inv)
    if famille == "OPTION_CIBLE":
        # Sans option de sortie, certains verbes ecrivent dans le dossier courant : apres un `cd` hors
        # perimetre, l'ecriture etait invisible (lot 4, cycle 1).
        if inv.programme in P.ECRIVENT_DANS_LE_DOSSIER_COURANT and not _declenche(args, regle.cibles):
            return [(inv.repertoire or ".", ECRIT)] + [(p, LIT) for p in _positionnels(args)]
        sous_option = P.ECRIVENT_LE_DOSSIER_COURANT_SOUS_OPTION.get(inv.programme, ())
        if sous_option and any(a in sous_option for a in args):
            return [(inv.repertoire or ".", ECRIT)] + [(p, LIT) for p in _positionnels(args)]
        valeurs, _ = _consommes_par_options(args, regle.cibles, ps)
        lues, _ = _consommes_par_options(args, regle.declencheurs, ps)
        return [(v, ECRIT) for v in valeurs] + [(v, LIT) for v in lues]
    if famille == "LIT_OPTION_CIBLE":
        valeurs, _ = _consommes_par_options(args, regle.cibles, ps)
        lues, _ = _consommes_par_options(args, regle.declencheurs, ps)
        toutes = tuple(regle.cibles) + tuple(regle.declencheurs)
        return [(p, LIT) for p in _positionnels_hors_options(args, toutes, ps)] + [(v, LIT) for v in lues] + [(v, ECRIT) for v in valeurs]
    if famille == "LIT":
        return [(p, LIT) for p in _positionnels(args)]
    if famille == "META":
        return [(p, META) for p in _positionnels(args)]
    if famille == "FIND":
        return _acces_find(inv)
    if famille == "GIT":
        return _acces_git(inv)
    if famille == "INTERPRETE":
        positionnels = _positionnels(args)
        edite_en_place = inv.programme in P.INTERPRETES_EDITION_EN_PLACE and any(_MOTIF_OPTION_I.match(a) for a in args)
        if inv.code is not None:
            mode = ECRIT if code_ecrit(inv.code) else LIT
            resultat = [(c, mode) for c in _chemins_dans_le_code(inv.code)]
            if inv.programme in P.INTERPRETES_EDITION_EN_PLACE:
                # `perl -pi -e 's/a/b/' fichier` : les positionnels sont les fichiers traites, ecrits sous -i.
                resultat.extend((p, ECRIT if edite_en_place else LIT) for p in positionnels if p != inv.code)
            return resultat
        if edite_en_place:
            return [(p, ECRIT) for p in positionnels]
        script, declencheurs = _script_du_depot(args)
        if script is not None and _declenche(args, declencheurs):
            return [(script, LIT)] + [(p, ECRIT) for p in positionnels if p != script]
        return [(p, LIT) for p in positionnels]
    if famille == "SHELL":
        return [(p, LIT) for p in _positionnels(args)]  # un script du disque : lu, son corps non suivi (limite ecrite)
    return []  # ENVELOPPE, XARGS, LANCEUR_PS seuls : rien



def _porte_une_cible_de_chemin(inv: Invocation) -> bool:
    """Vrai si le cmdlet nomme lui-meme sa cible, par un positionnel ou par une option de chemin."""
    regle = P.PROGRAMMES.get(inv.programme)
    cibles = regle.cibles if regle else ()
    args = _sans_options_non_chemin(inv.args)
    valeurs, _ = _consommes_par_options(args, cibles, True)
    return bool(valeurs or _positionnels_hors_options(args, cibles, True))


def _sans_options_non_chemin(args: tuple[str, ...]) -> tuple[str, ...]:
    """Les arguments prives des options PowerShell dont la valeur n'est pas un chemin, et de leur valeur.

    `-Value 'boum'` n'est pas une cible : la compter comme telle satisfaisait la regle generique a tort.
    """
    restant: list[str] = []
    saute = False
    for a in args:
        if saute:
            saute = False
            continue
        if a.lower() in P.PWSH_DRAPEAUX:
            continue  # un drapeau ne prend pas de valeur : il n'avale pas la cible qui le suit
        if a.lower() in P.PWSH_OPTIONS_SANS_CHEMIN:
            saute = True
            continue
        restant.append(a)
    return tuple(restant)

def _mode_amont(famille: str, inv: Invocation) -> str | None:
    # En PowerShell, un cmdlet qui recoit un contenu ne lit son amont que s'il porte une **cible de
    # chemin explicite** : sans cible, PowerShell lie la cible aux objets du tube, et le fichier du
    # tube est ecrit (verifie au poste sur un fichier du scratchpad, lot 4 cycle 2). Un cmdlet qui agit
    # sur les objets du tube ecrit toujours son amont (`Get-Item x | Remove-Item`).
    if inv.powershell and inv.programme in P.PWSH_RECOIT_UN_CONTENU:
        return LIT if _porte_une_cible_de_chemin(inv) else ECRIT
    if famille in {"TOUT", "DEPLACE", "PREMIER", "DESTINATION", "DEUXIEME"}:
        return ECRIT
    if famille == "SI_OPTION":
        regle = P.PROGRAMMES[inv.programme]
        return ECRIT if _declenche(inv.args, regle.declencheurs) else LIT
    if famille == "SAUF_OPTION":
        regle = P.PROGRAMMES[inv.programme]
        return LIT if _declenche(inv.args, regle.declencheurs) else ECRIT
    if famille in {"LIT", "INTERPRETE", "TAR", "LIT_OPTION_CIBLE"}:
        return LIT
    if famille in {"META", "GIT", "FIND"}:
        return META
    return None


def positionnels(args: tuple[str, ...]) -> list[str]:
    """Les arguments qui ne sont ni options ni affectations : ce qu'un programme inconnu pourrait lire."""
    return _positionnels(args)


def chemins_cites(texte: str) -> list[str]:
    """Les chemins absolus (Windows, Git Bash, UNC) cites dans un texte, y compris dans du code."""
    vus: list[str] = []
    for m in _MOTIF_CHEMIN_ABSOLU.finditer(texte):
        brut = m.group(0).rstrip(".:")
        if brut not in vus:
            vus.append(brut)
    return vus


def litteraux(code: str) -> list[str]:
    """Tous les litteraux entre guillemets d'un code : ce qu'un script pourrait ouvrir."""
    return [m.group(1) or m.group(2) or m.group(3) or "" for m in _MOTIF_LITTERAL.finditer(code) if (m.group(1) or m.group(2) or m.group(3))]



# Les familles dont le verbe ecrit forcement quelque chose sous la forme ou il est ecrit. Pour celles
# qui dependent d'une option, la presence de l'option est verifiee avant de conclure.
_FAMILLES_QUI_ECRIVENT_TOUJOURS = frozenset({"TOUT", "PREMIER", "DESTINATION", "DEPLACE"})


def ecrit_sans_cible(inv: Invocation) -> str | None:
    """Le nom du verbe qui ecrit sans qu'aucune cible ait pu etre resolue, ou None.

    Un verbe d'ecriture qui ne resout aucune cible est un aveu : l'analyse n'a pas compris la commande.
    Trois des six trous du lot 3bis avaient cette signature (`find -delete` sans point de depart, un
    document en ligne mal rattache, un `xargs -I` declasse en lecture). Le doute profite au refus.
    """
    regle = P.PROGRAMMES.get(inv.programme)
    if regle is None:
        return None
    famille = regle.famille
    args = inv.args
    ecrit_forcement = False
    if famille in _FAMILLES_QUI_ECRIVENT_TOUJOURS:
        ecrit_forcement = True
    elif famille == "SI_OPTION":
        ecrit_forcement = _declenche(args, regle.declencheurs)
    elif famille == "SAUF_OPTION":
        ecrit_forcement = not _declenche(args, regle.declencheurs)
    elif famille in {"OPTION_CIBLE", "LIT_OPTION_CIBLE"}:
        ecrit_forcement = _declenche(args, regle.cibles)
    elif famille == "FIND":
        ecrit_forcement = any(a.lower() in P.FIND_ACTIONS_QUI_ECRIVENT for a in args)
    elif famille == "TAR":
        # Le groupe de lettres de tar se lit avec ou sans tiret, comme `_acces_tar` le fait : `tar xf`
        # et `tar -xf` font la meme chose, les traiter differemment etait arbitraire (lot 4, cycle 2).
        lettres = ""
        for a in args:
            if a.startswith("--"):
                continue
            if a.startswith("-") and len(a) > 1:
                lettres += a[1:]
            elif not lettres and a and a[0] in "xctru" and a.isalpha():
                lettres += a
                break
        # Les options longues disent la meme chose que les lettres : les ignorer laissait passer
        # `tar --extract --file=x` alors que `tar -xf x` etait refuse (lot 4, cycle 3).
        longues = {a.split("=", 1)[0] for a in args if a.startswith("--")}
        ecrit_forcement = (any(lettre in lettres for lettre in "cx")
                           or bool(longues & P.TAR_OPTIONS_LONGUES_QUI_ECRIVENT))
    if not ecrit_forcement:
        return None
    if any(a.mode == ECRIT for a in acces(inv)):
        return None
    return inv.programme

def acces(inv: Invocation) -> list[Acces]:
    """Les acces de l'invocation. Un programme inconnu ne produit que ses redirections (limite ecrite)."""
    regle = P.PROGRAMMES.get(inv.programme)
    bruts: list[tuple[str, str, str]] = []
    if regle is not None:
        for chemin, mode in _acces_par_famille(inv, regle):
            bruts.append((chemin, mode, inv.programme))
        mode_amont = _mode_amont(regle.famille, inv)
        if mode_amont is not None:
            bruts.extend((c, mode_amont, inv.programme + " (amont du tube)") for c in inv.amont)
    for operateur, cible in inv.redirections:
        if not cible or cible.lower() in P.CIBLES_SURES or cible.startswith("&"):
            continue
        if operateur in P.OPERATEURS_QUI_LISENT or operateur.endswith("<"):
            bruts.append((cible, LIT, f"redirection {operateur}"))
        elif operateur in P.OPERATEURS_QUI_ECRIVENT or ">" in operateur:
            bruts.append((cible, ECRIT, f"redirection {operateur}"))
    return [Acces(_prefixe_base(chemin, inv.repertoire), mode, origine) for chemin, mode, origine in bruts if _cible_reelle(chemin) and MARQUE_INCONNU not in chemin or (MARQUE_INCONNU in chemin and mode == ECRIT)]
