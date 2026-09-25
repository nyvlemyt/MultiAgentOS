"""
Verificateur de lisibilite d'une page HTML autonome (usage en ligne de commande, jamais automatique).

    python .claude/hooks/verif_contraste.py <page.html>... [--seuil 4.5]

Rejoue la cascade CSS sur chaque element porteur de texte, calcule la couleur de texte et le fond
effectivement visibles, et signale tout couple dont le contraste passe sous le seuil. Code de sortie
1 s'il reste au moins un signalement, 0 sinon.

Motif : le 23/09/2026, un selecteur de base rendu plus specifique que ses variantes (`.t` devenu
`span.t`) a repris la main sur le `background` sans reprendre la `color`. Resultat : des etiquettes
blanches sur fond blanc, invisibles sauf a les selectionner a la souris, dans un rapport relu et
livre. Aucun test de contenu ne voit ce defaut, et l'oeil ne le voit qu'a l'ouverture de la page.
C'est donc un calcul qu'il faut, pas une relecture.

Seuils WCAG 2.1 : 4.5 pour du texte courant (defaut ici), 3.0 pour du gros texte. Un contraste de
1.00 signale une superposition de la meme couleur, le cas a ne jamais laisser passer.

Portee, dite pour que personne ne s'y fie au dela : feuille de style interne (`<style>`) et styles
en ligne ; selecteurs de balise, de classe, d'identifiant, descendant et enfant direct. Sont ignores,
volontairement, les blocs `@media` (la page est jugee au repos, sur grand ecran), les pseudo classes
d'interaction (`:hover`, `:focus`, `::placeholder`), et les combinateurs `+` et `~`. Les pseudo
classes de structure (`:first-child`, `:nth-child`) sont traitees comme si elles matchaient toujours,
ce qui peut produire un faux signalement, jamais un silence. Les feuilles externes ne sont pas
chargees : ce depot ecrit des pages autonomes, sans ressource reseau.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

SEUIL_DEFAUT = 4.5


# ---------------------------------------------------------------- couleurs
def _canal(valeur: float) -> float:
    v = valeur / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (_canal(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    l1, l2 = luminance(c1), luminance(c2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


NOMS: dict[str, tuple[int, int, int] | None] = {
    "white": (255, 255, 255), "black": (0, 0, 0), "red": (255, 0, 0),
    "transparent": None, "inherit": None, "none": None, "currentcolor": None,
}


def couleur(texte: str, variables: dict[str, str]) -> tuple[int, int, int] | None:
    """Rend un triplet RGB, ou None si la valeur n'est pas une couleur opaque."""
    if not texte:
        return None
    texte = texte.strip().lower()
    var = re.match(r"var\(\s*(--[\w-]+)", texte)
    if var:
        return couleur(variables.get(var.group(1), ""), variables)
    if texte in NOMS:
        return NOMS[texte]
    hexa = re.match(r"#([0-9a-f]{3}|[0-9a-f]{6})\b", texte)
    if hexa:
        h = hexa.group(1)
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    fonc = re.match(r"rgba?\(([^)]*)\)", texte)
    if fonc:
        parts = [p.strip() for p in fonc.group(1).split(",")]
        if len(parts) == 4 and float(parts[3]) < 0.95:
            return None  # semi transparent : c'est le fond dessous qui compte
        try:
            return (int(float(parts[0])), int(float(parts[1])), int(float(parts[2])))
        except (ValueError, IndexError):
            return None
    return None


# ---------------------------------------------------------------- feuille de style
PSEUDO_IGNORE = re.compile(r"::?(hover|focus|active|visited|placeholder|-webkit-[\w-]+)")
PSEUDO_STRUCT = re.compile(r":(first-child|last-child|nth-child\([^)]*\)|not\([^)]*\))")


def _sans_media(css: str) -> str:
    """Retire les blocs @media : la page est jugee au repos, sur grand ecran."""
    while "@media" in css:
        debut = css.index("@media")
        ouvrante, profondeur = css.index("{", debut), 0
        for i in range(ouvrante, len(css)):
            profondeur += (css[i] == "{") - (css[i] == "}")
            if profondeur == 0:
                css = css[:debut] + css[i + 1:]
                break
        else:
            return css[:debut]
    return css


