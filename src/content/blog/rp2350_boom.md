---
title: '依旧点灯(RP2350)'
author: 'Juliet'
description: '亲自部署，亲自指挥的乐趣'
pubDate: 'May 25 2026'
tags: ["RP2350"]
pinned: false
license: "CC BY-SA 4.0"
---
> 今天亲自部署，亲自指挥 RP2350

# Introduction
在 MCU 的世界里，传统的巨头如意法(ST)或恩智浦(NXP)长期统治工业/消费级市场。然于 2021 年，凭借单板计算机(SBC)闻名全球的英国**树莓派基金会（Raspberry Pi）**，推出了其首款自研微控制器芯片 —— **RP2040**。

RP2040 凭借独特的双核 Cortex-M0+ 架构、低廉的价格，以及极具革命性的 PIO(Programmable I/O) 状态机，瞬间引爆了开源硬件和嵌入式社区。

而本文的主角 **RP2350**，正是 Raspberry Pi(下简称rp) 在 24 年推出的第二代自研旗舰芯片。  
鉴于本人有使用过 RaspberryPi4b 的经验，对 rp 的印象还算不错(?)
## RP2350
RP2350 有 Cortex-M33 和 RISC-V Hazard3 两个核心，在本文章中，以 `Cortex-M33` 核心为例，研究 RP2350 从上电到执行自己编写的程序的过程。  

RP2350集成了 Arm Cortex-M33 内核 。相比上一代 RP2040 所使用的 Cortex-M0+，Cortex-M33 属于更现代的 ARM 微控制器架构，在性能、指令集能力以及安全性方面都有明显提升。  

> RP2350 的时钟主频为 150MHz，将SRAM的大小提升到了 520KB，并引入了硬件安全(TrustZone)等功能。

<div style="display: flex; gap: 24px; align-items: flex-start;">
  <div style="flex: 1;">
    <p style="font-size: 0.9em;">
      右图为 RP2350 的 大致结构<br>
      启动时由 BootRom 决定以哪一种架构运行<br>
      芯片内部采用基于 AHB-Lite 的总线结构，连接 CPU、SRAM、Flash 与外设模块<br>
      I2C, GPIO 等低速外设通过 APB Bridge 接到系统总线上
    </p>
    <p style="font-size: 0.9em;">
      图源：
      <a href="https://github.com/mytechnotalent/RP2350_UART_Driver/blob/main/TUTORIAL/CHAPTER-18.md" target="_blank">
        Kevin Thomas 的仓库
      </a>
    </p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 500px;">
    <img
      src="/images/rp2350_blockdiagram.webp"
      style="width: 100%; border-radius: 12px;"
    >
  </div>
</div>

Cortex-M33 基于 ARMv8-M Mainline 架构，实现了更完整的异常处理与系统控制机制，并支持更多高级特性。其采用 **Thumb-2** 指令集，即同时支持 16 位与 32 位混合指令编码。

<div style="display: flex; gap: 24px; align-items: flex-start;">
  <div style="display: flex; flex-direction: column; gap: 12px; width: 600px;">
    <img
      src="/images/rp2350_register.webp"
      style="width: 100%; border-radius: 12px;"
    >
  </div>
  <div style="flex: 1;">
    <p style="font-size: 0.85em;">
        处理器内部提供了13个通用寄存器（r0–r12），以及：
        r13：栈指针（SP）
        r14：链接寄存器（LR）
        r15：程序计数器（PC）
    </p>
    <p style="font-size: 0.85em;">
        图源: <a href="https://developer.arm.com/documentation/100235/0100/The-Cortex-M33-Processor/Programmer-s-model/Core-registers" target="_blank">
        Arm 手册
        </a>
    </p>
  </div>
</div>

芯片采用短小精悍的三级流水线结构：
```
取指令 Fetch --> 译码 Decode --> 执行 Execute
```

