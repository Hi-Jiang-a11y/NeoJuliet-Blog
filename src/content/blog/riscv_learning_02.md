---
title: 'Exploring RISC-V (II): Machine Language'
author: 'Juliet'
description: 'Learning RISC-V (II)'
pubDate: 'Jan 29 2026'
tags: ["digital circuit", "note"]
pinned: false
license: "CC BY-SA 4.0"
---
> The material discussed in this post is based on **Chapter 6** of ***Digital Design and Computer Architecture: RISC-V Edition*** by *Sarah L. Harris* and *David Harris*.  

# Introduction
Assembly language is ~~convenient~~ for humans to read, but not for digial circuits. Thus a program written in assembly language is tranlated into a repesentation usin only 0s and 1s, called *machine language*.  

This post focus on the mechine language corresponding to the different typs of RISC-V instructions.  

RV32I use 32-bit instructios, even though some instructions may not require all 32 bits.  

RISC-V makes the compromise of defining four main instruction formats: **R-type**, **I-type**, **S/B-type**, and **U/J-type**. Next we'll simply talk about these four types.  

# R-type Instructions
*R-type* (Register-type) instructions use three registers as operands: two as sources and one as a destination.  

R-type intructions include `add`, `sll`, `and`...  

The format of R-type instructions is:  

