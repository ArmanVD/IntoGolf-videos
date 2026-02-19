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

test.describe("Ledenboekje bekijken (Mobile)", () => {
  test("should demonstrate searching the member list", async ({ page }) => {
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

    // Clip 2: Tap Ledenboekje from drawer
    // TTS: "Klik vervolgens op 'Ledenboekje'."
    await showInstruction(page, "Klik vervolgens op 'Ledenboekje'.");
    logTimestamp(startTime, 2, "Ledenboekje in menu");
    await page.waitForTimeout(500);

    const ledenboekjeItem = page
      .locator(".q-drawer")
      .getByText("Ledenboekje", { exact: true });
    await tapElement(page, ledenboekjeItem, { force: true });
    await expect(page).toHaveURL(/.*#\/members/);

    await initHelpers(page);
    await page.getByRole("textbox", { name: "Zoeken" }).waitFor({ state: "visible" });
    await page.waitForTimeout(1000);

    // Clip 3: Type "ker" in the search bar
    // TTS: "Zodra u op de pagina bent kunt u zoeken op leden door in de zoekbalk een achternaam in te vullen. Vul minimaal de eerste drie letters van de achternaam in."
    await showInstruction(
      page,
      "Zodra u op de pagina bent kunt u zoeken op leden door in de zoekbalk een achternaam in te vullen. Vul minimaal de eerste drie letters van de achternaam in."
    );
    logTimestamp(startTime, 3, "Zoeken in ledenboekje");
    await page.waitForTimeout(9500); // Allow 8.8s TTS to complete before action

    const searchBox = page.getByRole("textbox", { name: "Zoeken" });
    await searchBox.click();
    await page.waitForTimeout(300);
    await searchBox.pressSequentially("ker", { delay: 250 });
    await page.waitForTimeout(2000); // Wait for search results

    // Clip 4: Tap a result
    // TTS: "Klik vervolgens op het lid waarvan u meer informatie wilt zien."
    await showInstruction(
      page,
      "Klik vervolgens op het lid waarvan u meer informatie wilt zien."
    );
    logTimestamp(startTime, 4, "Selecteer lid");
    await page.waitForTimeout(2000);

    const memberResult = page.getByText("Kerkhoven, Máirtín");
    await memberResult.waitFor({ state: "visible" });
    await tapElement(page, memberResult);
    await page.waitForTimeout(1500);

    await initHelpers(page);

    // Clip 5: Show detail view
    // TTS: "Hier ziet u alle beschikbare informatie."
    await showInstruction(page, "Hier ziet u alle beschikbare informatie.");
    logTimestamp(startTime, 5, "Ledendetail");
    await page.waitForTimeout(4000);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
