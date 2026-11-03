// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://cancertin.github.io',
  // 站内链接一律带结尾斜杠，和 GitHub Pages 的目录式地址一致；检查脚本会拦截不带斜杠的站内链接。
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Astro 7 默认按 JSX 规则吞掉行间空白，中文和英文、链接之间的空格会丢；改回无损压缩。
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    processor: satteri({
      features: {
        // 关掉智能标点：不让 "..." 之类被悄悄改写，源文件里的标点原样输出，由检查脚本把关。
        smartPunctuation: false,
        gfm: {
          footnotes: { label: '注释', backLabel: '回到正文第 {reference} 处' },
        },
      },
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
