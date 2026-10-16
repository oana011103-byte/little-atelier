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
