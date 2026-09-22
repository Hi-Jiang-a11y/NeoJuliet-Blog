[English](README.md) | [中文](README.zh.md)
# A Simple Theme for Astro Blog

## Features
* [x] 100/100 Lighthouse performance
* [x] SEO-friendly with canonical URLs and OpenGraph data
* [x] Sitemap support
* [x] RSS Feed support
* [x] Markdown & MDX support
* [x] Elegant web design
* [x] Pinned support
## Components
+ Blog-cards
+ Tags
+ Archive
+ Announcement
+ Calendar(under maintaing)
+ Auto-generated table of contents
## Why this theme
idk, I wrote it for fun, just want to build my own blog.  
The color of this theme is light pink, of course you can modify it.
...
## Installation
```bash
npm create astro@latest -- --template Hi-Jiang-a11y/NeoJuliet-Blog
  # or you can use👇
git clone https://github.com/Hi-Jiang-a11y/NeoJuliet-Blog.git
  # change the working directory
cd NeoJuliet-Blog
  # install the package need
npm install
```
## Project structure
```
.
├── README.md
├── astro.config.mjs
├── package-lock.json
├── package.json
├── public
│   ├── assets
│   ├── favicon.svg
│   ├── fonts
│   └── scripts
├── src
│   ├── assets
│   ├── components
│   ├── consts.ts
│   ├── content
│   ├── content.config.ts
│   ├── layouts
│   ├── pages
│   ├── scripts
│   └── styles
└── tsconfig.json
```
## Some commands
|command|action|
|:---:|:---:|
|`npm run dev`|Start a local dev server|
|`npm run preview`|Local preview of your site|
|`npm run build`|Build your site to ./dist|
|`npm run astro ...`|Run CLI commands like `astro add`, `astro check`|
