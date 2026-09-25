"""
Tests des verrous du dispositif Claude Code (hooks PreToolUse / PostToolUse).

Chaque verrou expose une fonction pure `decision(...)` qui renvoie None (autorise) ou un
message de refus (str). Les tests fixent le contrat AVANT l'implementation.
"""
import base64
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

import _commande  # noqa: E402
import _effets  # noqa: E402
import _lib  # noqa: E402
import doctor  # noqa: E402
import garde_donnees  # noqa: E402
import garde_git  # noqa: E402
import garde_perimetre  # noqa: E402
import verif_style  # noqa: E402

RACINE = "C:/dev/Eve/EveBackEnd"


class NormalisationTests(unittest.TestCase):

    def test_les_chemins_windows_git_bash_et_relatifs_se_normalisent_pareil(self) -> None:
        attendu = "c:/dev/eve/evebackend/data/api.py"
        self.assertEqual(attendu, _lib.normaliser(r"C:\dev\Eve\EveBackEnd\data\api.py"))
        self.assertEqual(attendu, _lib.normaliser("/c/dev/Eve/EveBackEnd/data/api.py"))
        self.assertEqual(attendu, _lib.normaliser("data/api.py", base=RACINE))

    def test_sous_est_strict_sur_la_frontiere_de_dossier(self) -> None:
        self.assertTrue(_lib.sous("c:/dev/eve/providers/iss_esg/x.xlsx", "c:/dev/eve/providers"))
        self.assertFalse(_lib.sous("c:/dev/eve/providers2/x.xlsx", "c:/dev/eve/providers"))

    # Les cinq tests suivants portaient sur `_lib.decouper_commande` et `_lib.extraire_chemins_commande`,
    # retires au lot 3 (17/09/2026). Reecrits sur `_commande.analyser` et `_effets.acces`, attendus inchanges.
    def test_la_commande_dun_shell_imbrique_est_analysee(self) -> None:
        """`bash -c "rm x"` arrive en un seul token : sans redecoupage, aucun verrou ne voit `rm`."""
        analyse = _commande.analyser('bash -c "rm C:/dev/maos/x.md"', "Bash")
        programmes = [(inv.programme, inv.args) for inv in analyse.invocations]
        self.assertIn(("bash", ("-c", "rm C:/dev/maos/x.md")), programmes)
        self.assertIn(("rm", ("C:/dev/maos/x.md",)), programmes)

    def test_la_commande_interne_prend_tous_les_tokens_qui_suivent_loption(self) -> None:
        """`cmd /c del x` a deja ses arguments en tokens separes : prendre le seul token suivant
        laisserait le chemin orphelin."""
        cmd = [(inv.programme, inv.args) for inv in _commande.analyser("cmd /c del C:/dev/maos/x.md", "Bash").invocations]
        self.assertIn(("del", ("C:/dev/maos/x.md",)), cmd)
        pwsh = [(inv.programme, inv.args) for inv in _commande.analyser('pwsh -NoProfile -Command "Remove-Item C:/dev/maos/x.md"', "Bash").invocations]
        self.assertIn(("remove-item", ("C:/dev/maos/x.md",)), pwsh)

    def test_deux_niveaux_de_shell_sont_refuses_plutot_quanalyses_a_moitie(self) -> None:
        analyse = _commande.analyser('bash -c "bash -c \\"rm C:/dev/maos/x.md\\""', "Bash")
        self.assertIsNotNone(analyse.opaque)

    def test_extraction_des_chemins_dune_commande(self) -> None:
        commande = 'head -5 "C:/dev/Eve/Providers/ISS_ESG/export.xlsx" && cat data/api.py'
        chemins = [a.chemin for inv in _commande.analyser(commande, "Bash").invocations for a in _effets.acces(inv)]
        self.assertIn("C:/dev/Eve/Providers/ISS_ESG/export.xlsx", chemins)
        self.assertIn("data/api.py", chemins)
        self.assertEqual(["C:/dev/Eve/Providers/ISS_ESG/export.xlsx"], _effets.chemins_cites(commande))


class GardeDonneesTests(unittest.TestCase):

    def decision(self, outil: str, entree: dict) -> str | None:
        return garde_donnees.decision(outil, entree, racine=RACINE)

    def test_lire_un_fichier_provider_est_refuse(self) -> None:
        self.assertIsNotNone(self.decision("Read", {"file_path": r"C:\dev\Eve\Providers\ISS_ESG\BDFGestion_export_Issuers_20260331.xlsx"}))

    def test_lire_un_csv_de_tmp_uploads_est_refuse(self) -> None:
        self.assertIsNotNone(self.decision("Read", {"file_path": "tmp_uploads/upload.csv"}))

    def test_un_csv_hors_zones_interdites_reste_refuse_par_extension(self) -> None:
        self.assertIsNotNone(self.decision("Read", {"file_path": r"C:\dev\retour vue Operation Action isin = US5184391044.csv"}))

    def test_les_documents_xlsx_de_specification_sont_autorises(self) -> None:
        self.assertIsNone(self.decision("Read", {"file_path": r"C:\dev\Eve\Data_Quality_ExpressionDeBesoins.xlsx"}))
        self.assertIsNone(self.decision("Read", {"file_path": "documentation/Expression de besoin/dataquality_expressionDeBesoin.xlsx"}))

    def test_export_issuer_schemas_a_la_racine_est_autorise(self) -> None:
        self.assertIsNone(self.decision("Read", {"file_path": f"{RACINE}/issuer_schemas_20260918_112051.xlsx"}))

    def test_un_export_issuer_schemas_hors_racine_reste_refuse(self) -> None:
        self.assertIsNotNone(self.decision("Read", {"file_path": f"{RACINE}/data/issuer_schemas_20260918_112051.xlsx"}))
        self.assertIsNotNone(self.decision("Read", {"file_path": f"{RACINE}/autre_export_20260918.xlsx"}))

    def test_le_code_et_la_doc_sont_autorises(self) -> None:
        self.assertIsNone(self.decision("Read", {"file_path": "data/api.py"}))
        self.assertIsNone(self.decision("Grep", {"pattern": "insert_data", "path": "documentation"}))

    def test_grep_dans_un_dossier_de_donnees_est_refuse(self) -> None:
        self.assertIsNotNone(self.decision("Grep", {"pattern": "FR000", "path": r"C:\dev\Eve\Archives Tania"}))

    def test_bash_lister_les_noms_est_autorise_mais_lire_le_contenu_non(self) -> None:
        self.assertIsNone(self.decision("Bash", {"command": "ls -la C:/dev/Eve/Providers/ISS_ESG"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "head -3 C:/dev/Eve/Providers/ISS_ESG/export.xlsx"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "python -c \"import polars as pl; print(pl.read_excel('C:/dev/Eve/Providers/ISS_ESG/export.xlsx'))\""}))
        self.assertIsNotNone(self.decision("Bash", {"command": 'find C:/dev/Eve/Providers -name "*.csv" -exec head -1 {} \\;'}))

    def test_powershell_est_garde_comme_bash(self) -> None:
        self.assertIsNone(self.decision("PowerShell", {"command": "Get-ChildItem C:\\dev\\Eve\\Providers -Recurse | Measure-Object"}))
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Get-Content C:\\dev\\Eve\\Providers\\ISS_ESG\\export.csv -TotalCount 5"}))

    def test_le_token_api_nest_jamais_lu(self) -> None:
        self.assertIsNotNone(self.decision("Read", {"file_path": r"C:\dev\Eve\token_api.txt"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "cat C:/dev/Eve/token_api.txt"}))

    def test_le_env_reste_lisible(self) -> None:
        self.assertIsNone(self.decision("Read", {"file_path": ".env"}))


