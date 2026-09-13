---
id: >-
  resource-s6-architecture-des-ordinateurs-td-6-affichager-une-temperature-correction-pptx-eb4a2b63
slug: >-
  resource-s6-architecture-des-ordinateurs-td-6-affichager-une-temperature-correction-pptx-eb4a2b63
source_key: 'sha256:eb4a2b63fdc048f8add801e9910dfd7971ce9cef63891406c0e84e5a27650f00'
part_of: resource-s6-architecture-des-ordinateurs-971ace76
order: 4
manifest: null
derived_from: 'sha256:eb4a2b63fdc048f8add801e9910dfd7971ce9cef63891406c0e84e5a27650f00'
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
  - microcontroller
  - MPLabX
  - multiplexage
  - afficheur
  - embedded
domain: architecture des ordinateurs
---
# S6 - Architecture des ordinateurs — TD 6 - Affichager une temperature_correction.pptx

## Goal

Afficher une température fixe (25°C) sur deux afficheurs 7 segments multiplexés pilotés par un PIC16F84A en langage assembleur PIC sous MPLabX IDE.

## Prerequisites

- Connaître les bases du langage assembleur PIC (BSF, BCF, MOVLW, MOVWF, CALL, GOTO, RETLW)
- Comprendre le modèle mémoire du PIC16F84A (banques, RAM, TRISB, STATUS)
- Avoir MPLabX IDE installé
- Comprendre le fonctionnement d'un afficheur 7 segments et d'un transistor PNP

## Steps

**n**: 1
**title**: Câblage et résistances
**body**: Placer une résistance de 220 Ω ou 330 Ω entre chaque sortie PORTB et les segments LED. Les transistors Q1 (afficheur C, unités) et Q2 (afficheur M, dizaines) sont des PNP : base à 0 → transistor passant (afficheur allumé).
**n**: 2
**title**: Configuration PORTB en sortie
**body**: TRISB = 0x00 (tous les bits à 0 = sorties). TRISB se trouve en banque 1 : activer via `BSF STATUS, RP0`, écrire TRISB, puis revenir en banque 0 avec `BCF STATUS, RP0`.
**n**: 3
**title**: Déclarer les variables en RAM
**body**: Utiliser la directive CBLOCK à l'adresse RAM 0x20 :
```
CBLOCK 0x20
  TEMP_D   ; dizaines
  TEMP_U   ; unités
ENDC
```
**n**: 4
**title**: Point d'entrée du programme
**body**: Le PIC démarre à l'adresse 0x000 :
```
ORG 0x000
GOTO START
```
**n**: 5
**title**: Lookup table 7 segments
**body**: Sous-routine CHIFFRES : additionner W à PCL pour sauter à la bonne entrée RETLW.
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
Si un décodeur externe est utilisé, retourner l'index BCD (0b0000 à 0b1001) suffit.
**n**: 6
**title**: Fonction DELAY ≈ 126 µs
**body**: À 4 MHz, 1 cycle = 0,25 µs → 504 cycles nécessaires. Boucle de 100 itérations × 5 cycles ≈ 500 cycles :
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
**n**: 7
**title**: Initialisation (START)
**body**: ```
START
  BSF STATUS, RP0
  CLRF TRISB        ; PORTB en sortie
  BCF STATUS, RP0
  MOVLW D'2'
  MOVWF TEMP_D      ; dizaines = 2
  MOVLW D'5'
  MOVWF TEMP_U      ; unités = 5
```
**n**: 8
**title**: Boucle principale MAIN_LOOP (multiplexage)
**body**: Alterner très rapidement entre les deux afficheurs (persistence de vision < 1 ms) :
```
MAIN_LOOP
  ; Affiche unités (C)
  BSF PORTB, 4   ; RB4=1 → Q2 bloqué (M éteint)
  BCF PORTB, 5   ; RB5=0 → Q1 passant (C allumé)
  MOVF TEMP_U, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY

  ; Affiche dizaines (M)
  BCF PORTB, 4   ; RB4=0 → Q2 passant (M allumé)
  BSF PORTB, 5   ; RB5=1 → Q1 bloqué (C éteint)
  MOVF TEMP_D, W
  CALL CHIFFRES
  MOVWF PORTB
  CALL DELAY

  GOTO MAIN_LOOP
```
**n**: 9
**title**: Traduction équivalente en C (XC8)
**body**: ```c
#include <xc.h>
int TEMP_U = 5, TEMP_D = 2;
void main(void) {
    TRISB = 0x00; ANSELB = 0x00;
    while(1) {
        LATBbits.LATB4 = 1; LATBbits.LATB5 = 0;
        LATB = CHIFFRES(TEMP_U); _delay_us(126);
        LATBbits.LATB4 = 0; LATBbits.LATB5 = 1;
        LATB = CHIFFRES(TEMP_D); _delay_us(126);
    }
}
```

## Result

Le PIC16F84A affiche alternativement «2» et «5» sur les deux afficheurs 7 segments à une fréquence suffisante pour que l'œil perçoive «25» en continu, sans clignotement visible.

## Next

- Rendre la température variable (lecture via ADC sur un capteur LM35)
- Généraliser à N afficheurs avec un registre à décalage 74HC595
- Porter le projet vers un PIC plus récent (PIC16F877A) avec UART pour debug
