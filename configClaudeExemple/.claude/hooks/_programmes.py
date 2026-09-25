"""
La table des programmes : ce que chaque commande fait de ses arguments. Un fichier de donnees, rien
d'autre : aucune fonction, un seul import. `_commande` y lit les enveloppes, les shells, les interpretes,
`xargs` et `find` ; `_effets` y lit les familles d'ecriture et de lecture. Le savoir sur les programmes
vit ici et nulle part ailleurs : c'est la reponse a la dette des deux tables divergentes
(`revue-lot-2b1.md`, finding 3).

Source du motif : `C:\\dev\\maos`, `origin/main:packages/core/src/risk-classifier.ts` (une table en
lecture seule, source unique, pas de litteraux disperses), lu le 17/09/2026. Rien n'en est recopie.

Familles, et le sens des deux champs pour chacune :

- ENVELOPPE : lance le programme qui suit (`env`, `timeout 5`, `nice -n 5`, `uv run`, `winpty`).
  `declencheurs` : les mots a sauter apres l'enveloppe avant de trouver le programme (`run`), ou `*`
  pour « un positionnel » (`flock <verrou> cmd`). `cibles` : ses options qui prennent une valeur.
- SHELL : porte une commande dans une option. `declencheurs` : les options qui portent la commande.
- INTERPRETE : porte du code dans une option, ou dans un fichier, ou sur son entree standard.
  `declencheurs` : les options qui portent le code.
- LANCEUR_PS : `Start-Process` et ses alias, dont la commande est le premier positionnel et les
  arguments la valeur de `-ArgumentList`.
- XARGS : lance le programme qui suit avec les cibles venues du tube. `cibles` : ses options a valeur.
- FIND : cherche ; `-delete`, `-exec` et `-fprint` font agir.
- GIT : sous-commandes jugees par `garde_git` ; `rm`, `mv`, `clean`, `clone`, `init`, `worktree add`
  ecrivent leurs cibles, et tout ce qui n'est pas en lecture seule ecrit dans le depot de `-C`.
- TOUT : ecrit ou detruit toutes ses cibles positionnelles. `cibles` : options dont la valeur est aussi
  une cible (`-Path`, `-FilePath`).
- PREMIER : ecrit sa premiere cible positionnelle seulement (le second argument est un contenu).
- DESTINATION : copie ; seule la derniere cible (ou la valeur de `cibles`) est ecrite, les autres sont
  lues.
- DEPLACE : deplace ; source et destination sont ecrites (la source disparait).
- DEUXIEME : ecrit son deuxieme mot ; les suivants sont une liste de fichiers lus (`robocopy`).
- SI_OPTION : ecrit ses cibles seulement si une option de `declencheurs` est presente (`sed -i`),
  sinon les lit. `cibles` : options dont la valeur est une cible.
- SAUF_OPTION : ecrit ses cibles sauf si une option de `declencheurs` est presente (`gzip` remplace
  son fichier source, `gzip -c` le laisse intact). La symetrique de SI_OPTION.
- TAR : la grammaire de `tar` (mode dans le premier groupe de lettres, archive apres `f`, `-C`).
- OPTION_CIBLE : n'ecrit que la valeur de ses options `cibles` (`curl -o`, `dd of=`, `pip --target`).
- LIT : lit ses cibles positionnelles.
- META : ne lit que des noms, des tailles, des dates (`ls`, `stat`), ou n'a pas de cible fichier
  (`echo`, `ruff`).
"""
from typing import NamedTuple


class Regle(NamedTuple):
    famille: str
    declencheurs: tuple[str, ...] = ()
    cibles: tuple[str, ...] = ()


_ENVELOPPE = Regle("ENVELOPPE")
_SHELL_POSIX = Regle("SHELL", ("-c", "-lc", "-ic", "-lic", "-xc", "-ec", "--command"))
_SHELL_PWSH = Regle("SHELL", ("-command", "-c", "-file", "-f"))
_TOUT = Regle("TOUT")
_TOUT_PWSH = Regle("TOUT", cibles=("-path", "-literalpath", "-filepath", "-destination", "-newname"))
_PREMIER = Regle("PREMIER")
_LIT = Regle("LIT")
_META = Regle("META")
_PAQUETS = Regle("OPTION_CIBLE", cibles=("-d", "--dest", "--target", "-t", "--prefix", "--root", "--cache-dir", "--global-folder"))
_COMPRESSE = Regle("SAUF_OPTION", ("-c", "--stdout", "--to-stdout", "-l", "--list", "-t", "--test"))

