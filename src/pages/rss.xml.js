import rss from "@astrojs/rss";

import { BLOG, SITE } from "~/config.mjs";
import { getPermalink } from "~/utils/permalinks";
import { fetchPosts } from "~/utils/posts";

export const GET = async () => {
	if (BLOG.disabled) {
		return new Response(null, {
			status: 404,
			statusText: "Not found",
		});
	}

	const posts = await fetchPosts();

	return rss({
		title: `${SITE.name}’s Blog`,
		description: SITE.description,
		site: import.meta.env.SITE,

		items: posts.map((post) => ({
			link: getPermalink(post.slug, "post"),
			title: post.title,
			description: post.description,
			pubDate: post.publishDate,
		})),
	});
};
