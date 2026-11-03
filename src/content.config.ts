import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 文章：src/content/posts/<slug>.md。字段写错、多写或漏写，构建直接失败。
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '*.md' }),
  schema: z.strictObject({
    title: z.string().trim().min(1).max(80),
    // 摘要用在文章列表、搜索结果、RSS 和 <meta name="description">。
    description: z.string().trim().min(10).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  }),
});

export const collections = { posts };
