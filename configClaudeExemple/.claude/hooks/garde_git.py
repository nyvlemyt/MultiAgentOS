"""
Verrou git (PreToolUse sur Bash et PowerShell) : aucune operation destructrice, aucune ecriture
sur les branches partagees, push uniquement sur les branches `features/melvyn/*`.

Regle : `.claude/rules/git.md`. Chaque invocation de `git` que la commande lance est inspectee, quelle
que soit la facon de l'appeler : directe, derriere une enveloppe (`env`, `timeout 5`, `winpty`, `uv run`),
dans un shell imbrique (`bash -c`, `pwsh -Command`, `cmd /c`), dans une substitution (`$(...)`), relancee
par un interpreteur (`os.system(...)`, `subprocess.run([...])`), depuis un bloc PowerShell. L'analyse de la
commande est celle de `_commande.analyser`, partagee avec les deux autres verrous depuis le lot 3
(17/09/2026) : `garde_git` ne connait plus ni les enveloppes ni les shells, il ne connait que git.

Ce que ce verrou ajoute a l'analyse, apres la verification contradictoire du 17/09 : les options de git
sont **normalisees** avant jugement (un groupe court `-nm` vaut `-n -m`, un prefixe long non ambigu
`--amen` vaut `--amend`, comme git le fait) ; un argument **construit a l'execution** ou venu d'un tube
est refuse ; un **alias** inconnu est resolu par `git config --get alias.<nom>` et juge sur son expansion ;
une **cle de configuration qui execute du code** (`core.hooksPath`, `core.fsmonitor`, `alias.*`...) ne
s'ecrit ni ne s'injecte par `-c`.
"""
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _commande  # noqa: E402
import _lib  # noqa: E402
import _programmes  # noqa: E402

BRANCHES_PARTAGEES: frozenset[str] = frozenset({"develop", "master", "main", "test1"})
PREFIXE_PERSONNEL = "features/melvyn/"

