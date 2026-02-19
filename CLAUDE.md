# IntoGolf Golfer - E2E Test Suite

## Project Overview
End-to-end Playwright tests for the IntoGolf golfer web application.

## Test Credentials
- **Email:** edwin+test@intogolf.nl
- **Password:** Test543@!
- **User:** Edwin Kerkhoven

## Base URL
- **Test environment:** https://test.golfer.intogolf.nl

## Commands
- **Run all tests:** `npx playwright test`
- **Run specific test file:** `npx playwright test tests/<filename>.spec.js`
- **Run specific browser:** `npx playwright test --project=chromium`
- **Run specific test by name:** `npx playwright test -g "test name"`

## Dutch Video Commands
When the user asks for a video in Dutch (e.g. "Ik wil de login video" or "Maak de starttijd boeken video"), map to the corresponding spec file in `tests/mobile-videos/`:

| Dutch command | Spec file |
|---|---|
| login / inloggen | 01-login.spec.js |
| starttijd boeken | 02-starttijd-boeken.spec.js |
| wachtwoord vergeten | 03-wachtwoord-vergeten.spec.js |
| starttijd annuleren | 04-starttijd-annuleren.spec.js |
| wachtwoord aanpassen / wachtwoord wijzigen | 05-wachtwoord-aanpassen.spec.js |
| privéles boeken / priveles boeken | 06-priveles-boeken.spec.js |
| privéles annuleren / priveles annuleren | 07-priveles-annuleren.spec.js |
| baankalender | 08-baankalender-bekijken.spec.js |
| baanstatus | 09-baanstatus-bekijken.spec.js |
| wedstrijd inschrijven | 10-wedstrijd-inschrijven.spec.js |
| wedstrijd uitschrijven | 11-wedstrijd-uitschrijven.spec.js |
| ledenboekje / ledenlijst | 12-ledenboekje.spec.js |
| uitloggen | 13-uitloggen.spec.js |

## App Structure & Routes
The app uses hash-based routing (`#/`).

| Route | Page | Description |
|---|---|---|
| `#/login` | Login | Authentication page |
| `#/` | Dashboard | Home page with menu tiles to all sections |
| `#/reservations` | Starttijden | Tee time bookings list & booking flow |
| `#/match` | Wedstrijden | Matches list, enroll/unenroll |
| `#/profile` | Profiel | User profile with tabs: Naam, Contact, Golf, Voorkeuren, Wachtwoord |
| `#/Baanstatus` | Baanstatus | Course status for Lus a and Lus b |
| `#/Baankalender` | Baankalender | Course calendar timeline with Lus a/b |
| `#/handicap` | Handicap | Handicap info with Binnenland/Buitenland scorecard buttons |
| `#/messages` | Berichten | Messages (empty state for test user) |
| `#/members` | Ledenlijst | Member list with search |
| `#/Meerronden` | Meerronden | Multi-round competitions with leaderboard |
| `#/NGF` | NGF-Pas | Golf federation pass (NGF kaart) |
| `#/lessons` | Lessen | Private lessons booking & cancellation |
| `#/history` | Speelhistorie | Play history with statistics |
| `#/verifyCode` | Wachtwoord vergeten | Password reset |
| `#/signUp` | Inschrijven | Sign up |
| `#/teetimes` | Starttijd (public) | Public tee times |

**Note:** Some routes are case-sensitive (`#/Baanstatus`, `#/Baankalender`, `#/Meerronden`, `#/NGF`).

## Test Files & Coverage (192 tests: 64 per browser × 3 browsers)

### tests/auth.spec.js - Authentication (3 tests)
- Login with wrong credentials shows error ("Gegevens niet correct")
- Empty fields show validation errors ("Voer aub uw e-mailadres in", "Voer aub uw e-wachtwoord in")
- Correct credentials redirect away from login page

### tests/dashboard.spec.js - Dashboard (4 tests)
- Verify user name "Edwin Kerkhoven" is displayed
- Verify all navigation menu items are visible (Starttijden, Wedstrijden, Baankalender, Meerronden, Berichten, Baanstatus, Handicap, NGF-Pas, Lessen, Ledenlijst, Profiel, Speelhistorie)
- Navigate to Wedstrijden from dashboard, verify `#/match` URL
- Navigate to Starttijden from dashboard, verify `#/reservations` URL

