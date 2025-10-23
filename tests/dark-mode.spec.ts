import { expect, test } from "@playwright/test";

test.describe("Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should toggle dark mode correctly", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    let hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeTruthy();

    await page
      .locator("[data-aw-toggle-color-scheme]")
      .first()
      .dispatchEvent("click");

    hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");

    await page
      .locator("[data-aw-toggle-color-scheme]")
      .first()
      .dispatchEvent("click");
    hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeTruthy();

    const lightTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(lightTheme).toBe("light");
  });

  test("should persist theme preference across page loads", async ({
    page,
  }) => {
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();

    let hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();

    await page.goto("/about");
    hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();

    await page.goto("/");
    hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();
  });

  test("should respect system preference when no theme is set", async ({
    page,
  }) => {
    await page.evaluate(() => localStorage.clear());

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();

    let hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();

    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();

    hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeTruthy();
  });

  test("should apply correct background colors for content", async ({
    page,
  }) => {
    const content = page.locator("#content");

    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
    });
    await page.reload();

    await expect(content).toHaveClass(/bg-white-svg/);
    await expect(content).not.toHaveClass(/bg-dark-svg/);

    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
    });
    await page.reload();

    await expect(content).toHaveClass(/bg-dark-svg/);
    await expect(content).not.toHaveClass(/bg-white-svg/);
  });
});
