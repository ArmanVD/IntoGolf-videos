const { test, expect } = require("@playwright/test");

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should show all navigation tiles on mobile dashboard", async ({
    page,
  }) => {
    // Verify all navigation items are visible on mobile
    const items = [
      "Starttijden",
      "Wedstrijden",
      "Baankalender",
      "Meerronden",
      "Berichten",
      "Baanstatus",
      "Handicap",
      "NGF-Pas",
      "Lessen",
      "Ledenlijst",
      "Profiel",
      "Speelhistorie",
    ];

    for (const item of items) {
      await expect(page.getByText(item).first()).toBeVisible();
    }
  });

  test("should show menu and home buttons on subpages", async ({ page }) => {
    // Navigate to a subpage
    await page.getByText("Baanstatus").first().click();
    await expect(page).toHaveURL(/.*#\/Baanstatus/);

    // Verify toolbar has menu button and home button
    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar.locator("text=menu").first()).toBeVisible();
    await expect(toolbar.locator("text=home").first()).toBeVisible();

    // Verify page title in toolbar
    await expect(toolbar).toContainText("Baanstatus");
  });

  test("should navigate back to dashboard via menu button", async ({
    page,
  }) => {
    // Navigate to Starttijden
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Click the menu button (first button in toolbar)
    await page
      .locator('[role="toolbar"]')
      .getByRole("button")
      .first()
      .click();

    // Should be back on dashboard
    await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();
  });

  test("should navigate back to dashboard via home button", async ({
    page,
  }) => {
    // Navigate to Wedstrijden
    await page.getByText("Wedstrijden").first().click();
    await expect(page).toHaveURL(/.*#\/match/);

    // Click the home button (last button in toolbar)
    await page.locator('[role="toolbar"]').getByRole("button").last().click();

    // Should be back on dashboard
    await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();
  });

  test("should navigate to each section and back from mobile", async ({
    page,
  }) => {
    const routes = [
      { name: "Starttijden", url: /.*#\/reservations/ },
      { name: "Wedstrijden", url: /.*#\/match/ },
      { name: "Baanstatus", url: /.*#\/Baanstatus/ },
      { name: "Handicap", url: /.*#\/handicap/ },
      { name: "Ledenlijst", url: /.*#\/members/ },
      { name: "Profiel", url: /.*#\/profile/ },
    ];

    for (const route of routes) {
      // Click tile on dashboard
      await page.getByText(route.name).first().click();
      await expect(page).toHaveURL(route.url);

      // Navigate back via menu button
      await page
        .locator('[role="toolbar"]')
        .getByRole("button")
        .first()
        .click();
      await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();
    }
  });

  test("should display page content correctly at mobile width", async ({
    page,
  }) => {
    // Navigate to Baanstatus and verify content renders at mobile width
    await page.getByText("Baanstatus").first().click();
    await expect(page).toHaveURL(/.*#\/Baanstatus/);

    // Verify content is visible (not clipped or broken)
    await expect(page.getByText("Lus a")).toBeVisible();
    await expect(page.getByText("Lus b")).toBeVisible();
    await expect(page.getByText("Baan open").first()).toBeVisible();
  });
});
