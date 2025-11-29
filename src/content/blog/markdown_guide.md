---
title: 'Markdown Turorial'
author: 'Juliet'
description: 'A Simple Guidance of Writing Markdown'
pubDate: 'Nov 07 2025'
tags: ["blog", "turorial", "markdown"]
pinned: false
---

> This article is reposted from [“Markdown Tutorial”](https://github.com/emn178/markdown) by *emn178*   
Edited for style and clarity on this site.  
**Read the full article** [https://github.com/emn178/markdown](https://github.com/emn178/markdown)  
*Disclaimer: This post shares excerpts under fair use for commentary and education.*

# Block Elements
## Paragraphs and Line Breaks

+ ###  Paragraphs

One or more blank lines. (A blank line is a line containing nothing but spaces or tabs is considered blank.)  

```
This will be
inline.

This is second paragraph.
```

***Preview:***  
* * *
This will be inline.

This is second paragraph.  
* * *



+ ### Line Breaks
End a line with **two or more spaces**  

```
This will be not  
inline.
```

***Preview:***  
* * *
This will be not  
inline.
* * *



## Headers
Markdown supports two styles of headers, Setext and atx.  

+ ### Setext
"Underlined" using **equal signs(=)** and **dashes(-)** in any nunmber.   

```
This is an H1
=============
This is an H2
-------------
```



+ ### Atx
Uses 1-6 **hash character(#)** at the start of the line.  

```
# This is an H1
## This is an H2
###### This is an H6
```

Optionally, you may “close” atx-style headers. The closing hashes **don’t need to match** the number of hashes used to open the header.  

```
# This is an H1 #
## This is an H2 ##
### This is an H3 ######
```



## Blockquotes
Markdown uses email-style > characters for blockquoting. It looks best if you hard wrap the text and put a > before every line.  

```
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.
```

***Preview:***  
* * *
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.
* * *

Markdown allows you to be lazy and only put the > before the first line of a hard-wrapped paragraph.  

```
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.
```

***Preview:***  
* * *
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.
* * *

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by adding additional levels of >.  

```
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
```

***Preview:***  
* * *
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
* * *

Blockquotes can contain other Markdown elements, including headers, lists, and code blocks.  

```
> ## This is a header.
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");
```

***Preview:***  
* * *
> ## This is a header.
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");
* * *



## Lists
Markdown supports ordered (numbered) and unordered (bulleted) lists.  

+ ### Unordered
Unordered lists use **asterisks(*)**, **pluses(+)**, and **hyphens(-)**.

```
*   Red
*   Green
*   Blue
```

***Preview:***  
* * *
*   Red
*   Green
*   Blue
* * *

is equivalent to:  

```
+   Red
+   Green
+   Blue
```
and:

```
-   Red
-   Green
-   Blue
```

+ ### Ordered

Ordered lists use numbers followed by periods:  

```
1.  Bird
2.  McHale
3.  Parish
```

***Preview:***  
* * *
1.  Bird
2.  McHale
3.  Parish
* * *

It’s possible to trigger an ordered list by accident, by writing something like this:     

```
1986. What a great season.
```

***Preview:***  
* * *
1986. What a great season.
* * *

You can **backslash-escape (\)** the period:  

```
1986\. What a great season.
```

***Preview:***  
* * *
1986\. What a great season.
* * *



+ ### Indented
> #### Blockquote

To put a blockquote within a list item, the blockquote’s > delimiters need to be indented:  

```
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
```

***Preview:***  
- - -
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
- - -



> #### Code Block
To put a code block within a list item, the code block needs to be indented twice — **8 spaces or two tabs**:  

```
*   A list item with a code block:

        <code goes here>
```

***Preview:***  
- - -
*   A list item with a code block:

        <code goes here>
- - -



> #### Nested List

```
* A
  * A1
  * A2
* B
* C
```

***Preview:***  
- - -
* A
  * A1
  * A2
* B
* C
- - -



## Code Blocks
Indent every line of the block by at least **4 spaces** or **1 tab**.

```
This is a normal paragraph:

    This is a code block.
```

***Preview:***  
* * *
This is a normal paragraph:

    This is a code block.
* * *

A code block continues until it reaches a line that is not indented (or the end of the article).  

Within a code block, **ampersands(&)** and angle **brackets(< and >)** are automatically converted into HTML entities.  

```
    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>
```

***Preview:***  
* * *
    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>
* * *

Following sections Fenced Code Blocks and Syntax Highlighting are extensions, you can use the other way to write the code block.  



+ ### Fenced Code Blocks
Just wrap your code in ```` ``` ```` (as shown below) and you won’t need to indent it by four spaces.  

````
Here's an example:

```
function test() {
  console.log("notice the blank line before this function?");
}
```
````

***Preview:***  
* * *
Here's an example:
```
function test() {
  console.log("notice the blank line before this function?");
}
```
* * *



+ ### Syntax Highlighting
In your fenced block, add an optional language identifier and we’ll run it through syntax highlighting [Support Languages](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).  

````
```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```
````



## Horizontal Rules
Places three or more **hyphens(-)**, **asterisks(*)**, or **underscores(_)** on a line by themselves. You may use spaces between the hyphens or asterisks.  

```
* * *
***
*****
- - -
---------------------------------------
___
```

***Preview:***  
* * *
* * *
***
*****
- - -
---------------------------------------
___
* * *



## Table
It’s an extension.  

Separates column by **pipe(|)** and header by **dashes(-)**, and uses **colon(:)** for alignment.  

The outer **pipes(|)** and alignment are optional. There are **3 delimiters** each cell at least for separating header.  

```
| Left | Center | Right |
|:-----|:------:|------:|
|aaa   |bbb     |ccc    |
|ddd   |eee     |fff    |

 A | B
---|---
123|456


A |B
--|--
12|45
```

***Preview:***  
* * *
| Left | Center | Right |
|:-----|:------:|------:|
|aaa   |bbb     |ccc    |
|ddd   |eee     |fff    |

 A | B
---|---
123|456


A |B
--|--
12|45
* * *



# Span Elements

## Links
Markdown supports two style of links: inline and reference.  

+ ### Inline
Inline link format like this: `[Link Text](URL "Title")`  

Title is optional.  

```
This is [an example](http://example.com/ "Title") inline link.

[This link](http://example.net/) has no title attribute.
```

***Preview:***  
* * *
This is [an example](http://example.com/ "Title") inline link.

[This link](http://example.net/) has no title attribute.
* * *

If you’re referring to a local resource on the same server, you can use relative paths:  

```
See my [About](/about/) page for details.
```

***Preview:***  
* * *
See my [About](/about/) page for details.
* * *



+ ### Reference
You could predefine link references. Format like this: `[id]: URL "Title"`  

Title is also optional. And the you refer the link, format like this: `[Link Text][id]`  

```
[id]: http://example.com/  "Optional Title Here"
This is [an example][id] reference-style link.
```

***Preview:***  
* * *
[id]: http://example.com/  "Optional Title Here"
This is [an example][id] reference-style link.
* * *

That is:  

+ Square brackets containing the link identifier (**not case sensitive**, optionally indented from the left margin using up to three spaces);
+ followed by a colon;
+ followed by one or more spaces (or tabs);
+ followed by the URL for the link;
+ The link URL may, optionally, be surrounded by angle brackets.
+ optionally followed by a title attribute for the link, enclosed in double or single quotes, or enclosed in parentheses.

The following three link definitions are equivalent:  

```
[foo]: http://example.com/  "Optional Title Here"
[foo]: http://example.com/  'Optional Title Here'
[foo]: http://example.com/  (Optional Title Here)
[foo]: <http://example.com/>  "Optional Title Here"
```

Uses an empty set of square brackets, the link text itself is used as the name.

```
[Google]: http://google.com/
[Google][]
```

***Preview:***  
* * *
[Google]: http://google.com/
* * *



## Emphasis
Markdown treats **asterisks(*)** and **underscores(_)** as indicators of emphasis.  

```
*single asterisks*

_single underscores_

**double asterisks**

__double underscores__
```

***Preview:***  
* * *
*single asterisks*

_single underscores_

**double asterisks**

__double underscores__
* * *

But if you surround an * or _ with spaces, it’ll be treated as a literal asterisk or underscore.  

You can backslash escape it:  

```
\*this text is surrounded by literal asterisks\*
```

***Preview:***  
* * *
\*this text is surrounded by literal asterisks\*
* * *



## Code
Wraps it with backtick **quotes(`)**.  

```
Use the `printf()` function.
```

***Preview:***  
* * *
Use the `printf()` function.
* * *

The backtick delimiters surrounding a code span may include spaces — one after the opening, one before the closing. This allows you to place literal backtick characters at the beginning or end of a code span:  

```
A single backtick in a code span: `` ` ``

A backtick-delimited string in a code span: `` `foo` ``
```

***Preview:***  
* * *
A single backtick in a code span: `` ` ``

A backtick-delimited string in a code span: `` `foo` ``
* * *



## Images
Markdown uses an image syntax that is intended to resemble the syntax for links, allowing for two styles: inline and reference.  

+ ### Inline
Inline image syntax looks like this: `![Alt text](URL "Title")`  

Title is optional.  

```
![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")
```

***Preview:***  
* * *
![screenshoot of this blog](/pictures/Screenshot_20251113_235023.png)
* * *

That is :  

+ An exclamation mark: !;
+ followed by a set of square brackets, containing the alt attribute text for the image;
+ followed by a set of parentheses, containing the URL or path to the image, and an optional title attribute enclosed in double or single quotes.

+ ### Reference
Reference-style image syntax looks like this: `![Alt text][id]`  

```
[img id]: https://s2.loli.net/2024/08/20/5fszgXeOxmL3Wdv.webp  "Optional title attribute"
![Alt text][img id]
```

***Preview:***  
* * *
[img id]: https://s2.loli.net/2024/08/20/5fszgXeOxmL3Wdv.webp  "Optional title attribute"
![Alt text][img id]
* * *



## Strikethrough
It’s an extension.  

GFM adds syntax to strikethrough text.  

***Code:***  
```
~~Mistaken text.~~
```

***Preview:***  
* * *
~~Mistaken text.~~
* * *



# Miscellaneous

## Automatic Links
Markdown supports a shortcut style for creating “automatic” links for URLs and email addresses: simply surround the URL or email address with angle brackets.  

***Code:***  
```
<http://example.com/>

<address@example.com>
```

***Preview:***  
* * *
<http://example.com/>

<address@example.com>
* * *

GFM will autolink standard URLs.  

***Code:***  
```
https://github.com/emn178/markdown
```

***Preview:***  
* * *
https://github.com/emn178/markdown
* * *



## Backslash Escapes
Markdown allows you to use backslash escapes to generate literal characters which would otherwise have special meaning in Markdown’s formatting syntax.  

***Code:***  
```
\*literal asterisks\*
```

***Preview:***  
* * *
\*literal asterisks\*
* * *

Markdown provides backslash escapes for the following characters:  

***Code:***  
```
\   backslash
`   backtick
*   asterisk
_   underscore
{}  curly braces
[]  square brackets
()  parentheses
#   hash mark
+   plus sign
-   minus sign (hyphen)
.   dot
!   exclamation mark
```



# Inline HTML
For any markup that is not covered by Markdown’s syntax, you simply use HTML itself. There’s no need to preface it or delimit it to indicate that you’re switching from Markdown to HTML; you just use the tags.  

***Code:***  
```
This is a regular paragraph.

<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>

This is another regular paragraph.
```

***Preview:***  
* * *
This is a regular paragraph.

<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>

This is another regular paragraph.
* * *

