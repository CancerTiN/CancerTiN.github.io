import { renderIcon } from '../lib/weave';

// 网站图标：斜纹底上一个本白的 j。构建时输出成 dist/favicon.svg。
export function GET() {
  const svg = renderIcon({ ground: '#13203F', warp: '#2A4A8C', pick: '#3F5385', weft: '#F1EBDC' });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
