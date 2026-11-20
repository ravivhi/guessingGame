# Publishing a PWA app to Google Play — playbook

Nov 12, 2026 · Raviv Hilleli

## Overview

A new app goes from a PWA folder on ravivh.com to a Play closed test in six steps; plan on 14+ days of closed testing before production.

1. Put the PWA live on ravivh.com (GitHub Pages repo `guessingGame`), with its own icons and a privacy page.
2. Build a signed `.aab` with Bubblewrap in its own folder (e.g. `C:\Users\Raviv.Hilleli\englishQuizApp`).
3. Create the app in Play Console.
4. Fill the App content declarations.
5. Fill the store listing and store settings.
6. Upload the `.aab` to Closed testing, add testers and a country, send for review. After 14 days with 12+ opted-in testers, apply for production.

Reference apps: Guessing Game (`com.raviv.guessingGame`, in production) and English Quiz (`com.raviv.englishQuiz`, closed test).

## Step 1: Prepare the web app

Everything the Android app and Play review need must be live on ravivh.com before you build.

- [ ] App folder in the `guessingGame` repo: `<app>/index.html`, `manifest.json`, `sw.js`.
- [ ] Its OWN icons in `<app>/icons/` (`icon-192.png`, `icon-512.png`). English Quiz first shipped with Guessing Game's icon by mistake.
- [ ] `<app>/privacy.html`: what data leaves the device, no ads/tracking, children section, contact email. Copy `englishQuiz/privacy.html` as a template.
- [ ] Add the app to `.well-known/assetlinks.json`: package name + SHA-256 fingerprints. Include Play's app-signing fingerprint (Play Console → App signing → Digital Asset Links JSON) once the app exists, or the app opens with a browser URL bar.
- [ ] Commit AND push, then check that the URLs return 200 (privacy page, icons, assetlinks).

## Step 2: Build the bundle with Bubblewrap

Use the latest Bubblewrap so the app targets the current required API level (API 36 as of Nov 2026, which needs minSdk 24).

```
npm i -g @bubblewrap/cli@latest
mkdir C:\Users\Raviv.Hilleli\<appName>App
cd C:\Users\Raviv.Hilleli\<appName>App
bubblewrap init --manifest=https://ravivh.com/<app>/manifest.json
bubblewrap build
```

- `init` asks for package id (`com.raviv.<app>`), name, colors and creates a keystore. Save the passwords somewhere safe; you need them for every update.
- `build` asks for the passwords and outputs `app-release-bundle.aab` (upload this) plus APKs.
- For a new version: raise `appVersion` and `appVersionCode` in `twa-manifest.json`, then `bubblewrap update --manifest=./twa-manifest.json` and `bubblewrap build`.
- Check `app/build.gradle` shows `targetSdkVersion 36` before uploading.
- Never commit `*.keystore` or the passwords file.

## Step 3: Create the app in Play Console

Home → **Create app**.

| Field | What we used |
| --- | --- |
| App name | English Quiz |
| Package name | `com.raviv.englishQuiz` (must match `twa-manifest.json`; click Check availability) |
| Default language | Hebrew – iw-IL |
| App or game | App |
| Free or paid | Free |
| Declarations | Developer Program Policies + US export laws (you tick these) |

## Step 4: App content declarations

Monitor and improve → Policy and programs → **App content**. All of these must be done before review; these are the English Quiz answers.

| Declaration | Answer we gave |
| --- | --- |
| Privacy policy | `https://ravivh.com/<app>/privacy.html` |
| Ads | No ads |
| Sign in details | No restricted parts |
| Content rating | Email + "All Other App Types"; No to everything except "educational product" = Yes |
| Target audience | 9–12, 13–15, 16–17, 18+ (includes kids → Families policy); you tick the COPPA/GDPR certification; not in Teacher Approved |
| Data safety | Collects data: Yes (words sent to the MyMemory translation API); encrypted in transit; no accounts; type = App activity → Other user-generated content; collected, not shared, processed ephemerally, required, purpose App functionality |
| Advertising ID | No |
| Government apps | No |
| Financial features | None |
| Health apps | None |

Adjust Data safety to what the new app actually sends off the device. An app that sends nothing can answer "No" to collection.

## Step 5: Store listing and store settings

Grow users → **Store listings** → Create default store listing. Images are added through the "Add assets" side panel (upload once, then pick).

| Item | Requirement | What we used |
| --- | --- | --- |
| Short description | ≤ 80 chars | One Hebrew line on what the app does |
| Full description | ≤ 4000 chars | Hebrew: how it works, why, no ads/sign-up |
| App icon | 512×512 PNG, ≤ 1 MB | Same as `icons/icon-512.png` |
| Feature graphic | 1024×500 PNG | Icon + app name + Hebrew tagline on the app's purple gradient |
| Phone screenshots | 2–8, 9:16, 320–3840 px | 4 screenshots at 1080×1920: start, question, correct answer, summary |
| AI asset declaration | — | Don't label |

Then **Store settings**: Category = Education, contact email = ravivhilleli@gmail.com.

## Step 6: Closed test and review

New personal-account apps need a closed test with at least 12 opted-in testers for 14 days before production.

1. Test and release → **Closed testing** → Alpha → Manage track → Create new release.
2. Upload `app-release-bundle.aab`; set the release name to the version (e.g. `3 (1.0.0.2)`); Save.
3. **Testers** tab: tick the existing email list `raviv` (14 testers); feedback email = ravivhilleli@gmail.com.
4. **Countries / regions** tab: Israel.
5. Preview and confirm → Save → **Publishing overview** → Submit changes for review. Review takes up to 7 days.
6. After approval, share the opt-in link from the Testers tab with the testers.
7. After 14 days with 12+ testers opted in: Dashboard → Apply for production.

## Updating an existing app

When Play warns "App must target Android X", rebuild with the latest Bubblewrap and publish a new production release; the warning clears after it goes live.

1. `npm i -g @bubblewrap/cli@latest`
2. Raise `appVersion` / `appVersionCode` in `twa-manifest.json`.
3. `bubblewrap update --manifest=./twa-manifest.json`, then `bubblewrap build`.
4. Production → Create new release → upload the `.aab` → Save → Publishing overview → Submit for review.

Check Policy status (Monitor and improve → Policy status) to see which target level is required.

## Gotchas we hit

- An old Bubblewrap built API 35; Play rejected it. Always update Bubblewrap first.
- API 36 needs `minSdkVersion 24`, which drops about 6% of old devices (Android 6 and older). Play shows a warning; that's expected.
- A git push doesn't reach Play: the `.aab` must be uploaded in Play Console.
- `privacy.html` was created but not committed, so the policy URL was dead. Check `git status` before pushing.
- The new app reused Guessing Game's icon. Give each app its own icons before building.
- Bubblewrap may skip version codes (1 → 3). That's fine; it only needs to be higher than the last upload.
- Unused apps in closed testing can't be deleted directly: Advanced settings → Unpublish first, then Delete app (needs the registration Transaction ID from the Google Payments receipt email).
