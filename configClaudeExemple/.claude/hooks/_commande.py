"""
De la ligne de commande aux invocations : le seul analyseur de commande des verrous.

`analyser(commande, outil)` rend une `Analyse` : les `Invocation` que la commande lance (programme
canonique, arguments dequotes, redirections, enveloppes traversees, profondeur, cibles venues d'un
tube, repertoire courant, code d'un interprete) et, si la commande ne peut pas etre jugee, un `opaque`
qui dit pourquoi. Jamais d'exception vers l'appelant, jamais de disque, jamais de repli silencieux : la
version precedente retombait sur `commande.split()` quand `shlex` echouait, et fabriquait des cibles.

Le scanner est ecrit a la main, caractere par caractere, parce qu'aucun mode de `shlex` ne tient le
contrat (mesure du 17/09/2026 : le mode non POSIX echoue sur une quote ouverte au milieu d'un token et
sur une here-string PowerShell ; le mode POSIX echoue sur un heredoc a apostrophe et efface les
antislashs d'un chemin Windows, qui devient relatif donc dans le projet).

Trois regles qui commandent tout. Un mot n'est un programme qu'en **position de programme** (en tete,
apres une enveloppe ou un mot cle du shell, apres `xargs`, apres `find -exec`). Le corps d'un document
en ligne est du **texte**, sauf s'il alimente un shell ou un interprete. Et **ce qui n'est connu qu'a
l'execution est marque** (`MARQUE_INCONNU` : substitution, groupe PowerShell, here-string) : les verrous
refusent une marque en position sensible plutot que de deviner. Table des programmes : `_programmes.py`.
Spec : `chantiers/2026-09-15-mini-entreprise-agents/design-lot-3.md` ; decision `_decisions/0011`.
"""
import re
from typing import NamedTuple

import _programmes as P

# Un morceau de token dont la valeur n'est connue qu'a l'execution (substitution, groupe, here-string).
MARQUE_INCONNU = "\ufffc"
# Une substitution de processus bash (`<(cmd)`, `>(cmd)`) : un tube, jamais un fichier. Sa commande interne
# est analysee comme les autres ; le token, lui, n'est la cible de rien.
MARQUE_TUBE = "\ufffb"
_PROFONDEUR_MAX = 1


class Invocation(NamedTuple):
    programme: str
    args: tuple[str, ...]
    redirections: tuple[tuple[str, str], ...]
    enveloppes: tuple[str, ...]
    profondeur: int
    amont: tuple[str, ...]
    repertoire: str | None
    code: str | None
    texte: str
    powershell: bool = False
    affectations: tuple[str, ...] = ()


class Analyse(NamedTuple):
    invocations: tuple[Invocation, ...]
    opaque: str | None


class _Phrase:
    """Une sous-commande brute : tokens dequotes, redirections, ce qui l'alimente, ses substitutions."""

    def __init__(self, tube_avant: bool) -> None:
        self.tokens: list[str] = []
        self.redirections: list[tuple[str, str]] = []
        self.tube_avant = tube_avant
        self.document: str | None = None
        self.document_expanse = False  # tag nu : le shell substitue dans le corps
        self.substitutions: list[str] = []
        self.blocs: list[str] = []  # blocs `{ ... }` PowerShell : des commandes internes
        self.debut = 0
        self.texte = ""


class _Opaque(Exception):
    pass


_MOTIF_AFFECTATION = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")
_MOTIF_AFFECTATION_PS = re.compile(r"^\$[A-Za-z_:][A-Za-z0-9_:]*(=|\+=|-=)(.*)$", re.DOTALL)
_MOTIF_NOMBRE = re.compile(r"^[0-9]+(\.[0-9]+)?[smhd]?$")
_MOTIF_APPEL_SCRIPT = re.compile(P.MOTIF_APPEL_SCRIPT, re.DOTALL)
_MOTIF_LITTERAL = re.compile(r"""'([^']*)'|"((?:[^"\\]|\\.)*)"|`([^`]*)`""")
_MOTIF_SUBSTITUTION_DANS_TEXTE = re.compile(r"\$\(((?:[^()]|\([^()]*\))*)\)|`([^`]*)`")
_MOTIF_PARAMETRE = re.compile(r"^\$([0-9])$")
_ECHAPPABLES_BASH = set(";&|<>(){}\"'$` \\\n\t#*?[]~")


def canon(nom: str) -> str:
    """Le nom canonique d'un programme : base, minuscules, sans `.exe` ; `g\\it` est `git` (l'antislash
    d'un mot qui n'est pas un chemin est un echappement bash)."""
    brut = nom
    if "\\" in brut and "/" not in brut and not re.match(r"^[A-Za-z]:", brut) and not brut.startswith("\\\\"):
        brut = brut.replace("\\", "")
    base = brut.replace("\\", "/").rsplit("/", 1)[-1].lower()
    base = base[:-4] if base.endswith(".exe") else base
    return "git" if base == "hub" else base  # `hub` est git avec des sous-commandes GitHub en plus


def _regle(programme: str) -> P.Regle | None:
    return P.PROGRAMMES.get(programme)


# --------------------------------------------------------------------------- le scanner



def _lire_quote_ansi_c(texte: str, depart: int) -> tuple[str, int]:
    """Le contenu brut d'une quote ANSI-C a partir de `depart`, et l'indice qui suit la quote fermante.

    Seul l'antislash protege la quote fermante, comme dans bash.
    """
    morceaux: list[str] = []
    i = depart
    n = len(texte)
    while i < n:
        c = texte[i]
        if c == "\\" and i + 1 < n:
            morceaux.append(texte[i:i + 2])
            i += 2
            continue
        if c == "'":
            return "".join(morceaux), i + 1
        morceaux.append(c)
        i += 1
    raise _Opaque("quote ANSI-C non fermee")


