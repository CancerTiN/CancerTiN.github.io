<p align="center">
  <strong>简体中文</strong> · <a href="README.en.md" lang="en">English</a>
</p>

<a href="https://cancertin.github.io/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/readme-hero-light.svg">
    <img src=".github/assets/readme-hero-light.svg" alt="jacquard：Bioinformatics × AI4S，工具、方法和笔记" width="1200">
  </picture>
</a>

<h1 align="center">jacquard 的个人站</h1>

<p align="center">在生物信息学与 AI for Science 的交叉处，记录工具、方法和笔记。</p>

<p align="center">
  <a href="https://github.com/CancerTiN/CancerTiN.github.io/actions/workflows/deploy.yml"><img src="https://github.com/CancerTiN/CancerTiN.github.io/actions/workflows/deploy.yml/badge.svg?branch=main" alt="检查并发布的工作流状态"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code-MIT-25407a?style=flat-square" alt="代码许可：MIT"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/Content-CC_BY_4.0-3f5385?style=flat-square" alt="文章与配图许可：CC BY 4.0"></a>
</p>

<p align="center">
  <a href="https://cancertin.github.io/">访问网站 ↗</a> ·
  <a href="https://cancertin.github.io/posts/">阅读文章</a> ·
  <a href="https://cancertin.github.io/rss.xml">订阅 RSS</a> ·
  <a href="https://cancertin.github.io/about/">关于我</a>
</p>

---

## 关于这个站

我是 jacquard，关注大模型在生物医学任务上的表现，也写 Agent skill 和小工具。这个站把能公开的实践整理成文章，主题包括生物信息学、AI 评估和 Agent 工作流。

网站由 **Astro 7** 构建，部署在 **GitHub Pages**。靛蓝色的提花布标由 SVG 绘制：经纬线织成名字，也串起这个站的视觉风格。

| 阅读体验 | 实现方式 |
| --- | --- |
| **轻量静态页面** | Markdown 写作，构建为静态 HTML |
| **随手搜索** | Pagefind 浏览器端全文检索，按 `⌘K` 或 `Ctrl K` 打开 |
| **舒适阅读** | 跟随系统的明暗主题，以及代码语法高亮 |
| **订阅与发现** | 全文 RSS、sitemap 和 Open Graph 元信息 |
| **检查后发布** | GitHub Actions 检查通过，再部署到 GitHub Pages |

## 本地运行

推荐使用 **Node.js 24**，与 [.nvmrc](.nvmrc) 和 CI 保持一致；最低版本为 **22.23.4**，见 [package.json](package.json)。

```sh
git clone https://github.com/CancerTiN/CancerTiN.github.io.git
cd CancerTiN.github.io
npm install
npm run dev
```

打开 [localhost:4321](http://localhost:4321)。`npm install` 同时会启用仓库自带的 Git hooks。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成 `dist/`，并建立 Pagefind 搜索索引 |
| `npm run preview` | 预览已经构建的站点 |
| `npm run check` | 构建站点，运行全部发布前检查 |

> **体验搜索**：先运行 `npm run build`，再运行 `npm run preview`。开发模式下没有搜索索引。

完整的本机检查还会校验 GitHub noreply 提交身份和本地敏感词清单。配置方式与检查范围见 [AGENTS.md 的「检查」](AGENTS.md#检查)。

## 从哪里修改

| 想做什么 | 对应位置 |
| --- | --- |
| 修改简介、近况和项目 | [src/data/site.ts](src/data/site.ts) |
| 写文章、放配图 | [src/content/posts/](src/content/posts/) |
| 调整页面和组件 | [src/pages/](src/pages/) · [src/components/](src/components/) |
| 调整配色和排版 | [src/styles/global.css](src/styles/global.css) |
| 修改提花布标 | [src/lib/weave.ts](src/lib/weave.ts) |
| 调整文章字段规则 | [src/content.config.ts](src/content.config.ts) |
| 查看发布前检查 | [scripts/check.mjs](scripts/check.mjs) |
| 查看自动发布流程 | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |

### 写一篇文章

文章放在 `src/content/posts/<slug>.md`，文件名使用小写英文、数字和连字符，作为文章的永久网址。最小示例：

```yaml
---
title: 一篇新的笔记
description: 记录一次实践中的方法、发现和思考，方便日后回看。
pubDate: 2026-11-05
tags: [笔记]
---
```

配图放在 `src/content/posts/<slug>/`，在文章中用 `![说明文字](./<slug>/image.png)` 引用。写作规范、草稿约定、预览和发布流程见 [AGENTS.md](AGENTS.md)。

## 反馈

发现页面问题，或想讨论某篇文章，欢迎 [开一个 issue](https://github.com/CancerTiN/CancerTiN.github.io/issues)。本站由 [jacquard（@CancerTiN）](https://github.com/CancerTiN) 维护。

## 许可与致谢

- **代码、样式和脚本**：[MIT](LICENSE)。
- **文章与配图**（`src/content/`）：[CC BY 4.0](LICENSE-CONTENT.md)。转载或改编时请署名 jacquard，附原文链接、注明许可，并说明是否修改。
- **IBM Plex Mono**：© IBM Corp.，以 SIL Open Font License 1.1 发布，经 [Fontsource](https://fontsource.org/fonts/ibm-plex-mono) 打包。

<p align="center"><a href="README.en.md" lang="en">Read this README in English →</a></p>
