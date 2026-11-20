# How to publish a web app (PWA) as a Google Play app: a beginner's manual

> **Use this file when publishing a new app for the first time.** For updates to an app that is already on Play, use `PLAY_PUBLISHING.md`.

Nov 20, 2026 · written after publishing **אלפי - אלופי האותיות** (`com.raviv.alfi`)

This manual takes a web game that already runs on `ravivh.com/<app>/` and turns it into an Android app in a Google Play **closed test**. Follow the parts in order. Plan on about half a day of work, then up to 7 days for Google's review and 14 days of closed testing before you can go to production.

Words you will see:

- **PWA**: a web app that can be installed. It needs a `manifest.json` and a service worker (`sw.js`).
- **TWA / Bubblewrap**: Google's tool that wraps the website in a small Android app. The app just opens the website full screen.
- **.aab (app bundle)**: the file you upload to Play.
- **Upload key**: your own signing key. You need it for every future update. Never lose it, and never put it in git.
- **App signing key**: Google's own key. Play re-signs your app with it.
- **assetlinks.json**: a file on the website that proves the app and the site belong together. Without it, the app shows a browser address bar.

---

## Part 0: What you need before you start

- [ ] A Google Play developer account (Play Console). Personal accounts must run a closed test with at least 12 testers for 14 days before production.
- [ ] The website repo `guessingGame` (GitHub Pages, published at `ravivh.com`) cloned on your PC.
- [ ] On the PC: Node.js, Java (JDK 17) and the Android SDK. Bubblewrap offers to download Java and the SDK the first time it runs.
- [ ] Bubblewrap, always the latest version: `npm i -g @bubblewrap/cli@latest`
- [ ] A tester email list in Play Console. We use the list `raviv` (18 testers).

---

## Part 1: Get the web app ready

Everything Google checks must be **live on the internet** before you submit. Google's robot visits these URLs.

1. The app folder in the repo, for example `alfi/`, must contain:
   - `index.html`
   - `manifest.json` with `name`, `short_name`, `start_url`, `display: "standalone"`, colours and icons
   - `sw.js` (service worker)
   - `icons/icon-192.png` and `icons/icon-512.png`. These must be the app's **own** icons; don't copy another app's.
2. Add `privacy.html` in the app folder. Copy `alfi/privacy.html` and change the name and the data part. Say honestly what leaves the device. If nothing does, say so.
3. Check the app on a **phone-sized screen** (360–412 px wide) in Chrome DevTools. In alfi the top bar was 615 px wide and ran off the screen on phones. We fixed it with a `@media (max-width:640px)` rule.
4. Whenever you change files, raise the cache name in `sw.js` (for example `alfi-v2` → `alfi-v3`). Otherwise installed copies keep the old version.
5. Commit and **push**:
   ```
   git add alfi
   git commit -m "alfi: ..."
   git push
   ```
   Pushing must be done from a terminal on your own PC. Claude (Cowork) can commit but cannot push.
6. Open these in a browser and make sure each one loads (no 404):
   - `https://ravivh.com/<app>/`
   - `https://ravivh.com/<app>/privacy.html`
   - `https://ravivh.com/<app>/manifest.json`

---

## Part 2: Create the app in Play Console

Play Console → Home → **Create app**.

| Field | What to enter |
| --- | --- |
| App name | The name in the store, up to 30 characters (e.g. `אלפי - אלופי האותיות`). You can change it later in the store listing. |
| Package name | `com.raviv.<app>`. Click **Check availability**. It can **never** be changed later, and it must match the Bubblewrap package ID in Part 7. |
| Default language | Hebrew – iw-IL |
| App or game | Game (or App) |
| Free or paid | Free |
| Declarations | Tick Developer Program Policies and US export laws |

Click **Create app**.

---

## Part 3: App content (Policy → App content)

Every item on this page must be finished before review. Do them in this order, because some depend on others.

1. **Privacy policy**: `https://ravivh.com/<app>/privacy.html` → Save.
2. **Ads**: "No, my app does not contain ads".
3. **Sign in details**: "No" (no part of the app needs a login).
4. **Advertising ID**: No.
5. **Government apps**: No.
6. **Financial features**: tick "My app doesn't provide any financial features" → Next → Save.
7. **Health apps**: tick "My app does not have any health features" → Save.
8. **Content ratings** (do this before Target audience):
   - Email, category **Game**, tick the IARC Terms of Use.
   - Answer every question truthfully. For a kids' learning game the answers are all "No" (cartoon whack-a-mole is fine).
   - Save, then on the summary page Save again. Result: General / All ages.
9. **Target audience and content**:
   - Ages: for a young kids' game, **5 and under** and **6–8**. Choosing children puts the app in the **Designed for Families** program.
   - Tick the COPPA/GDPR compliance certification.
   - Teacher Approved: "Do not include".
   - Save.
10. **Data safety** (do this after Target audience, or it refuses to submit):
    - If nothing leaves the device: "Does your app collect or share any of the required user data types?" → **No**.
    - Go through to Preview → Save.

---

## Part 4: Store listing (Grow users → Store listings → Default listing)

| Item | Rule | Tip |
| --- | --- | --- |
| App name | ≤ 30 chars | |
| Short description | ≤ 80 chars | One Hebrew line on what the app does |
| Full description | ≤ 4000 chars | What's inside, who it's for, "no ads, no sign-up, works offline" |
| App icon | 512×512 PNG, ≤ 1 MB | Use `icons/icon-512.png` |
| Feature graphic | exactly 1024×500 PNG/JPG | Icon + app name + short tagline in the app's colours |
| Phone screenshots | 2–8 images, 9:16, 320–3840 px per side | We used 6 at 1080×1920 |