class GardeGitTests(unittest.TestCase):

    def refuse(self, commande: str, branche: str = "features/melvyn/sujet") -> None:
        self.assertIsNotNone(garde_git.decision(commande, branche_courante=branche), commande)

    def autorise(self, commande: str, branche: str = "features/melvyn/sujet") -> None:
        self.assertIsNone(garde_git.decision(commande, branche_courante=branche), commande)

    # Sonde du 17/09/2026 : les sept interdits de `git.md` tombaient tous derriere un prefixe de huit
    # caracteres. C'est le trou le plus grave du poste, parce que ses effets sont partages et
    # irreparables : un push force sur develop, un reset dur sur du travail non commite.
    def test_un_shell_imbrique_ne_contourne_aucun_interdit_de_git(self) -> None:
        for interdit in (
            "git push --force",
            "git reset --hard",
            "git clean -fdx",
            "git branch -D features/x",
            "git checkout .",
            "git stash clear",
            "git commit --amend",
        ):
            self.refuse(f'bash -c "{interdit}"')
            self.refuse(f"sh -c '{interdit}'")

    def test_les_quatre_formes_de_shell_imbrique_sont_couvertes_pour_git(self) -> None:
        self.refuse('bash -c "git push --force"')
        self.refuse("sh -c 'git reset --hard'")
        self.refuse('pwsh -NoProfile -Command "git push --force"')
        self.refuse("cmd /c git clean -fdx")

    def test_une_enveloppe_devant_le_shell_ne_rouvre_pas_les_interdits(self) -> None:
        """`premier_mot` ne saute que quatre enveloppes : `env bash -c "..."` lui rendait `env`,
        donc le redecoupage n'avait pas lieu et les sept interdits redevenaient accessibles."""
        for enveloppe in ("sudo", "env", "timeout 5", "nice -n 5", "stdbuf -o0", "command", "uv run"):
            self.refuse(f'{enveloppe} bash -c "git push --force"')

    def test_un_shell_lance_par_son_chemin_absolu_ne_contourne_rien(self) -> None:
        """`/c` et `/k` sont des options de `cmd` ; `/usr/bin/bash` est un chemin de programme.
        Les confondre rendait invisible un shell lance par son chemin, et les deux binaires existent
        sur ce poste."""
        self.refuse('/usr/bin/bash -c "git push --force"')
        self.refuse("/bin/sh -c 'git reset --hard'")

    def test_une_commande_encodee_en_base64_est_refusee_en_bloc(self) -> None:
        """Elle n'est pas analysable sans etre decodee, et aucun usage du poste n'en a besoin."""
        encode = base64.b64encode("git push --force".encode("utf-16-le")).decode()
        self.refuse(f"pwsh -EncodedCommand {encode}")

    def test_lire_le_code_des_verrous_nest_pas_une_commande_encodee(self) -> None:
        """Chercher le nom de l'option dans le depot n'est pas l'utiliser."""
        self.autorise('grep -rn -- "-EncodedCommand" .claude/hooks')
        self.autorise('grep -rn "bash -c" .claude/hooks')

    def test_un_shell_imbrique_qui_ne_fait_rien_dinterdit_passe(self) -> None:
        self.autorise('bash -c "git status --porcelain"')
        self.autorise('bash -c "git log --oneline -5"')
        self.autorise("sh -c 'git diff data/api.py'")

    def test_push_force_et_push_vers_les_branches_partagees_sont_refuses(self) -> None:
        self.refuse("git push --force")
        self.refuse("git push -f origin features/melvyn/sujet")
        self.refuse("git push --force-with-lease")
        self.refuse("git push origin develop")
        self.refuse("git push origin HEAD:master")
        self.refuse("git push origin :features/melvyn/sujet")
        self.refuse("git push --delete origin features/melvyn/sujet")
        self.refuse("git push", branche="develop")

    def test_push_sur_sa_propre_branche_est_autorise(self) -> None:
        self.autorise("git push -u origin features/melvyn/sujet")
        self.autorise("git push")

    def test_operations_destructrices_refusees(self) -> None:
        self.refuse("git reset --hard HEAD~1")
        self.refuse("git clean -fd")
        self.refuse("git branch -D features/melvyn/sujet")
        self.refuse("git checkout .")
        self.refuse("git checkout -- data/api.py")
        self.refuse("git restore data/api.py")
        self.refuse("git stash drop")
        self.refuse("git stash clear")
        self.refuse("git commit --amend --no-edit")
        self.refuse("git commit --no-verify -m x")
        self.refuse("git config --global user.name x")

    def test_commit_et_merge_sur_branche_partagee_refuses(self) -> None:
        self.refuse("git commit -m 'x'", branche="develop")
        self.refuse("git commit -m 'x'", branche="master")
        self.refuse("git merge features/melvyn/sujet", branche="develop")
        self.refuse("git rebase develop", branche="master")

    def test_operations_courantes_autorisees(self) -> None:
        self.autorise("git status")
        self.autorise("git log --oneline -5 && git diff --stat")
        self.autorise("git switch develop")
        self.autorise("git checkout -b features/melvyn/nouveau")
        self.autorise("git stash list")
        self.autorise("git stash pop")
        self.autorise("git restore --staged data/api.py")
        self.autorise("git commit -m 'Data quality: add freshness.'")
        self.autorise("git merge develop")
        self.autorise("git branch -d features/melvyn/vieux")
        self.autorise("git fetch --quiet")

    def test_les_commandes_enchainees_sont_toutes_inspectees(self) -> None:
        self.refuse("git status; git push --force")
        self.refuse("git add -A && git commit -m x && git push origin develop")

    def test_powershell_meme_regles(self) -> None:
        self.refuse("git push --force; Write-Host ok")

    def test_lire_la_config_git_est_autorise_l_ecrire_hors_local_est_refuse(self) -> None:
        # Faux positif du 09/09/2026 : `git config --get core.hooksPath` est une lecture.
        self.autorise("git config --get core.hooksPath")
        self.autorise("git config --list --show-origin")
        self.autorise("git config -l")
        self.autorise("git config --get-regexp remote")
        self.autorise("git config --global --get user.name")
        self.refuse("git config core.hooksPath .githooks")
        self.refuse("git config --unset core.hooksPath")
        self.refuse("git config --global user.name x")
        self.refuse("git config --system core.autocrlf false")


