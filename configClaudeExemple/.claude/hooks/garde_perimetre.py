"""
Verrou perimetre (PreToolUse). Il porte trois regles, et une seule d'entre elles est un perimetre.

1. Le perimetre : l'assistant n'ecrit que dans le projet, `C:\\dev\\bdfg-core`, la memoire de ce projet,
   le scratchpad de ce projet et ses propres reglages utilisateur. Tout le reste est en lecture seule.
2. La zone protegee en ecriture : un fichier de configuration d'environnement (`.env`, `.env.dev1`)
   n'est ni ecrit, ni modifie, ni supprime, **meme dans le perimetre**. Sa lecture reste ouverte.
3. Le dossier `.git/` de toute racine autorisee : rien ne s'y ecrit (un hook git est de l'execution de
   code ; motif `path-guard.ts` de MAOS, lu le 17/09/2026). Le recours est la main de Melvyn.

Regle : `.claude/rules/securite.md`. Les lectures ne sont pas concernees (voir garde_donnees).

Depuis le lot 3 (17/09/2026), ce verrou ne connait plus ni les verbes, ni les enveloppes, ni les shells :
`_commande.analyser` dit quelles invocations la commande lance, `_effets.acces` dit quels chemins chacune
ecrit, et ce fichier n'applique que ses trois predicats au meme resultat. Une commande inanalysable
(guillemet non ferme, deux niveaux de shell, encodage, `eval`, shell ou interprete alimente par un tube)
est refusee en le disant, et **une cible d'ecriture construite a l'execution** (substitution, groupe
PowerShell) l'est aussi : le contrat du hook est que `exit 0` autorise, donc deviner serait le mode
d'emploi du contournement. Un **glob** en cible d'ecriture est resolu contre le disque (noms seulement) et
juge sur ce qu'il atteint ; s'il peut atteindre un `.env`, il est refuse meme sans correspondance.

Limites connues, ecrites dans `securite.md` : un chemin cache derriere une variable de shell (`$D/x`)
n'est pas resolu ; un programme absent de la table `_programmes.py` ne produit aucun acces (seules ses
redirections comptent) ; le corps d'un script lu depuis le disque n'est pas suivi.
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

OUTILS_ECRITURE: frozenset[str] = frozenset({"Edit", "Write", "MultiEdit", "NotebookEdit"})
OUTILS_SHELL: frozenset[str] = frozenset({"Bash", "PowerShell"})

# Depot du socle de modules partages BDFG. Autorise explicitement par Melvyn le 11/09/2026
# (decision chantiers/_decisions/0006), parce que la conception et l'implementation du paquet
# `bdfg-core` s'y font. C'est la seule racine hors EveBackEnd ouverte en ecriture : toute autre
# extension se redemande. Volontairement en dur, et non lue d'une variable d'environnement, pour
# qu'une extension du perimetre reste un changement de code relu en diff.
RACINE_BDFG_CORE = r"C:\dev\bdfg-core"
BUCKET = "c--dev-Eve-EveBackEnd"

# La zone protegee en ecriture, exclusion symetrique de RACINE_BDFG_CORE qui est une inclusion.
# Motif : `C:\dev\maos\CLAUDE.md` section 5, « Any write to `.env*`, secrets files, keystores »
# derriere un clic humain. EVE n'a pas de clic humain dans un hook (le contrat est exit 2 ou exit 0),
# donc la traduction est le refus, et le recours est la main de Melvyn dans VS Code.
# `.env` porte `DB_CONFIG` et n'est pas suivi par git : une erreur y est irreparable.
PREFIXE_PROTEGE = ".env"
DOSSIER_GIT = ".git"
_MOTIF_ACCOLADES = re.compile(r"\{([^{}]*,[^{}]*)\}")


def _racines_autorisees_par_defaut(racine: str) -> list[str]:
    profil = Path(os.path.expanduser("~"))
    return [
        racine,
        RACINE_BDFG_CORE,
        str(profil / ".claude" / "projects" / BUCKET / "memory"),
        str(profil / ".claude" / "settings.json"),
        # Le scratchpad de CE projet, pas celui de tous les projets du poste (verification du 17/09/2026).
        str(Path(os.environ.get("TEMP", str(profil / "AppData" / "Local" / "Temp"))) / "claude" / BUCKET),
    ]


def _dans_perimetre(chemin_brut: str, racine: str, autorisees: list[str]) -> bool:
    chemin = _lib.normaliser(chemin_brut, base=racine)
    return any(_lib.sous(chemin, a) for a in autorisees)


def _zone_protegee(chemin_brut: str) -> bool:
    """Vrai si ce chemin designe un fichier de configuration d'environnement, ou qu'il soit.

    `_lib.normaliser` met en minuscules et ramene les formes Windows et Git Bash a une seule forme :
    `.ENV`, `C:\\dev\\Eve\\EveBackEnd\\.env` et `./.env` sont donc le meme fichier pour ce predicat.
    """
    return _lib.normaliser(chemin_brut).rsplit("/", 1)[-1].startswith(PREFIXE_PROTEGE)


def _sous_git(chemin_brut: str, racine: str, autorisees: list[str]) -> bool:
    """Vrai si ce chemin est dans le dossier `.git/` d'une racine autorisee (hooks, config, index, exclude...)."""
    chemin = _lib.normaliser(chemin_brut, base=racine)
    return any(_lib.sous(chemin, a.rstrip("/") + "/" + DOSSIER_GIT) for a in autorisees + [racine])


