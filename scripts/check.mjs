#!/usr/bin/env node
// 发布前检查：一条命令跑完，任何一项不过就以非零状态退出。
//
//   npm run check                               构建，然后跑全部检查
//   npm run check -- --no-build                 不重新构建，直接检查现有的 dist/
//   node scripts/check.mjs --commit-msg <文件>   只检查一条提交信息（commit-msg hook 用）
//
// 环境变量：
//   CI=true                      在 CI 上运行：跳过敏感词和本机提交身份两项
//   SITE_SENSITIVE_TERMS=<路径>   敏感词清单的位置，默认 ~/data/site/sensitive-terms.txt
//
// 每项检查的规则见 AGENTS.md 的「检查」一节。

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://cancertin.github.io';
const IN_CI = process.env.CI === 'true';
const TERMS_FILE = process.env.SITE_SENSITIVE_TERMS || path.join(homedir(), 'data', 'site', 'sensitive-terms.txt');

const KB = 1024;
const LIMITS = {
  servedImage: 300 * KB, // public/ 和 dist/ 里的图片原样发给读者
  sourceImage: 1024 * KB, // src/ 里的图片构建时会压缩，但原图也进仓库
  distWarn: 100 * 1024 * KB, // GitHub Pages 站点上限是 1 GB，远没到就先提醒
};

// ---------- 小工具 ----------

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const fmtSize = (n) => (n >= 1024 * KB ? `${(n / 1024 / KB).toFixed(1)} MB` : `${Math.max(1, Math.round(n / KB))} KB`);
const isBinary = (buf) => buf.subarray(0, 8000).includes(0);

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const hasCommits = () => spawnSync('git', ['rev-parse', '--verify', '-q', 'HEAD'], { cwd: ROOT }).status === 0;

function walk(dir, skip = () => false) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (skip(full)) continue;
    if (entry.isDirectory()) out.push(...walk(full, skip));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function result(title) {
  // count：problems 按页面分组时，实际的问题条数。
  return { title, summary: '', skipped: '', problems: [], warnings: [], count: 0 };
}

// ---------- 构建 ----------

function checkBuild() {
  const r = result('构建');
  const started = Date.now();
  const run = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  if (run.status !== 0) {
    const tail = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim().split('\n').slice(-30).join('\n');
    r.problems.push(`npm run build 失败，最后 30 行输出：\n${tail}`);
    return r;
  }
  r.summary = `用时 ${((Date.now() - started) / 1000).toFixed(1)} 秒`;
  return r;
}

function checkOutputs(r) {
  const required = ['index.html', '404.html', 'rss.xml', 'sitemap-index.xml', 'robots.txt', 'favicon.svg', 'pagefind/pagefind.js'];
  for (const f of required) if (!existsSync(path.join(DIST, f))) r.problems.push(`dist/${f} 不存在`);
}

function loadPages() {
  return walk(DIST, (p) => p === path.join(DIST, 'pagefind'))
    .filter((f) => f.endsWith('.html'))
    .map((file) => {
      const relPath = path.relative(DIST, file).split(path.sep).join('/');
      const urlPath = `/${relPath.replace(/(^|\/)index\.html$/, '$1')}`;
      return { relPath, urlPath, root: parse(readFileSync(file, 'utf8')) };
    });
}

/** 页面对应的源文件，报错时告诉写稿的人去哪里改。 */
function sourceOf(urlPath) {
  const post = /^\/posts\/([^/]+)\/$/.exec(urlPath);
  if (post) return `src/content/posts/${post[1]}.md`;
  if (urlPath === '/') return 'src/data/site.ts、src/pages/index.astro';
  if (urlPath === '/posts/') return 'src/pages/posts/index.astro';
  const page = /^\/([^/]+)\/$/.exec(urlPath);
  if (page) return `src/pages/${page[1]}.astro`;
  return '';
}

// ---------- 文章文件 ----------

function checkContentFiles() {
  const r = result('文章文件');
  const dir = path.join(ROOT, 'src', 'content', 'posts');
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  let count = 0;
  for (const entry of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
    if (entry.name.startsWith('.')) continue;
    const where = `src/content/posts/${entry.name}`;
    if (entry.isDirectory()) {
      if (!slug.test(entry.name) || !existsSync(path.join(dir, `${entry.name}.md`))) {
        r.problems.push(`${where}/：配图目录要和某篇文章同名（${entry.name}.md 不存在）`);
      }
    } else if (!entry.name.endsWith('.md')) {
      r.problems.push(`${where}：这个目录只放 .md 文章，配图放进 src/content/posts/<文章文件名>/`);
    } else if (!slug.test(entry.name.slice(0, -3))) {
      r.problems.push(`${where}：文件名就是文章网址的最后一段，只用小写字母、数字和连字符`);
    } else {
      count++;
    }
  }
  r.summary = `${count} 篇文章`;
  return r;
}

