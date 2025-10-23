import { expect, test } from "@playwright/test";

test.describe("React Table - Infrastructure Tools Post", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/post/best-iac-2023");
  });

  test("should render the ranking table", async ({ page }) => {
    await page.waitForSelector("table", { timeout: 10000 });

    const table = page.locator("table");
    await expect(table).toBeVisible();

    await expect(page.locator("th")).toContainText([
      "Tool",
      "Github Stars",
      "Total",
    ]);
  });

  test("should have clickable sorting and weight buttons", async ({ page }) => {
    await page.waitForSelector("table");

    const sortableHeaders = page.locator("th div.cursor-pointer");
    const headerCount = await sortableHeaders.count();
    expect(headerCount).toBeGreaterThan(0);

    await sortableHeaders.first().click();
    const sortIndicators = page.locator("th").filter({ hasText: /[🔼🔽]/u });
    const count = await sortIndicators.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const weightButtons = page
      .locator("button")
      .filter({ hasText: /Popularity:|Speed:|DX:/ });
    const buttonCount = await weightButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    await weightButtons.first().click();
  });
});