def _decoder_ansi_c(brut: str) -> str:
    """Les echappements d'une quote ANSI-C, comme bash les rend.

    Hexadecimal, octal, point de code Unicode et les echappements simples. Ce qui n'est pas reconnu
    reste tel quel, comme dans bash.
    """
    simples = {
        "a": "\a", "b": "\b", "e": "\x1b", "E": "\x1b", "f": "\f", "n": "\n",
        "r": "\r", "t": "\t", "v": "\v", "\\": "\\", "'": "'", '"': '"', "?": "?",
    }
    sortie: list[str] = []
    i = 0
    n = len(brut)
    while i < n:
        c = brut[i]
        if c != "\\" or i + 1 >= n:
            sortie.append(c)
            i += 1
            continue
        marque = brut[i + 1]
        if marque in simples:
            sortie.append(simples[marque])
            i += 2
            continue
        if marque == "x":
            chiffres = _prefixe(brut[i + 2:], 2, "0123456789abcdefABCDEF")
            if chiffres:
                sortie.append(chr(int(chiffres, 16)))
                i += 2 + len(chiffres)
                continue
        if marque in ("u", "U"):
            largeur = 4 if marque == "u" else 8
            chiffres = _prefixe(brut[i + 2:], largeur, "0123456789abcdefABCDEF")
            if chiffres:
                sortie.append(chr(int(chiffres, 16)))
                i += 2 + len(chiffres)
                continue
        if marque in "01234567":
            chiffres = _prefixe(brut[i + 1:], 3, "01234567")
            sortie.append(chr(int(chiffres, 8)))
            i += 1 + len(chiffres)
            continue
        sortie.append(c)
        i += 1
    return "".join(sortie)


def _prefixe(texte: str, largeur: int, permis: str) -> str:
    """Le plus long prefixe de `texte`, d'au plus `largeur` caracteres, tous pris dans `permis`."""
    pris = 0
    while pris < largeur and pris < len(texte) and texte[pris] in permis:
        pris += 1
    return texte[:pris]

