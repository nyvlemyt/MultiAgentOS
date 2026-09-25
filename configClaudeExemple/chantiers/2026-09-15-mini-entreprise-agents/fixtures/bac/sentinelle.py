"""Neutralisation des sentinelles textuelles rencontrees dans les flux providers."""

# Les trois formes retenues par le brief. Comparaison exacte : la casse et les espaces
# de bord ne sont pas normalises, faute de decision sur ce point.
SENTINELLES: frozenset[str] = frozenset({"Not Collected", "Not Applicable", ""})


def sentinelle_en_none(valeur: str | None) -> str | None:
    """Rend None pour une sentinelle, la valeur telle quelle sinon."""
    if valeur in SENTINELLES:
        return None
    return valeur
