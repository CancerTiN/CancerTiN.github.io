# AGENTS.md

这是 jacquard 的个人站 https://cancertin.github.io 的源码。在这个仓库里工作的 AI Agent（Claude Code、Codex 等）先读完这份文件。

仓库是公开的，这份文件也是公开的：这里不写任何私密信息。

## 概况

Astro 7 生成的纯静态站，托管在 GitHub Pages。推到 main 后，GitHub Actions 先检查，通过了才发布。没有后端，不花钱。

## 目录

```text
src/content/posts/             文章，一篇一个 .md；文件名就是网址的最后一段
src/content/posts/<文章名>/     这篇文章的配图
src/content.config.ts          文章 frontmatter 的 schema
src/data/site.ts               站点信息，以及首页的简介、在做的事、项目
src/pages/                     页面：首页、文章列表、文章页、关于、404、RSS、网站图标
src/components/                页头、页脚、⌘K 搜索、布标
src/lib/weave.ts               把名字织成布标的 SVG 生成器
src/styles/global.css          全部样式
public/                        原样发布的文件
scripts/check.mjs              发布前检查
.githooks/                     本机 git hook：提交、写提交信息、推送之前跑检查
.github/workflows/deploy.yml   CI：检查，通过后发布到 GitHub Pages
```

仓库之外，只在本机、不进仓库的东西：

```text
~/data/site/drafts/<文章名>.md     草稿
~/data/site/sources/<文章名>/      原始素材
~/data/site/sensitive-terms.txt   敏感词清单
```

## 命令

```sh
npm install       # 装依赖，同时启用 .githooks
npm run dev       # 本地开发；开发模式下没有搜索索引
npm run build     # 构建到 dist/，再用 Pagefind 建搜索索引
npm run preview   # 预览构建结果，搜索可用
npm run check     # 构建，然后跑全部检查
```

## 写作和排版

- 中文句子的标点用全角：，。；：！？、「」『』（）……——。判断看整句的主语言：标点紧挨英文词或代码时，只要整句是中文，也用全角。
- 代码、网址、文件路径、版本号、数字内部（3.5、1,024、10:15）、纯英文短语里的标点保持原样。在中文里引用整句英文，用引号括起来：「Hello, world.」。
- 中文和英文、数字之间留一个空格：「用 Astro 构建」「12 次」。全角标点前后不留空格。
- 引号用「」，引号里再套引号用『』。
- 中文句子里列举英文词用「、」：「Claude Code、Codex」。
- 一个段落在 Markdown 里写成一行，不要中途断行：浏览器会把断行显示成汉字之间的空格。
- 强调用加粗，不用斜体：中文没有斜体字形。
- 标题简短，结尾不加句号。
- 站内链接写成以 `/` 开头、以 `/` 结尾的路径，比如 `/posts/building-this-site/`；外部链接写完整网址。
- 图片放进 `src/content/posts/<文章名>/`，在文章里用相对路径引用：`![说明文字](./<文章名>/图.png)`。构建时会自动压缩。每张图都要写说明文字。
- 代码块标明语言。

## frontmatter

```yaml
---
title: 这个站是怎么搭的 # 必填，80 字以内
description: 一两句话的摘要 # 必填，10 到 160 字；用在列表、搜索、RSS 和页面描述
pubDate: 2026-11-03 # 必填，发布日期
updatedDate: 2026-11-05 # 选填，大改之后填
tags: [建站, Astro] # 选填
---
```

字段写错、多写或者漏写，构建直接失败。

## 新增一篇文章

用户说一句想写什么，Agent 按下面的步骤做。用户说「发」之前，不提交，不推送。

