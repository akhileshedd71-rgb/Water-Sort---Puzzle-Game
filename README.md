# Hue — Water Sort

A peaceful, mobile-first water sorting game, built with React, TypeScript, Vite, and Capacitor. All artwork, fonts, audio, and game logic ship with the app. No account, backend, advertisements, or purchases are required.

## Play

Tap a bottle, then a destination. Water pours into an empty bottle or onto the same top color, up to the four-layer capacity. Fill each occupied bottle with a single color to win. Undo, restart, hints, and one extra bottle per puzzle are free.

- **Classic:** progressively larger puzzles; 2,500 levels are checked by the automated suite, and generation continues beyond them.
- **Daily flow:** a deterministic puzzle based on the device's local calendar date; 35 gems for the first completion of each date.
- **Zen garden:** fewer colors and an additional helper bottle.
- **The studio:** four unlockable palettes, including a dark palette, plus round and square tubes.
- **Accessibility:** numbered color labels, keyboard-operable controls, reduced-motion support, and optional sounds.
- **Progress:** saved on the device, including unfinished puzzles and undo history. New Classic and Zen levels award 20 gems; replays award none. Clearing browser/app data clears progress.

## Develop

Use Node.js 22 or newer (Node 24 was tested).

```sh
npm ci
npm run dev
```

`npm run build` checks TypeScript, creates the production bundle, and generates a versioned offline asset cache. `npm run preview` serves that bundle. Browser offline play becomes available after the first successful online load; the Android APK includes its assets and works offline from first launch.

## Validate

```sh
npm test
npm run build
npm run preview
# In another terminal:
npm run test:browser
```

The engine tests validate the pouring rules, conserved colors, all 2,500 Classic solution traces, Daily/Zen generation, and opening-level hints. Browser tests exercise pours, invalid moves, undo, hints, rewards, mode switching, purchases, persistence, responsive layouts, and offline reload/play. They use `/usr/bin/chromium`; set `CHROMIUM_PATH` to another installed Chromium browser and `TEST_URL` to a different production preview URL if needed.

## Android APK

Requires JDK 21, Android SDK platform 35, and build-tools 34.0.0 (the Android Gradle plugin's default). Set `JAVA_HOME` and `ANDROID_HOME`, or open `android/` in Android Studio. The configured minimum is Android 6.0 (API 23); a current Android System WebView is required for this modern web app.

```sh
npm run android:apk
```

The script reuses the installed cloud SDK/JDK when present, syncs the production assets, builds with the Gradle wrapper, and copies the result to:

```
artifacts/hue-water-sort-debug.apk
```

This is a signed **debug APK for testing**. Transfer it to your Android phone, open it, and allow installation from the app you used to open the file if Android asks. Alternatively, use `adb install -r artifacts/hue-water-sort-debug.apk`. The package ID is `com.hue.watersort`.

Release signing and store publishing are separate work. The debug keystore is generated outside the repository. Native installation and touch/audio behavior should be checked on a physical device; this cloud validation used Chromium and the Android build/signature tools, not an Android device.

## Implementation notes

`src/engine.ts` generates puzzles by reversing only pours that the forward rules can replay. Each puzzle has a solution witness; random shuffling is never assumed to produce a solvable board. A bounded solver runs in a Web Worker for hints and reports when it cannot find a route from the current state. Pouring uses stylized glass, streams, ripples, and sound rather than a fluid simulation.

`src/storage.ts` validates saved state and falls back safely when it is unavailable. Fonts are bundled through Fontsource. The PWA caches local static assets; native builds load bundled Capacitor assets directly. There are no runtime API keys or network services.

The reference game informed the mechanics; Hue's name, UI, vector artwork, and sounds are original to this project.
