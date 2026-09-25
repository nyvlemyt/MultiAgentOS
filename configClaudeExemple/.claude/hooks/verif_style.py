"""
Verificateur de forme (PostToolUse sur Edit, Write, MultiEdit ; aussi appele par gate.py).

Detecte ce qu'un relecteur reconnait comme un artefact d'assistant ou un defaut de forme :
tirets typographiques, guillemets courbes dans le code, caracteres invisibles, BOM, emojis dans le
code, fins de ligne melangees ou changees, espaces en fin de ligne, tabulations, absence de saut
final, formules de remplissage, substituts laisses en place.

Quand une version de base est connue (HEAD, lue avec les filtres de l'arbre de travail pour que
`core.autocrlf` ne fasse pas croire a un changement de fins de ligne), seuls les defauts NOUVEAUX
sont signales : on n'impose pas un grand nettoyage aux fichiers existants, on n'en ajoute pas.
`analyser_detaille` rend aussi les defauts preexistants, en information, pour l'usage en ligne
de commande.

Les caracteres recherches sont ecrits en sequences d'echappement pour que ce fichier passe
lui-meme la verification.
"""
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402

EXTENSIONS_CODE: frozenset[str] = frozenset({".py", ".json", ".toml", ".yaml", ".yml", ".ps1", ".cmd", ".sh", ".ini", ".cfg", ".js", ".css"})
EXTENSIONS_DOC: frozenset[str] = frozenset({".md", ".txt", ".html"})
# Ignores : skills vendus (texte tiers), graphe, migrations generees, environnements, fixtures des
# tests des verrous (elles contiennent volontairement les motifs interdits), memoire Claude (son
# frontmatter est reecrit par l'outil de memoire, pas par nous).
DOSSIERS_IGNORES: tuple[str, ...] = (
    "/.claude/skills/", "/graphify-out/", "/migrations/", "/.venv/", "/node_modules/",
    "/.claude/hooks/tests/", "/.claude/projects/",
)
# Ce fichier lui-meme : ses listes de motifs contiennent forcement les motifs qu'il cherche.
FICHIERS_IGNORES: tuple[str, ...] = ("/.claude/hooks/verif_style.py",)
# Sous-dossiers d'un chantier qui ne s'analysent pas : un rapport d'agent s'y depose tel quel, et
# une fixture porte volontairement le motif qu'elle pose a l'agent ; les reecrire, c'est cesser de
# prouver ce qu'ils prouvent. Restreint a `/chantiers/` pour que les fiches de `.claude/agents/`,
# elles, restent analysees comme tout document que nous ecrivons.
SOUS_DOSSIERS_CHANTIER_IGNORES: tuple[str, ...] = ("/agents/", "/fixtures/")
# La documentation existante du depot utilise des emojis dans ses titres : on suit son style.
DOSSIERS_EMOJIS_TOLERES: tuple[str, ...] = ("/documentation/",)

BOM = "\ufeff"
TIRET_CADRATIN = re.compile("\u2014")
TIRET_DEMI_CADRATIN = re.compile("\u2013")
EMOJIS = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27bf]")

# Caracteres caches : tout ce qui ne se voit pas a l'ecran ou imite une lettre latine. Classes par
# categorie Unicode (unicodedata) plutot que par liste de codes, pour ne rien oublier : format (Cf :
# largeur nulle, joints, bidi, tags, trait d'union conditionnel, BOM), controle (Cc), usage prive et
# non assigne (Co, Cn), espaces autres que l'espace simple (Zs), separateurs de ligne et de
# paragraphe (Zl, Zp), selecteurs de variante, combinants non normalises, homoglyphes.
CACHE_FORMAT = "caractere de format invisible (largeur nulle, joint, bidi, tag, BOM hors debut)"
CACHE_CONTROLE = "caractere de controle hors tabulation et fins de ligne"
CACHE_PRIVE = "caractere a usage prive ou non assigne"
CACHE_ESPACE = "espace non standard (insecable, fine, ideographique...)"
CACHE_SEPARATEUR = "separateur de ligne ou de paragraphe Unicode"
CACHE_SELECTEUR = "selecteur de variante hors sequence emoji"
CACHE_COMBINANT = "caractere combinant non normalise (forme NFC attendue)"
CACHE_HOMOGLYPHE = "homoglyphe : lettre cyrillique ou grecque dans un mot latin"
FAMILLES_CACHEES: tuple[str, ...] = (
    CACHE_FORMAT, CACHE_CONTROLE, CACHE_PRIVE, CACHE_ESPACE, CACHE_SEPARATEUR, CACHE_SELECTEUR,
    CACHE_COMBINANT, CACHE_HOMOGLYPHE,
)
_JOINT_LARGEUR_NULLE = chr(0x200D)


