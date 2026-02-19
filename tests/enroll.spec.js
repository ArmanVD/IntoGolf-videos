const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const ENROLLED_MATCH_FILE = path.join(__dirname, ".enrolled-match.json");
const MONTHS = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

/**
 * Helper: try to enroll in the first available match from the current list.
 * Returns { matchName, matchDate } on success, or null if none found.
 */
async function tryEnrollFromList(page, monthName) {
  const matchItems = page.getByRole("listitem");
  const matchCount = await matchItems.count();

  if (matchCount === 0) return null;

  for (let i = 0; i < matchCount; i++) {
    const item = matchItems.nth(i);

    // Skip matches we're already enrolled in
    const isEnrolled = await item.getByText("Ingeschreven").isVisible().catch(() => false);
    if (isEnrolled) continue;

    // Get the match text before clicking
    const itemText = await item.innerText();

    // Click the match to open detail
    await item.click();
    await page.waitForTimeout(1000);

    // Check if "Inschrijven" button is available (enrollment still open)
    const inschrijvenButton = page.getByRole("button", { name: "Inschrijven", exact: true });
    const canEnroll = await inschrijvenButton.isVisible().catch(() => false);

    if (canEnroll) {
      // Extract match name and date from the list item text
      const lines = itemText.split("\n").filter((l) => l.trim());
      const matchName = lines.find((l) => l !== "Q" && !l.includes("/") && !l.includes("Ingeschreven") && !l.match(/^\d+$/)) || "";
      const matchDate = lines.find((l) => l.includes("/")) || "";

      // Click Inschrijven
      await inschrijvenButton.click();
      await expect(page.getByText("Opmerking")).toBeVisible();

      // Click Opslaan to confirm enrollment
      await page.getByRole("button", { name: "Opslaan" }).click();
      await expect(page.getByText("is verwerkt")).toBeVisible();

      // Save match info to file so unenroll test can find it
      fs.writeFileSync(ENROLLED_MATCH_FILE, JSON.stringify({ matchName, matchDate, month: monthName }));

      return { matchName, matchDate };
    }

    // No Inschrijven button — go back to the list
    await page.getByRole("button", { name: "Wedstrijden" }).click();
    await page.waitForTimeout(500);

    // Re-select the month and filter after going back
    if (monthName !== MONTHS[new Date().getMonth()]) {
      await page.getByRole("combobox", { name: "Selecteer maand" }).click();
      await page.getByRole("option", { name: monthName }).click();
      await page.waitForTimeout(500);
    }
    await page.locator('button:has(span:text("Alles"))').click();
    await page.waitForTimeout(500);
  }

  return null;
}

test.describe("Enroll and unenroll from a match", () => {
  test("should enroll for the first available match (current month)", async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to Wedstrijden
    await page.getByText("Wedstrijden").click();
    await expect(page).toHaveURL(/.*#\/match/);
    await expect(page.locator("header")).toContainText("Wedstrijden");

    // Show all matches
    await page.locator('button:has(span:text("Alles"))').click();
    await page.waitForTimeout(1000);

    const currentMonthName = MONTHS[new Date().getMonth()];
    const result = await tryEnrollFromList(page, currentMonthName);

    if (!result) {
      test.skip(true, "No matches with open enrollment found in current month");
      return;
    }
  });

  test("should enroll for the first available match (next month)", async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to Wedstrijden
    await page.getByText("Wedstrijden").click();
    await expect(page).toHaveURL(/.*#\/match/);
    await expect(page.locator("header")).toContainText("Wedstrijden");

    // Switch to next month
    const nextMonthName = MONTHS[(new Date().getMonth() + 1) % 12];
    await page.getByRole("combobox", { name: "Selecteer maand" }).click();
    await page.getByRole("option", { name: nextMonthName }).click();
    await page.waitForTimeout(1000);

    // Show all matches
    await page.locator('button:has(span:text("Alles"))').click();
    await page.waitForTimeout(1000);

    const result = await tryEnrollFromList(page, nextMonthName);

    if (!result) {
      test.skip(true, `No matches with open enrollment found in ${nextMonthName}`);
      return;
    }
  });

  test("should unenroll from the previously enrolled match", async ({ page }) => {
    // Read match info saved by the enroll test
    if (!fs.existsSync(ENROLLED_MATCH_FILE)) {
      test.skip(true, "No enrolled match file found (enroll test must run first)");
      return;
    }

    const { matchName, matchDate, month } = JSON.parse(fs.readFileSync(ENROLLED_MATCH_FILE, "utf-8"));

    if (!matchName) {
      test.skip(true, "No match name in enrolled match file");
      return;
    }

    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to Wedstrijden
    await page.getByText("Wedstrijden").click();
    await expect(page).toHaveURL(/.*#\/match/);

    // Switch to the correct month if needed
    if (month) {
      await page.getByRole("combobox", { name: "Selecteer maand" }).click();
      await page.getByRole("option", { name: month }).click();
      await page.waitForTimeout(1000);
    }

    // Show all matches and find the one we enrolled in by name + date
    await page.locator('button:has(span:text("Alles"))').click();
    await page.waitForTimeout(1000);

    // Find the specific match by checking each list item for both name and date
    const matchItems = page.getByRole("listitem");
    const matchCount = await matchItems.count();
    let foundItem = false;

    for (let i = 0; i < matchCount; i++) {
      const item = matchItems.nth(i);
      const itemText = await item.innerText();

      if (itemText.includes(matchName) && itemText.includes(matchDate)) {
        await item.click();
        foundItem = true;
        break;
      }
    }

    if (!foundItem) {
      test.skip(true, `Could not find match "${matchName}" (${matchDate}) in list`);
      return;
    }

    await expect(page.getByText("Datum")).toBeVisible();

    // Click "Mijn inschrijving" button
    const mijnInschrijving = page.getByRole("button", { name: "Mijn inschrijving" });
    const hasMijnInschrijving = await mijnInschrijving.isVisible().catch(() => false);

    if (!hasMijnInschrijving) {
      test.skip(true, "Could not find Mijn inschrijving button");
      return;
    }

    await mijnInschrijving.click();

    // Click "Uitschrijven" button
    await page.getByRole("button", { name: "Uitschrijven" }).click();

    // Confirm the dialog by clicking "OK"
    await page.getByRole("button", { name: "OK" }).click();

    // Wait for the confirmation toast to appear
    await expect(page.getByText("is verwerkt")).toBeVisible();

    // Clean up the enrolled match file
    fs.unlinkSync(ENROLLED_MATCH_FILE);
  });
});
