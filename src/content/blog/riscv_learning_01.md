---
title: 'Exploring RISC-V (I): Assembly Language'
author: 'Juliet'
description: 'Learning RISC-V (I)'
pubDate: 'Jan 29 2026'
tags: ["digital circuit", "note"]
pinned: false
license: "CC BY-SA 4.0"
---
> The material discussed in this post is based on **Chapter 6** of ***Digital Design and Computer Architecture: RISC-V Edition*** by *Sarah L. Harris* and *David Harris*.  

# Introduction
This post focuses on key RISC-V assembly language instructions and their corresponding machine code formats. It serves as a set of learning notes and insights.  
**Note**: This post focuses on the RV32I RISC-V architecture, which uses 32-bit registers, 32-bit instructions, and 32-bit memory addresses.  

Before diving into assembly instructions and machine code, it is important to understand the architectural state of a RISC-V processor, which defines all the information needed to determine the behavior of a program.  

# Register File
> When a program runs, values are loaded from memory into registers using load instructions, CPU performs operations inside registers, results are stored back to memory if needed using store instructions.  

+ This means that the CPU never adds memory locations directly, it always moves values into registers first, then performs arithmetic or logical operations.  
+ Accessing registers is faster than accessing memory, but it is limited in storage.  

+ RV32I has 32 general-purpose registers, named `x0` to `x31`, listed as follow:  

| Name | Register Num | Use |
|:---:|:---:|:---|
|zero|x0|Constant value 0|
|ra|x1|Return address|
|sp|x2|Stack pointer|
|gp|x3|Global pointer|
|tp|x4|Thread pointer|
|t0-2|x5-7|Temporary registers|
|s0/fp|x8|Saved register/Frame pointer|
|s1|x9|Saved register|
|a0-1|x10-11|Function arguments / Return values|
|a2-7|x12-17|Function arguments|
|s2-11|x18-27|Saved registers|
|t3-6|x28-31|Temporary registers|