### tests/enroll.spec.js - Match Enroll/Unenroll (3 tests)
- Enroll (current month): click "Alles" filter, iterate matches to find first with open enrollment, click Inschrijven > Opslaan, verify "is verwerkt" toast, save match info to JSON file
- Enroll (next month): switch month dropdown to next month, same enrollment flow as above
- Unenroll: read match info from JSON file, switch to correct month, find match by name + date, click "Mijn inschrijving" > "Uitschrijven" > confirm "OK", verify "is verwerkt" toast, clean up JSON file
- **Note:** Enroll tests share a `tryEnrollFromList` helper to avoid code duplication
- **Note:** Match info (name, date, month) is passed between tests via `tests/.enrolled-match.json`
- **Note:** Tests skip automatically if no matches have open enrollment
- **Note:** Unenroll test skips if no JSON file exists (no prior enrollment)

### tests/starttijden.spec.js - Tee Times (3 tests)
- Navigate to Starttijden page, verify header and "Nieuwe starttijd" button
- Book a tee time: click "Nieuwe starttijd", navigate forward day-by-day (up to 7 days) until time slots appear, select first slot, confirm with "Reserveer", verify detail page
- Cancel a tee time: click last reservation, click "Annuleer flight", confirm dialog with "OK", verify return to list

### tests/baankalender.spec.js - Baankalender (2 tests)
- Navigate to Baankalender page, verify header
- Verify calendar with Lus a and Lus b columns and time indicators (9:00, 10:00)

### tests/baanstatus.spec.js - Course Status (2 tests)
- Navigate to Baanstatus page, verify header
- Verify Lus a and Lus b sections with status items (Baan open, Qualifying, Buggies, Trolleys)

### tests/berichten.spec.js - Messages (2 tests)
- Navigate to Berichten page (`#/messages`), verify header
- Verify empty state: "Geen berichten" and "er zijn momenteel geen berichten gevonden"

### tests/handicap.spec.js - Handicap (3 tests)
- Navigate to Handicap page, verify header
- Verify Binnenland/Buitenland buttons and empty state "U heeft nog geen scorekaarten"
- Fill scorecard form: click Binnenland, set date (yesterday) and time (10:00), search marker "Kerkhoven", select Máirtín Kerkhoven (NL37336652), select Baan (Noordwijkse) → Lus (18 holes) → Tee (geel heren), verify summary (Cr/Sr/Par: 72.8/137/72), cancel
- **Note:** Cannot proceed past summary to Score entry — test user has no GSN, so the API returns 500

### tests/ledenlijst.spec.js - Member List (3 tests)
- Navigate to Ledenlijst page (`#/members`), verify header and search box
- Search for "Kerkhoven", verify results appear with "Kerkhoven, Máirtín"
- Click on member "Kerkhoven, Máirtín", verify detail view (Relatie, name, Speelsterkte), click "Sluiten" to return

### tests/logout.spec.js - Logout (1 test)
- Navigate to Profiel, click "Uitloggen", verify redirect to `#/login`

### tests/meerronden.spec.js - Meerronden (2 tests)
- Navigate to Meerronden page, verify header
- Open "Herenmiddag (voorbeeld)", verify detail with leaderboard and "Birdie klassement", navigate back

### tests/ngf.spec.js - NGF-Pas (1 test)
- Navigate to NGF page (`#/NGF`), verify header "NGF kaart"
- **Note:** Test user lacks GSN, so full pass details cannot be tested

### tests/profile.spec.js - Profile (3 tests)
- Navigate to Profiel, verify Naam tab with user details (Voornaam: Edwin, Achternaam: Kerkhoven)
- Switch between tabs: Contact (verify email), Golf (verify speelsterkte field)
- Change "Zichtbaarheid in ledenboekje" preference, click Opslaan, reload and verify persistence, then restore original value

### tests/speelhistorie.spec.js - Speelhistorie (2 tests)
- Navigate to Speelhistorie page (`#/history`), verify header
- Verify statistics labels: Verl., Toek., Even., Tot., Ann.

