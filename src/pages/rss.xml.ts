import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts, postUrl } from "~/lib/posts";
import { site } from "~/site";

export const GET: APIRoute = async ({ site: origin }) => {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: origin ?? site.url,
    customData: `<language>${site.locale}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: postUrl(post),
      categories: post.data.tags,
    })),
  });
};
