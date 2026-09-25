"""
Manifeste d'empreintes du perimetre que git ne voit pas.

`.claude/` et `chantiers/` sont exclus du depot (.git/info/exclude lignes 15 a 18), donc
`git status` reste propre meme si un agent y reecrit un verrou, une fiche ou l'attendu d'une
fixture. Ce script est le filet a la place de git : il releve un sha256 par fichier, puis compare.

Usage :
    python empreintes.py --ecrire manifeste.txt
    python empreintes.py --comparer manifeste.txt [--attendus CHEMIN ...]

Sortie de `--comparer` : une ligne par ecart (AJOUT, SUPPRESSION, MODIFICATION), code 1 s'il en
reste apres retrait des chemins attendus, code 0 si le poste est intact. Aucune dependance hors
bibliotheque standard, comme les verrous.
"""
import argparse
import hashlib
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[3]
SURVEILLES: tuple[str, ...] = (".claude", "chantiers/2026-09-15-mini-entreprise-agents")
# Bruit d'execution et le manifeste lui-meme : ils changent a chaque lancement, sans rien dire.
IGNORES: tuple[str, ...] = ("__pycache__", ".ruff_cache", "etat-depart")


def _pertinent(chemin: Path) -> bool:
    return chemin.is_file() and not any(part in IGNORES for part in chemin.parts)


def relever(racine: Path = RACINE) -> dict[str, str]:
    """Empreinte sha256 de chaque fichier surveille, indexee par chemin relatif en forme posix."""
    empreintes: dict[str, str] = {}
    for dossier in SURVEILLES:
        for fichier in sorted((racine / dossier).rglob("*")):
            if _pertinent(fichier):
                relatif = fichier.relative_to(racine).as_posix()
                empreintes[relatif] = hashlib.sha256(fichier.read_bytes()).hexdigest()
    return empreintes


def lire(manifeste: Path) -> dict[str, str]:
    """Relit un manifeste ecrit par `--ecrire`."""
    empreintes: dict[str, str] = {}
    for ligne in manifeste.read_text(encoding="utf-8").splitlines():
        if ligne.strip():
            empreinte, chemin = ligne.split(" ", 1)
            empreintes[chemin] = empreinte
    return empreintes


def ecarts(avant: dict[str, str], apres: dict[str, str]) -> list[str]:
    """Ecarts entre deux releves, tries : suppressions, ajouts, modifications."""
    lignes = [f"SUPPRESSION  {c}" for c in sorted(set(avant) - set(apres))]
    lignes += [f"AJOUT        {c}" for c in sorted(set(apres) - set(avant))]
    lignes += [f"MODIFICATION {c}" for c in sorted(set(avant) & set(apres)) if avant[c] != apres[c]]
    return lignes


def main() -> None:
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--ecrire", type=Path, help="ecrit le manifeste dans ce fichier")
    parseur.add_argument("--comparer", type=Path, help="compare l'etat actuel a ce manifeste")
    parseur.add_argument("--attendus", nargs="*", default=[], help="chemins dont l'ecart est normal")
    args = parseur.parse_args()

    if args.ecrire:
        contenu = "".join(f"{e} {c}\n" for c, e in sorted(relever().items()))
        args.ecrire.write_text(contenu, encoding="utf-8")
        print(f"manifeste : {len(contenu.splitlines())} fichiers -> {args.ecrire}")
        return

    if not args.comparer:
        parseur.error("il faut --ecrire ou --comparer")

    attendus = {Path(a).as_posix() for a in args.attendus}
    restants = [
        ligne for ligne in ecarts(lire(args.comparer), relever())
        if ligne.split(maxsplit=1)[1] not in attendus
    ]
    if restants:
        print("\n".join(restants))
        print(f"{len(restants)} ecart(s) non attendu(s)")
        sys.exit(1)
    print("poste intact : aucun ecart hors des chemins attendus")


if __name__ == "__main__":
    main()