_OPTIONS_GLOBALES_AVEC_VALEUR: frozenset[str] = _programmes.GIT_OPTIONS_GLOBALES_AVEC_VALEUR
_OPTIONS_QUI_POSENT_UNE_CLE: frozenset[str] = frozenset({"-c", "--config-env"})
_OPTIONS_PUSH_AVEC_VALEUR: frozenset[str] = frozenset({"-o", "--push-option", "--repo", "--receive-pack", "--exec"})
_SOUS_COMMANDES_INTERDITES: frozenset[str] = frozenset({"clean", "filter-branch", "filter-repo", "replace"})
_OPTIONS_PUSH_INTERDITES: frozenset[str] = frozenset({
    "--force", "-f", "--force-with-lease", "--force-if-includes", "--delete", "-d", "--tags", "--all", "--mirror", "--prune", "--no-verify",
})
# Ce qui, sur une branche partagee, ecrit son historique : c'est « commit sur develop » sous un autre nom.
_ECRIVENT_L_HISTORIQUE: frozenset[str] = frozenset({"commit", "merge", "rebase", "cherry-pick", "revert", "pull", "am"})
# Les options longues connues par sous-commande, pour resoudre les prefixes que git accepte (`--amen`).
_LONGUES: dict[str, tuple[str, ...]] = {
    "commit": ("amend", "no-verify", "all", "message", "quiet", "verbose", "signoff", "allow-empty", "fixup", "squash", "reuse-message", "reedit-message", "patch", "interactive", "dry-run", "author", "date", "cleanup", "no-edit", "edit", "include", "only", "untracked-files", "file", "template", "status", "no-status", "gpg-sign", "no-gpg-sign", "trailer"),
    "reset": ("hard", "soft", "mixed", "merge", "keep", "quiet", "patch", "pathspec-from-file", "no-refresh"),
    "push": ("force", "force-with-lease", "force-if-includes", "delete", "tags", "all", "mirror", "prune", "no-verify", "dry-run", "set-upstream", "quiet", "verbose", "follow-tags", "atomic", "porcelain", "recurse-submodules", "push-option", "repo", "receive-pack", "exec", "signed", "thin", "progress"),
    "send-pack": ("force", "all", "dry-run", "mirror", "receive-pack", "exec", "verbose", "thin", "atomic", "signed", "stateless-rpc", "progress"),
    "branch": ("delete", "force", "move", "copy", "list", "all", "remotes", "verbose", "show-current", "set-upstream-to", "unset-upstream", "track", "no-track", "contains", "no-contains", "merged", "no-merged", "sort", "format", "edit-description", "quiet", "column", "color", "points-at", "ignore-case"),
    "checkout": ("force", "ours", "theirs", "orphan", "detach", "patch", "quiet", "track", "no-track", "merge", "conflict", "recurse-submodules", "progress", "guess", "no-guess", "overlay", "no-overlay", "pathspec-from-file"),
    "switch": ("discard-changes", "force", "create", "force-create", "detach", "orphan", "merge", "quiet", "track", "no-track", "guess", "no-guess", "ignore-other-worktrees", "recurse-submodules", "progress"),
    "restore": ("staged", "worktree", "source", "patch", "ours", "theirs", "merge", "quiet", "ignore-unmerged", "overlay", "no-overlay", "conflict", "progress", "pathspec-from-file"),
    "stash": ("include-untracked", "all", "keep-index", "no-keep-index", "patch", "quiet", "message", "staged", "pathspec-from-file", "index"),
    "rebase": ("interactive", "autostash", "no-autostash", "onto", "continue", "abort", "skip", "quit", "root", "exec", "keep-empty", "autosquash", "no-autosquash", "rebase-merges", "no-verify", "verify", "force-rebase", "strategy", "strategy-option", "fork-point", "no-fork-point", "update-refs", "committer-date-is-author-date", "ignore-date", "signoff", "edit-todo", "show-current-patch", "keep-base", "empty", "reapply-cherry-picks", "reschedule-failed-exec", "stat", "no-stat", "quiet", "verbose", "gpg-sign"),
    "merge": ("no-verify", "verify", "no-ff", "ff", "ff-only", "squash", "no-squash", "abort", "continue", "quit", "no-commit", "commit", "edit", "no-edit", "message", "file", "strategy", "strategy-option", "autostash", "no-autostash", "signoff", "allow-unrelated-histories", "log", "no-log", "stat", "no-stat", "quiet", "verbose", "progress", "gpg-sign", "into-name", "cleanup", "rerere-autoupdate"),
    "config": ("global", "system", "local", "worktree", "file", "get", "get-all", "get-regexp", "get-urlmatch", "list", "unset", "unset-all", "add", "replace-all", "edit", "rename-section", "remove-section", "get-color", "get-colorbool", "blob", "show-origin", "show-scope", "name-only", "type", "bool", "int", "bool-or-int", "path", "expiry-date", "default", "null", "fixed-value", "includes", "no-includes"),
    "tag": ("delete", "list", "annotate", "message", "force", "sign", "verify", "contains", "no-contains", "merged", "no-merged", "sort", "format", "column", "points-at", "file", "cleanup", "local-user", "ignore-case", "create-reflog"),
    "worktree": ("force", "detach", "checkout", "no-checkout", "lock", "reason", "orphan", "track", "no-track", "guess-remote", "no-guess-remote", "quiet", "porcelain", "verbose", "expire", "dry-run"),
    "fetch": ("all", "prune", "prune-tags", "force", "tags", "no-tags", "dry-run", "depth", "deepen", "shallow-since", "shallow-exclude", "unshallow", "update-shallow", "update-head-ok", "quiet", "verbose", "recurse-submodules", "refmap", "jobs", "multiple", "atomic", "porcelain", "progress", "set-upstream", "negotiation-tip", "write-fetch-head", "no-write-fetch-head", "auto-maintenance", "no-auto-maintenance", "auto-gc", "no-auto-gc"),
    "clean": ("force", "dry-run", "interactive", "quiet", "exclude"),
    "reflog": ("expire", "delete", "exists", "all", "dry-run", "rewrite", "updateref", "stale-fix", "expire-unreachable", "verbose", "single-worktree"),
    "read-tree": ("reset", "merge", "prefix", "index-output", "empty", "dry-run", "trivial", "aggressive", "verbose", "no-sparse-checkout", "debug-unpack", "recurse-submodules"),
    "checkout-index": ("all", "force", "index", "quiet", "prefix", "stage", "temp", "stdin", "no-create", "ignore-skip-worktree-bits"),
    "update-ref": ("delete", "no-deref", "stdin", "create-reflog"),
    "pull": ("rebase", "no-rebase", "no-verify", "verify", "ff", "no-ff", "ff-only", "squash", "autostash", "no-autostash", "all", "prune", "tags", "no-tags", "force", "depth", "quiet", "verbose", "progress", "recurse-submodules", "strategy", "commit", "no-commit", "edit", "no-edit", "log", "stat", "signoff", "allow-unrelated-histories", "dry-run"),
}
_LONGUES_COMMUNES: tuple[str, ...] = ("quiet", "verbose", "help", "version", "dry-run", "force", "no-verify")


