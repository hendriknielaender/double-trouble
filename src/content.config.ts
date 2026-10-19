import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./data/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      image: image(),
      imageCreditUrl: z.url(),
      tags: z.array(z.string()).default([]),
      tweet: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
