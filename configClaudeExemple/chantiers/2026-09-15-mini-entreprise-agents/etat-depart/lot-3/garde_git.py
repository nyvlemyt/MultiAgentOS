"""
Verrou git (PreToolUse sur Bash et PowerShell) : aucune operation destructrice, aucune ecriture
sur les branches partagees, push uniquement sur les branches `features/melvyn/*`.

Regle : `.claude/rules/git.md`. Chaque sous-commande d'une chaine (`a && b ; c`) est inspectee.
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402

BRANCHES_PARTAGEES: frozenset[str] = frozenset({"develop", "master", "main", "test1"})
PREFIXE_PERSONNEL = "features/melvyn/"

# Options globales de git qui consomment la valeur suivante (`git -C chemin status`).
_OPTIONS_GLOBALES_AVEC_VALEUR: frozenset[str] = frozenset({"-C", "-c", "--git-dir", "--work-tree", "--namespace"})
_OPTIONS_PUSH_AVEC_VALEUR: frozenset[str] = frozenset({"-o", "--push-option", "--repo", "--receive-pack", "--exec"})
_SOUS_COMMANDES_INTERDITES: frozenset[str] = frozenset({"clean", "filter-branch", "filter-repo", "replace"})


def _branche_courante(cwd: str | None) -> str:
    try:
        resultat = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=cwd, capture_output=True, text=True, timeout=5, check=False,
        )
        return resultat.stdout.strip() if resultat.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def _est_personnelle(branche: str) -> bool:
    return branche.startswith(PREFIXE_PERSONNEL)


def _arguments_git(sous_commande: list[str]) -> list[str] | None:
    """Les arguments apres `git` et ses options globales, ou None si ce n'est pas un appel git."""
    tokens = list(sous_commande)
    while tokens and (("=" in tokens[0] and not tokens[0].startswith("-")) or tokens[0] in {"sudo", "time", "exec"}):
        tokens.pop(0)
    if not tokens or _lib.premier_mot(tokens[:1]) != "git":
        return None
    args = tokens[1:]
    i = 0
    while i < len(args) and args[i].startswith("-"):
        if args[i] in _OPTIONS_GLOBALES_AVEC_VALEUR:
            i += 2
        else:
            i += 1
    return args[i:]


def _destinations_push(args: list[str], branche_courante: str) -> list[str]:
    positionnels: list[str] = []
    i = 0
    while i < len(args):
        tok = args[i]
        if tok in _OPTIONS_PUSH_AVEC_VALEUR:
            i += 2
            continue
        if not tok.startswith("-"):
            positionnels.append(tok)
        i += 1
    refspecs = positionnels[1:]  # le premier positionnel est le remote
    if not refspecs:
        return [branche_courante]
    destinations: list[str] = []
    for ref in refspecs:
        if ":" in ref:
            source, cible = ref.split(":", 1)
            if source == "":
                destinations.append("")  # suppression distante
                continue
            destinations.append(cible.removeprefix("refs/heads/"))
        else:
            destinations.append(branche_courante if ref == "HEAD" else ref.removeprefix("refs/heads/"))
    return destinations


def _verifier_push(args: list[str], branche_courante: str) -> str | None:
    for tok in args:
        if tok in {"--force", "-f", "--force-with-lease", "--force-if-includes", "--delete", "-d", "--tags", "--all", "--mirror", "--prune"} \
                or tok.startswith("--force-with-lease=") or tok.startswith("--force-if-includes="):
            return f"push avec `{tok}` interdit"
        if tok.startswith("-") and not tok.startswith("--") and "f" in tok[1:] and tok not in {"-u"}:
            return f"push avec `{tok}` (force) interdit"
    for destination in _destinations_push(args, branche_courante):
        if destination == "":
            return "suppression d'une branche distante interdite"
        if destination in BRANCHES_PARTAGEES:
            return f"push vers la branche partagee `{destination}` interdit"
        if not _est_personnelle(destination):
            return f"push vers `{destination or '(branche inconnue)'}` interdit : seules les branches {PREFIXE_PERSONNEL}* sont autorisees"
    return None


