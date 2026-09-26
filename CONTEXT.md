<p align="center"><img src="assets/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Project Context</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a> · <a href="SKILLS.md">SKILLS.md</a></sub></p>

---

Running log of decisions made while building this site. Update this as the project evolves; see [`SKILLS.md`](SKILLS.md) for the condensed agent-facing summary and [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) for outstanding decisions.

## 🎨 Brand

| | |
|---|---|
| **Name** | Laundrylanes |
| **Business** | Dry cleaning, wash & fold, wash & iron, ironing, shoe cleaning |
| **USPs** | Convenience of booking, quick service delivery, pickup & drop |
| **Colors** | Navy `#0B2545` + orange `#E07A3E` on cream `#FAF6EC` — matches the supplied logo |
| **Logo** | `assets/images/logo.webp` (provided by user) |
| **Fonts** | Playfair Display (headings, serif — echoes the logo's wordmark) + Inter (body) |

## 🔗 Reference site

Built by studying **[bumbledry.com](https://bumbledry.com/#how)** (a laundry/dry-cleaning delivery service). Structure borrowed: hero → services grid → USP band → "how it works" 4-step flow → about/stats → testimonials → final CTA → footer with service-area list. Adapted copy/services to Laundrylanes' actual service list (5 services, not 8) and added a **store locator with an interactive map**, which bumbledry.com does not have — this was a requirement in the brief ("website should be able to locate the nearest store and map the client there").

## 🛠️ Tech choices

- **Plain HTML/CSS/JS**, no build step or framework. Chosen because this is a small marketing site with no dynamic backend yet — keeps local preview trivial (any static file server) and keeps the project approachable for a non-engineer to hand off later.
- **Leaflet.js + OpenStreetMap tiles** for the map (CDN-loaded, no API key required) — avoids needing a Google Maps API key/billing account for a first draft. If the client wants Google Maps styling/Places autocomplete later, swap `assets/script.js`'s map init for the Google Maps JS API (needs an API key — flagged as a follow-up, not asked in `OPEN_QUESTIONS.md` yet since Leaflet meets the stated requirement).
- **No images/photography** — brief said "minimal text with illustrative images," so hero + service icons are hand-drawn inline SVG line art in the brand colors, not photos or stock images.

## 📍 Store locator implementation

- `assets/script.js` holds a `STORES` array (name, address, lat/lng) — **currently placeholder data** for Bengaluru neighborhoods (mirrors bumbledry.com's listed service areas, since we don't have real Laundrylanes locations yet). See [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) #1.
- "Use My Location" button uses `navigator.geolocation` + a haversine distance calc to sort stores by proximity and re-center the map — no backend/geocoding API involved.
- Search box does a simple client-side substring filter on name/address.

## ⚠️ Known gaps / not yet built

- No real booking form/flow (CTA buttons currently link to a `#booking` anchor or a placeholder `tel:` link) — pending [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) #4.
- No pricing page.
- Contact info, phone numbers, social handles are all placeholders.
- Not yet deployed anywhere beyond GitHub — see [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the planned backend/hosting direction.

## 🚀 Running locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. (Plain static site — any static server works, e.g. `npx serve`.)

## 🗂️ File map

| File | Purpose |
|---|---|
| `index.html` | All page sections, single page |
| `assets/style.css` | All styling; CSS custom properties for the color system at the top |
| `assets/script.js` | Mobile nav toggle, Leaflet map init, store list rendering, geolocation, search |
| `assets/images/logo.webp` | Brand logo (from user) |
