---
title: 'Experience on Writing Blogs Using Hugo and Nginx'
author: 'Juliet'
description: 'Create your own blog with hugo&nginx'
pubDate: 'Oct 18 2025'
tags: ["blog", "hugo", "tutorial"]
license: "CC BY-SA 4.0"
---
By ***Juliet***, last edited on Oct.18th

This blog will introduce a simple and common way to construct your own static blogs using [hugo](https://en.wikipedia.org/wiki/Hugo) and [nginx](https://en.wikipedia.org/wiki/Nginx)

## **Preparation**

First you need to install hugo and nginx, as well as git. This depends on your distribution or package manager.
If you are using pacman as your package manager, you can run this:
```bash
sudo pacman -Syu hugo nginx git
```
Use ```hugo``` and ```nginx -version``` to verify installation

## **Start Hugo**

After all above, you can start your first blog
choose a directory you like such as ```~/myblog``` as your hugo root directory
```bash
hugo new site ~/myblog
cd ~/myblog
git init
```

The structure of root directory should be like:
```bash
./myblog
├── archetypes
├── assets
├── content    #markdown blogs
├── data
├── hugo.toml    #Global config file
├── i18n
├── layouts    #template files
├── public    #your html files is here
├── static    #figures/CSS/JS
└── themes    #theme directory
```

And it is **important** to change the ```baseURL``` in ```hugo.toml```, replace ```baseURL = 'example.com'``` by ```baseURL = '<your ip addr/your domain>'```, such as ```baseURL = 'http://10.16.181.132'```

## **Theme**

Then you can choose a theme from github or somewherelse
```git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod```
Add this line into your ```hugo.toml``` file:
```theme = "PaperMod"```

## **Creat Your First Blog**
```hugo new posts/first-post.md```
Note that this will create a new directory ```posts``` in ```~/myblog``` and your first blog(in md form) will be in ~/myblog/posts
The file must end with .md or you will get a error information
Usually the file is like this:
```text
+++
title = 'First Post'
date = '2025-10-18T12:00:00+08:00'
draft = true
+++
```
If you must change ```draft = true``` to ```draft = false``` otherwise your blog won't be change to html file by hugo
Then you can write your blog:
```text
+++
title = 'First Post'
date = '2025-10-18T12:00:00+08:00'
draft = false
+++

Hello this the first blog!

...
```

## **Preview**

After finishing your first blog, not rush to post it, you can preview your blog through 
```hugo server```
Before running this command, make sure that your working directory is at your hugo root directory ```~/myblog``` or you will get the fucking annoying error message
You can visit ```localhost:1313(127.0.0.1:1313)``` to preview
If you are satisfied with your work, press Ctl+C to stop the preview

## **Transform**

change your working directory to your hugo root directory and run
```hugo```
This will create the static files
The files are in ```~/myblog/public```

## **Start Nginx Configuration**

So the hugo part is finished, you can pay all of your attention on nginx now

The configuration file of nginx ```nginx.conf``` is at ```/etc/nginx/```
It usually looks like this:
```nginx.conf

...

http {
    
    ...
    
    server {
        
        ...
        
        }

    ...
    
    }
    
...
    
```
Of course you can write your configure content in this file directly, but in order to keep organized and easy to maintain, it is recommended to write in this way:
```nginx.conf

...

http {
    
    include conf.d/*.conf;
    
    #default or other configuration
    server {
        
        ...
        
        }

    ...
    
    }
    
...
```
This requires you to create a new directory called ```conf.d```in the same directory as the ```nginx.conf```

Then you can write the configure file end with ```.conf``` in ```conf.d```, for example, it is named ```blog.conf```, and if you have other task which need nginx support ,you can also try the same way

The configuration file should be for example:
```blog.conf
server {
    listen 1145;
    server_name localhost;

    root /srv/http/blog;
    index index.html;

    access_log /var/log/nginx/blog_access.log;
    error_log /var/log/nginx/blog_error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}

```
Here port 1145 is chosen and the nginx root directory is set to be ```/srv/http/blog```, which means that you need to move all your files into this directory
Then you need to check if there is any syntax error, just run
```bash
sudo nginx -t
```

## **Depoly to Nginx**

Then you need to depoly your blog to ```/srv/http/blog``` it is easy
```bash
sudo rm -rf /srv/http/blog
sudo cp ~/myblog/public/* /srv/http/blog
```

All above can be replaced by
```bash
cd ~/myblog
sudo hugo -d /srv/http/blog
```
If you are tired of executing these long lists of commands, a script is recommended


Then you can start nginx
```bash
sudo systemctl enable nginx.service
sudo systemctl start nginx.service
```

Then your blog is online!

## **Follow-Up Will be Updated**
