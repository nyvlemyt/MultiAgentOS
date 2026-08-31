---
id: resource-s7-divers-td-6-affichager-une-temperature-correction-pdf-7ff49c53
slug: resource-s7-divers-td-6-affichager-une-temperature-correction-pdf-7ff49c53
source_key: 'sha256:7ff49c53f09321c150bccd4e099754109c4d4437c9be6d024c61146fd0445f68'
part_of: resource-s7-divers-344e8e59
order: 2
manifest: null
derived_from: 'sha256:7ff49c53f09321c150bccd4e099754109c4d4437c9be6d024c61146fd0445f68'
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
  - 7-segment
  - multiplexage
  - microcontrôleur
  - MPLabX
  - embedded
  - PNP-transistor
domain: systèmes embarqués
---
# S7 - Divers — TD 6 - Affichager une temperature_correction.pdf

## Goal

Afficher une température fixe (25°C) sur deux afficheurs 7 segments en multiplexage, piloté par un PIC16F84A en langage assembleur PIC (puis équivalent C).

## Prerequisites

- Notions de base sur les microcontrôleurs PIC (registres, banks, instructions de base)
- MPLab X IDE installé
- Circuit câblé : PIC16F84A + 2 transistors PNP (Q1/Q2) + 2 afficheurs 7 segments + résistances 220 Ω ou 330 Ω

## Steps

**n**: 1
**title**: Dimensionner la résistance de limitation LED
**body**: Chaque segment du 7-segment est une LED. Une résistance de 220 Ω ou 330 Ω est placée entre le microcontrôleur et chaque segment pour limiter le courant.
**n**: 2
**title**: Configurer PORTB en sortie (TRISB)
**body**: TRISB se trouve en bank 1. Pour y accéder : `BSF STATUS, RP0` (met RP0=1 dans le registre STATUS). Écrire `CLRF TRISB` met tous les bits à 0 → PORTB entièrement en sortie. Revenir en bank 0 : `BCF STATUS, RP0`.
**n**: 3
**title**: Comprendre la commande des transistors PNP
**body**: Q1 et Q2 sont des PNP : base à 0 = transistor passant (afficheur allumé), base à 1 = transistor bloqué (afficheur éteint). RB4 pilote le sélecteur 'dizaine' (M) et RB5 le sélecteur 'unité' (C).
**n**: 4
**title**: Déterminer les valeurs PORTB pour chaque afficheur
**body**: Afficher 5 sur C (unités) : RB5=0 (allume C), RB4=1 (éteint M). Afficher 2 sur M (dizaines) : RB4=0 (allume M), RB5=1 (éteint C).
**n**: 5
**title**: Définir le vecteur de reset et l'organisation mémoire
**body**: Le PIC démarre à l'adresse 0x000. Code minimal :
```asm
ORG 0x000
GOTO START
```
**n**: 6
**title**: Déclarer les variables en RAM avec CBLOCK
**body**: ```asm
CBLOCK 0x20
  TEMP_D   ; dizaine
  TEMP_U   ; unité
ENDC
```
Les variables sont allouées consécutivement à partir de 0x20.
**n**: 7
**title**: Écrire la lookup table des segments (subroutine CHIFFRES)
**body**: Technique : `ADDWF PCL` saute de W positions dans la table, chaque `RETLW` renvoie le motif 7 segments du chiffre.
```asm
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
Si un décodeur externe est utilisé, remplacer par les valeurs binaires simples (0b0000 à 0b1001).
**n**: 8
**title**: Écrire la fonction DELAY (~126 µs)
**body**: À 4 MHz, 1 cycle = 0,25 µs → 126 µs ≈ 504 cycles. Une boucle de 100 itérations × ~5 cycles (NOP + NOP + DECFSZ + GOTO) approche cette valeur.
```asm
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
**n**: 9
**title**: Programme principal : initialisation (START)
**body**: ```asm
START
  BSF STATUS, RP0   ; bank 1
  CLRF TRISB        ; PORTB = sortie
  BCF STATUS, RP0   ; bank 0
  MOVLW D'2'
  MOVWF TEMP_D
  MOVLW D'5'
  MOVWF TEMP_U
```
**n**: 10
**title**: Boucle principale : multiplexage des deux afficheurs (MAIN_LOOP)
**body**: ```asm
MAIN_LOOP
  ; -- Unités (C) --
  BSF PORTB, 4      ; éteint dizaines (M)
  BCF PORTB, 5      ; allume unités (C)
  MOVF TEMP_U, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY

  ; -- Dizaines (M) --
  BCF PORTB, 4      ; allume dizaines (M)
  BSF PORTB, 5      ; éteint unités (C)
  MOVF TEMP_D, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY

  GOTO MAIN_LOOP
END
```
**n**: 11
**title**: Équivalent C (XC8 / MPLAB)
**body**: ```c
#include <xc.h>
int TEMP_U = 5, TEMP_D = 2;
void main(void) {
  TRISB = 0x00; ANSELB = 0x00;
  while(1) {
    LATBbits.LATB4 = 1; LATBbits.LATB5 = 0;
    CHIFFRES(TEMP_U); LATB = TEMP_U; _delay_us(126);
    LATBbits.LATB4 = 0; LATBbits.LATB5 = 1;
    CHIFFRES(TEMP_D); LATB = TEMP_D; _delay_us(126);
  }
}
```

## Result

Le PIC16F84A alterne rapidement entre les deux afficheurs (multiplexage <1 ms, invisible à l'œil) et affiche '25' de façon stable. PORTB transporte simultanément le motif de segments et le bit de sélection du transistor.

## Next

- Rendre la température dynamique en lisant un capteur (ex. LM35) via le module ADC
- Ajouter un troisième afficheur pour le signe '°'
- Porter le projet sur PIC16F877A pour bénéficier d'un ADC intégré
