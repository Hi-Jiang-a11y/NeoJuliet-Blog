---
title: 'Reading Notes: Sequential Verilog & RTL discipline'
author: 'Juliet'
description: 'A Reading Note'
pubDate: 'Jan 25 2026'
tags: ["digital circuit", "note"]
pinned: false
license: "CC BY-SA 4.0"
---
# Sequential Circuits
Sequential circuits differ from combinational circuits in that their outputs depend not only on the current inputs but also on the history of previous inputs. They are composed of combinational logic and storage elements, such as flip-flops, which hold binary information representing the circuit’s current state.  

There are two types of sequential cirtuits:  
+ **Synchronous sequential circuits** update their states at discrete times controlled by a clock signal. Flip-flops in these circuits change only at clock edges, making the circuits stable and predictable.  
+ **Asynchronous sequential circuits** react immediately to input changes, and their behavior depends on the order of input transitions. They often use propagation delays or time-delay elements for storage, which can introduce instability and make design more difficult.  

# Clock and Synchronization
The clock signal defines when sequential circuits update their states. Edge-triggered flip-flops only change state on a rising or falling edge, and the timing of combinational logic propagation determines the minimum clock period.  

For example, in a synchronous counter or an add-and-store circuit, state changes occur strictly at clock pulses. Proper synchronization ensures reliable operation and prevents glitches due to combinational delays.  

# Synthesizable HDL Models
Behavioral modeling allows designers to describe circuit functionality without specifying exact internal structure. In Verilog:  
+ `initial` blocks describe single-pass behavior, useful for testbenches and simulation stimuli. These blocks execute only once at the beginning of simulation and are not synthesizable. [1, pp. 484-485]  
+ `always` blocks describe cyclic behavior, executing repeatedly during simulation. Properly written always blocks can be synthesized into hardware.  

Take a clock generation as a example [1, p. 485]:
```verilog
`timescale 1ns/1ps 
module tb_clock;
    
    reg clock;

    initial begin
        clock = 1'b0;
        $dumpfile("clock_gen.vcd");
        $dumpvars(0, tb_clock);
    end

    always #10 clock = ~clock;

    initial begin
        #300;
        $display("done!");
        $finish;
    end
    
endmodule
```
This will generate a clock signal `clock` with a period of 20 ns.  

# Register Transfer Level(RTL)
RTL provides an abstract way to describe digital systems in terms of registers, operations, and control signals. It focuses on what happens to the data stored in registers, rather than gate-level implementation [1, pp. 737-740][2].  

Register operations include:  
+ Transfer: Move data from one register to another without altering the source, e.g.,`R2 ← R1`.  
+ Arithmetic: Add, subtract, multiply, e.g., `R1 ← R1 + R2`.  
+ Logic: Bitwise operations (AND, OR, XOR) on register data.  
+ Shift: Move bits left or right within a register, e.g., `R4 ← shr R4`.  

All transfers are synchronized to clock edges and subject to propagation delays.  

## Template_1: A 2bits Counter
The counter count from 0 to 3 and output the current value, a synchornous `reset` will reset the value to 0.  
```verilog
module 2bitCounter (
    input clk,
    input reset,
    output reg [1:0] count_out
);
    always @(posedge clk) begin
        if (reset) 
            count <= 2'b00;
        else 
            count <= count + 1;
    end
endmodule
```
Here `count` is a 2 bit register and the operation is `count ← count + 1`.  

## Template_2: Register with Load/Add/Clear
Depending on the control signal, the register can load data / shift left or right / clear its content.  
```verilog
module My_Register (
    input [7:0] data_in,
    input reset, clk, s0, s1, MSB_in, LSB_in,
    output reg [7:0] out
);
    always @(posedge clk) begin
        if (reset) 
            out <= 8'd0;
        else begin
            case ({s1, s0}) 
                2'd1: out <= {MSB_in, out[7:1]}; // Right Shift
                2'd2: out <= {out[6:0], LSB_in}; // Left Shift
                2'd3: out <= in; // Load
                default: out <= out; // Keep
            endcase
        end
    end
endmodule
```
This module represent a synthesizable sequential RTL design, the control signal `s1`, `s2` select which ragister transfer operation is executed at the clock edge.  

# Some Common Pitfalls
1. Using `initial` for Synthesis: In hardware, registers power up in an unstable, random state. While initial blocks work in simulation, synthesis tools ignore them for physical chips. A hardware Reset signal should be used to force registers into a known state at power-up.  
2. Incomplete Sensitivity Lists: Combinational logic must respond to any change in its inputs. In older Verilog, omitting a signal from the `always @(a, b)` list causes the simulation to "freeze" unless the listed signals change, while the actual hardware would keep reacting. This creates a lethal mismatch between simulation and reality [1, p. 880].  
3. Blocking vs. Non-blocking: Blocking assignments (`=`) execute sequentially. Non-blocking assignments (`<=`) execute in parallel, modeling how flip-flops capture data simultaneously at a clock edge. Using `=` in clocked blocks destroys this parallelism, leading to data shifts through multiple registers in a single cycle incorrectly.  
4. Incorrect Reset Style (Async vs Sync): Asynchronous resets (`always @(posedge clk or negedge rst_n)`) trigger immediately regardless of the clock. Synchronous resets only take effect at the clock edge, offering better noise filtering but requiring an active clock to work.  
5. Physical Delays: RTL abstracts away time, but electricity does not. Signal propagation through gates takes time. For a circuit to function, the data must be stable before the clock edge (Setup Time) and remain stable briefly after (Hold Time). If the combinational logic is too complex, the signal won't arrive in time for the next clock pulse, causing the system to capture corrupted data.  
6. Latch Inference: A latch is a level-sensitive storage element that can cause unpredictable timing loops. Latches are accidentally created when combinational logic is incomplete, such as an `if` statement without an `else` or a `case` without a `default`. Because the tool assumes you want to hold the previous value when conditions aren't met, it inserts a physical latch to preserve that state without a clock.
# Reference:
[1] M. M. Mano and M. D. Ciletti, *Digital Design: With an Introduction to the Verilog HDL, VHDL, and SystemVerilog*, 6th ed., Pearson, 2017.   
[2] "What is Register-Transfer-Level (RTL) Design?", 2024. [Online]. Available: https://www.synopsys.com/glossary/what-is-register-transfer-level-design.html. [Accessed: 2026-01-15].  
[3] Waseem, "RTL design: A comprehensive guide to register-transfer level design," Waseem, 2024. [Online]. Available: https://www.wevolver.com/article/rtl-design-a-comprehensive-guide-to-unlocking-the-power-of-register-transfer-level-design. [Accessed: 2026-01-15].  

