const { test, expect, devices } = require("@playwright/test");
const {
  initHelpers,
  showInstruction,
  hideInstruction,
  tapElement,
  logTimestamp,
} = require("./helpers");

test.use({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  video: "on",
});

test.setTimeout(200000);

test.describe("Wachtwoord vergeten (Mobile)", () => {
  test("should demonstrate password reset flow", async ({ page }) => {
    const startTime = Date.now(); // Start timer immediately — matches video recording start

    // Navigate to login page (not logged in)
    await page.goto("https://test.golfer.intogolf.nl/#/login");

    // Wait for login page to fully load
    const wachtwoordVergetenLink = page.getByText("Wachtwoord vergeten", {
      exact: true,
    });
    await wachtwoordVergetenLink.waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Login page — tap Wachtwoord vergeten
    // TTS: "Wanneer u uw wachtwoord vergeten bent, kunt u deze eenvoudig opnieuw instellen. Op de login pagina klikt u onderaan op 'Wachtwoord vergeten'."
    await showInstruction(
      page,
      "Wanneer u uw wachtwoord vergeten bent, kunt u deze eenvoudig opnieuw instellen. Op de login pagina klikt u onderaan op 'Wachtwoord vergeten'."
    );
    logTimestamp(startTime, 1, "Wachtwoord vergeten link");
    await page.waitForTimeout(4000);

    await tapElement(page, wachtwoordVergetenLink);
    await page.waitForURL(/.*#\/verifyCode/);

    // Re-inject helpers after navigation
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 2: Fill email and tap Verstuur
    // TTS: "Vervolgens vult u uw e-mail in en klikt u op 'Verstuur'."
    await showInstruction(
      page,
      "Vervolgens vult u uw e-mail in en klikt u op 'Verstuur'."
    );
    logTimestamp(startTime, 2, "E-mail invullen");
    await page.waitForTimeout(500);

    const emailField = page.locator('input[type="text"]').first();
    await tapElement(page, emailField);
    await emailField.fill("edwin+test@intogolf.nl");
    await page.waitForTimeout(800);

    const verstuurBtn = page.getByRole("button", { name: "Verstuur" });
    await tapElement(page, verstuurBtn);
    await page.waitForTimeout(1500);

    // Re-inject helpers after page updates to show code field
    try {
      await initHelpers(page);
    } catch (_) {}
    await page.waitForTimeout(1000);

    // Clip 3: Code entry page — explain the rest of the flow, stay until voiceover finishes
    // TTS: "U krijgt nu een e-mail met daarin een code, kopieer de code en voer deze hier in. Vervolgens klikt u op 'Verify Code'. Op het volgende scherm voert u uw nieuwe wachtwoord in en slaat u deze op."
    await showInstruction(
      page,
      "U krijgt nu een e-mail met daarin een code. Kopieer de code en voer deze hier in. Vervolgens klikt u op 'Verify Code'. Op het volgende scherm voert u uw nieuwe wachtwoord in en slaat u deze op."
    );
    logTimestamp(startTime, 3, "Code pagina");
    await page.waitForTimeout(10000); // Wait for long voiceover to finish

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
