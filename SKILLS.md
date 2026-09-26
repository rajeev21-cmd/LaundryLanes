<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Agent Onboarding — SKILLS.md</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a></sub></p>

---

This file gives any AI agent (or human) picking up this project everything needed to continue work without re-reading the whole history. For decision-by-decision rationale, see [`CONTEXT.md`](CONTEXT.md). For unresolved questions to route to the site owner, see [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

## 🧺 What this project is

**Laundrylanes**, a dry-cleaning/laundry pickup-and-delivery business. This repo is a **Next.js proof-of-concept**: the public marketing site, plus four fully interactive role-based workflows — **customer** (book/track pickups), **store** (accept pickup requests, assign riders, walk a ticket through processing), **rider** (collect pickups, scan bags/garments, deliver), **owner** (cross-store overview/management, full ticket tracking). There is **no real backend** — auth and data are mocked from `data/*.json`, seeded into `localStorage` on first load. See [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the real backend this stands in for, and [`CONTEXT.md`](CONTEXT.md) for why it's built this way.

Every collection request is a **ticket**, tracked through a 12-stage lifecycle with two real sub-entities — **Bag** and **Cloth** — created live as the rider scans them during pickup. This is the core domain model; see below.

## 🛠️ Stack

- **Next.js (App Router) + React, plain JavaScript** — no TypeScript, no CSS framework, one global stylesheet.
- **Mock "backend": `lib/AppProvider.jsx`.** A client-side React context that seeds state from `data/users.json` / `stores.json` / `services.json` / `tickets.json` / `bags.json` / `clothes.json`, persists all mutations to `localStorage`, and exposes every lifecycle action (see below). **Every page reads/writes through this context — nothing talks to a real API.**
- **Leaflet.js 1.9.4 + OpenStreetMap tiles** (CDN-loaded in `app/layout.jsx`, used by `components/StoreLocator.jsx`) — no API key needed.
- **Google Fonts** (Playfair Display + Inter) via CDN link tags.

> Do not introduce TypeScript, a CSS framework, or a real backend call unless the task genuinely requires it. If/when a real backend is built (see `BACKEND_PLAN.md`), the intended seam is `lib/AppProvider.jsx` — swap its localStorage-backed functions for real API calls; the rest of the app (components, pages) shouldn't need to change since they only ever call `useApp()`.

## 🎫 The ticket lifecycle (the core domain model — read this before touching status logic)

`lib/constants.js`'s `STATUS_ORDER` is the canonical, ordered list:

```
pickup_scheduled → pickup_request_accepted → driver_arriving_for_pickup → pickup_in_progress
→ picked_up → arrived_at_store → washing → ironing → packed
→ ready_for_delivery → out_for_delivery → delivered
```

...plus an off-path `cancelled` (reachable only from `pickup_scheduled`, by the customer). `STATUS_LABELS` has display names; `STATUS_DRIVER` documents who/what moves a ticket out of each status (shown in the UI too) — **only `pickup_scheduled` is automatic**, every other transition is a specific role tapping a specific button in `components/TicketDetail.jsx`. Don't add a new status without updating `STATUS_ORDER`, `STATUS_LABELS`, `STATUS_DRIVER`, the CSS `.status-<name>` color rule in `styles/globals.css`, and the relevant action in `AppProvider`.

**Who does what:**
- **Store**: `pickup_scheduled` → assigns a rider (`assignRiderForPickup`) → `pickup_request_accepted`. Later, once `picked_up`: `markArrivedAtStore` → `arrived_at_store`; `startWashing` → `washing`; `startIroning` → `ironing`; `markPacked` → `packed`; then assigns a rider for delivery (`assignRiderForDelivery`) → `ready_for_delivery`.
- **Rider** (only if `ticket.assignedRiderId === currentUser.id`): `pickup_request_accepted` → taps "Collect Ticket" (`riderCollect`) → `driver_arriving_for_pickup` → taps "Scan Bag" (`scanBag`, creates/scans a `Bag`) → `pickup_in_progress` → tags & scans each garment (`addCloth`, creates a `Cloth` per item) → taps "Finish Pickup" (`finishPickup`, requires ≥1 scanned item) → `picked_up`. Later: `ready_for_delivery` → "Start Delivery" (`startDelivery`) → `out_for_delivery` → "Mark Delivered" (`markDelivered`) → `delivered`.
- **Customer**: can `cancelTicket` only while `pickup_scheduled`.
- **Owner**: never mutates a ticket — same `TicketDetail` component renders with no action panel for that role.

## 📦 Bag & Cloth — real entities, not status metadata

- `data/bags.json`: `{ id, code, ticketId, scanned }`. One bag per ticket, created by `scanBag()` the first time a rider scans it (code auto-generated, e.g. `BAG-2001`).
- `data/clothes.json`: `{ id, ticketId, tag, label }`. Each garment the rider tags during `pickup_in_progress` via `addCloth(ticketId, label)` (auto-generates a `tag` like `TAG-<id>`).
- Look these up with `getBagForTicket(ticketId)` / `getClothesForTicket(ticketId)` from `useApp()` — never filter `bags`/`clothes` by hand in a component.
- **"Scanning" is simulated** — a button click / form submit, not a real camera or barcode reader. If real scanning hardware is wanted later, `scanBag`/`addCloth` in `lib/AppProvider.jsx` are the functions to wire up to it.

## 🗂️ File structure

```
laundry/
├── app/
│   ├── layout.jsx              # root layout: fonts, Leaflet CSS, AppProvider wrapper, PWA meta
│   ├── page.jsx                 # public marketing home
│   ├── login/page.jsx           # login form + demo-role quick buttons
│   ├── customer/                # layout.jsx (RoleGuard+AppShell) + page.jsx, book/, tickets/, tickets/[id]/
│   ├── store/                   # layout.jsx + page.jsx (pickup requests), tickets/, tickets/[id]/
│   ├── rider/                   # layout.jsx + page.jsx (my schedule), tickets/[id]/
│   └── owner/                   # layout.jsx + page.jsx (overview), stores/, tickets/, tickets/[id]/, users/
├── components/
│   ├── AppShell.jsx              # top bar + hamburger drawer; nav items from lib/nav.js per role
│   ├── RoleGuard.jsx             # redirects to /login if current user's role != route's role
│   ├── TicketCard.jsx            # clickable ticket summary, used in every list view
│   ├── TicketDetail.jsx          # THE shared, role-aware ticket page — timeline + bag/garments + actions
│   ├── TicketTimeline.jsx        # the 12-stage progress stepper
│   ├── StatusBadge.jsx           # small colored pill for a ticket's status
│   ├── MarketingHeader.jsx, MarketingFooter.jsx, StoreLocator.jsx   # public site only
├── lib/
│   ├── AppProvider.jsx           # the mock auth+data context; every lifecycle action lives here
│   ├── nav.js                    # NAV_ITEMS map: role → hamburger menu entries
│   ├── constants.js              # STATUS_LABELS/STATUS_ORDER/STATUS_DRIVER, SLOT_LABELS, ROLE_LABELS, ROLE_HOME
│   └── haversine.js              # distance calc, shared by StoreLocator + booking form
├── data/
│   ├── users.json                 # demo accounts: customer/store/rider/owner roles, plaintext passwords (fake data only)
│   ├── stores.json                # placeholder Bengaluru stores
│   ├── services.json              # the 5 services
│   ├── tickets.json                # ~19 seed tickets using dayOffset (see below), spanning the full lifecycle
│   ├── bags.json                   # seed bags for tickets already at picked_up or later
│   └── clothes.json                # seed garments for those same tickets
├── styles/globals.css            # brand tokens + marketing styles + app-shell/dashboard/timeline styles
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

- `data/users.json`: each user has `role` (`customer`/`store`/`rider`/`owner`), `email`, `password` (plaintext — it's all fake data, fine for a public repo), and for `store`/`rider` roles, a `storeId`.
- `lib/AppProvider.jsx`'s `login(email, password)` matches against that array; `loginAsRole(role)` (used by the login page's demo buttons) just grabs the first user with that role.
- The logged-in user's id is persisted to `localStorage`, so refreshing stays logged in.
- Every role's route group (`app/customer/`, etc.) has a `layout.jsx` that wraps children in `<RoleGuard role="...">` then `<AppShell>`. `RoleGuard` redirects to `/login` if there's no user or the wrong role — **this is the only access control that exists**; there is no server-side enforcement (there's no server). Don't treat this as real security.

## 🧭 How the role-based hamburger nav works

`components/AppShell.jsx` is shared by all four roles. It reads `NAV_ITEMS[currentUser.role]` from `lib/nav.js` to render the drawer's links — that's the entire mechanism for "different tabs per role." To add a page to a role's nav, add both the Next.js route under that role's folder *and* an entry in `lib/nav.js`.

## 🎫 How tickets/bookings work

- `data/tickets.json` entries have a `dayOffset` (integer, e.g. `0`/`-1`/`1`) instead of a fixed date. `AppProvider` converts these to real `pickupDate` strings (relative to whenever the app is actually loaded) at seed time — **don't hardcode dates in seed data**, always use `dayOffset` so "today's pickups" stays meaningful no matter when someone runs the demo.
- Booking a pickup (`app/customer/book/page.jsx`) calls `bookPickup()`, which auto-assigns the nearest store via `lib/haversine.js` if the customer shared their location, else defaults to `stores[0]`, and creates the ticket at `pickup_scheduled`.
- See "The ticket lifecycle" above for the full status flow and which action function drives each transition.

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

Open `http://localhost:3000`. Use the "🔄 Reset demo data" option in the hamburger drawer to wipe local mutations and reseed. Also deployed at the Vercel URL in `README.md` — that deployment has its own `vercel.json` forcing Next.js framework detection (the Vercel project's dashboard setting was stuck on "Other," which silently serves only `public/` as static output — see the git history around that fix if this ever regresses).

## ✅ Conventions to follow when extending this project

1. **All data access goes through `useApp()` (`lib/AppProvider.jsx`).** Don't read `data/*.json` directly from a page/component — that bypasses the mock persistence layer and breaks the "swap this for a real API later" seam.
2. **Ticket status changes go through a named `AppProvider` action** (`assignRiderForPickup`, `scanBag`, `markPacked`, etc.), never a generic `updateTicket(id, {status: ...})` from a component — the point is that every transition is an explicit, named, role-checked action, matching the real operational workflow.
3. **All ticket actions live in `components/TicketDetail.jsx`**, not in list cards (`TicketCard.jsx` is a summary + link only). Keep it that way — with 12 statuses and a multi-step pickup flow, per-card action buttons stopped being maintainable.
4. **Update `CONTEXT.md`** with any non-obvious decision (why, not just what) as you go — it's the project's memory across sessions/agents.
5. **Route unresolved product decisions to `OPEN_QUESTIONS.md`** rather than guessing silently — append new numbered questions, keep old ones (with answers filled in) for history.
6. **Match the illustrative, minimal-text visual style** on the marketing site (inline SVG line art in brand colors) — avoid stock photography there unless the brand direction changes.
7. **Don't hardcode fake data as if real** without flagging it — everything in `data/*.json` is a placeholder; if you add more, note it in `OPEN_QUESTIONS.md` so it doesn't ship silently.
8. **One change per PR** if you're processing a `change-requests/` entry — see the `apply-change-requests` skill for the full workflow.
9. **Don't add TypeScript or a CSS framework** to this POC without the project owner asking — it's deliberately minimal so it stays fast to iterate on.