def _est_emoji(caractere: str) -> bool:
    return bool(caractere) and EMOJIS.fullmatch(caractere) is not None


def _est_selecteur_de_variante(point: int) -> bool:
    return 0xFE00 <= point <= 0xFE0F or 0xE0100 <= point <= 0xE01EF


def _est_lettre_latine_ascii(caractere: str) -> bool:
    return bool(caractere) and caractere.isascii() and caractere.isalpha()


def classer_cache(caractere: str, precedent: str, suivant: str, emojis_toleres: bool) -> str | None:
    """Famille de caractere cache (une constante CACHE_*), ou None pour un caractere ordinaire.

    Dans un dossier ou les emojis sont toleres, le joint de largeur nulle et le selecteur de
    variante qui suivent un emoji font partie de la sequence emoji et ne sont pas caches.
    """
    if caractere in (" ", "\t", "\n", "\r"):
        return None
    point = ord(caractere)
    categorie = unicodedata.category(caractere)
    dans_sequence_emoji = emojis_toleres and (_est_emoji(precedent) or _est_selecteur_de_variante(ord(precedent)) if precedent else False)
    if _est_selecteur_de_variante(point):
        return None if dans_sequence_emoji else CACHE_SELECTEUR
    if categorie == "Cf":
        if caractere == _JOINT_LARGEUR_NULLE and dans_sequence_emoji:
            return None
        return CACHE_FORMAT
    if categorie == "Cc":
        return CACHE_CONTROLE
    if categorie in ("Co", "Cn"):
        return CACHE_PRIVE
    if categorie == "Zs":
        return CACHE_ESPACE
    if categorie in ("Zl", "Zp"):
        return CACHE_SEPARATEUR
    if categorie == "Mn" and precedent and unicodedata.normalize("NFC", precedent + caractere) != precedent + caractere:
        return CACHE_COMBINANT
    nom = unicodedata.name(caractere, "")
    if (nom.startswith("CYRILLIC") or nom.startswith("GREEK")) and caractere.isalpha() \
            and (_est_lettre_latine_ascii(precedent) or _est_lettre_latine_ascii(suivant)):
        return CACHE_HOMOGLYPHE
    return None


def caracteres_caches(texte: str, emojis_toleres: bool) -> list[tuple[int, int, str, str]]:
    """(indice dans le texte, numero de ligne, caractere, famille) pour chaque caractere cache."""
    resultats: list[tuple[int, int, str, str]] = []
    ligne = 1
    dernier = len(texte) - 1
    for i, caractere in enumerate(texte):
        precedent = texte[i - 1] if i > 0 else ""
        suivant = texte[i + 1] if i < dernier else ""
        famille = classer_cache(caractere, precedent, suivant, emojis_toleres)
        if famille is not None:
            resultats.append((i, ligne, caractere, famille))
        if caractere == "\n":
            ligne += 1
    return resultats
GUILLEMETS_COURBES = re.compile("[\u201c\u201d\u2018\u2019]")
TABULATION_INDENTATION = re.compile("^\t", re.MULTILINE)
# Tournures d'assistant, en minuscules, comparees a la version de base : seules les nouvelles comptent.
FORMULES_REMPLISSAGE: tuple[str, ...] = (
    "certainly", "as an ai", "i hope this helps", "let's ", "in this implementation", "feel free to",
    "here's the", "in today's", "it's worth noting", "it is worth noting", "delve", "seamlessly",
    "dive into", "in conclusion", "to summarize", "we've successfully", "as requested",
    "n'hésitez pas", "n'hesitez pas", "en espérant que", "pour conclure", "donc voilà", "donc voila",
    "en conclusion",
)
SUBSTITUTS = re.compile(r"lorem ipsum|\bTBD\b|<placeholder>|\bXXX\b|à compléter|a completer", re.IGNORECASE)
# Le depot contient des TODO legitimes : seul un marqueur AJOUTE par rapport a la base est signale.
MARQUEURS_TRAVAIL = re.compile(r"\b(TODO|FIXME|HACK)\b")


def _compter(motif: re.Pattern[str], texte: str) -> int:
    return len(motif.findall(texte))


def _lignes(motif: re.Pattern[str] | str, texte: str) -> list[int]:
    numeros: list[int] = []
    for i, ligne in enumerate(texte.split("\n"), start=1):
        if (motif.search(ligne) if isinstance(motif, re.Pattern) else motif in ligne.lower()):
            numeros.append(i)
    return numeros


def _style_fins_de_ligne(texte: str) -> str:
    crlf = texte.count("\r\n")
    lf = texte.count("\n") - crlf
    if crlf and lf:
        return "mixte"
    return "CRLF" if crlf else "LF"


