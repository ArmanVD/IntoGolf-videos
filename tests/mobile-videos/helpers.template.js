/**
 * Shared helpers for IntoGolf mobile instruction videos.
 * Import in each test: const { ... } = require('./helpers');
 *
 * SETUP: Copy this file to helpers.js and fill in your club's credentials below.
 *   cp tests/mobile-videos/helpers.template.js tests/mobile-videos/helpers.js
 */

/**
 * Inject CSS styles for instruction overlay and tap indicators.
 * Call once at the start of each test (after page load).
 */
async function initHelpers(page) {
  await page.evaluate(() => {
    if (document.getElementById("igo-helper-style")) return;
    const style = document.createElement("style");
    style.id = "igo-helper-style";
    style.textContent = `
      /* Instruction overlay */
      #igo-instruction {
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        width: 88%;
        padding: 14px 18px;
        background: rgba(10, 10, 10, 0.88);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #fff;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        font-weight: 500;
        line-height: 1.45;
        text-align: center;
        border-radius: 14px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #igo-instruction.visible {
        opacity: 1;
      }

      /* Tap indicator ring */
      #igo-tap-ring {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid rgba(220, 40, 40, 0.95);
        background: rgba(220, 40, 40, 0.15);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%);
        display: none;
      }
      #igo-tap-ring.pulse {
        animation: igoPulse 0.9s ease-in-out infinite;
      }
      #igo-tap-ring.hold {
        animation: igoHold 1.2s ease-in-out infinite;
        background: rgba(220, 40, 40, 0.25);
      }
      #igo-tap-ring.tap {
        animation: igoTap 0.4s ease-out forwards;
      }

      @keyframes igoPulse {
        0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.9; }
        50%  { transform: translate(-50%, -50%) scale(1.15); opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.9; }
      }
      @keyframes igoHold {
        0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.9; }
        50%  { transform: translate(-50%, -50%) scale(1.2);  opacity: 0.4; }
        100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.9; }
      }
      @keyframes igoTap {
        0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Create overlay element
    if (!document.getElementById("igo-instruction")) {
      const overlay = document.createElement("div");
      overlay.id = "igo-instruction";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
    }

    // Create tap ring element
    if (!document.getElementById("igo-tap-ring")) {
      const ring = document.createElement("div");
      ring.id = "igo-tap-ring";
      ring.setAttribute("aria-hidden", "true");
      document.body.appendChild(ring);
    }
  });
}

/**
 * Show the instruction overlay with text.
 */
async function showInstruction(page, text) {
  await page.evaluate((msg) => {
    const overlay = document.getElementById("igo-instruction");
    if (!overlay) return;
    overlay.textContent = msg;
    overlay.classList.add("visible");
  }, text);
}

/**
 * Hide the instruction overlay.
 */
async function hideInstruction(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById("igo-instruction");
    if (overlay) overlay.classList.remove("visible");
  });
}

/**
 * Show a pulsing red ring on an element to indicate a tap, then click it.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} locator - element to tap
 * @param {Object} options
 * @param {number} options.preDelay - ms to show ring before clicking (default 1200)
 * @param {boolean} options.force - force click (default false)
 */
async function tapElement(page, locator, { preDelay = 1200, force = false } = {}) {
  const box = await locator.boundingBox();
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(({ x, y }) => {
      const ring = document.getElementById("igo-tap-ring");
      if (!ring) return;
      ring.style.left = x + "px";
      ring.style.top = y + "px";
      ring.className = "pulse";
      ring.style.display = "block";
    }, { x, y });
    await page.waitForTimeout(preDelay);
    await page.evaluate(() => {
      const ring = document.getElementById("igo-tap-ring");
      if (ring) ring.className = "tap";
    });
    await page.waitForTimeout(300);
  }
  await locator.click({ force });
  try {
    await page.evaluate(() => {
      const ring = document.getElementById("igo-tap-ring");
      if (ring) { ring.style.display = "none"; ring.className = ""; }
    });
  } catch (_) {
    // Page may have navigated — that's fine
  }
}

/**
 * Show a sustained hold indicator on an element, then perform the hold action.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} locator - element to hold
 * @param {number} holdDuration - ms to hold mouse down (default 1000)
 */
async function holdElement(page, locator, holdDuration = 1000) {
  const box = await locator.boundingBox();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  // Show hold ring
  await page.evaluate(({ x, y }) => {
    const ring = document.getElementById("igo-tap-ring");
    if (!ring) return;
    ring.style.left = x + "px";
    ring.style.top = y + "px";
    ring.className = "hold";
    ring.style.display = "block";
  }, { x, y });

  // Pre-show before action
  await page.waitForTimeout(1200);

  // Perform mouse down + hold
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(holdDuration);
  await page.mouse.up();

  // Tap out animation
  await page.evaluate(() => {
    const ring = document.getElementById("igo-tap-ring");
    if (ring) ring.className = "tap";
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const ring = document.getElementById("igo-tap-ring");
    if (ring) { ring.style.display = "none"; ring.className = ""; }
  });
}

/**
 * Hide the tap ring.
 */
async function hideTapRing(page) {
  await page.evaluate(() => {
    const ring = document.getElementById("igo-tap-ring");
    if (ring) { ring.style.display = "none"; ring.className = ""; }
  });
}

/**
 * Log a voiceover timestamp. Pass the testStartTime from Date.now() at test start.
 */
function logTimestamp(startTime, clipNumber, label) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const num = String(clipNumber).padStart(2, "0");
  console.log(`VOICEOVER_TIMESTAMP|${num}|${elapsed}|${label}`);
}

/**
 * Standard login flow (not recorded as a step).
 * ─────────────────────────────────────────────
 * Fill in your club's URL, email, and password below.
 */
async function login(page) {
  await page.goto("https://UW-CLUB.golfer.intogolf.nl/#/login"); // ← pas aan
  await page.locator('input[type="text"]').fill("uw@email.com");  // ← pas aan
  await page.locator('input[type="password"]').fill("UwWachtwoord"); // ← pas aan
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(/.*#\/(?!login).*/);
  await page.waitForTimeout(1000);
}

module.exports = {
  initHelpers,
  showInstruction,
  hideInstruction,
  tapElement,
  holdElement,
  hideTapRing,
  logTimestamp,
  login,
};
