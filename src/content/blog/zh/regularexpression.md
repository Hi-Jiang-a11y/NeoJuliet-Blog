---
title: '正则表达式简介'
author: 'Juliet'
description: 'Learning regular expressions'
pubDate: 'Oct 19 2025'
tags: ["linux", "tutorial"]
pinned: false
license: "CC BY-SA 4.0"
---
# 引言
## 什么是正则表达式 (Regex)
正则表达式（regex）是用于匹配字符串中字符组合的模式。它们构成了一种小型、专门的编程语言，嵌入在标准编程语言和工具中  
+ 1956: Stephen Kleene 发展数学基础
+ 1968: Ken Thompson 在QED文本编辑器中实现了该功能
+ 1970s: 在 unix 工具里面变得标准化
+ 1990s: POSIX 标准化：BRE（基本正则表达式）和 ERE（扩展正则表达式)  
## 为什么使用正则
+ **文本搜索**：在文档中查找特定的模式。
+ **数据验证**：检查输入格式（如邮箱、电话号码）
+ **数据提取**：从文本中提取特定信息
+ **内容替换**：有系统地修改文本模式
+ **数据解析**：分解结构化的文本数据

# 核心概念
## 字面量 (Literals)
字面量是指匹配自身的字符，在正则表达式中没有特殊含义。  
例如，在正则 `cat` 中，`c`、`a`、`t` 都是字面量，它仅匹配文本中精确的字符串 "cat"

## 元字符 (Metacharacters)
元字符是在正则表达式中具有特殊含义的字符，它们代表某种操作而非字符本身  

| 元字符 | 描述 |
| :---: | :--- |
| . | 匹配任意单个字符 |
| ^ | 匹配字符串或行的开头 |
| $ | 匹配字符串或行的结尾 |
| * | 匹配前一个元素零次或多次 |
| + | 匹配前一个元素一次或多次 |
| ? | 匹配前一个元素零次或一次 |
| [] | 字符类（匹配括号内的任一字符） |
| () | 分组 |
| \| | 分支（逻辑“或”） |
| {m, n} | 指定出现次数的量词 |

> *具体可用性取决于 BRE 或 ERE 标准，详见第3节*  

# BRE 与 ERE (POSIX 标准)
POSIX 定义了两种正则语法：
* **BRE (Basic Regular Expression)**：`grep`、`sed`、`ed` 的默认模式  
* **ERE (Extended Regular Expression)**：用于 `grep -E`、`egrep`、`awk`  

## 语法差异
| BRE 语法 | ERE 语法 | 描述 |
| :---: | :---: | :--- |
| `\(...\)` | `(...)` | 将模式组合在一起 |
|``` ` ```|`\`| 逻辑“或”操作 |
|需转义|原生支持|+ 和 ?|
|需转义|原生支持|{m,n}|

# 匹配技术
## 任意字符 (`.`)
点号 `.` 用于匹配除换行符以外的任何单个字符  
例:  
```bash
$ ls /usr/bin | grep '.zip'
bsdunzip
bunzip2
bzip2
bzip2recover
gunzip
gzip
hunzip
hzip
libdeflate-gunzip
libdeflate-gzip
```
+ `.zip` 将匹配所有包含 `xzip`（任意字符加 zip）的项  
+ 注意：`zip` 本身不会被匹配（因为点号要求前面必须有一个字符）  

## 锚点 (Anchors: ^ 和 $)
字符 `^` 和 `$` 被视为锚点。它们使匹配仅在正则表达式位于行首 (`^`) 或行尾 (`$`) 时才发生  
例:
```bash
$ ls /usr/bin | grep -h '^zip'
zip
zipcmp
zipmerge
ziptool

$ ls /usr/bin | grep 'zip$'
bsdunzip
gunzip
gzip
hunzip
hzip
libdeflate-gunzip
libdeflate-gzip
zip

$ ls /usr/bin | grep -h '^zip$'    
zip
```
+ `^zip` 将匹配所有以 `zip` 开头的行  
+ `zip$` 将匹配所有以 `zip` 结尾的行  
+ `^zip$` 将精准匹配 `zip`  

## 括号表达式 ([])
匹配指定字符集中的任意单个字符
### 基本形式
例:
```
$ ls /usr/bin | grep -h '[bg]zip'
bzip2
bzip2recover
gzip
libdeflate-gzip
```
+ `[bg]zip` 匹配 `bzip` 和 `gzip`

### 取反 (Negation)
```
$ ls /usr/bin | grep -h '[^bg]zip'
bsdunzip
bunzip2
gunzip
hunzip
hzip
libdeflate-gunzip
```
如果括号表达式中的第一个字符是脱字符 (^)，则其余字符被视为在该位置不得出现的字符集合  
+ `[^bg]zip` 将匹配所有不以 b 或 g 开头但包含 zip 的项  
+ 注意：`zip` 本身不会被匹配  

### 字符范围
`[ABCDEFGHIJKLMNOPQRSTUVWXYZ]` 可以被 `[A-Z]` 代替  
例:
```
$ ls /usr/bin | grep -h '^[A-F]'
CreateDOMDocument
DOMCount
DOMPrint
DroidSans.ttf
EnumVal
FileCheck
```
+ `^[A-F]` 匹配所有以 `A-F` 开头的行  
相似的, 
+ `^[A-Za-z]` 匹配以 52 个字母开头的元素  
+ `^[A-Za-z0-9]` 匹配所有以字母或数字开头的元素  
+ 注意正则 `[-AZ]` 将匹配一个连字符 - 、大写字母 A 或大写字母 Z  

# 量词 (Quantifiers)
量词指定前面的元素可以出现的次数（此处显示 ERE 语法）  
|形式|描述|
|:---:|:---|
|?|0次或1次|
|*|0次或更多|
|+|1次或更多|
|{m}|刚好m次|
|{m,}|至少m次|
|{m, n}|m次和n次之间|
+ `[0-9]+` 匹配一个或多个数字  
+ `[A-Za-z]{3,5}` 匹配 3 到 5 个字母  

# 分组与分支 (Grouping and Alternation))
正则表达式中的圆括号 `()` 主要有两个用途:  
## 结构化分组
它们允许你将操作应用于多个字符组成的整体  
+ `(ha)+` 匹配 `ha`, `haha`, `hahaha`, ...  
+ `ha+` 匹配 `ha`, `haa`, `haaa`, ...
## 分支与分组结合
正则 `AAA|BBB` 意味着匹配字符串 "AAA" 或 "BBB"  
为了将分支与其他正则表达式元素结合使用，我们可以使用 `()` 来分隔分支:
```
^(bz|gz|zip)
```
+ 这将匹配以 `bz`、`gz` 或 `zip` 开头的字符串
```
^bz|gz|zip
```
+ 这将匹配以 `bz` 开头、或包含 `gz`、或包含 `zip` 的字符串

# 例
> 邮箱匹配（简化版）  
> `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`  
> user@example.com  
> a_b-c@sub.domain.org

> 手机号  
> `^1[3-9][0-9]{9}$`  
> 13912345678  
> 18412345678

> 日志时间戳  
> `[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}`  
> 2025-01-01 10:09:59  
> 1999-12-31 23:59:59    
# Reference
[1] Wikipedia, "Regular expression," [Online]. Available: https://en.wikipedia.org/wiki/Regular_expression. [Accessed: Jan. 19, 2026].  
[2] W. E. Shotts, Jr., *The Linux Command Line: A Complete Introduction*, 2nd ed. San Francisco, CA, USA: No Starch Press, 2019. 