def _scanner(texte: str, powershell: bool) -> list[_Phrase]:
    """Decoupe le texte en phrases. Leve `_Opaque` si un guillemet ou une substitution reste ouvert."""
    phrases: list[_Phrase] = []
    phrase = _Phrase(tube_avant=False)
    phrase.debut = 0
    token: list[str] = []
    token_ouvert = False
    token_entre_guillemets = False  # le token courant portait des guillemets : un tag protege ne substitue pas
    redir_en_attente: str | None = None
    # (tag, tabulations, tag entre guillemets) ; `tag is None` veut dire « pas encore lu ». Le tag
    # vide est legal en bash (`<<''`, le corps s'arrete a la premiere ligne vide), donc la chaine vide
    # ne peut pas servir de sentinelle : elle avalait le token suivant, cible de redirection comprise.
    tags_heredoc: list[tuple[str | None, bool, bool, "_Phrase"]] = []
    here_string_bash = False
    n = len(texte)
    i = 0

    def fermer_token() -> None:
        nonlocal token, token_ouvert, token_entre_guillemets, redir_en_attente, here_string_bash
        if not token_ouvert:
            return
        valeur = "".join(token)
        quote = token_entre_guillemets
        token, token_ouvert, token_entre_guillemets = [], False, False
        if tags_heredoc and tags_heredoc[-1][0] is None:
            # Les guillemets du tag sont deja retires par le decoupage : sans `quote`, un tag protege
            # passait pour un tag nu, et le corps etait analyse comme s'il etait substitue. Un antislash
            # n'importe ou dans le tag le protege aussi, et il ne fait pas partie du tag : bash lit
            # `EO\\F` comme `EOF` (verifie au shell du poste le 18/09/2026).
            tag = valeur.strip("\"'").replace("\\", "")
            entre_guillemets = quote or valeur != tag
            tags_heredoc[-1] = (tag, tags_heredoc[-1][1], entre_guillemets, tags_heredoc[-1][3])
            return
        if here_string_bash:
            phrase.document = valeur
            here_string_bash = False
            return
        if redir_en_attente is not None:
            operateur = redir_en_attente
            redir_en_attente = None
            if operateur.endswith("&") and valeur.isdigit():
                operateur, valeur = operateur[:-1], "&" + valeur
            phrase.redirections.append((operateur, valeur))
            return
        phrase.tokens.append(valeur)

    def fermer_phrase(fin: int, tube: bool) -> None:
        nonlocal phrase
        fermer_token()
        phrase.texte = texte[phrase.debut:fin].strip()
        if phrase.tokens or phrase.redirections or phrase.substitutions or phrase.blocs or phrase.document is not None:
            phrases.append(phrase)
        phrase = _Phrase(tube_avant=tube)

    def lire_groupe(depart: int, ouvrant: str, fermant: str, motif_erreur: str) -> tuple[str, int]:
        """Le texte entre `depart` et le fermant apparie (quotes respectees), et l'indice apres."""
        profondeur, j = 1, depart
        quote: str | None = None
        while j < n:
            c = texte[j]
            if quote:
                if c == quote:
                    quote = None
            elif c in "\"'":
                quote = c
            elif c == ouvrant:
                profondeur += 1
            elif c == fermant:
                profondeur -= 1
                if profondeur == 0:
                    return texte[depart:j], j + 1
            j += 1
        raise _Opaque(motif_erreur)

    def lire_substitution(depart: int) -> int:
        interne, fin = lire_groupe(depart, "(", ")", "parenthese de substitution non fermee")
        phrase.substitutions.append(interne)
        return fin

    def lire_bloc(depart: int) -> int:
        interne, fin = lire_groupe(depart, "{", "}", "accolade de bloc non fermee")
        phrase.blocs.append(interne)
        return fin

    def lire_accents_graves(depart: int) -> int:
        fin = texte.find("`", depart)
        if fin < 0:
            raise _Opaque("accent grave non ferme")
        phrase.substitutions.append(texte[depart:fin])
        return fin + 1

    def lire_document(depart: int, tag: str, tabulations: bool) -> tuple[str, int]:
        """Le corps d'un heredoc a partir de `depart` (debut de ligne) jusqu'a la ligne `tag`."""
        lignes: list[str] = []
        j = depart
        while j <= n:
            fin_ligne = texte.find("\n", j)
            ligne = texte[j:] if fin_ligne < 0 else texte[j:fin_ligne]
            candidate = ligne.lstrip("\t") if tabulations else ligne
            if candidate.rstrip("\r") == tag:
                return "\n".join(lignes), (n if fin_ligne < 0 else fin_ligne + 1)
            lignes.append(ligne)
            if fin_ligne < 0:
                break
            j = fin_ligne + 1
        # Le tag de fin n'est jamais venu : tout le reste de la ligne a ete avale en texte, donc les
        # commandes qui suivent sont invisibles. Une commande illisible se refuse, elle ne se devine pas.
        raise _Opaque("document en ligne dont le tag de fin est introuvable")

    while i < n:
        c = texte[i]
        suivant = texte[i + 1] if i + 1 < n else ""

        # --- here-string PowerShell : @' ... '@ ou @" ... "@, du texte.
        if powershell and not token_ouvert and c == "@" and suivant in "\"'" and texte[i + 2:i + 3] in ("\n", "\r", ""):
            fin_marque = "\n" + suivant + "@"
            fin = texte.find(fin_marque, i + 2)
            if fin < 0:
                raise _Opaque("here-string non fermee")
            phrase.document = texte[i + 3:fin].lstrip("\r\n")
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            i = fin + len(fin_marque)
            continue

        # --- commentaire bash : un # en debut de mot.
        if not powershell and not token_ouvert and c == "#":
            fin = texte.find("\n", i)
            i = n if fin < 0 else fin
            continue

        # --- $"..." : la quote de traduction de bash. Elle rend le mot tel quel, sans decodage,
        # et elle delimite comme une quote double. Sans elle, le programme devenait `$git`.
        if not powershell and c == "$" and suivant == '"':
            i += 1
            c, suivant = '"', texte[i + 1] if i + 1 < n else ""

        # --- $'...' : la quote ANSI-C de bash. Elle delimite comme une quote simple, mais bash
        # decode les echappements a l'interieur : les octets de "git" ecrits en hexadecimal forment
        # le mot git (verifie au shell du poste le 18/09/2026). Sans ce decodage, les interdits de
        # git.md et l'ecriture de .env passaient tous sous cette forme (verdict 3 du lot 3).
        if not powershell and c == "$" and suivant == "'":
            token_ouvert = token_entre_guillemets = True
            brut, i = _lire_quote_ansi_c(texte, i + 2)
            token.append(_decoder_ansi_c(brut))
            continue

        # --- guillemets simples.
        if c == "'":
            token_ouvert = token_entre_guillemets = True
            j = i + 1
            while True:
                fin = texte.find("'", j)
                if fin < 0:
                    raise _Opaque("guillemet simple non ferme")
                if powershell and texte[fin + 1:fin + 2] == "'":
                    token.append(texte[j:fin] + "'")
                    j = fin + 2
                    continue
                token.append(texte[j:fin])
                break
            i = fin + 1
            continue

        # --- guillemets doubles.
        if c == '"':
            token_ouvert = token_entre_guillemets = True
            j = i + 1
            while True:
                if j >= n:
                    raise _Opaque("guillemet double non ferme")
                d = texte[j]
                if d == '"':
                    if powershell and texte[j + 1:j + 2] == '"':
                        token.append('"')
                        j += 2
                        continue
                    break
                if not powershell and d == "\\" and j + 1 < n and texte[j + 1] in '"\\$`':
                    token.append(texte[j + 1])
                    j += 2
                    continue
                if powershell and d == "`" and j + 1 < n:
                    token.append(texte[j + 1])
                    j += 2
                    continue
                if d == "$" and texte[j + 1:j + 2] == "(":
                    j = lire_substitution(j + 2)
                    token.append(MARQUE_INCONNU)
                    continue
                if not powershell and d == "`":
                    j = lire_accents_graves(j + 1)
                    token.append(MARQUE_INCONNU)
                    continue
                token.append(d)
                j += 1
            i = j + 1
            continue

        # --- echappements a nu.
        if c == "\\" and not powershell:
            if suivant in ("\n", "\r"):
                fermer_token()
                i += 2 if suivant == "\n" else 3
                continue
            if suivant in _ECHAPPABLES_BASH:
                token.append(suivant)
                token_ouvert = True
                i += 2
                continue
            token.append(c)  # antislash d'un chemin Windows : conserve (canon() le retire d'un nom de programme)
            token_ouvert = True
            i += 1
            continue
        if c == "`" and powershell:
            if suivant in ("\n", "\r", ""):
                fermer_token()
                i += 2
                continue
            token.append(suivant)
            token_ouvert = True
            i += 2
            continue

        # --- substitutions : $(...), <(...), >(...), accents graves ; en PowerShell aussi @(...) et (...).
        if c == "$" and suivant == "(":
            i = lire_substitution(i + 2)
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            continue
        if not powershell and c in "<>" and suivant == "(":
            fermer_token()
            i = lire_substitution(i + 2)
            token.append(MARQUE_TUBE)
            token_ouvert = True
            continue
        if c == "`" and not powershell:
            i = lire_accents_graves(i + 1)
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            continue
        if powershell and c == "@" and suivant == "(":
            fermer_token()
            i = lire_substitution(i + 2)
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            continue
        if powershell and c == "(":
            fermer_token()
            i = lire_substitution(i + 1)
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            continue
        if powershell and c == "{" and suivant != "}":
            fermer_token()
            i = lire_bloc(i + 1)
            token.append(MARQUE_INCONNU)
            token_ouvert = True
            continue

        # --- fin de ligne : fin de phrase, puis les corps de heredoc en attente.
        if c == "\n" or c == "\r":
            fermer_token()
            j = i + 1
            if c == "\r" and suivant == "\n":
                j += 1
            fermer_phrase(i, tube=False)
            for tag, tabulations, entre_guillemets, phrase_declarante in tags_heredoc:
                corps, j = lire_document(j, tag, tabulations)
                phrase_declarante.document = corps if phrase_declarante.document is None else phrase_declarante.document + "\n" + corps
                if not entre_guillemets:
                    phrase_declarante.document_expanse = True
            tags_heredoc = []
            phrase.debut = j
            i = j
            continue

        # --- espaces.
        if c in " \t":
            fermer_token()
            i += 1
            continue

        # --- redirections.
        if c in "<>" or (c == "&" and suivant == ">"):
            prefixe = ""
            if token_ouvert and "".join(token).isdigit():
                prefixe = "".join(token)
                token, token_ouvert = [], False
            elif token_ouvert and "".join(token) == "&":
                prefixe = "&"
                token, token_ouvert = [], False
            elif token_ouvert and powershell and "".join(token) == "*":
                prefixe = "*"
                token, token_ouvert = [], False
            fermer_token()
            j = i
            if c == "&":
                j += 1
            operateur = texte[j]
            j += 1
            while j < n and texte[j] in "<>&|":
                operateur += texte[j]
                j += 1
            operateur = prefixe + operateur
            if operateur.startswith("<<<"):
                here_string_bash = True
            elif operateur.startswith("<<"):
                tabulations = texte[j:j + 1] == "-"
                if tabulations:
                    j += 1
                # La phrase qui porte le `<<` recevra le corps, meme si la ligne en contient d'autres
                # apres un `;`, un `&&` ou un tube (trou 1 du lot 4 : `sh <<E ; true`).
                tags_heredoc.append((None, tabulations, False, phrase))
            else:
                redir_en_attente = operateur
            i = j
            continue

        # --- separateurs.
        if c == ";":
            fermer_phrase(i, tube=False)
            i += 1
            phrase.debut = i
            continue
        if c == "|":
            double = suivant == "|"
            fermer_phrase(i, tube=not double)
            i += 2 if double else 1
            phrase.debut = i
            continue
        if c == "&":
            if powershell and not phrase.tokens and not token_ouvert:
                i += 1  # operateur d'appel PowerShell : `& "C:\Program Files\x.exe"`
                continue
            fermer_phrase(i, tube=False)
            i += 2 if suivant == "&" else 1
            phrase.debut = i
            continue

        # --- `{}` de find -exec et de xargs -I. Seul, c'est un token a part entiere ; colle a un
        # mot (`dossier/{}.bak`), il reste dans le mot, sinon la cible etait coupee en trois et la
        # destination perdue (trou 4 du lot 4).
        if c == "{" and suivant == "}":
            colle = token_ouvert or texte[i + 2:i + 3] not in ("", " ", "\t", "\n", "\r", ";")
            if colle:
                token.append("{}")
                token_ouvert = True
            else:
                fermer_token()
                phrase.tokens.append("{}")
            i += 2
            continue
        # --- accolades bash : `{ cmd; }` groupe (accolade suivie d'un espace, hors d'un mot) ; `.{env,bak}`
        # expansion (accolade dans un mot) : le caractere reste dans le token et le verrou le developpe.
        if c == "{" and (token_ouvert or suivant not in " \t\n\r"):
            token.append(c)
            token_ouvert = True
            i += 1
            continue
        if c == "}" and token_ouvert:
            token.append(c)
            i += 1
            continue
        # --- groupes bash : frontieres de token, sans autre sens ici.
        if c in "(){}":
            fermer_token()
            i += 1
            continue

        token.append(c)
        token_ouvert = True
        i += 1

    if here_string_bash or (tags_heredoc and tags_heredoc[-1][0] is None):
        fermer_token()
    fermer_phrase(n, tube=False)
    if redir_en_attente is not None and phrases:
        phrases[-1].redirections.append((redir_en_attente, ""))
    return phrases


