import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { PaginateFunction } from "astro";
import { BLOG } from "~/config.mjs";
import type { Post } from "~/types";
import { POST_BASE, cleanSlug } from "./permalinks";

const getNormalizedPost = async (
  post: CollectionEntry<"post">,
): Promise<Post> => {
  const { id, data, filePath } = post;
  const { Content, remarkPluginFrontmatter } = await render(post);
  const ID = filePath.split("/").pop().split(".").shift();

  const {
    publishDate: publishDateRaw,
    title,
    description,
    excerpt,
    image,
    tags,
    category,
    imageCreditUrl,
    draft = false,
    tweet,
  } = data;

  return {
    id: id,
    slug: ID,

    publishDate: new Date(publishDateRaw),

    title: title,
    description,
    image: image,
    imageCreditUrl,

    category: category,
    tags: tags,

    draft: draft,
    excerpt,
    Content: Content,
    // or 'content' in case you consume from API

    readingTime: remarkPluginFrontmatter?.readingTime,
    tweet,
  };
};

const load = async (): Promise<Array<Post>> => {
  const posts = await getCollection("post");
  const normalizedPosts = posts.map(
    async (post) => await getNormalizedPost(post),
  );

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft);

  return results;
};

let _posts: Array<Post>;

export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};
export const isBlogEnabled = !BLOG.disabled;
export const isBlogPostRouteEnabled = !BLOG.post.disabled;

export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: POST_BASE,
      slug: post.slug,
    },
    props: { post },
  }));
};
