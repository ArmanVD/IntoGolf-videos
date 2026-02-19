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

test.describe("Uitloggen (Mobile)", () => {
  test("should demonstrate logging out", async ({ page }) => {
    const startTime = Date.now();

    // Silent login — not recorded
    await login(page);

    // Wait for dashboard to be ready
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard — open menu
    // TTS: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen."
    await showInstruction(
      page,
      "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen."
    );
    logTimestamp(startTime, 1, "Dashboard open menu");
    await page.waitForTimeout(2500);

    const menuBtn = page.locator("text=menu").first();
    await tapElement(page, menuBtn);
    await page.waitForTimeout(2000); // Drawer animation

    // Clip 2: Tap Account from drawer
    // TTS: "Klik vervolgens op 'Account'."
    await showInstruction(page, "Klik vervolgens op 'Account'.");
    logTimestamp(startTime, 2, "Account in menu");
    await page.waitForTimeout(500);

    const accountItem = page
      .locator(".q-drawer")
      .getByText("Account", { exact: true });
    await tapElement(page, accountItem, { force: true });
    await expect(page).toHaveURL(/.*#\/profile/);

    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Scroll down and tap Uitloggen button
    // TTS: "Om uit te loggen scrolt u naar beneden en klikt u op de 'Uitloggen'-knop."
    // Move overlay higher so it doesn't cover the Uitloggen button at the bottom
    await page.evaluate(() => {
      const overlay = document.getElementById("igo-instruction");
      if (overlay) overlay.style.bottom = "220px";
    });
    await showInstruction(
      page,
      "Om uit te loggen scrolt u naar beneden en klikt u op de 'Uitloggen'-knop."
    );
    logTimestamp(startTime, 3, "Uitloggen knop");
    await page.waitForTimeout(2500);

    // Scroll down visibly to reveal the Uitloggen button
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
    await page.waitForTimeout(900);

    const uitloggenBtn = page.getByRole("button", { name: "Uitloggen" });
    await uitloggenBtn.waitFor({ state: "visible" });
    await tapElement(page, uitloggenBtn);
    await expect(page).toHaveURL(/.*#\/login/);

    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 4: Success — login page shown
    // TTS: "U bent nu succesvol uitgelogd."
    await showInstruction(page, "U bent nu succesvol uitgelogd.");
    logTimestamp(startTime, 4, "Uitgelogd");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
