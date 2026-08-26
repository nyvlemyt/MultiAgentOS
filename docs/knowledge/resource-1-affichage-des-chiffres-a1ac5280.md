---
id: resource-1-affichage-des-chiffres-a1ac5280
slug: resource-1-affichage-des-chiffres-a1ac5280
source_key: 'sha256:a1ac52806b426dcaebca1886589046ec820387fc73053532f5ef6ed3a179a8eb'
part_of: null
order: null
manifest: null
derived_from: 'sha256:a1ac52806b426dcaebca1886589046ec820387fc73053532f5ef6ed3a179a8eb'
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
  - assembly
  - PIC16F84A
  - multiplexage
  - afficheur-7-segments
  - BCD
  - 74LS47
  - microcontrôleur
  - PORTB
domain: architecture des ordinateurs
---
# 1) Affichage des chiffres

## Summary

Référence complète pour l'affichage multiplexé de chiffres sur 4 afficheurs 7-segments (M, C, D, U) via un PIC16F84A à 4 MHz, avec décodeur BCD 74LS47. Couvre le codage PORTB, la lookup table BCD, la fonction de délai, le programme assembleur complet et son équivalent C (XC8).

## Fields/API

**name**: Encodage PORTB
**description**: RB0–RB3 : valeur BCD du chiffre (4 bits). RB4–RB7 : sélection de l'afficheur actif (0 = actif). Un seul afficheur est activé à la fois (multiplexage).
**values**: - M (chiffre 1) : PORTB = b'00000001' — RB0=1, RB4=0 (M actif), RB5–7=1
- C (chiffre 2) : PORTB = b'00100010' — RB1=1, RB5=0 (C actif), RB4,6,7=1
- D (chiffre 3) : PORTB = b'01000011' — RB0=1,RB1=1, RB6=0 (D actif)
- U (chiffre 4) : PORTB = b'10000100' — RB2=1, RB7=0 (U actif)
**name**: Lookup table BCD (74LS47)
**description**: Le décodeur 74LS47 accepte directement le BCD ; pas besoin d'encodage hexadécimal. Table via RETLW.
**values**: - 0 → b'0000'
- 1 → b'0001'
- 2 → b'0010'
- 3 → b'0011'
- 4 → b'0100'
- 5 → b'0101'
- 6 → b'0110'
- 7 → b'0111'
- 8 → b'1000'
- 9 → b'1001'
**name**: Fonction DELAY
**description**: Génère ~126 µs à 4 MHz (cycle = 0,25 µs). Boucle de 504 cycles ≈ 100 itérations × (NOP + NOP + DECFSZ + GOTO).
**values**: - MOVLW D'100' ; charge compteur
- MOVWF TEMP
- DELAY_LOOP: NOP / NOP / DECFSZ TEMP,F / GOTO DELAY_LOOP
- RETURN
**name**: Configuration PIC16F84A
**description**: Bits de configuration et initialisation du port B.
**values**: - __CONFIG _CP_OFF & _WDT_OFF & _XT_OSC
- BSF STATUS,RP0 ; bank 1
- CLRF TRISB ; PORTB tout en sortie
- BCF STATUS,RP0 ; bank 0
**name**: Équivalent C (XC8)
**description**: Version C du même programme pour compilateur XC8. Utilise des fonctions pointeurs pour sélectionner l'afficheur actif.
**values**: - #define _XTAL_FREQ 4000000
- TRISB = 0x00 ; tout en sortie
- afficher_chiffre(chiffre, *activer_afficheur) : RB3-0 = chiffre & 0x0F, appel du sélecteur, __delay_ms(10)
- activer_M/C/D/U : masque OR sur bits RB4–RB7 pour activer l'afficheur voulu

## Constraints

- Horloge PIC : 4 MHz → 1 instruction = 1 µs (sauf branchements = 2 µs).
- Un seul afficheur activé à la fois : le bit de sélection correspondant passe à 0, les autres restent à 1.
- La boucle principale (LOOP/GOTO LOOP) est infinie ; aucun mécanisme d'arrêt prévu.
- La TABLE BCD est déclarée dans le code complet mais non appelée — le codage PORTB direct est utilisé à la place.
- PORTB entièrement en sortie (TRISB = 0x00) ; aucune entrée sur ce port.

## Examples

**label**: Afficher '1' sur M (assembleur)
**code**: MOVLW b'00000001'
MOVWF PORTB
CALL DELAY
**label**: Afficher '4' sur U (assembleur)
**code**: MOVLW b'10000100'
MOVWF PORTB
CALL DELAY
**label**: Afficher '2' sur C (C/XC8)
**code**: afficher_chiffre(2, activer_C);
**label**: Délai ~126 µs (assembleur)
**code**: DELAY:
  MOVLW D'100'
  MOVWF TEMP
DELAY_LOOP:
  NOP
  NOP
  DECFSZ TEMP, F
  GOTO DELAY_LOOP
  RETURN
