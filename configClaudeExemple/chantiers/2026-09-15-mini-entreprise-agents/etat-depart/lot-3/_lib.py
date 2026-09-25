"""
Socle commun des verrous (hooks Claude Code) du poste EVE.

Contrat des hooks : JSON sur stdin ; `exit 2` + message sur stderr = refus ; `exit 0` = autorise.
Aucune dependance hors bibliotheque standard : le hook doit demarrer en quelques dizaines de ms.
"""
import json
import os
import posixpath
import re
import shlex
import sys
from pathlib import Path

EXT_DONNEES: frozenset[str] = frozenset({".csv", ".xlsx", ".xls", ".xlsm", ".parquet", ".parq"})

# Separateurs entre sous-commandes d'un shell (bash ou PowerShell).
_SEPARATEURS: frozenset[str] = frozenset({";", "&&", "||", "|", "&", "\n"})

# Un chemin absolu Windows (C:\x, C:/x) ou Git Bash (/c/x), y compris a l'interieur d'une
# chaine de code (`pl.read_excel('C:/dev/...')`). Les espaces sont exclus : les chemins qui en
# contiennent sont recuperes par le decoupage en tokens, ou les guillemets les protegent.
_MOTIF_CHEMIN_ABSOLU = re.compile(r"""(?:[A-Za-z]:[\\/]|/[A-Za-z]/|\\\\)[^\s"'`()<>|;,]+""")


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


def _nettoyer_token(token: str) -> str:
    return token.strip().strip("\"'`")


# Shells qui prennent une commande en argument. Leur commande arrive en un seul token (ou en tokens
# separes pour `cmd /c`), donc aucun verrou ne la voit sans redecoupage. Sonde du 17/09/2026 : les
# sept interdits de `git.md` tombaient tous derriere un prefixe de huit caracteres.
SHELLS_A_COMMANDE: frozenset[str] = frozenset({"bash", "sh", "zsh", "ksh", "dash", "cmd", "pwsh", "powershell"})
# Les options qui portent la commande, dans leurs formes reelles (bash, PowerShell, cmd).
OPTIONS_COMMANDE: frozenset[str] = frozenset({"-c", "-lc", "-ic", "-lic", "--command", "-command", "-encodedcommand", "-file", "/c", "/k"})


# Programmes qui en lancent un autre. Le shell imbrique peut etre derriere eux : `env bash -c "..."`
# rouvrait les sept interdits de git (verification du 17/09/2026), parce que `premier_mot` ne saute
# que quatre enveloppes et rendait `env`.
ENVELOPPES_LANCEURS: frozenset[str] = frozenset({
    "sudo", "time", "exec", "nohup", "env", "timeout", "nice", "stdbuf", "command", "xargs",
    "uv", "poetry", "npx", "npm", "run", "git",
})
# Une commande encodee en base64 (`pwsh -EncodedCommand ...`) n'est pas analysable sans la decoder,
# et aucun usage du poste n'en a besoin : elle se refuse en bloc.
OPTION_ENCODEE: str = "-encodedcommand"
# Une option de `cmd` (`/c`, `/k`), a distinguer d'un chemin absolu Git Bash (`/usr/bin/bash`).
_MOTIF_OPTION_CMD = re.compile(r"^/[A-Za-z]{1,2}$")


def _index_du_shell(sous_commande: list[str]) -> int | None:
    """
    L'indice du shell imbrique dans cette sous-commande, enveloppes traversees, ou None.

    Un mot n'est un programme que s'il est **en position de programme** : en tete, apres une
    enveloppe, ou apres l'argument numerique d'une enveloppe. Sans cette condition,
    `grep -rn 'bash -c' x` serait lu comme un lancement de shell.
    """
    en_position = True
    apres_enveloppe = False
    for i, tok in enumerate(sous_commande):
        # `/c` et `/k` sont des options de `cmd` ; `/usr/bin/bash` est un CHEMIN de programme. Les
        # confondre rendait invisible un shell lance par son chemin absolu, et rouvrait les sept
        # interdits de git (revue finale du 17/09/2026).
        if tok.startswith("-") or _MOTIF_OPTION_CMD.match(tok) or re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tok):
            continue
        nom = os.path.basename(tok.replace("\\", "/")).lower().removesuffix(".exe")
        if en_position and nom in SHELLS_A_COMMANDE:
            return i
        if nom in ENVELOPPES_LANCEURS:
            en_position, apres_enveloppe = True, True
        elif apres_enveloppe and nom.isdigit():
            en_position = True
        else:
            en_position, apres_enveloppe = False, False
    return None


def commande_interne(sous_commande: list[str]) -> str | None:
    """
    La commande qu'un shell imbrique porte apres son option de commande, ou None.

    **Tous** les tokens qui suivent l'option sont pris, pas seulement le suivant : `cmd /c del x`
    a deja ses arguments en tokens separes, et une commande doublement imbriquee laisserait sinon
    son chemin orphelin.

    Le shell est cherche **enveloppes traversees** : `env bash -c "..."` et `timeout 5 bash -c "..."`
    lancent bien un shell, et `premier_mot` seul ne les voyait pas.
    """
    debut = _index_du_shell(sous_commande)
    if debut is None:
        return None
    for i in range(debut, len(sous_commande)):
        tok = sous_commande[i].lower()
        if tok == OPTION_ENCODEE:
            return None  # refuse en bloc par `commande_non_analysable`, pas analyse ici
        if tok in OPTIONS_COMMANDE and i + 1 < len(sous_commande):
            return " ".join(sous_commande[i + 1:])
    return None