class GardePerimetreTests(unittest.TestCase):

    AUTORISEES = [
        RACINE,
        "D:/Users/mpommier.BDF-GESTION.000/.claude/projects/c--dev-Eve-EveBackEnd/memory",
        "D:/Users/mpommier.BDF-GESTION.000/AppData/Local/Temp/claude",
    ]

    def decision(self, outil: str, entree: dict) -> str | None:
        return garde_perimetre.decision(outil, entree, racine=RACINE, racines_autorisees=self.AUTORISEES)

    def test_ecrire_dans_le_projet_la_memoire_et_le_scratchpad_est_autorise(self) -> None:
        self.assertIsNone(self.decision("Write", {"file_path": "data/api.py"}))
        self.assertIsNone(self.decision("Edit", {"file_path": r"C:\dev\Eve\EveBackEnd\chantiers\x\journal.md"}))
        self.assertIsNone(self.decision("Write", {"file_path": "D:/Users/mpommier.BDF-GESTION.000/.claude/projects/c--dev-Eve-EveBackEnd/memory/x.md"}))

    def test_ecrire_hors_perimetre_est_refuse(self) -> None:
        self.assertIsNotNone(self.decision("Write", {"file_path": r"C:\dev\csdr_codex\CLAUDE.md"}))
        self.assertIsNotNone(self.decision("Edit", {"file_path": r"C:\dev\Eve\EveBackEnd-review\data\api.py"}))
        self.assertIsNotNone(self.decision("Write", {"file_path": r"C:\dev\Eve\README_WORKSPACE.md"}))
        self.assertIsNotNone(self.decision("Write", {"file_path": "D:/Users/mpommier.BDF-GESTION.000/.claude/skills/x/SKILL.md"}))

    # `NotebookEdit` est declare dans le matcher de settings.json et dans OUTILS_ECRITURE, mais il
    # n'avait aucun test (sonde du 16/09/2026) : il passe par la cle `notebook_path` et non
    # `file_path`, donc une clef oubliee dans `chemins_de_l_outil` le laisserait ecrire partout.
    def test_notebook_edit_est_borne_par_sa_cle_notebook_path(self) -> None:
        self.assertIsNotNone(self.decision("NotebookEdit", {"notebook_path": r"C:\dev\csdr_codex\x.ipynb"}))
        self.assertIsNone(self.decision("NotebookEdit", {"notebook_path": "data/x.ipynb"}))
        # Sans clef de chemin reconnue, aucun chemin n'est examine : c'est ce que le premier cas
        # attrape si `notebook_path` disparait de la liste des clefs.
        self.assertIsNone(self.decision("NotebookEdit", {"clef_inconnue": r"C:\dev\csdr_codex\x.ipynb"}))

    def test_bdfg_core_est_ouvert_en_ecriture_et_sa_frontiere_est_stricte(self) -> None:
        """Racines par defaut, donc sans injection : c'est l'ouverture du 11/09/2026 qui est verifiee ici."""
        def defaut(outil: str, entree: dict) -> str | None:
            return garde_perimetre.decision(outil, entree, racine=RACINE)

        self.assertIsNone(defaut("Write", {"file_path": r"C:\dev\bdfg-core\pyproject.toml"}))
        self.assertIsNone(defaut("Write", {"file_path": "/c/dev/bdfg-core/src/bdfg_core/mail/__init__.py"}))
        self.assertIsNone(defaut("Bash", {"command": "mkdir -p /c/dev/bdfg-core/tests"}))
        # Un voisin dont le nom commence pareil n'est pas dans le perimetre.
        self.assertIsNotNone(defaut("Write", {"file_path": r"C:\dev\bdfg-core-autre\x.py"}))
        # Les autres depots restent fermes.
        self.assertIsNotNone(defaut("Write", {"file_path": r"C:\dev\csdr_codex\CLAUDE.md"}))
        self.assertIsNotNone(defaut("Bash", {"command": "rm -rf /c/dev/Eve/Modop"}))

    def test_bash_qui_ecrit_hors_perimetre_est_refuse_mais_la_lecture_passe(self) -> None:
        self.assertIsNotNone(self.decision("Bash", {"command": "echo x > C:/dev/maos/CLAUDE.md"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "cp .claude/rules/git.md /c/dev/csdr_codex/.claude/rules/"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "rm -rf /c/dev/Eve/Modop"}))
        self.assertIsNone(self.decision("Bash", {"command": "cat /c/dev/csdr_codex/CLAUDE.md"}))
        self.assertIsNone(self.decision("Bash", {"command": "cp -r /c/dev/csdr_codex/.claude/skills/graphify .claude/skills/"}))

    def test_powershell_qui_ecrit_hors_perimetre_est_refuse(self) -> None:
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Set-Content -Path C:\\dev\\maos\\x.md -Value 'x'"}))
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Remove-Item C:\\dev\\Eve\\Modop -Recurse"}))
        self.assertIsNone(self.decision("PowerShell", {"command": "Get-Content C:\\dev\\maos\\CLAUDE.md"}))

    # Meme sonde du 17/09/2026, cote perimetre : un prefixe de shell suffisait a sortir du projet.
    def test_une_enveloppe_ne_cache_pas_le_verbe_au_perimetre(self) -> None:
        """La zone protegee traversait deja les enveloppes, le perimetre non : `env rm <hors>` passait."""
        for enveloppe in ("env", "timeout 5", "command", "uv run", "nice -n 5"):
            self.assertIsNotNone(self.decision("Bash", {"command": f"{enveloppe} rm C:/dev/maos/CLAUDE.md"}), enveloppe)

    def test_un_gestionnaire_de_paquets_qui_installe_nest_pas_une_copie_de_fichier(self) -> None:
        """Traverser les enveloppes a fait entrer `npm install` dans la famille des copies, parce que
        `install` est aussi une commande Unix. Un chemin hors perimetre y devenait un refus."""
        self.assertIsNone(self.decision("Bash", {"command": "npm install C:/dev/csdr_codex/pkg"}))
        # Attendu change au lot 3 (17/09/2026), seul attendu de la suite en place revu : `--prefix` designe
        # OU npm ecrit `node_modules`, donc un prefixe hors perimetre est une ecriture hors perimetre.
        # Le cas de la nuit se trompait ; `npm install <chemin hors>` (installer DEPUIS un chemin) passe.
        self.assertIsNotNone(self.decision("Bash", {"command": "npm install --prefix C:/dev/csdr_codex"}))
        self.assertIsNone(self.decision("Bash", {"command": "npm install --prefix chantiers/x/outil"}))
        self.assertIsNone(self.decision("Bash", {"command": "uv run python -m pytest"}))
        # La vraie commande Unix `install` reste un verbe de copie.
        self.assertIsNotNone(self.decision("Bash", {"command": "install -m 600 chantiers/x.md C:/dev/maos/x.md"}))

    def test_un_shell_lance_par_son_chemin_absolu_ne_contourne_pas_le_perimetre(self) -> None:
        self.assertIsNotNone(self.decision("Bash", {"command": '/bin/bash -c "rm C:/dev/maos/CLAUDE.md"'}))

    def test_un_shell_imbrique_ne_contourne_pas_le_perimetre(self) -> None:
        self.assertIsNotNone(self.decision("Bash", {"command": 'bash -c "rm C:/dev/maos/CLAUDE.md"'}))
        self.assertIsNotNone(self.decision("Bash", {"command": "sh -c 'rm -rf /c/dev/Eve/Modop'"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "cmd /c del C:/dev/maos/x.md"}))
        self.assertIsNotNone(self.decision("Bash", {"command": 'pwsh -NoProfile -Command "Remove-Item C:/dev/maos/x.md"'}))

    def test_un_shell_imbrique_qui_lit_ou_qui_ecrit_dans_le_projet_passe(self) -> None:
        """Le redecoupage rend au verrou le jugement qu'il porte deja sur une commande directe :
        une lecture reste une lecture, et une ecriture dans le projet reste autorisee. Le cas des
        guillemets echappes est la parce qu'une premiere forme du correctif refusait sur la barre
        oblique inverse seule, lue comme la racine du lecteur."""
        self.assertIsNone(self.decision("Bash", {"command": 'bash -c "cat C:/dev/maos/CLAUDE.md"'}))
        self.assertIsNone(self.decision("Bash", {"command": 'bash -c "ls -la C:/dev/maos"'}))
        self.assertIsNone(self.decision("Bash", {"command": 'bash -c "rm chantiers/x/tmp.md"'}))
        self.assertIsNone(self.decision("Bash", {"command": 'bash -c "rm \\"chantiers/x/tmp.md\\""'}))

    def test_une_copie_depuis_lexterieur_vers_le_projet_reste_une_lecture(self) -> None:
        """`-Path` designe la SOURCE de `Copy-Item`. La confondre avec la destination refusait de
        recopier un fichier de reference dans le projet, qui est le geste legitime."""
        self.assertIsNone(self.decision("PowerShell", {"command": "Copy-Item -Path C:/dev/maos/x.md -Destination chantiers/x.md"}))
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Copy-Item -Path chantiers/x.md -Destination C:/dev/maos/x.md"}))

    def test_un_deplacement_depuis_lexterieur_reste_refuse(self) -> None:
        """Un deplacement detruit sa source : elle compte autant que sa destination, alors qu'une
        copie la laisse intacte. Ne pas faire la difference laissait sortir un fichier du perimetre."""
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Move-Item -Path C:/dev/maos/x.md -Destination chantiers/x.md"}))
        self.assertIsNotNone(self.decision("PowerShell", {"command": "Move-Item -LiteralPath C:/dev/maos/x.md -Destination chantiers/x.md"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "mv C:/dev/maos/x.md chantiers/x.md"}))

    def test_un_script_inline_est_juge_sur_ses_chemins_absolus_seulement(self) -> None:
        """Les sequences d'echappement et les chemins relatifs d'un script ne sont pas des sorties du perimetre."""
        self.assertIsNone(self.decision("Bash", {"command": "python -c \"open('x.txt', 'w').write('a\\\\u2014b')\""}))
        self.assertIsNone(self.decision("Bash", {"command": "python - <<'EOF'\np = Path('.claude/hooks/x.py')\np.write_text(s.replace(c, '\\\\u2014'))\nEOF"}))
        self.assertIsNotNone(self.decision("Bash", {"command": "python -c \"open('C:/dev/maos/x.txt', 'w').write('a')\""}))
        self.assertIsNotNone(self.decision("Bash", {"command": "python -c \"open('/c/dev/Eve/Modop/x.txt', 'w').write('a')\""}))