+ 此外，Cortex-M33 还内置了硬件整数除法器，支持：
UDIV（无符号除法）
SDIV（有符号除法）
+ 安全性方面，支持 ARM TrustZone 技术。
+ Cortex-M33 集成了嵌套向量中断控制器(NVIC)，能够高效管理中断优先级与异常响应。这对于实时嵌入式系统尤为重要。

不过以上内容都超出了本篇讨论的范围😋

## Board
![长啥样](/images/rp2350_view.webp)

斥60大洋巨资购买一块相当漂亮的 WaveShare Pizero 开发板

板子的可玩性很强，配备内置 DVI 接口、TF 卡槽、PIO-USB 接口，40针 GPIO、PSRAM 扩展板，并且提供了 16MB 的外部 flash

# 使用 SDK! (其一)
> B 话真多😅，倒是跑起来看看

幸运的是，rp 官方提供了 sdk，仓库地址: [🔗](https://github.com/raspberrypi/pico-sdk)  

SDK 提供了必要的头文件&库，用于使用 C/Cpp 为 RP 系列的 MCU 编写程序。

使用 SDK 点灯相当简单：

```
#include "pico/stdlib.h"        // include pico-sdk 的标准库头文件

int main() {
    gpio_init(15);              // 初始化 GPIO15
    gpio_set_dir(15, GPIO_OUT); // 设置为 输出模式
    gpio_put(15, 1);            // 输出高电平
    while (1);                  // 死循环
}
```
将 pico-sdk 的模板里面的 [pico_sdk_import.cmake](https://github.com/raspberrypi/pico-sdk/blob/master/external/pico_sdk_import.cmake) 复制到当前目录  
然后只需在 `CMakeLists.txt` 里面 include(pico_sdk_import.cmake), 下面是一个最小模板：

<div style="display: flex; gap: 0px; align-items: flex-start; font-size: 0.85em;">
  <div style="flex: 6;">
<pre><code>
cmake_minimum_required(VERSION 3.19.8)
include(pico_sdk_import.cmake)
project(Light_C_SDKv C CXX)
pico_sdk_init() # 初始化 SDK
add_executable(light_main
    main.c
)
# 强制指定编译选项
target_compile_options(light_main PRIVATE 
    -mcpu=cortex-m33
    -mthumb
)
# 链接标准库
target_link_libraries(light_main
    pico_stdlib
)
# 生成烧录所需的特殊格式文件
pico_add_extra_outputs(light_main)
</code></pre>
  </div>
  <div style="flex: 4;">
    <p><ul>
        <li><strong>pico_sdk_import.cmake</strong> 会用到 <strong>PICO_SDK_PATH</strong> 环境变量，在本演示环境中为 <strong>/usr/share/pico-sdk</strong></li>
        <li>在 build 目录下<br><code>cmake -DPICO_PLATFORM=rp2350 ..</code><br><strong>-DPICO_PLATFORM=rp2350</strong> 是为了告诉 cmake 正在为 rp2350 开发，否则会使用老一代 rp2040 的配置</li>
        <li>cmake 会生成 Makefile, <br><code>make</code> 即可</li>
        <li>末尾的 <code>pico_add_extra_outputs()</code> 会自动把生成的 .elf 文件加工打包，最终生成能直接拖拽烧录的 <strong>.uf2</strong> 固件</li>
    </ul></p>
  </div>
</div>

**烧录！**  
按住开发板的 boot 键，然后使用数据线将开发板连接至电脑，此时开发板会被识别为一个 usb 存储设备，可以选择将刚才生成的 light_main.uf2 直接复制进去，也可以使用官方提供的 picotool:
```
picotool load ./light_main.uf2 -x
```
gpio15 的 led 就能点亮了。

# 使用 SDK! (其二)
> 什么鬼，这就能点亮了?

我们的 main 函数只用了4行😄  
这是因为 pico-sdk 将复杂的操作封装成了简单的函数😇，比如，只需要`gpio_init(15)`就能初始化一个引脚。  
本节将绕过 pico-sdk 的函数，使用汇编直接操作寄存器点灯。  

## Memory Mapped IO
+ 🤔 CPU 只能执行指令集里面定义的操作，无法直接控制某一个引脚的状态，那么应该如何操控一个外设呢？
+ 🤓 当然是配合外部电路咯  
    在嵌入式系统中，硬件寄存器会被映射到内存地址空间，也就是说，e.g., 地址0xd0000000 可能不是RAM地址，而是负责控制某个硬件的寄存器的地址。  

非常棒设计，使 CPU 能像在内存里写数据一样，在硬件寄存器里面写数据。再配合硬件电路，实现特定功能。  

## GPIO(通用输入输出)
> 阅读 RP2350 的[手册](https://pip-assets.raspberrypi.com/categories/1214-rp2350/documents/RP-008373-DS-2-rp2350-datasheet.pdf)

GPIO 也是一种硬件外设

对于 RP2350，一个 GPIO 由多个硬件模块控制：
+ **PADS_BANK0**: 物理引脚配置，决定引脚的电气特性，如:  
    输出驱动能力，上拉/下拉 电阻，输入缓冲
+ **IO_BANK0**: 选择引脚复用  
    为了在有限的引脚上集成更多的功能，一个 GPIO 不会只对应一个用途，正如其名 ***通用*** 输入输出，它可能同时支持 SIO, PWM, UART, SPI 等功能。  
    通过向 GPIO 的 GPIOx_CTL 寄存器写特定值以选择对应的外设。
+ **SIO**: CPU 直接操作 GPIO 时使用的控制器  
    负责 GPIO 输出使能，GPIO 输出高低电平，GPIO 输入读取。  
    通过向 GPIO_OE_SET 寄存器写值使能 GPIO，向 GPIO_OUT_SET 寄存器写值控制 GPIO 输出电平。

## Reset Controller(复位控制)
RP2350 的复位控制器（Reset Controller）在上电时会让大多数外设保持在 Reset 状态。  
在使用某个外设之前，必须先解除它的 Reset，并等待复位流程完成。  

**IO_BANK0** 与 **PADS_BANK0** 属于普通 GPIO 外设模块，因此在使用 GPIO 前需要先解除它们的 Reset。  
**SIO** 属于 CPU 的核心 IO 子系统，因此在处理器运行时默认已经可用，不受普通外设 Reset 控制。  

---

总结一下大致流程：
![流程](/images/rp2350_gpio_flowchart.webp)
1. **清除`IO_BANK0`和`PADS_BANK0`复位**:  
    查询手册得知，只需将 **RESET Register(0x40020000)** 的第 6, 9 位 (分别对应 IO_BANK0, PADS_BANK0) 设置为 0。
2. **读取复位状态**:  
    RP2350 提供了一个 **RESET_DONE Register (0x40020008)**，通过读取第 6, 9 位是否为 1 来判断是否复位完成。
3. **判断是否复位完成**:  
    如果没有则回到上一步继续等待，如果完成则进行下一步。
4. **物理引脚配置**:  
    根据手册，GPIO 15 对应的 PADS_BANK0 寄存器地址为 0x40038040, 写入 0x36，设置 12mA Drive 并清除 isolation.
5. **将 GPIO15 复用为 SIO**:  
    根据手册，GPIO15 对应的 GPIO15_CTL 寄存器地址为 0x4002807c, 写入 0x5.
6. **使能引脚并输出1**:  
    **GPIO_OE_SET(0xd0000038)** 寄存器的每一位分别对应 GPIO0 至 GPIO31, 要使能 GPIO15 需要将第 15 个 bit 设置为 1, 使能 GPIO15; 同样的方法，将**GPIO_OUT_SET(0xd0000018)** 的第 15 个 bit 设置为 1, 使其输出高电平。

<details>
  <summary>👈 点击展开 <strong>Light_Assembly_SDKv.s</strong>，或者访问<a href="https://github.com/Hi-Jiang-a11y/RP2350_Boom/tree/main/Light_Assembly_SDKv" target="_blank"> 我的仓库🔗</a></summary>

    .syntax unified
    .cpu cortex-m33
    .thumb

    .global start
    start:
        @ 1. 解除复位 (IO_BANK0 和 PADS_BANK0)
        ldr r0, =0x40020000                 @ RESETS 基地址
        ldr r1, =((1 << 6) | (1 << 9))      @ 构造掩码 (bit 6, bit 9)

        ldr r2, [r0, #0x0]                  @ 读取 RESET 寄存器
        bics r2, r2, r1                     @ 清除对应位以解除复位
        str r2, [r0, #0x0]

    reset_wait:
        ldr r2, [r0, #0x8]                  @ 2. 读取 RESET_DONE 寄存器
        tst r2, r1                          @ 3. 检查是否完成
        beq reset_wait

        @ 4. 物理引脚配置 (Pad Control)
        ldr r0, =0x40038040                 @ 直接指向 PADS_BANK0: GPIO15 寄存器 (0x40038000 + 0x04 + 15*4)
        movs r1, #0x36                      @ 12mA Drive, 清除 bit8(isolation)
        str r1, [r0]

        @ 5. 设置引脚复用功能 (GPIO Control -> SIO)
        ldr r0, =0x4002807c                 @ 直接指向 IO_BANK0: GPIO15_CTRL (0x40028000 + 15*8 + 4)
        movs r1, #0x5                       @ funct 5: SIO
        str r1, [r0]

        @ 6. SIO 配置与点亮
        ldr r0, =0xd0000000                 @ SIO 基地址
        ldr r1, =(1 << 15)                  @ GPIO 15 掩码

        str r1, [r0, #0x038]                @ GPIO_OE_SET: 设置为输出
        str r1, [r0, #0x018]                @ GPIO_OUT_SET: 拉高电平 (点亮)

</details>

以上写了一个名为 `start` 的函数，接下来只需要在 **main.c** 里面调用即可。

为此还需要略微修改之前的 **CMakeLists.txt**:

<details>
  <summary>👈 点击展开 <strong>CMakeLists.txt</strong>，或者访问<a href="https://github.com/Hi-Jiang-a11y/RP2350_Boom/tree/main/Light_Assembly_SDKv" target="_blank"> 我的仓库🔗</a></summary>

    cmake_minimum_required(VERSION 3.19.8)

    include(pico_sdk_import.cmake)

    project(Light_Assembly_SDKv C CXX ASM)

    pico_sdk_init()

    add_executable(Light_Assembly_SDKv
        main.c
        Light_Assembly_SDKv.s
    )

    target_compile_options(Light_Assembly_SDKv PRIVATE
        -mcpu=cortex-m33
        -mthumb
    )

    set_source_files_properties(Light_Assembly_SDKv.s PROPERTIES LANGUAGE ASM)

    target_link_libraries(Light_Assembly_SDKv pico_stdlib)

    pico_add_extra_outputs(Light_Assembly_SDKv)

</details>

不出所料，gpio15 的 led 就能点亮了。

# 不用 SDK！🚫
> 等等，你还没解释 CPU 是怎么进入 main.c 的呢！💢

为了搞清楚这一点，接下来的部分将简单(?)介绍 RP2350 的启动过程，并不再使用 SDK, 使用汇编与链接脚本点灯。

## 地址映射
RP2350 是32 位 CPU, 具有 2^32bit = 4GB 的寻址空间，这些空间被分配给了 ROM, XIP, SRAM, 外设(Peripherals), 私有外设(Private Peripherals)。
| Region | 寻址范围 | 大小 | 功能 |
| :--- | --- | :---: | --- |
| ROM                 | 0x00000000 - 0x0fffffff | 256 MB | Boot Rom |
| XIP                 | 0x10000000 - 0x11ffffff | 32 MB  | 外部 flash |
| SRAM                | 0x20000000 - 0x20081fff | 520 KB | 片上RAM |
| Peripherals         | 0x40000000 - 0x4fffffff | 256 MB | 外设寄存器 |
| Private Peripherals | 0xe0000000 - 0xe00fffff | 1 MB   | 私有外设 |

+ **Boot ROM**:  
    Boot ROM 是芯片内部固化的一段只读程序，通电后最先执行，负责初始化硬件，加载程序，跳转到用户程序入口等。  

+ **XIP**:  
    在一般的计算机中，运行一段程序需要将指令搬到 RAM 里面，然而为了节省 RAM 和硬件复杂度, RP2350 使用了 XIP(Execute In Place)  

    XIP 将 0x10000000 - 0x11ffffff 这段地址映射到外部存储设备(flash)，CPU 通过 QSPI 直接从 flash 取指令运行，无需将指令复制到 RAM。
    因此，程序代码会直接存放在外部 flash 里面。
+ **SRAM**:  
    SRAM 是芯片内部高速读写内存，负责存放调用栈，堆，临时变量等。
+ **Peripherals**:  
    即前文所讲的 [Memory Mapped IO](#memory-mapped-io), 便于 CPU 直接操作硬件。
+ **Private Peripherals**:
    这一部分属于 Cortex-M 内核私有外设，作为 ARM Cortex-M33 内核自身的一部分。

## 启动流程
> 阅读数据手册第5章，详细介绍了 RP2350 的启动过程

相比 RP2040, RP2350 的启动流程复杂了很多。  
RP2350 新增了：
- Secure Boot
- OTP Boot
- RAM Image Boot
- 双核启动同步
- TrustZone
- 更多 Boot Mode

RP2350 支持多种启动方式，
手册对 RP2350 启动过程相比于 RP2040 从23 页增加到了 88 页😅，这里偷点懒，省略几个(很多)繁琐的步骤，只列出本项目的大致过程：
![Boot_Sequence](/images/rp2350_bootsequence.webp)

1. 上电复位  
    CPU 处于复位状态，时钟以较低频率运行，随后将从 BootROM(0x00000000) 开始运行
2. 检查特殊启动方式  
    RP2350 支持许多启动方式，如 OPT, SRAM Image, Rescue...  
    BootROM 会读取 POWMAN, Watchdog Scratch Register 等寄存器来进行判断。  
    不过本项目使用最常见的从 flash image 启动，无需涉及以上的启动方式。
3. 检查 BOOTSEL  
    BOOTSEL 是开发板上的 **BOOT** 按钮，若被 BootROM 检测到按下，则进入 USB/串口 Bootloader，并设置时钟，等待外部设备下载程序。  
这也是为什么在前面的章节中，烧录程序时需要按住 BOOT 按钮，再连接 USB.

4. 初始化 QSPI  
    如果 BOOT 按钮没有被按下，则尝试从 flash 启动，为此需要初始化 QSPI / XIP，让 CPU 能访问 外部 flash。
5. 寻找 `IMAGE_DEF`  
    Boot ROM 会在 flash 的前 4KB 寻找合法的 **IMAGE_DEF** 镜像，IMAGE_DEF 用于告诉 BootROM 后面的指令属于哪种架构(ARM/RISC-V), 程序入口(ENTRY Point), Vector Table 在哪里，是否包含 Secure Boot 签名。
6. 在识别到 合法的 IMAGE_DEF 后会建立正式 XIP 执行环境，准备让 CPU 从 flash 连续取指令。
7. 根据 IMAGE_DEF, CPU 读取 Vector Table，跳转至 ENTRY Point，开始执行用户编写的指令，至此 BootROM 结束。

## Implementation
> 启动的过程虽复杂，其实需要手动实现的内容不多，最主要的是一个合法的 IMAGE_DEF 头，一个简单的 Vector Table, 以及一个链接脚本。  
在之前的示例里面，我们使用的 pico-sdk 为我们写好了这些东西，接下来将手动实现。  

### IMAGE_DEF
首先要解决的是`IMAGE_DEF`  

RP2350 定义了一套称为 Metadata Block 的镜像描述格式，其结构如下：
```
+------------+
| HEADER     |       <=       头，作为一个合法的 block 的开始
+------------+
| ITEM 0     |       <=       第一个 item
+------------+
| ITEM 1     |
+------------+
| ...        |
+------------+
| LAST_ITEM  |       <=       LAST_ITEM, 它用于告诉 BootROM 前面 item 总长度是多少
+------------+
| LINK       |       <=       指向下一个 block 的相对地址偏移量(有点像循环链表)
+------------+
| FOOTER     |       <=       尾。作为一个合法的 block 的结束
+------------+
```
一个 Metadata Block 可以有多个 item 
数据手册已经为我们提供了一个最简的 IMAGE_DEF😋  
```
.section .image_def, "a"        @ "a" 表示只读可分配
image_def:
    .word 0xffffded3            @ magic number 手册规定必须为此数字作为开头
    .word 0x10210142            @ image_def item, 代表是一个运行在 RP2350 上的 ARM 可执行程序
    .word 0x000001ff            @ LAST_ITEM
    .word 0x00000000            @ 相对地址偏移量
    .word 0xab123579            @ footer number 手册规定必须为此数字作为结尾
```
翻译一下：
```
+------------+
| HEADER     |       <=       头，作为一个合法的 block 的开始 = 0xffffded3
+------------+
| ITEM 0     |       <=       第一个 item, 就是image_def item = 0x10210142
+------------+
| LAST_ITEM  |       <=       LAST_ITEM, = 0x000001ff, 包含 size_flag, item_type，用于告诉 BootROM 当前 block 的 item 数量，并终止 item 列表解析
+------------+
| LINK       |       <=       指向下一个 block 的相对地址偏移量 = 0, 指向自己
+------------+
| FOOTER     |       <=       尾。作为一个合法的 block 的结束 = 0xab123579
+------------+
```
注意到，虽然写好了一个合法的 IMAGE_DEF，但仍没有告诉程序入口在哪里。  

实际上还可以定义 ENTRY Point Vector Table item，用于显示指定程序入口和向量表的位置，在这个实例中并没有定义，因此 BootROM 会采用 Cortex-M 的默认方式：  
+ 将 flash 起始位置(0x10000000)视为 Vector Table 开始位置
+ 读取 0x10000000 +0x0 为初始 MSP
+ 读取 0x10000000 +0x4 为 Reset_Handler 地址
+ 设置 MSP
+ 跳转至 Reset_Handler 开始执行

总结：在 flash 的开头存放 Vector Table，然后放 IMAGE_DEF，最后是 编写的指令，BootROM 先在 flash 前 4KB 内寻找 IMAGE_DEF，确认该镜像合法；随后按照 Cortex-M 约定读取 Vector Table，并进入 Reset_Handler。

### 向量表(Vector Table)
由于这个项目只涉及到控制 GPIO 输出，并未使用到复杂的中断，只需要提供启动所必需的最小 Vector Table：
```
.section .vectors, "ax"
.equ STACK_TOP_ADDRESS, 0x20082000
.global vector_initialization
vector_initialization:

    .word STACK_TOP_ADDRESS         @ 栈顶地址
    .word stack_initialization      @ Reset Handler 地址(含 Thumb 位)

    @ 或者 直接跳转到主程序
    @ .word STACK_TOP_ADDRESS
    @ .word _start
```
虽然在 Vector Table 里面定义了调用栈顶地址，许多项目仍会在 Reset Handler 里面重新设置 MSP.
```
.global stack_initialization
.thumb_func
stack_initialization:
    ldr     r0, =STACK_TOP_ADDRESS
    mov     sp, r0                   @ 设置 MSP
    b       _start                   @ 跳转至主程序
```
`_start` 就是之前写的`start`函数。

### 链接脚本(Linker Script)
OK, 现在我们的 flash 内部的布局如下：
```
+----------------------+
| Vector Table         |        <=      0x10000000
+----------------------+
| IMAGE_DEF            |
+----------------------+
| Reset_Handler        |
| Application Code     |
+----------------------+
```

目前我们已经写好了
+ IMAGE_DEF
+ Vector Table
+ Reset Handler

但是编译器不知道将这些内容放到什么位置  

链接脚本登场！

<div style="display: flex; gap: 15px; align-items: flex-start; font-size: 0.9em;">
  <div style="flex: 7;">

     [Source Code] xxx.s
             |
             |   assembler
             |
             |
             V
     [Object File] xxx.o
             |    (只有 sections, 没有最终地址)
             |
             |    linker + linker script
             |      .vectors ->  FLASH
             |      .bss     ->  RAM
             V
    [ELF Executable] xxx.elf
             |    (有最终地址)
             |
             |
             V
     0x10000000 -> Vector Table
     0x10000xxx -> IMAGE_DEF
     0x10000xxx -> 主程序
     0x20000000 -> SRAM

  </div>
  <div style="flex: 3;">
    <br><br>
    <p>
        汇编器只负责将汇编指令翻译为机器码，<br>生成的 .o 文件里面有 .text、.vectors、.bss 等 section, 但并不知道这些 section 应该位于什么位置。
    </p>
    <p>
        决定程序内存布局的是链接器，<br>链接器根据链接脚本的规则，将不同 section 放入指定内存区域。
    </p>
    <p>
        在本项目中，我们只需要将 Vector Table 放在 flash 的开头，IMAGE_DEF 随其后，最后放编写的指令。
    </p>
  </div>
</div>

链接脚本如下：

<details>
  <summary>👈 点击展开 <strong>Light_Assembly_NoSDKv.ld</strong>，或者访问<a href="https://github.com/Hi-Jiang-a11y/RP2350_Boom/tree/main/Light_Assembly_NoSDKv" target="_blank"> 我的仓库🔗</a></summary>

    MEMORY
    {
        /* 外部 QSPI Flash 的 XIP 映射区域 */
        /* 程序代码会被放在这里，并直接从 flash 执行 */
        FLASH (rx)  : ORIGIN = 0x10000000, LENGTH = 16M
        /* 片上 SRAM */
        SRAM  (rwx) : ORIGIN = 0x20000000, LENGTH = 520K
    }

    SECTIONS
    {
        .text :
        {
            /* Vector Table */
            KEEP(*(.vectors))
            /* IMAGE_DEF */
            KEEP(*(.image_def))
            /* 其余代码段 */
            *(.text*)
        } > FLASH

        /* 未初始化全局变量 */
        .bss :
        {
            *(.bss*)
        } > SRAM

        /* 已初始化全局变量 */
        .data :
        {
            *(.data*)
        } > SRAM
    }

</details>

### 构建！
目前已经有了：
```
.
├── Light_Assembly_NoSDKv.ld
└── Light_Assembly_NoSDKv.s
```
终于可以开始编译了🤓  
将汇编源码转换为目标文件：
```
arm-none-eabi-as -mcpu=cortex-m33 -mthumb -g Light_Assembly_NoSDKv.s -o Light_Assembly_NoSDKv.o
```
链接，生成 elf 文件：
```
arm-none-eabi-ld -nostdlib  -T Light_Assembly_NoSDKv.ld Light_Assembly_NoSDKv.o -o Light_Assembly_NoSDKv.elf
```
将 ELF 提取为纯二进制：
```
arm-none-eabi-objcopy -O binary Light_Assembly_NoSDKv.elf Light_Assembly_NoSDKv.bin
```
最后转换为 RP2350 USB Bootloader 可识别的 UF2：
```
picotool uf2 convert Light_Assembly_NoSDKv.bin Light_Assembly_NoSDKv.uf2
```
😵‍💫😵‍💫😵‍💫，还是写一个 Makefile 吧：

<details>
  <summary>👈 点击展开 <strong>Makefile</strong>，或者访问<a href="https://github.com/Hi-Jiang-a11y/RP2350_Boom/tree/main/Light_Assembly_NoSDKv" target="_blank"> 我的仓库🔗</a></summary>

    # Program Settings
    NAME = Light_Assembly_NoSDKv

    # Toolchain
    AS = arm-none-eabi-as
    LD = arm-none-eabi-ld
    OBJCOPY = arm-none-eabi-objcopy
    OBJDUMP = arm-none-eabi-objdump
    PICOTOOL = picotool

    AS_FLAGS = -mcpu=cortex-m33 -mthumb --warn --fatal-warnings -g
    LD_FLAGS = -nostdlib -g
    OBJDUMP_FLAGS = -D -s -f -r -x -WL --architecture=cortex-m33

    LD_SCRIPT = $(NAME).ld

    OUTPUT_DIR = bin
    DUMP_DIR = dump

    S_FILES = $(wildcard *.s)
    O_FILES = $(patsubst %.s,$(OUTPUT_DIR)/%.o,$(S_FILES))

    all: clean $(OUTPUT_DIR) $(DUMP_DIR) $(OUTPUT_DIR)/$(NAME).uf2

    $(OUTPUT_DIR):
	    mkdir -p $(OUTPUT_DIR)

    $(DUMP_DIR):
	    mkdir -p $(DUMP_DIR)

    $(OUTPUT_DIR)/%.o: %.s
	    $(AS) $(AS_FLAGS) $< -o $@

    $(OUTPUT_DIR)/$(NAME).bin: $(LD_SCRIPT) $(O_FILES)
	    $(LD) $(LD_FLAGS) -T $(LD_SCRIPT) $(O_FILES) -o $(OUTPUT_DIR)/$(NAME).elf
	    $(OBJDUMP) $(OBJDUMP_FLAGS) $(OUTPUT_DIR)/$(NAME).elf > $(OUTPUT_DIR)/$(NAME).elf.dump
	    $(foreach obj,$(O_FILES),$(OBJDUMP) $(OBJDUMP_FLAGS) $(obj) > $(obj).dump;)
	    $(OBJCOPY) -O binary $(OUTPUT_DIR)/$(NAME).elf $(OUTPUT_DIR)/$(NAME).bin
	    mv $(OUTPUT_DIR)/*.dump $(DUMP_DIR)

    $(OUTPUT_DIR)/$(NAME).uf2: $(OUTPUT_DIR)/$(NAME).bin
	    $(PICOTOOL) uf2 convert $(OUTPUT_DIR)/$(NAME).bin $(OUTPUT_DIR)/$(NAME).uf2

    clean:
	    rm -Rf $(OUTPUT_DIR)
	    rm -Rf $(DUMP_DIR)

</details>

end
# References
官方文档
+ Raspberry Pi RP2350 Datasheet  
    https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf
+ ARM Cortex-M33 Architecture Reference Manual  
    https://developer.arm.com/documentation/ddi0553/latest

项目仓库
+ RP2040 / RP2350 pico-sdk  
    https://github.com/raspberrypi/pico-sdk
+ Alex Kim 的仓库  
    https://github.com/alexdbkim/rp2350-bare-metal-arm-assembly
+ Kevin Thomas 的仓库  
    https://github.com/mytechnotalent/RP2350_UART_Driver
+ 本项目源码  
    https://github.com/Hi-Jiang-a11y/RP2350_Boom

相关视频  
+ RP2040 - NO SDK! Assembly Language Programming - BMA -04  
    https://www.youtube.com/watch?v=nM8lVeOYblY

工具链
+ GNU Arm Embedded Toolchain  
    https://developer.arm.com/downloads/-/gnu-rm
+ picotool(UF2 转换 / 烧录工具)
    https://github.com/raspberrypi/picotool