### tests/lessen.spec.js - Lessen (1 test)
- Book a privé les for tomorrow: navigate to Lessen, click Priveles, set date to tomorrow, select first available time slot, confirm booking ("Uw les is geboekt"), open booked lesson detail, click "Annuleer les", confirm cancellation ("uw les is geannuleerd")
- **Note:** Uses `test.use({ video: "on" })` to record video of the test
- **Note:** Dutch instruction text overlays (Stap één–negen) with improved punctuation for natural TTS pronunciation, injected via `showInstruction()` helper, using `aria-hidden` to avoid Playwright selector conflicts
- **Note:** Dutch voiceover audio generated with ElevenLabs AI (Daniel voice - British accent, multilingual_v2 model) as one continuous audio track with silence padding, merged with video via ffmpeg
- **Note:** Test logs `VOICEOVER_TIMESTAMP` lines to stdout for syncing audio clips with the video
- **Note:** Synchronized timing: instruction text, TTS voiceover, and action all happen together with brief pauses (0.5-1s) for visibility, then wait for TTS to complete before next step
- **Note:** Uses `test.setTimeout(200000)` to accommodate the delays with overlays
- **Note:** Books for tomorrow (not today) so the "Annuleer les" button is available (too close to start time hides it)
- **Note:** Output video: `test-results/lessen-instructievideo.mp4`

## Mobile Instruction Videos

Mobile-optimized instruction videos for key user flows, with Dutch voiceover and on-screen instructions.

### Video Standards
- **Resolution:** 1080×1920 (Full HD portrait)
- **Device:** iPhone 13 emulation (390×844 viewport)
- **Video codec:** H.264 High profile, CRF 18, preset slow, yuv420p
- **Audio codec:** AAC 192 kbps
- **Voiceover:** ElevenLabs AI (Voice ID: 7qdUFMklKPaaAVMsBTBt, Dutch pronunciation, eleven_multilingual_v2 model, stability: 0.35, similarity_boost: 0.75)
- **Instructions:** Direct action statements (no "Stap één/twee/drie" numbering), Dutch, concise
- **TTS vs display text:** TTS audio uses pronunciation hints (e.g. "ee-mail-adres", "log-in"); display text uses correct Dutch spelling
- **Overlay:** Floating card, bottom 28px, 88% width, rounded corners (14px), blur background, box-shadow, 16px font, fade-in 0.3s, aria-hidden
- **Tap indicator:** Red pulsing ring (60px, rgba(220,40,40,0.95)), 1.2s pre-tap pulse, ripple on tap
- **Hold indicator:** Slower sustained red pulse for full hold duration
- **Pacing:** `startTime = Date.now()` set before page.goto(); wait for key element + 1s pause before first instruction; ~1.5s after action before next instruction
- **Shared helpers:** `tests/mobile-videos/helpers.js` (initHelpers, showInstruction, tapElement, holdElement, logTimestamp, login)
- **Output:** `mobile-videos/*.mp4`

### tests/mobile-videos/01-login.spec.js (3 clips, ~1.2 MB)
- Fill email and password, tap Login, success
- Instructions: "Als u in wilt loggen, komt u op dit scherm. Voer eerst uw e-mailadres en wachtwoord in.", "Klik vervolgens op 'Log in'.", "U bent nu succesvol ingelogd!"

### tests/mobile-videos/02-starttijd-boeken.spec.js (7 clips, 5.7 MB)
- Login silently, open menu, navigate to Starttijden, tap Nieuwe starttijd, press right arrow ×2, select time slot, tap Reserveer, success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Starttijden'.", "Klik nu op 'Nieuwe starttijd'.", "Door boven op de pijltjes te klikken kunt u een nieuwe datum krijgen, of u klikt op de datum zelf om de kalender te openen.", "Wanneer u een datum geselecteerd heeft, kiest u uit de lijst de tijd waarop u wilt starten.", "Vervolgens klikt u op 'Reserveer'.", "U heeft nu succesvol een starttijd geboekt!"
- **Note:** Uses helpers.js — tapElement for all clicks (red ring indicator), initHelpers re-called after each navigation

