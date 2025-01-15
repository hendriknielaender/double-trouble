import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// https://docs.astro.build/de/guides/content-collections/
const postCollection = defineCollection({
  loader: glob({ pattern: ["*.md", "*.mdx"], base: "data/blog" }),
  schema: z.object({
    publishDate: z.string().optional(),
    updateDate: z.string().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    imageCreditUrl: z.string().optional(),
    tweet: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  }),
});

export const collections = {
  post: postCollection,
};
