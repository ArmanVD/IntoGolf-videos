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

const MONTHS = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

test.describe("Wedstrijd uitschrijven (Mobile)", () => {
  test("should demonstrate unenrolling from a match", async ({ page }) => {
    const startTime = Date.now();

    // Silent login — not recorded
    await login(page);

    // Silent pre-enrollment: enroll in first available match so we have one to unenroll from
    await page.goto(`${BASE_URL}/#/match`);
    await page.waitForTimeout(1000);

    let enrolledMonth = MONTHS[new Date().getMonth()];
    let preEnrolled = false;

    for (let monthOffset = 0; monthOffset <= 1 && !preEnrolled; monthOffset++) {
      if (monthOffset === 1) {
        enrolledMonth = MONTHS[(new Date().getMonth() + 1) % 12];
        await page.getByRole("combobox", { name: "Selecteer maand" }).click();
        await page.getByRole("option", { name: enrolledMonth }).click();
        await page.waitForTimeout(1000);
      }

      await page.locator('button:has(span:text("Inschrijven"))').first().click();
      await page.waitForTimeout(1000);

      const matchItems = page.getByRole("listitem");
      const matchCount = await matchItems.count();

      for (let i = 0; i < matchCount && !preEnrolled; i++) {
        const item = matchItems.nth(i);
        const isEnrolled = await item.getByText("Ingeschreven").isVisible().catch(() => false);
        if (isEnrolled) continue;

        await item.click();
        await page.waitForTimeout(1000);

        const inschrijvenBtn = page.getByRole("button", { name: "Inschrijven", exact: true });
        const canEnroll = await inschrijvenBtn.isVisible().catch(() => false);

        if (canEnroll) {
          await inschrijvenBtn.click();
          await page.getByRole("button", { name: "Opslaan" }).click();
          await page.getByText("is verwerkt").waitFor({ state: "visible" });
          preEnrolled = true;
        } else {
          await page.getByRole("button", { name: "Wedstrijden" }).click();
          await page.waitForTimeout(500);
          await page.locator('button:has(span:text("Inschrijven"))').first().click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Navigate to dashboard to start recording
    await page.goto(`${BASE_URL}/#/`);
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

    // Clip 2: Tap Wedstrijden from drawer
    // TTS: "Klik vervolgens op 'Wedstrijden'."
    await showInstruction(page, "Klik vervolgens op 'Wedstrijden'.");
    logTimestamp(startTime, 2, "Wedstrijden in menu");
    await page.waitForTimeout(500);

    const wedstrijdenItem = page
      .locator(".q-drawer")
      .getByText("Wedstrijden", { exact: true });
    await tapElement(page, wedstrijdenItem, { force: true });
    await expect(page).toHaveURL(/.*#\/match/);

    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Tap Ingeschreven filter and select a match
    // TTS: "Klik op 'Ingeschreven' en klik vervolgens op de wedstrijd waar u zich van wilt uitschrijven."
    await showInstruction(
      page,
      "Klik op 'Ingeschreven' en klik vervolgens op de wedstrijd waar u zich van wilt uitschrijven."
    );
    logTimestamp(startTime, 3, "Ingeschreven filter + match select");
    await page.waitForTimeout(2000);

    // Switch month if pre-enrollment was in next month
    const currentMonth = MONTHS[new Date().getMonth()];
    if (enrolledMonth !== currentMonth) {
      await page.getByRole("combobox", { name: "Selecteer maand" }).click();
      await page.getByRole("option", { name: enrolledMonth }).click();
      await page.waitForTimeout(1000);
    }

    // Tap the Ingeschreven filter button
    const ingeschrevenFilter = page.locator('button:has(span:text("Ingeschreven"))').first();
    await tapElement(page, ingeschrevenFilter);
    await page.waitForTimeout(1000);

    // Select the last enrolled match in the list
    const enrolledMatches = page.getByRole("listitem");
    await enrolledMatches.last().waitFor({ state: "visible" });
    await tapElement(page, enrolledMatches.last());
    await page.waitForTimeout(1500);

    await initHelpers(page);

    // Clip 4: Tap Mijn inschrijving, Uitschrijven, and confirm with OK
    // TTS: "Klik vervolgens op 'Mijn inschrijving' en dan op 'Uitschrijven'. Vervolgens bevestigt u de uitschrijving door op 'Ok' te klikken."
    await showInstruction(
      page,
      "Klik vervolgens op 'Mijn inschrijving' en dan op 'Uitschrijven'. Vervolgens bevestigt u de uitschrijving door op 'Ok' te klikken."
    );
    logTimestamp(startTime, 4, "Mijn inschrijving + Uitschrijven + OK");
    await page.waitForTimeout(3000);

    const mijnInschrijvingBtn = page.getByRole("button", { name: "Mijn inschrijving" });
    await tapElement(page, mijnInschrijvingBtn);
    await page.waitForTimeout(1000);

    const uitschrijvenBtn = page.getByRole("button", { name: "Uitschrijven" });
    await uitschrijvenBtn.waitFor({ state: "visible" });
    await tapElement(page, uitschrijvenBtn);
    await page.waitForTimeout(1000);

    const okBtn = page.getByRole("button", { name: "OK" });
    await okBtn.waitFor({ state: "visible" });
    await tapElement(page, okBtn);
    await page.getByText("is verwerkt").waitFor({ state: "visible" });
    await page.waitForTimeout(1500);

    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 5: Success
    // TTS: "U bent nu succesvol uitgeschreven van de wedstrijd."
    await showInstruction(page, "U bent nu succesvol uitgeschreven van de wedstrijd.");
    logTimestamp(startTime, 5, "Uitgeschreven");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
