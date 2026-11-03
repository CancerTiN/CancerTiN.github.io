// 把文字「织」成一枚提花布标：靛蓝经线织成 3/1 斜纹底（牛仔布的织法），
// 本白纬线浮在上面，拼出像素字母。输出纯 SVG 字符串，构建时生成，不依赖任何脚本。

type Bitmap = string[];

// 5 列 × 9 行的小写像素字：第 0–1 行是升部，2–6 行是 x 高度，7–8 行是降部。
const GLYPHS: Record<string, Bitmap> = {
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####', '.....', '.....'],
  c: ['.....', '.....', '.####', '#....', '#....', '#....', '.####', '.....', '.....'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####', '.....', '.....'],
  j: ['...#.', '.....', '..##.', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  q: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['.....', '.....', '#.###', '##...', '#....', '#....', '#....', '.....', '.....'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '.....', '.....'],
};

export interface Palette {
  ground: string;
  warp: string;
  pick: string;
  weft: string;
}

type Role = keyof Palette;

/** 一串小写字母排成位图：字间空一列，四周留白。 */
export function textBitmap(text: string, padX = 3, padY = 2): Bitmap {
  const letters = [...text].map((ch) => {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`weave: 没有字母「${ch}」的像素字形`);
    return glyph;
  });
  const lines = letters[0].map((_, r) => letters.map((g) => g[r]).join('.'));
  const width = lines[0].length + padX * 2;
  const blank = '.'.repeat(width);
  const side = '.'.repeat(padX);
  return [...Array(padY).fill(blank), ...lines.map((l) => side + l + side), ...Array(padY).fill(blank)];
}

/** 每一行里连续的「纬线在上」的格子，返回 [起点, 长度]。 */
function runs(line: string): [number, number][] {
  const out: [number, number][] = [];
  let start = -1;
  for (let i = 0; i <= line.length; i++) {
    const on = line[i] === '#';
    if (on && start < 0) start = i;
    if (!on && start >= 0) {
      out.push([start, i - start]);
      start = -1;
    }
  }
  return out;
}

const n = (v: number) => Number(v.toFixed(2));

/** 传了配色就把颜色写死（独立的 SVG 文件用）；不传就挂 CSS 类名，跟着页面的亮暗配色走。 */
function painter(palette?: Palette) {
  return (role: Role, attr: 'fill' | 'stroke') => (palette ? `${attr}="${palette[role]}"` : `class="weave-${role}"`);
}

/**
 * 斜纹单元：4 × 4 格。每根经线被纬线压住一格、浮起三格，压住的位置逐列上移，
 * 斜纹就向右上走，和牛仔布正面一样。跨单元的那段经线画两遍，让上下两个单元接上。
 */
function twill(id: string, c: number, paint: ReturnType<typeof painter>): string {
  const thread = n(c * 0.62);
  let warp = '';
  let pick = '';
  for (let i = 0; i < 4; i++) {
    const x = i * c + c / 2;
    const down = 3 - i;
    for (const shift of [0, -4]) {
      warp += `M${n(x)} ${n((down + 1 + shift) * c + c / 2)}V${n((down + 3 + shift) * c + c / 2)}`;
    }
    pick += `M${n(i * c + c * 0.2)} ${n(down * c + c / 2)}H${n(i * c + c * 0.8)}`;
  }
  return (
    `<pattern id="${id}-twill" width="${n(c * 4)}" height="${n(c * 4)}" patternUnits="userSpaceOnUse">` +
    `<rect width="${n(c * 4)}" height="${n(c * 4)}" ${paint('ground', 'fill')}/>` +
    `<path d="${pick}" ${paint('pick', 'stroke')} stroke-width="${thread}" stroke-linecap="round"/>` +
    `<path d="${warp}" ${paint('warp', 'stroke')} stroke-width="${thread}" stroke-linecap="round"/>` +
    `</pattern>`
  );
}

export interface WeaveOptions {
  bitmap: Bitmap;
  /** 每格的边长，单位是 SVG 用户坐标。 */
  cell: number;
  /** 同一页面里有多个布标时，用来区分各自的 <pattern>。 */
  id: string;
  palette?: Palette;
  /** 布标本身就是标题时给读屏软件念的文字；不传就按装饰处理。 */
  label?: string;
  className?: string;
  /**
   * 给每行纬线标上行号，供首页的投纬动画用。动画本身由页面脚本按需加上 weave-animate 类，
   * 没有脚本或不该动的时候，布标就是织好的样子。
   */
  animate?: boolean;
}

export function renderWeave(opts: WeaveOptions): string {
  const { bitmap, cell: c, id, palette, label, className, animate } = opts;
  const paint = painter(palette);
  const width = n(bitmap[0].length * c);
  const height = n(bitmap.length * c);

  const rows = bitmap
    .map((line, y) => {
      const d = runs(line)
        .map(([x0, len]) => {
          const xa = x0 * c + c / 2 - c * 0.12;
          const xb = (x0 + len - 1) * c + c / 2 + c * 0.12;
          return `M${n(xa)} ${n(y * c + c / 2)}H${n(xb)}`;
        })
        .join('');
      if (!d) return '';
      // 织布时梭子来回走，奇数行从右往左投。
      const cls = palette ? `stroke="${palette.weft}"` : `class="weave-weft${y % 2 ? ' weave-rtl' : ''}"`;
      const style = animate ? ` style="--i:${y}"` : '';
      return `<path ${cls}${style} d="${d}"/>`;
    })
    .join('');

  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  const classes = ['weave', className].filter(Boolean).join(' ');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${classes}" ${a11y}>` +
    `<defs>${twill(id, c, paint)}</defs>` +
    `<rect width="${width}" height="${height}" rx="${n(c * 1.2)}" fill="url(#${id}-twill)"/>` +
    `<g fill="none" stroke-width="${n(c * 0.72)}" stroke-linecap="round">${rows}</g>` +
    `</svg>`
  );
}

/** 网站图标：同样的斜纹底，上面一个实心的 j。图标太小，用像素字认不出来。 */
export function renderIcon(palette: Palette): string {
  const paint = painter(palette);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">` +
    `<defs>${twill('icon', 3.2, paint)}</defs>` +
    `<rect width="32" height="32" rx="6" fill="url(#icon-twill)"/>` +
    `<circle cx="19" cy="7" r="2.7" fill="${palette.weft}"/>` +
    `<path d="M19 13v8.6a5.4 5.4 0 0 1-5.4 5.4H11" fill="none" stroke="${palette.weft}" stroke-width="4.6" stroke-linecap="round"/>` +
    `</svg>`
  );
}