// ---------- 站内链接 ----------

function checkLinks(pages) {
  const r = result('站内链接');
  const idCache = new Map();
  const idsOf = (relPath) => {
    if (!idCache.has(relPath)) {
      const ids = new Set();
      const page = pages.find((p) => p.relPath === relPath);
      for (const el of page?.root.querySelectorAll('[id], [name]') ?? []) {
        ids.add(el.getAttribute('id'));
        ids.add(el.getAttribute('name'));
      }
      idCache.set(relPath, ids);
    }
    return idCache.get(relPath);
  };

  let internal = 0;
  let external = 0;
  for (const page of pages) {
    const refs = [];
    for (const el of page.root.querySelectorAll('a[href], link[href]')) refs.push(el.getAttribute('href'));
    for (const el of page.root.querySelectorAll('img[src], script[src], source[src], iframe[src]')) refs.push(el.getAttribute('src'));
    for (const el of page.root.querySelectorAll('img[srcset], source[srcset]')) {
      refs.push(...el.getAttribute('srcset').split(',').map((s) => s.trim().split(/\s+/)[0]));
    }
    for (const el of page.root.querySelectorAll('meta[property="og:url"], meta[property="og:image"]')) {
      refs.push(el.getAttribute('content'));
    }

    for (const ref of refs) {
      if (!ref || /^(mailto|tel|javascript|data):/i.test(ref)) continue;
      const url = new URL(ref, SITE + page.urlPath);
      if (url.origin !== SITE) {
        external++;
        continue;
      }
      internal++;
      const where = `${page.urlPath} 里的 ${ref}`;
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        r.problems.push(`${where}：网址编码有误`);
        continue;
      }
      const target = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const file = path.join(DIST, target);
      if (!existsSync(file) || statSync(file).isDirectory()) {
        if (!pathname.endsWith('/') && existsSync(path.join(DIST, pathname, 'index.html'))) {
          r.problems.push(`${where}：站内链接要带结尾斜杠，写成 ${pathname}/`);
        } else {
          r.problems.push(`${where}：目标不存在`);
        }
        continue;
      }
      if (url.hash.length > 1 && target.endsWith('.html')) {
        let fragment = url.hash.slice(1);
        try {
          fragment = decodeURIComponent(fragment);
        } catch {
          // 保留原样去比对
        }
        if (!idsOf(target.slice(1)).has(fragment)) r.problems.push(`${where}：目标页面里没有 id 为「${fragment}」的位置`);
      }
    }
  }
  r.summary = `${internal} 个站内链接都能打开；外部链接 ${external} 个，不检查`;
  return r;
}

// ---------- 中文标点 ----------

const PH = '\uE000'; // 代码等不检查的内容换成这个占位符，保留「这里有东西」的信息
const HAN = /\p{Script=Han}/u;
const HALF = ',.;:!?()"\'';
const FULL = { ',': '，', '.': '。', ';': '；', ':': '：', '!': '！', '?': '？', '(': '（', ')': '）', '"': '「」', "'": '『』' };
const fix = (ch) => (ch === '"' || ch === "'" ? `中文引号${FULL[ch]}` : `「${FULL[ch]}」`);
const isCJK = (ch) => Boolean(ch) && (HAN.test(ch) || /[\u3000-\u303F\uFF00-\uFFEF]/.test(ch));
const isLatinish = (ch) => Boolean(ch) && /[A-Za-z0-9\uE000]/.test(ch);

const BLOCK_TAGS = new Set(
  ('address article aside blockquote body br button caption dd details dialog div dl dt fieldset figcaption figure ' +
    'footer form h1 h2 h3 h4 h5 h6 head header hr html label li main nav ol option p section summary table tbody td ' +
    'tfoot th thead title tr ul').split(' '),
);
const SKIP_TAGS = new Set('code pre kbd samp script style svg noscript textarea template math'.split(' '));

