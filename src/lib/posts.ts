import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const TZ = 'Asia/Shanghai';
const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

/** 按北京时间取日期：2026-11-03。 */
export function isoDate(date: Date): string {
  return ymd.format(date);
}

/** 中文日期：2026 年 11 月 3 日。 */
export function zhDate(date: Date): string {
  const [y, m, d] = isoDate(date).split('-').map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}

export function year(date: Date): number {
  return Number(isoDate(date).slice(0, 4));
}

/** 按发布时间从新到旧排好的全部文章。 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id));
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

/** 粗略的阅读时间：汉字每分钟 400 个，英文每分钟 200 词，代码块不算。 */
export function readingMinutes(markdown: string): number {
  const text = markdown.replace(/```[\s\S]*?```/g, '');
  const han = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.match(/[A-Za-z][A-Za-z0-9'’-]*/g)?.length ?? 0;
  return Math.max(1, Math.round(han / 400 + words / 200));
}
