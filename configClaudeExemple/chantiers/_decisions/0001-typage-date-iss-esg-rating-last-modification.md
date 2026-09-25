---
status: accepted
date: 2026-09-07
---

# `iss_esg_rating_last_modification` est une date, pas un texte

Tania avait typé ce champ du schéma `ISSEquityEsgIssuerDataSchema` en `str` (« date field but not parsable to date format »). Edmond a demandé le 07/09/2026 pourquoi. L'analyse a montré que rien ne bloque : les libellés `Not Collected` et `Not Applicable` des fichiers ISS deviennent NULL dès le préprocessing (`df_replace_none_values`, liste `NONE_VALUES` de `data/choices.py`) ; en base EveDev, les 12 366 valeurs non nulles sont toutes au format `YYYY-MM-DD`, 0 non convertible ; les fichiers sources varient (`YYYY-MM-DD` et `YYYY-MM-DD 00:00:00`), formats tous couverts par `parse_date_expr`, appliqué automatiquement aux champs `pa.Date`.

Décision : typer en `date` (schéma pandera `date`, modèle Django `DateField`, migration dédiée). Pas `datetime` : aucune information horaire, et le chemin `pa.DateTime` du pipeline utilise un `strptime` sans format, moins robuste.

## Alternatives écartées

Garder `str` et parser à la volée dans le rapport qualité (`_date_expr` le fait déjà) : fonctionne, mais laisse deux représentations d'une même donnée et une incohérence schéma/modèle de plus. `datetime` : voir ci-dessus.

## Conséquences

L'export Demain est inchangé : un `pl.Date` dans l'unpivot donne la chaîne `YYYY-MM-DD`, identique aux valeurs déjà stockées (vérifié par un test ajouté dans `test_export_demain.py`). Les documents `DATA_QUALITY.md` et `SPEC_data.md` sont mis à jour dans le même chantier. Implémentation : chantier `2026-09-08-esg-rating-last-modification`.