PROGRAMMES: dict[str, Regle] = {
    # Enveloppes : ce qui lance autre chose. `git` n'en est plus une (il a sa famille).
    "sudo": _ENVELOPPE, "time": _ENVELOPPE, "exec": _ENVELOPPE, "nohup": _ENVELOPPE, "env": _ENVELOPPE,
    "timeout": _ENVELOPPE, "nice": _ENVELOPPE, "stdbuf": _ENVELOPPE, "command": _ENVELOPPE, "winpty": _ENVELOPPE,
    "start": _ENVELOPPE, "busybox": _ENVELOPPE, "npx": _ENVELOPPE, "doskey": _ENVELOPPE, "setsid": _ENVELOPPE,
    "watch": _ENVELOPPE, "strace": _ENVELOPPE, "ltrace": _ENVELOPPE, "ionice": _ENVELOPPE, "chronic": _ENVELOPPE,
    "caffeinate": _ENVELOPPE, "unbuffer": _ENVELOPPE, "builtin": _ENVELOPPE, "nocorrect": _ENVELOPPE,
    "flock": Regle("ENVELOPPE", ("*",)), "chroot": Regle("ENVELOPPE", ("*",)),
    "parallel": _ENVELOPPE, "entr": _ENVELOPPE, "hyperfine": _ENVELOPPE, "perf": _ENVELOPPE,
    "uv": Regle("ENVELOPPE", ("run",)), "poetry": Regle("ENVELOPPE", ("run",)), "pipx": Regle("ENVELOPPE", ("run",)),
    "xargs": Regle("XARGS", cibles=("-n", "-i", "-l", "-p", "-d", "-a", "-s", "-e", "--max-args", "--max-procs", "--delimiter", "--arg-file", "--replace")),
    # Shells : leur commande arrive dans une option.
    "bash": _SHELL_POSIX, "sh": _SHELL_POSIX, "zsh": _SHELL_POSIX, "ksh": _SHELL_POSIX, "dash": _SHELL_POSIX, "fish": _SHELL_POSIX,
    "script": Regle("SHELL", ("-c", "-qc", "-ec", "-qec", "-fc", "-qfc", "--command")),
    "cmd": Regle("SHELL", ("/c", "/k")),
    "pwsh": _SHELL_PWSH, "powershell": _SHELL_PWSH,
    # Interpretes : leur code arrive dans une option, un fichier, ou l'entree standard.
    "python": Regle("INTERPRETE", ("-c",)), "python3": Regle("INTERPRETE", ("-c",)), "py": Regle("INTERPRETE", ("-c",)),
    # Les modules de la bibliotheque standard qui ecrivent, atteints par `python -m <module>`.
    "venv": Regle("TOUT"),
    # Sous `-c` la premiere cible est l'archive creee, sous `-e` la seconde est le dossier de sortie :
    # les deux positions ecrivent, donc les deux sont jugees. Sans option, ces modules listent.
    "zipfile": Regle("SI_OPTION", ("-c", "--create", "-e", "--extract")),
    "tarfile": Regle("SI_OPTION", ("-c", "--create", "-e", "--extract")),
    "json.tool": Regle("DESTINATION"), "ensurepip": Regle("META"), "http.server": Regle("META"),
    "node": Regle("INTERPRETE", ("-e", "--eval", "-p", "--print")),
    "perl": Regle("INTERPRETE", ("-e", "-E")), "ruby": Regle("INTERPRETE", ("-e",)),
    "duckdb": Regle("INTERPRETE", ("-c", "-s", "-cmd")),
    # Lanceurs PowerShell.
    "start-process": Regle("LANCEUR_PS", cibles=("-argumentlist", "-args", "-filepath")),
    "saps": Regle("LANCEUR_PS", cibles=("-argumentlist", "-args", "-filepath")),
    # Ceux qui ont leur propre grammaire.
    "find": Regle("FIND"), "git": Regle("GIT"), "tar": Regle("TAR"),
    # Ecrire ou detruire toutes les cibles.
    "rm": _TOUT, "rmdir": _TOUT, "mkdir": _TOUT, "touch": _TOUT, "tee": _TOUT, "truncate": _TOUT, "unlink": _TOUT,
    "shred": _TOUT, "patch": _TOUT, "chmod": _TOUT, "chown": _TOUT, "fsutil": _TOUT,
    "del": _TOUT, "erase": _TOUT, "rd": _TOUT, "md": _TOUT, "dos2unix": _TOUT, "unix2dos": _TOUT,
    "remove-item": _TOUT_PWSH, "ri": _TOUT_PWSH, "new-item": _TOUT_PWSH, "ni": _TOUT_PWSH,
    "set-content": _TOUT_PWSH, "sc": _TOUT_PWSH, "add-content": _TOUT_PWSH, "ac": _TOUT_PWSH,
    "out-file": _TOUT_PWSH, "clear-content": _TOUT_PWSH, "clc": _TOUT_PWSH, "tee-object": _TOUT_PWSH,
    "rename-item": _TOUT_PWSH, "ren": _TOUT_PWSH, "rni": _TOUT_PWSH, "set-itemproperty": _TOUT_PWSH, "sp": _TOUT_PWSH,
    "export-csv": _TOUT_PWSH, "export-clixml": _TOUT_PWSH, "clear-item": _TOUT_PWSH, "remove-itemproperty": _TOUT_PWSH,
    # Appels .NET, ecrits sans parentheses : l'analyse en mode PowerShell les rend en `::methode` ou `.methode`.
    "::delete": _TOUT, ".delete": _TOUT, "::writealltext": _PREMIER, "::writealllines": _PREMIER,
    "::writeallbytes": _PREMIER, "::appendalltext": _PREMIER, "::appendalllines": _PREMIER,
    "::create": _PREMIER, "::createtext": _PREMIER, "::openwrite": _PREMIER, "::open": _PREMIER,
    "::createdirectory": _PREMIER, "::setattributes": _PREMIER, "::encrypt": _PREMIER, "::decrypt": _PREMIER,
    "::move": Regle("DEPLACE"), ".moveto": Regle("DEPLACE"), "::replace": Regle("DEPLACE"),
    "::copy": Regle("DESTINATION"), ".copyto": Regle("DESTINATION"),
    "::readalltext": _LIT, "::readalllines": _LIT, "::readallbytes": _LIT, "::readlines": _LIT, "::openread": _LIT,
    "::exists": _META,
    # Copier : la destination est ecrite, la source est lue.
    "cp": Regle("DESTINATION", cibles=("-t", "--target-directory")), "install": Regle("DESTINATION", cibles=("-t", "--target-directory")),
    "ln": Regle("DESTINATION"), "rsync": Regle("DESTINATION"), "scp": Regle("DESTINATION"),
    # robocopy et xcopy ecrivent leur deuxieme mot ; ce qui suit est une liste de fichiers.
    "robocopy": Regle("DEUXIEME"), "xcopy": Regle("DEUXIEME"), "certutil": Regle("DESTINATION"),
    "split": Regle("DESTINATION"), "csplit": Regle("OPTION_CIBLE", cibles=("-f", "--prefix", "-b", "--suffix-format")),
    "copy-item": Regle("DESTINATION", cibles=("-destination",)), "cpi": Regle("DESTINATION", cibles=("-destination",)),
    "copy": Regle("DESTINATION"),
    # Deplacer : les deux bouts sont ecrits.
    "mv": Regle("DEPLACE"), "move": Regle("DEPLACE"),
    "move-item": Regle("DEPLACE", cibles=("-path", "-literalpath", "-destination")), "mi": Regle("DEPLACE", cibles=("-path", "-literalpath", "-destination")),
    # Le premier positionnel est ecrit (archive creee, lien cree).
    "zip": _PREMIER, "mklink": _PREMIER,
    # Ecrire seulement sous une option.
    "sed": Regle("SI_OPTION", ("-i", "--in-place")), "awk": Regle("SI_OPTION", ("-i",)), "gawk": Regle("SI_OPTION", ("-i",)),
    # Ecrire la seule valeur d'une option.
    "unzip": Regle("OPTION_CIBLE", cibles=("-d",)), "7z": Regle("OPTION_CIBLE", cibles=("-o",)), "forfiles": Regle("OPTION_CIBLE", cibles=("/p",)),
    "curl": Regle("OPTION_CIBLE", cibles=("-o", "--output", "--output-dir")),
    "wget": Regle("OPTION_CIBLE", cibles=("-O", "--output-document", "-P", "--directory-prefix", "-outfile")),
    "dd": Regle("OPTION_CIBLE", ("if=",), ("of=",)),
    # Lecteurs qui ecrivent par une option : positionnels lus, `declencheurs` lus, `cibles` ecrites.
    "sort": Regle("LIT_OPTION_CIBLE", cibles=("-o", "--output")), "shuf": Regle("LIT_OPTION_CIBLE", cibles=("-o", "--output")),
    "openssl": Regle("LIT_OPTION_CIBLE", ("-in",), ("-out",)), "gpg": Regle("LIT_OPTION_CIBLE", cibles=("-o", "--output")),
    "invoke-webrequest": Regle("OPTION_CIBLE", cibles=("-outfile",)), "iwr": Regle("OPTION_CIBLE", cibles=("-outfile",)),
    "invoke-restmethod": Regle("OPTION_CIBLE", cibles=("-outfile",)), "irm": Regle("OPTION_CIBLE", cibles=("-outfile",)),
    "compress-archive": Regle("OPTION_CIBLE", cibles=("-destinationpath",)), "expand-archive": Regle("OPTION_CIBLE", cibles=("-destinationpath",)),
    "start-bitstransfer": Regle("OPTION_CIBLE", cibles=("-destination",)),
    "pip": _PAQUETS, "pip3": _PAQUETS, "npm": _PAQUETS, "pnpm": _PAQUETS, "yarn": _PAQUETS,
    # Compression : la source est remplacee, sauf sortie sur le tube (-c), inventaire (-l) ou test (-t).
    "gzip": _COMPRESSE, "gunzip": _COMPRESSE, "bzip2": _COMPRESSE, "bunzip2": _COMPRESSE,
    "xz": _COMPRESSE, "unxz": _COMPRESSE, "lzma": _COMPRESSE, "compress": _COMPRESSE,
    # zstd garde sa source, mais il cree `<nom>.zst` a cote : c'est un nom de plus, dans la zone
    # protegee quand la source y est. Il est donc traite comme les autres compresseurs.
    "zstd": _COMPRESSE, "unzstd": _COMPRESSE,
    # Lire le contenu.
    "cat": _LIT, "head": _LIT, "tail": _LIT, "less": _LIT, "more": _LIT, "grep": _LIT, "rg": _LIT, "egrep": _LIT, "fgrep": _LIT,
    "cut": _LIT, "uniq": _LIT, "diff": _LIT, "cmp": _LIT, "strings": _LIT, "xxd": _LIT, "od": _LIT, "jq": _LIT,
    "sha256sum": _LIT, "md5sum": _LIT, "sqlite3": _LIT, "source": _LIT, ".": _LIT, "iconv": _LIT, "base64": _LIT,
    "get-content": _LIT, "gc": _LIT, "type": _LIT, "import-csv": _LIT, "select-string": _LIT, "sls": _LIT, "import-excel": _LIT,
    "get-filehash": _LIT, "invoke-item": _LIT, "import-clixml": _LIT, "convertfrom-json": _LIT,
    # Metadonnees seulement, ou pas de cible fichier.
    "ls": _META, "dir": _META, "du": _META, "stat": _META, "file": _META, "tree": _META, "wc": _META, "test": _META,
    "[": _META, "[[": _META,
    "realpath": _META, "basename": _META, "dirname": _META, "cd": _META, "pushd": _META, "popd": _META, "pwd": _META,
    "echo": _META, "printf": _META, "true": _META, "false": _META, "which": _META, "where": _META, "whoami": _META,
    "sleep": _META, "date": _META, "export": _META, "set": _META, "unset": _META, "alias": _META, "exit": _META, "return": _META,
    "get-childitem": _META, "gci": _META, "get-item": _META, "gi": _META, "test-path": _META, "measure-object": _META,
    "measure": _META, "get-itemproperty": _META, "gp": _META, "sort-object": _META, "select-object": _META, "where-object": _META,
    "format-table": _META, "format-list": _META, "ft": _META, "fl": _META, "write-output": _META, "write-host": _META,
    "get-location": _META, "set-location": _META, "sl": _META, "push-location": _META, "pop-location": _META,
    "resolve-path": _META, "split-path": _META, "join-path": _META, "out-string": _META, "out-null": _META,
    "foreach-object": _META, "%": _META, "start-job": _META, "invoke-command": _META, "icm": _META, "sajb": _META,
    # Gestionnaires et outils du poste sans cible fichier.
    "ruff": _META, "pyright": _META, "graphify": _META, "coverage": _META, "pytest": _META, "black": _META, "mypy": _META, "code": _META,
}