def _developper_accolades(chemin: str) -> list[str]:
    """`.{env,bak}` devient `.env` et `.bak` (une seule paire, comme le shell le ferait pour les cas simples)."""
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
    """Le dossier d'un glob : ce qui precede le premier caractere de glob, jusqu'au separateur."""
    indices = [chemin.find(c) for c in _programmes.CARACTERES_GLOB if c in chemin]
    tete = chemin[:min(indices)]
    coupe = max(tete.rfind("/"), tete.rfind("\\"))
    return tete[:coupe] if coupe >= 0 else "."


def _resoudre_glob(chemin: str, racine: str) -> list[str]:
    """Les fichiers qu'un glob atteint aujourd'hui (noms seulement, jamais leur contenu)."""
    try:
        motif = chemin.replace("\\", "/")
        if re.match(r"^([A-Za-z]:|/|~|//)", motif):
            return glob.glob(os.path.expanduser(motif), include_hidden=True)
        return [racine.rstrip("/") + "/" + m.replace("\\", "/") for m in glob.glob(motif, root_dir=racine, include_hidden=True)]
    except (OSError, ValueError):
        return []


def _glob_atteint_un_env(motif: str, racine: str) -> bool:
    """
    Vrai si le motif peut nommer un `.env` dans un dossier qui en contient un aujourd'hui.

    Le cycle 1 refusait tout glob dont le motif pouvait valoir `.env` (`fnmatch(".env", "*")` est vrai),
    donc `rm chantiers/x/*` etait refuse alors qu'aucun `.env` n'y vit : faux refus trouve par la
    verification du 17/09. On regarde donc les noms du dossier fixe (jamais leur contenu).
    """
    base = motif.replace("\\", "/").rsplit("/", 1)[-1]
    if not any(fnmatch.fnmatchcase(nom, base) for nom in (".env", ".env.dev1", ".env.local", ".env.example")):
        return False
    dossier = _partie_fixe(motif)
    absolu = os.path.expanduser(dossier) if re.match(r"^([A-Za-z]:|/|~|//)", dossier) else racine.rstrip("/") + "/" + dossier
    try:
        return any(nom.lower().startswith(PREFIXE_PROTEGE) for nom in os.listdir(absolu))
    except OSError:
        return False


def _refus_zone(cible: str) -> str:
    return (
        f"REFUS garde_perimetre : zone protegee en ecriture, {cible}.\n"
        "Regle .claude/rules/securite.md : les fichiers de configuration d'environnement (.env, "
        ".env.dev1) ne sont ni ecrits, ni modifies, ni supprimes, meme dans le projet. Ils portent "
        "DB_CONFIG et ne sont pas suivis par git : une erreur y est irreparable et peut basculer "
        "les tests sur la base partagee. La lecture reste autorisee (Read, cat, grep). "
        "Toute modification est de la main de Melvyn, dans VS Code."
    )


def _refus_git(cible: str) -> str:
    return (
        f"REFUS garde_perimetre : ecriture sous .git/, {cible}.\n"
        "Regle .claude/rules/securite.md : rien ne s'ecrit dans le dossier .git d'un depot du perimetre (un "
        "hook git est de l'execution de code ; l'index et les references sont a git seul). La lecture reste "
        "autorisee. La reparation d'un git interrompu (index.lock) est de la main de Melvyn."
    )


