"""
Gate qualite du poste EVE (/gate) : zero regression du fait de l'assistant.

Sur les fichiers Python touches par rapport a une base (develop par defaut) :
  1. ruff et pyright, compares a la version de base (worktree temporaire) : seuls les findings
     NOUVEAUX bloquent, les preexistants sont comptes en information ;
  2. verif_style (artefacts et forme) ;
  3. la suite complete `manage.py test`, base sqlite forcee, avec la couverture des fichiers
     touches en information ;
  4. les seuils ECC (fonction < 50 lignes, fichier < 800, imbrication <= 4) en information,
     en distinguant introduit et preexistant.

Usage : python .claude/hooks/gate.py [--base develop] [--sans-tests] [--sans-couverture]
                                     [--sans-pyright] [--journal chemin]
Sortie : verdict PASS/FAIL en tete. Codes : 0 PASS, 1 FAIL, 2 erreur d'execution.
"""
import argparse
import ast
import json
import os
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import _lib  # noqa: E402
import verif_style  # noqa: E402

RACINE = _lib.racine_projet()
PYTHON = RACINE / ".venv" / "Scripts" / "python.exe"
RUFF = RACINE / ".venv" / "Scripts" / "ruff.exe"
DB_TESTS = '{"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}'
SEUIL_FONCTION = 50
SEUIL_FICHIER = 800
SEUIL_IMBRICATION = 4

Finding = tuple[str, str, str]  # (fichier, code, message)


class ErreurGate(RuntimeError):
    pass


def git(*args: str, cwd: Path | None = None) -> str:
    r = subprocess.run(["git", *args], cwd=str(cwd or RACINE), capture_output=True, text=True, timeout=60, check=False)
    if r.returncode != 0:
        raise ErreurGate(f"git {' '.join(args)} : {r.stderr.strip()}")
    return r.stdout


def fichiers_concernes(base: str) -> list[str]:
    """Fichiers .py touches : commits depuis la base, modifications, index, non suivis."""
    candidats: list[str] = []
    for sortie in (
        git("diff", "--name-only", f"{base}...HEAD"),
        git("diff", "--name-only"),
        git("diff", "--name-only", "--cached"),
        git("ls-files", "--others", "--exclude-standard"),
    ):
        candidats.extend(ligne.strip() for ligne in sortie.splitlines() if ligne.strip())
    retenus: list[str] = []
    for f in candidats:
        if not f.endswith(".py") or "/migrations/" in f or f.startswith(".claude/") or f in retenus:
            continue
        if (RACINE / f).exists():
            retenus.append(f)
    return retenus


class WorktreeBase:
    """Checkout temporaire de la base, avec les configs d'outils du poste copiees dedans."""

    def __init__(self, base: str) -> None:
        self.base = base
        self.chemin = Path(tempfile.mkdtemp(prefix="eve-gate-base-"))

    def __enter__(self) -> Path:
        self.chemin.rmdir()
        git("worktree", "add", "--detach", str(self.chemin), self.base)
        for conf in ("ruff.toml", "pyrightconfig.json"):
            if (RACINE / conf).exists():
                shutil.copy2(RACINE / conf, self.chemin / conf)
        return self.chemin

    def __exit__(self, *_: object) -> None:
        try:
            git("worktree", "remove", "--force", str(self.chemin))
        except ErreurGate:
            shutil.rmtree(self.chemin, ignore_errors=True)
            subprocess.run(["git", "worktree", "prune"], cwd=str(RACINE), capture_output=True, check=False)


def findings_ruff(racine_run: Path, fichiers: list[str]) -> Counter[Finding]:
    if not fichiers:
        return Counter()
    r = subprocess.run(
        [str(RUFF), "check", "--output-format", "json", "--config", str(RACINE / "ruff.toml"), *fichiers],
        cwd=str(racine_run), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300, check=False,
    )
    if r.returncode not in (0, 1):
        raise ErreurGate(f"ruff : {r.stderr.strip()[:300]}")
    resultats = json.loads(r.stdout or "[]")
    return Counter((_relatif(d["filename"], racine_run), d.get("code") or "?", d["message"]) for d in resultats)


