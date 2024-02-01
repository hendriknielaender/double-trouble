import { getImage } from "astro:assets";

const load = async () => {
	let images = undefined;
	try {
		images = import.meta.glob(
			"~/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}",
		);
	} catch (e) {
		// continue regardless of error
	}
	return images;
};

let _images = undefined;

/** */
export const fetchLocalImages = async () => {
	_images = _images || (await load());
	return _images;
};

/** */
export const findImage = async (imagePath) => {
	// Not string
	if (typeof imagePath !== "string") {
		return imagePath;
	}

	// Absolute paths
	if (
		imagePath.startsWith("http://") ||
		imagePath.startsWith("https://") ||
		imagePath.startsWith("/")
	) {
		return imagePath;
	}

	// Relative paths or not "~/assets/"
	if (!imagePath.startsWith("~/assets/images")) {
		return imagePath;
	}

	const images = await fetchLocalImages();
	const key = imagePath.replace("~/", "/src/");

	return images && typeof images[key] === "function"
		? (await images[key]()).default
		: null;
};

/** */
export const adaptOpenGraphImages = async (
	openGraph = {},
	astroSite = new URL(""),
) => {
	if (!openGraph?.images?.length) {
		return openGraph;
	}

	const images = openGraph.images;
	const defaultWidth = 1200;
	const defaultHeight = 626;

	const adaptedImages = await Promise.all(
		images.map(async (image) => {
			if (image?.url) {
				const resolvedImage = await findImage(image.url);
				if (!resolvedImage) {
					return {
						url: "",
					};
				}

				const _image = await getImage({
					src: resolvedImage,
					alt: "Placeholder alt",
					width: image?.width || defaultWidth,
					height: image?.height || defaultHeight,
				});

				if (typeof _image === "object") {
					return {
						url:
							typeof _image.src === "string"
								? String(new URL(_image.src, astroSite))
								: "pepe",
						width: typeof _image.width === "number" ? _image.width : undefined,
						height:
							typeof _image.height === "number" ? _image.height : undefined,
					};
				}
				return {
					url: "",
				};
			}

			return {
				url: "",
			};
		}),
	);

	return { ...openGraph, ...(adaptedImages ? { images: adaptedImages } : {}) };
};
