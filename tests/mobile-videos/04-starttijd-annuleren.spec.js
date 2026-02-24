const { test, expect, devices } = require("@playwright/test");
const {
  BASE_URL,
  initHelpers,
  showInstruction,
  hideInstruction,
  tapElement,
  logTimestamp,
  login,
} = require("./helpers");

test.use({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  video: "on",
});

test.setTimeout(200000);

test.describe("Starttijd annuleren (Mobile)", () => {
  test("should demonstrate canceling a tee time", async ({ page }) => {
    const startTime = Date.now(); // Start timer immediately — matches video recording start

    // Silent login — not recorded
    await login(page);

    // Silent pre-booking: book a tee time 2 days ahead to ensure there's always something to cancel
    await page.goto(`${BASE_URL}/#/reservations`);
    await page.getByRole("button", { name: "Nieuwe starttijd" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Nieuwe starttijd" }).click();
    await page.waitForTimeout(1500);
    const rightArrow = page.locator("text=chevron_right").first();
    await rightArrow.click();
    await page.waitForTimeout(800);
    await rightArrow.click();
    await page.waitForTimeout(1500);
    const firstSlot = page.locator("text=/\\d{2}:\\d{2}/").first();
    await firstSlot.click();
    await page.waitForTimeout(1000);
    const reserveerBtn = page.getByRole("button", { name: "Reserveer" });
    if (await reserveerBtn.isVisible()) {
      await reserveerBtn.click();
      await page.waitForTimeout(2000);
    }

    // Navigate back to dashboard to start the recorded flow
    await page.goto(`${BASE_URL}/#/`);
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard — open menu
    // TTS: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu."
    await showInstruction(
      page,
      "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu."
    );
    logTimestamp(startTime, 1, "Dashboard open menu");
    await page.waitForTimeout(2500);

    const menuBtn = page.locator("text=menu").first();
    await tapElement(page, menuBtn);
    await page.waitForTimeout(2000); // Drawer animation

    // Clip 2: Tap Starttijden from drawer
    // TTS: "Klik vervolgens op 'Starttijden'."
    await showInstruction(page, "Klik vervolgens op 'Starttijden'.");
    logTimestamp(startTime, 2, "Starttijden in menu");
    await page.waitForTimeout(500);

    const starttijdenItem = page
      .locator(".q-drawer")
      .getByText("Starttijden", { exact: true });
    await tapElement(page, starttijdenItem, { force: true });
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Re-inject helpers after navigation
    await initHelpers(page);

    // Wait for reservations list to load
    await page.getByRole("listitem").first().waitFor({ state: "visible" });
    await page.waitForTimeout(1000);

    // Clip 3: Tap the booking to cancel (last = furthest in future)
    // TTS: "Klik nu op de boeking die u wilt annuleren."
    await showInstruction(page, "Klik nu op de boeking die u wilt annuleren.");
    logTimestamp(startTime, 3, "Selecteer boeking");
    await page.waitForTimeout(500);

    const lastBooking = page.getByRole("listitem").last();
    await tapElement(page, lastBooking);

    // Re-inject helpers after navigation to detail page
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 4: Detail page — tap Annuleer Flight
    // TTS: "U bent nu op de detail pagina van uw boeking gekomen. Klik op 'Annuleer Flight' om de boeking te annuleren."
    await showInstruction(
      page,
      "U bent nu op de detail pagina van uw boeking gekomen. Klik op 'Annuleer Flight' om de boeking te annuleren."
    );
    logTimestamp(startTime, 4, "Annuleer Flight");
    await page.waitForTimeout(4500);

    const annuleerBtn = page.getByText("Annuleer flight", { exact: true });
    await tapElement(page, annuleerBtn, { force: true });
    await page.waitForTimeout(1500); // Dialog opens

    // Clip 5: Confirmation dialog — tap OK
    // TTS: "Klik vervolgens op 'Ok' om de annulering te bevestigen."
    await showInstruction(
      page,
      "Klik vervolgens op 'Ok' om de annulering te bevestigen."
    );
    logTimestamp(startTime, 5, "Bevestig OK");
    await page.waitForTimeout(500);

    const okBtn = page.getByRole("button", { name: "OK" });
    await okBtn.waitFor({ state: "visible" });
    await tapElement(page, okBtn);
    await page.waitForTimeout(2000);

    // Re-inject helpers after navigation back to list
    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 6: Success
    // TTS: "U heeft nu succesvol uw starttijd geannuleerd!"
    await showInstruction(page, "U heeft nu succesvol uw starttijd geannuleerd!");
    logTimestamp(startTime, 6, "Geannuleerd");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