# Mots du shell transparents en position de programme (`if true; then git ...`, `do rm ...`). Un
# en-tete de boucle (`for x in ...`, `case x in`) n'est pas une commande : la phrase entiere est sautee.
MOTS_CLES_TRANSPARENTS: frozenset[str] = frozenset({"if", "then", "else", "elif", "fi", "do", "done", "while", "until", "!", "esac", "time", "coproc"})
MOTS_CLES_EN_TETE: frozenset[str] = frozenset({"for", "case", "select", "function"})
# Programmes qui changent le repertoire courant pour ce qui suit.
CHANGENT_DE_REPERTOIRE: frozenset[str] = frozenset({"cd", "pushd", "chdir", "set-location", "sl", "push-location"})
REVIENNENT_AU_REPERTOIRE: frozenset[str] = frozenset({"popd", "pop-location"})
# `env -C <dir>` et `env -S <commande>` : l'enveloppe qui change de dossier, celle qui porte une commande.
OPTIONS_ENV_REPERTOIRE: frozenset[str] = frozenset({"-c", "--chdir"})
OPTIONS_ENV_COMMANDE: frozenset[str] = frozenset({"-s", "--split-string"})

# Formes d'appel .NET, dans le texte d'une commande PowerShell : `[IO.File]::Delete('x')`,
# `(Get-Item x).Delete()`, `New-Object IO.StreamWriter('x')`.
MOTIF_DOTNET_STATIQUE = r"\[[A-Za-z0-9_.]+\]::([A-Za-z]+)\s*\(([^()]*)\)"
MOTIF_DOTNET_INSTANCE = r"\(([^()]*)\)\s*\.([A-Za-z]+)\s*\(([^()]*)\)"
MOTIF_DOTNET_NEW_OBJECT = r"New-Object\s+(?:-TypeName\s+)?([A-Za-z0-9_.]+)\s*\(([^()]*)\)"
TYPES_DOTNET_QUI_ECRIVENT: tuple[str, ...] = ("streamwriter", "filestream", "binarywriter", "fileinfo", "directoryinfo")