|31:25 (7 bits)|24:20 (5 bits)|19:15 (5 bits)|14:12 (3 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|:---:|:---:|:---:|
|**funct7**|**rs2**|**rs1**|**funct3**|**rd**|**op**|
|*function field*|*source register 2*|*source register 1*|*function field*|*destination register*|*opreand code*|

Eg1: for instuction `add`:  
```
  add s2,  s3,  s4
# add x18, x19, x20
```
The corresponding machine language is:

|31:25|24:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|:---:|
|**funct7**|**rs2**|**rs1**|**funct3**|**rd**|**op**|
|0000000|10100|10011|000|10010|011 0011|

+ The op (operation code) and function field of `add` is op=0b0110011, funct7=0b0000000, funct3=0b000.  a
    + operation code and function field is used to determine the specific operations, the funct7 of `sub` is 0b0100000 and funct3 and op are the same as `add`.  
+ rs2 and rs1 are the address of *source register*, rd is the address of *destination register*,
    + in this example, rs2 is register `s4`, whose address is x20 (0b10100).
    + and similarly, rs1 is register `s3`, whose address is x19 (0b10011), and the rd is register `s2`, whose address is x18 (0b10010).  

Eg2: for instruction `xor`
```
  xor s8,  s9,  s10
# xor x24, x25, x26
```
The corresponding machine laguage is:

|31:25|24:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|:---:|
|**funct7**|**rs2**|**rs1**|**funct3**|**rd**|**op**|
|0000000|11010|11001|100|11000|011 0011|

+ The op and function field of `xor` is op=0b0110011, funct7=0b0000000, funct3=0b100.  
+ in this example, rs2 is register `s10` (0b11010), rs1 is register `s9` (0b11001), and the rd is register `s8` (0b11000).  

# I-type Instructions
**I-type** (Immediate-type) instructions use two register operands and one immediate operand.  

I-type instructions include `addi`, `andi`, `lw`, `jalr`...  

The format of I-type instructions is:  

|31:20 (12 bits)|19:15 (5 bits)|14:12 (3 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|:---:|:---:|
|**imm**|**rs1**|**funct3**|**rd**|**op**|
|*12-bit immediate*|*source register 1*|*function field*|*destination register*|*operation code*|

Eg1: instuction `addi`:
```
  addi s2,  t1,  -14
# addi x18, x6,  -14
```
The corresponding machine language is:

|31:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|
|**imm**|**rs1**|**funct3**|**rd**|**op**|
|1111 1111 0010|00110|000|10010|001 0011|

+ The op and function field of `addi` is op=0b0010011, funct3=0b000.  
+ in this example, rs1 is register `t1` (0b00110), and the rd is register `s2` (0b10010).  
+ imm is the **2's complement** of the immedaite (-14 -> 0b1111 1111 0010).  

Eg2: insruction `lw`:
```
  lw t2, -6(s3)
# lw x7  -6(x19)
```
The corresponding machine language is:

|31:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|
|**imm**|**rs1**|**funct3**|**rd**|**op**|
|1111 1111 1010|10011|010|00111|000 0011|

+ The op and function field of `lw` is op=0b0000011, funct3=0b010.  
+ in this example, rs1 is register `s3` (0b10011), and the rd is register `t2` (0b00111).  
+ imm is **2's complement** of -6 (0b111111111010).  

# S-type Instructions
**S-type** (store-type) instructions use two register operands and one immediate operand.  

S-type instruction includes `sb`, `sh`, `sw`...  

The format of S-type instructions is:  

|31:25 (7 bits)|24:20 (5 bits)|19:15 (3 bits)|14:12 (5 bits)|11:7 (7 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|:---:|:---:|:--:|
|**imm[11:5]**|**rs2**|**rs1**|**funct3**|**imm[4:0]**|**op**|
|*11-5 bits of imm*|*source register 2*|*source register 1*|*function field*|*4-0 bits of imm*|*operation code*|

**Note** that the 12-bit immediate is is split across two bit ranges: 31:25 stores imm[11:5], 11:7 stores imm[4:0].  

Eg1: instruction `sw`:
```
  sw t2, -6(s3)
# sw x7  -6(x19)
```
The corresponding mechine language is:
|31:25|24:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|:--:|
|**imm[11:5]**|**rs2**|**rs1**|**funct3**|**imm[4:0]**|**op**|
|1111 111|00111|10011|010|1 1010|010 0011|

+ The op and function field of `sw` is op=0b0100011, funct3=0b010.  

# B-type Instructions
**B-type** (branch-type) instructions are quite similar to S-types, the only difference is the immediate field.  

B-type instruction includes `beq`, `bne`, `blt`...  

The format of B-type instructions is:  

|31:25 (7 bits)|24:20 (5 bits)|19:15 (3 bits)|14:12 (5 bits)|11:7 (7 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|:---:|:---:|:---:|
|**{imm[12], imm[10:5]}**|**rs2**|**rs1**|**funct3**|**{imm[4:1], imm[11]}**|**op**|
|*{imm[12], imm[10:5]}*|*source register 2*|*source register 1*|*function field*|*{imm[4:1], imm[11]}*|*operation code*|

B-type instructions encode a **13-bit signed** immediate representing the branch offset, but only 12 of the bits are encoded in the instruction.  
The least significant bit is always 0, because branch amounts are always an even number of bytes.  

The immediate field is weird, which will be explained later.  

Eg1: instruction `beq`:  
Assume there are following instructions with their address:
```
    beq  s0,   t5,   L1     # 0x00000070
  # beq  x8    x30   16
    add  s1,   s2,   s3     # 0x00000074
    sub  s5,   s6,   s7     # 0x00000078
    lw   t0,   0(s1)        # 0x0000007c
L1: addi s1,   s1,   -15    # 0x00000080
```
L1 is **16** bytes (0x00000080 - 0x00000070) past beq, so the immediate should be 16 (**0** 0000 0001 000***~~0~~***).  
The corresponding code for `beq` is:
|31:25|24:20|19:15|14:12|11:7|6:0|
|:---:|:---:|:---:|:---:|:---:|:---:|
|**{imm[12], imm[10:5]}**|**rs2**|**rs1**|**funct3**|**{imm[4:1], imm[11]}**|**op**|
|0 000000|11110|01000|000|1000 0|110 0011|

+ The op and function field of `beq` is op=0b1100011, funct3=0b000.  

# U/J-type Instructions
**U/J-type** (upper immediate/jump-type) instructions have one destination register operand rd and a 20-bit immediate field.  

+ In U-type instructions, the remaining bits specify the most significant 20 bits of a 32-bit immediate.  

+ In J-type instructions, the remaining 20 bits specify the most significant 20 bits of a **21-bit** immediate jump offset.  
As with B-type instructions, the least significant bit of the immediate is always 0 and is not encoded in the J-type instruction.  

The format of B-type instructions is:

|31:12 (20 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|
|**imm[31:12]**|**rd**|**op**|
|*31-12 bits of immediate*|*destination register*|*operation code*|

Eg1: instruction `lui`:
```
  lui s5, 0x8cdef
# lui x21 0x8cdef
```
The corresponding code:

|31:12 (20 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|
|**imm[31:12]**|**rd**|**op**|
|1000 1100 1101 1110 1111|10101|011 0111|

+ The operation field of `lui` is op=0b0110111

The format of J-type instruction only differs in immediate field:
|31:12 (20 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|
|**{imm[20], imm[10:1], imm[11], imm[19:12]}**|**rd**|**op**|
|*{imm[20], imm[10:1], imm[11], imm[19:12]}*|*destination register*|*operation code*|

Eg2: instruction `jar`:
```
        jal   ra,   funct1      # 0x0000540c
      # jal   x1    0xa67f8
        add   s1,   s2,   s3    # 0x00005410
...
funct1: add   s4,   s5,   s8    # 0x000abc04
...
```
`funct1` is 0xa67f8 (0x00abc04 - 0x0000540c) bytes past `jal`, so the immediate should be **0** 1010 0110 0111 1111 100***~~0~~***

The corresponding code:

|31:12 (20 bits)|11:7 (5 bits)|6:0 (7 bits)|
|:---:|:---:|:---:|
|**{imm[20], imm[10:1], imm[11], imm[19:12]}**|**rd**|**op**|
|0 1111111100 0 10100110|00001|110 1111|

+ The operation field of `jar` is 0b1101111