def _lignes_avec_espaces_finaux(texte: str) -> list[int]:
    return [i for i, ligne in enumerate(texte.split("\n"), start=1) if ligne.rstrip("\r") != ligne.rstrip("\r").rstrip(" \t")]


def _est_ignore(chemin_norm: str) -> bool:
    """Vrai si le fichier ne s'analyse pas du tout : dossier ignore, fichier ignore, ou sous-dossier de chantier."""
    if any(d in chemin_norm for d in DOSSIERS_IGNORES):
        return True
    if any(chemin_norm.endswith(f) for f in FICHIERS_IGNORES):
        return True
    return "/chantiers/" in chemin_norm and any(s in chemin_norm for s in SOUS_DOSSIERS_CHANTIER_IGNORES)


def analyser(contenu: str, chemin: str, contenu_base: str | None = None) -> list[str]:
    """Liste des problemes de forme, en francais. Vide = rien a signaler."""
    chemin_norm = "/" + chemin.replace("\\", "/").lower().lstrip("/")
    if _est_ignore(chemin_norm):
        return []
    nom = chemin_norm.rsplit("/", 1)[-1]
    extension = "." + nom.rsplit(".", 1)[-1] if "." in nom else ""
    if extension not in EXTENSIONS_CODE | EXTENSIONS_DOC:
        return []
    est_code = extension in EXTENSIONS_CODE
    problemes: list[str] = []

    def nouveau(motif: re.Pattern[str] | str) -> bool:
        """Vrai si le motif est plus present qu'avant (ou si aucune base n'est connue)."""
        if isinstance(motif, str):
            maintenant, avant = contenu.lower().count(motif), (contenu_base or "").lower().count(motif)
        else:
            maintenant, avant = _compter(motif, contenu), _compter(motif, contenu_base or "")
        return maintenant > 0 and (contenu_base is None or maintenant > avant)

    base_connue = contenu_base is not None and bool(contenu_base.strip())
    if contenu.startswith(BOM) and not (base_connue and (contenu_base or "").startswith(BOM)):
        problemes.append("BOM en tete de fichier")
    corps = contenu.lstrip(BOM)
    emojis_toleres = any(d in chemin_norm for d in DOSSIERS_EMOJIS_TOLERES)
    caches = caracteres_caches(corps, emojis_toleres)
    caches_base = caracteres_caches((contenu_base or "").lstrip(BOM), emojis_toleres) if contenu_base is not None else []
    for famille in FAMILLES_CACHEES:
        maintenant = [c for c in caches if c[3] == famille]
        avant = sum(1 for c in caches_base if c[3] == famille)
        if maintenant and (contenu_base is None or len(maintenant) > avant):
            points = ", ".join(sorted({f"U+{ord(c[2]):04X}" for c in maintenant})[:5])
            lignes = sorted({c[1] for c in maintenant})
            problemes.append(f"{famille} : {points}, lignes {lignes[:10]}")
    if nouveau(TIRET_CADRATIN):
        problemes.append(f"tiret cadratin (U+2014), lignes {_lignes(TIRET_CADRATIN, corps)}")
    if nouveau(TIRET_DEMI_CADRATIN):
        problemes.append(f"tiret demi-cadratin (U+2013), lignes {_lignes(TIRET_DEMI_CADRATIN, corps)}")
    if est_code and nouveau(GUILLEMETS_COURBES):
        problemes.append(f"guillemet courbe dans du code, lignes {_lignes(GUILLEMETS_COURBES, corps)}")
    if not emojis_toleres and nouveau(EMOJIS):
        problemes.append(f"emoji, lignes {_lignes(EMOJIS, corps)}")

    style = _style_fins_de_ligne(corps)
    style_base = _style_fins_de_ligne(contenu_base or "") if base_connue else None
    if style == "mixte":
        if style_base != "mixte":
            problemes.append("fins de ligne melangees (CRLF et LF) dans le meme fichier")
    elif style_base is not None:
        if style_base != "mixte" and style_base != style:
            problemes.append(
                f"style de fins de ligne change par rapport a la version de base ({style_base} vers {style}) : "
                "le depot est en CRLF, ne pas reecrire un fichier entier"
            )

    espaces = _lignes_avec_espaces_finaux(corps)
    if espaces and (contenu_base is None or len(espaces) > len(_lignes_avec_espaces_finaux(contenu_base))):
        problemes.append(f"espaces en fin de ligne, lignes {espaces[:10]}")
    if extension == ".py" and nouveau(TABULATION_INDENTATION):
        problemes.append(f"tabulation en indentation, lignes {_lignes(re.compile(chr(9)), corps)}")
    if corps and not corps.endswith("\n") and not (base_connue and not (contenu_base or "").endswith("\n")):
        problemes.append("pas de saut de ligne final")
    for formule in FORMULES_REMPLISSAGE:
        if nouveau(formule):
            problemes.append(f"formule de remplissage « {formule.strip()} », lignes {_lignes(formule, corps)}")
    if nouveau(SUBSTITUTS):
        problemes.append(f"substitut laisse en place (TBD, lorem ipsum, placeholder...), lignes {_lignes(SUBSTITUTS, corps)}")
    if nouveau(MARQUEURS_TRAVAIL):
        # Message en minuscules : cite dans un journal, il ne doit pas declencher le verrou a son tour.
        problemes.append(f"marqueur de travail non termine ajoute (todo, fixme, hack en majuscules), lignes {_lignes(MARQUEURS_TRAVAIL, corps)}")
    return problemes