/** 把页面拆成一段段文字：块级元素各自成段，代码等换成占位符。属性里给人看的文字单独成段。 */
function textBlocks(root) {
  const blocks = [];
  let buf = '';
  const flush = () => {
    if (buf.trim()) blocks.push(buf);
    buf = '';
  };
  const visit = (node) => {
    if (node.nodeType === 3) {
      buf += node.text;
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = (node.rawTagName ?? '').toLowerCase();
    if (SKIP_TAGS.has(tag) || node.hasAttribute?.('data-check-ignore')) {
      buf += PH;
      return;
    }
    const block = BLOCK_TAGS.has(tag);
    if (block) flush();
    for (const child of node.childNodes) visit(child);
    if (block) flush();
  };
  visit(root);
  flush();
  for (const el of root.querySelectorAll('[alt], [title], [aria-label], [placeholder]')) {
    for (const attr of ['alt', 'title', 'aria-label', 'placeholder']) {
      const value = el.getAttribute(attr);
      if (value) blocks.push(value);
    }
  }
  for (const el of root.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')) {
    blocks.push(el.getAttribute('content') ?? '');
  }
  return blocks;
}

/** 网址、邮箱、引号里的纯外文不参与检查：换成等长的占位符，位置不变。 */
function maskExempt(text) {
  const blank = (m) => PH.repeat(m.length);
  return text
    .replace(/\b(?:https?|ftp):\/\/[^\s<>"'，。；：！？、（）「」『』]+/g, blank)
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, blank)
    .replace(/([「『“‘"])([^「」『』“”‘’"\n]*?)([」』”’"])/g, (m, open, body, close) =>
      HAN.test(body) ? m : open + PH.repeat(body.length) + close,
    );
}

/**
 * 找出一段文字里的标点问题，返回 [{ index, length, message, warn? }]。
 * 规则来自全局排版约定：中文句子里的标点用全角；代码、网址、数字、纯英文短语里的标点保持原样。
 */
function scanPunctuation(text, { commitMessage = false } = {}) {
  const issues = [];
  if (!HAN.test(text)) return issues;
  const t = maskExempt(text);
  // 往左或往右找最近的「有意义的」字符：跳过空白和半角标点本身。
  const near = (i, step) => {
    for (let j = i + step; j >= 0 && j < t.length; j += step) {
      if (/\s/.test(t[j]) || HALF.includes(t[j])) continue;
      return t[j];
    }
    return '';
  };
  const besideCJK = (start, end) => isCJK(near(start, -1)) || isCJK(near(end, 1));
  const add = (index, length, message, warn = false) => issues.push({ index, length, message, warn });

  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (t.startsWith('...', i)) {
      let end = i;
      while (t[end + 1] === '.') end++;
      if (besideCJK(i, end)) add(i, end - i + 1, '中文里的省略号用「……」');
      i = end;
      continue;
    }
    if (t.startsWith('--', i)) {
      let end = i;
      while (t[end + 1] === '-') end++;
      if (besideCJK(i, end)) add(i, end - i + 1, '中文里的破折号用「——」');
      i = end;
      continue;
    }
    if ((ch === '—' || ch === '…') && t[i - 1] !== ch && t[i + 1] !== ch) {
      if (besideCJK(i, i)) add(i, 1, ch === '—' ? '破折号要连写两个：「——」' : '省略号要连写两个：「……」');
      continue;
    }
    if ('“”‘’'.includes(ch)) {
      if (besideCJK(i, i)) add(i, 1, '中文引号用「」，引号里再套引号用『』', true);
      continue;
    }
    if (!HALF.includes(ch)) continue;
    // 数字里的标点保持原样：3.5、1,024、10:15
    if ('.,:'.includes(ch) && /\d/.test(t[i - 1] ?? '') && /\d/.test(t[i + 1] ?? '')) continue;
    // 提交信息里的「1. 」列表记号，和 conventional commits 的「feat: 」「fix(scope): 」前缀
    if (commitMessage && ch === '.' && /(^|\n)[ \t]*\d+$/.test(t.slice(0, i)) && /^[ \t]/.test(t[i + 1] ?? '')) continue;
    if (commitMessage && ch === ':' && /^[a-z]+(?:\([^)\n]*\))?!?$/.test(t.slice(0, i))) continue;
    if (besideCJK(i, i)) {
      add(i, 1, `半角「${ch}」夹在中文句子里，改成${fix(ch)}`);
      continue;
    }
    // 中文句子里列举英文词：「Python, Rust 和 Go」应写成「Python、Rust 和 Go」。三个词以上的英文片段按英文原文处理。
    if ((ch === ',' || ch === ';') && isLatinish(near(i, -1)) && isLatinish(near(i, 1))) {
      let a = i;
      let b = i;
      while (a > 0 && !isCJK(t[a - 1]) && t[a - 1] !== '\n') a--;
      while (b < t.length - 1 && !isCJK(t[b + 1]) && t[b + 1] !== '\n') b++;
      const words = t.slice(a, b + 1).match(/[A-Za-z][\w+#.-]*|\uE000+/g)?.length ?? 0;
      if (words <= 3) add(i, 1, `中文句子里列举用「、」或「，」，不用半角「${ch}」`);
    }
  }

  for (const m of t.matchAll(/[ \t\u00A0]+(?=[，。；：！？、）」』】》])/g)) add(m.index, m[0].length, '全角标点前面不要空格');
  for (const m of t.matchAll(/(?<=[，。；：！？、（「『【《])[ \t\u00A0]+/g)) add(m.index, m[0].length, '全角标点后面不要空格');
  if (!commitMessage) {
    // Markdown 段落里换行，浏览器会在两个汉字之间显示一个空格。
    for (const m of t.matchAll(/(?<=[\p{Script=Han}，。；：！？、」』）])[ \t]*\n[ \t]*(?=[\p{Script=Han}「『（])/gu)) {
      add(m.index, m[0].length, '段落中间断行，中文之间会多出一个空格；把这一段写成一行');
    }
  }
  return issues.sort((x, y) => x.index - y.index);
}

function snippet(text, index, length) {
  const clean = (s) => s.replace(/\uE000+/g, '‹代码›').replace(/\n/g, '⏎').replace(/[ \t\u00A0]/g, ' ');
  const before = text.slice(Math.max(0, index - 16), index);
  const hit = text.slice(index, index + length).replace(/[ \t\u00A0]/g, '␣').replace(/\n/g, '⏎');
  const after = text.slice(index + length, index + length + 16);
  return `${clean(before)}【${hit}】${clean(after)}`;
}

function checkPunctuation(pages) {
  const r = result('中文标点');
  let blocks = 0;
  for (const page of pages) {
    const found = [];
    for (const text of textBlocks(page.root)) {
      blocks++;
      for (const issue of scanPunctuation(text)) found.push({ ...issue, text });
    }
    const errors = found.filter((f) => !f.warn);
    const warns = found.filter((f) => f.warn);
    const source = sourceOf(page.urlPath);
    const header = `${page.urlPath}${source ? `（源文件 ${source}）` : ''}`;
    r.count += errors.length;
    if (errors.length) {
      r.problems.push(`${header}\n${errors.map((f) => `  ${snippet(f.text, f.index, f.length)}  ${f.message}`).join('\n')}`);
    }
    if (warns.length) {
      r.warnings.push(`${header}\n${warns.map((f) => `  ${snippet(f.text, f.index, f.length)}  ${f.message}`).join('\n')}`);
    }
  }
  r.summary = `${pages.length} 个页面、${blocks} 段文字`;
  return r;
}

// ---------- 图片体积 ----------

function checkImages() {
  const r = result('图片体积');
  const image = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i;
  const groups = [
    { dir: path.join(ROOT, 'public'), limit: LIMITS.servedImage, why: 'public/ 里的图片原样发给读者' },
    { dir: path.join(ROOT, 'src'), limit: LIMITS.sourceImage, why: '原图会进仓库' },
    { dir: DIST, limit: LIMITS.servedImage, why: '这是读者实际要下载的大小', skip: (p) => p === path.join(DIST, 'pagefind') },
  ];
  let count = 0;
  let largest = 0;
  for (const g of groups) {
    for (const file of walk(g.dir, g.skip).filter((f) => image.test(f))) {
      const size = statSync(file).size;
      count++;
      largest = Math.max(largest, size);
      if (size > g.limit) r.problems.push(`${rel(file)}：${fmtSize(size)}，超过 ${fmtSize(g.limit)} 的上限（${g.why}）。压缩或缩小后再放`);
    }
  }
  const total = walk(DIST).reduce((sum, f) => sum + statSync(f).size, 0);
  if (total > LIMITS.distWarn) r.warnings.push(`dist/ 一共 ${fmtSize(total)}，GitHub Pages 的站点上限是 1 GB`);
  r.summary = `${count} 张，最大 ${fmtSize(largest)}；整个 dist/ ${fmtSize(total)}`;
  return r;
}

// ---------- 提交身份 ----------

const GITHUB_NOREPLY = /^(?:\d+\+)?[\w.-]+(?:\[bot\])?@users\.noreply\.github\.com$/i;
const isNoreplyIdentity = (email) => GITHUB_NOREPLY.test(email) || email.toLowerCase() === 'noreply@github.com';

function checkIdentity() {
  const r = result('提交身份');
  let commits = 0;
  if (hasCommits()) {
    const log = git(['log', 'HEAD', '--branches', '--tags', '--format=%h%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%B%x1e']);
    for (const record of log.split('\x1e')) {
      const [hash, an, ae, cn, ce, body = ''] = record.replace(/^\n+/, '').split('\x1f');
      if (!hash) continue;
      commits++;
      if (!isNoreplyIdentity(ae)) r.problems.push(`提交 ${hash} 的作者 ${an} <${ae}> 不是 GitHub noreply 邮箱`);
      if (!isNoreplyIdentity(ce)) r.problems.push(`提交 ${hash} 的提交者 ${cn} <${ce}> 不是 GitHub noreply 邮箱`);
      for (const m of body.matchAll(/^co-authored-by:\s*(.*?)\s*<([^>]*)>\s*$/gim)) {
        if (!/noreply/i.test(m[2])) r.problems.push(`提交 ${hash} 的 Co-Authored-By ${m[1]} <${m[2]}> 不是 noreply 邮箱`);
      }
    }
  }
  if (!IN_CI) {
    const ident = spawnSync('git', ['var', 'GIT_AUTHOR_IDENT'], { cwd: ROOT, encoding: 'utf8' });
    const email = /<([^>]*)>/.exec(ident.stdout ?? '')?.[1] ?? '';
    if (ident.status !== 0) r.problems.push('本机没有可用的提交身份：git var GIT_AUTHOR_IDENT 失败');
    else if (!isNoreplyIdentity(email)) r.problems.push(`本机下一次提交会用 <${email}>，不是 GitHub noreply 邮箱；检查 git config user.email`);
    const hooks = spawnSync('git', ['config', 'core.hooksPath'], { cwd: ROOT, encoding: 'utf8' }).stdout?.trim();
    if (hooks !== '.githooks') r.warnings.push('本机没有启用仓库自带的 git hook：运行 npm install，或者 git config core.hooksPath .githooks');
  }
  r.summary = `${commits} 个提交${IN_CI ? '' : '，加上本机的提交身份'}，邮箱都是 noreply`;
  return r;
}

// ---------- 敏感词（只在本机） ----------

function loadTerms() {
  const terms = [];
  readFileSync(TERMS_FILE, 'utf8')
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return;
      const source = line.startsWith('re:') ? line.slice(3) : line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        terms.push({ label: line, re: new RegExp(source, 'giu') });
      } catch {
        throw new Error(`敏感词清单第 ${i + 1} 行不是合法的正则表达式：${line}`);
      }
    });
  return terms;
}

function findTerms(terms, text, where, hits) {
  if (!text) return;
  let lines;
  for (const term of terms) {
    term.re.lastIndex = 0;
    if (!term.re.test(text)) continue;
    lines ??= text.split('\n');
    lines.forEach((line, i) => {
      term.re.lastIndex = 0;
      if (term.re.test(line)) hits.push(`${where}${lines.length > 1 ? `:${i + 1}` : ''} 命中「${term.label}」：${line.trim().slice(0, 100)}`);
    });
  }
}

function checkSensitive() {
  const r = result('敏感词');
  if (IN_CI) {
    r.skipped = '跳过：清单只在本机，CI 上不跑';
    return r;
  }
  if (!existsSync(TERMS_FILE)) {
    r.problems.push(`找不到敏感词清单 ${TERMS_FILE}。这一项只在本机跑，清单格式见 AGENTS.md`);
    return r;
  }
  let terms;
  try {
    terms = loadTerms();
  } catch (e) {
    r.problems.push(e.message);
    return r;
  }

  const hits = [];
  // 1. 会被提交的文件：已跟踪的，加上没被 .gitignore 忽略的新文件；文件名也算。
  const files = git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0').filter(Boolean);
  for (const f of files) {
    findTerms(terms, f, `文件名 ${f}`, hits);
    const full = path.join(ROOT, f);
    if (!existsSync(full) || statSync(full).isDirectory()) continue;
    const buf = readFileSync(full);
    if (!isBinary(buf)) findTerms(terms, buf.toString('utf8'), f, hits);
  }
  // 2. 构建产物
  for (const file of walk(DIST)) {
    const buf = readFileSync(file);
    if (!isBinary(buf)) findTerms(terms, buf.toString('utf8'), rel(file), hits);
  }
  // 3. 暂存区和全部提交历史：作者、提交信息、每一次改动。推上去就收不回来了，历史也要干净。
  let commits = 0;
  if (hasCommits()) {
    findTerms(terms, git(['diff', '--cached', '--no-color', '--no-ext-diff']), '暂存区', hits);
    const log = git(['log', 'HEAD', '--branches', '--tags', '-p', '--no-color', '--no-ext-diff', '--format=%x1e%h%n%an <%ae>%n%cn <%ce>%n%B']);
    for (const chunk of log.split('\x1e').filter(Boolean)) {
      commits++;
      findTerms(terms, chunk, `提交 ${chunk.slice(0, chunk.indexOf('\n'))}`, hits);
    }
  }
  const shown = hits.slice(0, 40);
  r.problems.push(...shown);
  if (hits.length > shown.length) r.problems.push(`……另有 ${hits.length - shown.length} 处`);
  r.summary = `${terms.length} 条规则，扫了 ${files.length} 个文件、dist/ 和 ${commits} 个提交`;
  return r;
}

// ---------- 提交信息（commit-msg hook） ----------

function checkCommitMessage(file) {
  const r = result('提交信息');
  const raw = readFileSync(file, 'utf8').split(/^# -+ >8 -+$/m)[0];
  const message = raw
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trim();
  if (!message) return r;
  for (const paragraph of message.split(/\n[ \t]*\n/)) {
    for (const issue of scanPunctuation(paragraph, { commitMessage: true })) {
      const line = `${snippet(paragraph, issue.index, issue.length)}  ${issue.message}`;
      (issue.warn ? r.warnings : r.problems).push(line);
    }
  }
  if (!IN_CI) {
    if (!existsSync(TERMS_FILE)) {
      r.problems.push(`找不到敏感词清单 ${TERMS_FILE}`);
    } else {
      const hits = [];
      findTerms(loadTerms(), message, '提交信息', hits);
      r.problems.push(...hits);
    }
  }
  r.summary = '标点和敏感词';
  return r;
}

// ---------- 输出 ----------

function report(results) {
  console.log('');
  for (const r of results) {
    const mark = r.skipped ? '-' : r.problems.length ? '✗' : '✓';
    const detail = r.skipped || (r.problems.length ? `${r.count || r.problems.length} 处问题` : r.summary);
    console.log(`${mark} ${r.title}${'\u3000'.repeat(Math.max(1, 5 - r.title.length))}${detail}`);
    for (const p of r.problems) console.log(p.replace(/^/gm, '    '));
    for (const w of r.warnings) console.log(`提醒：${w}`.replace(/^/gm, '    '));
  }
  const failed = results.filter((r) => r.problems.length);
  console.log(failed.length ? `\n${failed.map((r) => r.title).join('、')}没通过。` : '\n全部通过。');
  return failed.length ? 1 : 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--commit-msg') {
    if (!args[1]) {
      console.error('用法：node scripts/check.mjs --commit-msg <提交信息文件>');
      return 2;
    }
    return report([checkCommitMessage(args[1])]);
  }

  const results = [];
  let build;
  if (args.includes('--no-build')) {
    build = result('构建');
    build.summary = '沿用现有的 dist/';
    if (!existsSync(path.join(DIST, 'index.html'))) build.problems.push('dist/ 里没有构建结果，先运行 npm run build');
  } else {
    build = checkBuild();
  }
  results.push(build);

  results.push(checkContentFiles());
  if (build.problems.length) {
    for (const title of ['站内链接', '中文标点']) {
      const skipped = result(title);
      skipped.skipped = '跳过：构建没成功，没有页面可查';
      results.push(skipped);
    }
  } else {
    checkOutputs(build);
    const pages = loadPages();
    build.summary = `${pages.length} 个页面，${build.summary}`;
    results.push(checkLinks(pages), checkPunctuation(pages));
  }
  results.push(checkImages(), checkIdentity(), checkSensitive());
  return report(results);
}

process.exitCode = main();
