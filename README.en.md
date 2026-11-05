<p align="center">
  <a href="README.md" lang="zh-CN">简体中文</a> · <strong>English</strong>
</p>

<a href="https://cancertin.github.io/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/readme-hero-light.svg">
    <img src=".github/assets/readme-hero-light.svg" alt="jacquard: Bioinformatics × AI4S. Tools, methods & notes." width="1200">
  </picture>
</a>

<h1 align="center">jacquard’s personal site</h1>

<p align="center">Tools, methods, and notes at the intersection of bioinformatics and AI for Science.</p>

<p align="center">
  <a href="https://github.com/CancerTiN/CancerTiN.github.io/actions/workflows/deploy.yml"><img src="https://github.com/CancerTiN/CancerTiN.github.io/actions/workflows/deploy.yml/badge.svg?branch=main" alt="Check and deploy workflow status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code-MIT-25407a?style=flat-square" alt="Code license: MIT"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/Content-CC_BY_4.0-3f5385?style=flat-square" alt="Writing and image license: CC BY 4.0"></a>
</p>

<p align="center">
  <a href="https://cancertin.github.io/">Visit the site ↗</a> ·
  <a href="https://cancertin.github.io/posts/">Read the posts</a> ·
  <a href="https://cancertin.github.io/rss.xml">Subscribe via RSS</a> ·
  <a href="https://cancertin.github.io/about/">About me</a>
</p>

---

## About the site

I’m jacquard. I evaluate language models on biomedical tasks and build Agent skills and small tools. This site brings together the work I can share publicly, covering bioinformatics, AI evaluation, and Agent workflows. The site’s posts are written in Chinese.

Built with **Astro 7** and hosted on **GitHub Pages**. The indigo wordmark is drawn in SVG: warp and weft weave the name into a fabric label, setting the visual identity for the site.

| Reading experience | How it works |
| --- | --- |
| **Lightweight pages** | Markdown posts built into static HTML |
| **Search at a keystroke** | Pagefind runs full-text search in your browser; open it with `⌘K` or `Ctrl K` |
| **Comfortable reading** | System-aware light and dark themes with syntax highlighting |
| **Subscribe and discover** | Full-content RSS, sitemap, and Open Graph metadata |
| **Checked before publishing** | GitHub Actions checks the site before deploying to GitHub Pages |

## Run locally

Use **Node.js 24** to match [.nvmrc](.nvmrc) and CI. The minimum supported version is **22.23.4**, as specified in [package.json](package.json).

```sh
git clone https://github.com/CancerTiN/CancerTiN.github.io.git
cd CancerTiN.github.io
npm install
npm run dev
```

Open [localhost:4321](http://localhost:4321). `npm install` also enables the repository’s Git hooks.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate `dist/` and build the Pagefind search index |
| `npm run preview` | Preview the built site |
| `npm run check` | Build the site and run all pre-publish checks |

> **Try search**: run `npm run build`, then `npm run preview`. The search index is generated during the build and is absent in development mode.

The full local checks also validate a GitHub noreply commit identity and a local sensitive-term list. See [Checks in AGENTS.md](AGENTS.md#检查) for setup and scope. The repository’s writing and publishing guide is in Chinese.

## Where to edit

| Task | Location |
| --- | --- |
| Update the intro, current work, and projects | [src/data/site.ts](src/data/site.ts) |
| Write posts and add images | [src/content/posts/](src/content/posts/) |
| Change pages and components | [src/pages/](src/pages/) · [src/components/](src/components/) |
| Adjust colors and typography | [src/styles/global.css](src/styles/global.css) |
| Modify the woven wordmark | [src/lib/weave.ts](src/lib/weave.ts) |
| Change post metadata rules | [src/content.config.ts](src/content.config.ts) |
| Review pre-publish checks | [scripts/check.mjs](scripts/check.mjs) |
| Review automatic deployment | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |

### Write a post

Create `src/content/posts/<slug>.md`. Use lowercase English letters, digits, and hyphens in the filename; it becomes the post’s permanent URL. A minimal example:

```yaml
---
title: A new note
description: Methods, discoveries, and reflections from a hands-on experiment.
pubDate: 2026-11-05
tags: [Notes]
---
```

Put images in `src/content/posts/<slug>/` and reference them with `![Image description](./<slug>/image.png)`. See [AGENTS.md](AGENTS.md) for writing conventions, drafts, previews, and publishing.

## Feedback

Found a page issue or want to discuss a post? [Open an issue](https://github.com/CancerTiN/CancerTiN.github.io/issues). Maintained by [jacquard (@CancerTiN)](https://github.com/CancerTiN).

## Licenses and credits

- **Code, styles, and scripts**: [MIT](LICENSE).
- **Posts and images** in `src/content/`: [CC BY 4.0](LICENSE-CONTENT.md). When sharing or adapting them, credit jacquard, link to the original and the license, and indicate whether you made changes.
- **IBM Plex Mono**: © IBM Corp., released under the SIL Open Font License 1.1 and packaged by [Fontsource](https://fontsource.org/fonts/ibm-plex-mono).

<p align="center"><a href="README.md" lang="zh-CN">切换到简体中文 →</a></p>
