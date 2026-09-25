"""
Verrou perimetre (PreToolUse). Il porte deux regles, et une seule d'entre elles est un perimetre.

1. Le perimetre : l'assistant n'ecrit que dans le projet, la memoire de ce projet, le scratchpad de
   session et ses propres reglages utilisateur. Tout le reste est en lecture seule.
2. La zone protegee en ecriture : un fichier de configuration d'environnement (`.env`, `.env.dev1`)
   n'est ni ecrit, ni modifie, ni supprime, **meme dans le perimetre**. Sa lecture reste ouverte.

Regle : `.claude/rules/securite.md`. Les lectures ne sont pas concernees (voir garde_donnees).

Un shell imbrique (`bash -c "..."`) voit sa commande redecoupee et jugee comme si elle avait ete
tapee directement ; au dela d'un niveau d'imbrication, l'appel est refuse plutot qu'analyse a moitie.

Limites connues : un chemin cache derriere une variable de shell (`$D/x`) est resolu comme relatif,
donc considere dans le projet ; une cible passee d'une sous-commande a l'autre par un tube n'est pas
suivie. Le verrou borne les erreurs franches, pas la mauvaise foi.
"""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402

OUTILS_ECRITURE: frozenset[str] = frozenset({"Edit", "Write", "MultiEdit", "NotebookEdit"})
OUTILS_SHELL: frozenset[str] = frozenset({"Bash", "PowerShell"})

# Programmes qui ecrivent : toutes leurs cibles doivent etre dans le perimetre.
VERBES_TOUTES_CIBLES: frozenset[str] = frozenset({
    "rm", "rmdir", "mkdir", "touch", "tee", "truncate", "unlink", "shred",
    "remove-item", "ri", "rd", "del", "erase", "new-item", "ni", "md", "set-content", "sc", "add-content", "ac",
    "out-file", "clear-content", "clc", "rename-item", "ren", "rni", "set-itemproperty", "sp",
})
# Programmes dont seule la DERNIERE cible (destination) doit etre dans le perimetre.
VERBES_DESTINATION: frozenset[str] = frozenset({"cp", "mv", "rsync", "copy-item", "cpi", "copy", "move-item", "mi", "move", "install", "ln"})
# Parmi eux, ceux qui DEPLACENT : leur source disparait, donc elle compte autant que leur destination.
VERBES_DEPLACEMENT: frozenset[str] = frozenset({"mv", "move-item", "mi", "move"})
# Programmes qui ecrivent sans etre des verbes de fichier courants, trouves par l'attaque du plan
# puis par la verification independante.
VERBES_ECRITURE_RARES: frozenset[str] = frozenset({"dd", "patch", "curl", "wget", "tar"})
# Programmes qui editent en place quand ils recoivent `-i` (`sed -i`, `sed -i.bak`, `sed --in-place`,
# `awk -i inplace`). Sans cette option ce sont des lecteurs, et la lecture reste ouverte.
VERBES_EDITION_EN_PLACE: frozenset[str] = frozenset({"sed", "awk"})
# Shells imbriques. Leur commande arrive en UN SEUL token (`bash -c "rm .env"` se decoupe en trois
# tokens dont le dernier est la commande entiere). Deux mecanismes s'y appliquent, et c'est voulu :
# le motif cherche dans le texte, ici, et le redecoupage de `_lib` (ceinture et bretelles).
SHELLS_IMBRIQUES: frozenset[str] = frozenset({"bash", "sh", "zsh", "ksh", "dash", "cmd"})
# La liste vit dans `_lib` depuis le 17/09/2026, parce que `commande_interne` en a besoin elle
# aussi pour trouver un shell imbrique derriere une enveloppe. Reprise ici, jamais dupliquee.
ENVELOPPES: frozenset[str] = _lib.ENVELOPPES_LANCEURS
# Gestionnaires de paquets : leur sous-commande `install` n'est pas la commande Unix `install`.
GESTIONNAIRES_DE_PAQUETS: frozenset[str] = frozenset({"npm", "npx", "pnpm", "yarn", "uv", "poetry", "pip"})
# Options qui lancent un programme a leur tour (`find -exec rm {} ;`).
OPTIONS_QUI_LANCENT: frozenset[str] = frozenset({"-exec", "-execdir", "-ok", "-okdir"})
# Appels .NET qui ecrivent, utilises depuis PowerShell. L'outil `PowerShell` est lui-meme un
# interpreteur : son texte n'a pas de verbe en tete, donc aucun jeu de programmes ne le voit.
# Liste volontairement etroite pour que la LECTURE par `Get-Content` reste autorisee.
# Ecrits sans leurs parentheses : le decoupage en tokens separe `.Delete` de `()`. Les deux
# conventions d'appel sont couvertes, l'instance (`(Get-Item x).Delete`) et la statique
# (`[IO.File]::Delete`). `CopyTo` n'y est pas : copier un fichier protege ailleurs est une lecture,
# autorisee par `securite.md`, comme `cp` l'est deja.
INDICES_ECRITURE_DOTNET: tuple[str, ...] = (
    "writealltext", "writealllines", "writeallbytes", "appendalltext", "appendalllines",
    "openwrite", "createtext", "streamwriter",
    ".delete", "::delete", ".moveto", "::move", "::replace", "::create",
)
# Les options qui designent vraiment une DESTINATION, pour la famille des copies. Volontairement plus
# etroit qu'`OPTIONS_DESTINATION` : `-Path` est la SOURCE de `Copy-Item`, et copier un `.env` ailleurs
# est une lecture, qui doit passer.
OPTIONS_VRAIE_DESTINATION: frozenset[str] = frozenset({"-destination", "-target"})
OPTIONS_DESTINATION: frozenset[str] = frozenset({"-destination", "-path", "-literalpath", "-filepath", "-outfile", "-target"})
REDIRECTIONS: frozenset[str] = frozenset({">", ">>", ">&", "&>", ">|", "1>", "2>", "1>>", "2>>"})
CIBLES_SURES: frozenset[str] = frozenset({"/dev/null", "nul", "$null", "/dev/stdout", "/dev/stderr", "&1", "&2", "1", "2"})
# Un script inline (python, node, powershell) qui ecrit : on ne regarde que les chemins ABSOLUS
# locaux qu'il cite (lecteur ou forme Git Bash). Les chemins relatifs sont dans le projet, et
# les sequences d'echappement (`\\u2014`) ne sont pas des chemins.
INDICES_ECRITURE_SCRIPT: tuple[str, ...] = (
    "open(", ".write(", "write_text", "write_bytes", "to_csv", "to_excel", "to_parquet", "write_csv", "write_parquet",
    "write_excel", "os.remove", "os.rename", "shutil.", "unlink(", "rmtree", "mkdir(", "makedirs", "set-content", "out-file",
)
SCRIPTS: frozenset[str] = frozenset({"python", "python3", "py", "node", "pwsh", "powershell", "perl", "ruby"})
_MOTIF_CHEMIN_ABSOLU_LOCAL = re.compile(r"""(?:[A-Za-z]:[\\/]|/[A-Za-z]/)[^\s"'`()<>|;,]+""")


