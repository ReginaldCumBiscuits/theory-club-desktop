# The Theory Club app source

Theory Club ships as **one HTML file** (the Claude artifact, the website and the desktop/Android apps all use it).
This folder is that file taken apart, so it can be read, reviewed and changed piece by piece.

```
app/
  manifest.json      the order the pieces go back together in
  src/styles.css     all the CSS
  src/body.html      the page markup (sidebar, top bar, dialogs, tab bar)
  src/js/NN-*.js     the app's code, in load order
  data/tc-smp-*.json the built-in instrument sounds (recorded samples, base64)
```

## Build and check

```sh
node scripts/build-app.mjs            # → dist/theory-club.html (the single file)
node scripts/check-app.mjs            # parses everything and checks for clashing names
sh scripts/sync-web.sh                # builds, then updates web/index.html for the apps
python tests/smoke.py                 # the release tests (Playwright)
```

The pull-request tests fail if `web/index.html` doesn't match these modules, so always run
`sh scripts/sync-web.sh` and commit `web/index.html` with your change.

## How the code fits together

- The modules are **plain text pieces of one script**, not ES modules. They're joined in the order in
  `manifest.json`, so a module can use anything declared in an earlier one, and function declarations
  anywhere in the same block.
- `01`–`08` are the core: storage, random numbers, music theory, audio and drawing. Everything from
  `09-ui.js` on runs inside `if (typeof document !== 'undefined') { … }`, which closes at the end of
  `62-startup.js`. Names declared there are **not** visible to the browser console; modules that tests need
  export a few with `Object.assign(window, {…})`.
- Later modules extend earlier ones with **wrappers** instead of editing them:
  ```js
  {const _v = viewCourseStage; viewCourseStage = function (n) { _v(n); /* add a panel */ }}
  ```
  This keeps each feature in one place. When a later module *replaces* something outright, remove the
  earlier code rather than wrapping it again (see v52's clean-up of the old Home page and onboarding).
- Pages are drawn with `main.innerHTML = …` and re-drawn freely, so code that adds to a page usually
  watches for it with a `MutationObserver` and checks it hasn't added itself already.
- The router is `route()`: it reads `location.hash` and calls the right `view…()` function.
  `navSection()` decides which of the four sections (Today, Learn, Play, You) a page belongs to.

## Where things are

| Area | Modules |
|---|---|
| Router and start-up | `62-startup` (`route()`, test exports, launch) |
| Music theory, question generators | `03`, `08`, `20`–`22`, `36`–`37` |
| Lessons, Learn pages | `09-ui`, `18`, `32`, `38`, `41` |
| Course, checkpoints, practice time | `56` (course), `58` (practice time), `59` (gentler course page) |
| Today, sessions, reminders | `59`, `60` |
| Songs, play-alongs | `09-ui`, `25`, `27`, `60`, `61` |
| Song transcriber, AI separation, scoring | `50`–`51`, `57`, `58` |
| Jam online | `18`, `52` |
| Voice studio | `48` |
| Tone & gear | `45`–`47` |
| Accessibility | `55` |
| Navigation, onboarding, Play page | `59` |

## Adding something

1. Small change to an existing feature: edit its module.
2. A new feature: add `app/src/js/NN-name.js` and list it in `manifest.json` **before the last module**
   (`62-startup.js` closes the main block and starts the app).
3. Run the build, the check and the tests; then `sh scripts/sync-web.sh`.
