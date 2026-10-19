import { expect, test } from "@playwright/test";

const theme = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

test("follows the system preference until the reader chooses", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await theme(page)).toBe("light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  expect(await theme(page)).toBe("dark");
});

test("toggle switches and persists the theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const toggle = page.locator("[data-theme-toggle]");
  await expect(toggle).toHaveAttribute("aria-label", "Switch to light theme");
  const html = page.locator("html");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
    "light",
  );
  await page.goto("/about");
  expect(await theme(page)).toBe("light");
  await page.locator("[data-theme-toggle]").click();
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("dark readers never see a light frame", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { firstPaint: string }).firstPaint =
        getComputedStyle(document.documentElement).backgroundColor;
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const background = await page.evaluate(
    () => (window as unknown as { firstPaint: string }).firstPaint,
  );
  expect(background).toBe("rgb(11, 13, 19)");
});
