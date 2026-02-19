const { test, expect, devices } = require("@playwright/test");
const {
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

test.describe("Starttijd boeken (Mobile)", () => {
  test("should demonstrate booking a tee time", async ({ page }) => {
    const startTime = Date.now(); // Start timer immediately — matches video recording start

    // Silent login — not recorded
    await login(page);

    // Wait for dashboard to be ready, then pause 1s before starting
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard — open menu
    // Display text uses correct Dutch spelling
    // TTS text: "Wanneer u ingelogd bent, start u op het dashboard. Klik links-boven op het menu-ikoon-tje, hier-mee opent u het menu."
    await showInstruction(
      page,
      "Wanneer u ingelogd bent, start u op het dashboard. Klik linksoven op het menu-icoontje, hiermee opent u het menu."
    );
    logTimestamp(startTime, 1, "Dashboard open menu");
    await page.waitForTimeout(2500);

    const menuBtn = page.locator("text=menu").first();
    await tapElement(page, menuBtn);
    await page.waitForTimeout(2000); // Drawer animation

    // Clip 2: Tap Starttijden from drawer
    // TTS text: "Klik vervolgens op 'start-tij-den'."
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
    await page.waitForTimeout(1500);

    // Clip 3: Tap "Nieuwe starttijd"
    // TTS text: "Klik nu op 'Nieuwe starttijd'."
    await showInstruction(page, "Klik nu op 'Nieuwe starttijd'.");
    logTimestamp(startTime, 3, "Nieuwe starttijd");
    await page.waitForTimeout(500);

    const nieuweStarttijdBtn = page.getByRole("button", {
      name: "Nieuwe starttijd",
    });
    await tapElement(page, nieuweStarttijdBtn);

    // Re-inject helpers after navigation
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 4: Navigate forward 2 days using right arrow
    // TTS text: "Door boven op de pijl-tjes te klikken kunt u een nieuwe datum krijgen, of u klikt op de datum zelf om de kalender te openen."
    await showInstruction(
      page,
      "Door boven op de pijltjes te klikken kunt u een nieuwe datum krijgen, of u klikt op de datum zelf om de kalender te openen."
    );
    logTimestamp(startTime, 4, "Datum navigatie");
    await page.waitForTimeout(4000);

    const rightArrow = page.locator("text=chevron_right").first();
    await tapElement(page, rightArrow);
    await page.waitForTimeout(1000);
    await tapElement(page, rightArrow);
    await page.waitForTimeout(1500);

    // Clip 5: Select a time slot
    // TTS text: "Wanneer u een datum geselecteerd heeft, kiest u uit de lijst de tijd waarop u wilt starten."
    await showInstruction(
      page,
      "Wanneer u een datum geselecteerd heeft, kiest u uit de lijst de tijd waarop u wilt starten."
    );
    logTimestamp(startTime, 5, "Kies tijdslot");
    await page.waitForTimeout(2500);

    const timeSlot = page.locator("text=/\\d{2}:\\d{2}/").first();
    await tapElement(page, timeSlot);
    await page.waitForTimeout(2000); // Popover opens

    // Clip 6: Tap Reserveer in popover
    // TTS text: "Vervolgens klikt u op 're-ser-veer'."
    await showInstruction(page, "Vervolgens klikt u op 'Reserveer'.");
    logTimestamp(startTime, 6, "Reserveer");
    await page.waitForTimeout(500);

    const reserveerBtn = page.getByRole("button", { name: "Reserveer" });
    await tapElement(page, reserveerBtn);
    await page.waitForTimeout(2000);

    // Re-inject helpers after navigation
    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 7: Success
    // TTS text: "U heeft nu succesvol een starttijd geboekt!"
    await showInstruction(page, "U heeft nu succesvol een starttijd geboekt!");
    logTimestamp(startTime, 7, "Geboekt");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
