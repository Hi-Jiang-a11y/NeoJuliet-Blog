---
title: 'KVCache'
author: 'Juliet'
description: '从 Transformer 推理到 KIVI 量化缓存的一点实验记录'
pubDate: 'Aug 01 2026'
tags: ["AI"]
pinned: false
license: "CC BY-SA 4.0"
---

> 本文记录对 KV Cache 的一点理解 & 探索。

# Billions Must Use AI;;

无论你从事什么行业，正在做什么项目，AI 都能来掺一脚。或者说，人类的觉悟已经高到开始主动强化风险意识，确保安全可控，携手构建公正合理的全球人工智能治理体系了。

搞生物的用它预测蛋白质结构，搞数学和物理的用它找规律、加速仿真，搞软件的自然不用多说，就连聪明如刁酱都在狠狠地「[一定要把 ai 搞上天](https://www.news.cn/zt/waic2026/)」

学 EE 的苦逼，越来越频繁地在课程和项目里碰到 (帮我做模电作业)。AI 正在 (已经) 从一个相对独立的研究方向，变成多学科共同使用的基础设施。

不过，不同人口中的「搞 AI」其实可以是完全不同的事情。有人研究模型原理和训练方法，有人关心具体应用，也有人试图解答一个更偏工程的问题：庞大的模型，究竟怎样才能跑起来，而且跑得多快好省？

对于 EE 人来说，需要解决最后一个问题。模型最终要落在硬件上，受到存储容量、访存带宽、数据精度、并行方式和能耗的约束。

矩阵公式写在纸上很~~简洁~~，执行时却必须把每一个数字实实在在地储存、搬运、算完再搬走。作为 ~~工程师~~，暂且不必先回答 “ intelligence 是怎么产生的”，至少需要知道模型在推理时算了什么、数据怎样流动，再设法造出一台能把这些计算高效完成的机器。

好在「算什么，怎么算」这种事，前人已经为我们留下了一个足够经典的起点：[**Attention Is All You Need**](https://arxiv.org/abs/1706.03762)。

这篇 2017 年的论文提出了 Transformer 架构，它最初解决的是机器翻译，但它的意义很快超出了翻译本身。此前的自然语言处理往往是「一个任务训练一个模型」——情感分析、翻译、问答、摘要各有各的模型、数据集和特征工程；Transformer 则为同一套模型从大规模文本中学习通用语言表示提供了一个足够有效的骨架。

随后，业界逐渐形成了今天熟悉的路径：先训练一个能够理解和生成文本的基础模型，再用微调、检索或 prompt 让它适配具体需求。GPT 系列采用 decoder-only Transformer，而 GPT-3 则让更多人直观看到：当模型和训练数据扩展到足够规模时，同一个文本生成模型可以仅凭少量示例或一段指令，完成问答、改写、摘要、翻译等多种任务。

今天人们所说的「大语言模型」，大多都沿着这条 Transformer 的路线发展而来。模型的规模、训练数据当然早已远超原论文，但推理时最基本的数据流，仍然可以从 Transformer 的 Attention 计算开始理解。

我们先把文字送进 Transformer，看它怎样一步一步运算。

> 这里先划定一下范围：本文不讨论模型如何从海量文本中训练出参数，也不试图解释「intelligence」；本文只关心训练完成之后的 **inference (推理)**。此时模型的权重已经确定，硬件要做的事情，就是按照既定的方法执行一连串矩阵乘法、归一化、非线性运算。

# Attention Is NOT All You Need

语言模型不能直接处理人类文字。在输入模型之前，文本会先经过 tokenizer，被切分成一串 **token**。
一个 token 可能是一个汉字、单词、单词的一部分，或者标点符号；每个 token 都对应词表中的一个整数 ID。

例如，句子：

```text
KV Cache saves memory bandwidth.
```

可能会被拆成类似下面的序列：

```text
["KV", " Cache", " saves", " memory", " bandwidth", "."]
                         |
                         |  tokenizer
                         V
[token_1, token_2, token_3, token_4, token_5, token_6]
```

具体怎样切分取决于模型使用的 tokenizer。对后面的计算来说，文本至此已经变成了一串整数 ID。这些 ID 经过 embedding table 的查表操作，被转换成一组向量。若输入中共有 $n$ 个 token、每个向量的宽度为 $d$，便可以将它们排列成一个 $n$ 行 $d$ 列的矩阵: 

$$
X\in\mathbb{R}^{n\times d}
$$

矩阵中的每一行对应一个 token。模型还会通过位置编码或 RoPE 等机制注入位置信息，否则仅凭这些向量，它无法区分 token 的先后顺序。

论文里面的原始 Transformer 是一个 **Encoder - Decoder** 架构: Encoder 读取输入序列；Decoder 在生成输出时，一边关注已经生成的前文，一边通过 Cross-Attention 读取 Encoder 的输出。这种结构适合机器翻译等「输入序列到输出序列」的任务。

<figure style="
  --figure-width: 420px;
  width: min(100%, var(--figure-width));
  margin: 1.5rem auto;
">
  <img
    src="/images/Transformer_Structure_Paper.webp"
    alt="Attention Is All You Need 论文中的 Transformer Encoder--Decoder 架构"
    style="
      display: block;
      width: 100%;
      height: auto;
      border-radius: 8px;
    "
  />
  <figcaption style="
    margin-top: 0.55rem;
    color: #777;
    font-size: 0.85rem;
    line-height: 1.5;
    text-align: center;
  ">
    原始 Transformer 的 Encoder - Decoder 架构
</figure>

但是，**Attention 并非 All You Need**。一个语言模型不只包含 Attention，也不是把一句话塞进某公式后就能直接吐出答案。

一个 Transformer Layer (也就是图中的 Decoder block) 中主要包含一下几类计算: 
+ Masked Self-Attention: 让当前位置只能读取自己和此前的 token；
+ Cross-Attention: 读取 Encoder 的信息；
+ Feed-Forward Network (FFN): 分别变换每个位置的向量。
+ 残差连接和归一化: 使这些 block 可以稳定地堆叠很多层。

看不懂？没关系！大语言模型通常使用 **decoder-only Transformer**: 去掉了 Encoder 和 Cross-Attention，只保留重复堆叠的 Layer。给定 prompt 后，模型从左到右预测下一个 token，刚生成的 token 会被接回输入，触发下一轮推理。这个过程持续到模型生成结束标记，或达到预设的最大生成长度为止。


下图中的 **Transformer Layer 1** 到 **Transformer Layer L** 是 decoder-only 模型中依次执行的完整 Decoder block。

<div style="display:flex; justify-content:center;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1400px;
    aspect-ratio: 4 / 1;
    border: 3px solid #555;
    border-radius: 12px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/Transformer_FullFlow_LayerBlackBoxes.html"
      title="Transformer 自回归生成流程"
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
<p style="
    margin: 0.6rem 1rem 0;
    text-align: center;
    color: #777;
    font-size: 0.9rem;
    line-height: 1.5;
  ">
    Transformer 的自回归生成流程。这里取 n = 4 。
</p>

第 $1$ 层接收 $X^{(0)}$，输出 $X^{(1)}$，第 $\ell$ 层接收 $X^{(\ell-1)}$ 并输出 $X^{(\ell)}$，最终由第 $L$ 层输出 $X^{(L)}$: 

$$
X^{(0)}\rightarrow X^{(1)}\rightarrow\cdots\rightarrow X^{(L)}
$$

最后一层的 $X^{(L)}$ 仍是一个 $n\times d$ 的矩阵。推理时，模型取其最后一行，经过一系列运算，得到下一个 token 。这个 token 再经过 embedding 与位置信息处理，成为 $x_{n+1}^{(0)}$，append 到最初的 $X^{(0)}$。输入从 $n\times d$ 增长为 $(n+1)\times d$，并开始下一轮推理；是谓 **自回归 (autoregressive)**。

本文不展开整个 Transformer layer 的每一步，仅关注图 1 红色圆圈圈出的部分 —— **Masked Self-Attention**。

Masked Self-Attention 必须让当前位置与之前的 token 发生交互。这是 Transformer 能利用长上下文的关键，也是计算量与数据流开始依赖序列长度的地方(当然也是和本文主题 KV Cache 相关的部分😋)。

为了让符号更简洁，下面省略层编号，将这一层收到的 hidden states 统一记为: 

$$
X\in\mathbb{R}^{n\times d}
$$

# Attention Is All You Need！

上一节的 $X$ 指的是某个 Transformer layer 收到的 hidden states。我们可以把 Attention 运算想象一副「从上下文找信息」的镜头: 当前 token 用它判断哪些位置和自己有关，再把那些位置的信息带回来。

但一句话里的线索往往不只一种。比如读到一个词时，模型可能既要看紧邻的修饰词，也要找很前面的主语，还要参考某个代词究竟指向谁。如果只有一个 attention head，它只有一副镜头，只能用一种方式分配注意力；把这些不同线索全塞进一张权重表里并不理想。

因此真实模型使用 **Multi-Head Attention（MHA）**，即多注意力头: 同一份 $X$ 会同时交给 $h$ 个 attention head。它们像 $h$ 副不同的镜头，各自用自己的参数观察上下文；一个 head 可能更关注近处，另一个可能更关注远处或另一种关联。模型不会预先规定每个 head 的职责，而是在训练中自己学会怎样分工。最后再把各个 head 找到的信息合并起来。

总 hidden size 为 $d$，若使用 $h$ 个等宽的 head，通常令

$$
d_k=\frac{d}{h}
$$

即，$d$ 个特征被分成 $h$ 份交给不同 head 处理，每个 head 只处理其中的 $d_k$ 个；每一个 head 运算结束后将结果拼接，最后得到的宽度仍是 $h\times d_k=d$。

为了看清 MHA 内部真正发生的计算，接下来先拆开其中一个 head。若没有特别说明，讨论的都是同一个 layer 中第 $i$ 个 attention head: 

| 符号 | 含义 | 图中的取值 |
| :---: | --- | :---: |
| $n$ | 当前序列中的 token 数 | $4$ |
| $d$ | 模型的 hidden size，即每个 token 向量的宽度 | $12$ |
| $h$ | attention head 的数量 | $4$ |
| $d_k$ | 单个 head 的 Key/Query/Value 宽度，通常有 $d_k=d/h$ | $3$ |
| $i$ | attention head 的编号，$i=1,\ldots,h$ | - |
| $X\in\mathbb{R}^{n\times d}$ | 该 layer 的输入；第 $t$ 行记作 $x_t$ | $4\times12$ |

<div style="display:flex; justify-content:center; margin:1.5rem 0 0;">
  <div style="
    position: relative;
    width: 100%;
    max-width: 1400px;
    aspect-ratio: 2.80 / 1;
    border: 2px solid #555;
    border-radius: 10px;
    overflow: hidden;
  ">
    <iframe
      src="/assets/Attention_n4.html"
      title="四个 Token 的 Masked Self-Attention 运算流程"
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
<p style="
  margin: 0.6rem 1rem 0;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.5;
">
  四个 token 的 Masked Self-Attention 运算示意
</p>

每个 head 都有自己独立的训练好的权重 $W_Q^{(i)},W_K^{(i)},W_V^{(i)}\in\mathbb{R}^{d\times d_k}$。它们把同一份输入 $X$ 投影成 Query、Key 与 Value: 

$$
Q^{(i)}=XW_Q^{(i)},\qquad
K^{(i)}=XW_K^{(i)},\qquad
V^{(i)}=XW_V^{(i)}
$$

因此 $Q^{(i)},K^{(i)},V^{(i)}\in\mathbb{R}^{n\times d_k}$。可以把 $Q$ 看成「当前位置想找什么」，$K$ 看成「每个位置能被怎样匹配」，$V$ 则是「匹配成功后实际读出的内容」。三者都来自同一个 $X$，只是经过了不同的线性投影。

接下来，$QK^{\mathsf{T}}$ 让每一个 Query 都和所有 Key 做点积，得到分数矩阵 $S$，再除以 $\sqrt{d_k}$；对于 decoder-only 模型，还要加入 causal mask，禁止当前位置读取未来 token:

$$
S^{(i)}=\frac{Q^{(i)}(K^{(i)})^\mathsf{T}}{\sqrt{d_k}},\qquad
P^{(i)}=\operatorname{Softmax}\bigl(S^{(i)}+M\bigr)
$$

其中，$S^{(i)}$ 与 $P^{(i)}$ 的形状都是 $n\times n$。

最后将 $P$ 矩阵与 Value 矩阵 $V$ 相乘得到 $H$:

$$
H^{(i)}=P^{(i)}V^{(i)}
$$

现在回到完整的 MHA: $h$ 个 attention head 并行执行以上操作，得到 $H^{(1)},\ldots,H^{(h)}$；再拼接并乘上输出投影 $W_O\in\mathbb{R}^{d\times d}$: 

$$
O=\operatorname{Concat}\bigl(H^{(1)},\ldots,H^{(h)}\bigr)W_O
$$

图中最右侧的 $O$ 是当前 Transformer layer 的 Attention 计算的输出，不是此 layer 的输出。它还会经过残差连接、归一化和 FFN 等一系列操作，才成为下一层的输入；只有最后一个 layer 的**最后一行**，在经过 LM Head 后才会给出下一个 token 的概率分布。本文暂时把这些步骤省略，因为 KV Cache 保存和复用的正是前面 Attention 内部的 $K$ 与 $V$。

> 🐱: 真是复杂喵，为什么要使用 QKV 这三个矩阵，为什么要这么设计？

> 😡: 这是 ai 学家的事！我方对此无可奉告！


# 有 Cache 无 Cache

到这里，我们已经大致知道了 attention layer 里面的 attention 计算是什么样的。回忆第二个章节的内容: 模型在经过 $1\cdots L$ 个 layer 后计算出下一个 token，将它 append 回最初的输入，再开始下一轮推理。

然而贪婪的工程师总想要提升运算的速度，于是 KV Cache 诞生了。为了更好地解释为什么需要 KV Cache，下面不妨考虑第 $n+1$ 个 token 的诞生过程。

<div style="display:flex; justify-content:center; margin:1.5rem 0 0;">
  <div style="position:relative; width:100%; max-width:1400px; aspect-ratio:2.85 / 1; border:2px solid #555; border-radius:10px; overflow:hidden;">
    <iframe src="/assets/KVCache_Figure.html?figure=no-cache" title="没有 KV Cache 时重新计算完整序列" style="position:absolute; inset:0; width:100%; height:100%; border:none;"></iframe>
  </div>
</div>
<p style="margin:0.6rem 1rem 0; text-align:center; color:#777; font-size:0.9rem; line-height:1.5;">
  红色为历史行，蓝色为刚加入的新 token。
</p>

上一轮推理生成的 token 被 append 到 $X$，$X$ 变成了 $n+1$ 行 $d$ 列的矩阵（图中蓝色区域为 append 的行），接着和 $W_Q,W_K,W_V$ 进行矩阵乘法。观察结果不难发现，$Q/K/V$ 的红色区域是上一轮推理已经计算过的部分，而只有蓝色区域是需要重新计算的地方。

接着观察 $PV$ 运算。图的上半部分对应长度为 $n$ 的序列；append 新 token 后，序列长度变为 $n+1$，得到下半部分的矩阵。此时 $V$ 增加一行，而 $P$ 同时增加一行和一列。由于 causal mask 会在 Softmax 前把 score 矩阵上三角的位置设为 $-\infty$，Softmax 后这些位置在 $P$ 中的概率就是 $0$。因此新旧两次计算中 $P$ 与 $V$ 的前 $n$ 行不变。相应地，长度为 $n+1$ 时得到的 $H=PV$，其前 $n$ 行与长度为 $n$ 时的结果完全相同；蓝色最后一行才是 token $n+1$ 新产生的输出。

<div style="display:flex; justify-content:center; margin:1.5rem 0 0;">
  <div style="position:relative; width:40%; max-width:400px; aspect-ratio:1.33 / 1; border:2px solid #555; border-radius:10px; overflow:hidden;">
    <iframe src="/assets/PV_Compare.html" title="长度 n 与 n+1 的 PV 运算对比" style="position:absolute; inset:0; width:100%; height:100%; border:none;"></iframe>
  </div>
</div>

Attention 输出经过多头拼接、输出投影、残差连接和 FFN 后，历史行仍然不变。因此第 $2\cdots L$ 层 Transformer layer 的输入相比上一轮推理也只增加了一行: 

$$
X^{(1)}_{1:n}\longrightarrow X^{(1)}_{1:n+1} \qquad \cdots \qquad X^{(L-1)}_{1:n}\longrightarrow X^{(L-1)}_{1:n+1}
$$

既然生成的 token 只和最后一行有关，那么每次计算时为什么还要带着庞大的历史 token？于是工程师改进了方法: 把不会改变、又会被后续 token 反复读取的 Key 和 Value 留下来。

<div style="display:flex; justify-content:center; margin:1.5rem 0 0;">
  <div style="position:relative; width:100%; max-width:1400px; aspect-ratio:3.02 / 1; border:2px solid #555; border-radius:10px; overflow:hidden;">
    <iframe src="/assets/KVCache_Figure.html?figure=cache" title="使用 KV Cache 的单 token decode" style="position:absolute; inset:0; width:100%; height:100%; border:none;"></iframe>
  </div>
</div>
<p style="margin:0.6rem 1rem 0; text-align:center; color:#777; font-size:0.9rem; line-height:1.5;">
  绿色为已保存的历史 K/V，蓝色为当前新 token 产生的 K/V。
</p>

## Prefill

第一次输入 prompt 时，假设其中有 $n$ 个 token，模型会将整个 $X_{1:n}^{(0)}\in\mathbb{R}^{n\times d}$ 一次送入第 1 层。每个 layer 计算这 $n$ 行对应的 $K/V$ 和 attention 输出，最后由第 $L$ 层的最后一行预测第一个生成 token。

这个阶段称为 **prefill**。经过 prefill 后，每一层都已经计算得到这 $n$ 个 token 对应的 Key 和 Value: 

$$
K_{1:n}^{(\ell)},\qquad V_{1:n}^{(\ell)},\qquad \ell=1,\ldots,L
$$

将这些 $K$ $V$ 暂时保存起来，是谓 KVCache。不同 layer，不同 head 的权重不同，所以它们各自拥有独立的 cache。

## Decode

模型从 prefill 的最后一行选出 token $n+1$ 后，将它 embedding 成一行新的 hidden state $x_{n+1}\in\mathbb{R}^{1\times d}$。如果完全不保存任何中间结果，最直接的实现方式就是把 append 后的 $X_{1:n+1}$ 整体重新送进每一层；这就是上图中红色历史行被重复计算的原因。

此时每层只接收一行新 hidden state，只计算新的 $q_{n+1},k_{n+1},v_{n+1}$；随后把 $k/v$ append 到该层的历史 cache: 

$$
K_{1:n+1}=\operatorname{concat}(K_{\mathrm{cache}},k_{n+1}),\qquad
V_{1:n+1}=\operatorname{concat}(V_{\mathrm{cache}},v_{n+1})
$$

新的 Query 仍需要读取全部历史 K/V，但现在只需计算一行 score 和一行输出: 

$$
s_{n+1}=\frac{q_{n+1}K_{1:n+1}^{\mathsf T}}{\sqrt{d_k}},\qquad
o_{n+1}=\operatorname{Softmax}(s_{n+1})V_{1:n+1}
$$

> 历史 Query 和历史 Attention 输出不会再被未来 token 使用，因此不必缓存。

KV Cache 省去了历史 token 的重复投影和重复 Attention 计算，但代价是每一层的 K/V 会随序列增长持续占用显存，并在 decode 时反复读取。这正是后文量化、压缩与共享 KV 数据的出发点。

## 复杂度对比

无 Cache 时，模型把长度为 $t$ 的整段序列一起送入 Attention: $Q,K,V$ 都是多行矩阵，$QK^{\mathsf T}$ 和 $PV$，以及 $Q/K/V$ 的计算都是 **矩阵-矩阵乘法** (GEMM)。

$$
H = \operatorname{Softmax}\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}+M\right)V, \qquad
\left\{
  \begin{aligned}
  Q &= XW_Q\\
  K &= XW_K\\
  V &= XW_V
  \end{aligned}
\right.
$$

对比使用 KVCache 的情形，$qK^{\mathsf T}$ 与 $\operatorname{Softmax}(\cdots)V$ 、$q/K/V$ 的计算都是**向量-矩阵乘法** (GEVM)。


$$
h = \operatorname{Softmax}\left(\frac{qK^{\mathsf T}}{\sqrt{d_k}}\right)V, \qquad
\left\{
  \begin{aligned}
  q & =xW_Q \\
  K &= \operatorname{concat}\left(K_{\text{cache}}, xW_K\right)\\
  V &= \operatorname{concat}\left(V_{\text{cache}}, xW_V\right)
  \end{aligned}
\right.
$$

# Time v.s. Space

我操这么好的技术你怎么咋不早点告诉我。

使用 KVCache，显著提高了 Attention 计算的速度，但是世上没有免费的午餐—— KV Cache 需要大量额外的显存空间。

这里使用标准的 Multi-Head Attention 作为例子，第 $\ell$ 层、第 $i$ 个 head 在已有 token 数为 $n$ 时的历史 $K,V$ 都是 $n\times d_k$ 的矩阵。如果矩阵的每个数字使用 $b$ 个 bit 存储，$K, V$ 共需 $2 \times n \times d_k \times b$ 空间。对于共 $L$ 层 layer，每层 $h$ 个注意力头的模型，KVCache 大小为:
$$
2 \times n \times d_k \times b \times L \times h \text{ bits}
$$

以 [GPT-2 small](https://openai.com/index/better-language-models/) 为例，它有 $L=12$ 层、每层 $h=12$ 个 attention head，每个 head 的维度为 $d_k=64$；KVCache 使用 FP32 精度，即每个元素占 $b=32$ bits，那么: 

$$
\begin{aligned}
\text{KV Cache Size (Per token)}
&=2\times64\times32\times12\times12\ \text{bits/token} \\
&= 72\ \text{KiB/token}
\end{aligned}
$$

当上下文长度达到 $1024$ 个 token 时，单个请求的 KV Cache 就大约需要: 

$$
72\ \text{KiB/token}\times1024\ \text{token}
=72\ \text{MiB}.
$$

如果同时处理多个请求，Cache 还会随着 batch size 线性增加。例如 batch size 为 $8$ 时，仅 GPT-2 small 的 KV Cache 就需要约 $576\ \text{MiB}$。

对于更大的语言模型，这个问题会因为更多的 layer、更宽的 hidden size 和更长的上下文而继续放大。

以 [Llama 2 7B](https://arxiv.org/abs/2307.09288) 为例: $L=32$ 层，$h=32$ 个 head，$d_k=128$；使用 FP16 精度时每个 token 的 KV Cache 约为 $512\ \text{KiB}$。当上下文达到 $4096$ 个 token 时，单个请求的 KVCache 已膨胀到 $2\ \text{GiB}$；batch size 为 $32$ 时，仅缓存就占据 $64\ \text{GiB}$，占一张 A100 (80 GiB) 的 80%。

一个 7B 模型，单次推理的 KVCache 就能吞掉一张 A100 八成的显存。用户若想用 128k 上下文、批量服务 128 个请求，需要约 100 张 A100 的显存😰。

于是抠门的计算机科学家开始想各种办法。不过动手之前，需要先区分**显存容量**和**显存带宽**。

容量不够是指 cache 太大，装不下。带宽不够，即 cache 装得下，但每次 decode 都要把 KVCache 从显存读一遍，写入 SRAM 再给计算单元计算。随着计算单元的算力以及并行度的提升，数据搬运的速度跟不上计算的速度，导致计算单元闲置。

后者其实在 FlashAttention 提出之前就相当严重了—— prefill 阶段 softmax 前面的 $n \times n$ 矩阵也要在 HBM 上反复读写，浪费大量带宽。

## FlashAttention 系列

[FlashAttention (2022)](https://arxiv.org/abs/2205.14135) 和 [FlashAttention-2 (2023)](https://arxiv.org/abs/2307.08691) 早已意识到前文的显存带宽问题随着生成序列增长，搬运数据的读写开销比矩阵乘法本身还大。

FlashAttention 用 **tiling + online softmax** 把 Attention 拆成小块在 SRAM 里就地完成，全程不把完整的 $S$ 和 $P$ 写回 HBM。

FlashAttention-2 进一步提高并行度，让更多线程组同时干活；还把非矩阵乘法运算的比例压到更低。

到了 [FlashAttention-3 (2024)](https://arxiv.org/abs/2407.08608)，主要利用 NVIDIA Hopper 架构 (H100) 的异步硬件单元。TMA 负责在后台搬运数据，WGMMA 做异步矩阵乘法；论文设计了一套 producer-consumer warp specialization 和 ping-pong 调度，狠狠压榨硬件。

> 这三个工作解决的核心问题是 **Attention 计算本身的 I/O 瓶颈**，和你的 KV Cache 有多大无关。但推理时 decode 阶段本身已经是 memory-bound，所以它们对 decode 的加速不如对 prefill 明显。

## [KIVI](https://arxiv.org/abs/2402.02750) — 非对称量化

KV Cache 的大小和量化的 bit 数相关。用更少的 bit 量化能减少 KVCache 的大小，比如 2-bit，相比 FP32，减少了 16 倍，2 bits 只能表示 4 个数，而 FP32 能表示 $2^{32}$ 个数字，两者的精确度差别会直接把生成质量打烂。而 KIVI 提出了使用 2-bit 量化但是不明显降低质量的量化方法。

论文首先统计了 KVCache 的分布特征，以论文里面的图为例: 

<figure style="
  --figure-width: 700px;
  width: min(80%, var(--figure-width));
  margin: 1.5rem auto;
">
  <img
    src="/images/KIVI_KV_view.webp"
    alt="KIVI 的 K/V Cache"
    style="display: block; width: 100%; height: auto; border-radius: 8px;"
  />
  <figcaption style="margin-top: 0.55rem; color: #777; font-size: 0.85rem; line-height: 1.5; text-align: center;">
    Key 有明显的凸起值，Value 相对不明显
</figure>

+ Key: 在某些 channel 上在存在明显的凸起值 (outlier)。
- Value: 分布相对均匀。

如果对 K 使用 per token 的量化，较大的 outlier 使每个 group 内部的值范围 ($\text{max} - \text{min}$) 过大，分配到每个量化 level 的步长更长，使精细度降低。

KIVI 针对 Key 做 per-channel 量化，对 Value 保留 per-token 量化，因此称为「非对称量化」。

## Cross Layer Attention — 相邻层共用 cache

[Cross-Layer Attention (CLA, 2024)](https://arxiv.org/abs/2405.12981) 发现相邻 Transformer Layer 的 Key/Value 表示有很高的相关性——既然这么像，相邻两层共用同一份 KV Cache 不就能压缩一倍 KVCache 了么。
CLA 引入一个 **sharing factor**: 比如 CLA2 表示每 2 层共享一份 K/V。Layer 1 和 Layer 2 用同一组 KVCache；Layer 3 和 Layer 4 用统一组 KVCache ...

不过论文只在 1B-7B 等小规模模型上验证了这个方案，并且由于改变了模型的结构，必须从头预训练，无法直接应用于现成的预训练模型。

## SpAtten — token 剪枝

非常朴素的思路，直接少读几个 token，cache 就自然小了。

[SpAtten (2020)](https://arxiv.org/abs/2004.03789) 提出的方案是 **cascade token pruning**: 在推理时动态判断哪些 token 是"语气词"式的结构 token (如冠词 `a`、`the`)，这些 token 对后续 Attention 的贡献极小，可以逐步丢弃。同时 SpAtten 还会做 cascade head pruning，把冗余的 attention head 一并去除。

为了减少反复读取 HBM 的开销，SpAtten 还引入了 **progressive quantization**: 默认只读 4-bit MSB 做粗略计算，仅在 Attention 概率分布过于平坦 (置信度低) 时才触发 LSB 的重新读取和完整精度重算。

# References

1. Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762), 2017.
2. Radford et al., [Language Models are Unsupervised Multitask Learners](https://openai.com/index/better-language-models/), 2019.
3. Touvron et al., [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288), 2023.
4. Dao et al., [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135), 2022.
5. Dao, [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), 2023.
6. Shah et al., [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608), 2024.
7. Liu et al., [KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache](https://arxiv.org/abs/2402.02750), 2024.
8. Brandon et al., [Reducing Transformer Key-Value Cache Size with Cross-Layer Attention](https://arxiv.org/abs/2405.12981), 2024.
9. Wang et al., [SpAtten: Efficient Sparse Attention Accelerator with Cascaded Token and Head Pruning](https://arxiv.org/abs/2004.03789), 2020.
