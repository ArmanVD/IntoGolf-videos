# IntoGolf Mobiele Instructievideo's

Playwright-testscripts voor het automatisch genereren van mobiele instructievideo's voor de IntoGolf golfer-app.

## Aan de slag

Zie **[VIDEO-WORKFLOW-GUIDE.md](VIDEO-WORKFLOW-GUIDE.md)** voor de volledige handleiding.

**Kort samengevat:**
1. Clone de repository: `git clone https://github.com/ArmanVD/IntoGolf-videos.git`
2. Open de map in VSCode: `code IntoGolf-videos`
3. `npm install` en `npx playwright install chromium` — dit maakt automatisch `helpers.js` aan
4. Installeer FFmpeg (`brew install ffmpeg` op macOS)
5. Maak een ElevenLabs API-sleutel aan en stel `ELEVENLABS_API_KEY` in
6. Open `tests/mobile-videos/helpers.js` en vul uw club-URL, e-mailadres en wachtwoord in
7. Installeer Claude Code in VSCode
8. Zeg tegen Claude: *"Ik wil de login video."*

## Beschikbare video's

| Video | Onderwerp |
|---|---|
| 01 | Inloggen |
| 02 | Starttijd boeken |
| 03 | Wachtwoord vergeten |
| 04 | Starttijd annuleren |
| 05 | Wachtwoord aanpassen |
| 06 | Privéles boeken |
| 07 | Privéles annuleren |
| 08 | Baankalender bekijken |
| 09 | Baanstatus bekijken |
| 10 | Wedstrijd inschrijven |
| 11 | Wedstrijd uitschrijven |
| 12 | Ledenboekje bekijken |
| 13 | Uitloggen |
