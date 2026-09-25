"""
Verrou donnees (PreToolUse) : aucune lecture du contenu des donnees providers ou confidentielles.

Regle (`.claude/rules/donnees.md`) : les dossiers de donnees et tout fichier `.csv/.xlsx/.xls/
.parquet` hors documents identifies ne sont jamais ouverts. Lister des noms et des tailles reste
possible. Le token API n'est jamais lu.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402

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

NOMS_INTERDITS: frozenset[str] = frozenset({"token_api.txt"})

# Commandes qui ne lisent que des metadonnees (noms, tailles, dates) : autorisees sur les donnees.
COMMANDES_METADONNEES: frozenset[str] = frozenset({
    "ls", "dir", "du", "stat", "file", "find", "tree", "wc", "test", "realpath", "basename", "dirname",
    "get-childitem", "gci", "get-item", "gi", "test-path", "measure-object", "measure", "get-itemproperty",
    "sort-object", "select-object", "where-object", "format-table", "format-list", "sort", "select", "where", "ft", "fl",
})
OPTIONS_QUI_LISENT: frozenset[str] = frozenset({"-exec", "-execdir", "-ok", "xargs", "-delete", "--include", "-include"})

OUTILS_FICHIER: frozenset[str] = frozenset({"Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep", "Glob"})
OUTILS_SHELL: frozenset[str] = frozenset({"Bash", "PowerShell"})


def _racines_interdites(racine: str) -> list[str]:
    return [_lib.normaliser(r) for r in RACINES_INTERDITES_ABSOLUES] + [
        _lib.normaliser(r, base=racine) for r in RACINES_INTERDITES_PROJET
    ]


def _est_document(chemin: str, racine: str) -> bool:
    if chemin in {_lib.normaliser(f) for f in FICHIERS_DOCUMENTS}:
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


def _decision_shell(commande: str, racine: str) -> str | None:
    for sous_commande in _lib.decouper_commande(commande):
        programme = _lib.premier_mot(sous_commande)
        texte = " ".join(sous_commande)
        metadonnees_seulement = programme in COMMANDES_METADONNEES and not any(
            tok.lower() in OPTIONS_QUI_LISENT for tok in sous_commande
        )
        for chemin in _lib.extraire_chemins_commande(texte):
            motif = motif_de_refus(chemin, racine)
            if motif is None:
                continue
            if metadonnees_seulement and "secret" not in motif:
                continue
            return motif
    return None


def decision(nom_outil: str, entree_outil: dict, racine: str | None = None) -> str | None:
    """None si l'appel est autorise, sinon le message de refus."""
    racine = _lib.normaliser(racine or str(_lib.racine_projet()))
    motif: str | None = None
    if nom_outil in OUTILS_FICHIER:
        for chemin in _lib.chemins_de_l_outil(nom_outil, entree_outil):
            motif = motif_de_refus(chemin, racine)
            if motif:
                break
    elif nom_outil in OUTILS_SHELL:
        commande = entree_outil.get("command", "")
        if isinstance(commande, str) and commande.strip():
            motif = _decision_shell(commande, racine)
    if motif is None:
        return None
    return (
        "REFUS garde_donnees : " + motif + ".\n"
        "Regle .claude/rules/donnees.md : le contenu des donnees providers et des secrets n'est jamais lu. "
        "Noms et tailles (ls, dir, Get-ChildItem) restent autorises. Demander a Melvyn si un besoin reel existe."
    )


def main() -> None:
    entree = _lib.lire_entree()
    message = decision(entree.get("tool_name", ""), entree.get("tool_input", {}) or {})
    if message:
        _lib.refuser(message)
    _lib.autoriser()


if __name__ == "__main__":
    main()
