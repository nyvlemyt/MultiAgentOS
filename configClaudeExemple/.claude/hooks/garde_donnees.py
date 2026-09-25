"""
Verrou donnees (PreToolUse) : aucune lecture du contenu des donnees providers ou confidentielles.

Regle (`.claude/rules/donnees.md`) : les dossiers de donnees et tout fichier `.csv/.xlsx/.xls/
.parquet` hors documents identifies ne sont jamais ouverts. Lister des noms et des tailles reste
possible. Le token API n'est jamais lu, ni meme liste.

Depuis le lot 3 (17/09/2026), les commandes shell sont lues par `_commande.analyser` et `_effets.acces`,
partages avec les deux autres verrous : un acces `META` (noms, tailles, dates) passe sauf sur un secret ;
un acces `LIT` ou `ECRIT` sur une donnee est refuse. Ce verrou garde en plus son balayage du texte brut
de chaque invocation (chemins absolus cites, positionnels d'un programme inconnu, **tous** les litteraux
d'un script inline), parce que sa regle est « jamais » : un refus de trop y coute moins qu'une lecture de
trop. Un glob est resolu (noms seulement) et juge sur ce qu'il atteint ; un glob qui peut atteindre le
token est refuse meme sans correspondance. `grep -r` depuis la racine du projet est refuse (il traverse
`tmp_uploads`) ; `rg` respecte `.gitignore` et passe. Une commande inanalysable n'est pas jugee ici (le
perimetre et git la refusent deja).
"""
import fnmatch
import glob
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _commande  # noqa: E402
import _effets  # noqa: E402
import _lib  # noqa: E402
import _programmes  # noqa: E402

# Racines de donnees, en dehors et a l'interieur du projet (relatif = sous la racine du projet).
RACINES_INTERDITES_ABSOLUES: tuple[str, ...] = (
    "C:/dev/Eve/Providers",
    "C:/dev/Eve/Archives Tania",
    "C:/dev/EVE_old",
    "F:/",
)
RACINES_INTERDITES_PROJET: tuple[str, ...] = ("tmp_uploads", "data_import_files")

# Fichiers de donnees qui sont en realite des documents (specifications, catalogue, notes).
DOSSIERS_DOCUMENTS: tuple[str, ...] = (
    "C:/dev/Eve/CR Projet",
    "C:/dev/Eve/Documentation Projet Tania",
    "C:/dev/Eve/Modélisation",
    "C:/dev/Eve/Spécification",
    "C:/dev/Eve/MVP",
    "C:/dev/Eve/Releases",
    "C:/dev/Eve/data_catalog",
)
FICHIERS_DOCUMENTS: tuple[str, ...] = (
    "C:/dev/Eve/Data_Quality_ExpressionDeBesoins.xlsx",
    "C:/dev/Eve/Champs_JUMP_dans_EVE.xlsx",
    "C:/dev/Eve/Suivi dev.xlsx",
)
DOSSIERS_DOCUMENTS_PROJET: tuple[str, ...] = ("documentation", "chantiers", ".claude")
# Fichiers generes a la racine du projet, horodates donc jamais nommables a l'avance :
# juges par prefixe et suffixe plutot que par nom exact. Ajoute le 18/09/2026 (demande de
# Melvyn) pour l'export de GET /issuer_schemas_xlsx : definition de schema, aucune donnee.
PREFIXES_DOCUMENTS_PROJET: tuple[tuple[str, str], ...] = (
    ("issuer_schemas_", ".xlsx"),
)

NOMS_INTERDITS: frozenset[str] = frozenset({"token_api.txt"})
DOSSIER_DU_TOKEN = "C:/dev/Eve"

OUTILS_FICHIER: frozenset[str] = frozenset({"Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep"})
OUTILS_NOMS_SEULEMENT: frozenset[str] = frozenset({"Glob"})
OUTILS_SHELL: frozenset[str] = frozenset({"Bash", "PowerShell"})
_GREP_RECURSIF: frozenset[str] = frozenset({"grep", "egrep", "fgrep"})
_MOTIF_DONNEES_RELATIF = re.compile(r"(?<![A-Za-z0-9_./\\-])(?:" + "|".join(RACINES_INTERDITES_PROJET) + r")[\\/][^\s\"'`()<>|;,]*")
_MOTIF_ACCOLADES = re.compile(r"\{([^{}]*,[^{}]*)\}")


def _racines_interdites(racine: str) -> list[str]:
    return [_lib.normaliser(r) for r in RACINES_INTERDITES_ABSOLUES] + [
        _lib.normaliser(r, base=racine) for r in RACINES_INTERDITES_PROJET
    ]