# Depot du socle de modules partages BDFG. Autorise explicitement par Melvyn le 11/09/2026
# (decision chantiers/_decisions/0006), parce que la conception et l'implementation du paquet
# `bdfg-core` s'y font. C'est la seule racine hors EveBackEnd ouverte en ecriture : toute autre
# extension se redemande. Volontairement en dur, et non lue d'une variable d'environnement, pour
# qu'une extension du perimetre reste un changement de code relu en diff.
RACINE_BDFG_CORE = r"C:\dev\bdfg-core"


# La zone protegee en ecriture, exclusion symetrique de RACINE_BDFG_CORE qui est une inclusion.
# Motif : `C:\dev\maos\CLAUDE.md` section 5, « Any write to `.env*`, secrets files, keystores »
# derriere un clic humain. EVE n'a pas de clic humain dans un hook (le contrat est exit 2 ou exit 0),
# donc la traduction est le refus, et le recours est la main de Melvyn dans VS Code.
# `.env` porte `DB_CONFIG` et n'est pas suivi par git : une erreur y est irreparable.
PREFIXE_PROTEGE = ".env"
# Le meme nom, mais cherche A L'INTERIEUR du texte d'un script inline (`python -c "open('.env','w')"`),
# ou il n'est jamais un token a lui seul. Ancre a gauche pour ne pas attraper `os.environ`,
# `config.env` ni `.venv`, qui ne sont pas des fichiers de configuration d'environnement.
_MOTIF_FICHIER_PROTEGE = re.compile(r"(?<![A-Za-z0-9_.])\.env[A-Za-z0-9._-]*")


def _racines_autorisees_par_defaut(racine: str) -> list[str]:
    profil = Path(os.path.expanduser("~"))
    bucket = "c--dev-Eve-EveBackEnd"
    return [
        racine,
        RACINE_BDFG_CORE,
        str(profil / ".claude" / "projects" / bucket / "memory"),
        str(profil / ".claude" / "settings.json"),
        str(Path(os.environ.get("TEMP", str(profil / "AppData" / "Local" / "Temp"))) / "claude"),
    ]