def _verifier(args: list[str], branche_courante: str, agent: bool = False) -> str | None:
    if not args:
        return None
    sous, options = args[0], args[1:]
    partagee = branche_courante in BRANCHES_PARTAGEES
    # Un sous agent ne commite ni ne pousse, sur aucune branche. Melvyn le fait depuis le fil
    # principal, apres sa relecture dans VS Code : c'est la regle de `rules/git.md`, qui n'etait
    # tenue par aucun verrou sur les branches personnelles avant le 16/09/2026.
    if agent and sous in {"commit", "push"}:
        return f"`git {sous}` par un sous agent interdit : seul le fil principal committe et pousse, sur demande de Melvyn"
    if sous in _SOUS_COMMANDES_INTERDITES:
        return f"`git {sous}` interdit"
    if sous == "push":
        return _verifier_push(options, branche_courante)
    if sous == "reset" and any(o in {"--hard", "--merge"} for o in options):
        return "`git reset --hard` (ou --merge) interdit : perte de travail non commite"
    if sous == "branch":
        if any(o in {"-D", "-M"} or (o.startswith("-") and not o.startswith("--") and "D" in o[1:]) for o in options):
            return "suppression ou renommage force de branche interdit"
        if any(o in {"-d", "--delete", "-m", "--move"} for o in options):
            cibles = [o for o in options if not o.startswith("-")]
            if any(not _est_personnelle(c) for c in cibles):
                return "seules les branches features/melvyn/* peuvent etre supprimees ou renommees"
    if sous == "checkout":
        if any(o in {".", "--", "-B", "--force", "-f", "--ours", "--theirs"} for o in options) or "*" in options:
            return "`git checkout` qui ecrase des fichiers de travail interdit (utiliser switch pour changer de branche)"
        cibles = [o for o in options if not o.startswith("-")]
        if "-b" not in options and any(_est_un_fichier_existant(c) for c in cibles):
            return "`git checkout <fichier>` ecrase le travail non commite : interdit"
    if sous == "restore" and ("--staged" not in options and "-S" not in options or "--worktree" in options or "-W" in options):
        return "`git restore` sur l'arbre de travail interdit (seul `--staged` est autorise)"
    if sous == "stash" and options and options[0] in {"drop", "clear"}:
        return f"`git stash {options[0]}` interdit : le stash protege du travail en attente"
    if sous == "commit":
        if partagee:
            return f"commit sur la branche partagee `{branche_courante}` interdit"
        if "--amend" in options:
            return "`git commit --amend` interdit : preferer un nouveau commit"
        if "--no-verify" in options or "-n" in options:
            return "`--no-verify` interdit : les hooks ne se contournent pas"
    if sous == "merge" and partagee:
        return f"merge sur la branche partagee `{branche_courante}` interdit"
    if sous == "rebase" and (partagee or "-i" in options or "--interactive" in options):
        return "rebase d'une branche partagee ou interactif interdit"
    if sous == "config" and not _config_en_lecture(options) \
            and any(o in {"--global", "--system"} or "hookspath" in o.lower() for o in options):
        return "`git config` global/systeme ou sur hooksPath interdit en ecriture (lecture possible avec --get ou --list)"
    if sous == "tag" and any(o in {"-d", "--delete"} for o in options):
        return "suppression de tag interdite"
    if sous == "update-ref" and any(o in {"-d", "--delete"} for o in options):
        return "`git update-ref -d` interdit"
    if sous == "reflog" and "expire" in options:
        return "`git reflog expire` interdit"
    return None


_CONFIG_OPTIONS_LECTURE: frozenset[str] = frozenset({
    "--get", "--get-all", "--get-regexp", "--get-urlmatch", "--list", "-l", "--get-color", "--get-colorbool",
})
_CONFIG_OPTIONS_ECRITURE: frozenset[str] = frozenset({
    "--unset", "--unset-all", "--add", "--replace-all", "--edit", "-e", "--rename-section", "--remove-section",
})


def _config_en_lecture(options: list[str]) -> bool:
    """Vrai pour `git config --get ...`, `--list` : une lecture, meme globale, ne modifie rien.

    Faux positif corrige le 09/09/2026 : `git config --get core.hooksPath` etait refuse.
    """
    return any(o in _CONFIG_OPTIONS_LECTURE for o in options) and not any(o in _CONFIG_OPTIONS_ECRITURE for o in options)


def _est_un_fichier_existant(candidat: str) -> bool:
    if candidat in BRANCHES_PARTAGEES or _est_personnelle(candidat):
        return False
    try:
        return Path(candidat).is_file()
    except OSError:
        return False


def decision(commande: str, branche_courante: str, agent: bool = False) -> str | None:
    """
    None si la commande est autorisee, sinon le message de refus.

    `agent` vaut vrai quand l'appel vient d'un sous agent. Le defaut `False` garde le comportement
    de tous les appels existants, y compris les tests en place.
    """
    # Profondeur 2 : un shell imbrique portait la commande en un seul token, et les sept interdits de
    # `git.md` tombaient tous derriere `bash -c` (sonde du 17/09/2026). Au dela d'un niveau, on refuse
    # plutot que de laisser passer ce qu'on ne sait pas analyser : le contrat du hook est que `exit 0`
    # autorise, donc une limite non dite deviendrait le mode d'emploi du contournement.
    opaque = _lib.commande_non_analysable(commande)
    if opaque:
        return (
            f"REFUS garde_git : {opaque}.\n"
            "Regle .claude/rules/git.md : une commande git doit etre lisible pour etre autorisee. "
            "Reformuler sans imbrication ni encodage."
        )
    for sous_commande in _lib.decouper_commande(commande, profondeur=2):
        args = _arguments_git(sous_commande)
        if args is None:
            continue
        motif = _verifier(args, branche_courante, agent)
        if motif:
            return (
                f"REFUS garde_git : {motif}.\n"
                "Regle .claude/rules/git.md : commits et push uniquement sur demande explicite de Melvyn, "
                "sur ses branches features/melvyn/*, jamais d'operation destructrice."
            )
    return None


def decision_depuis_entree(entree: dict) -> str | None:
    """
    Decision a partir de l'entree brute du hook. None autorise, un message refuse.

    C'est la couche que `main()` emprunte : la tester, c'est tester le chemin reel, y compris la
    reconnaissance du sous agent, qu'un test sur `decision()` seule ne verrait pas.
    """
    if entree.get("tool_name") not in {"Bash", "PowerShell"}:
        return None
    commande = (entree.get("tool_input") or {}).get("command", "")
    if not isinstance(commande, str) or "git" not in commande:
        return None
    branche = _branche_courante(entree.get("cwd") or str(_lib.racine_projet()))
    return decision(commande, branche, agent=bool(entree.get("agent_id")))


def main() -> None:
    message = decision_depuis_entree(_lib.lire_entree())
    if message:
        _lib.refuser(message)
    _lib.autoriser()


if __name__ == "__main__":
    main()
