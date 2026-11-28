# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Guessing Game** is a Hebrew-language PWA implementation of a word-guessing party game, served at `https://ravivh.com/guessingGame/`. The entire app — markup, styles, logic, and 700+ word dictionary — lives in a single file, `guessingGame/index.html`, with no build pipeline.

## Where it is published (since 2026-11-24)

- `ravivh.com` is the custom domain of the user site repo **ravivhi/ravivhi.github.io** (domain root: the redirect page and `.well-known/assetlinks.json` for all the Android apps). So every `ravivhi` repo with Pages is served at `ravivh.com/<repo>/`.
- This repo publishes only the `guessingGame/` folder (`.github/workflows/pages.yml`) → ravivh.com/guessingGame/. Files outside that folder are not published.
- English Quiz, alfi, ehadi and butz are separate repos that publish themselves (ravivhi/englishQuiz, ravivhi/alfi, ravivhi/ehadi, ravivhi/butz). Nothing is synced into this repo any more.

## Android

The Guessing Game Android app (com.raviv.guessingGame) is the Bubblewrap TWA project at the repo root (only twa-manifest.json is tracked). It loads the website, so web changes need no rebuild. Keys stay in `C:\Users\Raviv.Hilleli\signing-keys\<app>` (never commit them); never run `bubblewrap update` (reverts targetSdk 36).

## Development

No build step, no package manager, no dependencies. To develop:
- Serve the repo with any static file server (e.g., `python -m http.server 8000`) and open http://localhost:8000/guessingGame/
- Deploy by pushing to `main` — the Pages workflow publishes changes to `guessingGame/`

## Architecture

**Single file: `index.html`**

The file has three logical sections:
1. **CSS** (~lines 18–226): Purple gradient theme, mobile-first responsive (breakpoint at 480px), RTL Hebrew support
2. **HTML** (~lines 228–300): Five named screens that are shown/hidden via JS — `setup-screen`, `start-screen`, `game-screen`, `summary-screen`, `names-screen`
3. **JavaScript** (~lines 302–1113): All game logic

### Key data structures

```js
// Global tournament state, persisted to localStorage as 'aliasTournamentData'
tournamentData = {
  player1: {
    name: "שחקן 1",
    totalScore: 0,
    roundsPlayed: 0,
    wordPool: [...],   // words allocated to this player
    playedWords: []    // words already used this session
  }
}
```

`masterWordsBank` is a flat array of 722 Hebrew words defined in JS. On tournament start, words are divided evenly across players — each player gets their own isolated pool.

### Screen flow

```
setup-screen → start-screen ↔ game-screen → summary-screen → start-screen
                    ↕
               names-screen
```

### Core functions

| Function | What it does |
|---|---|
| `initTournament()` | Load saved state from localStorage or show setup |
| `startTournament()` | Partition `masterWordsBank` among N players |
| `startGame(playerKey)` | Begin a 60-second round for the selected player |
| `handleAnswer(isCorrect)` | Score the current word (+1 / -1), advance to next |
| `endRound()` | Persist scores, show summary screen |
| `saveToStorage()` | Serialize `tournamentData` to localStorage |

### PWA details

Service Worker and Web App Manifest are both inline (as `<script>` and data URI). The app is fully offline-capable after first load. localStorage key `aliasDataVersion` guards schema migrations.

## Conventions

- Hebrew UI text throughout; keep new strings in Hebrew
- No frameworks — stay vanilla JS/CSS
- Screen visibility is controlled by toggling a `hidden` CSS class or `display` style directly on the screen `<div>` elements
- The 60-second game timer is managed with `setInterval`; always clear it (`clearInterval(gameTimer)`) before starting a new round

## Rules

- **Bump the cache version in `guessingGame/sw.js`** (`const CACHE = 'guessing-vN'`, +1) whenever the app's files change, so installed copies update.
- **Never rename localStorage keys** (`aliasTournamentData`, `aliasDataVersion`). Renaming one wipes players' saved games.
- **Editing `guessingGame/index.html`:** it has a BOM, mixed CRLF/LF line endings and NUL bytes at the end, so git sees it as binary. Edit it byte by byte with a small node script, changing only what you need; never convert or re-save the whole file.
- **Never commit keys or build outputs** at the repo root (`*.keystore`, `*.apk`, `*.aab`, `signing-key-info.txt`).
- **Other sessions' commits:** if one has a problem, fix it in a new commit on top; never rewrite it.

## Testing

There are no automated tests. Serve the repo (`python -m http.server 8000`), open http://localhost:8000/guessingGame/ at phone size, play through the changed screens, and check for no console errors.

## Auto-push

Every time you finish a request, test the change as above. If it works, commit and push right away, without asking. If it doesn't, fix it first; never push something broken. Ask first only for something risky, like deleting data or a big rewrite.

## After every push: watch the GitHub checks

1. Find the run: `gh run list --repo ravivhi/guessingGame --commit $(git rev-parse HEAD)`. If none is listed yet, wait a few seconds and retry.
2. Watch it in the background: `gh run watch <id> --exit-status`.
3. When it finishes, tell the user whether it passed or failed.
4. If it failed: read `gh run view <id> --log-failed`, fix the problem, test, push again and watch the new run too.
5. If no run started, say so. The Pages deploy only runs when `guessingGame/` changes.