### tests/mobile-videos/03-wachtwoord-vergeten.spec.js (3 clips, 1.9 MB)
- Navigate to login page, tap "Wachtwoord vergeten", fill email, tap "Verstuur", stay on code entry page until voiceover finishes
- Instructions: "Wanneer u uw wachtwoord vergeten bent...", "Vervolgens vult u uw e-mail in en klikt u op 'Verstuur'.", "U krijgt nu een e-mail met daarin een code..."
- **Note:** No login — starts as unauthenticated user; stays on `#/verifyCode` for clip 3

### tests/mobile-videos/04-starttijd-annuleren.spec.js (6 clips, 3.0 MB)
- Open menu, navigate to Starttijden, tap last booking in list, tap "Annuleer flight", confirm OK, success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Starttijden'.", "Klik nu op de boeking die u wilt annuleren.", "U bent nu op de detail pagina van uw boeking gekomen. Klik op 'Annuleer Flight' om de boeking te annuleren.", "Klik vervolgens op 'Ok' om de annulering te bevestigen.", "U heeft nu succesvol uw starttijd geannuleerd!"
- **Note:** Uses `getByRole("listitem").last()` to select furthest-future booking; `getByText("Annuleer flight", { exact: true })` with `{ force: true }`; dialog confirmed with `getByRole("button", { name: "OK" })`

### tests/mobile-videos/05-wachtwoord-aanpassen.spec.js (7 clips, 3.3 MB)
- Open menu, navigate to Account, hold right arrow until Wachtwoord tab appears, tap Wachtwoord tab, fill new password, fill confirm password, show active save button
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Account'.", "Vervolgens houdt u het pijltje naar rechts ingedrukt totdat u het tabblad 'Wachtwoord' ziet verschijnen.", "Klik hierop.", "Voer uw nieuwe wachtwoord in die voldoet aan de eisen.", "Herhaal het wachtwoord nog een keer om te bevestigen en klik vervolgens op 'Wachtwoord opslaan'.", "U heeft nu succesvol uw wachtwoord gewijzigd!"
- **Note:** Save button intentionally NOT clicked to preserve test account password; uses `holdElement(page, rightArrow, 1500)` for press-and-hold arrow navigation; `getByRole("tab", { name: "Wachtwoord" })` for tab selection; `getByRole("textbox", { name: "Wachtwoord", exact: true })` and `getByRole("textbox", { name: "Wachtwoord controle" })`

### tests/mobile-videos/06-priveles-boeken.spec.js (6 clips, 4.3 MB)
- Open menu, navigate to Lessen, tap Privéles, tap date field and fill tomorrow, open Soort les dropdown and select first option, select first time slot, confirm with OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje. Hiermee opent u het menu.", "Klik vervolgens op 'Lessen'.", "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op 'Privéles' om een nieuwe les te boeken.", "Vervolgens kiest u de juiste datum en het soort les en klikt u de tijd aan die u wilt reserveren.", "Klik vervolgens op 'Oké' om de reservering te bevestigen.", "U heeft nu succesvol een les geboekt."
- **Note:** Booking only (no cancellation); uses `getByRole("button", { name: "Priveles" })` and `getByRole("combobox", { name: "Soort les" })` for the dropdown (only one option: "Prive les 60 min.")

### tests/mobile-videos/07-priveles-annuleren.spec.js (5 clips, 4.0 MB)
- Open menu, navigate to Lessen, tap the last booked lesson (furthest in future), tap "Annuleer les", confirm OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Lessen'.", "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op de les die u wilt annuleren.", "Klik vervolgens op 'Annuleer les', en op 'Oké' om te bevestigen.", "U heeft nu succesvol de les geannuleerd."
- **Note:** Silently pre-books a lesson 3 days ahead before recording starts (ensures Annuleer les button is visible); uses `div.row.full-width.filter({ hasText: "Prive les 60 min." }).last()` to select the lesson; after OK the app returns to lessons list with toast "uw les is geannuleerd"

### tests/mobile-videos/08-baankalender-bekijken.spec.js (4 clips, 1.9 MB)
- Open menu, navigate to Baankalender, wait for Lus a/Lus b to load, show calendar with date picker and per-baan timetable
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Baankalender'.", "Hiermee opent u de kalender. U kunt bovenin van datum wijzigen indien gewenst.", "Vervolgens ziet u per baan de geboekte tijden staan."
- **Note:** View-only, no interactions; URL check uses `/.*#\/[Bb]aankalender/` (drawer navigates to lowercase `#/baankalender`); waits for `getByText("Lus a")` before showing clips

