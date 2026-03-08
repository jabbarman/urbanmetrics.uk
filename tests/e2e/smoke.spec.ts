import { expect, test } from "@playwright/test";

test("homepage renders map controls and status link", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /west midlands signals/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /layer controls/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /status/i })).toBeVisible();
});