def _dans_perimetre(chemin_brut: str, racine: str, autorisees: list[str]) -> bool:
    chemin = _lib.normaliser(chemin_brut, base=racine)
    return any(_lib.sous(chemin, a) for a in autorisees)


def _cibles_redirections(tokens: list[str]) -> list[str]:
    cibles: list[str] = []
    for i, tok in enumerate(tokens):
        if tok in REDIRECTIONS and i + 1 < len(tokens):
            cible = tokens[i + 1]
            if cible.lower() not in CIBLES_SURES and not cible.startswith("&"):
                cibles.append(cible)
        elif any(tok.startswith(r) for r in (">", "1>", "2>", "&>")) and len(tok) > 1 and not tok.startswith(">&"):
            cible = tok.lstrip("12&>")
            if cible and cible.lower() not in CIBLES_SURES:
                cibles.append(cible)
    return cibles


def _cible_reelle(candidat: str) -> bool:
    """
    Faux pour un residu de decoupage qui ne designe aucun fichier.

    Des guillemets echappes (`bash -c "rm \\"x\\""`) laissent un token reduit a une barre oblique
    inverse, que `normaliser` ramene a la racine du lecteur : le verrou refusait alors une ecriture
    parfaitement legitime, en annoncant la racine comme cible. Trouve par l'attaque du 17/09/2026.
    """
    return bool(candidat.strip("\"'\\/ \t"))


def _zone_protegee(chemin_brut: str) -> bool:
    """Vrai si ce chemin designe un fichier de configuration d'environnement, ou qu'il soit.

    `_lib.normaliser` met en minuscules et ramene les formes Windows et Git Bash a une seule forme :
    `.ENV`, `C:\\dev\\Eve\\EveBackEnd\\.env` et `./.env` sont donc le meme fichier pour ce predicat.
    """
    return _lib.normaliser(chemin_brut).rsplit("/", 1)[-1].startswith(PREFIXE_PROTEGE)


def _programmes_invoques(sous_commande: list[str]) -> set[str]:
    """
    Tous les programmes que cette sous-commande lance, enveloppes traversees.

    `premier_mot` s'arrete au premier mot et ne saute que quatre enveloppes : `timeout 5 rm .env`
    lui rend `timeout`, et le verbe qui detruit disparait. On ne corrige pas `_lib`, partage avec les
    deux autres verrous ; on traverse ici.

    Un mot n'est retenu comme programme que s'il est **en position de programme** : en tete, apres une
    enveloppe, apres l'argument numerique **d'une enveloppe**, ou apres une option qui lance. C'est ce
    qui evite de lire `grep rm .env` comme une suppression.

    Le `apres_enveloppe` n'est pas un detail : sans lui, la valeur de n'importe quelle option numerique
    rouvrait la position, et `grep -m 1 rm .env` redevenait une suppression (regression trouvee par la
    revue finale du 16/09).
    """
    programmes: set[str] = set()
    en_position = True
    apres_enveloppe = False
    for token in sous_commande:
        if token.lower() in OPTIONS_QUI_LANCENT:
            en_position, apres_enveloppe = True, False
            continue
        if token.startswith("-") or re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", token):
            continue
        nom = os.path.basename(token.replace("\\", "/")).lower().removesuffix(".exe")
        if en_position:
            programmes.add(nom)
        if nom in ENVELOPPES:
            en_position, apres_enveloppe = True, True
        elif apres_enveloppe and nom.isdigit():
            en_position = True
        else:
            en_position, apres_enveloppe = False, False
    return programmes


def _verbes_a_ignorer(sous_commande: list[str]) -> set[str]:
    """
    Les mots qui ressemblent a un verbe de fichier mais n'en sont pas dans ce contexte.

    `npm install <chemin>` et `poetry install` installent des paquets ; `install` est aussi la
    commande Unix qui copie un fichier. Traverser les enveloppes a fait entrer `npm install` dans la
    famille des copies, et un chemin hors perimetre y devenait un refus (regression introduite puis
    corrigee le 17/09/2026).
    """
    return {"install"} if _programmes_invoques(sous_commande) & GESTIONNAIRES_DE_PAQUETS else set()


def _valeurs_candidates(token: str) -> list[str]:
    """Le token lui-meme, plus la partie droite d'une forme `option=valeur` (`dd of=.env`)."""
    morceaux = [token, token.split("=", 1)[1]] if "=" in token else [token]
    return [m for m in morceaux if m and not m.startswith("-")]


