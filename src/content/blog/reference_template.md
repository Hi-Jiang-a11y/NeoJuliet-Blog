---
title: 'Reference List in Your Blog'
author: 'Juliet'
description: 'How to write reference part in blogs'
pubDate: 'Nov 11 2025'
tags: ["blog", "hugo", "markdown"]
pinned: false
---
## **The Basic Method**

Code:  
```
## References1

1. Thomas S. Kuhn, *The Structure of Scientific Revolutions*, University of Chicago Press, 1962.  
2. Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.
3. Web source: [Stanford Encyclopedia of Philosophy – Scientific Revolution](https://plato.stanford.edu/entries/scientific-revolution/)
```

> Preview:  
>
> ## References
>
> 1. Thomas S. Kuhn, *The Structure of Scientific Revolutions*, University of Chicago Press, 1962.  
> 2. Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.
> 3. Web source: [Stanford Encyclopedia of Philosophy – Scientific Revolution](https://plato.stanford.edu/entries/scientific-revolution/)


## **Reference Annotation Syntax**

Code:
```
According to Merton's analysis[^1], the Puritan ethic played a key role...

[^1]: Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.

```

> Preview:  
>
> According to Merton's analysis[^1], the Puritan ethic played a key role...
>
> [^1]: Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.


## If you are using Hugo

Code:  
```
The Puritan view of labor as a moral duty strongly influenced the rise of experimental science[^merton].

[^merton]: Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.

```

> Preview:  
>
> The Puritan view of labor as a moral duty strongly influenced the rise of experimental science[^merton].

> [^merton]: Merton, R.K. “Puritanism, Pietism and Science.” *Sociological Review*, 1936.


---

© 2025 Your Name. This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

![CC BY](https://licensebuttons.net/l/by/4.0/88x31.png)