def _est_document(chemin: str, racine: str) -> bool:
    if chemin in {_lib.normaliser(f) for f in FICHIERS_DOCUMENTS}:
        return True
    dossier, _, nom = chemin.rpartition("/")
    if dossier == racine.rstrip("/") and any(
        nom.startswith(prefixe) and nom.endswith(suffixe) for prefixe, suffixe in PREFIXES_DOCUMENTS_PROJET
    ):
        return True
    dossiers = [_lib.normaliser(d) for d in DOSSIERS_DOCUMENTS] + [
        _lib.normaliser(d, base=racine) for d in DOSSIERS_DOCUMENTS_PROJET
    ]
    return any(_lib.sous(chemin, d) for d in dossiers)


def motif_de_refus(chemin_brut: str, racine: str) -> str | None:
    """Pourquoi ce chemin est interdit a la lecture, ou None s'il est libre."""
    chemin = _lib.normaliser(chemin_brut, base=racine)
    nom = chemin.rsplit("/", 1)[-1]
    if nom in NOMS_INTERDITS:
        return f"secret : {chemin_brut} ne doit jamais etre lu ni affiche"
    for interdite in _racines_interdites(racine):
        if _lib.sous(chemin, interdite):
            return f"donnees confidentielles : {chemin_brut} est sous {interdite}"
    extension = "." + nom.rsplit(".", 1)[-1] if "." in nom else ""
    if extension in _lib.EXT_DONNEES and not _est_document(chemin, racine):
        return f"fichier de donnees ({extension}) : {chemin_brut} n'est pas un document identifie"
    return None


def _developper_accolades(chemin: str) -> list[str]:
    m = _MOTIF_ACCOLADES.search(chemin)
    if not m:
        return [chemin]
    resultats: list[str] = []
    for choix in m.group(1).split(","):
        resultats.extend(_developper_accolades(chemin[:m.start()] + choix + chemin[m.end():]))
    return resultats


def _est_un_glob(chemin: str) -> bool:
    return any(c in chemin for c in _programmes.CARACTERES_GLOB)


def _partie_fixe(chemin: str) -> str:
    indices = [chemin.find(c) for c in _programmes.CARACTERES_GLOB if c in chemin]
    tete = chemin[:min(indices)]
    coupe = max(tete.rfind("/"), tete.rfind("\\"))
    return tete[:coupe] if coupe >= 0 else "."


def _resoudre_glob(chemin: str, racine: str) -> list[str]:
    try:
        motif = chemin.replace("\\", "/")
        if re.match(r"^([A-Za-z]:|/|~|//)", motif):
            return glob.glob(os.path.expanduser(motif), include_hidden=True)
        return [racine.rstrip("/") + "/" + m.replace("\\", "/") for m in glob.glob(motif, root_dir=racine, include_hidden=True)]
    except (OSError, ValueError):
        return []


def _motif_de_refus_glob(motif: str, racine: str, metadonnees_seulement: bool) -> str | None:
    """Un glob est juge sur son dossier, sur ce qu'il atteint, et sur ce qu'il pourrait atteindre (le token)."""
    base = motif.replace("\\", "/").rsplit("/", 1)[-1]
    dossier = _lib.normaliser(_partie_fixe(motif), base=racine)
    if dossier == _lib.normaliser(DOSSIER_DU_TOKEN) and any(fnmatch.fnmatchcase(nom, base) for nom in NOMS_INTERDITS):
        return f"secret : {motif} peut atteindre le fichier du token"
    if metadonnees_seulement:
        return None
    refus = motif_de_refus(_partie_fixe(motif), racine)
    if refus and "secret" not in refus:
        return refus
    refus = motif_de_refus(motif, racine)  # l'extension du motif lui-meme (`x.parq*` ne dit rien, `*.csv` dit tout)
    if refus and "secret" not in refus:
        return refus
    for atteint in _resoudre_glob(motif, racine):
        refus = motif_de_refus(atteint, racine)
        if refus:
            return refus
    return None


def _juger(chemin: str, racine: str, metadonnees_seulement: bool) -> str | None:
    if _commande.MARQUE_INCONNU in chemin:
        return None  # une valeur inconnue : le perimetre refuse deja une ecriture construite ; en lecture, rien a juger
    for developpe in _developper_accolades(chemin):
        if _est_un_glob(developpe):
            refus = _motif_de_refus_glob(developpe, racine, metadonnees_seulement)
        else:
            refus = motif_de_refus(developpe, racine)
            if refus and metadonnees_seulement and "secret" not in refus:
                refus = None
        if refus:
            return refus
    return None


