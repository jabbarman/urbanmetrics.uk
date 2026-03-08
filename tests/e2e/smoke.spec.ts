import { expect, test } from "@playwright/test";

test("homepage renders map controls and status link", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /urban metrics uk/i })).toBeVisible();
  await expect(page.getByText(/layer controls/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /choose what the map emphasises/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Status$/ })).toBeVisible();
});
