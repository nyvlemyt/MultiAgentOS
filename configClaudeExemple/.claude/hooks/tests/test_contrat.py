"""
Joue le corpus de contrat (`corpus_contrat.CAS`) contre le `decision()` de chaque verrou.

Un test par cas, genere a l'import : un echec nomme le cas, sa regle et sa source. En ligne de
commande, `--bilan` imprime chaque cas avec son verdict et compte les rouges : c'est la photo du
depart qu'exige le lot 3 (`design-lot-3.md`, critere 1), a recopier au journal avant tout code.
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

import garde_donnees  # noqa: E402
import garde_git  # noqa: E402
import garde_perimetre  # noqa: E402
from corpus_contrat import CAS, PASSE, REFUS, Cas  # noqa: E402

RACINE = "C:/dev/Eve/EveBackEnd"
AUTORISEES = [
    RACINE,
    r"C:\dev\bdfg-core",
    "D:/Users/mpommier.BDF-GESTION.000/.claude/projects/c--dev-Eve-EveBackEnd/memory",
    "D:/Users/mpommier.BDF-GESTION.000/.claude/settings.json",
    "D:/Users/mpommier.BDF-GESTION.000/AppData/Local/Temp/claude/c--dev-Eve-EveBackEnd",
]


def jouer(cas: Cas) -> str | None:
    """Le message de refus du verrou concerne, ou None. Ne parle qu'a `decision()` (ou a l'entree brute)."""
    if cas.verrou == "git":
        return garde_git.decision(cas.entree["command"], cas.branche, agent=cas.agent, outil=cas.outil)
    if cas.verrou == "git_entree":
        return garde_git.decision_depuis_entree({"tool_name": cas.outil, "tool_input": dict(cas.entree), "cwd": RACINE})
    if cas.verrou == "perimetre":
        return garde_perimetre.decision(cas.outil, cas.entree, racine=RACINE, racines_autorisees=AUTORISEES)
    if cas.verrou == "donnees":
        return garde_donnees.decision(cas.outil, cas.entree, racine=RACINE)
    raise ValueError(f"verrou inconnu : {cas.verrou}")


def verdict(cas: Cas) -> tuple[str, str | None]:
    message = jouer(cas)
    return (REFUS if message else PASSE), message


class ContratTests(unittest.TestCase):
    """Un test par cas du corpus, ajoute ci-dessous."""


def _fabriquer(cas: Cas):
    def test(self: unittest.TestCase) -> None:
        obtenu, message = verdict(cas)
        self.assertEqual(
            cas.attendu, obtenu,
            f"\n  cas     : {cas.id}\n  entree  : {cas.entree}\n  regle   : {cas.regle}\n  source  : {cas.source}\n  message : {message}",
        )
        if cas.motif and message:
            self.assertIn(cas.motif, message, f"{cas.id} : refuse, mais pas pour le motif attendu")
    test.__doc__ = f"{cas.regle} ({cas.source})"
    return test


for _cas in CAS:
    setattr(ContratTests, f"test_{_cas.verrou}_{_cas.id}", _fabriquer(_cas))


def bilan() -> int:
    rouges = 0
    for cas in CAS:
        obtenu, message = verdict(cas)
        tenu = obtenu == cas.attendu and (not cas.motif or not message or cas.motif in message)
        rouges += 0 if tenu else 1
        print(f"{'vert ' if tenu else 'ROUGE'} {cas.verrou:9} {cas.attendu:5} {cas.id}")
    print(f"\n{len(CAS)} cas, {len(CAS) - rouges} verts, {rouges} rouges")
    return rouges


if __name__ == "__main__":
    if "--bilan" in sys.argv:
        sys.exit(1 if bilan() else 0)
    unittest.main()