# Un script inline ecrit si son texte porte un de ces indices ou un mode d'ouverture en ecriture
# (`open(x, 'w')`, `'a+'`, `'r+'`, `mode='w'`, regex dans `_effets`) ; sinon il lit.
INDICES_ECRITURE_SCRIPT: tuple[str, ...] = (
    ".write(", ".writelines(", "write_text", "write_bytes", "to_csv", "to_excel", "to_parquet", "write_csv", "write_parquet",
    "write_excel", "os.remove", "os.unlink", "os.rename", "os.replace", "os.rmdir", "os.makedirs", "os.mkdir", "os.truncate",
    ".truncate(", ".rename(", ".rmdir(", ".unlink(", "shutil.", "rmtree", "mkdir(", "touch(",
    "writefilesync", "writefile(", "appendfilesync", "unlinksync", "rmsync", "renamesync", "mkdirsync",
    "set-content", "out-file", "add-content", "remove-item",
)
MOTIF_MODE_ECRITURE = r"""open\s*\([^)]*?['"](?:mode\s*=\s*['"])?[waxWAX][tb+]*['"]|mode\s*=\s*['"][waxWAX]|['"]r\+[tb]?['"]"""
# Un script inline qui relance un shell ou un programme : les litteraux de l'appel forment une commande.
INDICES_COMMANDE_SCRIPT: tuple[str, ...] = (
    "system(", "popen(", "subprocess", "check_call(", "check_output(", "spawn", "exec(", "execsync(", "execfile", "child_process",
    "startfile(", "runtime.exec", "shell_exec", "passthru(", "proc_open(",
)
MOTIF_APPEL_SCRIPT = r"(?:system|run|call|check_call|check_output|popen|Popen|spawn|spawnSync|exec|execSync|execFile|execFileSync|startfile|shell_exec|passthru)\s*\(((?:[^()]|\([^()]*\))*)\)"
# Scripts du depot lances par un interpreteur : ils ecrivent leurs cibles sous une option, sinon ils lisent.
SCRIPTS_DU_DEPOT_QUI_ECRIVENT: dict[str, tuple[str, ...]] = {"nettoyer_caracteres.py": ("--appliquer",)}
# Interpretes qui editent en place sous `-i` (`perl -pi -e`, `ruby -i`).
PYTHONS: frozenset[str] = frozenset({"python", "python3", "py"})
PYTHON_OPTIONS_AVEC_VALEUR: frozenset[str] = frozenset({"-W", "-X", "-Q", "--check-hash-based-pycs"})