# --------------------------------------------------------------------------- .NET en mode PowerShell

_MOTIF_STATIQUE = re.compile(P.MOTIF_DOTNET_STATIQUE)
_MOTIF_INSTANCE = re.compile(P.MOTIF_DOTNET_INSTANCE)
_MOTIF_NEW_OBJECT = re.compile(P.MOTIF_DOTNET_NEW_OBJECT, re.IGNORECASE)


def _arguments_dotnet(texte: str) -> list[str]:
    return [a.strip().strip("\"'") for a in texte.split(",") if a.strip()]


def _extraire_dotnet(texte: str) -> tuple[str, list[_Phrase]]:
    """Remplace les appels .NET par un espace et rend une phrase par appel (`::methode args`).

    Les parentheses imbriquees d'un argument (`Delete((Resolve-Path x).Path)`) sont d'abord reduites par
    le scanner en substitutions : le motif ne voit plus qu'un argument marque, que le verrou refuse.
    """
    synthetiques: list[_Phrase] = []

    def statique(m: re.Match[str]) -> str:
        phrase = _Phrase(tube_avant=False)
        phrase.tokens = ["::" + m.group(1).lower(), *_arguments_dotnet(m.group(2))]
        phrase.texte = m.group(0)
        synthetiques.append(phrase)
        return " "

    def instance(m: re.Match[str]) -> str:
        groupe = m.group(1).split()
        objet = [t.strip("\"'") for t in groupe[1:] if not t.startswith("-")]
        phrase = _Phrase(tube_avant=False)
        phrase.tokens = ["." + m.group(2).lower(), *objet, *_arguments_dotnet(m.group(3))]
        phrase.texte = m.group(0)
        synthetiques.append(phrase)
        return "(" + m.group(1) + ")"

    def nouvel_objet(m: re.Match[str]) -> str:
        if not any(t in m.group(1).lower() for t in P.TYPES_DOTNET_QUI_ECRIVENT):
            return m.group(0)
        phrase = _Phrase(tube_avant=False)
        phrase.tokens = ["::createtext", *_arguments_dotnet(m.group(2))]
        phrase.texte = m.group(0)
        synthetiques.append(phrase)
        return " "

    texte = _MOTIF_NEW_OBJECT.sub(nouvel_objet, texte)
    texte = _MOTIF_STATIQUE.sub(statique, texte)
    texte = _MOTIF_INSTANCE.sub(instance, texte)
    return texte, synthetiques


