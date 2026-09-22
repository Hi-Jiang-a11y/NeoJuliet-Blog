---
title: 'Exploring RISC-V (IV): Design a Multi-Cycle Processor (control unit)'
author: 'Juliet'
description: 'Learning RISC-V (IV)'
pubDate: 'Feb 10 2026'
tags: ["digital circuit", "note"]
pinned: false
license: "CC BY-SA 4.0"
---
# Overview
The control unit computes the control signals based on the **op** (Instr[6:0]), **funct3** (Instr[14:12]), and **funct7[5]** (Instr[30]) fields of the instruction.

Figure below shows the entire multi-cycle processor with the contorl unit attatched to the datapath.  
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 3 / 2;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_Datapath+ControlUnit.html"
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

# Control Unit Design

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_ControlUnit.html"
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

The control unit consists of a **Main FSM**, **ALU Decoder**, and a **Instruction Decoder** as shown below.   

+ The **ALU Decoder** produces ALUCtl based on `ALUOp`, `funct3` and `funct7[5]`.  
For example:  

|ALUOp|funct3|{op[5], funct7[5]}|ALUCtl|Instruction|
|:--:|:--:|:--:|:--:|:--:|
|00|xxx|xx|000           (add)|lw, sw|
|01|xxx|xx|001     (substract)|beq|
|10|000|00, 01, 10|000           (add)|add|
|10|000|11|001     (substract)|sub|
|10|010|xx|101 (set less than)|slt|
|10|111|xx|010           (and)|and|

+ **Instruction Decoder** combinationally produces the `ImmSrc` select signal based on the opcode and then the `Imm Extend` will extend the immediate accroding to `ImmSrc`.  

+ The **Main FSM** produce *a sequence of control signals* on the appropriate clock cycles.  
    We design the Main FSM as a **Moore** machine so that the outputs are only a function of the current state.  
    + To keep the following state transition diagrams readable, only the relevant control signals are listed. Multiplexer select signals are listed only when their value matters; otherwise, they are *don’t care*.  
    + Enable signals (`RegWrite`, `MemWrite`, `IRWrite`, `PCUpdate`, and `Branch`) are listed only when they are asserted; otherwise, they are 0.  

Next we will focus on the FSM.  

## lw
The necessary states of instruction `lw` are listed below:  
The data path is shown [HERE](/blog/riscv_learning_03/#lw)
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_01.html"
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

+ Let's start with **S0**, in this state, the processor fetch instruction from memory at the address held in the program counter (PC). To read this instr, set `AdrSrc` to 0.  
+ The second step **S1** is to read the register file and decode the instructions. The processor read the source register and puts the values into nanoarchitecture registers.  
+ The third step **S2** for `lw` is to calculate the memory address. The ALU adds the base address and the offset. At the end of this state, the ALU result is stored in the ALUOut register.  
+ The memory read **S3** state sends the calculated address to the memory by sending ALUOut to the address port of the memory. Here set `ResultSrc` to 00 and `AdrSrc` to 1.  
+ The last step for `lw` is writing the content back to the reegister file **S4**, here set `ResultSrc` to 01 and assert `Regwrite`.  

## sw
Only one more state **S5** is needed to add to support `sw`.  
This state write the content of source register into memory address *rs1 + imm*.  
The data path is shown [HERE](/blog/riscv_learning_03/#sw)
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_02.html"
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

## R-Type
The data path is shown [HERE](/blog/riscv_learning_03/#r-type)
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_03.html"
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

+ After the decode state **S1**, R-type ALU instructions proceed to the Exe R-Type state **S6**, which performs the desired ALU computation.  
Set `ALUSrcA` = 10 and `ALUSrcB` = 00 to choose the contents of rs1 as SrcA and rs2 as SrcB. ALUOp = 10 so that the ALU Decoder uses the instruction’s control fields to determine what operation to perform.  
+ In the ALUWB state **S7**, `ResultSrc` = 00 to select ALUOut as Result, and `RegWrite` = 1 so that rd is written with the result.  
## Program Counter
So far we have finished the support of `lw`, `sw` and R-Type instructions, but the porcessor cannot fetch the next instr yet.   
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_04.html"
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

After **S4**, **S5** and **S7**, the state machine should return to **S0**.  
+ Just as mentioned in the previous post, we use the existing ALU during the instruction fetch step to add the PC by 4.  
    + The data path is shown [HERE](/blog/riscv_learning_03/#program-counter)
    + At **S0**, we set `ALUSrcA` = 00, `ALUSrcB` = 10, `ALUOp` = 00 to perform **PC = PC+4**, and assert `PCUpdate` to update the PC.  

## beq
`beq` compares two registers and computes the branch target address.  

The ALU is idle during the Decode state, so we can use the ALU during that state to calculate the branch target address (OldPC + ImmExt).  

So at state **S1** we set `ALUSrcA` and `ALUSrcB` both 01 and `ALUOp` = 00 to do so.  

After the state **S1**, beq proceeds to the state **S8**, where it compares the source registers. `ALUOp` = 01 so that the ALU performs subtraction.  

If the source registers are equal, the ALU’s `Zero` output asserts (rs1 − rs2 = 0). `branch` = 1 in this state so that if **Zero** is also set, `PCWrite` is asserted and the branch target address **(in ALUOut)** becomes the next PC. `ALUOut` is routed to the PC register by `ResultSrc` being 00.  

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 12 / 5;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_05.html"
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

## Add More Instructions
Here is the example of adding **I-Type** and `jal` instructions.  
**S9** and **S10** are added.  
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 5 / 3;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/FSMChart/FSMChart_final.html"
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

# Perform Analysis
As we mentioned before, the multicycle processor uses varying numbers of cycles for different instructions. However, the multicycle processor does less work in a single cycle and, thus, has a shorter cycle time.  

This multicycle processor requires 3 cycles for branches, 4 for R-type, I-type ALU, jump, and store instructions, and 5 for loads.  

We can find two *possible* **critical paths**: (marked in red and blue):  
<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 60 / 36;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/RISC-V_MultiClock_CriticalPath.html"
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
1. The path to calculate PC+4: From the PC register through the SrcA multiplexer, ALU, and Result multiplexer back to the PC register.(marked in red)  
2. The path to read data from memory: From the ALUOut register through the Result and Adr muxes to read memory into the Data register.(marked in blue)  

Both of the paths require a delay through the decoder after the state updates (i.e., after a t_pcq delay) to produce the control (multiplexer select and ALUControl) signals. Thus, the clock period is:  
```T = t_pcq + t_dec + 2 * t_mux + max[t_ALU, t_mem] + t_setup```