How to make screenshots: open the app in Chrome, DevTools → device toolbar, set a 9:16 size (e.g. 432×768 or 648×1152), play to the screens you want, then "Capture screenshot". Show the start screen, the main menu, and 3–4 different games. Keep the image files in a folder outside the app folder (we used `alfi-play-assets/`).

Images are added through the **Add assets** side panel: Upload → pick the file. Then **Next** → AI asset declaration: "Don't label assets" → **Save**.

**Store settings** (Grow users → Store settings):

- App category: Game → **Educational**.
- Contact email: `ravivhilleli@gmail.com`.

---

## Part 5: Build the Android app with Bubblewrap

Run this in **PowerShell**. Under Git Bash the build fails with "gradlew.bat is not recognized".

```
npm i -g @bubblewrap/cli@latest
mkdir C:\Users\Raviv.Hilleli\<app>App
cd C:\Users\Raviv.Hilleli\<app>App
bubblewrap init --manifest=https://ravivh.com/<app>/manifest.json
```

`init` asks questions:

- Package ID: `com.raviv.<app>`, exactly as in Play Console.
- App name, launcher name, colours: the defaults from the manifest are fine.
- Signing key: let it create a new one. Write down the key password and keystore password. Keep the keystore and passwords together in a safe place backed up outside git (we keep them in `C:\Users\Raviv.Hilleli\signing-keys\<app>\`).

**Before building, check the Android target level.** Open `app\build.gradle` and look for:

```
targetSdkVersion 36
```

Play requires the current level (API 36 as of Nov 2026). Our first alfi build came out as `targetSdkVersion 35`, which Play would have rejected. If it isn't 36, change it by hand. Also set the browser helper to the same version as the newest working app (`androidbrowserhelper:2.7.4`).

Then build:

```
bubblewrap build
```

It asks for the two passwords and creates:

- `app-release-bundle.aab`: upload this to Play.
- `app-release-signed.apk`: you can install this on a phone to try it first.

Write down the **upload key SHA-256 fingerprint**. Bubblewrap prints it, or use `keytool -list -v -keystore android.keystore`.

> **Do not run `bubblewrap update` afterwards.** It regenerates the project from its template and can put the target level back to 35. For a new version: raise `versionCode` in `app\build.gradle` (and `appVersionCode` in `twa-manifest.json` to match), then run only `bubblewrap build`.

---

## Part 6: Closed test release

Test and release → **Closed testing** → **Closed testing - Alpha** → Manage track.

1. **Countries / regions** tab → Add countries → search **Israel** → tick it → Save.
2. **Testers** tab → tick the email list `raviv` → Feedback URL or email: `ravivhilleli@gmail.com` → Save.
3. **Create new release**:
   - Upload `app-release-bundle.aab`. Wait until the table shows Version 1 (1) and **Target SDK 36**.
   - Release name: Play suggests `1 (1)`; keep it.
   - Release notes (Hebrew), between the language tags:
     ```
     <iw-IL>
     גרסה ראשונה לבדיקת טסטרים.
     </iw-IL>
     ```
   - Next → Save → "Go to overview".

---

## Part 7: Link the app and the website (assetlinks.json)

After the first upload, Google creates its own signing key.

1. Go to Test and release → App integrity → **App signing**. Scroll down to the **Digital Asset Links JSON** and copy the SHA-256 fingerprint shown there.
2. In the repo, add an entry to `.well-known/assetlinks.json` with **both** fingerprints (Google's app-signing one and your upload key):
   ```json
   {
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.raviv.<app>",
       "sha256_cert_fingerprints": [
         "<Play app-signing SHA-256>",
         "<your upload key SHA-256>"
       ]
     }
   }
   ```
3. Commit, push, and check that `https://ravivh.com/.well-known/assetlinks.json` contains the new package.

---

## Part 8: Send for review

1. Go to **Publishing overview**. Play runs "quick checks" first (up to about 15 minutes).
2. If an issue appears, click **View issues**, fix it, and wait for the checks to run again.
3. When **Submit N changes for review** turns blue, click it → **Send changes for review**.
4. The review takes up to 7 days. When it's approved, copy the opt-in link from Closed testing → Testers and send it to the testers.
5. After **14 days** with **12+** testers opted in: Dashboard → **Apply for production**.

---

## Problems we hit and how we fixed them

| Problem | Fix |
| --- | --- |
| "Privacy policy page returns a page not found error" although the page loads fine | Play checked the URL before it was pushed and remembered the 404. Change the URL in App content → Privacy policy to a fresh address for the same page, e.g. `.../privacy.html?v=2`, Save, and wait for the checks to rerun. |
| Bubblewrap built `targetSdkVersion 35` | Set `targetSdkVersion 36` in `app\build.gradle`, rebuild with `bubblewrap build` only. |
| `gradlew.bat is not recognized` | Build from PowerShell, not Git Bash. |
| Target audience says you can't select ages under 13 | Do the Content rating questionnaire first. |
| Data safety won't submit | Finish Target audience first. |
| Top bar overflows on phones | Test at 360 px wide; shrink or hide toolbar items with a media query. |
| App opens with a browser address bar | `assetlinks.json` is missing Google's app-signing fingerprint, or wasn't pushed. |
| Unused closed-testing app can't be deleted | Advanced settings → Unpublish first, then Delete app (needs the registration Transaction ID). |

See also `PLAY_PUBLISHING.md` for the short playbook used for English Quiz and Guessing Game.