# --------------------------------------------------------------------------- des phrases aux invocations


def _cibles_de(tokens: list[str]) -> tuple[str, ...]:
    """Les tokens qui peuvent etre des chemins : ni options, ni affectations, ni inconnus."""
    return tuple(t for t in tokens if t and not t.startswith("-") and not _MOTIF_AFFECTATION.match(t) and MARQUE_INCONNU not in t)


def _est_un_programme_connu(token: str) -> bool:
    return canon(token) in P.PROGRAMMES or "/" in token or "\\" in token


class _Tete(NamedTuple):
    indice: int
    enveloppes: tuple[str, ...]
    par_xargs: bool
    repertoire_env: str | None
    commande_env: str | None
    en_tete_de_boucle: bool


def _sauter_enveloppe(regle: P.Regle, nom: str, tokens: list[str], debut: int) -> tuple[int, str | None, str | None]:
    """
    L'indice du premier token qui n'est ni option, ni valeur d'option, ni nombre, ni declencheur ;
    plus, pour `env`, un repertoire (`-C dir`) ou une commande (`-S 'cmd'`).

    Regle generale : apres une enveloppe, un mot qui n'est pas un programme connu ni un chemin est la
    valeur de l'option qui precede ou un mot de l'enveloppe (`timeout -s KILL 5`, `exec -a x`,
    `start "" `, `env -u GIT_DIR`) : il se saute. C'est ce qui rend les enveloppes inconnues moins
    dangereuses : ce qui suit et qui est un programme reste vu.
    """
    i = debut
    repertoire: str | None = None
    commande: str | None = None
    positionnels_a_sauter = 1 if "*" in regle.declencheurs else 0
    while i < len(tokens):
        t = tokens[i]
        bas = t.lower()
        if nom == "env":
            if bas in P.OPTIONS_ENV_REPERTOIRE and i + 1 < len(tokens):
                repertoire = tokens[i + 1]
                i += 2
                continue
            if bas.startswith("--chdir="):
                repertoire = t.split("=", 1)[1]
                i += 1
                continue
            if bas in P.OPTIONS_ENV_COMMANDE and i + 1 < len(tokens):
                commande = " ".join(tokens[i + 1:])
                return len(tokens), repertoire, commande
        if bas in regle.cibles and i + 1 < len(tokens):
            i += 2
            continue
        if t == "" or _MOTIF_NOMBRE.match(t) or _MOTIF_AFFECTATION.match(t) or bas in regle.declencheurs:
            i += 1
            continue
        if t.startswith("-") or (nom in {"start", "cmd"} and t.startswith("/")):
            i += 1
            if i < len(tokens) and not tokens[i].startswith("-") and not _est_un_programme_connu(tokens[i]) and not _MOTIF_NOMBRE.match(tokens[i]):
                i += 1  # la valeur de l'option
            continue
        if positionnels_a_sauter:
            positionnels_a_sauter -= 1
            i += 1
            continue
        if not _est_un_programme_connu(t) and i + 1 < len(tokens) and _est_un_programme_connu(tokens[i + 1]):
            i += 1  # un mot de l'enveloppe devant un vrai programme (`start "" git`, `setsid -w git`)
            continue
        break
    return i, repertoire, commande


def _position_du_programme(tokens: list[str], powershell: bool) -> _Tete:
    """Ou commence le programme, apres les affectations, les mots cles, les enveloppes et `xargs`."""
    i = 0
    enveloppes: list[str] = []
    par_xargs = False
    repertoire_env: str | None = None
    commande_env: str | None = None
    if powershell and tokens:
        m = _MOTIF_AFFECTATION_PS.match(tokens[0])
        if m and m.group(2):
            tokens[0] = m.group(2)
        elif tokens[0].startswith("$") and len(tokens) >= 2 and tokens[1] in {"=", "+=", "-="}:
            i = 2
    while i < len(tokens) and (_MOTIF_AFFECTATION.match(tokens[i]) or tokens[i].lower() in P.MOTS_CLES_TRANSPARENTS):
        i += 1
    if i < len(tokens) and tokens[i].lower() in P.MOTS_CLES_EN_TETE:
        return _Tete(len(tokens), (), False, None, None, True)
    while i < len(tokens):
        nom = canon(tokens[i])
        regle = _regle(nom)
        if regle is None or regle.famille not in {"ENVELOPPE", "XARGS"}:
            break
        enveloppes.append(nom)
        par_xargs = par_xargs or regle.famille == "XARGS"
        i, rep, cmd = _sauter_enveloppe(regle, nom, tokens, i + 1)
        repertoire_env = rep or repertoire_env
        if cmd is not None:
            commande_env = cmd
        while i < len(tokens) and tokens[i].lower() in P.MOTS_CLES_TRANSPARENTS:
            i += 1
    return _Tete(i, tuple(enveloppes), par_xargs, repertoire_env, commande_env, False)


def _option_code(regle: P.Regle, args: list[str]) -> int | None:
    for k, a in enumerate(args):
        if a.lower() in regle.declencheurs:
            return k
    return None


def _option_encodee(args: list[str]) -> bool:
    return any(a.lower() == P.OPTION_ENCODEE or a.lower() in P.PREFIXES_ENCODES for a in args)


