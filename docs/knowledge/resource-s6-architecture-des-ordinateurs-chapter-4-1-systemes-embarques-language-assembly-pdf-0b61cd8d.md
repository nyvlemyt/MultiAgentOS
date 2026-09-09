---
id: >-
  resource-s6-architecture-des-ordinateurs-chapter-4-1-systemes-embarques-language-assembly-pdf-0b61cd8d
slug: >-
  resource-s6-architecture-des-ordinateurs-chapter-4-1-systemes-embarques-language-assembly-pdf-0b61cd8d
source_key: 'sha256:0b61cd8daa9f05e9e42c409fae3f1301557913e368c87d0f8d703c3fd61bcf83'
part_of: resource-s6-architecture-des-ordinateurs-971ace76
order: 1
manifest: null
derived_from: 'sha256:0b61cd8daa9f05e9e42c409fae3f1301557913e368c87d0f8d703c3fd61bcf83'
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
  - embedded-systems
  - microcontroller
  - PIC
  - assembly
  - MPLAB
  - instruction-set
  - computer-architecture
  - ALU
  - registers
domain: computer-architecture
---
# S6 - Architecture des ordinateurs — Chapter 4.1 - Systèmes embarqués + Language Assembly.pdf

## Summary

Course chapter (Dr. Georgina Abi Sejaan) covering embedded systems fundamentals and PIC microcontroller assembly programming. Defines embedded systems, contrasts Von Neumann vs Harvard memory architecture, introduces the PIC 12F508 and 16F873A family (microcontroller = microprocessor core + memory + peripherals), details the PIC 16 Series instruction set with operand conventions (f=file/RAM address 7-bit, b=bit 0-7, d=destination bit, k=literal 8- or 11-bit), explains PORTA/TRISA register pair and banked addressing, covers assembler directives, number radix notations, subroutines/stack, time-delay loops, conditional skip instructions, logical instructions, and look-up tables via RETLW subroutines.

## Fields/API

**name**: Embedded system
**value**: A system whose principal function is not computational, but which is controlled by a computer embedded within it (examples: fridge controller, car door CAN node).
**name**: Memory architectures
**value**: Von Neumann: single shared bus for program and data memory. Harvard: separate buses — used by PIC family, allowing simultaneous instruction fetch and data access.
**name**: Microcontroller vs microprocessor
**value**: Microcontroller = microprocessor core + program memory + data memory + peripherals (digital I/O, analog I/O, counters/timers, serial ports) on a single chip.
**name**: ALU / W register
**value**: 8-bit ALU operates on the W (Working/Accumulator) register. Operations: increment, decrement, add, subtract, AND, OR, XOR, shift left/right, rotate left/right, complement, clear.
**name**: PIC 16 Series core instructions
**value**: MOVLW k — load W with literal k. MOVWF f — store W to file register address f. MOVF f,d — move file register f to destination (d=0→W, d=1→f). ADDWF f,d — add W to f, store in d. ADDLW k — add literal k to W, store in W. SUBWF f,d — subtract W from f. BCF f,b — clear bit b of file f. BSF f,b — set bit b of file f. BTFSC f,b — skip next instruction if bit b of f is 0. BTFSS f,b — skip next instruction if bit b of f is 1. INCF f,d — increment f. DECF f,d / DECFSZ f,d — decrement f, skip if zero. RLF f,d — rotate left through carry (×2). RRF f,d — rotate right through carry (÷2). CLRW — clear W to 0 (sets Z=1). CLRF f — clear file register f to 0 (sets Z=1). GOTO k — unconditional jump to address k. CALL k — call subroutine at k (pushes return address on stack). RETURN — return from subroutine. RETLW k — return from subroutine, load W with literal k (used for look-up tables). NOP — no operation, 1 instruction cycle.
**name**: Status register bits
**value**: Z (Zero): set when result = 0. C (Carry): set on 8-bit overflow (e.g. 0xFA + 0x07 = 0x01, C=1). DC (Digit Carry): half-carry on lower nibble. Bit 5 (RP0): bank select — BSF STATUS,5 selects Bank 1 (TRIS registers); BCF STATUS,5 returns to Bank 0 (PORT registers and program).
**name**: PORTA / TRISA (and PORTB / TRISB)
**value**: PORTA: I/O data register — write to drive pins, read to sense pins. TRISA: direction register in Bank 1 — bit=1 configures pin as input, bit=0 as output. Must switch to Bank 1 (BSF STATUS,5) before writing TRISA, then return to Bank 0 (BCF STATUS,5).
**name**: Assembler directives (MPASM)
**value**: list — listing option. #include — include additional source file. org — set program origin address. equ — assign a numeric value to a label (e.g. status equ 03). end — marks end of program block.
**name**: Number radix notations
**value**: Decimal: D'255'. Hexadecimal: H'8d' or 0x8d. Octal: O'574'. Binary: B'01011100'. ASCII: 'G' or A'G'.
**name**: Assembler source format
**value**: Columns: label (leftmost), instruction mnemonic, operand(s), ;comment. Labels are optional. Source file: .asm → generates .hex (executable), .lst (listing), .err (errors).
**name**: Subroutines and stack
**value**: CALL pushes return address onto hardware stack; RETURN pops it. CALL/RETURN must always be paired. RETLW k is a special return that also loads W with a literal — used for look-up table entries.
**name**: Look-up tables
**value**: Implemented as a subroutine. Caller places index in W, calls table. Table starts with ADDWF PCL (add W to Program Counter low byte to jump to correct entry). Each entry is RETLW <value>. The chosen RETLW fires, loads W with data, and returns.
**name**: Program flow visualisation
**value**: Flow diagrams: linear, easily translated to code but risk spaghetti code. State diagrams: represent distinct system states and transition conditions — better for event-driven systems (e.g. washing machine: pre-wash → wash → rinse).
**name**: PIC 16F873A overview
**value**: Larger sibling of 16F84A. Features: larger program and data memory, parallel ports, serial ports, counter/timers, ADC. Same banked addressing model. Interrupt routine always starts at a fixed program memory address.