INTERPRETES_EDITION_EN_PLACE: frozenset[str] = frozenset({"perl", "ruby"})

# Options qui font agir `find`.
FIND_ACTIONS_QUI_ECRIVENT: frozenset[str] = frozenset({"-delete"})
FIND_OPTIONS_QUI_ECRIVENT_VALEUR: frozenset[str] = frozenset({"-fprint", "-fprint0", "-fls", "-fprintf"})
FIND_OPTIONS_QUI_LANCENT: frozenset[str] = frozenset({"-exec", "-execdir", "-ok", "-okdir"})
# Les options globales de find, qui precedent ses points de depart. `-O<n>` porte son niveau colle.
# Sans option de sortie, ces verbes ecrivent dans le dossier courant.
ECRIVENT_DANS_LE_DOSSIER_COURANT: frozenset[str] = frozenset({
    "unzip", "7z", "7za", "wget", "csplit", "expand-archive",
})

# Ecrivent dans le dossier courant sous une option qui ne nomme pas le fichier.
ECRIVENT_LE_DOSSIER_COURANT_SOUS_OPTION: dict[str, tuple[str, ...]] = {
    "curl": ("-O", "--remote-name"),
}

# Les options longues de tar qui creent ou extraient.
TAR_OPTIONS_LONGUES_QUI_ECRIVENT: frozenset[str] = frozenset({
    "--create", "--extract", "--get", "--append", "--update", "--delete", "--concatenate",
})

