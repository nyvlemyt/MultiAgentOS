---
id: resource-s5-structure-de-donnees-lab-2-pdf-3d4468bd
slug: resource-s5-structure-de-donnees-lab-2-pdf-3d4468bd
source_key: 'sha256:3d4468bd7df7b066563bfae770be417927dd7d37c8b91322afd2dfba614f6228'
part_of: resource-s5-structure-de-donnees-333ec2f4
order: 2
manifest: null
derived_from: 'sha256:3d4468bd7df7b066563bfae770be417927dd7d37c8b91322afd2dfba614f6228'
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
  - stack
  - data-structures
  - linked-list
  - static-array
  - file-storage
  - struct
domain: computer-science
---
# S5 - Structure de données — Lab 2.pdf

## Summary

Trois implémentations Python d'une pile (LIFO) comparées : tableau statique à taille fixe (`StaticStack`), liste chaînée dynamique (`DynamicStack`), et stockage binaire dans un fichier (`FileStack`). Toutes exposent la même interface fonctionnelle (push/pop/peek/is_empty/display) mais diffèrent par leur backend de stockage et leurs contraintes.

## Fields/API

**StaticStack**: **backend**: list Python pré-allouée de taille max_size, indice top_index
**methods**: **push(value)**: ajoute au sommet ; lève OverflowError si plein
**pop()**: retire et retourne le sommet ; lève IndexError si vide
**peek()**: lit le sommet sans retrait ; lève IndexError si vide
**is_empty()**: top_index == -1
**is_full()**: top_index == max_size - 1
**resize(new_max_size)**: étend la liste interne ; new_max_size ≥ nombre d'éléments actuels
**display()**: affiche max_size, top_index, valeur au sommet, contenu brut
**DynamicStack**: **backend**: Liste_Chainee (implémentation du lab précédent), compteur size
**methods**: **push(value)**: ajouter_fin() sur la liste chaînée + size++
**pop()**: get_dernier() + supprimer() + size-- ; lève IndexError si vide
**peek()**: get_dernier().get_valeur() ; lève IndexError si vide
**is_empty()**: size == 0
**display()**: affiche size et to_string() de la liste chaînée
**FileStack**: **backend**: fichier binaire, valeurs encodées en int32 avec struct.pack('i', …) — 4 octets par valeur
**methods**: **set_file(filename)**: définit ou change le fichier ; le crée s'il n'existe pas
**push(value: int)**: append binaire à la fin du fichier (mode 'ab')
**pop()**: seek fin-4 → lit 4 octets → truncate ; lève IndexError si vide
**peek()**: seek fin-4 → lit 4 octets sans truncate ; lève IndexError si vide
**is_empty()**: os.path.getsize(filename) == 0
**display()**: lit le fichier par tranches de 4 octets, affiche liste d'entiers

## Constraints

- StaticStack : max_size doit être connu à la construction ; resize() possible mais pas automatique
- StaticStack.resize() exige new_max_size ≥ éléments actuels (sinon ValueError)
- DynamicStack : dépend de l'implémentation externe Liste_Chainee du lab précédent
- DynamicStack : pop() et peek() utilisent get_dernier() / get_valeur() — API spécifique à cette Liste_Chainee
- FileStack : valeurs limitées aux int32 signés (struct format 'i') — pas d'objets arbitraires
- FileStack : chaque opération ouvre/ferme le fichier — plus lent que les variantes mémoire
- FileStack : set_file() change la cible silencieusement ; les données de l'ancien fichier restent intactes

## Examples

**impl**: FileStack
**scenario**: Test complet push/peek/pop/set_file
**trace**: - FileStack('pile_fichier.dat') → fichier créé, pile vide []
- push(10), push(20) → [10, 20]
- push(30) → [10, 20, 30]
- peek() → 30 (pile inchangée)
- pop() → 30 retiré, pile [10, 20]
- set_file('nouvelle_pile.dat') → nouveau fichier vide []
- push(100), push(200) → [100, 200]
- pop() → 200 retiré, pile [100]
