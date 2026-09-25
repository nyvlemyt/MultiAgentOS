"""Test de compte2.txt, ecrit avant le fichier lui meme (TDD)."""

import unittest
from pathlib import Path

BAC = Path(__file__).resolve().parent
HOOKS = BAC.parents[3] / ".claude" / "hooks"
COMPTE2 = BAC / "compte2.txt"


def _py_a_la_racine_des_hooks() -> int:
    """Les .py du dossier hooks lui meme, sans descendre dans tests ni __pycache__."""
    return sum(1 for chemin in HOOKS.glob("*.py") if chemin.is_file())


class Compte2Test(unittest.TestCase):
    """compte2.txt porte le nombre de .py a la racine de .claude/hooks."""

    def test_le_fichier_compte2_existe(self) -> None:
        self.assertTrue(COMPTE2.is_file(), f"{COMPTE2} est absent")

    def test_le_contenu_est_le_nombre_de_py_a_la_racine_des_hooks(self) -> None:
        attendu = str(_py_a_la_racine_des_hooks())
        self.assertEqual(COMPTE2.read_text(encoding="utf-8").strip(), attendu)

    def test_sans_recursion_compte_moins_que_avec_recursion(self) -> None:
        """Garde-fou : si les deux comptes etaient egaux, le test ci-dessus ne prouverait rien."""
        recursif = sum(1 for chemin in HOOKS.rglob("*.py") if chemin.is_file())
        self.assertLess(_py_a_la_racine_des_hooks(), recursif)


if __name__ == "__main__":
    unittest.main()
