"""
Etat des garde-fous du poste EVE.

- Sans argument (hook SessionStart) : une dizaine de lignes, alertes en tete, sans reseau.
- `--complet` : toutes les verifications, plus les tests unitaires des verrous et un auto-test
  de chaque hook par stdin. Sert a /verif-setup.

Ne modifie rien. Code de sortie 0 meme en cas d'alerte : c'est un tableau de bord, pas un verrou.
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402

RACINE = _lib.racine_projet()
HOOKS = ("garde_donnees.py", "garde_git.py", "garde_perimetre.py", "verif_style.py", "nettoyer_caracteres.py", "doctor.py", "gate.py")
EXCLUSIONS_ATTENDUES = ("CLAUDE.md", "CONTEXT.md", ".claude/", "chantiers/", "graphify-out/", "ruff.toml", "pyrightconfig.json")
BRANCHES_PARTAGEES = {"develop", "master", "main", "test1"}
BUCKET = "c--dev-Eve-EveBackEnd"
ANCIEN_BUCKET = "c--dev-EVE"


def git(*args: str) -> str:
    try:
        r = subprocess.run(["git", *args], cwd=str(RACINE), capture_output=True, text=True, timeout=10, check=False)
        return r.stdout.strip() if r.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def _graphify() -> str | None:
    trouve = shutil.which("graphify")
    if trouve:
        return trouve
    local = Path(os.path.expanduser("~")) / ".local" / "bin" / "graphify.exe"
    return str(local) if local.exists() else None


def _moteur_env() -> str:
    """Le moteur de base declare dans .env, sans afficher autre chose que le moteur et le nom."""
    env = RACINE / ".env"
    if not env.exists():
        return "absent (.env introuvable : sqlite db.sqlite3 par defaut)"
    for ligne in env.read_text(encoding="utf-8", errors="replace").splitlines():
        if ligne.strip().startswith("DB_CONFIG"):
            valeur = ligne.split("=", 1)[1].strip().strip("'\"")
            try:
                conf = json.loads(valeur)
            except json.JSONDecodeError:
                return "illisible"
            moteur = str(conf.get("ENGINE", "?"))
            nom = str(conf.get("NAME", "?"))
            hote = conf.get("HOST")
            return f"{moteur.rsplit('.', 1)[-1]} {nom}" + (f" sur {hote}" if hote else "")
    return "absent (sqlite db.sqlite3 par defaut)"


def fiches_sans_registre(fiches: list[str], registre: str) -> list[str]:
    """
    Les fiches d'agents presentes sur le disque qui n'ont aucune ligne au REGISTRE.

    On liste ce qui existe plutot que d'attendre une liste en dur : supprimer une fiche reste alors
    une operation propre, sans alerte permanente a desarmer ensuite.
    """
    return sorted(f for f in fiches if f"`{f}`" not in registre)


def hooks_declares_absents(commandes: list[str], scripts_presents: set[str]) -> list[str]:
    """
    Les scripts de hooks declares dans settings.json qui n'existent pas sur le disque.

    Un script absent fait sortir python en code 2, et un PreToolUse en code 2 refuse l'appel : tous
    les appels de son matcher seraient bloques sans que rien d'autre ne le signale.
    """
    manquants: list[str] = []
    for commande in commandes:
        for morceau in commande.replace('"', " ").split():
            nom = morceau.replace("\\", "/").rsplit("/", 1)[-1]
            if nom.endswith(".py") and "hooks/" in morceau.replace("\\", "/") and nom not in scripts_presents:
                manquants.append(nom)
    return sorted(set(manquants))


def verifications() -> tuple[list[str], list[str], list[str]]:
    """(ok, alertes, infos)"""
    ok: list[str] = []
    alertes: list[str] = []
    infos: list[str] = []

    settings = RACINE / ".claude" / "settings.json"
    conf: dict = {}
    try:
        conf = json.loads(settings.read_text(encoding="utf-8"))
        hooks = conf.get("hooks", {})
        manquants = [e for e in ("PreToolUse", "PostToolUse", "SessionStart") if e not in hooks]
        (alertes if manquants else ok).append(f"settings.json : hooks {'manquants ' + ', '.join(manquants) if manquants else 'PreToolUse, PostToolUse, SessionStart declares'}")
    except (OSError, json.JSONDecodeError):
        alertes.append("settings.json absent ou illisible : aucun verrou actif")

    absents = [h for h in HOOKS if not (RACINE / ".claude" / "hooks" / h).exists()]
    (alertes if absents else ok).append(f"scripts des verrous : {'absents ' + ', '.join(absents) if absents else 'tous presents'}")

    dossier_hooks = RACINE / ".claude" / "hooks"
    presents = {f.name for f in dossier_hooks.glob("*.py")} if dossier_hooks.exists() else set()
    commandes = [
        h.get("command", "")
        for evenement in conf.get("hooks", {}).values()
        for entree in evenement
        for h in entree.get("hooks", [])
    ]
    fantomes = hooks_declares_absents(commandes, presents)
    (alertes if fantomes else ok).append(
        f"scripts declares dans settings.json : {'INTROUVABLES ' + ', '.join(fantomes) + ' (les appels de leur matcher sont bloques)' if fantomes else 'tous presents'}"
    )

    dossier_fiches = RACINE / ".claude" / "agents"
    fiches = sorted(f.stem for f in dossier_fiches.glob("*.md")) if dossier_fiches.exists() else []
    registre_fichier = RACINE / ".claude" / "skills" / "REGISTRE.md"
    registre = registre_fichier.read_text(encoding="utf-8", errors="replace") if registre_fichier.exists() else ""
    orphelines = fiches_sans_registre(fiches, registre)
    (alertes if orphelines else ok).append(
        f"fiches d'agents : {len(fiches)} presente(s), " + (f"SANS ligne au REGISTRE : {', '.join(orphelines)}" if orphelines else "toutes inscrites au REGISTRE")
    )

    venv = RACINE / ".venv" / "Scripts" / "python.exe"
    (ok if venv.exists() else alertes).append(f"venv : {'present' if venv.exists() else 'ABSENT (.venv/Scripts/python.exe)'}")
    ruff = RACINE / ".venv" / "Scripts" / "ruff.exe"
    (ok if ruff.exists() else alertes).append(f"ruff : {'present' if ruff.exists() else 'absent (pip install ruff)'}")
    couverture = (RACINE / ".venv" / "Lib" / "site-packages" / "coverage").exists()
    (ok if couverture else alertes).append(f"coverage : {'present' if couverture else 'absent (pip install coverage)'}")
    (ok if shutil.which("npx") else alertes).append(f"npx (pyright) : {'present' if shutil.which('npx') else 'absent'}")
    g = _graphify()
    (ok if g else alertes).append(f"graphify : {'present' if g else 'introuvable (PATH ou ~/.local/bin)'}")
    graphe = RACINE / "graphify-out" / "graph.json"
    if graphe.exists():
        age = (datetime.now() - datetime.fromtimestamp(graphe.stat().st_mtime)).days
        infos.append(f"graphe graphify : {age} jour(s)")
    else:
        alertes.append("graphify-out/graph.json absent : graphify extract . --code-only ; graphify cluster-only . --no-label")

    exclude = RACINE / ".git" / "info" / "exclude"
    contenu = exclude.read_text(encoding="utf-8", errors="replace") if exclude.exists() else ""
    manquantes = [e for e in EXCLUSIONS_ATTENDUES if e not in contenu]
    (alertes if manquantes else ok).append(f"exclusions locales : {'manquantes ' + ', '.join(manquantes) if manquantes else 'completes'}")

    moteur = _moteur_env()
    (ok if "sqlite" in moteur else alertes).append(f"base .env : {moteur}" + ("" if "sqlite" in moteur else "  <- base partagee : LECTURE SEULE"))

    branche = git("rev-parse", "--abbrev-ref", "HEAD") or "?"
    (alertes if branche in BRANCHES_PARTAGEES else ok).append(f"branche : {branche}" + ("  <- partagee : aucun commit" if branche in BRANCHES_PARTAGEES else ""))
    modifies = [ligne for ligne in git("status", "--porcelain").splitlines() if ligne.strip()]
    infos.append(f"arbre de travail : {len(modifies)} fichier(s) modifie(s) ou non suivi(s)")
    stashes = [ligne for ligne in git("stash", "list").splitlines() if ligne.strip()]
    if stashes:
        infos.append(f"stash en attente : {len(stashes)} ({stashes[0].split(': ', 1)[-1][:70]})")

    profil = Path(os.path.expanduser("~")) / ".claude" / "projects"
    memoire = profil / BUCKET / "memory" / "MEMORY.md"
    (ok if memoire.exists() else alertes).append(f"memoire {BUCKET} : {'presente' if memoire.exists() else 'ABSENTE'}")
    ancienne = profil / ANCIEN_BUCKET / "memory"
    if ancienne.exists():
        fichiers = [f for f in ancienne.iterdir() if f.is_file() and f.name != "MEMORY.md"]
        if len(fichiers) > 1:
            alertes.append(f"memoire dupliquee dans {ANCIEN_BUCKET} ({len(fichiers)} fiches) : fusionner")
    return ok, alertes, infos


def autotests() -> list[str]:
    """Mode complet : tests unitaires des verrous et auto-test de chaque hook par stdin."""
    lignes: list[str] = []
    python = str(RACINE / ".venv" / "Scripts" / "python.exe")
    hooks = RACINE / ".claude" / "hooks"
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "CLAUDE_PROJECT_DIR": str(RACINE)}
    r = subprocess.run([python, str(hooks / "tests" / "test_gardes.py")], capture_output=True, text=True, timeout=120, env=env, check=False)
    dernier = (r.stderr.strip().splitlines() or ["?"])[-1]
    lignes.append(f"{'OK    ' if r.returncode == 0 else 'ALERTE'} tests des verrous : {dernier}")
    cas = [
        ("garde_git.py", {"tool_name": "Bash", "tool_input": {"command": "git push --force"}}, 2),
        ("garde_donnees.py", {"tool_name": "Read", "tool_input": {"file_path": "C:/dev/Eve/Providers/x/y.xlsx"}}, 2),
        ("garde_perimetre.py", {"tool_name": "Write", "tool_input": {"file_path": "C:/dev/maos/CLAUDE.md"}}, 2),
        # Zone protegee en ecriture : la cible est DANS le projet, donc seul le verrou de zone peut
        # la refuser. Une cible hors projet serait deja refusee par le perimetre et ne prouverait rien.
        ("garde_perimetre.py", {"tool_name": "Write", "tool_input": {"file_path": ".env"}}, 2),
        # Shells imbriques : jusqu'au 17/09/2026, un prefixe de huit caracteres suffisait a faire
        # passer les sept interdits de git.md et toute ecriture hors perimetre. Les deux sondes sont
        # en forme imbriquee, parce que la forme directe etait deja couverte et ne prouvait rien.
        ("garde_git.py", {"tool_name": "Bash", "tool_input": {"command": 'bash -c "git push --force"'}}, 2),
        ("garde_perimetre.py", {"tool_name": "Bash", "tool_input": {"command": 'bash -c "rm C:/dev/maos/CLAUDE.md"'}}, 2),
        ("garde_donnees.py", {"tool_name": "Read", "tool_input": {"file_path": "data/api.py"}}, 0),
    ]
    for script, entree, attendu in cas:
        r = subprocess.run([python, str(hooks / script)], input=json.dumps(entree), capture_output=True, text=True, timeout=30, env=env, check=False)
        etat = "OK    " if r.returncode == attendu else "ALERTE"
        lignes.append(f"{etat} {script} sur {json.dumps(entree['tool_input'])[:60]} : code {r.returncode} (attendu {attendu})")
    return lignes


def main() -> None:
    complet = "--complet" in sys.argv
    ok, alertes, infos = verifications()
    print(f"doctor EVE : {len(ok)} OK, {len(alertes)} alerte(s). Dispositif : .claude/README.md")
    for a in alertes:
        print(f"ALERTE {a}")
    for i in infos:
        print(f"info   {i}")
    if complet:
        for o in ok:
            print(f"OK     {o}")
        for ligne in autotests():
            print(ligne)
    sys.exit(0)


if __name__ == "__main__":
    main()
