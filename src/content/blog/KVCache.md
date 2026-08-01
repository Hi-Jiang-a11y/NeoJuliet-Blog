---
title: 'KVCache'
author: 'Juliet'
description: '从 Transformer 推理到 KIVI 量化缓存的一点实验记录'
pubDate: 'Aug 01 2026'
tags: ["AI", "Transformer", "KV Cache", "SRT"]
pinned: false
license: "CC BY-SA 4.0"
---

> 本文记录 SRT_IV 项目中对 KV Cache、量化与多核共享的一点探索。
> 结论先写在前面：模型每次生成一个字，看起来很轻松，实际上在反复搬一大坨历史数据。

# Attention 到底在算什么？

先不管“大模型”这个名字。对单个 attention head 而言，输入的 hidden states 记为 $X\in\mathbb{R}^{n\times d}$：$n$ 是目前已经出现的 token 数，$d$ 是模型的 hidden size。这个 head 用三组可训练矩阵把同一份 $X$ 投影成 Query、Key 与 Value：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V,
$$

其中 $W_Q,W_K,W_V\in\mathbb{R}^{d\times d_k}$，所以 $Q,K,V\in\mathbb{R}^{n\times d_k}$。名字听起来很玄学，但可以先把它们理解为：**Q 是当前 token 想问的问题，K 是每个 token 的索引，V 是每个 token 真正携带的内容。**

接下来，$QK^\mathsf{T}$ 让每一个 Query 都和所有 Key 做点积，得到“我该关注谁”的分数矩阵；除以 $\sqrt{d_k}$ 后做 Softmax，便得到注意力权重 $P$。最后以这些权重对 $V$ 加权求和：

$$
S=\frac{QK^\mathsf{T}}{\sqrt{d_k}},\qquad
P=\operatorname{Softmax}(S),\qquad
H=PV.
$$

多头注意力只是把这一套操作并行做 $h$ 次：每个 head 使用较小的 $d_k$，最后将所有 $H^{(i)}$ 拼接，再乘输出矩阵 $W_O$。后文讨论 KV Cache 时，我们只需盯住其中一个 head；其余 head 做的是相同的事。

## 图中每一块在做什么？

项目里的流程图把 $X\rightarrow Q/K/V\rightarrow QK^\mathsf{T}\rightarrow\operatorname{Softmax}\rightarrow PV$ 展开成了矩阵。以图中的例子为例，$d=12$、$h=4$，因此单个 head 的 $d_k=3$：输入的每一行是一个 token，投影后每个 head 只保留 3 个特征。

- `QKᵀ` 的输出是 $n\times n$ 的 score matrix：第 $a$ 行、第 $b$ 列表示 token $a$ 对 token $b$ 的关注分数。
- causal mask 会遮住未来 token；因此在生成阶段，当前 token 只能看见自己和此前的历史。
- `Softmax × V` 会将一行 attention weights 变成一行输出向量。它不是“从 V 里挑一个 token”，而是按权重混合所有可见的 V。

这也是为什么 K 和 V 都不可省：K 用来计算权重，V 用来根据权重合成结果。

# 生成一个新 token 时，发生了什么？

语言模型不是一次把整段答案写完，而是自回归地执行 `token 1 → token 2 → ... → token n+1`。第一次把 prompt 喂给模型称为 **prefill**，它会并行计算整段输入；之后每一步只生成一个 token，称为 **decode**。

到了生成第 $n+1$ 个 token 的时候，真正新出现的输入只有 $x_{n+1}\in\mathbb{R}^{1\times d}$。新的 Query $q_{n+1}$、Key $k_{n+1}$ 和 Value $v_{n+1}$ 都必须计算，但历史 token 的 Key/Value 其实早在前面的步骤算过了。

问题在于，新的 $q_{n+1}$ 仍然需要和 $K_{1:n+1}$ 做点积，并用所得权重读取 $V_{1:n+1}$。所以历史 K/V **不能不读**；KV Cache 省下的是重复的线性投影计算，不是让模型凭空忘掉历史。

## 不使用 KV Cache：每次都把历史重新投影一遍

`NoKVCache.pdf` 的流程图用红色标出了历史 token、蓝色标出了新 token。为了计算第 5 个 token 的输出，图中把 $X_{1:5}$ 整体分别乘以 $W_K$ 与 $W_V$：

$$
K_{1:5}=X_{1:5}W_K,\qquad V_{1:5}=X_{1:5}W_V.
$$

下一步生成第 6 个 token 时，又会计算 $X_{1:6}W_K$ 和 $X_{1:6}W_V$。前 5 行的结果与上一步完全相同，却又被重新算了一次。序列越长，红色的“旧工作”就越多；这正是没有 KV Cache 时 decode 会不断浪费计算的原因。

## 使用 KV Cache：只算蓝色的一行，再接到绿色的历史后面

`KVCache.pdf` 的第 (c) 张图展示了 cache 的版本。当前步骤只将蓝色的 $x_{n+1}$ 投影一次：

$$
q_{n+1}=x_{n+1}W_Q,\qquad
k_{n+1}=x_{n+1}W_K,\qquad
v_{n+1}=x_{n+1}W_V.
$$

然后将新的 $k_{n+1}$、$v_{n+1}$ append 到已经保存的绿色历史项：

$$
K_{1:n+1}=\operatorname{concat}(K_{\text{cache}},k_{n+1}),\qquad
V_{1:n+1}=\operatorname{concat}(V_{\text{cache}},v_{n+1}).
$$

