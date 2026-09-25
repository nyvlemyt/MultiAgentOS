"""Tests de sentinelle_en_none, ecrits avant l implementation (TDD)."""

import unittest

from sentinelle import sentinelle_en_none


class SentinelleEnNoneTest(unittest.TestCase):
    """Comportement attendu des trois sentinelles et des valeurs utiles."""

    def test_not_collected_devient_none(self) -> None:
        self.assertIsNone(sentinelle_en_none("Not Collected"))

    def test_not_applicable_devient_none(self) -> None:
        self.assertIsNone(sentinelle_en_none("Not Applicable"))

    def test_chaine_vide_devient_none(self) -> None:
        self.assertIsNone(sentinelle_en_none(""))

    def test_none_reste_none(self) -> None:
        self.assertIsNone(sentinelle_en_none(None))

    def test_une_valeur_utile_est_rendue_telle_quelle(self) -> None:
        self.assertEqual(sentinelle_en_none("AAA"), "AAA")

    def test_une_valeur_proche_d_une_sentinelle_est_conservee(self) -> None:
        self.assertEqual(sentinelle_en_none("Not Collected yet"), "Not Collected yet")

    def test_un_espace_seul_est_conserve(self) -> None:
        self.assertEqual(sentinelle_en_none(" "), " ")


if __name__ == "__main__":
    unittest.main()
