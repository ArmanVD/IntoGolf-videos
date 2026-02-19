const { test, expect } = require("@playwright/test");

test.describe("Handicap", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to handicap page", async ({ page }) => {
    await page.getByText("Handicap").click();

    await expect(page).toHaveURL(/.*#\/handicap/);
    await expect(page.locator("header")).toContainText("Handicap");
  });

  test("should display scorecard buttons", async ({ page }) => {
    await page.getByText("Handicap").click();
    await expect(page).toHaveURL(/.*#\/handicap/);

    // Verify the Binnenland and Buitenland buttons are visible
    await expect(page.getByRole("button", { name: "Binnenland" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Buitenland" })).toBeVisible();

    // Verify the empty state message
    await expect(page.getByText("U heeft nog geen scorekaarten")).toBeVisible();
  });

  test("should fill scorecard form up to summary", async ({ page }) => {
    await page.getByText("Handicap").click();
    await expect(page).toHaveURL(/.*#\/handicap/);

    // Click Binnenland to start new scorecard
    await page.getByRole("button", { name: "Binnenland" }).click();
    await expect(page.getByText("Nieuwe scorekaart binnenland")).toBeVisible();

    // Set date to yesterday using native input setter (date input requires YYYY-MM-DD)
    await page.evaluate(() => {
      const today = new Date();
      today.setDate(today.getDate() - 1);
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const input = document.querySelector('input[aria-label="*Datum"]');
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, dateStr);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Set time to 10:00
    await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="*Tijd"]');
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, "10:00");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Search for marker by name
    await page.getByRole("textbox", { name: "Zoek marker" }).fill("Kerkhoven");
    await page.getByRole("button", { name: "Zoeken" }).click();

    // Select Máirtín Kerkhoven (GSN: NL37336652) from search results
    await page.getByText("Máirtín Kerkhoven").click();

    // Verify marker was set and confirmed
    await expect(
      page.getByText("Relatie in baan administratie gevonden")
    ).toBeVisible();

    // Click Baan to proceed
    await page.getByRole("button", { name: "Baan" }).click();

    // Verify course is pre-selected (Noordwijkse)
    await expect(page.getByText("Noordwijkse")).toBeVisible();

    // Click Lus to select loop
    await page.getByRole("button", { name: "Lus" }).click();

    // Select "18 holes"
    await page
      .getByRole("listitem")
      .filter({ hasText: /^18 holes$/ })
      .click();

    // Select "geel heren" tee
    await page
      .getByRole("listitem")
      .filter({ hasText: "geel heren" })
      .click();

    // Verify the summary page shows all correct details
    await expect(page.getByText("Nieuwe scorekaart binnenland")).toBeVisible();
    await expect(page.getByText("Noordwijkse")).toBeVisible();
    await expect(page.getByText("18 holes")).toBeVisible();
    await expect(page.getByText("geel heren")).toBeVisible();
    await expect(page.getByText("72.8 / 137 / 72")).toBeVisible();
    await expect(page.getByRole("button", { name: "Score" })).toBeVisible();

    // Note: Cannot proceed to Score entry — test user has no GSN, so the API returns 500.
    // Cancel the scorecard to clean up
    await page.locator("text=close").click();
    await expect(page.getByText("U heeft nog geen scorekaarten")).toBeVisible();
  });
});