def _branche_courante(cwd: str | None) -> str:
    try:
        resultat = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=cwd, capture_output=True, text=True, timeout=5, check=False,
        )
        return resultat.stdout.strip() if resultat.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def _alias(nom: str) -> str | None:
    """L'expansion d'un alias git (`git config --get alias.<nom>`), ou None. Lecture seule, bornee a 3 s."""
    try:
        resultat = subprocess.run(
            ["git", "config", "--get", f"alias.{nom}"],
            cwd=str(_lib.racine_projet()), capture_output=True, text=True, timeout=3, check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    valeur = resultat.stdout.strip()
    return valeur or None


def _est_personnelle(branche: str) -> bool:
    return branche.startswith(PREFIXE_PERSONNEL)


def _cle_execute(cle: str) -> bool:
    bas = cle.lower().split("=", 1)[0]
    return any(bas.startswith(prefixe) for prefixe in _programmes.GIT_CLES_QUI_EXECUTENT)


def _arguments_git(args: tuple[str, ...]) -> tuple[list[str], str | None]:
    """
    Les arguments apres les options globales de git, et le motif de refus si une option globale est
    elle-meme interdite (`-c core.hooksPath=...`, `-c alias.x=...` : un hook ou un alias injecte est de
    l'execution de code, meme regle que l'ecriture sous `.git/`).
    """
    liste = list(args)
    i = 0
    while i < len(liste) and liste[i].startswith("-"):
        if liste[i] in _OPTIONS_GLOBALES_AVEC_VALEUR:
            valeur = liste[i + 1] if i + 1 < len(liste) else ""
            if liste[i] in _OPTIONS_QUI_POSENT_UNE_CLE and _cle_execute(valeur):
                return [], f"`git {liste[i]} {valeur.split('=', 1)[0]}=...` interdit : cette cle de configuration execute du code"
            i += 2
        elif liste[i].startswith("--config-env="):
            # La forme collee de `--config-env` : elle pose la meme cle que `-c` (git 2.55 du poste).
            valeur = liste[i].split("=", 1)[1]
            if _cle_execute(valeur):
                return [], f"`git --config-env {valeur.split('=', 1)[0]}=...` interdit : cette cle de configuration execute du code"
            i += 1
        else:
            i += 1
    return liste[i:], None


def _normaliser_options(sous: str, options: list[str]) -> list[str]:
    """
    Les options telles que git les comprend : `-nm` devient `-n -m` (le premier caractere qui prend une
    valeur garde le reste), `--amen` devient `--amend` si le prefixe est non ambigu. Les positionnels et
    ce qui suit `--` restent tels quels.
    """
    connues = tuple(_LONGUES.get(sous, ())) + _LONGUES_COMMUNES
    resultat: list[str] = []
    fin_des_options = False
    for o in options:
        if fin_des_options or not o.startswith("-") or o == "-":
            resultat.append(o)
            if o == "--":
                fin_des_options = True
            continue
        if o.startswith("--"):
            nom, egal, valeur = o[2:].partition("=")
            if nom and nom not in connues:
                candidats = [c for c in connues if c.startswith(nom)]
                if len(set(candidats)) == 1:
                    nom = candidats[0]
            resultat.append("--" + nom + (egal + valeur if egal else ""))
            continue
        if len(o) > 2 and o[1:].isalpha():
            resultat.extend("-" + lettre for lettre in o[1:])
            continue
        if len(o) > 2 and o[1].isalpha() and not o[1:].isalpha():
            # `-m'x'` ou `-C5` : la premiere lettre est l'option, le reste sa valeur ; on garde les
            # lettres qui la precedent si elles forment un groupe (`-am"x"` : `-a`, `-m`, valeur).
            lettres = ""
            for ch in o[1:]:
                if ch.isalpha():
                    lettres += ch
                else:
                    break
            resultat.extend("-" + lettre for lettre in lettres)
            resultat.append(o[1 + len(lettres):])
            continue
        resultat.append(o)
    return resultat


def _destinations(args: list[str], branche_courante: str) -> list[str]:
    """Les branches que des refspecs de push ou de fetch mettent a jour."""
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
        ref = ref.lstrip("+")
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
        if tok in _OPTIONS_PUSH_INTERDITES or tok.startswith("--force-with-lease=") or tok.startswith("--force-if-includes="):
            return f"push avec `{tok}` interdit"
        if tok.startswith("+") and len(tok) > 1:
            return f"push avec la refspec forcee `{tok}` interdit"
    for destination in _destinations(args, branche_courante):
        if destination == "":
            return "suppression d'une branche distante interdite"
        if destination in BRANCHES_PARTAGEES:
            return f"push vers la branche partagee `{destination}` interdit"
        if not _est_personnelle(destination):
            return f"push vers `{destination or '(branche inconnue)'}` interdit : seules les branches {PREFIXE_PERSONNEL}* sont autorisees"
    return None


def _verifier_fetch(args: list[str]) -> str | None:
    for tok in args:
        if tok.startswith("+") and ":" in tok:
            return f"fetch avec la refspec forcee `{tok}` interdit : elle reecrit une branche locale"
        if ":" in tok and not tok.startswith("-"):
            cible = tok.split(":", 1)[1].removeprefix("refs/heads/")
            if cible in BRANCHES_PARTAGEES:
                return f"fetch qui met a jour la branche partagee `{cible}` interdit"
    return None


def _verifier(args: list[str], branche_courante: str, agent: bool = False, alias_resolus: int = 0) -> str | None:
    if not args:
        return None
    sous = args[0]
    options = _normaliser_options(sous, args[1:])
    positionnels = [o for o in options if not o.startswith("-")]
    partagee = branche_courante in BRANCHES_PARTAGEES
    # Un sous agent ne commite ni ne pousse, sur aucune branche. Melvyn le fait depuis le fil
    # principal, apres sa relecture dans VS Code : c'est la regle de `rules/git.md`, qui n'etait
    # tenue par aucun verrou sur les branches personnelles avant le 16/09/2026.
    if agent and sous in {"commit", "push"}:
        return f"`git {sous}` par un sous agent interdit : seul le fil principal committe et pousse, sur demande de Melvyn"
    if sous in _SOUS_COMMANDES_INTERDITES:
        return f"`git {sous}` interdit"
    if sous in _ECRIVENT_L_HISTORIQUE and partagee:
        return f"`git {sous}` sur la branche partagee `{branche_courante}` interdit"
    if sous == "push":
        return _verifier_push(options, branche_courante)
    if sous == "send-pack" and any(o in {"--force", "-f"} for o in options):
        return "`git send-pack --force` interdit : c'est un push force en plomberie"
    if sous == "fetch":
        return _verifier_fetch(options)
    if sous == "reset" and any(o in {"--hard", "--merge"} for o in options):
        return "`git reset --hard` (ou --merge) interdit : perte de travail non commite"
    if sous == "read-tree" and "--reset" in options:
        return "`git read-tree --reset` interdit : c'est un reset --hard en plomberie"
    if sous == "checkout-index" and any(o in {"-f", "--force", "-a", "--all"} for o in options):
        return "`git checkout-index` force ou global interdit : il ecrase l'arbre de travail"
    if sous == "branch":
        if any(o in {"-D", "-M", "-f", "--force"} for o in options):
            return "suppression, renommage ou deplacement force de branche interdit"
        if any(o in {"-d", "--delete", "-m", "--move", "-c", "--copy"} for o in options):
            if any(not _est_personnelle(c) for c in positionnels):
                return "seules les branches features/melvyn/* peuvent etre supprimees, renommees ou copiees"
    if sous == "switch" and any(o in {"--discard-changes", "-f", "--force", "-C", "--force-create"} for o in options):
        return "`git switch` qui ecrase des fichiers de travail ou une branche interdit"
    if sous == "checkout":
        if any(o in {".", "./", "--", "-B", "--force", "-f", "--ours", "--theirs"} for o in options) or "*" in options:
            return "`git checkout` qui ecrase des fichiers de travail interdit (utiliser switch pour changer de branche)"
        if not any(o in {"-b", "-B", "--orphan"} for o in options) and any(_est_un_chemin_existant(c) for c in positionnels):
            return "`git checkout <fichier ou dossier>` ecrase le travail non commite : interdit"
    if sous == "restore" and ("--staged" not in options and "-S" not in options or "--worktree" in options or "-W" in options):
        return "`git restore` sur l'arbre de travail interdit (seul `--staged` est autorise)"
    if sous == "stash":
        if positionnels[:1] in (["drop"], ["clear"]):
            return f"`git stash {positionnels[0]}` interdit : le stash protege du travail en attente"
        if any(o in {"-u", "--include-untracked", "-a", "--all"} for o in options):
            return "`git stash` des fichiers non suivis interdit : il emporterait `.env` hors de l'arbre"
    if sous == "reflog" and positionnels[:1] in (["delete"], ["expire"]):
        return f"`git reflog {positionnels[0]}` interdit"
    if sous == "worktree" and positionnels[:1] == ["remove"] and any(o in {"-f", "--force"} for o in options):
        return "`git worktree remove --force` interdit : il supprime un arbre avec son travail"
    if sous == "commit":
        if "--amend" in options:
            return "`git commit --amend` interdit : preferer un nouveau commit"
        if "--no-verify" in options or "-n" in options:
            return "`--no-verify` interdit : les hooks ne se contournent pas"
    if sous == "merge" and "--no-verify" in options:
        return "`git merge --no-verify` interdit : les hooks ne se contournent pas"
    if sous == "rebase":
        if "-i" in options or "--interactive" in options:
            return "rebase interactif interdit"
        if "--no-verify" in options:
            return "`git rebase --no-verify` interdit"
        if len(positionnels) >= 2 and positionnels[1] in BRANCHES_PARTAGEES:
            return f"rebase de la branche partagee `{positionnels[1]}` interdit"
    if sous == "config":
        return _verifier_config(options, positionnels)
    if sous == "tag" and any(o in {"-d", "--delete"} for o in options):
        return "suppression de tag interdite"
    if sous == "update-ref" and any(o in {"-d", "--delete"} for o in options):
        return "`git update-ref -d` interdit"
    if sous == "symbolic-ref" and len(positionnels) >= 2 and positionnels[0] == "HEAD":
        return "`git symbolic-ref HEAD` interdit : deplacer HEAD sans checkout perd le travail"
    if sous not in _SOUS_COMMANDES_CONNUES and alias_resolus < 2:
        expansion = _alias(sous)
        if expansion:
            if expansion.startswith("!"):
                return f"alias `{sous}` qui lance un shell (`{expansion[:30]}`) : non analysable, interdit"
            return _verifier(expansion.split() + args[1:], branche_courante, agent, alias_resolus + 1)
    return None


_CONFIG_OPTIONS_LECTURE: frozenset[str] = frozenset({
    "--get", "--get-all", "--get-regexp", "--get-urlmatch", "--list", "-l", "--get-color", "--get-colorbool", "--show-origin", "--show-scope",
})
_CONFIG_OPTIONS_ECRITURE: frozenset[str] = frozenset({
    "--unset", "--unset-all", "--add", "--replace-all", "--edit", "-e", "--rename-section", "--remove-section",
})


def _verifier_config(options: list[str], positionnels: list[str]) -> str | None:
    """
    `git config` lit avec `--get`, `--list`, ou avec une seule cle ; il ecrit avec deux positionnels ou une
    option d'ecriture. Lecture : toujours autorisee. Ecriture : refusee hors du depot (`--global`,
    `--system`) et sur toute cle qui execute du code (`core.hooksPath`, `alias.*`).
    """
    ecrit = any(o in _CONFIG_OPTIONS_ECRITURE for o in options) or (len(positionnels) >= 2 and not any(o in _CONFIG_OPTIONS_LECTURE for o in options))
    if not ecrit:
        return None
    if any(o in {"--global", "--system"} for o in options):
        return "`git config` global ou systeme interdit en ecriture (lecture possible avec --get, --list ou une seule cle)"
    if any(_cle_execute(c) for c in positionnels[:1]):
        return f"`git config {positionnels[0]}` interdit en ecriture : cette cle execute du code"
    return None


_SOUS_COMMANDES_CONNUES: frozenset[str] = frozenset({
    "add", "am", "apply", "archive", "bisect", "blame", "branch", "bundle", "cat-file", "check-attr", "check-ignore", "checkout",
    "checkout-index", "cherry", "cherry-pick", "clean", "clone", "commit", "config", "count-objects", "describe", "diff",
    "diff-index", "diff-tree", "difftool", "fetch", "filter-branch", "filter-repo", "for-each-ref", "format-patch", "fsck", "gc",
    "grep", "help", "init", "lfs", "log", "ls-files", "ls-remote", "ls-tree", "maintenance", "merge", "merge-base", "mergetool",
    "mv", "name-rev", "notes", "pull", "push", "read-tree", "rebase", "reflog", "remote", "repack", "replace", "rerere", "reset",
    "restore", "rev-list", "rev-parse", "revert", "rm", "send-pack", "shortlog", "show", "show-ref", "sparse-checkout", "stash",
    "status", "submodule", "switch", "symbolic-ref", "tag", "update-index", "update-ref", "var", "version", "--version",
    "whatchanged", "worktree", "write-tree",
})


def _est_un_chemin_existant(candidat: str) -> bool:
    if candidat in BRANCHES_PARTAGEES or _est_personnelle(candidat) or candidat == "HEAD" or candidat.startswith(("origin/", "refs/")):
        return False
    try:
        return Path(candidat).exists()
    except OSError:
        return False


_MOTIF_ENV_PS = re.compile(r"\$env:(GIT_[A-Za-z0-9_]+)\s*=", re.IGNORECASE)


def _variable_qui_execute(affectations: tuple[str, ...]) -> str | None:
    """La premiere affectation `GIT_*=` devant git qui change sa configuration ou sa cible, ou None."""
    for a in affectations:
        nom = a.split("=", 1)[0].upper()
        if nom.startswith(_programmes.GIT_VARIABLES_QUI_EXECUTENT):
            return nom
    return None


_OPTIONS_A_VALEUR_LIBRE: frozenset[str] = frozenset({"-m", "--message", "-F", "--file", "--author", "--date", "--trailer", "-c", "-C", "--reuse-message", "--reedit-message", "--fixup", "--squash", "--description"})


def _argument_construit(args: tuple[str, ...]) -> bool:
    """
    Vrai si la sous-commande, une option ou un positionnel de git n'est connu qu'a l'execution.

    La valeur d'un message (`-m "$(cat <<'EOF' ... EOF)"`) reste libre : elle ne change pas ce que git
    fait. La sous-commande (`git $(echo push)`), une option (`--for$(echo ce)`) ou une refspec construite
    changent tout : refus.
    """
    precedent = ""
    for a in args:
        if _commande.MARQUE_INCONNU in a and not (precedent in _OPTIONS_A_VALEUR_LIBRE or precedent.startswith("--message=")):
            if not (precedent.startswith(("-m", "--message")) and not a.startswith("-")):
                return True
        precedent = a
    return False


def _refus(motif: str) -> str:
    return (
        f"REFUS garde_git : {motif}.\n"
        "Regle .claude/rules/git.md : commits et push uniquement sur demande explicite de Melvyn, "
        "sur ses branches features/melvyn/*, jamais d'operation destructrice."
    )


def decision(commande: str, branche_courante: str, agent: bool = False, outil: str = "Bash") -> str | None:
    """
    None si la commande est autorisee, sinon le message de refus.

    `agent` vaut vrai quand l'appel vient d'un sous agent. `outil` dit a l'analyseur s'il lit du
    PowerShell. Les defauts gardent le comportement de tous les appels existants, y compris les tests.
    """
    analyse = _commande.analyser(commande, outil)
    if outil == "PowerShell" and any(inv.programme == "git" for inv in analyse.invocations):
        m = _MOTIF_ENV_PS.search(commande)
        if m and m.group(1).upper().startswith(_programmes.GIT_VARIABLES_QUI_EXECUTENT):
            return _refus(f"`$env:{m.group(1)} = ...` avant git interdit : cette variable change la configuration ou la cible de git")
    # Ce qu'on ne sait pas analyser se refuse : le contrat du hook est que `exit 0` autorise, donc une
    # limite non dite deviendrait le mode d'emploi du contournement (sonde du 17/09/2026).
    if analyse.opaque:
        return (
            f"REFUS garde_git : {analyse.opaque}.\n"
            "Regle .claude/rules/git.md : une commande git doit etre lisible pour etre autorisee. "
            "Reformuler sans imbrication, sans encodage, sans eval."
        )
    for invocation in analyse.invocations:
        if invocation.programme != "git":
            continue
        if invocation.amont or _argument_construit(invocation.args):
            return _refus("arguments de git construits a l'execution ou venus d'un tube : non analysables")
        variable = _variable_qui_execute(invocation.affectations)
        if variable:
            return _refus(f"`{variable}=... git` interdit : cette variable change la configuration ou la cible de git, comme `-c` ou `-C`")
        args, motif_global = _arguments_git(invocation.args)
        if motif_global:
            return _refus(motif_global)
        motif = _verifier(args, branche_courante, agent)
        if motif:
            return _refus(motif)
    return None


def decision_depuis_entree(entree: dict) -> str | None:
    """
    Decision a partir de l'entree brute du hook. None autorise, un message refuse.

    C'est la couche que `main()` emprunte : la tester, c'est tester le chemin reel, y compris la
    reconnaissance du sous agent, qu'un test sur `decision()` seule ne verrait pas. Aucun prefiltre
    textuel : `g''it` ne contient pas « git » et lance pourtant git (verification du 17/09/2026).
    """
    outil = entree.get("tool_name")
    if outil not in {"Bash", "PowerShell"}:
        return None
    commande = (entree.get("tool_input") or {}).get("command", "")
    if not isinstance(commande, str) or not commande.strip():
        return None
    # La branche courante coute un lancement de git (environ 90 ms, mesure du 18/09/2026). On ne la
    # lit que si l'analyse trouve git : aucun prefiltre textuel, l'analyse est faite en entier, et
    # une commande sans git ne paie plus le sous-processus.
    analyse = _commande.analyser(commande, str(outil))
    if not analyse.opaque and not any(inv.programme == "git" for inv in analyse.invocations):
        return None
    branche = _branche_courante(entree.get("cwd") or str(_lib.racine_projet()))
    return decision(commande, branche, agent=bool(entree.get("agent_id")), outil=str(outil))


def main() -> None:
    entree = _lib.lire_entree()
    _lib.executer(lambda: decision_depuis_entree(entree), "garde_git")


if __name__ == "__main__":
    main()