def _litteraux(texte: str) -> list[str]:
    return [m.group(1) or m.group(2) or m.group(3) or "" for m in _MOTIF_LITTERAL.finditer(texte)]


class _Contexte:
    def __init__(self, powershell: bool) -> None:
        self.powershell = powershell
        self.invocations: list[Invocation] = []
        self.opaque: str | None = None


def _analyser_texte(
    ctx: _Contexte, texte: str, profondeur: int, repertoire: str | None, powershell: bool,
    parametres: tuple[str, ...] = (), amont_herite: tuple[str, ...] = (),
) -> None:
    if ctx.opaque:
        return
    synthetiques: list[_Phrase] = []
    if powershell:
        texte, synthetiques = _extraire_dotnet(texte)
    try:
        phrases = _scanner(texte, powershell) + synthetiques
    except _Opaque as exc:
        ctx.opaque = str(exc)
        return
    amont_precedent: tuple[str, ...] = ()
    for phrase in phrases:
        if ctx.opaque:
            return
        if parametres or amont_herite:
            phrase.tokens = _substituer(phrase.tokens, parametres, amont_herite)
        repertoire = _analyser_phrase(ctx, phrase, profondeur, repertoire, powershell, amont_precedent)
        tete = _position_du_programme(list(phrase.tokens), powershell)
        amont_precedent = _cibles_de(phrase.tokens[tete.indice + 1:]) if tete.indice < len(phrase.tokens) else ()


def _substituer(tokens: list[str], parametres: tuple[str, ...], amont: tuple[str, ...]) -> list[str]:
    """`$1` devient le parametre positionnel cite sur la ligne ; `{}` devient chaque cible amont."""
    resultat: list[str] = []
    for t in tokens:
        m = _MOTIF_PARAMETRE.match(t)
        if m and parametres:
            k = int(m.group(1))
            resultat.append(parametres[k] if k < len(parametres) else t)
        elif t == "{}" and amont:
            resultat.extend(amont)
        elif "{}" in t and amont:
            # find remplace les accolades partout dans l'argument, y compris dans le code d'un shell
            # (`-exec sh -c 'rm {}'`). Une cible par token produit, ce qui sur-couvre sans rien perdre.
            resultat.extend(t.replace("{}", cible) for cible in amont)
        else:
            resultat.append(t)
    return resultat