## Constraints

- TRIS registers are in Bank 1 — forgetting to switch bank (BSF STATUS,5) before configuring direction pins is a common error; always restore Bank 0 (BCF STATUS,5) before accessing PORT data or running the main loop.
- 8-bit ALU: results wrap modulo 256; overflow sets STATUS,C=1 (e.g. 0xFA + 0x07 = 0x01 with C=1).
- ADDWF f,d: d=0 stores result in W; d=1 stores result back in file register f.
- DECFSZ is the canonical loop-counter instruction: decrement file register and skip the following GOTO when counter reaches zero.
- Look-up table size is limited by the low byte of the Program Counter (PCL); table must not cross a 256-word page boundary.
- The PIC 16 Series has only four conditional instructions, all of the 'skip one instruction' form (BTFSC, BTFSS, DECFSZ, INCFSZ) — complex branching requires chaining skips with GOTO.
- Instruction cycle time depends on clock frequency (e.g. 5 µs at 800 kHz); most instructions = 1 cycle, GOTO/CALL/RETURN = 2 cycles — must account for this in delay subroutine calculations.
- CLRW always sets Z=1 (result is always zero); BCF/BSF do not affect any Status bits even if the result clears a byte to zero.

## Examples

**label**: Minimal loop program
**code**: org 00
  clrw         ; clear W register
loop:
  addlw 08     ; repeatedly add 8 to W
  goto loop
  end
**label**: Fibonacci sequence (8-bit, simulation only)
**code**: Fib0 equ 20 ; fib0, fib1, fib2, fibtemp at RAM 0x20-0x23
fib1 equ 21
fib2 equ 22
fibtemp equ 23
org 00
  clrf fib0
  movlw 1
  movwf fib1
  movwf fib2
forward:
  movf fib1,0     ; W = fib1
  addwf fib2,0    ; W = fib1 + fib2
  movwf fibtemp
  movf fib1,0 : movwf fib0   ; shift: fib0 ← fib1
  movf fib2,0 : movwf fib1   ;        fib1 ← fib2
  movf fibtemp,0 : movwf fib2 ;       fib2 ← new
  goto forward
  end
**label**: PORTA → PORTB data transfer (ping-pong)
**code**: ; Initialise: Bank 1
  bsf status,5
  movlw B'00011000' : movwf trisa  ; RA3,RA4 = inputs
  movlw 00          : movwf trisb  ; PORTB all output
  bcf status,5
; Main loop
  clrf porta
loop:
  movf porta,0   ; read PORTA into W
  movwf portb    ; write W to PORTB
  goto loop
**label**: Button → LED with BTFSS
**code**: loop:
  bcf  portb,3
  btfss porta,3     ; skip next if button pressed (pin high)
  bsf  portb,3      ; set LED if button NOT pressed
  goto loop
**label**: 5 ms delay subroutine (5 µs cycle time)
**code**: delay5:
  movlw D'200'
  movwf delcntr1
del1:
  nop             ; 1 cycle
  nop             ; 1 cycle
  decfsz delcntr1,1 ; 1 cycle (2 when skip)
  goto del1       ; 2 cycles
  return
; 200 × (1+1+1+2) = 1000 cycles × 5 µs = 5 ms
**label**: Look-up table via RETLW
**code**: ; Caller: load index in W, then:
  call table
; W now holds table[index]
table:
  addwf pcl      ; jump to entry W
  retlw 0x23
  retlw 0x3f
  retlw 0x47
  retlw 0x7f
  ; ... etc.
