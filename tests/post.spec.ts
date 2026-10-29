import { expect, test } from "@playwright/test";

test("post shows hero image, contents and sharing", async ({
  page,
  isMobile,
}) => {
  await page.goto("/post/cloudflare-2025-review");
  const hero = page.locator("figure img").first();
  await expect(hero).toBeVisible();
  expect(
    await hero.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  const toc = isMobile
    ? page.locator("details.toc")
    : page.locator("nav.toc.aside");
  await expect(toc).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(page.locator("[data-prose] img").first()).toHaveAttribute(
    "loading",
    "lazy",
  );
});

test("code blocks get a copy button", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/post/zvm");
  const block = page.locator(".code-block").first();
  await block.hover();
  const button = block.locator("button.copy");
  await expect(button).toHaveAccessibleName("Copy code");
  await button.click();
  await expect(button).toHaveAttribute("aria-label", "Copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("CommandData");
});

test("code blocks name their language and run wider than the text", async ({
  page,
}) => {
  await page.goto("/post/zvm");
  const block = page.locator(".code-block").first();
  await expect(block).toHaveAttribute("data-language", "zig");
  await expect(block.locator(".lang")).toHaveText("zig");
  const width = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => element.getBoundingClientRect().width);
  expect(await width(".code-block")).toBeGreaterThan(
    await width("[data-prose] > p"),
  );
});

test("the contents rail counts down the minutes left", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "the rail only shows beside the article");
  await page.goto("/post/cloudflare-2025-review");
  const left = page.locator("[data-toc-left]");
  await expect(left).toHaveText(/^\d+ min left$/);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(left).toHaveText("Thanks for reading");
});

test("section headings link to themselves", async ({ page }) => {
  await page.goto("/post/cloudflare-2025-review");
  const heading = page.locator("[data-prose] h2").first();
  const id = await heading.getAttribute("id");
  expect(id).toBeTruthy();
  await expect(heading.locator("a.anchor")).toHaveAttribute("href", `#${id}`);
});

test("charts render without client libraries", async ({ page }) => {
  await page.goto("/post/software-engineering-hamburg-2024");
  await expect(page.locator("[data-chart]")).toHaveCount(6);
  await expect(page.locator('[data-chart="pie"] circle')).toHaveCount(2);
  await expect(page.locator('[data-chart="bar"] li').first()).toContainText(
    "JavaScript",
  );
  await expect(page.locator('[data-chart="line"] path')).toHaveCount(2);
});

test("ambient field is decorative and starts", async ({ page }) => {
  await page.goto("/");
  const field = page.locator("canvas[data-field]");
  await expect(field).toHaveAttribute("aria-hidden", "true");
  await expect(field).toHaveAttribute("data-ready", "");
});