def findings_pyright(racine_run: Path, fichiers: list[str]) -> Counter[Finding]:
    if not fichiers:
        return Counter()
    r = subprocess.run(
        ["npx", "--yes", "pyright", "--outputjson", "--pythonpath", str(PYTHON), *fichiers],
        cwd=str(racine_run), capture_output=True, text=True, encoding="utf-8", errors="replace",
        timeout=900, check=False, shell=True,
    )
    debut = r.stdout.find("{")
    if debut < 0:
        raise ErreurGate(f"pyright : sortie inattendue {r.stdout[:200]} {r.stderr[:200]}")
    rapport = json.loads(r.stdout[debut:])
    return Counter(
        (_relatif(d["file"], racine_run), d.get("rule") or d["severity"], d["message"].split("\n")[0])
        for d in rapport.get("generalDiagnostics", [])
        if d.get("severity") in ("error", "warning")
    )


def _relatif(chemin: str, racine_run: Path) -> str:
    try:
        return Path(chemin).resolve().relative_to(racine_run.resolve()).as_posix()
    except ValueError:
        return chemin.replace("\\", "/")


def nouveaux(tete: Counter[Finding], base: Counter[Finding]) -> list[Finding]:
    return sorted(f for f, n in tete.items() for _ in range(n - base.get(f, 0)) if n > base.get(f, 0))


def seuils_ecc(racine_run: Path, fichiers: list[str]) -> set[tuple[str, str]]:
    """(fichier, description) pour chaque depassement de seuil."""
    depassements: set[tuple[str, str]] = set()
    for f in fichiers:
        chemin = racine_run / f
        if not chemin.exists():
            continue
        source = chemin.read_text(encoding="utf-8", errors="replace")
        lignes = source.count("\n") + 1
        if lignes > SEUIL_FICHIER:
            depassements.add((f, f"fichier de {lignes} lignes (> {SEUIL_FICHIER})"))
        try:
            arbre = ast.parse(source)
        except SyntaxError:
            continue
        for noeud in ast.walk(arbre):
            if isinstance(noeud, (ast.FunctionDef, ast.AsyncFunctionDef)):
                longueur = (noeud.end_lineno or noeud.lineno) - noeud.lineno + 1
                if longueur > SEUIL_FONCTION:
                    depassements.add((f, f"fonction {noeud.name} : {longueur} lignes (> {SEUIL_FONCTION})"))
                profondeur = _imbrication(noeud)
                if profondeur > SEUIL_IMBRICATION:
                    depassements.add((f, f"fonction {noeud.name} : imbrication {profondeur} (> {SEUIL_IMBRICATION})"))
    return depassements


def _imbrication(noeud: ast.AST, niveau: int = 0) -> int:
    blocs = (ast.If, ast.For, ast.While, ast.With, ast.Try, ast.AsyncFor, ast.AsyncWith, ast.Match)
    pire = niveau
    for enfant in ast.iter_child_nodes(noeud):
        suivant = niveau + 1 if isinstance(enfant, blocs) else niveau
        pire = max(pire, _imbrication(enfant, suivant))
    return pire


