---
title: 'Exploring RISC-V (III): Design a Multi-Cycle Processor (datapath)'
author: 'Juliet'
description: 'Learning RISC-V (III)'
pubDate: 'Feb 02 2026'
updatedDate: 'Feb 7 2026'
tags: ["digital circuit", "note"]
pinned: false
license: "CC BY-SA 4.0"
---
> The material discussed in this post is based on **Chapter 7** of ***Digital Design and Computer Architecture: RISC-V Edition*** by *Sarah L. Harris* and *David Harris*.  

# Introduction
In the previous two blog posts [RISC-V learning1](/blog/riscv_learning_01/) and [RISC-V learning2](/blog/riscv_learning_02/), we focus on **what instructions look like:** the RISC-V assembly language, instruction formats, and their corresponding machine codes.  

However, knowing the encoding of instructions does not explain how a processor actually executes them.

So this post will move from the ***instruction set architecture (ISA)*** to the ***microarchitecture*** of a processor.


## Microarchitecture
*Microarchitecture* is the connection between **logic** and **architecture**. Microarchitecture is the specific arrangement of registers, arithmetic logic units (ALUs), finite state machines (FSMs), memories, and other logic building blocks needed to implement an architecture.  

A particular architecture, such as RISC-V, may have many different microarchitectures, each with different trade-offs of performance, cost, and complexity. They all run the same programs, but their internal designs vary widely. And this post will focus on a multi-cycle microarchitecture.  

In *Haris*'s textbook, three microarchitectures are introduced: 
+ ***single-cycle*** microarchitecture:  
    Executes an entire instruction in one clock cycle. It is quite easy to design. However, the cycle time is limited by the slowest instruction.  
    Moreover, the processor requires separate instruction and data memories, which is generally unrealistic.  
+ ***multi-cycle*** microarchitecture:  
    Executes instructions in a series of shorter cycles. Simpler instructions execute in fewer cycles than complicated ones.  
    Reduces the hardware cost by reusing expensive hardware blocks, such as adders and memories. For example, the adder may be used on different cycles while carrying out a single instruction, later we will explain this.  


+ ***pipelined*** microarchitecture:  
    Applies pipelining to the single-cycle microarchitecture. It therefore can execute several instructions simultaneously, improving the throughput significantly. And we will cover this microarchitecture in a later article.  


## Architectural State & Instruction Set
The architectural state for the RISC-V processor consists of the **program counter** and the **32 32-bit registers**. Any RISC-V microarchitecture must contain all of this state.  
Based on the current architectural state, the processor executes a particular instruction with a particular set of data to produce a new architectural state.  

To keep the microarchitectures easy to understand, we focus on a subset of the RISC-V instruction set:
+ R-type instructions.  
+ Memory insturctions: `lw` `lw`.  
+ Branches: `beq`.  

> Once you understand how to implement these instructions, you can expand the hardware to handle others.

We divide our microarchitectures into two interacting parts: the ***datapath*** and the ***control unit***.  
+ The **datapath** operates on words of data. It contains structures such as memories, registers, ALUs, and multiplexers.  
We are implementing the 32-bit RISC-V (RV32I) architecture, so we use a **32-bit** datapath.  

+ The **control unit** receives the current instruction from the datapath and tells the datapath how to execute that instruction.  

***

# Components
There are few components you should be familiar with before we start designing.  

1. The ***PC (Program Counter)*** points to the current address of instruction, ***PC_Next*** points to the address of *next* instructiuon.  

2. The ***memory*** has a single *read/write port*, it takes a 32-bit instruction address input, `A` (address), and reads the 32-bit data, `RD` (read data).  

    If `WE` (write enable) is asserted, the content of `WD` (write data) will be wrote into address A, on the rising edge of clock.  

3. The 32-element × 32-bit ***register file*** holds registers x0–x31. The register file has **two read ports** and **one write port**.  

    The read ports take 5-bit address inputs, `A1` and `A2`, each specifying one of the 2^5 = 32 registers as source operands. The register file places the 32-bit register values onto read data outputs `RD1` and `RD2`.  

    The write port, port 3, takes a 5-bit address input, `A3` and a 32-bit write data input, `WD`. If its `WE` (write enable) is asserted, then the register file writes the content of `WD` into the register whose address is `A3` on the rising edge of the clock.  

4. The ***ALU (Arithmetic/Logical Unit)*** combines a variety of mathematical and logical operations into a single unit. A typical ALU might perform addition, subtraction, AND, and OR operations.  

    In this example, ALU has *two 32-bit inputs* and a control port *ALUCtl* to determinate specific operation, for example, if ALUCtl = 000, ALU computes A + B, if ALUCtl = 001, ALU computes A - B ...  

    ALUs also produce extra outputs, called *flags* (not listed in the figure), that indicate information about the ALU output. The Flags output is composed of the N, Z, C, and V flags that indicate that the ALU result is **N**egative or **Z**ero or the adder produced a **C**arry out or o**V**erflowed.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1000px;
    aspect-ratio: 3 / 1;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_Components.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

***

# Datapath Design

Multi-Cycle microarchitecture executes instructions in a series of shorter cycles. Microprocessor accomplishes this by introducing several **nonarchitectural registers** to hold intermediate results.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 2 / 1;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_CombLogic.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

+ As shown in the figure, first CombLogic1 will calculate the result and wait for the next rising clock. Once the rising edge come, register2 will hold the temporary data and it will be further processed by CombLogic2 ...  

