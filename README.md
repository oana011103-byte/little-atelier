# Petal Photobooth

A browser-based photobooth with camera capture, photo uploads, textured frames, editable emoji stickers, and PNG export. Responsive desktop and mobile layouts. Photos are processed locally in the browser.

## Run locally

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. Camera capture requires HTTPS or localhost.

## Deployment

GitHub Pages serves the root of the `main` branch. Push updates to `main` to publish.

## Assets

- Emoji annotations: Unicode / CLDR, see `assets/UNICODE-LICENSE.txt`.
- SVG artwork: Twitter Twemoji, CC BY 4.0; see `assets/stickers/LICENSE-GRAPHICS`.
- Demo portrait: https://images.unsplash.com/photo-1524504388940-b1c1722653e1
- Handwriting font and supplied textures provided for this project. No blanket license is granted for these assets.

## Current workflow

Layout → Camera → Borders → Stickers → Save. Classic strips export at 600 × 1800 pixels (1:3); wide sheets at 1200 × 1800. Camera defaults to one shot at a time with a five-second countdown; automatic sequences include a pause between poses. Borders have named categories, supplied image stickers support moving, scaling and rotation, and export supports PNG and JPEG. The English interface uses system Courier and Georgia fonts.

The supplied artwork in `assets/supplied/` is user-provided material for this project, with no blanket redistribution license granted.
