import { getAsset, getBlogPermalink, getPermalink } from "./utils/permalinks";

export const headerData = {
  links: [
    {
      text: "Blog",
      href: getBlogPermalink(),
    },
    {
      text: "About",
      href: getPermalink("/about"),
    },
  ],
  actions: [
    {
      href: "https://github.com/hendriknielaender/double-trouble",
      target: "_blank",
      icon: "tabler:brand-github",
    },
  ],
};

export const footerData = {
  links: [
    {
      title: "Company",
      links: [
        { text: "About", href: getPermalink("/about") },
        { text: "Blog", href: getBlogPermalink() },
      ],
    },
    {
      title: "Support",
      links: [
        {
          text: "GitHub",
          href: "https://github.com/hendriknielaender/double-trouble",
        },
      ],
    },
  ],
  secondaryLinks: [
    { text: "Terms", href: getPermalink("/legal") },
    { text: "Privacy Policy", href: getPermalink("/privacy") },
  ],
  socialLinks: [
    {
      ariaLabel: "X",
      icon: "tabler:brand-x",
      href: "https://x.com/doubletrblblogs",
    },
    { ariaLabel: "RSS", icon: "tabler:rss", href: getAsset("/rss.xml") },
    {
      ariaLabel: "Github",
      icon: "tabler:brand-github",
      href: "https://github.com/hendriknielaender/double-trouble",
    },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://github.com/hendriknielaender"> hendriknielaender</a> · All rights reserved.
  `,
};