1. 定一个文章名：小写英文单词加连字符，它就是网址，以后不改。在 `~/data/site/drafts/<文章名>.md` 起草，素材放进 `~/data/site/sources/<文章名>/`。
2. 把草稿复制成 `src/content/posts/<文章名>.md`，配图放进 `src/content/posts/<文章名>/`，`pubDate` 填发布当天。
3. 跑 `npm run check`，改到全部通过。
4. 用 `npm run preview` 打开文章页，桌面和手机宽度各截一张图，存进 `.preview/`（不进仓库）给用户看。按用户的意见改，改完回到第 3 步。
5. 用户明确说「发」之后，提交并推送到 main。提交信息写成 `post: add <文章名>`。
6. 用 `gh run watch` 等 GitHub Actions 跑完，打开线上的文章页和 `/rss.xml`，确认新文章已经在上面，再把网址告诉用户。

## 检查

`npm run check` 依次跑下面这些检查，任何一项不过就以非零状态退出。

| 检查     | 规则                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| 构建     | `astro build` 加 Pagefind 建索引；frontmatter 在这一步校验                                              |
| 文章文件 | 文件名只用小写字母、数字和连字符；配图目录和文章同名                                                   |
| 站内链接 | 每个站内链接、资源和锚点都要存在；站内链接要带结尾斜杠                                                 |
| 中文标点 | 扫生成的每个页面上的文字（代码除外），规则见上面的「写作和排版」；弯引号只提醒，不算失败                |
| 图片体积 | `public/` 和 `dist/` 里单张不超过 300 KB，`src/` 里单张不超过 1 MB                                      |
| 提交身份 | 全部提交的作者和提交者邮箱必须是 GitHub 的 noreply 地址，Co-Authored-By 里的邮箱也必须是 noreply 地址    |
| 敏感词   | 只在本机跑：按敏感词清单扫会被提交的文件、`dist/`、暂存区和全部提交历史                                 |

- `npm install` 会把 git 的 hook 目录设成 `.githooks/`：提交前跑全部检查；写完提交信息后查它的标点和敏感词；推送前再跑一遍全部检查。
- CI 跑除敏感词以外的全部检查，通过了才发布。
- 页面上某个元素确实不该按中文标点规则检查时，给它加 `data-check-ignore` 属性。
- 敏感词清单的格式：一行一条，`#` 开头是注释；默认是不区分大小写的子串匹配，`re:` 开头的是 JavaScript 正则。环境变量 `SITE_SENSITIVE_TERMS` 可以指定清单的位置。
- 不要用 `--no-verify` 跳过检查。遇到误报，改检查脚本或者清单，并告诉用户。

## 发布

推到 main 后，GitHub Actions 依次执行 `npm ci`、`npm run check`，然后上传 `dist/`，再用 `actions/deploy-pages` 发布，一般一两分钟就能上线。检查没通过就不发布。main 开了分支保护：PR 要等 `check` 通过才能合并。

## 哪些内容不能上

仓库和网站都是公开的，推上去的东西（包括提交历史和提交信息）就收不回来了。下面这些一律不写：

- 雇主、雇主的产品和项目代号。目前不公开雇主。
- 工作中接触到的内部细节：系统设计、代码、内部文档、工单和编号。
- 任何样本、病例、受检者的信息，任何工作数据，脱敏后的也不行。
- 内部主机名、内部域名、内网地址、服务器别名。
- 真名、私人邮箱、手机号。

不要从本机的工作仓库里取材。敏感词清单只在本机，不在这个仓库里。拿不准能不能写的，先问用户。

## 提交

- 提交身份由本机的 git 配置提供：jacquard 加 GitHub noreply 邮箱。不要改。
- 提交信息用英文，conventional commits 风格。提交信息里出现中文（比如文章标题）时，同样遵守中文标点规则。
- AI Agent 新建的提交，结尾带一条 `Co-Authored-By` trailer，邮箱用模型厂商的 noreply 地址。

## 边界

- 不处理凭据。`gh` 需要重新登录时，请用户自己在终端里登录。
- 不买域名，不开任何付费服务。
- 对外的操作，比如推送、改仓库设置、发消息，先征得用户同意。
