# Blueground HTML5 Banners

All sizes in one place. Pure HTML, CSS, vanilla JS — no frameworks.

## Figma → size mapping

| Size    | Figma node ID | Folder    |
|---------|----------------|------------|
| 300×250 | **210-1517**   | `300x250/` |
| 300×600 | **210-1563**   | `300x600/` |
| 728×90  | **211-1602**   | `728x90/`  |
| 336×280 | 210-1609       | `336x280/` |
| 970×250 | **216-1752**   | `970x250/` |
| 160×600 | **216-1770**   | `160x600/` |
| 320×100 | **216-1735**   | `320x100/` |

Figma file: `UEbgHMAGWVei96S580YHly` (-INT–The-Blue-Ground)

## Folder structure

```
banners/
├── 300x250/   ← Figma 210-1517
├── 300x600/   ← Figma 210-1563
├── 728x90/    ← Figma 211-1602
├── 336x280/
├── 970x250/   ← Figma 216-1752 (billboard)
├── 160x600/   ← Figma 216-1770 (wide skyscraper)
├── 320x100/   ← Figma 216-1735 (mobile leaderboard)
└── README.md
```

Each size folder contains: `index.html`, `styles.css`, `main.js`, `logo.svg`, `fonts/` (Laca: Book, Semibold, Bold).  
Place **feed.csv** in each size folder when zipping for ad networks (or copy from project root for local testing).

**Typography:** All ads use **Laca Regular (400)** everywhere. CTA button text color: **#233759**. Design reference: Figma node **216-1696**. Fonts live in each size’s `fonts/` folder (`Laca Regular.otf`) so zips stay self-contained.

## How to test locally

The banners load `feed.csv` via JavaScript, so you need to serve the files over HTTP (opening `index.html` in the browser won’t load the CSV).

**1. Put the feed in each size folder (one-time)**

From the project root (where `feed.csv` lives):

```bash
cp feed.csv banners/300x250/
cp feed.csv banners/300x600/
cp feed.csv banners/728x90/
cp feed.csv banners/336x280/
cp feed.csv banners/970x250/
cp feed.csv banners/160x600/
cp feed.csv banners/320x100/
```

**2. Start a local server**

From the **project root** (parent of `banners/`):

```bash
# Python 3
python3 -m http.server 8080

# or Node (if you have npx)
npx -y serve -p 8080
```

**3. Open a banner in the browser**

- 300×250: http://localhost:8080/banners/300x250/
- 300×600: http://localhost:8080/banners/300x600/
- 728×90: http://localhost:8080/banners/728x90/
- 336×280: http://localhost:8080/banners/336x280/
- 970×250: http://localhost:8080/banners/970x250/
- 160×600: http://localhost:8080/banners/160x600/
- 320×100: http://localhost:8080/banners/320x100/

You should see a property from the feed, the logo, and the “Book now!” CTA. Refreshing cycles to the next row (round‑robin).

---

## Deploy

Zip the **contents** of a size folder (e.g. `300x250/`): `index.html`, `styles.css`, `main.js`, `logo.svg`, `feed.csv`, and the `fonts/` folder (with the Laca `.otf` files). Upload the zip to your ad platform.
