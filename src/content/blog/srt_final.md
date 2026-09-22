---
title: 'Verilog Design: Configurable Pattern Detector'
author: 'Juliet'
description: 'Implement a configurable pattern detector via verilog'
pubDate: 'Jan 26 2026'
tags: ["digital circuit"]
pinned: false
license: "CC BY-SA 4.0"
---

# Project Objective

The objective of this project is to design and implement a synchronous digital system capable of detecting a user-defined 4-bit pattern within a serial bitstream. The system supports two modes of operation: **overlapping detection** and **non-overlapping detection**, controlled by a configuration signal.

The design emphasizes full synchrony, modularity, and synthesizability, making it suitable for integration into larger digital systems.

---

# System Architecture

The system is composed of four main functional blocks:

- **Shift Register**  
  A 4-bit serial-in, parallel-out shift register that stores the most recent input bits. The register updates only when the global enable signal `en` is asserted.

- **Comparator**  
  A combinational logic block that compares the current shift register contents with the user-defined pattern.

- **Finite State Machine (FSM)**  
  A Mealy-type FSM responsible for determining whether a detected pattern should be considered a valid match, depending on the selected detection mode.

- **Counter**  
  An 8-bit register that increments on the rising edge of the clock whenever a valid match is confirmed by the FSM.

---

# Finite State Machine Design

## State Definitions

The FSM uses two states to implement the lockout mechanism required for non-overlapping detection:

- **READY**  
  The default state. The detector is actively searching for new pattern occurrences.

- **COOLDOWN**  
  The lockout state used in non-overlapping mode. While in this state, additional matches are suppressed until a mismatch occurs.

---

## State Transition Logic

The FSM behavior can be summarized as follows:

- In **READY**, if no match is detected, the system remains ready.
- If a match occurs:
  - In overlapping mode, the FSM stays in **READY**.
  - In non-overlapping mode, the FSM transitions to **COOLDOWN**.
- In **COOLDOWN**, the FSM remains locked as long as the input continues to match.
- Once a mismatch is detected, the FSM returns to **READY**.

This logic ensures that overlapping matches are allowed only when explicitly enabled.

| Current State | Condition: `match` | Condition: `overlap_en` | Next State | Description |
| :--- | :---: | :---: | :--- | :--- |
| **`READY`** | `0` | `X` | **`READY`** |No pattern found|
| **`READY`** | `1` | `1` | **`READY`** |Match found; overlapping allowed, stay ready for next bit|
| **`READY`** | `1` | `0` | **`COOLDOWN`** |Match found; non-overlapping mode, enter lockout|
| **`COOLDOWN`** | `1` | `X` | **`COOLDOWN`** |stay in lockout|
| **`COOLDOWN`** | `0` | `X` | **`READY`** |Pattern cleared; return to ready|
---

## Output Logic

- **valid_match**  
  A Mealy-type output that determines whether the match counter should increment.
  - In overlapping mode, any match is considered valid.
  - In non-overlapping mode, a match is valid only if the FSM is in the READY state.

- **match_pulse**  
  A one-clock-cycle pulse generated whenever a valid match occurs.

---

# Verification and Simulation

## Overlapping Detection Mode
testbentch:
<details>
<summary><strong>Click to unfold: Testbench 1</strong></summary>

<pre><code class="language-verilog">
`timescale 1ns/1ps

module tb_pattern_detector();

    reg clk, rst, en, din, overlap_en;
    reg [3:0] pattern;
    wire match_pulse;
    wire [7:0] match_count;
    wire [3:0] shift_view;

    Pattern_Detector tb_PD (
        .clk(clk),
        .rst(rst),
        .en(en),
        .din(din),
        .overlap_en(overlap_en),
        .pattern(pattern),
        .match_pulse(match_pulse),
        .match_count(match_count),
        .shift_view(shift_view)
    );

    initial begin
        $dumpfile("Tb_1_Overlap.vcd");
        $dumpvars(0, tb_pattern_detector);
        #400;
        $display("Done!");
        $finish;
    end

    initial begin
        clk = 1'b0;
        forever #10 clk = ~clk;
    end

    initial fork
        rst = 1'b1;
        en = 1'b1;
        din = 1'b0;
        overlap_en = 1'b1;
        pattern = 4'b1111;
        #20 rst = 1'b0;
        #60 din = 1'b1;
        #140 din = 1'b0;
        #160 din = 1'b1;
    join

endmodule
</code></pre>
</details>

+ [**Click Here to View Waveform**](/images/Tb_1.pdf)   

In overlapping detection mode, the detector is configured to allow consecutive overlapping matches.

With a target pattern of `1111` and an input stream such as `00111101111...`, the system correctly asserts `match_pulse` each time the pattern appears, even when successive matches share bits.

The FSM remains in the READY state throughout, and the match counter increments accordingly.

---

## Non-overlapping Detection Mode

testbentch:
<details>
<summary><strong>Click to unfold: Testbench 2</strong></summary>

<pre><code class="language-verilog">
`timescale 1ns/1ps