def lire_css(css: str) -> list[tuple[str, dict[str, str]]]:
    """Rend [(selecteur, {propriete: valeur})], dans l'ordre de la feuille."""
    css = _sans_media(re.sub(r"/\*.*?\*/", " ", css, flags=re.S))
    regles: list[tuple[str, dict[str, str]]] = []
    for bloc in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        decl: dict[str, str] = {}
        for morceau in bloc.group(2).split(";"):
            if ":" in morceau:
                cle, valeur = morceau.split(":", 1)
                decl[cle.strip().lower()] = valeur.strip()
        for selecteur in bloc.group(1).split(","):
            selecteur = " ".join(selecteur.split())
            if selecteur and decl:
                regles.append((selecteur, decl))
    return regles


def specificite(selecteur: str) -> tuple[int, int, int]:
    identifiants = selecteur.count("#")
    classes = selecteur.count(".") + len(re.findall(r":(?!:)", selecteur))
    balises = len(re.findall(r"(?:^|[\s>+~])([a-z][\w-]*)", selecteur))
    return (identifiants, classes, balises)


def morceau_matche(morceau: str, element: dict) -> bool:
    """Un morceau de selecteur, sans combinateur, contre un element."""
    morceau = PSEUDO_STRUCT.sub("", morceau)
    forme = re.match(r"^([a-z][\w-]*|\*)?((?:[.#][\w-]+)*)$", morceau)
    if not forme:
        return False
    balise, reste = forme.group(1), forme.group(2)
    if balise and balise not in ("*", element["balise"]):
        return False
    for jeton in re.findall(r"[.#][\w-]+", reste):
        if jeton[0] == "." and jeton[1:] not in element["classes"]:
            return False
        if jeton[0] == "#" and jeton[1:] != element["id"]:
            return False
    return True


def selecteur_matche(selecteur: str, element: dict, ancetres: list[dict]) -> bool:
    """`ancetres` va du parent direct vers la racine."""
    parties = [p for p in re.split(r"\s*([>+~])\s*|\s+", selecteur) if p]
    chaine = list(ancetres)
    i = len(parties) - 1
    if not morceau_matche(parties[i], element):
        return False
    i -= 1
    while i >= 0:
        if parties[i] in ">+~":
            if parties[i] != ">":
                return False  # + et ~ : non traites, aucun dans les pages du depot
            i -= 1
            if not chaine or not morceau_matche(parties[i], chaine[0]):
                return False
            chaine = chaine[1:]
            i -= 1
            continue
        while chaine and not morceau_matche(parties[i], chaine[0]):
            chaine = chaine[1:]
        if not chaine:
            return False
        chaine = chaine[1:]
        i -= 1
    return True


# ---------------------------------------------------------------- arbre HTML
VIDES = {"br", "hr", "img", "input", "meta", "link", "col", "source", "area"}


