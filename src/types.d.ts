import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export interface Post {
  id: string;
  publishDate: Date;
  draft: boolean;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageCreditUrl: string | null;
  Content: AstroComponentFactory; // or 'body' in case you consume from API
  content?: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingTime: number;
  tweet: string;
}
