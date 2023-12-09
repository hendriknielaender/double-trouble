import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	return (tree, { data }) => {
		const text = toString(tree);
		const readingTime = Math.ceil(getReadingTime(text).minutes);

		data.astro.frontmatter.readingTime = readingTime;
	};
}