+ The multicycle processor executes only one instruction at a time, but each instruction takes multiple clock cycles.  

+ Thus this processor requires only a single memory, accessing it on one cycle to fetch the instruction and on another cycle to read/write data.

> Because they use less hardware than single-cycle processors, multi-cycle processors were the historical choice for inexpensive systems.  

## lw

Multi-cycle microarchitecture decompose a complex instruction into few steps.  
In this example, the first step is to ***fetch the instruction*** from memory.  
+ The `PC` contains the address of the instruction to execute, and it is simply connected to the address input (`A`) of the memory.  
+ The instruction (`Instr`) is read and stored in a new nonarchitectural instruction register (IR) so that it is available for future cycles. The IR recievees an enable signal `IRWrite` which is asserted when the R should be loaded with a new instruction.  
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_01.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

+ The second step is to ***read the source register*** containing the base address. This register is specified in the **rs1** field (Instr[19:15]). These bits of the instruction are connected to address input `A1` of the register file, as shown in Figure.  
+ The lw instruction also requires a 12-bit offset immediate (Instr[31:20]), which must be sign-extended to 32 bits, so an **immediate extender** is also need in step2.  
The 32-bit extended immediate is called ImmExt. To be consistent, another (nonarchitecture) register is need. However, ImmExt is a combinational function of Instr and will not change while the current instruction is being processed, so there is no need to dedicate a register to hold the constant value.  
+ The third step is to sum up the address of **rs1** and **offset** (ImmExt), so the **ALU** should perform *addition*. `ALUResult` is stored in another register called ALUOut.  

Okay, so far we have got the target memory address, next we need to load the content into the destination register (**rd**).  

***

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_02.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

Forth step, get the content of the calculated address, so we need to come back to the memory.  
+ We add a **multiplexer** in front of the memory to choose the memory address, `A`, from either the `PC` or `ALUOut` based on the `AdrSrc` select signal.  
+ We need a nonarchitecture register to store the **Data** of that address.  
+ Because in this step IR is disabled, so there is no need to worry that `Instr` will be overwritten by `Data`.  

Next we will write `Data` back to **destination register** (rd).  

***

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_03.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

Instead of connecting the Data register directly to the register file’s `WD3` write port, let us add a multiplexer on the Result bus to choose either `ALUOut` or `Data` before feeding the result back to the register file’s writedata port, because other instructions will need to write a result from the ALU to the register file.  
+ Hence, we add another control signal `ResultSrc`.  
+ The destination register is specified by the **rd** field of the instruction (Instr[11:7]).

***

## sw
So far we have design the datapath of instruction `lw`, now let's extend the datapath to handle instruction `sw`.  

`sw` reads a base address from port 1 of the register file and extends the immediate on the second step. Then, the ALU adds the base address to the immediate to find the memory address on the third step.  

The only new feature of sw is that we must read a second register from the register file and write its contents into memory, as shown in figure below.  

+ The purple line represents the datapath of 'base address plus the offset'.  
+ The pink line represents the datapath of the 'data that needs to be written to memory'.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_04.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

+ The rs2 field of the instruction, (Instr[24:20]), is connected to the second port of the register file (`A2`).  
+ After it is read on the second step, the register’s contents are then stored in a nonarchitectural register, the `WriteData` register. It is then sent to the write data port (`WD`) of the data memory to be written on the fourth step.  

***
## R-Type

Add support for R-type instructions is quite simple, only a little modification is needed.  
+ A **multiplexer** and its corresponding **selection signal** `ALUSrc` is added to choose the data from either rs2 (`RD2`) or immediate (`ImmExt`), and then ALU can process calculations like addition, AND, OR, Shift left/right ...  
+ Then the result is written back to the register file.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_05.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

***

## Program Counter

We have designed the datapath for `lw`, `sw`, and R-type instructions, this section will add the support for **PC**.  

Except for the J-type and B-type instructions, PC_Next is always PC + 4, so a adder is needed. In the multi-cycle processor, we can use the existing ALU during the **instruction fetch step** because it is not busy.  

+ So, we must insert **source multiplexers** to choose PC and the constant 4 (32'd4) as ALU inputs, as shown in figure below.  
+ Their corresponding control signal is `ALUSrcA` and `ALUSrcB`.  

The datapath of PC is marked with pink wires.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_06.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

+ **Note** that at the same time, `Instr` is being fetched.  

***

## beq
Time for `beq` now.  

`beq` checks whether two register contents are equal and computes the branch target address by adding the current PC to a **13-bit signed** branch offset. The hardware to compare the registers using subtraction is already present in the datapath.  

We can still use ALU to compute `PC_Next` because it is still not busy when **fetching the content of the register file**.  

+ **Note** that this step is executed after fetching the instruction and at the same time, the processor is fetching the content of **rs1** and **rs2**.  
+ **Note** that before this step, PC has already been updated, so a nonarchitecture register is need to hold the **old value** of PC.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 37;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_final.html"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      ">
    </iframe>
  </div>
</div>

+ PC_Next = Old_PC + ImmExt.  

***

> This completes the design of the multi-cycle datapath. Nonarchitectural registers are inserted to hold the results of each step. In this way, the memory can be shared for instructions and data and the ALU can be reused several times, thus reducing hardware costs.  

# Control Unit Design
A **FSM controller** is to deliver the appropriate sequence of control signals to the datapath on each step of each instruction.  

This is a bit troublesome, I'll leave it to the next post.  