def _acces_d_une_invocation(invocation: _commande.Invocation) -> list[tuple[str, bool]]:
    """(chemin, metadonnees seulement) pour tout ce que l'invocation touche, balayage brut compris."""
    regle = _programmes.PROGRAMMES.get(invocation.programme)
    acces = _effets.acces(invocation)
    # Un programme connu qui ne produit que des acces de metadonnees (`ls`, `find` sans action, `git -C x log`)
    # ne lit rien : son texte brut n'est balaye que pour les secrets.
    meta_seulement = regle is not None and all(a.mode == _effets.META for a in acces) and regle.famille not in {"LIT", "INTERPRETE", "SHELL", "XARGS", "TAR"}
    resultat: list[tuple[str, bool]] = [(a.chemin, a.mode == _effets.META) for a in acces]
    if regle is None:
        # Programme inconnu de la table : ses positionnels et son amont sont lus, par prudence (« jamais » est la regle).
        resultat.extend((p, False) for p in _effets.positionnels(invocation.args))
        resultat.extend((p, False) for p in invocation.amont)
    if invocation.code is not None:
        # Tout litteral d'un script inline peut etre un chemin (`os.chdir('tmp_uploads')`, `d + '/x.parquet'`).
        resultat.extend((lit, False) for lit in _effets.litteraux(invocation.code))
    # Le balayage brut d'avant le lot 3, conserve : un chemin absolu cite n'importe ou dans le texte ; et,
    # depuis le verdict 2 du 17/09, un dossier de donnees du projet cite en relatif dans n'importe quel
    # token (`duckdb -c "read_parquet('tmp_uploads/x.parquet')"`, `sqlite3 db '.import tmp_uploads/x.csv t'`).
    resultat.extend((c, meta_seulement) for c in _effets.chemins_cites(invocation.texte))
    if not meta_seulement:
        resultat.extend((m.group(0), False) for m in _MOTIF_DONNEES_RELATIF.finditer(invocation.texte))
    return resultat


def _grep_recursif_depuis_la_racine(invocation: _commande.Invocation, racine: str) -> str | None:
    if invocation.programme not in _GREP_RECURSIF:
        return None
    if not any(a in {"-r", "-R", "--recursive", "--dereference-recursive"} or (a.startswith("-") and not a.startswith("--") and ("r" in a[1:] or "R" in a[1:])) for a in invocation.args):
        return None
    departs = _effets.positionnels(invocation.args)[1:] or ["."]
    for depart in departs:
        if _lib.normaliser(depart, base=racine) == racine.rstrip("/") or _lib.sous(racine, _lib.normaliser(depart, base=racine)):
            return f"grep recursif depuis {depart} : il traverse tmp_uploads et data_import_files (utiliser rg, qui respecte .gitignore, ou un sous-dossier)"
    return None


def _decision_shell(commande: str, racine: str, outil: str) -> str | None:
    analyse = _commande.analyser(commande, outil)
    if analyse.opaque:
        # « Jamais » vaut aussi pour ce qu'on ne sait pas lire : un shell ou un interprete alimente par un
        # tube pourrait ouvrir n'importe quoi. Meme regle que les deux autres verrous.
        return f"commande non analysable ({analyse.opaque}), donc non autorisee a lire"
    for invocation in analyse.invocations:
        motif = _grep_recursif_depuis_la_racine(invocation, racine)
        if motif:
            return motif
        for chemin, metadonnees_seulement in _acces_d_une_invocation(invocation):
            motif = _juger(chemin, racine, metadonnees_seulement)
            if motif:
                return motif
    return None


def _decision_glob(entree_outil: dict, racine: str) -> str | None:
    """L'outil Glob ne rend que des noms : seul le secret est refuse, y compris par son motif."""
    dossier = str(entree_outil.get("path") or ".")
    motif = str(entree_outil.get("pattern") or "*")
    return _motif_de_refus_glob(dossier.rstrip("/\\") + "/" + motif, racine, metadonnees_seulement=True)


def decision(nom_outil: str, entree_outil: dict, racine: str | None = None) -> str | None:
    """None si l'appel est autorise, sinon le message de refus."""
    racine = _lib.normaliser(racine or str(_lib.racine_projet()))
    motif: str | None = None
    if nom_outil in OUTILS_FICHIER:
        for chemin in _lib.chemins_de_l_outil(nom_outil, entree_outil):
            motif = _juger(chemin, racine, metadonnees_seulement=False)
            if motif:
                break
    elif nom_outil in OUTILS_NOMS_SEULEMENT:
        motif = _decision_glob(entree_outil, racine)
    elif nom_outil in OUTILS_SHELL:
        commande = entree_outil.get("command", "")
        if isinstance(commande, str) and commande.strip():
            motif = _decision_shell(commande, racine, nom_outil)
    if motif is None:
        return None
    return (
        "REFUS garde_donnees : " + motif + ".\n"
        "Regle .claude/rules/donnees.md : le contenu des donnees providers et des secrets n'est jamais lu. "
        "Noms et tailles (ls, dir, Get-ChildItem) restent autorises. Demander a Melvyn si un besoin reel existe."
    )


def main() -> None:
    entree = _lib.lire_entree()
    _lib.executer(lambda: decision(entree.get("tool_name", ""), entree.get("tool_input", {}) or {}), "garde_donnees")


if __name__ == "__main__":
    main()