# Les cmdlets PowerShell qui recoivent un contenu par le tube : leur amont est lu, pas ecrit.
# Les options PowerShell dont la valeur n'est pas un chemin : elles ne comptent pas comme cible.
PWSH_OPTIONS_SANS_CHEMIN: frozenset[str] = frozenset({
    "-value", "-encoding", "-filter", "-include", "-exclude", "-delimiter", "-newline",
})

# Les drapeaux PowerShell : ils ne prennent pas de valeur, donc ils n'avalent pas la cible qui suit.
PWSH_DRAPEAUX: frozenset[str] = frozenset({
    "-force", "-recurse", "-confirm", "-whatif", "-append", "-nonewline", "-passthru", "-quiet",
})

PWSH_RECOIT_UN_CONTENU: frozenset[str] = frozenset({
    "set-content", "add-content", "out-file", "export-csv", "export-clixml", "tee-object",
})

FIND_OPTIONS_GLOBALES: frozenset[str] = frozenset({"-H", "-L", "-P", "-D", "-O0", "-O1", "-O2", "-O3"})
FIND_OPTIONS_GLOBALES_AVEC_VALEUR: frozenset[str] = frozenset({"-D"})

FIND_OPTIONS_MOTIF: frozenset[str] = frozenset({"-name", "-iname", "-path", "-ipath", "-wholename", "-iwholename", "-regex", "-iregex"})