def _analyser_phrase(
    ctx: _Contexte, phrase: _Phrase, profondeur: int, repertoire: str | None, powershell: bool, amont_tube: tuple[str, ...]
) -> str | None:
    """Ajoute les invocations de la phrase au contexte ; rend le repertoire courant apres la phrase."""
    for interne in phrase.substitutions:
        _analyser_texte(ctx, interne, profondeur, repertoire, powershell)
        if ctx.opaque:
            return repertoire
    for bloc in phrase.blocs:
        _analyser_texte(ctx, bloc, profondeur, repertoire, powershell)
        if ctx.opaque:
            return repertoire
    if phrase.document is not None and phrase.document_expanse:
        for m in _MOTIF_SUBSTITUTION_DANS_TEXTE.finditer(phrase.document):
            _analyser_texte(ctx, m.group(1) or m.group(2) or "", profondeur, repertoire, powershell)
            if ctx.opaque:
                return repertoire
    tokens = list(phrase.tokens)
    tete = _position_du_programme(tokens, powershell)
    if tete.en_tete_de_boucle:
        return repertoire
    repertoire_local = tete.repertoire_env or repertoire
    if tete.repertoire_env and repertoire and not re.match(r"^([A-Za-z]:|/|~|\\\\)", tete.repertoire_env):
        repertoire_local = repertoire.rstrip("/") + "/" + tete.repertoire_env
    if tete.commande_env is not None:
        if MARQUE_INCONNU in tete.commande_env:
            ctx.opaque = "commande d'`env -S` construite a l'execution, non analysable"
            return repertoire
        _analyser_texte(ctx, tete.commande_env, profondeur, repertoire_local, powershell)
        return repertoire
    if tete.indice >= len(tokens):
        if phrase.redirections:
            ctx.invocations.append(Invocation("", (), tuple(phrase.redirections), tete.enveloppes, profondeur, (), repertoire_local, None, phrase.texte, powershell))
        return repertoire
    programme = canon(tokens[tete.indice])
    args = tokens[tete.indice + 1:]
    if programme in P.OPAQUES:
        ctx.opaque = f"`{programme}` construit sa commande a l'execution, non analysable"
        return repertoire
    if MARQUE_INCONNU in tokens[tete.indice] or MARQUE_TUBE in tokens[tete.indice]:
        if powershell and tokens[tete.indice] == MARQUE_INCONNU:
            # `(Get-Content x) -replace ...`, `@'...'@ | Set-Content x` : un groupe ou une here-string en
            # tete de phrase est une expression, pas un programme. Son interieur est deja analyse.
            return repertoire
        ctx.opaque = "programme construit a l'execution (substitution ou groupe), non analysable"
        return repertoire
    regle = _regle(programme)
    famille = regle.famille if regle else None
    # `python -m pip ...` est pip, pas python : sans cette reecriture, la famille INTERPRETE lisait
    # ses positionnels et l'ecriture du module passait (verdict 3 du lot 3). Un module absent de la
    # table ne produit aucun acces, comme un programme absent (limite ecrite dans securite.md).
    if famille == "INTERPRETE" and programme in P.PYTHONS:
        module = _module_python(args)
        if module is not None:
            nom, reste = module
            if _regle(canon(nom)) is not None:
                programme = canon(nom)
                args = reste
                regle = _regle(programme)
                famille = regle.famille if regle else None
    amont: tuple[str, ...] = ()
    if (tete.par_xargs or powershell) and phrase.tube_avant:
        amont = amont_tube
    code: str | None = None
    nouveau_repertoire = repertoire

    if programme in P.CHANGENT_DE_REPERTOIRE:
        cibles = _cibles_de(args)
        if any(MARQUE_INCONNU in a for a in args):
            nouveau_repertoire = None
        elif not cibles:
            nouveau_repertoire = "~"
        else:
            cible = cibles[0].replace("\\", "/")
            if repertoire and not re.match(r"^([A-Za-z]:|/|~)", cible):
                cible = repertoire.rstrip("/") + "/" + cible
            nouveau_repertoire = cible
    elif programme in P.REVIENNENT_AU_REPERTOIRE:
        nouveau_repertoire = None

    if famille == "SHELL" and regle is not None:
        if _option_encodee(args):
            ctx.opaque = "commande encodee en base64, non analysable"
            return repertoire
        k = _option_code(regle, args)
        interne: str | None = None
        parametres: tuple[str, ...] = ()
        if k is not None and k + 1 < len(args):
            interne = args[k + 1]
            parametres = tuple(args[k + 2:])  # `sh -c 'cmd' nom arg1` : $0 est `nom`, $1 est `arg1`
            if interne.strip() == "-":
                ctx.opaque = f"shell `{programme}` qui lit sa commande sur l'entree standard, non analysable"
                return repertoire
            if programme == "cmd":
                interne = " ".join(args[k + 1:])
                parametres = ()
        elif phrase.document is not None:
            interne = phrase.document
        elif phrase.tube_avant:
            ctx.opaque = f"shell `{programme}` alimente par un tube, commande non analysable"
            return repertoire
        if interne:
            if MARQUE_INCONNU in interne:
                ctx.opaque = "commande du shell construite a l'execution, non analysable"
                return repertoire
            if profondeur >= _PROFONDEUR_MAX:
                ctx.opaque = "shells imbriques sur plus d'un niveau, commande non analysable"
                return repertoire
            _analyser_texte(ctx, interne, profondeur + 1, repertoire_local, programme in {"pwsh", "powershell"}, parametres, amont)
    elif famille == "INTERPRETE" and regle is not None:
        k = _option_code(regle, args)
        if k is not None and k + 1 < len(args):
            code = args[k + 1]
        elif phrase.document is not None and ("-" in args or not _cibles_de(args)):
            code = phrase.document
        elif phrase.tube_avant and not _cibles_de(args):
            ctx.opaque = f"interprete `{programme}` alimente par un tube, code non analysable"
            return repertoire
        if code and MARQUE_INCONNU in code:
            ctx.opaque = "code d'interprete construit a l'execution, non analysable"
            return repertoire
        if code and any(indice_cmd in code.lower() for indice_cmd in P.INDICES_COMMANDE_SCRIPT):
            for m in _MOTIF_APPEL_SCRIPT.finditer(code):
                commande_interne = " ".join(lit for lit in _litteraux(m.group(1)) if lit)
                if not commande_interne:
                    continue
                if profondeur >= _PROFONDEUR_MAX:
                    ctx.opaque = "shells imbriques sur plus d'un niveau, commande non analysable"
                    return repertoire
                _analyser_texte(ctx, commande_interne, profondeur + 1, repertoire_local, False)
    elif famille == "LANCEUR_PS" and regle is not None:
        cibles = _cibles_de(args)
        valeurs: list[str] = []
        for j, a in enumerate(args):
            if any(a.lower() == o or (len(a) >= 3 and o.startswith(a.lower())) for o in regle.cibles) and j + 1 < len(args):
                valeurs.append(args[j + 1])
        lanceur = cibles[0] if cibles else ""
        for j, a in enumerate(args):
            if a.lower() in {"-filepath", "-file"} and j + 1 < len(args):
                lanceur = args[j + 1]
        arguments = " ".join(v.replace(",", " ") for v in valeurs if v != lanceur)
        if lanceur:
            if MARQUE_INCONNU in lanceur or MARQUE_INCONNU in arguments:
                ctx.opaque = "commande de Start-Process construite a l'execution, non analysable"
                return repertoire
            _analyser_texte(ctx, f"{lanceur} {arguments}".strip(), profondeur, repertoire_local, False)
    elif famille == "GIT":
        # git porte par git : `submodule foreach <cmd>`, `bisect run <cmd>`, `rebase -x <cmd>`.
        for tete_git, lancement in _commandes_portees_par_git(args):
            if lancement is not None:
                _analyser_texte(ctx, lancement, profondeur, repertoire_local, powershell)
            elif len(tete_git) == 1 and " " in tete_git[0]:
                # `submodule foreach 'git push --force'` : sous guillemets, la commande arrive en un
                # seul token, donc en programme inconnu. C'est du texte de commande, comme `rebase -x`.
                _analyser_texte(ctx, tete_git[0], profondeur, repertoire_local, powershell)
            elif tete_git:
                sous_phrase = _Phrase(tube_avant=False)
                sous_phrase.tokens = list(tete_git)
                sous_phrase.texte = phrase.texte
                _analyser_phrase(ctx, sous_phrase, profondeur, repertoire_local, powershell, ())
            if ctx.opaque:
                return repertoire
    elif famille == "FIND":
        # Ce que find lance est une commande entiere, pas un programme suivi d'arguments : elle peut
        # porter une enveloppe, un shell imbrique ou un interpreteur. On la fait donc passer par le
        # meme chemin que n'importe quelle phrase, comme `git submodule foreach` (verdict 3 du lot 3 :
        # `find -exec git ...` etait refuse, `find -exec bash -c 'git ...'` passait).
        for j, a in enumerate(args):
            if a.lower() in P.FIND_OPTIONS_QUI_LANCENT and j + 1 < len(args):
                fin = len(args)
                for m_idx in range(j + 1, len(args)):
                    if args[m_idx] in {";", "+"}:
                        fin = m_idx
                        break
                # `{}` porte les cibles de find. On rejoue la commande **une fois par cible**, ce
                # que find fait reellement : produire un token par cible mettait la cible dangereuse
                # en seconde position, ou un shell imbrique ne la lisait pas (trou 3 du lot 4).
                cibles = _cibles_atteintes_par_find(args) or ("",)
                for cible in cibles:
                    sous = [t.replace("{}", cible) if "{}" in t else t for t in args[j + 1:fin]]
                    if not sous:
                        continue
                    sous_phrase = _Phrase(tube_avant=False)
                    sous_phrase.tokens = sous
                    sous_phrase.texte = phrase.texte
                    _analyser_phrase(ctx, sous_phrase, profondeur, repertoire_local, powershell, _amont_de_find(args))
                    if ctx.opaque:
                        return repertoire

    affectations = tuple(t for t in tokens[:tete.indice] if _MOTIF_AFFECTATION.match(t))
    ctx.invocations.append(Invocation(
        programme, tuple(args), tuple(phrase.redirections), tete.enveloppes, profondeur, amont, repertoire_local, code, phrase.texte, powershell, affectations,
    ))
    return nouveau_repertoire


