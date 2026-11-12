---
title: 一句提示词，八小时，一个 HTML
description: 从人工制作的浏览器游戏到 Claude Fable 5.2 的《Saltline》，看看做一关要花多少资源、哪些工作已经能交给 Agent，以及我用 Agent 建站时怎样验收。
pubDate: 2026-11-12
tags: [AI, Agent, 软件工程]
---

打开《Saltline》，标题背后是一座下着雨的集装箱码头。吊机和货船隐在雾里，按下开始，玩家就能走进这片港区。这是一个在浏览器里玩的第一人称射击游戏，只有一关。[试玩《Saltline》](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp)

Anthropic 的 Felix Rieseberg 用 2026 年 11 月 9 日发布的 Claude Fable 5.2 做了这个实验。据他公开介绍，他给了一条提示词，中途没有提供反馈，整个过程用了约八小时，按 API 定价估算约 550 美元。我最在意的是提示词里的范围要求。他想要尽可能精细的画面，把规模压到一个小关卡，具体场景和玩法留给模型决定。[作者发布帖](https://x.com/felixrieseberg/status/2119925633564463609)、[原提示词](https://x.com/felixrieseberg/status/2119927483994907024)和[模型发布说明](https://www.anthropic.com/claude-fable-and-mythos-5-2)。

## 人来做，要花多少时间

人早就能做出这种小型 3D 游戏。2012 年，Isaac Sukin 用 Three.js 在一次黑客松里独自做出浏览器射击游戏《Nemesis》，用时约 23 小时。他把地图做成平面，用方块表示敌人，把移动、碰撞和计分做通。更早的 2004 年，《`.kkrieger`》已经把程序化生成的模型和纹理装进一个 96 KB 的 Windows 游戏。它用了自制的编辑器，主要由四人利用约两年业余时间完成，另有两人在后期帮忙做声音。[《Nemesis》作者复盘](https://www.isaacsukin.com/news/2012/06/how-build-first-person-shooter-browser-threejs-and-webglhtml5-canvas)和[96 KB 游戏的开发者记录](https://www.flipcode.com/archives/04-20-2004.shtml)。

今年做《Rainbow Ricochet》的 Nicklas Löf 复用了自己的 3D 模板和关卡工具，也用 ChatGPT 解答过一些数学和 JavaScript 问题。他事后估计，为这款四关的浏览器游戏投入了约 80 小时。[开发者复盘](https://blog.snukey.se/js13k-2026-post-mortem/)和[赛事作品页](https://js13kgames.com/games/rainbow-ricochet)。

如果要给一个类似的浏览器原型估工，我会先给一名熟悉 Three.js 的开发者留 40 到 80 个工时。按每天八小时算，约一到两个工作周。这个预算假设可以复用引擎和现成工具，只做一关，画面允许简化。玩法、场景、界面、声音、打包和离线试玩都要从这笔时间里出。如果目标是接近《Saltline》的雨雾、反光和声音细节，我会先做一段场景样板，再估剩下的工作。

人工预算可以用工时乘以开发者的小时成本，再加上素材和工具的开销。《Saltline》的作者还公布了那次运行的用量，约 4.45 亿输入 token（大量命中缓存）和 270 万输出 token。估整个项目时，我还会算上人工试玩、复核和可能的重跑。[作者公布的用量](https://x.com/felixrieseberg/status/2119925633564463609)。

## 模型从写代码走到交付游戏

**2023 年**，Ammaar Reshi 用 GPT-4 和早期 Claude，在三天里做出了一个 3D 太空跑酷游戏。他把模型给的代码粘进 Replit，自己试玩，发现镜头角度不对、飞船会穿过跑道，再逐项反馈给模型。他还自己找了飞船模型和音乐，用 Midjourney 做纹理。那时可以把不少代码交给模型写，试玩、找素材和决定下一步仍由人来串起来。到 2025 年，和 Claude 3.7 Sonnet 一起推出的 Claude Code 已经能自己读写项目文件、执行命令和跑测试，模型有了直接试自己改动的工具。[跑酷游戏制作记录](https://threadreaderapp.com/thread/1637592014446551040.html)和[Claude Code 最初的发布说明](https://www.anthropic.com/news/claude-3-7-sonnet)。

**2026 年 9 月**，开发者 riba2534 用 Claude Opus 5.5 在 Claude Code 里做了三款浏览器游戏，每款给一句需求，其中有运输船上的射击游戏和漂移竞速。按仓库里的记录，Agent 自己构建，用无头浏览器模拟按键跑完整对局，最后打包成单文件 HTML。仓库还保留了模块源码和构建脚本。想试玩的人可以直接打开成品，想接着做的人有地方改。[项目源码与验证记录](https://github.com/riba2534/claude-opus-5-5-demo)。

**10 月**，GlanceHall 给 GPT-6.1 Sol 和 GPT-6 Astra 同一份详细的游戏需求，提供本地 Three.js，并写明操作和胜负条件。两款模型分别用了 13 分钟和 20 分钟，各自交出一份可玩的 3D 射击原型。它们用简单的几何体搭出场景，带开始菜单和结束画面。Claude Fable 5.1 收到同一份需求，跑了 75 分钟，做出一座有暮色和灯光效果的屋顶场景。这些结果来自每款模型的一次运行。[GlanceHall 的对照记录与成品](https://glancehall.com/blog/can-ai-build/vibe-coding-games)。

**11 月**，Fable 5.2 交回的《Saltline》里，地面有积水反光，声音由程序合成，关卡结束还有结算页。11 月 10 日向开发者开放的 Gemini 4 Carbon 展示了怎样用多种工具完成同一款游戏。按 Google 的演示记录，Agent 分工用 Blender 做模型，再用 Three.js 做出一个能骑车游览的 3D 校园，配乐用专门的音乐生成工具制作。两场演示的任务和工具各异。要知道我自己的任务能否稳定完成，我会固定验收标准，多跑几次。[Google 的 Carbon 演示](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/)。

现在我可以更早开始试玩。比如先做两个简单的原型，试玩两种不同的玩法，再为选中的那个打磨场景和声音。Agent 一次能接过去的工作也多了。我可以把写代码、构建和试玩检查交给同一次运行，自己集中看结果是否值得接着做。

## 一个原型，玩完一关就算做完

我留存了一份流传的中文版本，整个游戏装在约 1.43 MB 的 HTML 里。Three.js 也打包在文件内。码头的几何形状、水面的纹理和游戏音效，都由代码在浏览器里生成。把文件交给别人，对方拿到的就是可以打开的游戏。

归档时做的离线检查打开了标题菜单。如果我只想看看这种体验能不能做出来，我会在约定的浏览器里离线打开文件，从菜单进入游戏，一直玩到关卡结束。能走完这一遍，原型就算做完了。

交一个文件在这里很合适。我可以把它发给另一个人，让对方直接试玩，再聊画面和操作感觉。传递成本低，本身就是这个原型的优点。

## 如果明天还要接着改

假设明天我想改暂停菜单里的一个按钮，再把新版发给同一个人。这时我希望拿到能修改的源码、能重建游戏的命令，以及改完后能重跑的检查。我会用这次小改动来验收交接。找到按钮在哪定义，改完重新生成 HTML，然后离线打开新版，确认按钮的改动生效，再跑完一关。

最终发出去的仍然可以是一个 HTML。这个文件负责让别人玩，开发目录负责让下一次修改有地方下手。只要构建过程能把源码重新打成那个文件，两种用途就可以同时满足。

## 我用 Agent 建站时怎么验收

我用 Agent 搭这个个人站时，读者打开的是已经生成的静态页面。下一次想改一段正文，我可以让 Agent 找到对应的 Markdown，修改后用 Astro 重新生成页面，由 Pagefind 重建搜索索引。源码和构建入口都在仓库里，换个会话也能继续做。[建站记录](/posts/building-this-site/)

我自己审阅时看的是本地预览。手机上标题怎么换行、段落读起来顺不顺，我看过再决定怎么改。与此同时，Agent 会跑 `npm run check`，校验文章字段，检查站内链接、锚点和中文标点。改完再生成一次预览，才能看到这一轮改动实际落在页面上的样子。我说「发」之后，Agent 才推送，由 GitHub Actions 检查并发布。

在上一篇文章里，我问的是执行过程中谁来决定下一步。[《从生信工作流到变异解读 Agent》](/posts/from-bioinformatics-workflows-to-agents/)

这次我想把问题往后推一步。**交付之后，接手的人要做什么？**

如果我只需要试玩，就让 Agent 交一个离线能跑完一关的文件。如果我打算接着做，就把修改、重建和验证也写进一开始的任务。这样第二天有了新想法，我可以从上一次的成果继续改。
