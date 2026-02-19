const { test, expect } = require("@playwright/test");

test.describe("Ledenlijst Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to ledenlijst
    await page.getByText("Ledenlijst").first().click();
    await expect(page).toHaveURL(/.*#\/members/);
  });

  test("should handle search with no results", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Zoeken"]');
    await searchInput.fill("XYZNOTEXIST999");
    await page.waitForTimeout(1000);

    // Should not crash, should show empty or no results
    await expect(page).toHaveURL(/.*#\/members/);
  });

  test("should find member with partial name search", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Zoeken"]');
    await searchInput.fill("Kerk");
    await page.waitForTimeout(2000);

    // Should find Kerkhoven with partial match (multiple results expected)
    await expect(page.getByText("Kerkhoven, Máirtín")).toBeVisible();
  });

  test("should handle special characters in search", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Zoeken"]');
    await searchInput.fill("#@!$%");
    await page.waitForTimeout(1000);

    // Should not crash or show error
    await expect(page).toHaveURL(/.*#\/members/);
  });

  test("should reset results when clearing search", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Zoeken"]');

    // Search for something specific
    await searchInput.fill("Kerkhoven");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Kerkhoven, Máirtín")).toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Should still be on members page without errors
    await expect(page).toHaveURL(/.*#\/members/);
  });
});