# La zone protegee en ecriture. Motif : `C:\dev\maos\CLAUDE.md` section 5, « Any write to `.env*`,
# secrets files, keystores » derriere un clic humain. EVE n'a pas de clic humain dans un hook, donc
# la traduction est le refus, et le recours est la main de Melvyn dans VS Code.
#
# Toutes les cibles de ces tests sont DANS le perimetre : hors perimetre elles seraient deja refusees
# aujourd'hui, et le test serait vert avant le correctif sans rien prouver.
class ZoneProtegeeEnEcritureTests(unittest.TestCase):

    AUTORISEES = GardePerimetreTests.AUTORISEES

    def decision(self, outil: str, entree: dict) -> str | None:
        return garde_perimetre.decision(outil, entree, racine=RACINE, racines_autorisees=self.AUTORISEES)

    def refuse(self, outil: str, entree: dict) -> None:
        """Un refus de zone protegee se reconnait a son message : `assertIsNotNone` seul serait vert
        le jour ou le refus viendrait du perimetre, pour un fichier qui est pourtant dans le perimetre."""
        message = self.decision(outil, entree)
        self.assertIsNotNone(message, f"{outil} {entree} devrait etre refuse")
        self.assertIn("zone protegee", message, message)

    def test_les_quatre_outils_decriture_sont_refuses_sur_un_env(self) -> None:
        self.refuse("Write", {"file_path": ".env"})
        self.refuse("Edit", {"file_path": "C:/dev/Eve/EveBackEnd/.env.dev1"})
        self.refuse("MultiEdit", {"file_path": ".env.local"})
        self.refuse("NotebookEdit", {"notebook_path": ".env"})

    def test_un_env_hors_perimetre_est_refuse_comme_zone_protegee_et_non_comme_perimetre(self) -> None:
        """Dire « hors perimetre » laisserait croire qu'il suffit de le deplacer dans le projet."""
        self.refuse("Write", {"file_path": "C:/dev/maos/.env"})

    def test_la_redirection_shell_est_refusee(self) -> None:
        self.refuse("Bash", {"command": "echo DB_CONFIG=x > .env"})
        self.refuse("Bash", {"command": "echo x >> .env.dev1"})

    def test_les_verbes_qui_ecrivent_sont_refuses(self) -> None:
        self.refuse("Bash", {"command": "echo x | tee .env"})
        self.refuse("Bash", {"command": "touch .env.bak"})
        self.refuse("Bash", {"command": "truncate -s 0 .env"})

    def test_les_verbes_qui_detruisent_sont_refuses(self) -> None:
        """Un .env n'est pas suivi par git : sa suppression est aussi irreparable que sa reecriture."""
        self.refuse("Bash", {"command": "rm .env"})
        self.refuse("Bash", {"command": "rm -f .env.dev1"})
        self.refuse("PowerShell", {"command": "Remove-Item .env"})

    def test_un_deplacement_detruit_sa_source_donc_il_est_refuse(self) -> None:
        self.refuse("Bash", {"command": "mv .env chantiers/sauvegarde"})
        self.refuse("PowerShell", {"command": "Move-Item .env chantiers/sauvegarde"})

    def test_une_copie_vers_un_env_est_refusee_mais_une_copie_depuis_un_env_passe(self) -> None:
        """Copier `.env` ailleurs est une lecture, et la lecture reste ouverte (`donnees.md`).
        Cote PowerShell, `-Path` designe la SOURCE de `Copy-Item` : le confondre avec la destination
        refusait la sauvegarde avant edition, qui est justement le geste legitime."""
        self.refuse("Bash", {"command": "cp .env.example .env"})
        self.refuse("PowerShell", {"command": "Copy-Item -Path modele.txt -Destination .env"})
        self.assertIsNone(self.decision("Bash", {"command": "cp .env chantiers/sauvegarde-env.txt"}))
        self.assertIsNone(self.decision("PowerShell", {"command": "Copy-Item -Path .env -Destination chantiers/sauvegarde.txt"}))

    def test_powershell_qui_ecrit_un_env_est_refuse(self) -> None:
        self.refuse("PowerShell", {"command": "Set-Content -Path .env -Value 'x'"})
        self.refuse("PowerShell", {"command": "'x' | Out-File .env.dev1"})

    def test_ledition_en_place_est_refusee_sous_toutes_ses_formes(self) -> None:
        """La forme longue echappait encore apres le premier correctif (verification du 16/09)."""
        self.refuse("Bash", {"command": "sed -i s/sqlite/mssql/ .env"})
        self.refuse("Bash", {"command": "sed -i.bak s/sqlite/mssql/ .env"})
        self.refuse("Bash", {"command": "sed --in-place s/sqlite/mssql/ .env"})
        self.refuse("Bash", {"command": "awk -i inplace '{print}' .env"})

    def test_une_enveloppe_ne_cache_pas_le_verbe_qui_detruit(self) -> None:
        """`premier_mot` ne saute que quatre enveloppes : `timeout 5 rm .env` lui rend `timeout`."""
        self.refuse("Bash", {"command": "sudo rm .env"})
        self.refuse("Bash", {"command": "env rm .env"})
        self.refuse("Bash", {"command": "timeout 5 rm .env"})
        self.refuse("Bash", {"command": "nice -n 5 rm .env"})
        self.refuse("Bash", {"command": "stdbuf -o0 rm .env"})

    def test_chercher_le_mot_dun_verbe_dans_un_env_reste_une_lecture(self) -> None:
        """Le garde-fou de la traversee d'enveloppes : un verbe qui n'est pas en position de
        programme n'en est pas un. Sans cela, `grep rm .env` serait lu comme une suppression.
        Les formes avec option numerique sont la parce qu'une premiere version du garde-fou
        rouvrait la position derriere n'importe quel chiffre, pas seulement derriere une enveloppe."""
        self.assertIsNone(self.decision("Bash", {"command": "grep rm .env"}))
        self.assertIsNone(self.decision("Bash", {"command": "grep tee .env.dev1"}))
        self.assertIsNone(self.decision("Bash", {"command": "grep -m 1 rm .env"}))
        self.assertIsNone(self.decision("Bash", {"command": "grep -A 2 tee .env"}))

    def test_un_lanceur_du_poste_ne_cache_pas_linterpreteur(self) -> None:
        self.refuse("Bash", {"command": "uv run python -c \"open('.env','w')\""})
        self.refuse("Bash", {"command": "git rm .env"})

    def test_un_appel_dotnet_qui_ecrit_depuis_loutil_powershell_est_refuse(self) -> None:
        """L'outil `PowerShell` est lui meme un interpreteur : son texte n'a pas de verbe en tete.
        Les deux conventions d'appel sont couvertes, l'instance et la statique."""
        self.refuse("PowerShell", {"command": "[IO.File]::WriteAllText('.env', $t)"})
        self.refuse("PowerShell", {"command": "(Get-Item '.env').Delete()"})
        self.refuse("PowerShell", {"command": "[IO.File]::Delete('.env')"})
        self.refuse("PowerShell", {"command": "[IO.File]::Move('.env', 'x')"})
        self.refuse("PowerShell", {"command": "[IO.File]::AppendAllText('.env.dev1', $t)"})

    def test_les_indices_dotnet_ne_valent_que_pour_loutil_powershell(self) -> None:
        """Les appliquer a toute commande shell refusait une lecture : `grep '.delete' .env`."""
        self.assertIsNone(self.decision("Bash", {"command": "grep '.delete' .env"}))
        self.assertIsNone(self.decision("PowerShell", {"command": "(Get-Item '.env').CopyTo('chantiers/x.txt')"}))

    def test_un_shell_imbrique_ne_contourne_pas_le_verrou(self) -> None:
        """`bash -c "rm .env"` arrive en UN token : aucun jeu de verbes ne le voit, il faut le motif."""
        self.refuse("Bash", {"command": 'bash -c "rm .env"'})
        self.refuse("Bash", {"command": "sh -c 'rm -f .env.dev1'"})
        self.refuse("Bash", {"command": "cmd.exe /c del .env"})

    def test_les_programmes_qui_ecrivent_sans_etre_des_verbes_de_fichier_sont_refuses(self) -> None:
        self.refuse("Bash", {"command": "curl -o .env https://exemple/x"})
        self.refuse("Bash", {"command": "wget -O .env https://exemple/x"})
        self.refuse("Bash", {"command": "tar -xf archive.tar .env"})

    def test_find_est_refuse_quand_il_supprime_ou_lance_un_verbe_et_autorise_quand_il_cherche(self) -> None:
        self.refuse("Bash", {"command": "find . -name .env -delete"})
        self.refuse("Bash", {"command": "find . -name .env -exec rm {} ;"})
        self.refuse("Bash", {"command": "find chantiers -name .env.bak -exec truncate -s 0 {} +"})
        self.assertIsNone(self.decision("Bash", {"command": "find . -name .env"}))

    def test_les_formes_option_egale_valeur_et_les_verbes_rares_sont_refuses(self) -> None:
        self.refuse("Bash", {"command": "dd if=/dev/zero of=.env"})
        self.refuse("Bash", {"command": "patch .env correctif.diff"})

    def test_un_interpreteur_qui_ecrit_un_env_est_refuse_script_inline_ou_script_du_depot(self) -> None:
        """Le nom du fichier est a l'interieur d'un token, jamais un token : il faut le motif ancre."""
        self.refuse("Bash", {"command": "python -c \"open('.env', 'w').write('x')\""})
        self.refuse("Bash", {"command": "python -c \"Path('.env.dev1').write_text(s)\""})
        self.refuse("Bash", {"command": "python .claude/hooks/nettoyer_caracteres.py .env --appliquer"})

    def test_la_casse_ne_contourne_pas_le_verrou(self) -> None:
        """NTFS est insensible a la casse : `.ENV` ecrit bien `.env`."""
        self.refuse("Bash", {"command": "echo x > .ENV"})
        self.refuse("Write", {"file_path": ".Env.DEV1"})

    def test_ce_qui_ressemble_a_un_env_sans_en_etre_un_passe(self) -> None:
        """Le motif est ancre : `os.environ`, `config.env` et `.venv` ne sont pas des `.env`."""
        self.assertIsNone(self.decision("Bash", {"command": "python -c \"import os; print(os.environ.get('TEMP'))\""}))
        self.assertIsNone(self.decision("Bash", {"command": "python -c \"open('config.env', 'w').write('x')\""}))
        self.assertIsNone(self.decision("Bash", {"command": "./.venv/Scripts/python.exe .claude/hooks/doctor.py"}))
        self.assertIsNone(self.decision("Write", {"file_path": "chantiers/x/environnement.md"}))

    def test_le_faux_positif_assume_sur_un_nom_voisin_est_bien_la(self) -> None:
        """Un fichier cache dont le nom commence par `.env` est refuse, et c'est voulu : le
        contournement est de le renommer. Ce cas existe pour que le cout soit visible, pas cache."""
        self.refuse("Write", {"file_path": "chantiers/x/.environnement.md"})

    def test_la_lecture_reste_ouverte(self) -> None:
        """Cas de non regression, verts avant le correctif et dits tels : `Read` n'est ni dans
        `OUTILS_ECRITURE` ni dans le matcher de `settings.json`, et `cat` n'est dans aucun jeu de
        verbes. La vraie preuve que la lecture de `.env` est voulue est dans `GardeDonneesTests`."""
        self.assertIsNone(self.decision("Read", {"file_path": ".env"}))
        self.assertIsNone(self.decision("Bash", {"command": "cat .env"}))
        self.assertIsNone(self.decision("Bash", {"command": "grep DB_CONFIG .env"}))
        self.assertIsNone(self.decision("Bash", {"command": "ls -la .env"}))
        self.assertIsNone(self.decision("PowerShell", {"command": "Get-Content .env"}))