### tests/mobile-videos/09-baanstatus-bekijken.spec.js (4 clips, 2.3 MB)
- Open menu, navigate to Baanstatus, show course status overview with Lus a/Lus b and status icon explanation
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Baanstatus'.", "Hier kunt u van alle verschillende banen de huidige status zien.", "De verschillende statussen zijn: een groen vinkje voor ja, een rood kruis voor nee, en een grijze streep voor niet van toepassing."
- **Note:** View-only, no interactions; URL check uses `/.*#\/[Bb]aanstatus/`; waits for `getByText("Lus a")` before showing clips

### tests/mobile-videos/10-wedstrijd-inschrijven.spec.js (5 clips, 3.3 MB)
- Open menu, navigate to Wedstrijden, tap Inschrijven filter, select first available match, click Inschrijven then Opslaan, confirm success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Wedstrijden'.", "Klik op 'Inschrijven' en kies de gewenste wedstrijd.", "Vervolgens klikt u op 'Inschrijven' en bevestigt u de inschrijving door op 'Opslaan' te klikken.", "U bent nu succesvol ingeschreven voor een wedstrijd."
- **Note:** Silently unenrolls after recording to keep account clean; uses `button:has(span:text("Inschrijven"))` for the filter tab; iterates current + next month if needed; success toast "is verwerkt"

### tests/mobile-videos/11-wedstrijd-uitschrijven.spec.js (5 clips, 5.3 MB)
- Silently pre-enrolls before recording; open menu, navigate to Wedstrijden, tap Ingeschreven filter, select last match, tap Mijn inschrijving, Uitschrijven, confirm OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Wedstrijden'.", "Klik op 'Ingeschreven' en klik vervolgens op de wedstrijd waar u zich van wilt uitschrijven.", "Klik vervolgens op 'Mijn inschrijving' en dan op 'Uitschrijven'. Vervolgens bevestigt u de uitschrijving door op 'Ok' te klikken.", "U bent nu succesvol uitgeschreven van de wedstrijd."
- **Note:** Uses `button:has(span:text("Ingeschreven"))` filter; `.last()` on listitem to select most recent enrollment; handles month switch if pre-enrolled in next month; success toast "is verwerkt"

### tests/mobile-videos/12-ledenboekje.spec.js (5 clips, 2.5 MB)
- Open menu, navigate to Ledenboekje (drawer), type "ker" in search box, select "Kerkhoven, Máirtín", show member detail
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Ledenboekje'.", "Zodra u op de pagina bent kunt u zoeken op leden door in de zoekbalk een achternaam in te vullen. Vul minimaal de eerste drie letters van de achternaam in.", "Klik vervolgens op het lid waarvan u meer informatie wilt zien.", "Hier ziet u alle beschikbare informatie."
- **Note:** Drawer item is "Ledenboekje" (page header shows "Ledenlijst"); uses `getByRole("textbox", { name: "Zoeken" })` and `pressSequentially("ker", { delay: 250 })`; clip 3 wait is 9500ms to allow 8.8s TTS to complete before search action

### tests/mobile-videos/13-uitloggen.spec.js (4 clips, 2.3 MB)
- Open menu, navigate to Account, scroll to Uitloggen button, tap it, confirm redirect to login page
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Account'.", "Om uit te loggen scrolt u naar beneden en klikt u op de 'Uitloggen'-knop.", "U bent nu succesvol uitgelogd."
- **Note:** Drawer item is "Account" (page route is `#/profile`); clip 3 uses `window.scrollBy({ top: 500, behavior: "smooth" })` to visibly scroll before tap; overlay repositioned to `bottom: 220px` for clip 3 only so it doesn't cover the Uitloggen button; success confirmed by redirect to `#/login`

## Edge Case Tests

