import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/post/best-iac-2023");
});

test("ranking sorts by column", async ({ page }) => {
  const ranking = page.locator("[data-ranking]");
  const firstTool = ranking.locator("tbody tr").first().locator("th");
  await expect(ranking.locator("tbody tr")).toHaveCount(7);
  await expect(ranking.locator('th[aria-sort="descending"]')).toContainText(
    "Total",
  );
  await ranking.getByRole("button", { name: "Tool" }).click();
  await expect(firstTool).toHaveText("CDK");
  await ranking.getByRole("button", { name: "Tool" }).click();
  await expect(firstTool).toHaveText("Terraform");
});

test("weights change the total score", async ({ page }) => {
  const ranking = page.locator("[data-ranking]");
  const total = ranking.locator('tr[data-tool="SST"] [data-score]');
  const before = await total.textContent();
  const speed = ranking.locator('[data-weight="Speed"]');
  await speed.click();
  await expect(speed).toContainText("×2");
  await expect(total).not.toHaveText(before ?? "");
});

test("notes open as popovers", async ({ page }) => {
  const note = page.getByRole("button", { name: "Note on CDK DX" });
  await note.click();
  await expect(page.locator("#note-cdk-overalldx")).toBeVisible();
});