class Arbre(HTMLParser):
    """Collecte les elements avec leurs ancetres et le texte qui leur appartient."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.pile: list[dict] = []
        self.elements: list[dict] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        att = dict(attrs)
        element = {
            "balise": tag,
            "classes": set((att.get("class") or "").split()),
            "id": att.get("id") or "",
            "inline": att.get("style") or "",
            "parents": list(reversed(self.pile)),
            "texte": "",
            "ligne": self.getpos()[0],
        }
        self.elements.append(element)
        if tag not in VIDES:
            self.pile.append(element)

    def handle_endtag(self, tag: str) -> None:
        for i in range(len(self.pile) - 1, -1, -1):
            if self.pile[i]["balise"] == tag:
                del self.pile[i:]
                return

    def handle_data(self, data: str) -> None:
        if self.pile and data.strip():
            self.pile[-1]["texte"] += data.strip() + " "


# ---------------------------------------------------------------- cascade
def valeurs(element: dict, regles: list[tuple[str, dict[str, str]]]) -> dict[str, str]:
    """Les declarations effectives d'un element, cascade et style en ligne resolus."""
    gagnantes: dict[str, tuple[tuple, str]] = {}
    for ordre, (selecteur, decl) in enumerate(regles):
        if PSEUDO_IGNORE.search(selecteur):
            continue
        if not selecteur_matche(selecteur, element, element["parents"]):
            continue
        poids = specificite(selecteur)
        for cle, valeur in decl.items():
            if cle not in gagnantes or (poids, ordre) >= gagnantes[cle][0]:
                gagnantes[cle] = ((poids, ordre), valeur)
    effectives = {cle: valeur for cle, (_, valeur) in gagnantes.items()}
    for morceau in element["inline"].split(";"):
        if ":" in morceau:
            cle, valeur = morceau.split(":", 1)
            effectives[cle.strip().lower()] = valeur.strip()
    return effectives


def fond_effectif(element: dict, calc: dict, variables: dict[str, str]):
    """Le fond visible : celui de l'element, sinon celui du premier ancetre opaque."""
    for candidat in [element] + element["parents"]:
        decl = calc[id(candidat)]
        for propriete in ("background-color", "background"):
            brut = decl.get(propriete)
            if brut:
                trouve = couleur(brut.split()[0], variables)
                if trouve:
                    return trouve, candidat
    return (255, 255, 255), None


def analyser(chemin: Path, seuil: float) -> list[str]:
    html = chemin.read_bytes().decode("utf-8")
    regles = lire_css("\n".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S)))
    variables: dict[str, str] = {}
    for selecteur, decl in regles:
        if selecteur == ":root":
            variables.update(decl)

    arbre = Arbre()
    arbre.feed(re.sub(r"<(script|style)\b.*?</\1>", "", html, flags=re.S))
    calc = {id(e): valeurs(e, regles) for e in arbre.elements}

    vus: set = set()
    alertes: list[tuple[float, str]] = []
    for element in arbre.elements:
        if not element["texte"].strip():
            continue
        texte = None
        for candidat in [element] + element["parents"]:
            texte = couleur(calc[id(candidat)].get("color", ""), variables)
            if texte:
                break
        texte = texte or (0, 0, 0)
        fond, porteur = fond_effectif(element, calc, variables)
        ratio = contraste(texte, fond)
        if ratio >= seuil:
            continue
        cle = (element["balise"], tuple(sorted(element["classes"])), texte, fond)
        if cle in vus:
            continue
        vus.add(cle)
        herite = ""
        if porteur is not None and porteur is not element:
            herite = " (fond herite de <%s class=\"%s\">)" % (
                porteur["balise"], " ".join(sorted(porteur["classes"])))
        alertes.append((ratio, "  contraste %.2f | <%s class=\"%s\"> texte %s sur fond %s%s\n"
                               "      ligne %d : %s"
                        % (ratio, element["balise"], " ".join(sorted(element["classes"])),
                           texte, fond, herite, element["ligne"],
                           element["texte"][:90].strip())))
    alertes.sort(key=lambda a: a[0])
    return [ligne for _, ligne in alertes]


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--seuil"]
    seuil = SEUIL_DEFAUT
    if "--seuil" in sys.argv:
        seuil = float(sys.argv[sys.argv.index("--seuil") + 1])
        args = [a for a in args if a != str(seuil)]
    if not args:
        print(__doc__.strip().splitlines()[2].strip())
        sys.exit(2)
    total = 0
    for nom in args:
        chemin = Path(nom)
        if not chemin.is_file():
            print("%s : fichier introuvable" % nom)
            total += 1
            continue
        alertes = analyser(chemin, seuil)
        total += len(alertes)
        if alertes:
            print("%s : %d couple(s) sous le seuil de %.1f" % (nom, len(alertes), seuil))
            print("\n".join(alertes))
        else:
            print("%s : lisibilite OK au seuil de %.1f" % (nom, seuil))
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
