import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import compress from "astro-compress";
import icon from "astro-icon";
import path from "path";
import autolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { fileURLToPath } from "url";
import { autolinkConfig } from "./plugins/rehype-autolink-config";
import {
  lazyImagesRehypePlugin,
  readingTimeRemarkPlugin,
  responsiveTablesRehypePlugin,
} from "./src/utils/frontmatter.ts";
import astrowind from "./vendor/integration";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (
  items: (() => AstroIntegration) | (() => AstroIntegration)[] = [],
) =>
  hasExternalScripts
    ? Array.isArray(items)
      ? items.map((item) => item())
      : [items()]
    : [];

export default defineConfig({
  output: "static",

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ["*"],
        "flat-color-icons": [
          "template",
          "gallery",
          "approval",
          "document",
          "advertising",
          "currency-exchange",
          "voice-presentation",
          "business-contact",
          "database",
        ],
      },
    }),
    react(),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ["dataLayer.push"] },
      }),
    ),

    compress({
      CSS: true,
      HTML: {
        "html-minifier-terser": {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: "./src/config.yaml",
    }),
  ],

  image: {
    domains: ["cdn.pixabay.com"],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [
      responsiveTablesRehypePlugin,
      lazyImagesRehypePlugin,
      rehypeSlug,
      [autolinkHeadings, autolinkConfig],
    ],
    shikiConfig: {
      theme: "catppuccin-mocha",
      wrap: false,
    },
  },

  redirects: {
    // redirect since it was shared via linkedin under an this old address which cannot be updated
    "/post/berlin_summit_2023_review": "/post/berlin-summit-2023-review",
    // redirect since the associated tweet points at the old address
    "/post/product_engineers": "/post/product-engineers",
  },

  vite: {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      exclude: ["limax"],
    },
  },
});
