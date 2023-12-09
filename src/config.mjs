export const SITE = {
	name: "Double Trouble",

	origin: "https://double-trouble.dev",
	basePathname: "/",
	trailingSlash: false,

	title: "Double Trouble",
	description: "🚀 Twice the fun, double the trouble.",

	googleAnalyticsId: false, // or "G-XXXXXXXXXX",
	googleSiteVerificationId: "orcPxI47GSa-cRvY11tUe6iGg2IO_RPvnA1q95iEM3M",

	defaultTheme: "dark",
};

export const BLOG = {
	disabled: false,
	postsPerPage: 4,

	blog: {
		disabled: false,
		pathname: "blog", // blog main path, you can change this to "articles" (/articles)
	},

	post: {
		disabled: false,
		pathname: "post", // empty for /some-post, value for /pathname/some-post
	},

	category: {
		disabled: true,
		pathname: "category", // set empty to change from /category/some-category to /some-category
	},

	tag: {
		disabled: false,
		pathname: "tag", // set empty to change from /tag/some-tag to /some-tag
	},
};
