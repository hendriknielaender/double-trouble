import { expect, test } from "@playwright/test";

test.describe("No White Flash on Dark Mode", () => {
  test("should not show white flash when loading page in dark mode", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });

    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const computedStyle = window.getComputedStyle(document.documentElement);
        const bgColor = computedStyle.backgroundColor;
        if (!window.bgColors) window.bgColors = [];
        window.bgColors.push(bgColor);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const initialBgColor = window.getComputedStyle(
        document.documentElement,
      ).backgroundColor;
      window.bgColors = [initialBgColor];
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.waitForFunction(() => {
      return document.documentElement.classList.length > 0;
    });

    const hasLightClass = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClass).toBeFalsy();

    const capturedColors = await page.evaluate(() => window.bgColors || []);

    const hasWhiteBackground = capturedColors.some(
      (color) =>
        color.includes("255, 255, 255") ||
        color === "rgb(255, 255, 255)" ||
        color === "white",
    );

    expect(hasWhiteBackground).toBeFalsy();
  });

  test("should apply dark theme immediately on page load", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });

    let initialLoad = true;

    page.on("domcontentloaded", async () => {
      if (initialLoad) {
        initialLoad = false;
        const hasLightClass = await page
          .locator("html")
          .evaluate((el) => el.classList.contains("light"));
        expect(hasLightClass).toBeFalsy();
      }
    });

    await page.goto("/");

    const hasLightClassFinal = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClassFinal).toBeFalsy();

    await expect(page.locator("#content")).toHaveClass(/bg-dark-svg/);
  });

  test("should handle initial theme application timing", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");

      window.themeTimings = [];

      const originalAddEventListener = document.addEventListener;
      document.addEventListener = function (type, listener, options) {
        if (type === "DOMContentLoaded") {
          window.themeTimings.push({
            event: "DOMContentLoaded",
            hasLightClass: document.documentElement.classList.contains("light"),
          });
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });

    await page.goto("/");

    const timings = await page.evaluate(() => window.themeTimings || []);

    const domContentLoadedTiming = timings.find(
      (t) => t.event === "DOMContentLoaded",
    );
    if (domContentLoadedTiming) {
      expect(domContentLoadedTiming.hasLightClass).toBeFalsy();
    }

    const hasLightClassTimingFinal = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("light"));
    expect(hasLightClassTimingFinal).toBeFalsy();
  });
});