# Un sous agent se reconnait a `agent_id` dans l'entree du hook : constate sur ce poste le
# 16/09/2026 par un releve, un meme `Glob` lance depuis le fil puis depuis un sous agent, les deux
# entrees ne differant que par `agent_id` et `agent_type`. La barriere est mecanique ici, et
# doublee par une clause de la fiche : un test qui fabrique lui-meme son entree resterait vert le
# jour ou le harnais renommerait le champ.
# `.claude/` est exclu du depot : git ne voit ni une fiche d'agent supprimee, ni un hook declare
# dont le script a disparu. Ce dernier cas bloque tous les appels de son matcher, parce qu'un script
# absent fait sortir python en code 2 et qu'un PreToolUse en code 2 refuse l'appel (constate le
# 16/09/2026). `doctor` est le seul endroit ou ces deux etats peuvent se voir.
class DoctorControlesDuDispositifTests(unittest.TestCase):

    def test_une_fiche_sans_ligne_au_registre_est_signalee(self) -> None:
        fiches = ["chercheur-eve", "developpeur-eve"]
        registre = "| `chercheur-eve` | maos | faits sources |"
        self.assertEqual(["developpeur-eve"], doctor.fiches_sans_registre(fiches, registre))

    def test_toutes_les_fiches_inscrites_ne_remontent_rien(self) -> None:
        fiches = ["chercheur-eve", "developpeur-eve"]
        registre = "| `chercheur-eve` | x |\n| `developpeur-eve` | y |"
        self.assertEqual([], doctor.fiches_sans_registre(fiches, registre))

    def test_un_hook_declare_dont_le_script_a_disparu_est_signale(self) -> None:
        declares = ["$CLAUDE_PROJECT_DIR/.claude/hooks/garde_git.py",
                    "$CLAUDE_PROJECT_DIR/.claude/hooks/sonde_disparue.py"]
        presents = {"garde_git.py", "doctor.py"}
        self.assertEqual(["sonde_disparue.py"], doctor.hooks_declares_absents(declares, presents))

    def test_les_deux_controles_sont_branches_dans_verifications(self) -> None:
        """Sans ce cas, les deux fonctions pourraient etre livrees sans etre appelees."""
        ok, alertes, _ = doctor.verifications()
        lignes = ok + alertes
        self.assertTrue(any("fiches d'agents" in ligne for ligne in lignes), lignes)
        self.assertTrue(any("scripts declares" in ligne for ligne in lignes), lignes)


