const { test, expect, devices } = require("@playwright/test");
const {
  LOGIN_URL,
  EMAIL,
  PASSWORD,
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

test.describe("Inloggen (Mobile)", () => {
  test("should demonstrate login flow", async ({ page }) => {
    const startTime = Date.now(); // Start timer immediately — matches video recording start

    await page.goto(LOGIN_URL);

    // Wait for page to be fully loaded, then pause 1s before starting
    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Login screen — fill email and password
    // Display text uses correct Dutch spelling
    // TTS text uses: "Als u in wilt loggen, komt u op dit scherm. Voer eerst uw ee-mail-adres en wacht-woord in."
    await showInstruction(
      page,
      "Als u in wilt loggen, komt u op dit scherm. Voer eerst uw e-mailadres en wachtwoord in."
    );
    logTimestamp(startTime, 1, "Login scherm");
    await page.waitForTimeout(500);

    const emailField = page.locator('input[type="text"]');
    await tapElement(page, emailField);
    await emailField.fill(EMAIL);
    await page.waitForTimeout(800);

    const passwordField = page.locator('input[type="password"]');
    await tapElement(page, passwordField);
    await passwordField.fill(PASSWORD);
    await page.waitForTimeout(1500);

    // Clip 2: Tap login button
    // TTS text uses: "Klik vervolgens op log-in."
    await showInstruction(page, "Klik vervolgens op 'Log in'.");
    logTimestamp(startTime, 2, "Log in knop");
    await page.waitForTimeout(300);

    await tapElement(page, loginButton);
    await page.waitForURL(/.*#\/(?!login).*/);

    // Re-inject helpers after navigation
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Success
    // TTS text uses: "U bent nu succesvol in-gelogd!"
    await showInstruction(page, "U bent nu succesvol ingelogd!");
    logTimestamp(startTime, 3, "Ingelogd");
    await page.waitForTimeout(2500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
