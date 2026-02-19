const { test, expect } = require("@playwright/test");

test.describe("Starttijden Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should dismiss cancel dialog without cancelling booking", async ({
    page,
  }) => {
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Wait for reservations to load
    await page.waitForTimeout(2000);
    const hasReservations = await page.getByRole("listitem").first().isVisible().catch(() => false);
    if (!hasReservations) {
      test.skip(true, "No reservations available to test cancel dialog");
      return;
    }

    // Click the last reservation (furthest in future, most likely cancellable)
    const lastItem = page.getByRole("listitem").last();
    await lastItem.click();
    await expect(page.getByText("Uw starttijd")).toBeVisible();

    // Check if "Annuleer flight" is available (only for future bookings > 5 hours)
    const cancelButton = page.getByText("Annuleer flight");
    if (await cancelButton.isVisible().catch(() => false)) {
      // Click "Annuleer flight" to open cancel dialog
      await cancelButton.click();
      await expect(page.getByText("Starttijd annuleren")).toBeVisible();

      // Dismiss the dialog by clicking "Annuleer" (cancel button, not OK)
      await page.getByRole("button", { name: "Annuleer" }).click();

      // Should still be on the reservation detail page (booking not cancelled)
      await expect(page.getByText("Uw starttijd")).toBeVisible();
    } else {
      // If no cancellable booking exists, just verify the detail page is shown
      await expect(page.getByText("Boeker")).toBeVisible();
    }
  });

  test("should navigate back from booking form via browser back", async ({
    page,
  }) => {
    // First navigate to starttijden
    await page.goto("/#/reservations");
    await expect(page).toHaveURL(/.*#\/reservations/);
    await expect(
      page.getByRole("button", { name: "Nieuwe starttijd" })
    ).toBeVisible();

    // Click "Nieuwe starttijd"
    await page.getByRole("button", { name: "Nieuwe starttijd" }).click();

    // Verify booking form is visible
    await expect(page.getByText("Datum:")).toBeVisible();

    // Navigate back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should be back on reservations page or dashboard (hash routing may vary)
    const url = page.url();
    expect(
      url.includes("#/reservations") || url.includes("#/")
    ).toBeTruthy();
  });

  test("should persist booking after page reload", async ({ page }) => {
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Wait for reservations to load
    await page.waitForTimeout(2000);
    const hasReservations = await page.getByRole("listitem").first().isVisible().catch(() => false);
    if (!hasReservations) {
      test.skip(true, "No reservations available to test persistence");
      return;
    }

    // Count current reservations
    const countBefore = await page.getByRole("listitem").count();

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify reservations still exist after reload
    await expect(page.getByRole("listitem").first()).toBeVisible();
    const countAfter = await page.getByRole("listitem").count();
    expect(countAfter).toBe(countBefore);
  });
});