def _cibles_protegees(sous_commande: list[str], outil_powershell: bool = False) -> list[str]:
    """
    Les chemins de la zone protegee que cette sous-commande ecrirait, modifierait ou supprimerait.

    Volontairement separe de `_cibles_ecriture` : celle-ci ne retient que les tokens que
    `_lib._ressemble_a_un_chemin` reconnait, et ce filtre rejette **tout token commencant par un
    point**. Un `tee .env` n'y produit donc aucune cible (sonde du 16/09/2026). Le socle `_lib` est
    partage avec `garde_donnees` : on ne le change pas pour un besoin qui tient dans ce seul verrou.

    Trois familles, parce qu'elles ne visent pas les memes tokens :
    ecrire ou detruire porte sur toutes les cibles ; copier ne porte que sur la destination, parce que
    `cp .env sauvegarde` est une lecture et que la lecture reste ouverte ; interpreter porte sur le
    texte, parce que le nom du fichier y vit a l'interieur d'un token.

    Ce qui echappe, et qui est ecrit dans `.claude/rules/securite.md` : un chemin cache derriere une
    variable de shell, une cible passee d'une sous-commande a l'autre par un tube (`echo .env | xargs
    rm`), et tout programme qui ecrit sans appartenir a ces familles.
    """
    programmes = _programmes_invoques(sous_commande) - _verbes_a_ignorer(sous_commande)
    tokens = sous_commande[1:]
    texte = " ".join(sous_commande)
    candidats: list[str] = _cibles_redirections(tokens)
    edite_en_place = bool(programmes & VERBES_EDITION_EN_PLACE) and any(t.startswith(("-i", "--in-place")) for t in tokens)
    supprime_par_find = "find" in programmes and "-delete" in tokens
    # Les indices .NET ne valent que pour l'outil `PowerShell`, qui est lui meme un interpreteur.
    # Les appliquer a toute commande shell refusait `grep '.delete' .env`, qui est une lecture
    # (regression trouvee par la revue finale du 16/09). Par `pwsh -c`, c'est `SCRIPTS` qui couvre.
    dotnet = outil_powershell and any(i in texte.lower() for i in INDICES_ECRITURE_DOTNET)
    interprete = bool(programmes & (SCRIPTS | SHELLS_IMBRIQUES)) or dotnet
    if interprete:
        candidats.extend(_MOTIF_FICHIER_PROTEGE.findall(texte))
    if (
        programmes & (VERBES_TOUTES_CIBLES | VERBES_DEPLACEMENT | VERBES_ECRITURE_RARES)
        or interprete
        or edite_en_place
        or supprime_par_find
    ):
        for tok in tokens:
            candidats.extend(_valeurs_candidates(tok))
    elif programmes & VERBES_DESTINATION:
        for i, tok in enumerate(tokens):
            if tok.lower() in OPTIONS_VRAIE_DESTINATION and i + 1 < len(tokens):
                candidats.append(tokens[i + 1])
        non_options = [t for t in tokens if not t.startswith("-")]
        if non_options and not any(t.lower() in OPTIONS_VRAIE_DESTINATION for t in tokens):
            candidats.append(non_options[-1])
    return [c for c in candidats if _cible_reelle(c) and _zone_protegee(c)]


def _cibles_ecriture(sous_commande: list[str]) -> list[str]:
    """
    Les chemins que cette sous-commande ecrirait, ou modifierait, ou supprimerait.

    Les programmes sont cherches **enveloppes traversees**, comme dans `_cibles_protegees` :
    `env rm <hors perimetre>` passait tant que seul le premier mot etait regarde, alors que la zone
    protegee, elle, etait deja couverte (revue finale du 17/09/2026).
    """
    programmes = _programmes_invoques(sous_commande) - _verbes_a_ignorer(sous_commande)
    tokens = sous_commande[1:]
    cibles: list[str] = _cibles_redirections(tokens)
    chemins = [t for t in tokens if t not in REDIRECTIONS and not t.startswith("-") and _lib._ressemble_a_un_chemin(t)]
    if programmes & VERBES_TOUTES_CIBLES:
        cibles.extend(chemins)
        for i, tok in enumerate(tokens):
            if tok.lower() in OPTIONS_DESTINATION and i + 1 < len(tokens):
                cibles.append(tokens[i + 1])
    elif programmes & VERBES_DESTINATION:
        # `-Path` designe la SOURCE. Pour une COPIE, la source ne compte pas : recopier un fichier de
        # reference depuis l'exterieur vers le projet est une lecture, qui doit passer. Pour un
        # DEPLACEMENT, elle compte autant que la destination, parce qu'elle disparait : ne pas faire
        # la difference laissait passer `Move-Item -Path <hors perimetre> -Destination <projet>`
        # (regression introduite puis corrigee le 17/09/2026).
        deplace = bool(programmes & VERBES_DEPLACEMENT)
        options = OPTIONS_DESTINATION if deplace else OPTIONS_VRAIE_DESTINATION
        for i, tok in enumerate(tokens):
            if tok.lower() in options and i + 1 < len(tokens):
                cibles.append(tokens[i + 1])
        if deplace:
            cibles.extend(chemins)
        elif chemins and not any(t.lower() in options for t in tokens):
            cibles.append(chemins[-1])
    elif programmes & VERBES_EDITION_EN_PLACE and any(t.startswith(("-i", "--in-place")) for t in tokens):
        cibles.extend(chemins)
    elif programmes & SCRIPTS:
        texte = " ".join(sous_commande)
        if any(indice in texte.lower() for indice in INDICES_ECRITURE_SCRIPT):
            cibles.extend(m.group(0) for m in _MOTIF_CHEMIN_ABSOLU_LOCAL.finditer(texte))
    return [c for c in cibles if _cible_reelle(c)]