### tests/auth-edge.spec.js - Auth Edge Cases (6 tests)
- SQL injection in email field — rejected with error, stays on login
- XSS attempt in email field — rejected, stays on login
- Very long email (300+ chars) — handled gracefully, stays on login
- Whitespace-only credentials — rejected, stays on login
- Session persistence — login survives page reload
- Navigate to login while logged in — handled gracefully without crash

### tests/ledenlijst-edge.spec.js - Search Edge Cases (4 tests)
- Search with no results ("XYZNOTEXIST999") — no crash
- Partial name search ("Kerk") — finds "Kerkhoven, Máirtín"
- Special characters in search ("#@!$%") — no crash
- Clear search after filling — resets without errors

### tests/starttijden-edge.spec.js - Booking Edge Cases (3 tests)
- Dismiss cancel dialog (click "Annuleer" not "OK") — booking preserved (skips if no reservations)
- Browser back from booking form — returns without crash
- Booking persists after page reload — reservation count unchanged (skips if no reservations)

### tests/profile-edge.spec.js - Profile Edge Cases (7 tests)
- Unsaved preference changes lost after reload — reverts to original value
- Save without changes — no error, page stays functional
- Visibility dropdown has multiple options — at least 2 options exist
- Wachtwoord tab displays requirements, fields, and disabled save button
- Weak password ("abc") shows validation error "Wachtwoord voldoet nog niet aan eisen"
- Mismatched passwords show "Wachtwoorden zijn niet gelijk", save stays disabled
- Matching valid passwords enable the save button (without actually saving)

### tests/navigation-edge.spec.js - Navigation Edge Cases (4 tests)
- Direct URL access without login — handled (redirect or graceful display)
- Invalid route (`#/this-route-does-not-exist`) — app doesn't crash, can still navigate
- Case-sensitive route (`#/baanstatus` vs `#/Baanstatus`) — handled gracefully
- Browser back button — correctly navigates through history stack

### tests/mobile-navigation.spec.js - Mobile Navigation (6 tests)
- All 12 navigation tiles visible on mobile viewport (375×812)
- Menu and home buttons visible in toolbar on subpages
- Menu button navigates back to dashboard from subpage
- Home button navigates back to dashboard from subpage
- Navigate to 6 sections (Starttijden, Wedstrijden, Baanstatus, Handicap, Ledenlijst, Profiel) and back via menu button
- Page content renders correctly at mobile width (Baanstatus with Lus a/b)
- **Note:** App uses dashboard tile grid as the mobile menu (no side drawer). Menu and home buttons both return to dashboard.

## Technical Notes

### Framework
- Quasar (Vue.js) framework with Material Design icons
- Material icons render as text content (e.g., `text=chevron_right`), not as img alt attributes
- Quasar loading overlay (`.q-loading`) can intercept clicks — use `waitForTimeout` or `force: true` when needed
- Quasar dialog backdrop can persist across navigations

### Test Patterns
- **Login:** All tests log in via `beforeEach` or at the start of the test
- **Shared state via file:** Enroll/unenroll tests pass match info between tests via a JSON file (`tests/.enrolled-match.json`)
- **Idempotent tests:** Tests that modify state should check current state first and clean up after themselves
- **Selectors:** Prefer `getByRole`, `getByText`, and `locator('input[aria-label="..."]')` over CSS selectors
- **Strict mode:** Use `.first()` or `{ exact: true }` when `getByText` matches multiple elements
- **Confirmation dialogs:** Many actions show "Wilt u doorgaan?" dialog with Annuleer/OK buttons
- **Success toasts:** Actions confirm with "is verwerkt" toast message
- **Day navigation:** Starttijden uses `text=chevron_right` for next day, with 1s wait between clicks for loading

### Configuration
- **Workers:** 1 (serial execution to avoid shared account state conflicts)
- **Browsers:** Chromium, Firefox, WebKit
- **Headless:** true
- **Timeout:** 30s
- **Screenshots:** only-on-failure

### Known Issues
- WebKit starttijden booking test can be flaky due to Quasar loading overlay timing
- Enroll tests skip when match enrollment deadline passes (server-side date dependency)
- Starttijden edge tests (cancel dialog, reload persistence) skip when no reservations exist
- "Kerkhoven, Edwin" was removed from member list — tests use "Kerkhoven, Máirtín" instead
