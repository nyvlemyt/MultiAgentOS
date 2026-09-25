"""
Nettoyeur de caracteres caches (usage en ligne de commande, jamais automatique).

    python .claude/hooks/nettoyer_caracteres.py <fichier>... [--appliquer]

Sans `--appliquer` : rapport seulement, rien n'est ecrit. Avec : le fichier est reecrit en UTF-8,
octet pour octet identique hors les caracteres retires ou remplaces ; les fins de ligne sont
conservees telles quelles.

La classification vient de `verif_style.classer_cache`, la meme que celle du verrou : ce que le
verrou signale, ce script le retire. Actions par famille :
  format, controle, usage prive, selecteur de variante hors emoji : supprime ;
  espace non standard, separateur de ligne ou de paragraphe : remplace par une espace ;
  combinant non normalise : normalisation NFC du texte ;
  homoglyphe : remplace par la lettre latine equivalente quand elle est connue (table ci-dessous),
  sinon laisse en place et signale « non corrige » ;
  BOM en tete de fichier : retire.

Fichiers non UTF-8 : signales et ignores, jamais reecrits. Le script ne connait pas les exclusions
du verrou (skills vendus, migrations...) : il traite ce qu'on lui donne, c'est voulu.
"""
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402
import verif_style  # noqa: E402

# Lettres cyrilliques et grecques visuellement identiques a une lettre latine (sous-ensemble des
# « confusables » Unicode). Codes en chr() pour rester lisibles et robustes aux outils d'edition.
HOMOGLYPHES: dict[str, str] = {
    chr(0x0430): "a", chr(0x0435): "e", chr(0x043E): "o", chr(0x0440): "p", chr(0x0441): "c",
    chr(0x0443): "y", chr(0x0445): "x", chr(0x0456): "i", chr(0x0458): "j", chr(0x0455): "s",
    chr(0x04BB): "h", chr(0x0501): "d", chr(0x051B): "q", chr(0x051D): "w",
    chr(0x0410): "A", chr(0x0412): "B", chr(0x0415): "E", chr(0x041A): "K", chr(0x041C): "M",
    chr(0x041D): "H", chr(0x041E): "O", chr(0x0420): "P", chr(0x0421): "C", chr(0x0422): "T",
    chr(0x0425): "X",
    chr(0x03BF): "o", chr(0x03BD): "v",
    chr(0x0391): "A", chr(0x0392): "B", chr(0x0395): "E", chr(0x0396): "Z", chr(0x0397): "H",
    chr(0x0399): "I", chr(0x039A): "K", chr(0x039C): "M", chr(0x039D): "N", chr(0x039F): "O",
    chr(0x03A1): "P", chr(0x03A4): "T", chr(0x03A5): "Y", chr(0x03A7): "X",
}
_REMPLACES_PAR_ESPACE = (verif_style.CACHE_ESPACE, verif_style.CACHE_SEPARATEUR)


def _decrire(caractere: str) -> str:
    return f"U+{ord(caractere):04X} {unicodedata.name(caractere, 'sans nom')}"


def nettoyer(texte: str, emojis_toleres: bool) -> tuple[str, list[str]]:
    """(texte nettoye, journal des actions). Journal vide = texte rendu identique."""
    journal: list[str] = []
    if texte.startswith(verif_style.BOM):
        texte = texte[len(verif_style.BOM):]
        journal.append("BOM en tete de fichier retire")
    nfc = unicodedata.normalize("NFC", texte)
    if nfc != texte:
        journal.append("caracteres combinants normalises en NFC")
        texte = nfc
    caches = {indice: (caractere, famille) for indice, _, caractere, famille in verif_style.caracteres_caches(texte, emojis_toleres)}
    if not caches:
        return texte, journal
    morceaux: list[str] = []
    ligne = 1
    for indice, caractere in enumerate(texte):
        if caractere == "\n":
            ligne += 1
        if indice not in caches:
            morceaux.append(caractere)
            continue
        famille = caches[indice][1]
        if famille in _REMPLACES_PAR_ESPACE:
            morceaux.append(" ")
            journal.append(f"ligne {ligne} : {_decrire(caractere)} remplace par une espace")
        elif famille == verif_style.CACHE_HOMOGLYPHE:
            latin = HOMOGLYPHES.get(caractere)
            if latin is None:
                morceaux.append(caractere)
                journal.append(f"ligne {ligne} : {_decrire(caractere)} homoglyphe sans equivalent connu, non corrige")
            else:
                morceaux.append(latin)
                journal.append(f"ligne {ligne} : {_decrire(caractere)} remplace par « {latin} »")
        else:
            journal.append(f"ligne {ligne} : {_decrire(caractere)} supprime ({famille})")
    return "".join(morceaux), journal


def _emojis_toleres(chemin: Path) -> bool:
    chemin_norm = "/" + chemin.as_posix().lower().lstrip("/")
    return any(d in chemin_norm for d in verif_style.DOSSIERS_EMOJIS_TOLERES)


def traiter(chemin: Path, appliquer: bool) -> tuple[int, int]:
    """(actions realisees ou proposees, cas non corriges). Affiche le rapport du fichier."""
    try:
        octets = chemin.read_bytes()
    except OSError as erreur:
        print(f"{chemin} : illisible ({erreur})")
        return 0, 1
    try:
        texte = octets.decode("utf-8")
    except UnicodeDecodeError as erreur:
        print(f"{chemin} : pas de l'UTF-8 valide (octet {erreur.start}), ignore")
        return 0, 1
    propre, journal = nettoyer(texte, _emojis_toleres(chemin))
    non_corriges = sum(1 for j in journal if "non corrige" in j)
    if not journal:
        print(f"{chemin} : aucun caractere cache")
        return 0, 0
    print(f"{chemin} : {len(journal)} action(s){'' if appliquer else ' proposee(s), rien ecrit sans --appliquer'}")
    for action in journal:
        print(f"  - {action}")
    if appliquer and propre != texte:
        chemin.write_bytes(propre.encode("utf-8"))
        print(f"  => fichier reecrit ({len(octets)} -> {len(propre.encode('utf-8'))} octets)")
    return len(journal) - non_corriges, non_corriges


def main() -> None:
    arguments = [a for a in sys.argv[1:] if a != "--appliquer"]
    appliquer = "--appliquer" in sys.argv[1:]
    if not arguments:
        print(__doc__.strip())
        sys.exit(2)
    racine = _lib.racine_projet()
    total_actions = 0
    total_non_corriges = 0
    for argument in arguments:
        chemin = Path(argument) if Path(argument).is_absolute() else racine / argument
        actions, non_corriges = traiter(chemin, appliquer)
        total_actions += actions
        total_non_corriges += non_corriges
    print(f"total : {total_actions} action(s), {total_non_corriges} non corrige(s)")
    sys.exit(1 if total_non_corriges or (total_actions and not appliquer) else 0)


if __name__ == "__main__":
    main()
