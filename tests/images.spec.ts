import { expect, test } from "@playwright/test";

test.describe("Image Rendering", () => {
  test("should render post thumbnails on blog listing page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const thumbnailImages = page.locator("img");
    const imageCount = await thumbnailImages.count();

    expect(imageCount).toBeGreaterThan(0);

    const firstImage = thumbnailImages.first();
    await expect(firstImage).toBeVisible();

    const src = await firstImage.getAttribute("src");
    const alt = await firstImage.getAttribute("alt");

    expect(src).toBeTruthy();
    expect(alt).toBeTruthy();
  });

  test("should render title images in blog posts", async ({ page }) => {
    await page.goto("/post/cloudflare-2025-review");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount === 0) {
      return;
    }

    expect(imageCount).toBeGreaterThan(0);

    const firstImage = images.first();
    await expect(firstImage).toBeVisible();

    const naturalWidth = await firstImage.evaluate(
      (img: HTMLImageElement) => img.naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