def _commandes_portees_par_git(args: list[str]) -> list[tuple[list[str], str | None]]:
    """
    Les commandes qu'un appel git lance lui-meme : (tokens, None) pour `submodule foreach <tokens>` et
    `bisect run <tokens>`, ([], texte) pour la valeur de `rebase -x` ou `--exec`.
    """
    resultat: list[tuple[list[str], str | None]] = []
    i = 0
    while i < len(args) and args[i].startswith("-"):
        i += 2 if args[i] in P.GIT_OPTIONS_GLOBALES_AVEC_VALEUR else 1
    reste = args[i:]
    for tete in P.GIT_SOUS_COMMANDES_QUI_LANCENT:
        positionnels = [a for a in reste if not a.startswith("-")]
        if tuple(positionnels[:len(tete)]) == tete:
            k = 0
            vus = 0
            while k < len(reste) and vus < len(tete):
                if not reste[k].startswith("-"):
                    vus += 1
                k += 1
            commande = [a for a in reste[k:] if not (a.startswith("-") and vus == len(tete) and a in {"--recursive", "-q", "--quiet"})]
            if commande:
                resultat.append((commande, None))
    for j, a in enumerate(reste):
        bas = a.lower()
        if bas in P.GIT_OPTIONS_QUI_LANCENT and j + 1 < len(reste):
            resultat.append(([], reste[j + 1]))
        elif bas.startswith("--exec="):
            resultat.append(([], a.split("=", 1)[1]))
    return resultat



def _module_python(args: list[str]) -> tuple[str, list[str]] | None:
    """Le module lance par `-m` et les arguments qui le suivent, ou None si la ligne n'en porte pas."""
    saute = False
    for j, a in enumerate(args):
        if saute:  # la valeur de l'option precedente, pas le nom du script
            saute = False
            continue
        if a == "-m" and j + 1 < len(args):
            return args[j + 1], args[j + 2:]
        if a.startswith("-m") and len(a) > 2 and not a.startswith("--"):
            return a[2:], args[j + 1:]
        if a in P.PYTHON_OPTIONS_AVEC_VALEUR:
            saute = True
            continue
        # Au premier mot qui n'est pas une option, python lance un script : ce qui suit lui appartient,
        # y compris un `-m` (`python outil.py -m venv x` ne lance pas le module venv).
        if a == "-c" or not a.startswith("-"):
            break
    return None


def _cibles_atteintes_par_find(args: list[str]) -> tuple[str, ...]:
    """Ce qu'une action de find atteint : ses motifs de nom s'il y en a, sinon tout le point de depart.

    Meme lecture que `_effets._acces_find` pour `-delete` : sans motif de nom, l'action peut atteindre
    n'importe quel fichier sous le point de depart, ce qu'on dit par un glob que le verrou juge.
    """
    departs: list[str] = []
    debut = 0
    # Les options globales de find precedent ses points de depart : sans les sauter, `find -L <chemin>`
    # perdait son chemin (trou 2 du lot 4).
    while debut < len(args) and args[debut] in P.FIND_OPTIONS_GLOBALES:
        debut += 1 + (1 if args[debut] in P.FIND_OPTIONS_GLOBALES_AVEC_VALEUR else 0)
    for a in args[debut:]:
        if a.startswith("-") or a in {"(", ")", "!"}:
            break
        departs.append(a)
    motifs = [args[j + 1] for j, a in enumerate(args)
              if a.lower() in P.FIND_OPTIONS_MOTIF and j + 1 < len(args)]
    # Sans point de depart, find prend le dossier courant : `find -delete` efface tout le projet.
    departs = departs or ["."]
    if motifs:
        return tuple(departs + motifs)
    return tuple(d.rstrip("/") + "/*" for d in departs)

def _amont_de_find(args: list[str]) -> tuple[str, ...]:
    """Les cibles de `find` : ses points de depart et les valeurs de ses options de motif."""
    cibles: list[str] = []
    for a in args:
        if a.startswith("-") or a in {"(", ")", "!"}:
            break
        cibles.append(a)
    for j, a in enumerate(args):
        if a.lower() in P.FIND_OPTIONS_MOTIF and j + 1 < len(args):
            cibles.append(args[j + 1])
    return tuple(cibles)


def analyser(commande: str, outil: str) -> Analyse:
    """Les invocations d'une commande, ou le motif pour lequel elle ne peut pas etre jugee. Ne leve jamais."""
    if not isinstance(commande, str) or not commande.strip():
        return Analyse((), None)
    ctx = _Contexte(powershell=(outil == "PowerShell"))
    try:
        _analyser_texte(ctx, commande, 0, None, ctx.powershell)
    except Exception as exc:  # noqa: BLE001  (un analyseur qui plante ne doit jamais valoir une autorisation)
        return Analyse(tuple(ctx.invocations), f"analyseur en defaut ({type(exc).__name__}), commande non analysable")
    return Analyse(tuple(ctx.invocations), ctx.opaque)