def lancer_tests(avec_couverture: bool, fichiers: list[str]) -> tuple[bool, str, dict[str, float]]:
    env = {**os.environ, "DB_CONFIG": DB_TESTS, "PYTHONIOENCODING": "utf-8"}
    if avec_couverture:
        commande = [str(PYTHON), "-m", "coverage", "run", "--source=data,eve_back,users",
                    "--omit=*/migrations/*,*/tests/*", "manage.py", "test"]
    else:
        commande = [str(PYTHON), "manage.py", "test"]
    r = subprocess.run(commande, cwd=str(RACINE), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=1800, env=env, check=False)
    sortie = (r.stdout + r.stderr).strip().splitlines()
    resume = " | ".join(ligne for ligne in sortie[-4:] if ligne.strip())
    couverture: dict[str, float] = {}
    if avec_couverture and r.returncode == 0 and fichiers:
        rapport = RACINE / ".coverage.json"
        subprocess.run([str(PYTHON), "-m", "coverage", "json", "-o", str(rapport), "-q"], cwd=str(RACINE), capture_output=True, env=env, check=False)
        if rapport.exists():
            donnees = json.loads(rapport.read_text(encoding="utf-8"))
            for chemin, info in donnees.get("files", {}).items():
                rel = chemin.replace("\\", "/")
                if rel in fichiers:
                    couverture[rel] = float(info["summary"]["percent_covered"])
            rapport.unlink()
    return r.returncode == 0, resume, couverture


def main() -> int:
    parseur = argparse.ArgumentParser(description="Gate qualite EVE")
    parseur.add_argument("--base", default="develop")
    parseur.add_argument("--sans-tests", action="store_true")
    parseur.add_argument("--sans-couverture", action="store_true")
    parseur.add_argument("--sans-pyright", action="store_true")
    parseur.add_argument("--journal", default=None)
    args = parseur.parse_args()

    debut = datetime.now()
    bloquants: list[str] = []
    infos: list[str] = []

    fichiers = fichiers_concernes(args.base)
    infos.append(f"base : {args.base} | fichiers .py touches : {len(fichiers)}" + (" : " + ", ".join(fichiers) if fichiers else ""))

    if fichiers:
        with WorktreeBase(args.base) as base:
            existants_base = [f for f in fichiers if (base / f).exists()]
            ruff_tete, ruff_base = findings_ruff(RACINE, fichiers), findings_ruff(base, existants_base)
            for f, code, message in nouveaux(ruff_tete, ruff_base):
                bloquants.append(f"ruff {code} {f} : {message}")
            infos.append(f"ruff : {sum(ruff_tete.values())} finding(s) sur les fichiers touches, {len(nouveaux(ruff_tete, ruff_base))} nouveau(x)")
            if not args.sans_pyright:
                py_tete, py_base = findings_pyright(RACINE, fichiers), findings_pyright(base, existants_base)
                for f, code, message in nouveaux(py_tete, py_base):
                    bloquants.append(f"pyright {code} {f} : {message}")
                infos.append(f"pyright : {sum(py_tete.values())} diagnostic(s) sur les fichiers touches, {len(nouveaux(py_tete, py_base))} nouveau(x)")
            ecc_tete, ecc_base = seuils_ecc(RACINE, fichiers), seuils_ecc(base, existants_base)
            for f, description in sorted(ecc_tete):
                etat = "preexistant" if (f, description) in ecc_base else "INTRODUIT"
                infos.append(f"seuil ECC ({etat}) {f} : {description}")
        for f in fichiers:
            for probleme in verif_style.verifier_fichier(RACINE / f, RACINE):
                bloquants.append(f"forme {f} : {probleme}")

    if not args.sans_tests:
        succes, resume, couverture = lancer_tests(not args.sans_couverture, fichiers)
        (infos if succes else bloquants).append(f"tests : {resume}")
        for f, pct in sorted(couverture.items()):
            infos.append(f"couverture {f} : {pct:.0f} %")

    verdict = "PASS" if not bloquants else "FAIL"
    duree = (datetime.now() - debut).seconds
    lignes = [f"GATE {verdict} ({duree} s, {len(bloquants)} bloquant(s))"]
    lignes += [f"  BLOQUANT {b}" for b in bloquants]
    lignes += [f"  info {i}" for i in infos]
    print("\n".join(lignes))
    if args.journal:
        with open(args.journal, "a", encoding="utf-8", newline="\n") as j:
            j.write(f"\n### /gate {debut:%Y-%m-%d %H:%M}\n\n```\n" + "\n".join(lignes) + "\n```\n")
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ErreurGate as e:
        print(f"GATE ERREUR : {e}")
        sys.exit(2)
