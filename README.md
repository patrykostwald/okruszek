# Okruszek (Crumbi)

A browser game about a tiny bird who flew too high and got lost among the clouds. You follow it into the screen through theatre-like layers of clouds, and the faster it flies, the more colour returns to the world. The interface is in Polish.

**Play:** https://zbudujmi.com/crumbi/

## Status

Live as an installable PWA. Work happens on short-lived task branches (`z*`, `m*`, `qa*`), each one a numbered work package with its own tests and screenshots; `main` is the integrated line.

## Features

- Third-person flight into the screen through layered cloud "wings", controlled with a single thumb on a phone or with the keyboard and mouse
- Colour tied to speed: the world starts as white line art and blooms into full colour at top speed
- Obstacles, predators and air currents, a day and night cycle and several lands to fly through
- A lane-based track mode and a side roll to dodge
- Procedural sound and music (Web Audio), haptic feedback on supported devices, reduced-motion support
- Progress is stored only in the browser (localStorage) and can be deleted from the privacy panel
- Installable, with offline support

## Stack

Plain HTML5 Canvas and JavaScript in a single page, no runtime dependencies and no build step. Sound is synthesized in the browser. Automated play tests drive the game headlessly with bots and measure frame timing.

## Run locally

Serve the folder with any static file server and open it in a browser, for example:

```
python -m http.server 8080
```

Then open `http://localhost:8080/`. A `?test` query parameter enables the hooks used by the test scripts.

## Tests

The play tests (`gra_test_z*.cjs`), diagnostics (`diag_*.cjs`) and the pre-flight script are Node scripts that use Playwright, which is not bundled with the repository. The pre-flight script takes the page to check as an argument:

```
node preflight.cjs index.html
```

## Structure

```
index.html              the game: markup, styles and logic
teksty.js               texts
dzwiek.js               sound synthesis
sw.js                   service worker
manifest.webmanifest    PWA manifest
ikona-*.png             app icons
PROJEKT.md              game design document (Polish)
ZLECENIA*.md            task briefs for each development round (Polish)
fabula/                 story and content tables
gra_test_z*.cjs         play tests and bots
diag_*.cjs, pomiar_*.cjs  performance diagnostics
preflight.cjs           pre-release check
qa/, raporty/, kontekst/  QA measurements and reports
zrzuty-*/               screenshots produced by the tests
```

## License

All rights reserved.
