---
title: 'Simple Introduction to Regular Expressions'
author: 'Juliet'
description: 'Learning regular expressions'
pubDate: 'Oct 19 2025'
tags: ["linux", "tutorial"]
pinned: false
zh: true
license: "CC BY-SA 4.0"
---
# Introduction
## What are Regular Expressions
Regular expressions (regex) are patterns used to match character combinations in strings. They form a small, specialized programming language embedded inside standard programming languages and tools.
+ 1956: Stephen Kleene develops mathematical foundation.
+ 1968: Ken Thompson implements in QED text editor.
+ 1970s: Becomes standard in Unix tools (ed, grep, sed).
+ 1990s: POSIX standardization: BRE(Basic Regular Expression) & ERE(Extended Regular Expression).

## Why Regex
+ Text Search: Find specific patterns in documents
+ Validation: Check input format (emails, phone numbers)
+ Extraction: Pull specific data from text
+ Replacement: Modify text patterns systematically
+ Parsing: Break down structured text data

# Core Concepts
## Literals
A literal is a character that match itself and has no special meaning in regular expressions.  
For example in regex `cat`, `c`, `a`, `t` are all literals, it only matches the exact string "cat" in the text.

## Metacharacters
Metacharacters are characters that have special meaning in regular expressions. It represent operations rather than literal characters.  
Here list some basic metacharacters:
|Metacha|Descrip|
|:---:|:---|
|.|Any single character|
|^|Start of string/line|
|$|End of string/line|
|*|Zero or more of previous element|
|+|One or more of previous element|
|?|Zero or one of previous element|
|[]|Character class|
|()|Grouping|
|\||Alternation(OR)|
|{m, n}|Quantifier specifying counts|
(Exact avability depends on BRE/ERE, see Section3)
* * *

# BRE v.s. ERE (POSIX Standards)
POSIX defines two regex syntaxes:
+  BRE(Basic Regular Expression): default for `grep`, `sed`, `ed`.
+  ERE(Extended Regular Expression): used by `grep -E`, `egrep`, `awk`.
## Syntax Diffenences
|BRE|ERE|Descrip|
|:---:|:---:|:---|
|`\(...\)`|`(...)`|Grouping|
|``` ` ```|`\`||Alternation|
|Must be escaped|Native|+ and ?|
|Must be escaped|Native|{m, n}|

# Matching Techniques
## Any Character(.)
Dot(period) `.` is used to match any character.  
Example:  
```
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
+ `.zip` will match all the elements containing `xzip`.
+  Note that `zip` is not matched.
* * *
## Anchors(^ and $)
Caret `^` and dollar sign `$` are treated as anchors, they cause the match to occur only if the regular expression is found at the beginning of the line(`^`) or at the end of the line(`$`).  
Example:  
```
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
+ `^zip` will match all the lines begin with `zip`.
+ `zip$` will match all the lines end with `zip`.
+ `^zip$` will match exact `zip`.
* * *
## Bracket Expression([])
Match a single character from a specified set of character
### Basic Form
Example:
```
$ ls /usr/bin | grep -h '[bg]zip'
bzip2
bzip2recover
gzip
libdeflate-gzip
```
+ `[bg]zip` will match `bzip` and `gzip`.  

### Negation
```
$ ls /usr/bin | grep -h '[^bg]zip'
bsdunzip
bunzip2
gunzip
hunzip
hzip
libdeflate-gunzip
```
If the first character in a bracket expression is a caret(`^`), the remaining characters are taken to be a set of characters that must not be present at the given character position.  
+ `[^bg]zip` will match all the elements exclude `bzip` or `gzip`.
+  Note that `zip` is not matched.  

### Character Range
`[ABCDEFGHIJKLMNOPQRSTUVWXYZ]` can be replaced by `[A-Z]`

Example:
```
$ ls /usr/bin | grep -h '^[A-F]'
CreateDOMDocument
DOMCount
DOMPrint
DroidSans.ttf
EnumVal
FileCheck
```
+ `^[A-F]` matches all lines starting with `A-F`.
Similarily, 
+ `^[A-Za-z]` will match elements begin with 52 letters.
+ `^[A-Za-z0-9]` will match all the elements begin with letters and numbers.
+ Note that regex `[-AZ]` will match a dash or an uppercase A or an uppercase Z.
* * *

# Quantifiers
Quantifiers specify how many times the preceding element may occur (ERE syntax shown):
|Pattern|Descrip|
|:---:|:---|
|?|Zero or one|
|*|Zero or more|
|+|One or more|
|{m}|Exactly m times|
|{m,}|At least m times|
|{m, n}|Between m and n times|
+ `[0-9]+` matches one or more digits.
+ `[A-Za-z]{3,5}` matches 3~5 letters.


# Grouping and Alternation
## Grouping
Parentheses `()` in regex serve two major purposes:
### Grouping for Structure
They let you apply operations to multiple characters as a unit.
+ `(ha)+` matches ha, haha, hahaha, ...
+ `ha+` matches hs, haa, haaa, ...
## Alternation with Groups
The regex `AAA|BBB`, which means match either the string "AAA" or the string "BBB"

To combine alternation with other regular expression elements, we can use ```()``` to separate the alternation
```
^(bz|gz|zip)
```
+ This will match the stings that start with either bz, gz, or zip

```
^bz|gz|zip
```
+ This will match the stings that start with bz or contains gz or contains zip
# Practical Examples
> Email (simplified)  
> `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`  
> user@example.com  
> a_b-c@sub.domain.org

> Phone Number  
> `^1[3-9][0-9]{9}$`  
> 13912345678  
> 18412345678

> Timestamp  
> `[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}`  
> 2025-01-01 10:09:59  
> 1999-12-31 23:59:59

# Reference
[1] Wikipedia, "Regular expression," [Online]. Available: https://en.wikipedia.org/wiki/Regular_expression. [Accessed: Jan. 19, 2026].  
[2] W. E. Shotts, Jr., *The Linux Command Line: A Complete Introduction*, 2nd ed. San Francisco, CA, USA: No Starch Press, 2019. 