def decision(nom_outil: str, entree_outil: dict, racine: str | None = None, racines_autorisees: list[str] | None = None) -> str | None:
    """None si l'appel ecrit dans le perimetre, hors zone protegee (ou n'ecrit pas), sinon le refus."""
    racine = _lib.normaliser(racine or str(_lib.racine_projet()))
    autorisees = [_lib.normaliser(a) for a in (racines_autorisees or _racines_autorisees_par_defaut(racine))]
    protege: str | None = None
    hors: str | None = None
    if nom_outil in OUTILS_ECRITURE:
        for chemin in _lib.chemins_de_l_outil(nom_outil, entree_outil):
            if protege is None and _zone_protegee(chemin):
                protege = chemin
            if hors is None and not _dans_perimetre(chemin, racine, autorisees):
                hors = chemin
    elif nom_outil in OUTILS_SHELL:
        commande = entree_outil.get("command", "")
        if isinstance(commande, str) and commande.strip():
            # Meme motif que dans `garde_git` : au dela d'un niveau d'imbrication, on refuse plutot
            # que de laisser passer une commande qu'on ne sait pas analyser.
            opaque = _lib.commande_non_analysable(commande)
            if opaque:
                return (
                    f"REFUS garde_perimetre : {opaque}.\n"
                    "Regle .claude/rules/securite.md : une commande doit etre lisible pour etre autorisee. "
                    "Reformuler sans imbrication ni encodage."
                )
            for sous_commande in _lib.decouper_commande(commande, profondeur=2):
                for cible in _cibles_protegees(sous_commande, outil_powershell=nom_outil == "PowerShell"):
                    if protege is None:
                        protege = cible
                for cible in _cibles_ecriture(sous_commande):
                    if hors is None and not _dans_perimetre(cible, racine, autorisees):
                        hors = cible
    # La zone protegee passe devant le perimetre, meme quand les deux s'appliquent : dire « hors
    # perimetre » d'un `.env` laisserait croire qu'il suffit de le deplacer dans le projet pour
    # pouvoir l'ecrire, ce qui est faux.
    if protege is not None:
        return (
            f"REFUS garde_perimetre : zone protegee en ecriture, {protege}.\n"
            "Regle .claude/rules/securite.md : les fichiers de configuration d'environnement (.env, "
            ".env.dev1) ne sont ni ecrits, ni modifies, ni supprimes, meme dans le projet. Ils portent "
            "DB_CONFIG et ne sont pas suivis par git : une erreur y est irreparable et peut basculer "
            "les tests sur la base partagee. La lecture reste autorisee (Read, cat, grep). "
            "Toute modification est de la main de Melvyn, dans VS Code."
        )
    if hors is not None:
        return (
            f"REFUS garde_perimetre : ecriture hors perimetre sur {hors}.\n"
            "Regle .claude/rules/securite.md : l'assistant n'ecrit que dans EveBackEnd, dans C:\\dev\\bdfg-core, "
            "dans la memoire de ce projet et dans le scratchpad de session. Toute autre ecriture "
            "(autres depots, C:\\dev\\Eve, profil) se demande a Melvyn."
        )
    return None


def main() -> None:
    entree = _lib.lire_entree()
    message = decision(entree.get("tool_name", ""), entree.get("tool_input", {}) or {})
    if message:
        _lib.refuser(message)
    _lib.autoriser()


if __name__ == "__main__":
    main()
