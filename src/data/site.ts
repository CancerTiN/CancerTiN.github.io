// 站点信息和首页内容。改首页文字只需要改这里。

export const site = {
  title: 'jacquard',
  tagline: 'Bioinformatics × AI4S',
  description:
    'jacquard 的个人站：生物信息学和 AI for Science 的交叉，评估大模型在生物医学任务上的表现，写 Agent 工具，记笔记。',
  author: 'jacquard',
  url: 'https://cancertin.github.io',
  github: 'https://github.com/CancerTiN',
  repo: 'https://github.com/CancerTiN/CancerTiN.github.io',
  since: 2026,
  contentLicense: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/deed.zh-hans',
  },
};

export const intro =
  '我是 jacquard，做生物信息学和 AI for Science 的交叉：用大模型和 Agent 处理基因组数据，也琢磨这些结果怎么评估、能不能信。平时重度使用 Claude Code 和 Codex，顺手写些 Agent 工具。这里记下能公开的东西：工具、方法和笔记。';

export const now = [
  '评估大模型在生物医学任务上的表现：定标准、做对比，分清真改进和随机波动。',
  'Agent 工作流：给 Claude Code、Codex 写 skill 和小工具。',
  '这个网站：零成本、国内能打开的个人站。',
];

export interface Project {
  name: string;
  years: string;
  url: string;
  summary: string;
}

export const projects: Project[] = [
  {
    name: 'session-summary-title',
    years: '2026',
    url: 'https://github.com/CancerTiN/session-summary-title',
    summary:
      '给会话起一个恰好十二个汉字的标题并改名的 Agent skill。从候选标题到界面更新，每一步都要拿到证据才算数。',
  },
  {
    name: 'dsh-set-session-title',
    years: '2026',
    url: 'https://github.com/CancerTiN/dsh-set-session-title',
    summary: '给 DeepSeek Harness 补上的 set_session_title 工具：自动起的标题不对时，Agent 可以自己改。',
  },
  {
    name: 'smith-waterman',
    years: '2022',
    url: 'https://github.com/CancerTiN/smith-waterman',
    summary: 'Smith-Waterman 局部序列比对算法的 Python 小实现，附带在浏览器里演示算法的教学页面。',
  },
];
