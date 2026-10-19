import { type CollectionEntry, getCollection } from "astro:content";

export type Post = CollectionEntry<"blog">;

export type Tag = { slug: string; name: string; posts: Post[] };

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const postUrl = (post: Post) => `/post/${post.id}`;

export const tagUrl = (tag: string) => `/tag/${slugify(tag)}`;

export function readingMinutes(post: Post): number {
  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function formatDate(
  date: Date,
  style: "long" | "short" = "long",
): string {
  return new Intl.DateTimeFormat("en", {
    year: style === "long" ? "numeric" : undefined,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getTags(posts: Post[]): Tag[] {
  const tags = new Map<string, Tag>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = slugify(name);
      const tag = tags.get(slug) ?? { slug, name, posts: [] };
      if (!tag.posts.includes(post)) tag.posts.push(post);
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug),
  );
}

export function relatedPosts(post: Post, posts: Post[], count = 3): Post[] {
  const own = new Set(post.data.tags.map(slugify));
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      candidate,
      shared: candidate.data.tags.filter((tag) => own.has(slugify(tag))).length,
    }))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, count)
    .map(({ candidate }) => candidate);
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.publishDate.getFullYear();
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()];
}
