import type { RehypePlugin, RemarkPlugin } from "@astrojs/markdown-remark";
import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";

export const readingTimeRemarkPlugin: RemarkPlugin = () => {
  return (tree, file) => {
    const textOnPage = mdastToString(tree);
    const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

    if (typeof file?.data?.astro?.frontmatter !== "undefined") {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
};

export const responsiveTablesRehypePlugin: RehypePlugin = () => {
  return (tree) => {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === "element" && child.tagName === "table") {
        tree.children[i] = {
          type: "element",
          tagName: "div",
          properties: {
            style: "overflow:auto",
          },
          children: [child],
        };

        i++;
      }
    }
  };
};

export const lazyImagesRehypePlugin: RehypePlugin = () => {
  return (tree) => {
    if (!tree.children) return;

    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        node.properties.loading = "lazy";
      }
    });
  };
};