def commande_non_analysable(commande: str) -> str | None:
    """
    Le motif pour lequel cette commande ne peut pas etre jugee, ou None si elle est analysable.

    Deux cas, et dans les deux on refuse plutot que de laisser passer : le contrat d'un hook est que
    `exit 0` autorise, donc une limite non dite deviendrait le mode d'emploi du contournement.
    """
    for sous_commande in decouper_commande(commande, profondeur=2):
        # Seulement quand un shell est bien lance : sinon `grep -- "-EncodedCommand" .claude/hooks`,
        # qui lit le code des verrous, etait refuse (revue finale du 17/09/2026).
        if _index_du_shell(sous_commande) is not None and any(t.lower() == OPTION_ENCODEE for t in sous_commande):
            return "commande encodee en base64, non analysable"
    if profondeur_imbrication(commande) > 1:
        return "shells imbriques sur plus d'un niveau, commande non analysable"
    return None


def profondeur_imbrication(commande: str) -> int:
    """Nombre de niveaux de shell imbrique (0 si aucun, 1 pour `bash -c "rm x"`)."""
    niveaux = 0
    courant = [commande]
    while courant and niveaux < 5:
        suivants = [
            interne
            for c in courant
            for sc in decouper_commande(c)
            if (interne := commande_interne(sc))
        ]
        if not suivants:
            break
        niveaux += 1
        courant = suivants
    return niveaux


def decouper_commande(commande: str, profondeur: int = 1) -> list[list[str]]:
    """
    Decoupe une ligne de commande en sous-commandes (separees par `;`, `&&`, `||`, `|`, `&`,
    saut de ligne), chacune en tokens debarrasses de leurs guillemets.

    Mode non-POSIX : les antislashs des chemins Windows sont conserves.

    `profondeur` > 1 ajoute les sous-commandes que portent les shells imbriques (`bash -c "..."`).
    L'ajout est **additif** : la liste d'origine est conservee, donc le defaut `profondeur=1`
    reproduit exactement le comportement historique et aucun appelant ne perd ce qu'il voyait.
    """
    try:
        lexer = shlex.shlex(commande, posix=False, punctuation_chars=True)
        lexer.whitespace_split = True
        lexer.commenters = ""
        tokens = list(lexer)
    except ValueError:
        tokens = commande.split()
    sous_commandes: list[list[str]] = [[]]
    for tok in tokens:
        if tok in _SEPARATEURS:
            if sous_commandes[-1]:
                sous_commandes.append([])
            continue
        if tok in {"(", ")", "{", "}"}:
            continue
        sous_commandes[-1].append(_nettoyer_token(tok))
    resultat = [sc for sc in sous_commandes if sc]
    if profondeur <= 1:
        return resultat
    for sous_commande in list(resultat):
        interne = commande_interne(sous_commande)
        if interne:
            resultat.extend(decouper_commande(interne, profondeur - 1))
    return resultat


def _ressemble_a_un_chemin(token: str) -> bool:
    if not token or token.startswith("-") or token.startswith("http"):
        return False
    if "/" in token or "\\" in token or re.match(r"^[A-Za-z]:", token):
        return True
    return bool(re.search(r"\.[A-Za-z0-9]{1,6}$", token)) and not token.startswith(".")


def extraire_chemins_commande(commande: str) -> list[str]:
    """
    Tous les chemins qu'une commande mentionne, dans leur forme brute : tokens qui ressemblent a
    un chemin, plus les chemins absolus enfouis dans du code cite.
    """
    chemins: list[str] = []
    for sous_commande in decouper_commande(commande):
        for tok in sous_commande:
            for morceau in ([tok.split("=", 1)[1]] if tok.startswith("-") and "=" in tok else [tok]):
                if _ressemble_a_un_chemin(morceau) and morceau not in chemins:
                    chemins.append(morceau)
    for m in _MOTIF_CHEMIN_ABSOLU.finditer(commande):
        brut = m.group(0).rstrip(".:")
        if brut not in chemins:
            chemins.append(brut)
    return chemins


def chemins_de_l_outil(nom_outil: str, entree_outil: dict) -> list[str]:
    """Les chemins cibles d'un appel d'outil fichier (Read, Edit, Write, Grep, Glob, NotebookEdit...)."""
    chemins: list[str] = []
    for cle in ("file_path", "path", "notebook_path"):
        valeur = entree_outil.get(cle)
        if isinstance(valeur, str) and valeur.strip():
            chemins.append(valeur)
    return chemins


def premier_mot(sous_commande: list[str]) -> str:
    """Le programme appele, une fois sautees les affectations `VAR=valeur` et `sudo`/`time`."""
    for tok in sous_commande:
        if re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tok) or tok in {"sudo", "time", "exec", "nohup"}:
            continue
        return os.path.basename(tok.replace("\\", "/")).lower().removesuffix(".exe")
    return ""


def refuser(message: str) -> None:
    # Claude Code lit la sortie des hooks en UTF-8 ; sans cela, Python ecrit dans l'encodage de la
    # console Windows (cp1252) et les accents ou guillemets arrivent en caracteres de remplacement.
    sys.stderr.buffer.write((message.rstrip() + "\n").encode("utf-8"))
    sys.stderr.flush()
    sys.exit(2)


def autoriser() -> None:
    sys.exit(0)