Note that the `s0` to `s11`(s for saved), `sp`, and `ra` are perserved registers.  
`t0` to `t6`(t for temporary) and `a0` to `a7`(a for argument) are the nonpreserved registers, also called scratch registers.  
The difference of `preserved` and `nonpreserved` will be mentioned on [section4.10.2](#preserved--nonpreserved-register)  and later will explain the usage of these different registers.  

# Memory
> If registers were the only storage space for operands, we would be confined to simple programs with no more than 32 variables.  

+ The register file is small and fast, memory is larger and slower. For this reason, frequently used variables are kept in registers.  

+ In the RISC-V architecture, instructions operate exclusively on registers, so data stored in memory must be moved to a register before it can be processed.  

+ By using a combination of memory and registers, a program can access a large amount of data fairly quickly.  

+ RV32I uses 32-bit addresses, and memory is byte-addressable, which means that every memory address (`0x00000000` to `0xffffffff`) points to a single **byte**. A `word` consists of **4** bytes.  

Example
| Byte3 | Byte2 | Byte1 | Byte0 | Address
|:---:|:---:|:---:|:---:|:---:
|c d|1 9|a 6|5 b|00000010
|a b|0 f|0 7|8 8|0000000c
|f 2|f 1|a c|0 7|00000008
|a b|c d|e f|0 0|00000004

# Assembly Language
> In this section, a few RISC-V assembly instructions will be introduced.  
The RISC-V instruction set makes the common case fast by including only simple, commonly used instructions.  
Just like its name, "Reduced Instruction Set Computer", the number of instructions is kept small so that the hardware required to decode the instruction and its operands can be simple, small, and fast.  
+ Assembly language is the human-readable representation of the computer’s native language. Each assembly language instruction specifies both the operation to perform and the operands on which to operate.  

Like data, instructions are stored in memory. Each instruction is 32 bits (4 bytes) long, so consecutive instruction addresses increase by **4**.  
For example, in the code snippet below, the `addi` instruction is located in memory at address `0x00000538` and the next instruction, `lw`, is at address 0x0000053C.  

| Instruction | Address |
|:---:|:---:|
|addi s1, s2, s3|00000538|
|lw    t2, 8(s1)|0000053c|
|sw    s3, 4(t6)|00000540|

There is a **Program Counter (PC)** that keeps track of the current instruction. The PC holds the memory address of the current instruction and increments by **4** after each instruction completes.  
So that the processor can read or *fetch* the next instruction from memory.  
For example, when `addi` is executing, PC is 0x00000538. After addi completes, PC increments by 4 to `0x53c` and the processor fetches the `lw` instruction at that address.  

## Addition/Subtraction
One of the most common operations computers perform is addition.  

In C, writing `a = b + c;` will add variables `b` and `c` and write the result to `a`, this is corresponding to: 
```
add s1, s2, s3
```
+ Here we assume that register `s2` holds the value of `b`, register `s3` holds the value of `c`, and register `s3` holds the value of `a`.  

And similarily, `a = b - c;` corresponds to: 
```
sub s1, s2, s3
```
`a = b + c − d;` corresponds to :
```
add t0, s2, s3 # t = b + c
sub s1, t0, s4 # a = t − d
```
+ Here register `s4` holds the value of `d` and register `t0` holds the value of a temporary variable `b + c`.  

## Constant/Immediates
RISC-V instructions can use constant or immediate operands. These constants are called **immediates** because their values are immediately available from the instruction and do not require a register or memory access.  
For example, `addi` instruction adds an immediate to a register, just like `a = a + 4; b = a - 12` in C:
```
# s0 = a, s1 = b
addi s0, s0, 4
addi s1, s0, −12
```
And it's also useful for initializing a variable `int a = 2047`:
```
# s0 = a
addi s0, zero, 2047
```
+ Remember that `zero` is the register holds value 0,  
+ This will set `a` to 2047  

**Note** that here the immediate is a **12-bit 2's complement**, so they are sign-extended to 32 bits,  

If you want to set number larger than 12 bits, instruction `lui` (*load upper immediate*) is needed,  
this instruction is used to set the higher 20 bits of a immediate:
```
# s0 = a
lui  s0, 0xfeedb     # s0 = 0xfeedb000
addi s0, s0, −1657   # s0 = 0xfeeda987
```
+ This is equivalent to `int a = 0xfeeda987`  
+ Remember that addi sign-extends the 12-bit immediate, so a negative immediate will have all 1’s in its upper 20
bits.  
+ Because all 1’s is −1 in two’s complement, adding all 1’s to the upper immediate results in subtracting 1 from the upper immediate.  

## Load & Store
*Load/Store instructions move data between memory and registers.*

`lw` (load word) instruction will load the content from memory to register:
```
# s0 = a
lw s0, 8(zero) # s0 = data at memory address (zero + 8)
```
+ Here 8 is a *offset*, this instruction will load the data value stored at memory address 0x00000008.  

`sw` (store word) instruction writes a data word from a register into memory.
```
addi t3, zero, 42    # t3 = 42
sw   t3, 20(zero)    # data value at memory address 20 = 0x0000002a
```
+ This writes the value 42 from register `t3` into memory word 5, located at address 0x00000020.  

## Logical
*RISC-V logical operations include and, or, and xor. These each operate bitwise on two source registers and write the result to a destination register.*  
```
and s3, s1, s2
or  s4, s1, s2
xor s5, s1, s2
```
A immedate is also supported:
```
andi s6, s1, 0xff7
```

## Shift
*Shift instructions* shift the value in a register left or right, dropping bits off the end.  

RISC-V shift operations are `sll` (shift left logical), `srl` (shift right logical), and `sra` (shift right arithmetic).  

+ Left shifts always fill the least significant bits with zeros.  
+ Right shifts can be either *logical* (zeros shift into the most significant bits) or *arithmetic* (the sign bit shifts into the most significant bits). These shifts specify the shift amount in the second source register.  
+ Immediate versions of each instruction are also available (`slli`, `srli`, and `srai`), where the amount to shift is specified by a 5-bit unsigned immediate.  

Assume the data in `s5` holds the value `1111 1111 0001 1100 0001 0000 1110 0111`:
```
slli t0, s5, 7    # shift  left logically,     t0 will get 1000 1110 0000 1000 0111 0011 1000 0000
srli s1, s5, 17   # shift right logically,     t0 will get 0000 0000 0000 0000 0111 1111 1000 1110
srai t2, s5, 3    # shift right arithmetically t0 will get 1111 1111 1110 0011 1000 0010 0001 1100
```
## Branching
Programs would be boring if they could only run in the same order every time.  
A computer performs different tasks depending on the input. For example, if/else statements, a switch/case statements, while loops, and for loops all conditionally execute code depending on some test.  

Branch instructions modify the flow of the program so that the processor can fetch instructions that are not in sequential order in memory.  

They modify the Program Counter (PC) to skip over sections of code or to repeat previous code.  

### Conditional Branches
The RISC-V instruction set has six conditional branch instructions, each of which take two source registers and a label indicating where to go.  

+ `beq` (branch if equal) branches when the values in the two source registers are equal.  
+ `bne` (branch if not equal) branches when they are unequal.  
+ `blt` (branch if less than) branches when the value in the first source register is less than the value in the second.  
+ `bge` (branch if greater than or equal to) branches when the first is greater than or equala to the second.  

**Note** that blt and bge treat the operands as **signed** numbers, while `bltu` and `bgeu` treat the operands as **unsigned**.  

```
    addi s0, zero, 4        # s0 = 0 + 4 = 4
    addi s1, zero, 1        # s1 = 0 + 1 = 1
    slli s1, s1,   2        # s1 = 1 << 2 = 4
    beq  s0, s1,   target   # s0 = = s1, so branch is taken
    addi s1, s1,   1        # not executed
    sub  s1, s1,   s0       # not executed

target:                     # lable
    add  s1, s1,   s0       # s1 = 4 + 4 = 8
```
+ Assembly code uses *labels* to indicate instruction locations in the program.  
+ A label refers to the instruction just after the label. When the assembly code is translated into machine code, these labels correspond to **instruction addresses**.  

### Unconditional Branches (Jumps)
A program can jump unconditionally by one of these three instructions: jump (j), jump and link (jal), or jump register (jr). These instruction will be covered in [section4.10](#function-calls) later.  

## Conditional Branches
if/else, and switch/case statements are conditional statements commonly used in high-level languages.  
They each conditionally execute a block of code consisting of one or more statements.  
This section shows how to translate these high-level constructs into RISC-V assembly language.  

```
if (a = = b)
    f = g + h;
else
    a = b − h;
```
This can be translated into:
```
# s0 = a, s1 = b
# s2 = f, s3 = g, s4 = h
    bne s0, s1, L1           # skip if (a != b)
    add s2, s3, s4           # f = g + h
    j   L2
L1: sub s0, s1, s4           # a = b − h
L2:
```
Also a switch/case: 
```
switch (button) {
    case 1: amt = 20; break;
    case 2:
        amt = 50; break;
    case 3:
        amt = 100; break;
    default: amt = 0;
}
```
This can be translated into:
```
# s0 = button, s1 = amt
case1:
    addi   t0, zero,   1
    bne    s0, t0,     case2
    addi   s1, zero,   20
    j      done
case2:
    addi   t0, zero,   2
    bne    s0, t0,     case3
    addi   s1, zero,   50
    j      done
case3:
    addi   t0, zero,   3
    bne    s0, t0,     default
    addi   s1, zero,   100
    j      done
default:
    add    s1, zero,   zero
done:
```
+ **Note** that the instruction `j` is a *persudoinsruction* which is not actually part of the RISC-V instruction set but that are commonly used by programmers and compilers. When converted to machine code, pseudoinstructions are translated into one or more RISC-V instructions.  

## Loops
While and for loops also can be implemented as follow:
```
int pow = 0;
int x = 0;
while (pow != 128) {
    pow = pow * 2;
    x = x + 1;
}
```
```
# s0 = pow, s1 = x
       addi   s0,   zero, 1      # pow = 1
       add    s1,   zero, zero   # x = 0
       addi   t0,   zero, 128
while: beq    s0,   t0,   done
       slli   s0,   s0,   1      # pow = pow * 2
       addi   s1,   s1,   1
       j      while
done:
```
## Arrays
### A int Aarray
Here is a example accessing an array:
```
int i;
int scores[200];
for (i = 0; i < 200; i = i + 1)
    scores[i] = scores[i] + 10;
```
```
# s0 = scores base address, s1 = i
     addi  s1,  zero,  0       # i = 0
     addi  t2,  zero,  200     # t2 = 200
for:
     bge   s1,  t2,    done    # if i >= 200 then done
     slli  t0,  s1,    2       # t0 = i * 4
     add   t0,  t0,    s0      # address of scores[i]
     lw    t1,  0(t0)          # t1 = scores[i]
     addi  t1,  t1,    10      # t1 = scores[i] + 10
     sw    t1,  0(t0)          # scores[i] = t1
     addi  s1,  s1,    1       # i = i + 1
     j     for                 # repeat
done:
```
### String
`lb` (load byte), `lbu` (load byte unsigned), `sb` (store byte) instructions access individual bytes in memory.  
+ `lb` sign-extends the byte.  
+ `lbu` zero-extends the byte to fill the entire 32-bit register.  
+ `sb` stores the least significant byte of the 32-bit register into the specified byte address in memory.  

For example, assume the base address, `s4`, being 0x000000d0.
```
lb s2, 3(s4)
```
+ This loads the byte at memory address 0x000000d3 into the least significant byte (LSB) of register `s2` and signextends the byte into the upper 24 bits of the register.  

```
lbu s3, 2(s4)
```
+ This loads the byte at memory address 0x000000d2 into the least significant byte (LSB) of register `s3` andfills the remaining 24 bits with 0.  

```
sb s3, 1(s4)
```
+ This stores only the least significant byte of reister `s3` into memory address 0x000000d1.  

## Function Calls
RISC-V uses `jal` (jump and link) instruction to call a function and `jr` (jump register) instruction  to return from a function.  

Example: 
```
int main() {
    simple();
    ...
}

void simple() {
    return;
}
```
Here is the assembly version with insruction address lised:
```
0x00000300   main:    jal  simple   # call function
0x00000304   ...
...
0x0000051c   simple:  jr   ra       # return
...
```
+ `jal simple` performs two tasks:  
    + jumps to the target instruction located at simple (0x0000051C).  
    + stores the return address, the address of the instruction after jal (in this case, 0x00000304) in the *return address* register `ra`, so that the next instruction after calling the `simple` function can be found.  
+ `jr` is also a persudoinstruction.  

Here is another example:
```
int main{
    int x ;
    x = DiffofSums(1, 2, 3, 4);
}
int DiffofSums (int a, int b, int c, int d){
   int result;
   result = (a + b) - (c + d);
   return result;
}
```
```
# s7 = x
main:
         addi  a0,  zero,  2    # argument 0 = 2
         addi  a1,  zero,  3    # argument 1 = 3
         addi  a2,  zero,  4    # argument 2 = 4
         addi  a3,  zero,  5    # argument 3 = 5
         jal   DiffofSums       # call function
         add   s7,  a0,  zero   # x = returned value
# s3 = result
DiffofSums:
         add   t0,  a0,    a1   # t0 = f+g
         add   t1,  a2,    a3   # t1 = h+i
         sub   s3,  t0,    t1   # result = (f+g)−(h+i)
         add   a0,  s3,  zero   # put return value in a0
         jr    ra               # return to caller
```
### The Stack
The stack is memory that is used as scratch space—that is, to save temporary information within a function.  

The register `sp` (stack pointer)  starts at a high memory address and decrements to expand as needed.  

One of the important uses of the stack is to save and restore registers that are used by a function. A function should calculate a return value but have no other unintended side effects.  
In particular, a function should not modify ansy registers besides `a0`, the one containing the return value. `The DiffofSums` function violates this rule because it modifies `t0`, `t1`, and `s3`. If main had been using these registers before the call to diffofsums, their contents would have been corrupted by the function call.  

So, to solve this problem, a function should saves registers on the stack before it modifies them and then restores them from the stack before it returns.  

Here shows an improved version of diffofsums that saves and restores `t0`, `t1`, and `s3`:
```
# s3 = result
DiffofSums:
         addi  sp,  sp,   −12    # make space on stack to store three registers
         sw    s3,  8(sp)        # save s3 on stack
         sw    t0,  4(sp)        # save t0 on stack
         sw    t1,  0(sp)        # save t1 on stack
         add   t0,  a0,   a1     # t0 = f + g
         add   t1,  a2,   a3     # t1 = h + i
         sub   s3,  t0,   t1     # result = (f + g) − (h + i)
         add   a0,  s3,   zero   # put return value in a0
         lw    s3,  8(sp)        # restore s3 from stack
         lw    t0,  4(sp)        # restore t0 from stack
         lw    t1,  0(sp)        # restore t1 from stack
         addi  sp,  sp,   12     # deallocate stack space
         jr    ra                # return to caller
```

### Preserved & Nonpreserved Register
The code above assumes that all of the used registers (`t0`, `t1`, and `s3`) must be saved and restored.  
If the calling function does not use those registers, the effort to save and restore them is wasted. To avoid this waste, RISC-V divides registers into preserved and nonpreserved categories.  

Preserved registers must contain the same values at the beginning and end of a called function because the caller expects preserved register values to be the same after the call.  

+ The preserved registers are `s0` to `s11` (s for saved), `sp` (stack pointer), and `ra` (return address).  
+ The *nonpreserved registers*, also called *scratch registers*, are `t0` to `t6` (t for temporary) and `a0` to `a7` (a for argument).  
+ A function can change the nonpreserved registers freely but must save and restore any of the preserved registers that it uses.

## Additional Arguments
Functions may have more than eight input arguments and may have too many local variables to keep in preserved registers. The stack is used to store this information. By RISC-V convention, if a function has more than eight arguments, the first eight are passed in the argument registers (`a0` − `a7`) as usual. Additional arguments are passed on the stack, just above sp.  

# Summary/What's next
So far only some of the instrucions are introduced, this post give a general view of RISC-V insruction set and some basic knowledge of assembly language, and new posts will focus on the hardware implementation of a RISC-V architecture microprocessor.

Next post will focus on the format of **machine code** of different types of assembly instructions.
