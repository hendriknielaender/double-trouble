import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import image from '@astrojs/image';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';

import { remarkReadingTime } from './src/utils/frontmatter.js';

import { SITE } from './src/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	// Astro uses this full URL to generate your sitemap and canonical URLs in your final build
	site: SITE.origin,
	base: SITE.basePathname,
	trailingSlash: SITE.trailingSlash ? 'always' : 'never',

	output: 'static',

        redirects: {
                // redirect since it was shared via linkedin under an this old address which cannot be updated
                '/post/berlin_summit_2023_review': '/post/berlin-summit-2023-review',
                // redirect since the associated tweet points at the old adress
                '/post/product_engineers': '/post/product-engineers'

        },
	integrations: [
		tailwind({
			config: {
				applyBaseStyles: false,
			},
		}),
		sitemap(),
		image({
			serviceEntryPoint: '@astrojs/image/sharp',
		}),
		mdx(),

		/* Disable this integration if you don't use Google Analytics (or other external script). */
		partytown({
			config: { forward: ['dataLayer.push'] },
		}),
	],

	markdown: {
		remarkPlugins: [remarkReadingTime],
		extendDefaultPlugins: true,
                shikiConfig: {
                  // Choose from Shiki's built-in themes (or add your own)
                  // https://github.com/shikijs/shiki/blob/main/docs/themes.md
                  theme: 'rose-pine',
                  // Enable word wrap to prevent horizontal scrolling
                  wrap: true,
                },
	},

	vite: {
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
                optimizeDeps: {
                        exclude: [
                                'limax',
                        ],
                },
	},
});
