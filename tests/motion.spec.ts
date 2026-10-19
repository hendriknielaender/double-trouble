import { expect, type Page, test } from "@playwright/test";

type Reveal = Event & { viewTransition?: ViewTransition };
type Snapshot = { layers: string[]; fieldReady: boolean; fieldOpacity: string };

const recordReveal = (page: Page) =>
  page.addInitScript(() => {
    addEventListener("pagereveal", (event) => {
      const transition = (event as Reveal).viewTransition;
      if (!transition) return;
      let layers: string[] = [];
      transition.ready
        .then(() => {
          layers = document
            .getAnimations()
            .map(
              (animation) =>
                (animation.effect as KeyframeEffect).pseudoElement ?? "",
            );
        })
        .catch(() => {});
      transition.finished.then(() => {
        const field = document.querySelector("canvas[data-field]");
        const snapshot: Snapshot = {
          layers,
          fieldReady: field?.hasAttribute("data-ready") ?? false,
          fieldOpacity: field ? getComputedStyle(field).opacity : "",
        };
        Object.assign(window, { reveal: snapshot });
      });
    });
  });

const readReveal = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { reveal?: Snapshot }).reveal ?? null,
  );

test("cards carry no transition names at rest", async ({ page }) => {
  await page.goto("/");
  const names = await page
    .locator("[data-morph]")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).viewTransitionName),
    );
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names)).toEqual(new Set(["none"]));
});

test("opening a post morphs its card image into the hero", async ({ page }) => {
  await recordReveal(page);
  await page.goto("/");
  await page.locator(".card h3 a").first().click();
  await expect(page.locator("figure.hero img")).toBeVisible();
  await expect.poll(() => readReveal(page)).not.toBeNull();
  const reveal = await readReveal(page);
  expect(reveal?.layers).toContain("::view-transition-old(post-image)");
  expect(reveal?.layers).toContain("::view-transition-new(post-image)");
});

test("going back morphs the hero into its card", async ({ page }) => {
  await recordReveal(page);
  await page.goto("/");
  await page.locator(".card h3 a").first().click();
  await expect(page.locator("figure.hero img")).toBeVisible();
  await expect.poll(() => readReveal(page)).not.toBeNull();
  await page.goBack();
  await expect(page.locator(".card").first()).toBeVisible();
  await expect.poll(() => readReveal(page)).not.toBeNull();
  const reveal = await readReveal(page);
  expect(reveal?.layers).toContain("::view-transition-old(post-image)");
  expect(reveal?.layers).toContain("::view-transition-new(post-image)");
});

test("the background stays lit across navigations", async ({ page }) => {
  await recordReveal(page);
  await page.goto("/");
  await expect(page.locator("[data-field]")).toHaveAttribute("data-ready", "");
  await page.locator(".card h3 a").first().click();
  await expect.poll(() => readReveal(page)).not.toBeNull();
  expect(await readReveal(page)).toMatchObject({
    fieldReady: true,
    fieldOpacity: "1",
  });
});

test("the home intro plays once per session", async ({ page }) => {
  await page.goto("/");
  const fist = page.locator("[data-bump]").first();
  expect(
    await fist.evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  await page.goto("/about");
  await page.goto("/");
  expect(await fist.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
});
