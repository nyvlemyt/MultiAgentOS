---
id: resource-s7-divers-td-6-affichager-une-temperature-correction-pptx-10ecb1cb
slug: resource-s7-divers-td-6-affichager-une-temperature-correction-pptx-10ecb1cb
source_key: 'sha256:10ecb1cbce02f82ca7095e3b7a277460bc17a3c4a2f7a98fd635d45b59580830'
part_of: S7 - Divers
order: 3
manifest: null
derived_from: 'sha256:10ecb1cbce02f82ca7095e3b7a277460bc17a3c4a2f7a98fd635d45b59580830'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - PIC16F84A
  - assembly
  - MPLabX
  - 7-segment
  - microcontroller
  - embedded
  - multiplexage
  - PNP transistor
domain: systèmes embarqués
---
# S7 - Divers — TD 6 - Affichager une temperature_correction.pptx

## Goal

Afficher une température fixe (25°C) sur deux afficheurs 7 segments multiplexés, pilotés par un PIC16F84A via deux transistors PNP, en assembleur PIC (et sa traduction en C).

## Prerequisites

- MPLabX IDE installé
- Notions de base sur le PIC16F84A (registres, banks, jeu d'instructions)
- Circuit câblé : PIC16F84A → résistances (220 Ω ou 330 Ω) → afficheurs 7 segments, transistors PNP Q1/Q2 sur RB4/RB5

## Steps

**step**: 1
**title**: Comprendre le câblage
**detail**: Les sorties PORTB pilotent les segments (RB0–RB6). RB4 contrôle Q1 (dizaines) et RB5 contrôle Q2 (unités). Les transistors PNP s'activent base = 0 : mettre RB4=0 allume le display dizaines, RB5=0 allume le display unités. Une résistance de 220 Ω ou 330 Ω est placée entre le PIC et chaque anode commune.
**step**: 2
**title**: Configurer PORTB en sortie
**detail**: TRISB appartient au bank 1. Séquence : BSF STATUS, RP0 (passer au bank 1) → CLRF TRISB (PORTB tout en sortie, TRISB = 0x00) → BCF STATUS, RP0 (retour au bank 0).
**step**: 3
**title**: Déclarer les variables en RAM
**detail**: Utiliser la directive CBLOCK à l'adresse 0x20 :
```
CBLOCK 0x20
  TEMP_D   ; dizaines (valeur 2)
  TEMP_U   ; unités   (valeur 5)
ENDC
```
**step**: 4
**title**: Point d'entrée et initialisation
**detail**: Le PIC démarre à 0x000. Structure de base :
```
  ORG 0x000
  GOTO START
...
START
  BSF STATUS, RP0
  CLRF TRISB
  BCF STATUS, RP0
  MOVLW D'2'
  MOVWF TEMP_D
  MOVLW D'5'
  MOVWF TEMP_U
```
**step**: 5
**title**: Créer la lookup table des chiffres
**detail**: Subroutine CHIFFRES (sans décodeur, codes 7 segments directs) :
```
CHIFFRES
  ADDWF PCL
  RETLW 0x3F ; 0
  RETLW 0x06 ; 1
  RETLW 0x5B ; 2
  RETLW 0x4F ; 3
  RETLW 0x66 ; 4
  RETLW 0x6D ; 5
  RETLW 0x7D ; 6
  RETLW 0x07 ; 7
  RETLW 0x7F ; 8
  RETLW 0x6F ; 9
```
Avec décodeur BCD, utiliser les valeurs binaires b'0000' à b'1001'.
**step**: 6
**title**: Créer la fonction DELAY (~126 µs)
**detail**: À 4 MHz, 1 cycle = 0,25 µs → 504 cycles ≈ boucle de 100 itérations × 5 cycles :
```
DELAY
  MOVLW D'100'
  MOVWF 0x21
DL2
  NOP
  NOP
  DECFSZ 0x21
  GOTO DL2
  RETURN
```
**step**: 7
**title**: Boucle principale MAIN_LOOP (multiplexage)
**detail**: Alterner l'affichage des deux digits à > 1 kHz pour que l'œil humain perçoive un affichage continu :
```
MAIN_LOOP
  ; Unités
  BSF PORTB, 4   ; éteint dizaines (Q1 OFF)
  BCF PORTB, 5   ; allume unités  (Q2 ON)
  MOVF TEMP_U, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY
  ; Dizaines
  BCF PORTB, 4   ; allume dizaines (Q1 ON)
  BSF PORTB, 5   ; éteint unités  (Q2 OFF)
  MOVF TEMP_D, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY
  GOTO MAIN_LOOP
```
**step**: 8
**title**: Traduction en C (XC8 / MPLabX)
**detail**: ```c
#include <xc.h>
int TEMP_U = 5, TEMP_D = 2;
void main(void) {
  TRISB = 0x00; ANSELB = 0x00;
  while(1) {
    LATBbits.LATB4 = 1; LATBbits.LATB5 = 0;
    CHIFFRES(TEMP_U); LATB = TEMP_U;
    _delay_us(126);
    LATBbits.LATB4 = 0; LATBbits.LATB5 = 1;
    CHIFFRES(TEMP_D); LATB = TEMP_D;
    _delay_us(126);
  }
}
```
Nota : `LATxbits.LATxy` — x = port (A/B/…), y = numéro de broche.

## Result

Le PIC16F84A affiche '25' en permanence sur deux afficheurs 7 segments en multiplexant les deux digits à ~4 kHz, invisible à l'œil nu. Le code assembleur complet est opérationnel dans MPLabX IDE.

## Next

- Remplacer la température fixe par une lecture analogique (ADC externe ou PIC avec ADC intégré)
- Ajouter un troisième afficheur pour inclure le signe ou la virgule décimale
- Porter le projet sur PIC16F877A qui dispose d'un ADC interne et de plus de ports
