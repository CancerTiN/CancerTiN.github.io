# cancertin.github.io

jacquard 的个人站：https://cancertin.github.io

生物信息学和 AI for Science 的交叉，评估大模型在生物医学任务上的表现，写 Agent 工具，记笔记。

## 本地运行

需要 Node.js 22.23 以上。

```sh
npm install       # 装依赖，同时启用仓库自带的 git hook
npm run dev       # http://localhost:4321
npm run check     # 构建，然后跑发布前的全部检查
```

写作规范、目录约定和发布流程见 [AGENTS.md](AGENTS.md)。

## 许可

- 文章（`src/content/`）：[CC BY 4.0](LICENSE-CONTENT.md)
- 代码：[MIT](LICENSE)
- 代码字体 IBM Plex Mono：© IBM Corp.，以 SIL Open Font License 1.1 发布，经 [Fontsource](https://fontsource.org) 打包
