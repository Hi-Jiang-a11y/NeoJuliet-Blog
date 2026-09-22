# Project structure

This repository is an Astro blog. Keep files in the directory that owns their
responsibility so content, UI, styling, and published assets do not get mixed.

```text
src/
├── content/       Markdown collections: blog, announcements, friend links, about
├── pages/         Route definitions (the URL structure)
├── layouts/       Page-level shells
├── components/    Reusable Astro/React UI; sidebar modules live in components/sidebar
├── styles/        Component and page CSS
├── scripts/       Browser-side scripts bundled by Astro
├── icons/         Reusable inline SVG components
└── consts.ts      Site-wide constants
public/
├── images/        Images and document attachments used by posts
├── assets/        Standalone diagrams/interactive HTML published at stable URLs
├── fonts/         Fonts served directly by the site
└── scripts/       Legacy scripts loaded from public URLs
```

## Content and assets

Posts belong under `src/content/blog` (Chinese translations under its `zh`
subdirectory). If a post needs a binary attachment, put it in `public/images`
or `public/assets` and reference it with an absolute `/images/...` or
`/assets/...` URL. Do not put build output, `.astro` generated files, or
`node_modules` in the repository.

## Common commands

```sh
npm run dev       # local development
npm run build     # production build (also catches broken content references)
npm run preview   # preview the production build
npm run astro     # Astro CLI
```