class GardeGitSousAgentTests(unittest.TestCase):

    def entree(self, commande: str, agent: bool) -> dict:
        e = {"tool_name": "Bash", "tool_input": {"command": commande}, "cwd": RACINE}
        if agent:
            e["agent_id"] = "a1b2c3"
            e["agent_type"] = "developpeur-eve"
        return e

    def test_un_sous_agent_ne_peut_pas_commiter_meme_sur_une_branche_personnelle(self) -> None:
        motif = garde_git.decision_depuis_entree(self.entree("git commit -m x", agent=True))
        self.assertIsNotNone(motif)
        self.assertIn("sous agent", motif)

    def test_un_sous_agent_ne_peut_pas_pousser(self) -> None:
        self.assertIsNotNone(garde_git.decision_depuis_entree(self.entree("git push", agent=True)))

    def test_le_fil_principal_committe_toujours_sur_une_branche_personnelle(self) -> None:
        """Non regression : le correctif ne doit pas bloquer Melvyn le jour ou Edmond attend."""
        self.assertIsNone(garde_git.decision_depuis_entree(self.entree("git commit -m x", agent=False)))

    def test_un_sous_agent_peut_toujours_lire_l_historique(self) -> None:
        self.assertIsNone(garde_git.decision_depuis_entree(self.entree("git log --oneline -1", agent=True)))


