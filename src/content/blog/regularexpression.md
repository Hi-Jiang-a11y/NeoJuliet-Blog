---
title: 'Simple Introduction to Regular Expressions'
author: 'Juliet'
description: 'Learning regular expressions'
pubDate: 'Oct 19 2025'
tags: ["linux", "turorial"]
pinned: true
---
## Introduction to Regex
### What are Regular Expressions
Regular expressions (regex) are patterns used to match character combinations in strings. They form a small, specialized programming language embedded inside standard programming languages and tools.
+ 1956: Stephen Kleene develops mathematical foundation.
+ 1968: Ken Thompson implements in QED text editor.
+ 1970s: Becomes standard in Unix tools (ed, grep, sed).
+ 1990s: POSIX standardization (BRE/ERE).

### Why Regex
+ Text Search: Find specific patterns in documents
+ Validation: Check input format (emails, phone numbers)
+ Extraction: Pull specific data from text
+ Replacement: Modify text patterns systematically
+ Parsing: Break down structured text data

### Literal
A literal is a character that match itself and has no special meaning in regular expressions.  
For example in regex `cat`, `c`, `a`, `t` are all literals, it only matches the exact string "cat" in the text.

### Metacharacter
Metacharacters are characters that have special meaning in regular expressions. They are not matched literally, but represent a matching rule or operation.  
Here list some basic metacharacters:
|Metacha|Descrip|
|:---:|:---|
|.|Any single character|
|^|Start of string/line|
|$|End of string/line|
|*|Zero or more of previous|
|+|One or more of previous|
|?|Zero or one of previous|
|[]|Character class|
|()|Grouping|
|\||Alternation(OR)|
* * *
### The Any Character(.)
Dot(period) `.` is used to match any character.  
Example:  
```
jyc@Archjyc:~]$ls /usr/bin | grep '.zip'
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
Regex `.zip` will match all the elements containing `xzip`. Note that `zip` is not matched.
* * *
### Anchors
Caret `^` and dollar sign `$` are treated as anchors, they cause the match to occur only if the regular expression is found at the beginning of the line(`^`) or at the end of the line(`$`).  
Example:  
```
jyc@Archjyc:~]$ls /usr/bin | grep -h '^zip'
zip
zipcmp
zipmerge
ziptool
jyc@Archjyc:~]$ls /usr/bin | grep 'zip$'
bsdunzip
gunzip
gzip
hunzip
hzip
libdeflate-gunzip
libdeflate-gzip
zip
jyc@Archjyc:~]$ls /usr/bin | grep -h '^zip$'    
zip
```
Regex `^zip` will match all the lines begin with `zip`, regex `zip$` will match all the lines end with `zip`, regex `^zip$` will match exact `zip`.
* * *
### Bracket Expression
Match a single character from a specified set of character
Example:
```
jyc@Archjyc:~]$ls /usr/bin | grep -h '[bg]zip'
bzip2
bzip2recover
gzip
libdeflate-gzip
```
Regex `[bg]zip` will match `bzip` and `gzip`.  

#### Negation
```
jyc@Archjyc:~]$ls /usr/bin | grep -h '[^bg]zip'
bsdunzip
bunzip2
gunzip
hunzip
hzip
libdeflate-gunzip
```
If the first character in a bracket expression is a caret(`^`), the remaining characters are taken to be a set of characters that must not be present at the given character position.  
Regex `[^bg]zip` will match all the elements exclude `bzip` or `gzip`. Note that `zip` is not matched.  

#### Traditional Character Range
`[ABCDEFGHIJKLMNOPQRSTUVWXYZ]` can be replaced by `[A-Z]`

Example:
```
jyc@Archjyc:~]$ls /usr/bin | grep -h '^[A-F]'
CreateDOMDocument
DOMCount
DOMPrint
DroidSans.ttf
EnumVal
FileCheck
```
Regex `^[A-F]` matches all lines starting with `A-F`.
Similarily, regex `^[A-Za-z]` will match elements begin with 52 letters, regex `^[A-Za-z0-9]` will match all the elements begin with letters and numbers.  
Note that regex `[-AZ]` will match a dash or an uppercase A or an uppercase Z.  
* * *
### Alternation
The regular expression ```AAA|BBB```, which means match either the string "AAA" or the string "BBB"

To combine alternation with other regular expression elements, we can use ```()``` to separate the alternation
```
^(bz|gz|zip)
```
This will match the stings that start with either bz, gz, or zip

```
^bz|gz|zip
```
This will match the stings that start with bz or contains gz or contains zip

### Quantifiers
#### Match an Element Zero or One Time(?)
#### Match an Element Zero or More Times(*)
#### Match an Element One or More Times(+)
#### Match an Element a Specific Number of Times({})
