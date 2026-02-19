const { test, expect } = require("@playwright/test");

test.describe("Profile Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to profile
    await page.getByText("Profiel").first().click();
    await expect(page).toHaveURL(/.*#\/profile/);
  });

  test("should not persist unsaved preference changes after page reload", async ({
    page,
  }) => {
    // Go to Voorkeuren tab
    await page.getByRole("tab", { name: "Voorkeuren" }).click();

    // Get current value
    const dropdown = page.getByRole("combobox", {
      name: "Zichtbaarheid in ledenboekje",
    });
    const originalValue = await dropdown.inputValue();

    // Change to a different value (without saving)
    const newValue =
      originalValue === "Niet zichtbaar"
        ? "Naam en speelsterkte"
        : "Niet zichtbaar";
    await dropdown.click();
    await page.getByRole("option", { name: newValue }).click();

    // Reload page without saving
    await page.reload();
    await page.waitForTimeout(2000);

    // Navigate back to Voorkeuren
    await page.getByRole("tab", { name: "Voorkeuren" }).click();

    // Value should be the original (unsaved change lost)
    const currentValue = await dropdown.inputValue();
    expect(currentValue).toBe(originalValue);
  });

  test("should handle saving without making changes", async ({ page }) => {
    // Go to Voorkeuren tab
    await page.getByRole("tab", { name: "Voorkeuren" }).click();

    // Click Opslaan without changing anything
    await page.getByRole("button", { name: "Opslaan" }).click();

    // Should not crash or show error — page should remain functional
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*#\/profile/);
    await expect(
      page.getByRole("tab", { name: "Voorkeuren" })
    ).toBeVisible();
  });

  test("should have multiple visibility dropdown options", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Voorkeuren" }).click();

    const dropdown = page.getByRole("combobox", {
      name: "Zichtbaarheid in ledenboekje",
    });

    // Click dropdown to open it
    await dropdown.click();
    await page.waitForTimeout(500);

    // Quasar renders options in a popup — count the items in the dropdown menu
    const options = page.locator(".q-item[role='option']");
    const optionCount = await options.count();

    // There should be at least 2 options
    expect(optionCount).toBeGreaterThanOrEqual(2);

    // Close dropdown
    await page.keyboard.press("Escape");
  });

  test("should show Wachtwoord tab with requirements and fields", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Wachtwoord" }).click();

    // Verify password requirements message
    await expect(
      page.getByText("Een wachtwoord moet minimaal 6 karakters lang zijn")
    ).toBeVisible();

    // Verify both fields and disabled save button
    await expect(
      page.getByRole("textbox", { name: "Wachtwoord", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Wachtwoord controle" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Wachtwoord opslaan" })
    ).toBeDisabled();
  });

  test("should show validation error for weak password", async ({ page }) => {
    await page.getByRole("tab", { name: "Wachtwoord" }).click();

    // Type a password that doesn't meet requirements (too short, no uppercase, no number)
    await page
      .getByRole("textbox", { name: "Wachtwoord", exact: true })
      .fill("abc");

    // Should show validation error
    await expect(
      page.getByText("Wachtwoord voldoet nog niet aan eisen")
    ).toBeVisible();

    // Save button should remain disabled
    await expect(
      page.getByRole("button", { name: "Wachtwoord opslaan" })
    ).toBeDisabled();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.getByRole("tab", { name: "Wachtwoord" }).click();

    // Fill valid password
    await page
      .getByRole("textbox", { name: "Wachtwoord", exact: true })
      .fill("Test123");

    // Fill different confirmation
    await page
      .getByRole("textbox", { name: "Wachtwoord controle" })
      .fill("Different123");

    // Should show mismatch error
    await expect(
      page.getByText("Wachtwoorden zijn niet gelijk")
    ).toBeVisible();

    // Save button should remain disabled
    await expect(
      page.getByRole("button", { name: "Wachtwoord opslaan" })
    ).toBeDisabled();
  });

  test("should enable save button when passwords match and meet requirements", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Wachtwoord" }).click();

    // Fill valid password
    await page
      .getByRole("textbox", { name: "Wachtwoord", exact: true })
      .fill("Test123");

    // Fill matching confirmation
    await page
      .getByRole("textbox", { name: "Wachtwoord controle" })
      .fill("Test123");

    // Save button should now be enabled (but we don't click it!)
    await expect(
      page.getByRole("button", { name: "Wachtwoord opslaan" })
    ).toBeEnabled();

    // No validation errors should be visible
    await expect(
      page.getByText("Wachtwoord voldoet nog niet aan eisen")
    ).not.toBeVisible();
    await expect(
      page.getByText("Wachtwoorden zijn niet gelijk")
    ).not.toBeVisible();
  });
});
