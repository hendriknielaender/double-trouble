import { expect, test } from "@playwright/test";

test("tag chips filter the archive in place", async ({ page }) => {
  await page.goto("/blog");
  const rows = page.locator(".archive li:visible");
  const total = await rows.count();
  const chip = page.locator('[data-filter="zig"]');

  await chip.click();
  await expect(page).toHaveURL(/\/blog\?tag=zig$/);
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(3);
  await expect(page.locator("[data-filter-status]")).toContainText(
    "3 posts tagged zig",
  );

  await chip.click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(rows).toHaveCount(total);
});

test("a tag in the query string preselects the filter", async ({ page }) => {
  await page.goto("/blog?tag=zig");
  await expect(page.locator(".archive li:visible")).toHaveCount(3);
});

test("archive rows show the post thumbnail", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".archive img.thumb").first()).toBeVisible();
});
