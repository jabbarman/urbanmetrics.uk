import { expect, test } from "@playwright/test";

test("overview and map workspaces render their current journeys", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /urban metrics uk/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open regional context/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /open health access/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /open midlands context/i }).first()).toBeVisible();

  await page.goto("/midlands-context", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /explore comparable neighbourhood context/i })).toBeVisible();
  await expect(page.getByText(/East Midlands \+ West Midlands; LSOA 2021/i).first()).toBeVisible();
  await expect(page.getByText(/Legend breaks are calculated across the full two-region scope/i)).toBeVisible();
  await page.getByLabel(/jump to a midlands place/i).selectOption("nottingham");
  await expect(page.getByLabel(/jump to a midlands place/i)).toHaveValue("nottingham");
  await page.getByLabel(/jump to a midlands place/i).selectOption("leicester");
  await expect(page.getByLabel(/jump to a midlands place/i)).toHaveValue("leicester");

  await page.goto("/regional-context", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/layer controls/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /choose what the map emphasises/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Status$/ })).toBeVisible();

  await page.goto("/health-access", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /explore talking therapies access/i })).toBeVisible();
  await expect(page.getByText("2026-07-31").first()).toBeVisible({ timeout: 20_000 });
});
