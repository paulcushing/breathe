## Breathe

Guided box-breathing timer built with Next.js 16, React 19, and Tailwind CSS.

---

## Features

- Animated breathing circle with inhale/hold/exhale cadence set via slider (1.0s - 10.0s per phase)
- Local session timer and localStorage persistence of preferred phase length
- Hold-phase overlay and halo animation synced with timer state
- Progressive Web App with offline cache, install prompts, and standalone display
- Accessible controls (keyboard-friendly buttons/slider, aria-live timer)

---

## Prerequisites

- Node.js 20+
- npm 10+ (recommended package manager for this repo)

Install dependencies once:

```bash
npm install
```

---

## Scripts

| Command         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `npm run dev`   | Start Next.js dev server at http://localhost:3000 with hot reload. |
| `npm run build` | Create production build (Next.js output + prerender).              |
| `npm run start` | Serve the production build (requires prior `npm run build`).       |
| `npm run lint`  | Run ESLint using the Next.js config.                               |

---

## Project Structure

```
public/
	favicon.ico           # SVG favicon (copied from icon-192x192)
	icon-192x192.svg
	icon-512x512.svg
	manifest.json         # PWA metadata
	sw.js                 # Custom service worker (cache + offline)

	globals.css           # Tailwind + custom slider/glow styles
	layout.tsx            # Root layout + PWA installer hook
	page.tsx              # Main breathing experience
	pwa-installer.tsx     # Registers sw.js on the client
exampleapp.html         # Original design reference
```

---

## PWA Notes

- `public/manifest.json` defines names, icons, colors, and `display: standalone` so iOS/Android can add it to the home screen.
- `src/app/pwa-installer.tsx` registers `public/sw.js`. The service worker precaches core assets and provides offline-first fetch handling.
- Update both `icon-192x192.svg` and `icon-512x512.svg` if branding changes; copy the 192px version to `favicon.ico` as needed.

### iOS Install Flow

iOS Safari still uses Share -> "Add to Home Screen". No automatic prompt is shown, but once installed it launches full screen using the manifest + `appleWebApp` metadata in `layout.tsx`.

---

## Development Tips

- The CSS breathing and glow animations live in `globals.css`. Adjust durations or keyframes there.
- Slider styling uses custom selectors (`.breath-slider`) because Tailwind 4 removes most native range-track utilities.
- The phase duration slider state is persisted in localStorage; if you change the valid range, clamp previous values accordingly.
- The service worker is intentionally simple (cache-first with fallback). Update `PRECACHE_URLS` inside `public/sw.js` whenever new static assets need to be available offline.

---

## Deployment Checklist

1. `npm run lint` – ensure code quality passes.
2. `npm run build` – verify Next.js can compile the app.
3. Confirm `manifest.json` references the latest icons and colors.
4. Serve the production build locally (`npm run start`) and test install/offline behavior using Chrome DevTools > Application > Service Workers.
5. Deploy via your preferred host (e.g., Vercel or any Node-compatible platform) making sure `public/` assets are served as-is.

---

## License

This project inherits the default create-next-app license terms (MIT). Update this section if you adopt a different license.
