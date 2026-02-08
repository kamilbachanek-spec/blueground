# Blueground Banner Preview Tool

A local developer tool for previewing and testing HTML5 Blueground banners in a realistic context alongside any Blueground page.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
blueground/
├── public/
│   └── banners/              # Your HTML5 banner folders (served as static files)
│       ├── 300x250/
│       │   ├── index.html
│       │   ├── styles.css
│       │   ├── main.js
│       │   └── feed.csv
│       ├── 336x280/
│       ├── 728x90/
│       └── 160x600/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main layout (two-column: page iframe + controls/banner)
│   ├── bannerConfig.ts       # Banner size definitions
│   ├── index.css             # Global styles
│   └── components/
│       ├── UrlInput.tsx       # Blueground URL input + load button
│       ├── SizeSelector.tsx   # Banner size dropdown
│       ├── RowIndexSelector.tsx # CSV row index numeric input
│       ├── BannerIframe.tsx   # Banner iframe wrapper with load timing
│       ├── ViewportPresets.tsx # Desktop/Tablet/Mobile page viewport toggle
│       └── Diagnostics.tsx    # Load-time diagnostics and reload log
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## How It Works

### Banner Sizes

Banner sizes are defined in `src/bannerConfig.ts`:

```ts
export const BANNER_SIZES = [
  { id: '300x250', label: '300 × 250', width: 300, height: 250, path: '/banners/300x250/index.html' },
  { id: '336x280', label: '336 × 280', width: 336, height: 280, path: '/banners/336x280/index.html' },
  { id: '728x90',  label: '728 × 90',  width: 728, height: 90,  path: '/banners/728x90/index.html' },
  { id: '160x600', label: '160 × 600', width: 160, height: 600, path: '/banners/160x600/index.html' },
];
```

Each entry maps to a folder under `public/banners/`. To add a new size, create the folder and add an entry to this array.

### Where to Place Banners

Place your banner folders inside `public/banners/`. Vite serves the `public/` directory as static files, so `/banners/300x250/index.html` resolves to `public/banners/300x250/index.html`.

Each banner folder should contain at minimum an `index.html` that is self-contained (loads its own CSS, JS, and CSV).

### CSV Row Index (`rowIndex`)

The preview tool appends a `?rowIndex=<n>` query parameter to the banner iframe URL. Your banner's JavaScript should read this parameter to select which row of CSV data to display:

```js
// Example: inside your banner's main.js
const params = new URLSearchParams(window.location.search);
const rowIndex = parseInt(params.get('rowIndex') || '0', 10);
// Then use rowIndex to pick the correct row from your parsed CSV
```

The default row index is `0`. Change it using the numeric input in the preview tool's controls panel.

## Features

- **Blueground Page Preview**: Paste any `theblueground.com` URL to see it alongside your banner
- **Banner Size Selector**: Switch between configured banner sizes via dropdown
- **CSV Row Selector**: Change the data row passed to the banner
- **Refresh Button**: Replay banner animations and re-bind CSV data
- **Viewport Presets**: Toggle the page iframe between Desktop (1200px), Tablet (768px), and Mobile (375px) widths
- **Diagnostics Panel**: View current size, banner URL, load time, and a log of recent reloads
- **Keyboard Shortcuts**: `R` to refresh banner, `←`/`→` to cycle through banner sizes

## Notes

- The Blueground page iframe may be blocked by the target site's `X-Frame-Options` or CSP headers. This is expected for some pages. The banner preview itself will always work since banners are served locally.
- This tool is for **local development only**, not production use.
