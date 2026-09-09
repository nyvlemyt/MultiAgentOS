---
id: resource-getters-et-setters-pour-premier-bcffe0cc
slug: resource-getters-et-setters-pour-premier-bcffe0cc
source_key: 'sha256:bcffe0cc508dbec9aafe8c1bd61f4c2e39e5c3cc074655799aa175bfe7a2e5f6'
part_of: null
order: null
manifest: null
derived_from: 'sha256:bcffe0cc508dbec9aafe8c1bd61f4c2e39e5c3cc074655799aa175bfe7a2e5f6'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - python
  - linked-list
  - oop
  - data-structures
  - doubly-linked-list
  - big-number-addition
  - history-navigation
domain: computer-science
---
# Getters et Setters pour 'premier'

## Summary

Implémentation Python orientée objet d'une liste doublement chaînée et de deux sous-classes : Historique (navigation avec pointeur courant) et Addition_Grand_Nombre (addition de grands entiers chiffre par chiffre). Chaque classe expose des getters/setters explicites pour tous ses attributs privés.

## Fields/API

**name**: Maillon
**type**: class
**description**: Nœud de base. Attributs privés : _valeur (int), _precedent (Maillon|None), _suivant (Maillon|None). Getters/setters pour chacun. Méthode to_string() → str.
**name**: Liste_Chainee
**type**: class
**description**: Liste doublement chaînée générique. Attributs : _premier, _dernier (Maillon|None). Méthodes : ajouter_debut(int), ajouter_fin(int), create_maillon(int, derriere=True), rechercher_valeur(int)→Maillon|None, rechercher_maillon(Maillon)→Maillon|None, supprimer(Maillon|int)→Maillon, to_string()→str.
**name**: Historique
**type**: class (hérite Liste_Chainee)
**description**: Ajoute un pointeur courant (_pointeur). Redéfinit ajouter_debut/ajouter_fin pour maintenir le pointeur. Méthodes : avancer()→Maillon (circulaire vers le suivant), reculer()→Maillon (circulaire vers le précédent), supprimer() ajuste le pointeur avant suppression.
**name**: Addition_Grand_Nombre
**type**: class (hérite Liste_Chainee)
**description**: Représente un grand entier : chaque maillon = un chiffre (du plus significatif au moins significatif, tête→queue). Méthode statique additionner_2_valeurs(v1, v2, retenue)→(dizaine, unite). Méthode addition(autre)→Addition_Grand_Nombre : parcours depuis le dernier maillon (unités), gère les retenues, construit le résultat par ajouter_debut.
**name**: Getters / Setters pattern
**type**: convention
**description**: Tous les attributs sont préfixés _ et exposés via get_X()/set_X(). Python property non utilisée — style Java explicite choisi pour la clarté pédagogique.

## Constraints

- supprimer() lève ValueError si l'argument n'est pas Maillon ou int, ou si l'élément est absent.
- rechercher_maillon() lève ValueError si l'argument n'est pas une instance de Maillon.
- avancer()/reculer() sont circulaires : au dernier/premier maillon, le pointeur revient au premier/dernier.
- Addition_Grand_Nombre.addition() parcourt de la queue (chiffres des unités) vers la tête ; le résultat est construit par ajouter_debut pour obtenir l'ordre naturel.
- Liste vide : get_premier() et get_dernier() retournent None ; to_string() retourne ''.

## Examples

**label**: Liste chaînée basique
**code**: l = Liste_Chainee()
l.ajouter_debut(10); l.ajouter_debut(20); l.ajouter_debut(30)
l.to_string()  # → '302010'
l.supprimer(l.get_premier())  # retire 30
l.to_string()  # → '2010'
**label**: Historique avec navigation
**code**: h = Historique()
h.ajouter_fin(1); h.ajouter_fin(2); h.ajouter_fin(3)
# pointeur sur 3
h.reculer()  # pointeur → 2
h.avancer()  # pointeur → 3
h.avancer()  # circulaire → 1
**label**: Addition grands nombres
**code**: a = Addition_Grand_Nombre()
b = Addition_Grand_Nombre()
for d in [5,6,7,8,9]: a.ajouter_fin(d)  # 56789
for d in [6,7,8,9,1]: b.ajouter_fin(d)  # 67891
a.addition(b).to_string()  # → '124680'
