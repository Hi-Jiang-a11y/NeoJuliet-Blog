# 一个简单的Astro主题

## 特点🤔
* [x] 100/100 Lighthouse performance
* [x] SEO-friendly with canonical URLs and OpenGraph data
* [x] Sitemap 支持
* [x] RSS 支持
* [x] 支持 md&mdx 格式
* [x] ~~优雅~~😋的网页设计
* [x] 置顶功能
## 组件💡
+ Blog-cards 主页文章卡片（可自定义排序）
+ Tags 文章标签
+ Archive 归档（按月排序）
+ Announcement 通知栏（支持置顶）
+ Calendar(正在开发)
+ Auto-generated table of contents（自动生成文章目录）
## 为什么要写这个主题❓
希腊奶😋 
...
## 为什么主题色是骚粉
我喜欢😋
## 安装这个主题⬇️
```bash
npm create astro@latest -- --template Hi-Jiang-a11y/NeoJuliet-Blog
  #或者👇
git clone https://github.com/Hi-Jiang-a11y/NeoJuliet-Blog.git
  #change the working directory
cd NeoJuliet-Blog
  #安装所需要的 npm 包
npm install
```
## 目录结构🔽

更详细的维护说明见 [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)。
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
## 常用指令🚀
|command|action|
|:---:|:---:|
|`npm run dev`|本地启动开发服务器|
|`npm run preview`|本地预览|
|`npm run build`|构建到 ./dist|
|`npm run astro ...`|运行 CLI指令，比如 `astro add`, `astro check`|