最后只需计算一行 score 和一行输出：

$$
s_{n+1}=\frac{q_{n+1}K_{1:n+1}^\mathsf{T}}{\sqrt{d_k}},\qquad
o_{n+1}=\operatorname{Softmax}(s_{n+1})V_{1:n+1}.
$$

红色的历史投影变成了绿色的 cache reuse，蓝色部分则是这一轮不可避免的新工作。这样并不会改变 attention 的数学结果，只是避免把已知的 K/V 反复算出来。

项目中的简单 simulation 也能看到这个差异：相对重新计算，使用 cache 后在 200、400、800 个 output tokens 时，生成速度分别约为 $2.02\times$、$2.97\times$ 与 $4.55\times$。

# 好消息：不用重复算了；坏消息：要存不下了

## KV Cache 有多大？

KV Cache 的容量近似为：

$$
\text{Bytes} = 2 \times B \times L \times N \times H_{KV} \times d_h \times p.
$$

这里的 $2$ 代表 K 和 V 两份数据，$B$ 是 batch size，$L$ 是层数，$N$ 是当前上下文长度，$H_{KV}$ 是 KV heads 数，$d_h$ 是每个 head 的维度，$p$ 是每个元素占用的字节数。以 FP16、32 KV heads、$d_h=128$ 为例，4096 tokens 的**单层** cache 已约为 64 MiB；层数上去以后，显存容量与带宽都会开始难受。

## Decode 不是算力不够，而是搬数据太多

KV Cache 消除了历史投影，但每生成一个 token，仍要读取一遍历史 K/V 来完成 $qK^\mathsf{T}$ 和 $pV$。计算量相对每次读取的数据较小，因此长上下文 decode 很容易变成 memory-bound。

多核同时处理不同 Query 时，问题还会加重：这些 core 可能需要同一个 KV tile，却各自从 L2 或 DRAM 读取一次。于是后面要讨论的量化与共享缓存，并不是为了替代 KV Cache，而是在 KV Cache 已经不可缺少之后，继续减少它的容量和搬运量。

> 原来不是 AI 在思考，是内存控制器在加班。

# 我的 KV Cache 实验

## 从 HuggingFace 的 baseline 开始

- 用 GPT-2 建立正常 FP16 cache baseline
- 检查每一层 cache 的 shape：`[B, H, T, D]`
- 分别观察 Key 和 Value 的分布

<!-- TODO: 插入同一 head 跨 layer 的 K/V 对比图，以及 per-token 与 per-channel range 对比图。 -->

## 一个发现：K 和 V 的脾气不太一样

- K 存在稳定的大幅值 channel
- V 的分布相对均匀
- 因而不应强行用同一种量化分组策略

# KIVI：给 KV Cache 上点强度

## KIVI 做了什么？

- Key：按 channel 分组量化
- Value：按 token 分组量化
- 最近的一段 token 保留 FP16 residual
- 较旧部分压缩为 INT8 / INT4 / INT2

建议配一张缓存结构图：

```text
Old K/V (packed low-bit) | Recent residual (FP16)
```

## 我实现了什么？

- INT2 / INT4 / INT8 的 pack 与 unpack
- affine min-max group quantization
- 流式 append 与 residual flush
- quantized cache 的 dequantize 验证
- teacher-forced 与 free-running generation correctness test

## 结果怎么样？

| Config | Teacher Match | Mean KL | Persistent bytes | Compression |
| :--- | ---: | ---: | ---: | ---: |
| FP16 | 100% | 0 | 4,792,320 | 1.00× |
| INT8 | 100% | 0.000273 | 3,227,904 | 1.49× |
| INT4 | 100% | 0.001134 | 2,333,952 | 2.05× |
| INT2 | 93.75% | 0.028037 | 1,886,976 | 2.54× |

- INT4 是这次实验里最平衡的选择
- INT2 更省，但已经出现明显输出偏差
- 实际压缩率低于理论值：residual 与 scale/offset metadata 都要占空间

# 只压缩还不够：多核为什么还要共享 KV？

## 重复搬运的问题

- 多个 core 的 Query tile 都可能需要同一 KV tile
- 若每个 core 各读一次，带宽会被重复消耗
- 理想情况下，$C$ 个 core 可以共享一次 load

$$
\text{Traffic reduction} \approx 1 - \frac{1}{C}
$$

## 项目中的设想：Shared KV Tile Buffer

```text
L2 / DRAM
    ↓
Shared ping-pong KV buffer
    ↓ broadcast
Local L1 of each core
    ↓
QKᵀ → online Softmax → PV
```

- K/V immutable，硬件一致性问题比普通共享内存简单
- 双缓冲让下一块加载与当前块计算重叠
- tile-local dequantization：低比特数据尽量只在外部路径上传输

# 但是，理论不是性能

- Core 不一定同时请求同一块 KV
- 广播本身也有互连成本
- 完整反量化 Cache 会增加临时内存和转换开销
- FlashAttention、量化、共享调度需要一起设计，不能各做各的

# 总结

- KV Cache 解决了重复计算，却将 Decode 推向 memory-bound
- KIVI 说明 K/V 应区别对待；本实验中 INT4 是较好的折中
- 多核共享 KV 可以减少重复的上层存储流量
- 下一步：trace/cycle-level simulation，测量 tile reuse、stall、实际带宽与吞吐

# Reference

- Attention Is All You Need
- FlashAttention / FlashAttention-2 / FlashAttention-3
- KIVI
- SpAtten
