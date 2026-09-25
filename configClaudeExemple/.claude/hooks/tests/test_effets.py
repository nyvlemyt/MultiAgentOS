"""
Tests du catalogue d'effets `_effets.acces` : de l'invocation aux acces (chemin, mode, origine).

Ecrits AVANT le module (lot 3, tache T3). Un cas ECRIT, un cas LIT ou META, un piege par famille : les
pieges sont les regressions de la nuit du 16 au 17/09 et les faux positifs de `securite.md`.
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import _effets  # noqa: E402
from _commande import analyser  # noqa: E402
from _effets import ECRIT, LIT, META, acces  # noqa: E402

HORS = "C:/dev/maos/CLAUDE.md"


def effets(commande: str, outil: str = "Bash") -> list[tuple[str, str]]:
    """(mode, chemin) pour toutes les invocations de la commande."""
    analyse = analyser(commande, outil)
    assert analyse.opaque is None, analyse.opaque
    return [(a.mode, a.chemin) for inv in analyse.invocations for a in acces(inv)]


def ecrits(commande: str, outil: str = "Bash") -> list[str]:
    return [chemin for mode, chemin in effets(commande, outil) if mode == ECRIT]


def lus(commande: str, outil: str = "Bash") -> list[str]:
    return [chemin for mode, chemin in effets(commande, outil) if mode == LIT]


class FamillesQuiEcriventTests(unittest.TestCase):

    def test_tout_ecrit_toutes_ses_cibles(self) -> None:
        self.assertEqual(["C:/dev/maos", "chantiers/x"], ecrits("rm -rf C:/dev/maos chantiers/x"))
        self.assertEqual([".env"], ecrits("echo x | tee -a .env")[:1])
        self.assertIn(".env", ecrits("Set-Content -Path .env -Value 'x'", "PowerShell"))
        self.assertIn(HORS, ecrits(f"del {HORS}"))
        self.assertIn(".env", ecrits("truncate -s 0 .env"))

    def test_premier_necrit_que_sa_premiere_cible(self) -> None:
        self.assertEqual([HORS], ecrits(f"[IO.File]::WriteAllText('{HORS}', 'contenu qui n est pas un chemin')", "PowerShell"))

    def test_destination_ecrit_la_derniere_cible_et_lit_les_autres(self) -> None:
        self.assertEqual(["x.bak"], ecrits("cp .env x.bak"))
        self.assertEqual([".env"], lus("cp .env x.bak"))
        self.assertEqual(["chantiers/x/note.md"], ecrits(f"Copy-Item -Path {HORS} -Destination chantiers/x/note.md", "PowerShell"))
        self.assertEqual([HORS], lus(f"Copy-Item -Path {HORS} -Destination chantiers/x/note.md", "PowerShell"))
        # Attendu etendu au lot 4, cycle 3 : quand la destination est un dossier, les fichiers
        # qui y naissent sont juges aussi, sinon une copie vers un dossier echappait au verrou.
        self.assertEqual(["C:/dev/maos", "C:/dev/maos/a.txt", "C:/dev/maos/b.txt"],
                         ecrits("cp a.txt b.txt C:/dev/maos"))
        self.assertEqual([HORS], ecrits(f"install chantiers/x/note.md {HORS}"))

    def test_deplace_ecrit_les_deux_bouts(self) -> None:
        self.assertEqual([HORS, "chantiers/x/note.md"], ecrits(f"mv {HORS} chantiers/x/note.md"))
        self.assertEqual([".env", ".env.old"], ecrits("Move-Item -Path .env -Destination .env.old", "PowerShell"))

    def test_si_option_ecrit_sous_loption_et_lit_sans(self) -> None:
        self.assertIn(".env", ecrits("sed -i 's/a/b/' .env"))
        self.assertIn(".env", ecrits("sed --in-place 's/a/b/' .env"))
        self.assertNotIn(".env", ecrits("sed -n '1,3p' .env"))
        self.assertIn(".env", lus("sed -n '1,3p' .env"))
        self.assertIn(".env", ecrits("awk -i inplace '{print}' .env"))

    def test_tar_extrait_ecrit_ses_membres_et_son_dossier_mais_linventaire_lit(self) -> None:
        self.assertEqual([".env"], ecrits("tar -xf archive.tar .env"))
        self.assertEqual(["C:/dev/maos"], ecrits("tar -xf archive.tar -C C:/dev/maos"))
        self.assertEqual([], ecrits("tar -tf archive.tar .env"))
        self.assertIn(".env", lus("tar -tf archive.tar .env"))

    def test_option_cible_necrit_que_la_valeur_de_son_option(self) -> None:
        self.assertEqual([HORS], ecrits(f"curl -o {HORS} https://example.org/x"))
        self.assertEqual([HORS], ecrits(f"wget -O {HORS} https://example.org/x"))
        self.assertEqual([HORS], ecrits(f"dd if=/dev/zero of={HORS} bs=1 count=1"))
        self.assertEqual([".env"], ecrits("dd if=modele.txt of=.env"))
        self.assertEqual([], ecrits("curl https://example.org/x"))

    def test_les_redirections_ecrivent_ou_lisent_leur_cible(self) -> None:
        self.assertEqual([".env"], ecrits("echo x > .env"))
        self.assertEqual([HORS], ecrits(f"python x.py 2> {HORS}"))
        self.assertEqual([], ecrits("git log 2>/dev/null; python manage.py test 2>&1"))
        self.assertEqual([], ecrits("python manage.py check 2>$null", "PowerShell"))
        self.assertIn("C:/dev/Eve/Providers/x.csv", lus("python script.py < C:/dev/Eve/Providers/x.csv"))

    def test_lamont_dun_tube_devient_les_cibles_du_verbe(self) -> None:
        self.assertEqual([HORS], ecrits(f"echo {HORS} | xargs rm"))
        self.assertEqual([".env"], ecrits("echo .env | xargs rm"))
        self.assertEqual(["."], ecrits("find . -name '*.pyc' | xargs rm")[:1])


class FindEtGitTests(unittest.TestCase):

    def test_find_qui_supprime_ecrit_son_depart_et_ses_motifs(self) -> None:
        self.assertEqual([".", ".env"], ecrits("find . -name '.env' -delete"))
        # Sans motif de nom, la suppression peut atteindre n'importe quel fichier du depart : un glob le dit.
        self.assertEqual(["C:/dev/maos", "C:/dev/maos/*"], ecrits("find C:/dev/maos -delete"))

    def test_find_qui_cherche_ne_fait_que_des_metadonnees(self) -> None:
        self.assertEqual([], ecrits("find C:/dev/Eve/Providers -name '*.csv'"))
        self.assertIn((META, "C:/dev/Eve/Providers"), effets("find C:/dev/Eve/Providers -name '*.csv'"))

    def test_find_exec_donne_ses_cibles_au_verbe(self) -> None:
        self.assertIn(".env", ecrits("find . -name '.env' -exec rm {} \\;"))
        self.assertIn("C:/dev/maos", ecrits("find C:/dev/maos -name '*.md' -exec rm {} \\;"))

    def test_git_rm_et_mv_ecrivent_leurs_cibles_mais_cached_lit(self) -> None:
        self.assertEqual([".env"], ecrits("git rm .env"))
        self.assertEqual([], ecrits("git rm --cached .env"))
        self.assertEqual([".env", ".env.old"], ecrits("git mv .env .env.old"))

    def test_git_C_prefixe_ses_cibles_et_le_reste_est_meta(self) -> None:
        # `rm` n'est pas en lecture seule : le depot de `-C` est ecrit lui aussi (verification du 17/09).
        self.assertEqual(["C:/dev/maos", "C:/dev/maos/CLAUDE.md"], ecrits("git -C C:/dev/maos rm CLAUDE.md"))
        self.assertEqual(["C:/dev/maos"], ecrits("git -C C:/dev/maos stash"))
        self.assertEqual([], ecrits("git -C C:/dev/maos stash list"))
        self.assertEqual([], ecrits("git -C C:/dev/maos log --oneline -5"))
        self.assertEqual([], ecrits("git add data/api.py && git commit -m 'x'"))


class LecteursMetadonneesEtInconnusTests(unittest.TestCase):

    def test_un_lecteur_lit(self) -> None:
        self.assertEqual([".env"], lus("cat .env"))
        self.assertIn("C:/dev/Eve/Providers/x.csv", lus("head -5 C:/dev/Eve/Providers/x.csv"))
        self.assertEqual([], ecrits("grep -m 1 rm .env"))
        self.assertEqual([], ecrits("grep '.delete' .env"))
        self.assertIn("C:/dev/Eve/Providers/x.csv", lus("Get-Content C:/dev/Eve/Providers/x.csv", "PowerShell"))

    def test_les_metadonnees_sont_typees_meta(self) -> None:
        self.assertIn((META, "C:/dev/Eve/Providers"), effets("ls -la C:/dev/Eve/Providers"))
        self.assertIn((META, "C:/dev/Eve/token_api.txt"), effets("ls -la C:/dev/Eve/token_api.txt"))
        self.assertEqual([], ecrits("ls -la C:/dev/Eve/Providers"))

    def test_un_gestionnaire_de_paquets_necrit_rien(self) -> None:
        self.assertEqual([], ecrits("npm install C:/dev/csdr_codex/pkg"))
        self.assertEqual([], ecrits("pip install -e C:/dev/bdfg-core"))
        self.assertEqual([], ecrits("uv pip install ruff"))

    def test_un_programme_inconnu_ne_produit_que_ses_redirections(self) -> None:
        self.assertEqual([(ECRIT, "chantiers/x/log.txt")], effets(f"outil_inconnu {HORS} > chantiers/x/log.txt"))

    def test_une_enveloppe_seule_ne_produit_rien(self) -> None:
        self.assertEqual([], effets("env"))


class InterpretesTests(unittest.TestCase):

    def test_un_script_inline_ecrit_sil_porte_un_indice_et_lit_sinon(self) -> None:
        self.assertEqual([".env"], ecrits("python -c \"open('.env','w').write('x')\""))
        self.assertEqual([], ecrits("python -c \"print(open('.env').read())\""))
        self.assertEqual([".env"], lus("python -c \"print(open('.env').read())\""))
        self.assertIn(HORS, ecrits(f"python -c \"import os; os.remove('{HORS}')\""))
        self.assertIn(HORS, ecrits(f"node -e \"require('fs').writeFileSync('{HORS}','a')\""))

    def test_un_script_inline_qui_lit_une_donnee_la_lit(self) -> None:
        self.assertIn("C:/dev/Eve/Providers/x.csv", lus("python -c \"import pandas as pd; pd.read_csv('C:/dev/Eve/Providers/x.csv')\""))

    def test_os_environ_et_venv_ne_sont_pas_des_env(self) -> None:
        self.assertEqual([], [c for _, c in effets("python -c \"import os; print(os.environ['PATH'])\"") if ".env" in c])

    def test_un_script_du_disque_est_lu_avec_ses_arguments(self) -> None:
        self.assertIn("manage.py", lus("python manage.py test data"))
        self.assertEqual([], ecrits("python manage.py test data"))

    def test_un_script_du_depot_qui_ecrit_sous_option(self) -> None:
        self.assertIn(".env", ecrits("python .claude/hooks/nettoyer_caracteres.py .env --appliquer"))
        self.assertEqual([], ecrits("python .claude/hooks/nettoyer_caracteres.py .env"))

    def test_un_document_qui_alimente_un_interprete_est_son_code(self) -> None:
        self.assertIn(HORS, ecrits(f"python - <<'EOF'\nopen('{HORS}','w').write('a')\nEOF"))

    def test_un_shell_qui_lance_un_script_du_disque_le_lit(self) -> None:
        self.assertEqual(["scripts/lancer.sh"], lus("bash scripts/lancer.sh"))


class RepertoireEtResidusTests(unittest.TestCase):

    def test_un_chemin_relatif_suit_le_cd_qui_precede(self) -> None:
        self.assertEqual(["C:/dev/maos/CLAUDE.md"], ecrits("cd C:/dev/maos && rm CLAUDE.md"))
        self.assertEqual(["C:/dev/maos/note.md"], ecrits("cd C:/dev/maos; echo x > note.md"))
        self.assertEqual(["chantiers/x/tmp.txt"], ecrits("cd chantiers/x && rm tmp.txt"))
        self.assertEqual([HORS], ecrits(f"cd chantiers && rm {HORS}"))

    def test_un_residu_de_decoupage_nest_pas_une_cible(self) -> None:
        self.assertEqual(["chantiers/x/tmp.txt"], ecrits('bash -c "rm \\"chantiers/x/tmp.txt\\""'))
        self.assertEqual([], ecrits("rm \\"))
        self.assertEqual([], ecrits("rm ''"))

    def test_les_appels_dotnet_dinstance_visent_lobjet_du_groupe(self) -> None:
        self.assertIn(".env", ecrits("(Get-Item .env).Delete()", "PowerShell"))
        self.assertEqual([], ecrits("[IO.File]::Copy('.env', 'sauvegarde.txt')", "PowerShell")[:0] + [c for c in ecrits("[IO.File]::Copy('.env', 'sauvegarde.txt')", "PowerShell") if c == ".env"])

    def test_les_constantes_publiques(self) -> None:
        self.assertEqual(("LIT", "ECRIT", "META"), (LIT, ECRIT, META))
        self.assertTrue(hasattr(_effets, "Acces"))


if __name__ == "__main__":
    unittest.main()
