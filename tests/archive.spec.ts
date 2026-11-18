import { expect, test } from "@playwright/test";

test("archive rows show the post thumbnail", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".archive img.thumb").first()).toBeVisible();
});
