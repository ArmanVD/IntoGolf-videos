const { test, expect } = require("@playwright/test");

test.describe("Ledenlijst", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to ledenlijst page", async ({ page }) => {
    await page.goto("/#/members");

    await expect(page).toHaveURL(/.*#\/members/);
    await expect(page.locator("header")).toContainText("Ledenlijst");
    await expect(page.getByRole("textbox", { name: "Zoeken" })).toBeVisible();
  });

  test("should search for a member and display results", async ({ page }) => {
    await page.goto("/#/members");

    // Search for a member
    await page.getByRole("textbox", { name: "Zoeken" }).fill("Kerkhoven");
    await page.waitForTimeout(2000);

    // Verify search results appear
    await expect(page.getByText("Kerkhoven, Máirtín")).toBeVisible();
  });

  test("should open member detail and display info", async ({ page }) => {
    await page.goto("/#/members");

    // Search and click on a member
    await page.getByRole("textbox", { name: "Zoeken" }).fill("Kerkhoven");
    await page.waitForTimeout(2000);
    await expect(page.getByText("Kerkhoven, Máirtín")).toBeVisible();
    await page.getByText("Kerkhoven, Máirtín").click();

    // Verify member detail page
    await expect(page.getByText("Relatie", { exact: true })).toBeVisible();
    await expect(page.getByText("Máirtín Kerkhoven")).toBeVisible();
    await expect(page.getByText("Speelsterkte")).toBeVisible();

    // Close the detail view
    await page.getByRole("button", { name: "Sluiten" }).click();

    // Verify we're back on the search results
    await expect(page.getByRole("textbox", { name: "Zoeken" })).toBeVisible();
  });
});
