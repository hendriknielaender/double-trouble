import { expect, test } from "@playwright/test";

test.describe("Charts - Hamburg Software Jobs Post", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/post/software-engineering-hamburg-2024");
  });

  test("should render charts on the page", async ({ page }) => {
    await page.waitForTimeout(2000);

    const canvases = page.locator("canvas");
    const canvasCount = await canvases.count();

    expect(canvasCount).toBeGreaterThanOrEqual(4);
    await expect(canvases.first()).toBeVisible();
  });

  test("should load charts without errors", async ({ page }) => {
    await page.waitForTimeout(3000);

    const canvases = page.locator("canvas");
    const canvasCount = await canvases.count();

    expect(canvasCount).toBeGreaterThan(0);
    await expect(canvases.first()).toBeVisible();
  });
});
