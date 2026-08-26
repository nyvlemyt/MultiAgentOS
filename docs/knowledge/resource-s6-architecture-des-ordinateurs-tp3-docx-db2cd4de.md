---
id: resource-s6-architecture-des-ordinateurs-tp3-docx-db2cd4de
slug: resource-s6-architecture-des-ordinateurs-tp3-docx-db2cd4de
source_key: 'sha256:db2cd4de682854085e8a5115a45b26f2d6946498093ed75484b7f1e3c1bcd5e4'
part_of: S6 - Architecture des ordinateurs
order: 5
manifest: null
derived_from: 'sha256:db2cd4de682854085e8a5115a45b26f2d6946498093ed75484b7f1e3c1bcd5e4'
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
  - microcontroller
  - PIC
  - TRISA
  - PORTA
  - GPIO
  - open-drain
  - registres
  - architecture-ordinateurs
domain: architecture des ordinateurs / systèmes embarqués
---
# S6 - Architecture des ordinateurs — TP3.docx

## Summary

Référence rapide sur la configuration des broches d'entrée/sortie d'un microcontrôleur PIC via les registres TRISA et PORTA. Couvre la logique de direction (0 = sortie, 1 = entrée), la structure du port A (5 broches RA0–RA4), et la particularité open-drain de RA4 qui inverse la logique d'activation.

## Fields/API

**name**: TRISA
**type**: registre 8 bits (bits 7–5 non utilisés)
**description**: Registre de direction du port A. Bit = 0 → broche en sortie ; bit = 1 → broche en entrée.
**bits**: [ X X X | RA4 | RA3 | RA2 | RA1 | RA0 ]
**name**: PORTA
**type**: registre 8 bits (bits 7–5 non utilisés)
**description**: Registre de données du port A. Écrit la valeur logique sur chaque broche configurée en sortie.
**bits**: [ X X X | RA4 | RA3 | RA2 | RA1 | RA0 ]
**name**: RA4 / TOCKI
**type**: broche multifonction — open drain
**description**: RA4 est câblée en open-drain (collecteur ouvert). Sa logique est INVERSÉE par rapport aux autres broches : écrire 0 dans PORTA l'allume (tirage vers le bas), écrire 1 l'éteint.

## Constraints

- TRISA = 0x00 configure toutes les broches RA0–RA4 en sortie (bits 0 = sortie).
- RA4 (TOCKI) est en open-drain : la logique d'activation est inversée. Pour allumer une LED sur RA4, il faut écrire 0 sur ce bit dans PORTA, et 1 sur les autres broches actives.
- Les bits 7–5 de TRISA et PORTA sont non connectés (X, traités comme 0 par convention).

## Examples

**scenario**: Configurer tout le port A en sortie
**register**: TRISA
**value**: 0x00
**binary**: 00000000
**note**: Tous les bits à 0 = toutes les broches en sortie.
**scenario**: Allumer les LEDs D1–D5 connectées sur RA0–RA4
**register**: PORTA
**value**: 0x0F
**binary**: XXX 0 1 1 1 1
**note**: RA4 (open-drain) reçoit 0 → allumé. RA3–RA0 reçoivent 1 → allumés (logique directe). Résultat : 5 LEDs allumées.
