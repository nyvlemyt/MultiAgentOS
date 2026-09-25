"""
Socle commun des verrous (hooks Claude Code) du poste EVE : l'entree du hook, les chemins, la sortie.

Contrat des hooks : JSON sur stdin ; `exit 2` + message sur stderr = refus ; `exit 0` = autorise.
Aucune dependance hors bibliotheque standard : le hook doit demarrer en quelques dizaines de ms.

Depuis le lot 3 (17/09/2026), l'analyse des commandes shell n'est plus ici : `_commande.analyser` (de la
ligne aux invocations) et `_effets.acces` (de l'invocation aux acces) la portent, sur la table
`_programmes.py`. Ce fichier ne garde que ce que les trois verrous partagent hors analyse.
"""
import json
import os
import posixpath
import re
import sys
from collections.abc import Callable
from pathlib import Path

EXT_DONNEES: frozenset[str] = frozenset({".csv", ".xlsx", ".xls", ".xlsm", ".parquet", ".parq"})


def lire_entree() -> dict:
    """Lit le JSON du hook sur stdin. Une entree illisible vaut un dictionnaire vide."""
    try:
        brut = sys.stdin.read()
        return json.loads(brut) if brut.strip() else {}
    except (json.JSONDecodeError, OSError):
        return {}


def racine_projet() -> Path:
    """Racine du projet : `CLAUDE_PROJECT_DIR` si Claude Code la fournit, sinon deux niveaux au-dessus de `.claude/hooks/`."""
    env = os.environ.get("CLAUDE_PROJECT_DIR")
    if env:
        return Path(env)
    return Path(__file__).resolve().parents[2]


def normaliser(chemin: str, base: str | Path | None = None) -> str:
    """
    Forme canonique d'un chemin, sans toucher au disque : absolu, separateurs `/`, minuscules.

    Accepte les formes Windows (`C:\\x`, `C:/x`), Git Bash (`/c/x`, `/cygdrive/c/x`), `~`,
    et les chemins relatifs (resolus contre `base`, par defaut la racine du projet).
    """
    c = chemin.strip().strip("\"'")
    c = os.path.expanduser(c)
    c = c.replace("\\", "/")
    # Les formes qui designent le disque local par un detour : `//?/C:/x` (prefixe long Windows),
    # `//localhost/c$/x` et `//127.0.0.1/c$/x` (partage administratif). Verification du 17/09/2026.
    m_long = re.match(r"^//[?.]/([A-Za-z]:.*)$", c)
    if m_long:
        c = m_long.group(1)
    m_admin = re.match(r"^//(?:localhost|127\.0\.0\.1)/([A-Za-z])\$(/.*)?$", c, re.IGNORECASE)
    if m_admin:
        c = f"{m_admin.group(1)}:{m_admin.group(2) or '/'}"
    m = re.match(r"^/cygdrive/([A-Za-z])(/.*)?$", c) or re.match(r"^/([A-Za-z])(/.*)?$", c)
    if m:
        c = f"{m.group(1)}:{m.group(2) or '/'}"
    if re.match(r"^[A-Za-z]:", c):
        if len(c) == 2:
            c += "/"
    elif c.startswith("//"):
        pass  # chemin UNC, garde tel quel
    elif c.startswith("/"):
        racine = normaliser(str(base if base is not None else racine_projet()))
        c = racine[:2] + c  # meme lecteur que la base
    else:
        racine = normaliser(str(base if base is not None else racine_projet()))
        c = racine.rstrip("/") + "/" + c
    lecteur, reste = c[:2], c[2:]
    reste = posixpath.normpath(reste) if reste else "/"
    if reste == ".":
        reste = "/"
    return (lecteur + reste).lower() if not c.startswith("//") else posixpath.normpath(c).lower()


def sous(chemin: str, racine: str) -> bool:
    """Vrai si `chemin` est `racine` ou se trouve dessous (les deux deja normalises)."""
    r = racine.rstrip("/")
    return chemin == r or chemin.startswith(r + "/")


def chemins_de_l_outil(nom_outil: str, entree_outil: dict) -> list[str]:
    """Les chemins cibles d'un appel d'outil fichier (Read, Edit, Write, Grep, Glob, NotebookEdit...)."""
    chemins: list[str] = []
    for cle in ("file_path", "path", "notebook_path"):
        valeur = entree_outil.get(cle)
        if isinstance(valeur, str) and valeur.strip():
            chemins.append(valeur)
    return chemins


def refuser(message: str) -> None:
    # Claude Code lit la sortie des hooks en UTF-8 ; sans cela, Python ecrit dans l'encodage de la
    # console Windows (cp1252) et les accents ou guillemets arrivent en caracteres de remplacement.
    sys.stderr.buffer.write((message.rstrip() + "\n").encode("utf-8"))
    sys.stderr.flush()
    sys.exit(2)


def autoriser() -> None:
    sys.exit(0)


def executer(decider: Callable[[], str | None], nom_verrou: str) -> None:
    """
    Le `main()` de tout verrou : refuse si `decider` rend un message, autorise sinon, et **refuse aussi si
    `decider` leve**. Le contrat d'un hook PreToolUse est que seul le code 2 refuse : une exception sort
    en code 1, que le harnais lit comme « rien a dire ». Un verrou casse (fichier a moitie ecrit, table
    absente, cas non prevu) laissait donc tout passer sans que rien ne le dise. Attaque du plan du lot 3,
    17/09/2026, finding CRITIQUE : ferme ici, prouve par une sonde de `doctor`.
    """
    try:
        message = decider()
    except Exception as exc:  # noqa: BLE001  (SystemExit n'est pas une Exception : le refus normal passe)
        refuser(
            f"REFUS {nom_verrou} : verrou en erreur ({type(exc).__name__}), appel refuse par prudence.\n"
            "Un verrou qui ne peut pas juger ne laisse pas passer. Verifier .claude/hooks avec "
            "python .claude/hooks/doctor.py --complet, puis reformuler."
        )
    if message:
        refuser(message)
    autoriser()
