const { test, expect, devices } = require("@playwright/test");
const {
  initHelpers,
  showInstruction,
  hideInstruction,
  tapElement,
  holdElement,
  logTimestamp,
  login,
} = require("./helpers");

test.use({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  video: "on",
});

test.setTimeout(200000);

test.describe("Wachtwoord aanpassen (Mobile)", () => {
  test("should demonstrate changing password", async ({ page }) => {
    const startTime = Date.now(); // Start timer immediately — matches video recording start

    // Silent login — not recorded
    await login(page);

    // Wait for dashboard to be ready, then pause 1s before starting
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

    // Re-inject helpers after navigation
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Hold right arrow until Wachtwoord tab appears
    // TTS: "Vervolgens houdt u het pijltje naar rechts ingedrukt totdat u het tabblad 'Wachtwoord' ziet verschijnen."
    await showInstruction(
      page,
      "Vervolgens houdt u het pijltje naar rechts ingedrukt totdat u het tabblad 'Wachtwoord' ziet verschijnen."
    );
    logTimestamp(startTime, 3, "Hold rechter pijl");
    await page.waitForTimeout(2500);

    const rightArrow = page.locator(".q-tabs__arrow--right");
    await rightArrow.waitFor({ state: "visible" });
    await holdElement(page, rightArrow, 1500);
    await page.waitForTimeout(500);

    // Clip 4: Tap Wachtwoord tab
    // TTS: "Klik hierop."
    await showInstruction(page, "Klik hierop.");
    logTimestamp(startTime, 4, "Klik Wachtwoord tab");
    await page.waitForTimeout(500);

    const wachtwoordTab = page.getByRole("tab", { name: "Wachtwoord" });
    await tapElement(page, wachtwoordTab);
    await page.waitForTimeout(1000);

    // Clip 5: Fill new password
    // TTS: "Voer uw nieuwe wachtwoord in die voldoet aan de eisen."
    await showInstruction(
      page,
      "Voer uw nieuwe wachtwoord in die voldoet aan de eisen."
    );
    logTimestamp(startTime, 5, "Nieuw wachtwoord");
    await page.waitForTimeout(500);

    const newPasswordField = page.getByRole("textbox", {
      name: "Wachtwoord",
      exact: true,
    });
    await tapElement(page, newPasswordField);
    await newPasswordField.fill("NewTest543@!");
    await page.waitForTimeout(800);

    // Clip 6: Fill confirm field — mention opslaan but do NOT click it
    // TTS: "Herhaal het wachtwoord nog een keer om te bevestigen en klik vervolgens op 'Wachtwoord opslaan'."
    await showInstruction(
      page,
      "Herhaal het wachtwoord nog een keer om te bevestigen en klik vervolgens op 'Wachtwoord opslaan'."
    );
    logTimestamp(startTime, 6, "Bevestig wachtwoord");
    await page.waitForTimeout(500);

    const confirmField = page.getByRole("textbox", {
      name: "Wachtwoord controle",
    });
    await tapElement(page, confirmField);
    await confirmField.fill("NewTest543@!");
    await page.waitForTimeout(1500); // Save button becomes active

    // Clip 7: Success — show with save button active, but do NOT click save
    // TTS: "U heeft nu succesvol uw wachtwoord gewijzigd!"
    await showInstruction(page, "U heeft nu succesvol uw wachtwoord gewijzigd!");
    logTimestamp(startTime, 7, "Gewijzigd");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);

    // Note: Save button is intentionally NOT clicked to preserve test account password
  });
});
