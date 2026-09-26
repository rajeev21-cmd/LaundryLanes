<p align="center"><img src="assets/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Agent Onboarding — SKILLS.md</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a></sub></p>

---

This file gives any AI agent (or human) picking up this project everything needed to continue work without re-reading the whole history. For decision-by-decision rationale, see [`CONTEXT.md`](CONTEXT.md). For unresolved questions to route to the site owner, see [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

## 🧺 What this project is

A marketing website for **Laundrylanes**, a dry-cleaning/laundry pickup-and-delivery business. Services: dry cleaning, wash & fold, wash & iron, ironing, shoe cleaning. Core pitch: convenient booking, quick delivery, doorstep pickup & drop. The site was modeled structurally on `bumbledry.com` (a similar laundry-delivery business) but with Laundrylanes' own branding, services, and copy, plus an added interactive store locator. A backend (bookings + role-based dashboards) is planned — see [`BACKEND_PLAN.md`](BACKEND_PLAN.md) — but not yet built.

## 🛠️ Stack (deliberately minimal)

- **Static HTML/CSS/JS.** No React, no bundler, no package.json, no build step.
- **Leaflet.js 1.9.4 + OpenStreetMap tiles** (loaded via CDN in `index.html`) for the store-locator map — no API key needed.
- **Google Fonts** (Playfair Display + Inter) via CDN link tags.
- Single page (`index.html`) with anchor-linked sections; no routing/framework.

> Do not introduce a framework or build tool unless the task genuinely requires it (e.g. the planned booking backend). Keep additions consistent with "plain static site" unless the project owner asks to upgrade the stack.

## 🗂️ File structure

```
laundry/
├── index.html            # entire page markup, section by section
├── assets/
│   ├── style.css          # all styles; CSS vars for brand colors at top (:root)
│   ├── script.js          # nav toggle, Leaflet map, store list, geolocation, search
│   └── images/
│       └── logo.webp      # brand logo
├── change-requests/        # inbox for proposed changes + apply-change-requests skill
├── CONTEXT.md              # running decision log — update as you make choices
├── OPEN_QUESTIONS.md       # questions for the site owner — append/answer, don't delete history
├── BACKEND_PLAN.md         # planned booking/dashboard backend, not yet built
└── SKILLS.md               # this file
```

## 🎨 Brand system (source of truth — don't invent new values)

| Token | Value |
|---|---|
| Navy (primary) | `#0B2545` |
| Navy dark | `#071A33` |
| Navy tint | `#E7ECF3` |
| Orange (accent/CTA) | `#E07A3E` |
| Orange dark | `#C7622A` |
| Cream (background) | `#FAF6EC` |
| Headings font | `Playfair Display` (serif) |
| Body font | `Inter` |

All defined as CSS custom properties in `:root` at the top of `assets/style.css` — change values there, not per-component.

## 📍 How the store locator works

- `STORES` array in `assets/script.js`: `{ name, address, lat, lng }` objects — **currently placeholder Bengaluru data**, not real Laundrylanes stores (flagged in `OPEN_QUESTIONS.md` #1). Replace this array once real addresses/coordinates are available.
- Map rendering: Leaflet `L.map('map')` + OSM tile layer, one marker per store, popups with name/address.
- "Use My Location": browser Geolocation API → haversine distance sort → re-render store list ordered by proximity → re-center map, drop a "you are here" marker.
- Search box: client-side substring filter over name + address, no backend.
- If real geocoding is needed later (addresses without lat/lng), consider Nominatim (OSM's free geocoder, rate-limited) or a paid geocoding API — not yet implemented.

## 🚀 Running / previewing the site

```bash
cd /Users/hsingh17/laundry
python3 -m http.server 8080
```

Open `http://localhost:8080`. No install step, no dependencies to fetch (everything else is CDN-loaded at runtime).

## ✅ Conventions to follow when extending this project

1. **Keep it a static site** unless explicitly asked to add a backend/build step (see `BACKEND_PLAN.md` for the one already scoped).
2. **Update `CONTEXT.md`** with any non-obvious decision (why, not just what) as you go — it's the project's memory across sessions/agents.
3. **Route unresolved product decisions to `OPEN_QUESTIONS.md`** rather than guessing silently — append new numbered questions, keep old ones (with answers filled in) for history.
4. **Match the illustrative, minimal-text visual style** already established (inline SVG line art in brand colors) — avoid adding stock photography or dense copy blocks unless the brand direction changes.
5. **Don't hardcode fake data as if real** without flagging it — the store list, phone numbers, email, and social handles in the current build are all placeholders; if you add more placeholder content, note it in `OPEN_QUESTIONS.md` so it doesn't ship silently.
6. **One change per PR** if you're processing a `change-requests/` entry — see the `apply-change-requests` skill for the full workflow.
