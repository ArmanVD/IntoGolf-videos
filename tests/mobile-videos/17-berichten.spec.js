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

test.describe("Berichten bekijken (Mobile)", () => {
  test("should demonstrate viewing messages", async ({ page }) => {
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
    await page.waitForTimeout(3500); // Drawer animation + gap for clip 1 TTS to finish

    // Clip 2: Tap Berichten from drawer
    // TTS: "Klik vervolgens op 'Berichten'."
    await showInstruction(page, "Klik vervolgens op 'Berichten'.");
    logTimestamp(startTime, 2, "Berichten in menu");
    await page.waitForTimeout(500);

    const berichtenItem = page
      .locator(".q-drawer")
      .getByText("Berichten", { exact: true });
    await tapElement(page, berichtenItem, { force: true });

    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 3: Show messages list — tap first message if available
    // TTS: "U ziet nu een lijst met berichten van uw club of vereniging. Klik op een bericht om deze te lezen. Als er geen berichten beschikbaar zijn, wordt dit aangegeven op het scherm."
    await showInstruction(
      page,
      "U ziet nu een lijst met berichten van uw club of vereniging. Klik op een bericht om deze te lezen. Als er geen berichten beschikbaar zijn, wordt dit aangegeven op het scherm."
    );
    logTimestamp(startTime, 3, "Berichten overzicht");
    await page.waitForTimeout(5000);

    // Try to tap the first message — gracefully skip if none available
    try {
      const firstMessage = page.getByRole("listitem").first();
      await firstMessage.waitFor({ state: "visible", timeout: 2000 });
      await tapElement(page, firstMessage);
      await page.waitForTimeout(2000);
    } catch (_) {
      // No messages available — hold on empty state
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(1500);
    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
