---
title: 'Share of Hugo.toml'
author: 'Juliet'
description: 'Hugo configure file sharing'
pubDate: 'Oct 18 2025'
tags: ["blog", "hugo"]
pinned: false
---
By ***Juliet***
```Code
baseURL = "<your url>"
languageCode = "en-us"
title = "<your title>"
theme = "PaperMod"


#This used for menu
[menu]
    [[menu.main]]
        name = "Home"
        url = "/"
        weight = 1
    [[menu.main]]
        name = "About"
        url = "/about/"
        weight = 2



[params]
    
    defaultTheme = "dark"
    #home page info
    [params.homeInfoParams]
    Title = "Hi there! 👋"
    Content = "Welcome to my blog"

    [[params.socialIcons]]
    name = "github"
    url = "<your github account>"

    [[params.socialIcons]]
    name = "email"
    url = "mailto:username@example.com"

    
    #Share Button on Post
    
    showShareButtons = true
    showShareTwitter = true
    showShareFacebook = true

    #Code Copy Button
    
    showCodeCopyButtons = true

    #show reading time
    showReadingTime  = true

    #enable search
    #enableSearch = true



```
There are some problems that I defined ```showReadingTime showShareButtons ...```, but they don't show as expected.
Idk why