class VerifStyleTests(unittest.TestCase):

    def problemes(self, contenu: str, chemin: str = "data/x.py", base: str | None = None) -> list[str]:
        return verif_style.analyser(contenu, chemin, contenu_base=base)

    def test_un_fichier_propre_ne_remonte_rien(self) -> None:
        self.assertEqual([], self.problemes("def f(x: int) -> int:\n    return x\n"))

    def test_tirets_typographiques_et_guillemets_courbes_sont_signales(self) -> None:
        self.assertTrue(any("cadratin" in p for p in self.problemes("x = 1  # a \u2014 b\n")))
        self.assertTrue(any("demi-cadratin" in p for p in self.problemes("x = 1  # 2020\u20132021\n")))
        self.assertTrue(any("guillemet" in p for p in self.problemes("s = \u201cx\u201d\n")))

    def test_caracteres_invisibles_bom_et_emojis_sont_signales(self) -> None:
        self.assertTrue(any("invisible" in p for p in self.problemes("x = 1\u200b\n")))
        self.assertTrue(any("BOM" in p for p in self.problemes("\ufeffx = 1\n")))
        self.assertTrue(any("emoji" in p for p in self.problemes("# \U0001F680 go\nx = 1\n")))

    def test_les_emojis_sont_toleres_dans_documentation_existante(self) -> None:
        self.assertEqual([], self.problemes("# \U0001F4DA Titre\n\nTexte.\n", chemin="documentation/INDEX.md"))

    def test_fins_de_ligne_melangees_et_changement_de_style_sont_signales(self) -> None:
        self.assertTrue(any("fins de ligne" in p for p in self.problemes("a = 1\r\nb = 2\n")))
        self.assertTrue(any("CRLF" in p for p in self.problemes("a = 1\nb = 2\n", base="a = 1\r\nb = 2\r\n")))
        self.assertEqual([], self.problemes("a = 1\r\nb = 2\r\n", base="a = 1\r\n"))

    def test_espaces_en_fin_de_ligne_tabulations_et_absence_de_saut_final_sont_signales(self) -> None:
        self.assertTrue(any("fin de ligne" in p for p in self.problemes("x = 1   \n")))
        self.assertTrue(any("tabulation" in p for p in self.problemes("def f():\n\treturn 1\n")))
        self.assertTrue(any("saut de ligne final" in p for p in self.problemes("x = 1")))

    def test_formules_de_remplissage_et_substituts_sont_signales(self) -> None:
        self.assertTrue(any("remplissage" in p for p in self.problemes("# Certainly! Let's implement this.\nx = 1\n")))
        self.assertTrue(any("remplissage" in p for p in self.problemes("# In today's fast-paced world, dates matter.\nx = 1\n")))
        self.assertTrue(any("remplissage" in p for p in self.problemes("It's worth noting that this works.\n", chemin="chantiers/x/design.md")))
        self.assertTrue(any("substitut" in p for p in self.problemes("x = 1  # TBD\n")))
        self.assertTrue(any("substitut" in p for p in self.problemes("Lorem ipsum dolor.\n", chemin="chantiers/x/design.md")))

    def test_un_marqueur_de_travail_non_termine_ajoute_est_signale(self) -> None:
        self.assertTrue(any("marqueur" in p for p in self.problemes("def f():\n    pass  # TODO: implement\n")))
        self.assertTrue(any("marqueur" in p for p in self.problemes("x = 1  # FIXME handle nulls\n")))
        # Le depot contient des TODO legitimes : un TODO deja present dans la base n'est pas reproche.
        self.assertEqual([], self.problemes("x = 1  # TODO handle nulls\n", base="x = 1  # TODO handle nulls\n"))

    def test_un_defaut_deja_present_dans_la_base_nest_pas_signale(self) -> None:
        # Cas reel du 09/09/2026 : data/functions.py n'a jamais eu de saut de ligne final.
        self.assertEqual([], self.problemes("x = 1\ny = 2", base="x = 1"))
        self.assertEqual([], self.problemes("a = 1\r\nb = 2\nc = 3\r\n", base="a = 1\r\nb = 2\n"))
        self.assertEqual([], self.problemes("\ufeffx = 1\ny = 2\n", base="\ufeffx = 1\n"))
        # Mais un defaut nouveau sur un fichier qui en avait deja est signale.
        self.assertTrue(any("saut de ligne final" in p for p in self.problemes("x = 1", base="x = 1\n")))

    def test_analyser_detaille_separe_les_defauts_introduits_des_preexistants(self) -> None:
        contenu = "x = 1  # a \u2014 b\ny = 2  # c \u2014 d"
        nouveaux, preexistants = verif_style.analyser_detaille(contenu, "data/x.py", contenu_base="x = 1  # a \u2014 b")
        self.assertTrue(any("cadratin" in p for p in nouveaux))
        self.assertFalse(any("saut de ligne final" in p for p in nouveaux))
        self.assertTrue(any("saut de ligne final" in p for p in preexistants))

    def test_la_version_de_base_a_les_fins_de_ligne_de_l_arbre_de_travail(self) -> None:
        # Avec core.autocrlf, le blob git est en LF et l'arbre de travail en CRLF : la base doit etre
        # lue telle que git la restituerait sur le disque, sinon tout fichier du depot semble change.
        racine = Path(RACINE)
        fichier = racine / "data" / "functions.py"
        base = verif_style._version_de_base(fichier, racine)
        self.assertIsNotNone(base)
        assert base is not None
        contenu = fichier.read_bytes().decode("utf-8")
        self.assertEqual(verif_style._style_fins_de_ligne(contenu), verif_style._style_fins_de_ligne(base))

    def test_les_skills_vendus_et_les_migrations_ne_sont_pas_analyses(self) -> None:
        self.assertEqual([], self.problemes("a \u2014 b\n", chemin=".claude/skills/explain-diff/SKILL.md"))
        self.assertEqual([], self.problemes("a \u2014 b\n", chemin="data/migrations/0025_x.py"))

    # Un rapport d'agent se depose tel quel, et une fixture porte volontairement le motif qu'elle
    # pose a l'agent : les analyser reviendrait a les reecrire, donc a ne plus prouver ce qu'ils
    # prouvent. Meme motif que `.claude/hooks/tests/`, deja ignore pour ses propres fixtures.
    def test_les_rapports_d_agents_et_les_fixtures_de_chantier_ne_sont_pas_analyses(self) -> None:
        self.assertEqual([], self.problemes("a \u2014 b\n", chemin="chantiers/2026-09-15-x/agents/r.md"))
        self.assertEqual([], self.problemes("a \u2014 b\n", chemin="chantiers/2026-09-15-x/fixtures/rouge.md"))

    # Caracteres caches (demande de Melvyn du 09/09/2026) : toute famille Unicode qui ne se voit pas
    # a l'ecran, ou qui imite une lettre latine. Les codes sont donnes par chr() pour rester lisibles
    # et parce que les sequences d'echappement sont alterees par l'outil d'edition.
    def test_chaque_famille_de_caractere_cache_est_signalee(self) -> None:
        cas = {
            "invisible": "x = 1" + chr(0x200B) + "\n",            # espace de largeur nulle (Cf)
            "invisible ": "x = 1" + chr(0xE0041) + "\n",          # caractere tag (Cf, dissimulation de texte)
            "espace non standard": "x" + chr(0x00A0) + "= 1\n",   # espace insecable (Zs)
            "espace non standard ": "x" + chr(0x2009) + "= 1\n",  # espace fine (Zs)
            "separateur": "x = 1" + chr(0x2028) + "y = 2\n",      # separateur de ligne (Zl)
            "controle": "x = 1" + chr(0x07) + "\n",               # BEL (Cc)
            "usage prive": "x = 1  # " + chr(0xE000) + "\n",      # zone a usage prive (Co)
            "selecteur de variante": "x = 1" + chr(0xFE0F) + "\n",
            "combinant": "e" + chr(0x0301) + "te = 1\n",          # e + accent aigu combinant, forme NFD
            "homoglyphe": "d" + chr(0x0430) + "ta = 1\n",         # a cyrillique dans un mot latin
        }
        for attendu, contenu in cas.items():
            with self.subTest(attendu=attendu):
                self.assertTrue(any(attendu.strip() in p for p in self.problemes(contenu)), self.problemes(contenu))

    def test_le_message_donne_le_point_de_code_et_la_ligne(self) -> None:
        problemes = self.problemes("a = 1\nb = 2" + chr(0x200B) + "\n")
        self.assertTrue(any("U+200B" in p and "[2]" in p for p in problemes), problemes)

    def test_les_sequences_emoji_de_la_documentation_sont_tolerees(self) -> None:
        avertissement = "# " + chr(0x26A0) + chr(0xFE0F) + " Titre\n\nTexte.\n"
        self.assertEqual([], self.problemes(avertissement, chemin="documentation/INDEX.md"))
        personne = "# " + chr(0x1F468) + chr(0x200D) + chr(0x1F4BB) + " Dev\n"
        self.assertEqual([], self.problemes(personne, chemin="documentation/INDEX.md"))
        # Hors documentation, le selecteur et le joint restent des caracteres caches.
        self.assertTrue(self.problemes(avertissement, chemin="data/x.py"))

    def test_une_lettre_grecque_isolee_nest_pas_un_homoglyphe(self) -> None:
        self.assertFalse(any("homoglyphe" in p for p in self.problemes("alpha = " + chr(0x03B1) + "\n", chemin="chantiers/x/design.md")))

    def test_un_caractere_cache_deja_dans_la_base_nest_pas_reproche(self) -> None:
        contenu = "x" + chr(0x00A0) + "= 1\ny = 2\n"
        self.assertEqual([], self.problemes(contenu, base="x" + chr(0x00A0) + "= 1\n"))
        self.assertTrue(self.problemes(contenu + "z" + chr(0x00A0) + "= 3\n", base="x" + chr(0x00A0) + "= 1\n"))


