# Okruszek

A browser game about a little bird lost in the clouds. Plain HTML5 Canvas and JavaScript, installable as a PWA, with no runtime dependencies.

## Status

Playable preview. Game code lives on the working branches (latest: `m3-czucie-instalacja`); `main` holds the design document and the task log.

## Layout

```
PROJEKT.md           game design: mechanics, controls, sound, levels
ZLECENIA*.md         task briefs for each development round
fabula/              story and texts
probki/              audio and visual samples
*_test*.cjs          automated play tests and bots (Playwright, headless)
diag_*.cjs           performance diagnostics: frame rate, scheduling, rendering cost
```

## Testing

Play tests drive the game headlessly with bots and measure frame timing, so regressions in feel and performance are caught before release.

```bash
node gra_test_z21.cjs
```

## License

All rights reserved.
