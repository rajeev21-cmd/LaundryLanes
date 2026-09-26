<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Project Context</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a> · <a href="SKILLS.md">SKILLS.md</a></sub></p>

---

Running log of decisions made while building this project. Update this as the project evolves; see [`SKILLS.md`](SKILLS.md) for the condensed agent-facing summary and [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) for outstanding decisions.

## 🎨 Brand

| | |
|---|---|
| **Name** | Laundrylanes |
| **Business** | Dry cleaning, wash & fold, wash & iron, ironing, shoe cleaning |
| **USPs** | Convenience of booking, quick service delivery, pickup & drop |
| **Colors** | Navy `#0B2545` + orange `#E07A3E` on cream `#FAF6EC` — matches the supplied logo |
| **Logo** | `public/images/logo.webp` (provided by user) |
| **Fonts** | Playfair Display (headings, serif — echoes the logo's wordmark) + Inter (body) |

## 🔗 Reference site

Built by studying **[bumbledry.com](https://bumbledry.com/#how)** (a laundry/dry-cleaning delivery service). Marketing-page structure borrowed: hero → services grid → USP band → "how it works" 4-step flow → about/stats → testimonials → final CTA → footer with service-area list. Adapted copy/services to Laundrylanes' actual service list (5 services, not 8) and added a **store locator with an interactive map**, which bumbledry.com does not have — this was a requirement in the original brief.

## 🔄 v1 → v2: static site → Next.js role-based POC

The project started as a plain static HTML/CSS/JS marketing site (v1). It was rebuilt as a **Next.js app** (v2) when the ask grew to "show a complete POC of different workflows and views" for four login roles (customer/store/worker/owner) with role-based navigation. Key decisions from that rebuild:

- **Next.js (App Router) + React, plain JavaScript (no TypeScript).** A framework became necessary once there's client-side routing, auth state, and per-role layouts; TypeScript was skipped to keep this a fast-moving POC rather than adding type-authoring overhead for a mock backend that will be thrown away once `BACKEND_PLAN.md` is implemented.
- **No real backend — mock data + `localStorage`.** `data/*.json` (`users`, `stores`, `services`, `orders`) is the seed "database." `lib/AppProvider.jsx` loads it into React context on mount, persists mutations (new bookings, worker assignments, status changes) to `localStorage`, and exposes a `resetDemoData()` action (in the hamburger menu) to wipe back to the seed. This was the fastest way to make every workflow *actually interactive* — book a pickup, assign a worker, mark delivered — without standing up Supabase first. It is explicitly **not** how auth should work once real users exist; see `BACKEND_PLAN.md` for that.
- **Order dates are relative, not fixed.** `data/orders.json` stores a `dayOffset` (e.g. `0` = today, `-1` = yesterday, `1` = tomorrow) instead of a hardcoded date. `AppProvider` converts these to real dates at seed time, so "today's pickups" always has something in it regardless of when the demo is run.
- **One hamburger-driven `AppShell` for all four roles.** Rather than four separate UIs, `components/AppShell.jsx` renders the same top bar + slide-out drawer everywhere; the nav *items* change per role via `lib/nav.js`'s `NAV_ITEMS` map. `components/RoleGuard.jsx` wraps each role's `layout.jsx` and redirects to `/login` if the logged-in user's role doesn't match the route.
- **Mobile-first "webapp" styling**, not a literal phone-frame mockup: sticky top bar, safe-area padding, `manifest.json` + `apple-mobile-web-app-capable` meta so it can be added to a home screen and open in standalone mode. Desktop just gets the same layout at a comfortable max-width rather than a different design.
- **The marketing site (`app/page.jsx`) stayed largely as-is**, just ported from static HTML into JSX, with "Schedule a Pickup" CTAs now pointing at `/login` instead of a dead anchor.

## 🎫 v2 → v3: orders became tickets, with Bag/Cloth tracking and a real 12-stage lifecycle

The simple `pending → assigned → picked_up → in_progress → delivered` status model was replaced with the actual operational lifecycle: `pickup_scheduled → pickup_request_accepted → driver_arriving_for_pickup → pickup_in_progress → picked_up → arrived_at_store → washing → ironing → packed → ready_for_delivery → out_for_delivery → delivered` (plus an off-path `cancelled`). This is the domain model now — don't collapse it back down.

- **Renamed `worker` → `rider`** everywhere (role value in `data/users.json`, `app/worker/` → `app/rider/`, `ROLE_LABELS`/`ROLE_HOME`/`NAV_ITEMS`, `assignedWorkerId` → `assignedRiderId`) to match the domain language the site owner actually uses.
- **Two new tracked entities, not just status metadata**: `data/bags.json` and `data/clothes.json`, exposed via `AppProvider`'s `bags`/`clothes` state and `getBagForTicket()`/`getClothesForTicket()`. A ticket doesn't just have a status — it has an actual bag (with a code) and a list of tagged garments, created live during pickup.
- **"Scanning" is simulated, not a real camera/barcode integration.** The rider's Scan Bag button (`scanBag(ticketId)`) and the tag-and-scan mini-form (`addCloth(ticketId, label)`) are ordinary button clicks/form submits that stand in for a real scanner. If real hardware scanning is wanted later, this is the seam to replace — see `OPEN_QUESTIONS.md`.
- **`picked_up` is reached by explicit rider confirmation, not automatically.** There's no fixed expected item count to detect "done" against, so the rider taps "Finish Pickup" once they've tagged everything (button is disabled until at least one item is scanned).
- **Manual vs. automatic is documented per-status in `lib/constants.js`'s `STATUS_DRIVER` map**, and surfaced directly in the ticket detail view — only `pickup_scheduled` (ticket creation) is automatic; every other transition is a specific role tapping a specific button. This was an explicit requirement, not an implementation detail to hide.
- **All status-changing actions moved out of list cards and into a shared ticket detail page** (`components/TicketDetail.jsx`, mounted at `app/{customer,store,rider,owner}/tickets/[id]/page.jsx`). With 12 statuses and a multi-field pickup flow (scan bag → tag N items → finish), inline card actions stopped being workable; the detail page is now the single place where a ticket's timeline, bag/garment contents, and next action all live together. List pages (`TicketCard`) are just clickable summaries now.
- **Owner ticket tracking is the same detail page, just read-only** (no role-specific action panel renders for `owner`) — satisfies "each request should be tracked like a ticket in owner's dashboard" without a separate owner-only view to maintain.
- **Seed data (`data/tickets.json`) spans the whole lifecycle**, not just a few statuses — there's at least one ticket at (almost) every stage so every role's view has something realistic to show and every button in `TicketDetail` is reachable without manually driving a ticket through prior stages first.

## 🛠️ Tech choices (marketing site specifics, carried over from v1)

- **Leaflet.js + OpenStreetMap tiles** for the store locator map (loaded via CDN `<script>`/`<link>` tags in `app/layout.jsx`, no API key required) — avoids needing a Google Maps API key/billing account. If Google Maps styling/Places autocomplete is wanted later, swap `components/StoreLocator.jsx`'s map init.
- **No stock photography** — brief said "minimal text with illustrative images," so hero + service icons are hand-drawn inline SVG line art in the brand colors.

## 📍 Store & data specifics

- `data/stores.json` holds **placeholder** Bengaluru store locations (mirrors the earlier static-site placeholders) — see [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) #1.
- `data/users.json` holds demo accounts (plaintext passwords) for all four roles — safe to keep public since every account and password is fake, but flagged in the README so nobody mistakes it for real auth.
- `data/tickets.json` seeds ~19 tickets spanning today/yesterday and multiple stores/statuses across the full lifecycle, so every view has something realistic to show immediately without manually driving anything through prior stages first.
- `data/bags.json` / `data/clothes.json` seed a bag + a few tagged garments for every ticket that's already at `picked_up` or later — tickets earlier in the pickup flow (`pickup_scheduled` through `driver_arriving_for_pickup`) intentionally have none yet, so the rider demo flow (scan bag → tag items → finish pickup) has a real "starting from nothing" ticket to exercise.
- Nearest-store assignment on booking uses the same haversine logic as the old static site's locator (`lib/haversine.js`), now shared between `StoreLocator` and the customer booking form.

## ⚠️ Known gaps / not yet built

- No real backend — see `BACKEND_PLAN.md` for what wiring this to Supabase would involve. Note the data model there predates the ticket/bag/cloth rebuild and needs a `bags`/`clothes` table pass and the fuller status enum before it matches what's actually built.
- No real camera/barcode scanning — see the "scanning is simulated" note above.
- No "store manager" as a distinct sub-role — the brief mentioned "store role or store manager role" for who can accept a pickup request; currently there's just one `store` role covering that. Flagged in `OPEN_QUESTIONS.md`.
- No pricing page/pricing data.
- No payments.
- Contact info, phone numbers, social handles on the marketing site are still placeholders.
- Deployed to Vercel (see README) but as this same mock-data POC — no real backend in production either.

## 🚀 Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## 🗂️ File map

| Path | Purpose |
|---|---|
| `app/page.jsx` | Public marketing home |
| `app/login/page.jsx` | Login + one-click demo-role buttons |
| `app/customer/`, `app/store/`, `app/rider/`, `app/owner/` | One route group per role; each `layout.jsx` wraps its pages in `RoleGuard` + `AppShell`; each (except rider, which has one schedule page) has a `tickets/[id]/page.jsx` mounting the shared detail view |
| `components/AppShell.jsx` | Top bar + hamburger drawer; nav items driven by `lib/nav.js` per role |
| `components/RoleGuard.jsx` | Redirects to `/login` if the current user's role doesn't match the route |
| `components/TicketCard.jsx` | Clickable ticket summary used in every list view |
| `components/TicketDetail.jsx` | The shared, role-aware ticket page: timeline, bag/garment contents, and whichever action buttons the current user's role + the ticket's status allow |
| `components/TicketTimeline.jsx` | Renders the 12-stage progress stepper (or a "Cancelled" state) |
| `components/StatusBadge.jsx` | Small colored pill for a ticket's current status |
| `components/StoreLocator.jsx` | Leaflet map + store search, used on the public marketing page |
| `lib/AppProvider.jsx` | Mock auth + tickets/bags/clothes context, backed by `localStorage`; seeds from `data/*.json`; every lifecycle action (`assignRiderForPickup`, `scanBag`, `addCloth`, `finishPickup`, `markPacked`, `startDelivery`, ...) lives here |
| `lib/nav.js`, `constants.js`, `haversine.js` | Per-role nav items, status/slot/role labels + `STATUS_DRIVER` (manual/automatic notes), distance calc |
| `data/*.json` | Dummy users, stores, services, tickets, bags, clothes |
| `styles/globals.css` | Brand tokens + marketing site styles + app-shell/dashboard/timeline styles, all in one file |
| `public/images/logo.webp` | Brand logo (from user) |
