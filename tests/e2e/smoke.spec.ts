import { expect, test } from "@playwright/test";

test("overview and both map workspaces render their current journeys", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /urban metrics uk/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open regional context/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /open health access/i }).first()).toBeVisible();

  await page.goto("/regional-context");
  await expect(page.getByText(/layer controls/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /choose what the map emphasises/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Status$/ })).toBeVisible();

  await page.goto("/health-access");
  await expect(page.getByRole("heading", { name: /explore talking therapies access/i })).toBeVisible();
  await expect(page.getByText("2026-05-31").first()).toBeVisible({ timeout: 20_000 });
});