def analyser_detaille(contenu: str, chemin: str, contenu_base: str | None = None) -> tuple[list[str], list[str]]:
    """(defauts introduits par rapport a la base, defauts deja presents dans la base).

    Sans base connue, tout est « introduit ». Les preexistants ne bloquent jamais : ils s'affichent
    en information pour que le lecteur sache qu'ils ne sont pas a corriger dans ce chantier.
    """
    nouveaux = analyser(contenu, chemin, contenu_base=contenu_base)
    if contenu_base is None:
        return nouveaux, []
    tous = analyser(contenu, chemin, contenu_base=None)
    preexistants = [p for p in tous if p not in nouveaux]
    return nouveaux, preexistants


def _version_de_base(chemin: Path, racine: Path) -> str | None:
    """Contenu de HEAD tel que git l'ecrirait sur le disque (filtres et fins de ligne appliques).

    `git show HEAD:chemin` rend le blob tel qu'il est stocke (LF avec `core.autocrlf=true`) alors
    que l'arbre de travail est en CRLF : comparer les deux signalait un changement de fins de ligne
    sur tout fichier du depot, meme intact (constat du 09/09/2026 sur data/functions.py).
    """
    try:
        relatif = chemin.resolve().relative_to(racine.resolve()).as_posix()
        resultat = subprocess.run(
            ["git", "cat-file", "--filters", f"HEAD:{relatif}"],
            cwd=str(racine), capture_output=True, timeout=10, check=False,
        )
        return resultat.stdout.decode("utf-8", errors="replace") if resultat.returncode == 0 else None
    except (ValueError, OSError, subprocess.SubprocessError):
        return None


def _lire(chemin: Path) -> str | None:
    try:
        return chemin.read_bytes().decode("utf-8", errors="replace")
    except OSError:
        return None


def verifier_fichier(chemin: Path, racine: Path) -> list[str]:
    """Defauts introduits par rapport a HEAD (contrat utilise par le hook et par gate.py)."""
    contenu = _lire(chemin)
    if contenu is None:
        return []
    return analyser(contenu, str(chemin), contenu_base=_version_de_base(chemin, racine))


def verifier_fichier_detaille(chemin: Path, racine: Path) -> tuple[list[str], list[str]]:
    contenu = _lire(chemin)
    if contenu is None:
        return [], []
    return analyser_detaille(contenu, str(chemin), contenu_base=_version_de_base(chemin, racine))


def main() -> None:
    if len(sys.argv) > 1:  # usage direct : python verif_style.py fichier...
        racine = _lib.racine_projet()
        total = 0
        for arg in sys.argv[1:]:
            nouveaux, preexistants = verifier_fichier_detaille(Path(arg), racine)
            for p in nouveaux:
                print(f"{arg} : INTRODUIT : {p}")
            for p in preexistants:
                print(f"{arg} : preexistant dans HEAD, non bloquant : {p}")
            if not nouveaux and not preexistants:
                print(f"{arg} : forme OK")
            total += len(nouveaux)
        sys.exit(1 if total else 0)
    entree = _lib.lire_entree()
    entree_outil = entree.get("tool_input") or {}
    chemin = entree_outil.get("file_path") or entree_outil.get("notebook_path")
    if not chemin:
        _lib.autoriser()
    racine = _lib.racine_projet()
    fichier = Path(chemin) if Path(chemin).is_absolute() else racine / chemin
    problemes = verifier_fichier(fichier, racine)
    if problemes:
        message = (
            f"verif_style : {len(problemes)} probleme(s) de forme dans {chemin}, a corriger immediatement :\n  - "
            + "\n  - ".join(problemes)
        )
        if any(p.startswith(FAMILLES_CACHEES) for p in problemes):
            message += (
                "\nCaracteres caches : voir puis nettoyer avec "
                f"python .claude/hooks/nettoyer_caracteres.py \"{chemin}\" --appliquer"
            )
        _lib.refuser(message)
    _lib.autoriser()


if __name__ == "__main__":
    main()
