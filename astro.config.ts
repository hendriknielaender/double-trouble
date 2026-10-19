import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://double-trouble.dev",
  trailingSlash: "never",
  build: {
    format: "file",
    inlineStylesheets: "always",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/tag/") })],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Schibsted Grotesk",
      cssVariable: "--font-sans",
      weights: ["400 800"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Martian Mono",
      cssVariable: "--font-mono",
      weights: ["400"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
  redirects: {
    "/post/berlin_summit_2023_review": "/post/berlin-summit-2023-review",
    "/post/product_engineers": "/post/product-engineers",
    "/blog/2": "/blog",
    "/blog/3": "/blog",
    "/blog/4": "/blog",
    "/blog/5": "/blog",
  },
});