class NettoyeurTests(unittest.TestCase):

    def test_le_nettoyage_retire_les_caches_et_garde_les_fins_de_ligne(self) -> None:
        import nettoyer_caracteres
        sale = "x = 1" + chr(0x200B) + "\r\ny" + chr(0x00A0) + "= 2\r\nd" + chr(0x0430) + "ta = 3\r\ne" + chr(0x0301) + "t\r\n"
        propre, journal = nettoyer_caracteres.nettoyer(sale, emojis_toleres=False)
        self.assertEqual("x = 1\r\ny = 2\r\ndata = 3\r\n" + chr(0x00E9) + "t\r\n", propre)
        self.assertTrue(journal)
        self.assertEqual([], verif_style.analyser(propre, "data/x.py"))

    def test_un_texte_propre_est_rendu_identique(self) -> None:
        import nettoyer_caracteres
        texte = "def f(x: int) -> int:\r\n    return x\r\n"
        self.assertEqual((texte, []), nettoyer_caracteres.nettoyer(texte, emojis_toleres=False))

    def test_un_homoglyphe_sans_equivalent_est_signale_non_corrige(self) -> None:
        import nettoyer_caracteres
        propre, journal = nettoyer_caracteres.nettoyer("a" + chr(0x0436) + "b\n", emojis_toleres=False)
        self.assertIn(chr(0x0436), propre)
        self.assertTrue(any("non corrige" in j for j in journal), journal)

    def test_le_bom_est_retire(self) -> None:
        import nettoyer_caracteres
        propre, _ = nettoyer_caracteres.nettoyer(chr(0xFEFF) + "x = 1\n", emojis_toleres=False)
        self.assertEqual("x = 1\n", propre)


# Le corpus de contrat et les tests des deux modules d'analyse tournent dans la meme suite : une seule
# commande (`doctor --complet`, `/verif-setup`) joue tout le dispositif. Lot 3, 17/09/2026.
from test_commande import (  # noqa: E402, F401
    DocumentsEnLigneTests, DotNetTests, EnveloppesTests, InterfaceTests, InterpretesTests, ModesDechecTests,
    SeparateursEtRedirectionsTests, ShellsImbriquesTests, SubstitutionsTests, TokensTests, TubesFindEtCdTests,
)
from test_contrat import ContratTests  # noqa: E402, F401
from test_effets import (  # noqa: E402, F401
    FamillesQuiEcriventTests, FindEtGitTests, LecteursMetadonneesEtInconnusTests, RepertoireEtResidusTests,
)
from test_effets import InterpretesTests as EffetsInterpretesTests  # noqa: E402, F401


if __name__ == "__main__":
    unittest.main()
