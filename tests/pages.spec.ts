import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/blog",
  "/about",
  "/legal",
  "/privacy",
  "/tag/aws",
  "/post/cloudflare-2025-review",
  "/post/best-iac-2023",
];

for (const path of pages) {
  test(`${path} renders one heading, metadata and no errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Double Trouble/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/double-trouble\.dev/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:/,
    );
    expect(errors).toEqual([]);
  });
}

test("unknown routes show the not found page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page is in trouble.");
});

test("home lists featured posts and links to the archive", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("#featured ~ * article, section:has(#featured) article"),
  ).toHaveCount(4);
  await page.getByRole("link", { name: "All writing" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.locator(".archive li")).not.toHaveCount(0);
});

test("feeds and legacy links resolve", async ({ request, page }) => {
  const rss = await request.get("/rss.xml");
  expect(rss.ok()).toBeTruthy();
  expect(await rss.text()).toContain("<item>");
  const sitemap = await request.get("/sitemap-index.xml");
  expect(sitemap.ok()).toBeTruthy();
  await page.goto("/post/product_engineers");
  await expect(page).toHaveURL(/\/post\/product-engineers$/);
});
