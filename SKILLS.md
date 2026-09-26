<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Agent Onboarding — SKILLS.md</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a></sub></p>

---

This file gives any AI agent (or human) picking up this project everything needed to continue work without re-reading the whole history. For decision-by-decision rationale, see [`CONTEXT.md`](CONTEXT.md). For unresolved questions to route to the site owner, see [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

## 🧺 What this project is

**Laundrylanes**, a dry-cleaning/laundry pickup-and-delivery business. This repo is a **Next.js proof-of-concept**: the public marketing site, plus four fully interactive role-based workflows — **customer** (book/track pickups), **store** (assign today's pickups to workers), **worker** (work their own schedule), **owner** (cross-store overview/management). There is **no real backend** — auth and data are mocked from `data/*.json`, seeded into `localStorage` on first load. See [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the real backend this stands in for, and [`CONTEXT.md`](CONTEXT.md) for why it's built this way (short version: fastest path to a fully clickable POC of every workflow before investing in Supabase/auth).

## 🛠️ Stack

- **Next.js (App Router) + React, plain JavaScript** — no TypeScript, no CSS framework, one global stylesheet.
- **Mock "backend": `lib/AppProvider.jsx`.** A client-side React context that seeds state from `data/users.json` / `stores.json` / `services.json` / `orders.json`, persists all mutations to `localStorage`, and exposes `login`, `loginAsRole`, `logout`, `bookPickup`, `assignWorker`, `updateOrderStatus`, `cancelOrder`, `resetDemoData`. **Every page reads/writes through this context — nothing talks to a real API.**
- **Leaflet.js 1.9.4 + OpenStreetMap tiles** (CDN-loaded in `app/layout.jsx`, used by `components/StoreLocator.jsx`) — no API key needed.
- **Google Fonts** (Playfair Display + Inter) via CDN link tags.

> Do not introduce TypeScript, a CSS framework, or a real backend call unless the task genuinely requires it. If/when a real backend is built (see `BACKEND_PLAN.md`), the intended seam is `lib/AppProvider.jsx` — swap its localStorage-backed functions for real API calls; the rest of the app (components, pages) shouldn't need to change since they only ever call `useApp()`.

## 🗂️ File structure

```
laundry/
├── app/
│   ├── layout.jsx              # root layout: fonts, Leaflet CSS, AppProvider wrapper, PWA meta
│   ├── page.jsx                 # public marketing home
│   ├── login/page.jsx           # login form + demo-role quick buttons
│   ├── customer/                # layout.jsx (RoleGuard+AppShell) + page.jsx, book/, orders/
│   ├── store/                   # layout.jsx + page.jsx (today's pickups), orders/
│   ├── worker/                  # layout.jsx + page.jsx (my schedule)
│   └── owner/                   # layout.jsx + page.jsx (overview), stores/, orders/, users/
├── components/
│   ├── AppShell.jsx              # top bar + hamburger drawer; nav items from lib/nav.js per role
│   ├── RoleGuard.jsx             # redirects to /login if current user's role != route's role
│   ├── OrderCard.jsx, StatusBadge.jsx   # shared order display, used by all 4 roles
│   ├── MarketingHeader.jsx, MarketingFooter.jsx, StoreLocator.jsx   # public site only
├── lib/
│   ├── AppProvider.jsx           # the mock auth+data context described above
│   ├── nav.js                    # NAV_ITEMS map: role → hamburger menu entries
│   ├── constants.js              # STATUS_LABELS, SLOT_LABELS, ROLE_LABELS, ROLE_HOME
│   └── haversine.js              # distance calc, shared by StoreLocator + booking form
├── data/
│   ├── users.json                 # demo accounts, all 4 roles, plaintext passwords (fake data only)
│   ├── stores.json                # placeholder Bengaluru stores
│   ├── services.json              # the 5 services
│   └── orders.json                 # ~15 seed orders using dayOffset (see below), not fixed dates
├── styles/globals.css            # brand tokens + marketing styles + app-shell/dashboard styles
├── public/images/logo.webp
├── change-requests/                # inbox for proposed changes + apply-change-requests skill
├── CONTEXT.md, OPEN_QUESTIONS.md, BACKEND_PLAN.md, SKILLS.md, README.md
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

All defined as CSS custom properties in `:root` at the top of `styles/globals.css` — change values there, not per-component.

## 🔐 How mock auth + roles work

- `data/users.json`: each user has `role` (`customer`/`store`/`worker`/`owner`), `email`, `password` (plaintext — it's all fake data, fine for a public repo), and for `store`/`worker` roles, a `storeId`.
- `lib/AppProvider.jsx`'s `login(email, password)` matches against that array; `loginAsRole(role)` (used by the login page's demo buttons) just grabs the first user with that role.
- The logged-in user's id is persisted to `localStorage`, so refreshing stays logged in.
- Every role's route group (`app/customer/`, etc.) has a `layout.jsx` that wraps children in `<RoleGuard role="...">` then `<AppShell>`. `RoleGuard` redirects to `/login` if there's no user or the wrong role — **this is the only access control that exists**; there is no server-side enforcement (there's no server). Don't treat this as real security.

## 🧭 How the role-based hamburger nav works

`components/AppShell.jsx` is shared by all four roles. It reads `NAV_ITEMS[currentUser.role]` from `lib/nav.js` to render the drawer's links — that's the entire mechanism for "different tabs per role." To add a page to a role's nav, add both the Next.js route under that role's folder *and* an entry in `lib/nav.js`.

## 📦 How orders/bookings work

- `data/orders.json` entries have a `dayOffset` (integer, e.g. `0`/`-1`/`1`) instead of a fixed date. `AppProvider` converts these to real `pickupDate` strings (relative to whenever the app is actually loaded) at seed time — **don't hardcode dates in seed data**, always use `dayOffset` so "today's pickups" stays meaningful no matter when someone runs the demo.
- Status flow: `pending → assigned → picked_up → in_progress → delivered`, or `→ cancelled` from `pending`. `lib/constants.js`'s `STATUS_LABELS`/`STATUS_ORDER` are the source of truth for valid statuses — don't invent new ones without updating both that file and `components/OrderCard.jsx`/the worker page's `NEXT_STATUS` map.
- Booking a pickup (`app/customer/book/page.jsx`) calls `bookPickup()`, which auto-assigns the nearest store via `lib/haversine.js` if the customer shared their location, else defaults to `stores[0]`.

## 📍 How the store locator (public site) works

- Same `haversine.js` distance calc as the booking flow, driven by `data/stores.json` instead of a hardcoded array.
- "Use My Location": browser Geolocation API → distance sort → re-center map, drop a "you are here" marker.
- If real geocoding is needed later (addresses without lat/lng), consider Nominatim (OSM's free geocoder) or a paid geocoding API — not yet implemented.

## 🚀 Running / previewing the app

```bash
cd /Users/hsingh17/laundry
npm install
npm run dev
```

Open `http://localhost:3000`. Use the "🔄 Reset demo data" option in the hamburger drawer to wipe local mutations and reseed.

## ✅ Conventions to follow when extending this project

1. **All data access goes through `useApp()` (`lib/AppProvider.jsx`).** Don't read `data/*.json` directly from a page/component — that bypasses the mock persistence layer and breaks the "swap this for a real API later" seam.
2. **Update `CONTEXT.md`** with any non-obvious decision (why, not just what) as you go — it's the project's memory across sessions/agents.
3. **Route unresolved product decisions to `OPEN_QUESTIONS.md`** rather than guessing silently — append new numbered questions, keep old ones (with answers filled in) for history.
4. **Match the illustrative, minimal-text visual style** on the marketing site (inline SVG line art in brand colors) — avoid stock photography there unless the brand direction changes.
5. **Don't hardcode fake data as if real** without flagging it — everything in `data/*.json` is a placeholder; if you add more, note it in `OPEN_QUESTIONS.md` so it doesn't ship silently.
6. **One change per PR** if you're processing a `change-requests/` entry — see the `apply-change-requests` skill for the full workflow.
7. **Don't add TypeScript or a CSS framework** to this POC without the project owner asking — it's deliberately minimal so it stays fast to iterate on.