# git : ce qui ecrit dans l'arbre, ce qui ne fait que lire, les cles de configuration qui executent du code.
GIT_SOUS_COMMANDES_QUI_ECRIVENT: frozenset[str] = frozenset({"rm", "mv", "clean"})
GIT_SOUS_COMMANDES_LECTURE_SEULE: frozenset[str] = frozenset({
    "log", "show", "status", "diff", "fetch", "ls-files", "ls-tree", "ls-remote", "rev-parse", "rev-list", "cat-file",
    "for-each-ref", "describe", "blame", "grep", "shortlog", "show-ref", "name-rev", "count-objects", "var", "version",
    "--version", "help", "whatchanged", "merge-base", "diff-tree", "diff-index", "check-ignore", "check-attr", "remote",
    "branch", "tag", "stash", "worktree", "reflog", "config", "symbolic-ref", "bundle", "archive", "format-patch", "cherry",
})
GIT_OPTIONS_GLOBALES_AVEC_VALEUR: frozenset[str] = frozenset({"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--config-env"})
GIT_CLES_QUI_EXECUTENT: tuple[str, ...] = (
    "core.hookspath", "core.fsmonitor", "core.sshcommand", "core.pager", "core.editor", "core.askpass", "core.gitproxy",
    "core.alternaterefscommand", "alias.", "credential.", "diff.external", "difftool.", "mergetool.", "merge.tool", "merge.",
    "filter.", "include.path", "includeif.", "sequence.editor", "gpg.program", "gpg.", "ssh.", "uploadpack.", "receive.",
    "url.", "protocol.", "http.", "remote.", "sendemail.", "browser.", "web.browser", "man.", "instaweb.", "pager.",
)

# git porte par git : la valeur de ces options ou ce qui suit ces sous-commandes est une commande.
GIT_OPTIONS_QUI_LANCENT: frozenset[str] = frozenset({"-x", "--exec"})
GIT_SOUS_COMMANDES_QUI_LANCENT: tuple[tuple[str, ...], ...] = (("submodule", "foreach"), ("bisect", "run"))
# Variables d'environnement qui changent la configuration ou la cible de git : leur affectation devant
# `git` vaut `-c <cle qui execute>` ou `-C <ailleurs>`. `GIT_TRACE`, `GIT_PAGER=cat` ne sont pas la.
GIT_VARIABLES_QUI_EXECUTENT: tuple[str, ...] = (
    "GIT_CONFIG", "GIT_SSH", "GIT_EXTERNAL_DIFF", "GIT_EDITOR", "GIT_SEQUENCE_EDITOR", "GIT_ASKPASS", "GIT_PROXY_COMMAND",
    "GIT_EXEC_PATH", "GIT_TEMPLATE_DIR", "GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_OBJECT_DIRECTORY",
    "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_INDEX_FILE", "GIT_NAMESPACE", "GIT_CEILING_DIRECTORIES", "GIT_DISCOVERY_ACROSS_FILESYSTEM",
)
# Ce qui rend une commande inanalysable, donc refusee.
OPAQUES: frozenset[str] = frozenset({"eval", "iex", "invoke-expression"})
OPTION_ENCODEE = "-encodedcommand"
PREFIXES_ENCODES: frozenset[str] = frozenset({"-e", "-ec", "-en", "-enc", "-enco", "-encod", "-encode", "-encoded", "-encodedc", "-encodedco", "-encodedcom", "-encodedcomm", "-encodedcomma", "-encodedcomman"})
# Cibles de redirection qui ne sont pas des fichiers.
CIBLES_SURES: frozenset[str] = frozenset({"/dev/null", "nul", "$null", "/dev/stdout", "/dev/stderr", "/dev/stdin", "&1", "&2", "&0"})
OPERATEURS_QUI_ECRIVENT: frozenset[str] = frozenset({">", ">>", "2>", "2>>", "1>", "1>>", "&>", "&>>", ">|", "*>", "*>>", "3>", "4>", "5>", "6>"})
OPERATEURS_QUI_LISENT: frozenset[str] = frozenset({"<", "0<"})
# Un caractere de glob : la cible n'est connue qu'a l'execution, le verrou la resout ou la refuse.
CARACTERES_GLOB: frozenset[str] = frozenset({"*", "?", "["})