def _refus_perimetre(cible: str) -> str:
    return (
        f"REFUS garde_perimetre : ecriture hors perimetre sur {cible}.\n"
        "Regle .claude/rules/securite.md : l'assistant n'ecrit que dans EveBackEnd, dans C:\\dev\\bdfg-core, "
        "dans la memoire de ce projet et dans le scratchpad de session. Toute autre ecriture "
        "(autres depots, C:\\dev\\Eve, profil) se demande a Melvyn."
    )


def _refus_opaque(motif: str) -> str:
    return (
        f"REFUS garde_perimetre : {motif}.\n"
        "Regle .claude/rules/securite.md : une commande doit etre lisible pour etre autorisee. "
        "Reformuler sans imbrication, sans encodage, sans eval, guillemets fermes, cibles ecrites en clair."
    )


def _cibles_ecrites(nom_outil: str, entree_outil: dict) -> tuple[list[str], str | None]:
    """Les chemins que l'appel ecrirait, et le motif d'opacite s'il ne peut pas etre juge."""
    if nom_outil in OUTILS_ECRITURE:
        return _lib.chemins_de_l_outil(nom_outil, entree_outil), None
    if nom_outil in OUTILS_SHELL:
        commande = entree_outil.get("command", "")
        if not isinstance(commande, str) or not commande.strip():
            return [], None
        analyse = _commande.analyser(commande, nom_outil)
        if analyse.opaque:
            return [], analyse.opaque
        for inv in analyse.invocations:
            verbe = _effets.ecrit_sans_cible(inv)
            if verbe is not None:
                return [], (f"`{verbe}` ecrit, mais aucune cible n'a pu etre resolue : la commande "
                            "n'est pas comprise en entier")
        return [a.chemin for inv in analyse.invocations for a in _effets.acces(inv) if a.mode == _effets.ECRIT], None
    return [], None


def _juger(cible: str, racine: str, autorisees: list[str]) -> str | None:
    """Le refus pour une cible d'ecriture en clair, ou None."""
    if _zone_protegee(cible):
        return _refus_zone(cible)
    if _sous_git(cible, racine, autorisees):
        return _refus_git(cible)
    if not _dans_perimetre(cible, racine, autorisees):
        return _refus_perimetre(cible)
    return None


def _juger_glob(motif: str, racine: str, autorisees: list[str]) -> str | None:
    """Un glob est juge sur ce qu'il atteint, et refuse s'il peut nommer un `.env` la ou il en existe un."""
    if _glob_atteint_un_env(motif, racine):
        return _refus_zone(motif)
    refus = _juger(_partie_fixe(motif), racine, autorisees)
    if refus:
        return refus
    for atteint in _resoudre_glob(motif, racine):
        refus = _juger(atteint, racine, autorisees)
        if refus:
            return refus
    return None


def decision(nom_outil: str, entree_outil: dict, racine: str | None = None, racines_autorisees: list[str] | None = None) -> str | None:
    """None si l'appel ecrit dans le perimetre, hors zone protegee et hors .git/ (ou n'ecrit pas), sinon le refus."""
    racine = _lib.normaliser(racine or str(_lib.racine_projet()))
    autorisees = [_lib.normaliser(a) for a in (racines_autorisees or _racines_autorisees_par_defaut(racine))]
    cibles, opaque = _cibles_ecrites(nom_outil, entree_outil)
    if opaque:
        return _refus_opaque(opaque)
    # La zone protegee passe devant le perimetre, meme quand les deux s'appliquent : dire « hors
    # perimetre » d'un `.env` laisserait croire qu'il suffit de le deplacer dans le projet pour
    # pouvoir l'ecrire, ce qui est faux. Chaque cible est jugee dans l'ordre zone, .git, perimetre.
    refus_retenu: str | None = None
    for cible in cibles:
        if _commande.MARQUE_INCONNU in cible:
            return _refus_opaque("cible d'ecriture construite a l'execution (substitution ou groupe), non analysable")
        for developpee in _developper_accolades(cible):
            refus = _juger_glob(developpee, racine, autorisees) if _est_un_glob(developpee) else _juger(developpee, racine, autorisees)
            if refus and ("zone protegee" in refus or refus_retenu is None):
                refus_retenu = refus
                if "zone protegee" in refus:
                    return refus
    return refus_retenu


def main() -> None:
    entree = _lib.lire_entree()
    _lib.executer(lambda: decision(entree.get("tool_name", ""), entree.get("tool_input", {}) or {}), "garde_perimetre")


if __name__ == "__main__":
    main()