module tb_pattern_detector();

    reg clk, rst, en, din, overlap_en;
    reg [3:0] pattern;
    wire match_pulse;
    wire [7:0] match_count;
    wire [3:0] shift_view;

    Pattern_Detector tb_PD (
        .clk(clk),
        .rst(rst),
        .en(en),
        .din(din),
        .overlap_en(overlap_en),
        .pattern(pattern),
        .match_pulse(match_pulse),
        .match_count(match_count),
        .shift_view(shift_view)
    );
    
    initial begin
        $dumpfile("Tb_2_NonOverlap.vcd");
        $dumpvars(0, tb_pattern_detector);
        #300;
        $display("Done!");
        $finish;
    end

    initial begin
        clk = 1'b0;
        forever #10 clk = ~clk;
    end

    initial fork
        rst = 1'b1;
        en = 1'b1;
        din = 1'b0;
        overlap_en = 1'b0;
        pattern = 4'b1111;
        #20 rst = 1'b0;
        #20 din = 1'b1;
        #120 din = 1'b0;
        #140 din = 1'b1;
    join

endmodule
</code></pre>
</details>

+ [**CLick Here to View Waveform**](/images/Tb_2.pdf)   

In non-overlapping mode, the same target pattern `1111` is used with an input stream like `1111101111...`.

After the first valid match, the FSM transitions from READY to COOLDOWN. While the input continues to overlap with the detected pattern, additional matches are suppressed.

Once a mismatch occurs, the FSM returns to READY, allowing the next valid pattern detection. This confirms correct enforcement of the non-overlapping constraint.

---

## Non-overlapping Detection with Pattern `1011`
testbentch:
<details>
<summary><strong>Click to unfold: Testbench 3</strong></summary>

<pre><code class="language-verilog">
`timescale 1ns/1ps

module tb_pattern_detector();

    reg clk, rst, en, din, overlap_en;
    reg [3:0] pattern;
    wire match_pulse;
    wire [7:0] match_count;
    wire [3:0] shift_view;

    Pattern_Detector tb_PD (
        .clk(clk),
        .rst(rst),
        .en(en),
        .din(din),
        .overlap_en(overlap_en),
        .pattern(pattern),
        .match_pulse(match_pulse),
        .match_count(match_count),
        .shift_view(shift_view)
    );
    
    initial begin
        $dumpfile("Tb_3_NonOverlap_pattern=1011.vcd");
        $dumpvars(0, tb_pattern_detector);
        #300;
        $display("Done!");
        $finish;
    end

    initial begin
        clk = 1'b0;
        forever #10 clk = ~clk;
    end

    initial fork
        rst = 1'b1;
        en = 1'b1;
        din = 1'b0;
        overlap_en = 1'b0;
        pattern = 4'b1011;
        #20 rst = 1'b0;
        #20 din = 1'b1;
        #120 din = 1'b0;
        #140 din = 1'b1;
    join

endmodule
</code></pre>
</details>

+ [**CLick Here to View Waveform**](/images/Tb_3.pdf)   

To further validate robustness, the detector is tested with a different pattern (`1011`) under non-overlapping mode.

The system correctly identifies valid matches, suppresses overlapping detections, and increments the match counter only when appropriate. This demonstrates that the FSM-based lockout mechanism generalizes well to different patterns.

---

# Conclusion

This project successfully implements a configurable pattern detector supporting both overlapping and non-overlapping detection modes.

Key features include:

- A fully synchronous, modular architecture  
- A Mealy FSM with an explicit lockout state  
- Correct handling of overlapping and non-overlapping sequences  
- Synthesizable and scalable design  

Simulation results across multiple patterns and configurations confirm the correctness and robustness of the design. The detector can be readily integrated into larger digital systems requiring flexible pattern recognition.
