<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Agent Onboarding — SKILLS.md</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a></sub></p>

---

This file gives any AI agent (or human) picking up this project everything needed to continue work without re-reading the whole history. For decision-by-decision rationale, see [`CONTEXT.md`](CONTEXT.md). For unresolved questions to route to the site owner, see [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

## 🧺 What this project is

**Laundrylanes**, a dry-cleaning/laundry pickup-and-delivery business. This repo is a **Next.js proof-of-concept**: the public marketing site, plus four fully interactive role-based workflows — **customer** (book/track pickups), **store** (accept pickup requests, assign riders, walk a ticket through processing), **rider** (collect pickups, scan bags/garments, deliver), **owner** (cross-store overview/management, full ticket tracking). There is **no real database** — but ticket/bag/cloth data *is* shared server-side (a JSON file behind API routes, see "The data layer" below), so different browsers/devices genuinely see each other's changes; only login identity is per-device. See [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the real (Postgres-backed) system this stands in for, and [`CONTEXT.md`](CONTEXT.md) for why it's built this way.

Every collection request is a **ticket**, tracked through a 12-stage lifecycle with two real sub-entities — **Bag** and **Cloth** — created live as the rider scans them during pickup. This is the core domain model; see below.

## 🛠️ Stack

- **Next.js (App Router) + React, plain JavaScript** — no TypeScript, no CSS framework, one global stylesheet.
- **Client: `lib/AppProvider.jsx`.** A React context that holds `currentUser` (from `localStorage`, per-device) plus `tickets`/`bags`/`clothes` (fetched from the server, shared). Every lifecycle action is now an `async` function that `fetch()`es an API route and adopts the response as new state — **no page/component ever mutates `tickets`/`bags`/`clothes` directly.**
- **Server: `app/api/*` route handlers + `lib/serverDb.js` + `lib/ticketActions.js`.** A JSON file is the "database" — no schema, no query language, no Postgres/Supabase. See "The data layer" below before touching any of this.
- **Leaflet.js 1.9.4 + OpenStreetMap tiles** (CDN-loaded in `app/layout.jsx`, used by `components/StoreLocator.jsx`) — no API key needed.
- **Google Fonts** (Playfair Display + Inter) via CDN link tags.

> Do not introduce TypeScript, a CSS framework, or a real database unless the task genuinely requires it. If/when a real backend is built (see `BACKEND_PLAN.md`), the intended seam is `lib/serverDb.js`/`lib/ticketActions.js` — swap the JSON-file read/write for real DB queries; the API routes' request/response shape, and everything above them (client `AppProvider`, components, pages), shouldn't need to change.

## 🗄️ The data layer — shared JSON file behind API routes, not localStorage

This is the part most likely to surprise an agent who only skims the components: **`tickets`/`bags`/`clothes` do not live in the browser.** They live in one JSON file the server reads/writes; every browser/device fetches the same file through the same API. Only `currentUserId` (which demo account this device is logged in as) is per-browser.

- **`lib/serverDb.js`** (server-only — never import it from a `'use client'` file) has `loadDb()` / `saveDb(db)` / `resetDb()`. Locally it reads/writes `.data/db.json` (gitignored — persists across `npm run dev` restarts, never committed). On Vercel (`process.env.VERCEL` is set) it writes under `os.tmpdir()` instead, because the deployed bundle's own directory is read-only — which also means **on Vercel this resets on cold starts/redeploys and isn't shared across serverless instances.** That's a known, accepted limitation of "shared state without a real database," not a bug to fix by yourself; see `OPEN_QUESTIONS.md` before changing this.
- **`lib/ticketActions.js`** (server-only) has one function per lifecycle action (`assignRiderForPickup`, `scanBag`, `addCloth`, `markPacked`, ...), each taking `(db, ticketId, payload, actingUserId)` and returning a *new* `db` object. `logAndPatch()` in that file is the single choke point that appends a `history` entry — same rule as before, just server-side now: **any new ticket-mutating action must go through it.**
- **`lib/seedData.js`** (isomorphic, no `fs`) has `buildSeedState()` — the one place that knows what a freshly-seeded database looks like (walks `data/tickets.json` + `dayOffset` → real dates → synthesized `history`). Used by `serverDb.js` on first boot and by `/api/reset`.
- **Four route handlers under `app/api/`**: `GET /api/state` (read everything — has `export const dynamic = 'force-dynamic'`; without it Next would statically cache this at build time, since the handler takes no dynamic input, and would then never re-read the file at runtime), `POST /api/tickets` (book a pickup), `PATCH /api/tickets/[id]` (single dispatcher — body `{ action, payload, actingUserId }`, action name looked up in `TICKET_ACTIONS`), `POST /api/reset`.
- **`AppProvider` polls `/api/state` every 5s** plus on window focus/tab visibility change — that's how a change on one device shows up on another without a manual reload. There's no WebSocket/SSE; a change can take up to ~5s to appear elsewhere. Don't "fix" this by making everything synchronous again — the lag is an accepted tradeoff, not a bug.
- **If you add a new ticket-mutating action**: write the reducer function in `lib/ticketActions.js`, add it to `TICKET_ACTIONS`, and add a matching one-line wrapper in `lib/AppProvider.jsx` that calls `callAction(ticketId, 'yourAction', payload)`. Don't add new one-off API routes per action — the `PATCH /api/tickets/[id]` dispatcher is deliberately the only mutation endpoint besides booking/reset.

## 🎫 The ticket lifecycle (the core domain model — read this before touching status logic)

`lib/constants.js`'s `STATUS_ORDER` is the canonical, ordered list:

```
pickup_scheduled → pickup_request_accepted → driver_arriving_for_pickup → pickup_in_progress
→ picked_up → arrived_at_store → washing → ironing → packed
→ ready_for_delivery → out_for_delivery → delivered
```

...plus an off-path `cancelled` (reachable only from `pickup_scheduled`, by the customer). `STATUS_LABELS` has display names; `STATUS_DRIVER` documents who/what moves a ticket out of each status (shown in the UI too) — **only `pickup_scheduled` is automatic**, every other transition is a specific role tapping a specific button in `components/TicketDetail.jsx`. Don't add a new status without updating `STATUS_ORDER`, `STATUS_LABELS`, `STATUS_DRIVER`, the CSS `.status-<name>` color rule in `styles/globals.css`, and the relevant action in `AppProvider`.

**Pincode auto-assignment, not claiming:** a ticket's `storeId` is set automatically at booking time by matching the pickup address's `pincode` against `data/stores.json`'s store pincodes (`bookPickup` in `lib/ticketActions.js`). If no store's pincode matches, the ticket is created with `storeId: null` and sits as an **exception for the owner to assign manually** (`assignStoreToTicket`) — it is *not* a pool any store can pick from. **Stores cannot self-assign a ticket to themselves, full stop.** (This project has tried three assignment models across its history — geo-nearest-store, then any-store-claims, now pincode-match + admin-fallback — see `CONTEXT.md` if you need the history. Don't reintroduce either of the first two without being asked.) Assignment doesn't itself change `status`; it just sets `storeId`, i.e. "whose queue is this in."

**Who does what:**
- **Store**: once a ticket has landed in its queue (auto by pincode, or by owner assignment — never by the store's own action) → assigns a rider (`assignRiderForPickup`) → `pickup_request_accepted`. Later, once `picked_up`: `markArrivedAtStore` → `arrived_at_store`; `startWashing` → `washing`; `startIroning` → `ironing`; `markPacked` → `packed`; then assigns a rider for delivery (`assignRiderForDelivery`) → `ready_for_delivery`. A store can also add/recount garments at `arrived_at_store` via the same `addCloth` the rider uses (see "Bag & Cloth" below).
- **Rider** (only if `ticket.assignedRiderId === currentUser.id`): `pickup_request_accepted` → taps "Collect Ticket" (`riderCollect`) → `driver_arriving_for_pickup` → taps "Scan Bag" (`scanBag`, creates/scans a `Bag`) → `pickup_in_progress` → tags & scans each garment (`addCloth`, creates a `Cloth` per item) → taps "Finish Pickup" (`finishPickup`, requires ≥1 scanned item) → `picked_up`. Later: `ready_for_delivery` → "Start Delivery" (`startDelivery`) → `out_for_delivery` → "Mark Delivered" (`markDelivered`) → `delivered`.
- **Customer**: can `cancelTicket` only while `pickup_scheduled`.
- **Owner**: never mutates a ticket — same `TicketDetail` component renders with no action panel for that role.

## 🏬 Store assignment — pincode auto-match, admin override, no claiming

`ticket.storeId` is set at booking time by `bookPickup`'s pincode match, or stays `null` if nothing matched. `components/TicketDetail.jsx` branches on it role-by-role — **this is the pattern to copy if you touch this logic**:
1. **Store role, `!ticket.storeId`** → empty-state "Awaiting admin to assign this ticket to a store." No action available — a store cannot assign a ticket to itself.
2. **Store role, `ticket.storeId && ticket.storeId !== currentUser.storeId`** → read-only "This ticket belongs to a different store," no actions (same shape as a rider viewing a ticket assigned to a different rider).
3. **Store role, `ticket.storeId === currentUser.storeId`** → the normal assign-rider/processing-stage actions.
4. **Owner role, `!ticket.storeId`** → a "Choose a store…" dropdown that calls `assignStoreToTicket(ticket.id, storeId)`. This is the *only* UI path that can set `storeId` on a ticket pincode-matching failed to assign.

List pages filter on `storeId === currentUser.storeId` only now (`app/store/page.jsx`, `app/store/tickets/page.jsx`) — there is no "unclaimed OR mine" union filter anymore; a store never sees tickets it doesn't own. `TicketCard`/`TicketDetail` still render a distinct orange "🏬 Unclaimed" tag (`.ticket-card-tag.unclaimed`) whenever `showStore` is on and there's no store — that's now specifically the owner's cue to go assign it, not an invitation for a store to grab it.

**If you add a 6th store**, give it a unique `pincode` in `data/stores.json` in the same commit — `bookPickup`'s `STORES.find(s => s.pincode === pincode)` silently matches nothing (ticket becomes an owner-assignment exception) if two stores share a pincode or the new one has none.

## 📦 Bag & Cloth — real entities, not status metadata

- `data/bags.json`: `{ id, code, ticketId, scanned }`. One bag per ticket, created by `scanBag()` the first time a rider scans it (code auto-generated, e.g. `BAG-2001`).
- `data/clothes.json`: `{ id, ticketId, tag, label, category }`. Each garment tagged via `addCloth(ticketId, label, category)` (auto-generates a `tag` like `TAG-<id>`; `category` is one of `CLOTH_CATEGORIES` in `lib/constants.js` — `Shirt/Trousers/Kurta/Saree/Shoe/Bedsheet/Other`, defaults to `'Other'`). **Not rider-only** — the same action is callable by a store user too (shown at `arrived_at_store` as "Verify / add items," using the same `clothForm` JSX as the rider's `pickup_in_progress` step in `TicketDetail.jsx`), for recounting at the store.
- Look these up with `getBagForTicket(ticketId)` / `getClothesForTicket(ticketId)` from `useApp()` — never filter `bags`/`clothes` by hand in a component.
- **The "Items" card groups `getClothesForTicket(ticketId)` by `category` into a qty breakdown** (`Shirt ×3`, ...) shown to every role including customers. The raw bag code and per-item tag list are shown to everyone *except* customers (`!isCustomer &&` in `TicketDetail.jsx`) — the qty breakdown is the one layer of garment detail that's customer-facing.
- **"Scanning" is simulated** — a button click / form submit, not a real camera or barcode reader. If real scanning hardware is wanted later, `scanBag`/`addCloth` in `lib/ticketActions.js` (server-side) are the functions to wire up to it.

## 📇 Address book — saved addresses, not free-text booking

- `addresses`: `{ id, customerId, label, line1, line2, landmark, city, pincode }`. Lives in the same server JSON blob as tickets/bags/clothes; `lib/addressActions.js` (server-only) has `addAddress(db, payload)`; `app/api/addresses/route.js` is its one `POST` route — **not** part of the `PATCH /api/tickets/[id]` dispatcher, since it isn't a ticket mutation. `useApp()` exposes `addresses` (array, all customers' — components filter by `customerId` themselves, same pattern as `tickets`) and `addAddress(payload)` (returns the created address).
- `app/customer/book/page.jsx` is a `<select>` over the logged-in customer's own addresses, plus a "+ Add new address" inline form. The add-address form is **pincode-first**: typing 6 digits live-checks `stores.some(s => s.pincode === pincode)` and shows a green/amber serviceability hint *before* the rest of the fields (street, landmark, city) — this is what actually feeds `bookPickup`'s auto-assignment, so don't let the booking form go back to a free-text address box.
- Saving an address auto-selects it and the "Confirm Pickup" submit button is disabled until some saved address is selected — there's no path to book a pickup with an address that isn't in the address book.
- One seed address per demo customer in `lib/seedData.js`'s `ADDRESSES_SEED`, matching that customer's existing seed-ticket address.

## 📜 The history log — every ticket event, store/owner only

Every ticket has a `history: [{ at, status, byUserId, byName, byRole, note }]` array, rendered by `components/TicketHistory.jsx` and mounted in `TicketDetail.jsx` **only when `currentUser.role === 'store' || currentUser.role === 'owner'`** — customers and riders never see it. This is a deliberate product requirement, not an oversight; don't widen that gate without being asked.

- **The only way an entry gets added is `lib/ticketActions.js`'s `logAndPatch(tickets, ticketId, patch, note, actingUserId)`** (server-side). Every single lifecycle action (`assignRiderForPickup`, `scanBag`, `addCloth`, `markPacked`, `startDelivery`, ...) calls this instead of touching the `tickets` array directly — that's what guarantees the log can never miss an event. **If you add a new ticket-mutating action, it must go through `logAndPatch`, full stop.**
- `addCloth` is a good example of a history entry with **no status change** — `patch` is `{}`, only `note` is set (`"Item tagged & scanned: ..."`). Not every history entry corresponds to a status transition.
- Seed tickets (`data/tickets.json`) don't ship with a `history` array — `lib/seedData.js`'s `buildSeedState()` synthesizes one via `seedHistoryFor()`, walking `STATUS_ORDER` up to the ticket's current status with `byName: 'Seed data'`. If you add more seed tickets, you don't need to hand-write their history; this happens automatically from `status` + `dayOffset`.

## 🔀 Filters, sort, and the rider-status dashboard

- **Every ticket list view has a filter + a sort control.** Filters are page-specific (status chips, sometimes a store dropdown too). Sort is the same everywhere: `lib/sortTickets.js`'s `TICKET_SORT_OPTIONS` + `sortTickets(tickets, sortKey)` — **don't write a new inline `.sort()` comparator on a ticket array**, import this instead, so "soonest pickup first" stays consistent across pages. The sort `<select>` uses the (pre-existing, previously unused) `.select-inline` CSS class, sitting next to that page's `.filter-row` inside a `.list-toolbar` flex wrapper — copy that pattern for any new ticket list page.
- **Customers filter by their own simplified status**, not the internal one — `app/customer/tickets/page.jsx` filters via `toCustomerStatus(t.status) === filter` against `CUSTOMER_STATUS_ORDER`, same rule as "customers never see internal statuses" everywhere else.
- **`lib/constants.js`'s `RIDER_ACTIVE_STATUSES`** is the single definition of "this rider currently has something to do": `pickup_request_accepted`, `driver_arriving_for_pickup`, `pickup_in_progress`, `ready_for_delivery`, `out_for_delivery`. `app/rider/page.jsx`'s own pending list and the two rider dashboards below both import it — **don't redefine this set locally**, a ticket between `picked_up` and `packed` still has `assignedRiderId` set but is deliberately excluded (it's with the store, not the rider, until re-assigned for delivery).
- **`app/store/riders/page.jsx`** (own store's riders) **and `app/owner/riders/page.jsx`** (every rider, tagged with its store) answer "where is each rider, on what ticket, doing what" — one card per rider, computed live from `tickets.filter(t => t.assignedRiderId === rider.id && RIDER_ACTIVE_STATUSES.includes(t.status))`, no new state/entity. A rider can show >1 active ticket (nothing stops a store from assigning a second active ticket to a busy rider) — the card lists all of them, it doesn't assume exactly one. Both are in `lib/nav.js` as "🚚 Riders."
- **Each rider/store card is a `<Link>` (`.card-section.clickable`) to a read-only detail page**: `app/store/riders/[id]`, `app/owner/riders/[id]`, `app/owner/stores/[id]`. These show the *full* ticket history (not just active tasks), with the same filter+sort toolbar as any other list page — but **deliberately render zero status-changing actions**. If you're tempted to add a button to one of these three pages, don't — that's what the ticket's own detail page (linked from each row) is for; these exist purely so a store/owner can look without being invited to act. Because each card is itself a `<Link>`, any per-ticket text inside it must stay plain text, not a nested `<Link>` — nesting an `<a>` inside an `<a>` is invalid HTML (see the rider cards' task list, which is a plain `<ul>`, no links).

## 👥 Employee management

`users` is a shared, server-backed array (same shape as `tickets`/`bags`/`clothes`/`addresses`) — **not** a static `data/users.json` import anymore, though that file is still the seed. `lib/userActions.js`'s `addEmployee(db, {name, email, password, role, storeId})` is the one mutator, called via `POST /api/users` (its own route, not the ticket dispatcher — creating a user isn't a ticket action). `app/owner/users/page.jsx` has the "Add Employee" form (role dropdown from `EMPLOYEE_ROLES` in `lib/constants.js` — `rider`/`store`/`owner`; `customer` is deliberately excluded, customers are self-signup per `BACKEND_PLAN.md`).

- **"Store" role displays as "Store Manager"** (`ROLE_LABELS.store`) but the `role` *value* is still `'store'` everywhere — every `currentUser.role === 'store'` check, every `app/store/*` route, stays unchanged. Don't go looking for a `'storeManager'` value, it doesn't exist; this was a label-only change.
- **`lib/ticketActions.js`'s `logAndPatch(db, ticketId, patch, note, actingUserId)` takes the whole `db` now, not `db.tickets`** — it needs `db.users` to resolve who's acting (`resolveActor`). If you add a new ticket-mutating action, call it as `logAndPatch(db, ...)`; the old `logAndPatch(db.tickets, ...)` signature is gone.
- **`isHydrated` (in `lib/AppProvider.jsx`) gates on the same `fetchState()` that loads `users`** — this is why `RoleGuard` never flash-redirects before a logged-in user's account has loaded. If you ever add a second data source `users` depends on, make sure it's awaited by the same hydration gate, not a separate effect.

## ⭐ Ratings, order value, and customer spend

- **`rateTicket(ticketId, riderRating, serviceRating)`** (1-5 each) is customer-only in the UI, only once `status === 'delivered'`, and only once — `components/TicketDetail.jsx` shows `components/StarRating.jsx` as an interactive picker (`onChange` set) until `ticket.ratedAt` exists, then swaps to the same component read-only (`onChange` omitted). **Reuse `StarRating` for any other rating display** — don't write a second star-renderer.
- **`lib/constants.js`'s `CLOTH_CATEGORY_PRICES`** (flat ₹ per `CLOTH_CATEGORIES` entry) + **`calcOrderValue(clothesForTicket)`** (sums them) is the only pricing model — per-category, not per-individual-garment. `TicketDetail.jsx`'s Items card shows the result to every role, customers included. If per-item custom pricing or owner-editable prices are ever wanted, this is the one function/constant to replace; nothing else needs to change since every caller already goes through `calcOrderValue()`.
- **Revenue and both rating averages live on `app/owner/page.jsx`** (global) **and each rider's own avg rating on `app/store/riders/[id]`/`app/owner/riders/[id]`** (filtered to that rider) — both computed on the fly from `tickets`/`clothes`, no stored aggregate. Shows `—` rather than `0.0` when there's nothing to average yet — don't let `0/0` render as a real zero rating.
- **Customer spend/availed/completed/cancelled stats appear in two places**: the customer's own home page (`app/customer/page.jsx`, their own numbers) and the owner's Users page (`app/owner/users/page.jsx`, as extra columns per customer row, blank for non-customers). Both compute the same four numbers the same way — "availed" is total ticket count regardless of outcome, "spent" only counts `delivered` tickets.

## 🗂️ File structure

```
laundry/
├── app/
│   ├── layout.jsx              # root layout: fonts, Leaflet CSS, AppProvider wrapper, PWA meta
│   ├── page.jsx                 # public marketing home
│   ├── login/page.jsx           # login form + demo-role quick buttons
│   ├── api/                     # server route handlers — see "The data layer" above
│   │   ├── state/route.js         # GET  — read {tickets, bags, clothes, addresses}
│   │   ├── tickets/route.js       # POST — book a pickup (pincode auto-assigns storeId)
│   │   ├── tickets/[id]/route.js  # PATCH — { action, payload, actingUserId } dispatcher
│   │   ├── addresses/route.js     # POST — add an address-book entry
│   │   ├── users/route.js         # POST — add an employee account
│   │   └── reset/route.js         # POST — reseed
│   ├── customer/                # layout.jsx (RoleGuard+AppShell) + page.jsx, book/, tickets/, tickets/[id]/
│   ├── store/                   # layout.jsx + page.jsx (pickup requests), tickets/, tickets/[id]/, riders/, riders/[id]/ (read-only)
│   ├── rider/                   # layout.jsx + page.jsx (my schedule), tickets/[id]/
│   └── owner/                   # layout.jsx + page.jsx (overview), stores/, stores/[id]/ (read-only), tickets/, tickets/[id]/, riders/, riders/[id]/ (read-only), users/
├── components/
│   ├── AppShell.jsx              # top bar + hamburger drawer; nav items from lib/nav.js per role
│   ├── RoleGuard.jsx             # redirects to /login if current user's role != route's role
│   ├── TicketCard.jsx            # clickable ticket summary, used in every list view
│   ├── TicketDetail.jsx          # THE shared, role-aware ticket page — timeline + bag/garments + actions
│   ├── TicketTimeline.jsx        # the 12-stage progress stepper (or the 6-step customer version, via `simplified`)
│   ├── TicketHistory.jsx         # event log — only mounted for store/owner
│   ├── StatusBadge.jsx           # small colored pill for a ticket's status; `simplified` prop for customers
│   ├── AddressModal.jsx          # rider popup: a ticket's address/pincode + "Open in Maps" link
│   ├── StarRating.jsx            # 1-5 star control — interactive picker (onChange) or read-only display (no onChange)
│   ├── MarketingHeader.jsx, MarketingFooter.jsx, StoreLocator.jsx   # public site only
├── lib/
│   ├── AppProvider.jsx           # client context: local identity (sessionStorage) + fetched tickets/bags/clothes/addresses + polling
│   ├── serverDb.js               # server-only: JSON-file read/write (.data/db.json locally, /tmp on Vercel)
│   ├── ticketActions.js          # server-only: one reducer fn per lifecycle action + logAndPatch + pincode auto-assignment + rateTicket
│   ├── addressActions.js         # server-only: addAddress() reducer for the address book
│   ├── userActions.js            # server-only: addEmployee() reducer for employee accounts
│   ├── seedData.js               # isomorphic: buildSeedState() — the one seeding implementation (tickets/bags/clothes/addresses/nextTicketSeq)
│   ├── nav.js                    # NAV_ITEMS map: role → hamburger menu entries
│   ├── constants.js              # STATUS_*, CUSTOMER_STATUS_*/toCustomerStatus(), SLOT_LABELS, CLOTH_CATEGORIES/CLOTH_CATEGORY_PRICES/calcOrderValue(), ROLE_LABELS, ROLE_HOME, EMPLOYEE_ROLES
│   ├── haversine.js              # distance calc, used only by the public StoreLocator's "Use My Location" now
│   ├── sortTickets.js             # shared TICKET_SORT_OPTIONS + sortTickets(), used by every ticket list page
│   └── format.js                 # formatDateTime() for history timestamps
├── data/
│   ├── users.json                 # demo accounts: customer/store/rider/owner roles, plaintext passwords (fake data only)
│   ├── stores.json                # placeholder Bengaluru stores, each with a pincode (drives auto-assignment)
│   ├── services.json              # the 5 services
│   ├── tickets.json                # 19 seed tickets using dayOffset (see below) + pincode, spanning the full lifecycle
│   ├── bags.json                   # seed bags for tickets already at picked_up or later
│   └── clothes.json                # seed garments (each with a category) for those same tickets
├── .data/db.json                  # gitignored — the live "database" when running locally
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

**The app shell (post-login) must visually read as the same product as the marketing site** — cream (`--cream`) page background, the translucent cream/blurred top bar (`.app-topbar`), the logo visible in it. Earlier this drifted (cool grey background, solid navy bar, no logo) and was flagged as feeling like a different app; don't reintroduce that gap.

**Ticket/list pages are a responsive CSS grid (`.order-list`), not a stacked column** — `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`. Single-column content (forms, ticket detail) uses `.card-section`'s own `max-width: 640px` instead of relying on a narrow outer container, so both can share the same 900px-wide `.app-content` without either looking wrong (grids get room to breathe; forms/detail stay a readable width). Keep using these two classes for new pages rather than inventing a third layout pattern.

**Store and owner are deliberately denser than customer/rider.** Pass `dense` to `TicketCard` and add the `.order-list.dense` class (smaller `minmax`, tighter gap) on any store/owner list page — never on customer/rider ones, which keep the roomier default. For data blocks that should span the full `.app-content` width instead of the 640px cap (stat breakdowns, side-by-side panels), add `.card-section.wide`; `.stats-columns` lays two `.wide` sections side by side on desktop. If you add a new store/owner page, default to dense + wide; if you add a new customer/rider page, default to the roomy style — don't mix the two within one role.

**The login page is a page of the site, not a modal.** It renders `<MarketingHeader showNav={false} />` above the login card and sits on `--cream`, same as everywhere else — it should never go back to being a separate full-screen dark takeover with no header. If you add another full-page flow (password reset, etc.), follow this same pattern rather than inventing a new one-off page shell.

## 🔐 How mock auth + roles work

- Each user has `role` (`customer`/`store`/`rider`/`owner` — `store` displays as "Store Manager", see "Employee management" below but is still the `role` value), `email`, `password` (plaintext — it's all fake data, fine for a public repo), and for `store`/`rider` roles, a `storeId`. **Every store in `data/stores.json` must have at least one `store` account and one `rider` account** — any store can end up with a pincode-matched ticket (see "Store assignment" above), so a store with no login is a dead end for anything routed to it (nothing to log in as, and even Owner can't assign a rider if that store has none). If you add a 6th store, add its accounts (and a unique `pincode`) in the same commit.
- **`users` is server-backed state, not the static `data/users.json` import** (see "Employee management" below) — `data/users.json` is still the *seed*, but at runtime `lib/AppProvider.jsx`'s `login(email, password)`/`loginAsRole(role)` match against the fetched `users` array, so employees added via "Add Employee" can log in too. Don't reintroduce `import USERS from '@/data/users.json'` anywhere client-side — that was deliberately removed.
- The logged-in user's id is persisted to `sessionStorage` (not `localStorage`) under `laundrylanes-auth-v1`, **per tab**, not just per device — this is intentionally local-and-tab-scoped even though ticket data isn't, so opening customer/store/rider in three tabs of the *same* browser gives each an independent identity and logging out in one doesn't touch the others. (`localStorage` would be shared by every tab of the same origin — that surprised a real user once; see `CONTEXT.md`. Don't switch this back.)
- Every role's route group (`app/customer/`, etc.) has a `layout.jsx` that wraps children in `<RoleGuard role="...">` then `<AppShell>`. `RoleGuard` redirects to `/login` if there's no user or the wrong role — **this is the only access control that exists**; the API routes trust whatever `actingUserId` the client sends with zero verification. Don't treat any of this as real security.

## 🧭 How the role-based hamburger nav works

`components/AppShell.jsx` is shared by all four roles. It reads `NAV_ITEMS[currentUser.role]` from `lib/nav.js` to render the drawer's links — that's the entire mechanism for "different tabs per role." To add a page to a role's nav, add both the Next.js route under that role's folder *and* an entry in `lib/nav.js`.

## 🎫 How tickets/bookings work

- `data/tickets.json` entries have a `dayOffset` (integer, e.g. `0`/`-1`/`1`) instead of a fixed date. `lib/seedData.js` converts these to real `pickupDate` strings (relative to whenever the database gets (re)seeded) — **don't hardcode dates in seed data**, always use `dayOffset` so "today's pickups" stays meaningful no matter when someone runs the demo. If the local `.data/db.json` is stale (hasn't been reseeded in a while), every ticket's `pickupDate` will look frozen at the last reseed date even though real "today" has moved on — that's expected; reseed (delete `.data/db.json` or use "🔄 Reset demo data") to see dates relative to the actual current date again.
- Booking a pickup (`app/customer/book/page.jsx`) picks a saved address from the customer's address book (see "Address book" above), `await`s `bookPickup({ ..., pickupAddress, pincode, ... })`, which `POST`s to `/api/tickets` and creates the ticket at `pickup_scheduled`, auto-assigning `storeId` by matching `pincode` against `data/stores.json` (see "Store assignment" above) — `storeId` stays `null` only if nothing matched, as an exception for the owner. The ticket also gets the next sequential id off `db.nextTicketSeq` (starts at `2020`, one past the last seed ticket `tk-2019`) rather than a timestamp. This is the one client action whose return value callers actually use (the created ticket, to show the confirmation) — every other action is fire-and-forget from the caller's perspective, since `AppProvider` updates its own state once the response lands.
- Pickup time slots are fixed 2-hour windows (`SLOT_LABELS` in `lib/constants.js`: `08-10` through `18-20`) — zero-padded 24h range keys so plain string sort already puts them in order; don't switch to word keys.
- Customers see a simplified 6-step status (see "Simplified customer-facing status" below), not the raw 12-stage `status` value — that's purely a display-layer swap in `StatusBadge`/`TicketTimeline`/`TicketCard`'s `simplified` prop, nothing server-side changes.
- See "The ticket lifecycle" above for the full status flow and which action function drives each transition.

## 🙈 Simplified customer-facing status (display-only)

Customers see a 6-step collapse of the 12-stage internal lifecycle — `CUSTOMER_STATUS_ORDER` (`pickup_scheduled → picked_up → processing → ready_for_delivery → out_for_delivery → delivered`) in `lib/constants.js`, derived from the real `status` via `toCustomerStatus()` and a `CUSTOMER_STATUS_MAP` lookup (e.g. `arrived_at_store`/`washing`/`ironing`/`packed` all → `processing`).

- `StatusBadge`, `TicketTimeline`, and `TicketCard` each take a `simplified` prop that swaps which order/labels they render. `TicketDetail.jsx` and both customer-role pages (`app/customer/page.jsx`, `app/customer/tickets/page.jsx`) pass it; every other call site doesn't, and shows the real internal status.
- **If you add a new internal status to `STATUS_ORDER`, you must also add it to `CUSTOMER_STATUS_MAP`** — otherwise `toCustomerStatus()` falls back to returning the raw internal name to customers, defeating the whole point. Same "don't forget this" class of rule as `STATUS_LABELS`/`STATUS_DRIVER`.
- The `STATUS_DRIVER` hint and the raw bag-code/tag-list (as opposed to the qty-by-category breakdown, which customers do see) are explicitly hidden from customers in `TicketDetail.jsx` via `!isCustomer &&` guards.

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

Open `http://localhost:3000`. First request creates `.data/db.json`, seeded fresh — it then persists across dev-server restarts (delete it, or use "🔄 Reset demo data" in the hamburger drawer, to get back to a clean seed). Also deployed at the Vercel URL in `README.md`, with the caveat that its `/tmp`-backed data resets on cold starts/redeploys there (see "The data layer" above) — that deployment also has its own `vercel.json` forcing Next.js framework detection (the Vercel project's dashboard setting was stuck on "Other," which silently serves only `public/` as static output — see the git history around that fix if this ever regresses).

**To see the shared-state behavior for real:** open the app in two browser profiles (or one normal + one incognito window) logged in as different roles, and act on the same ticket from each — or simpler, `curl -X PATCH localhost:3000/api/tickets/tk-2001 -H 'Content-Type: application/json' -d '{"action":"scanBag","actingUserId":"u-rider-1"}'` while a browser tab is open on that ticket, and watch it update within ~5s with no reload.

> ⚠️ **Never run `npm run build` (or `rm -rf .next`) while `npm run dev` is running against the same directory.** They both write to `.next`; doing this mid-session corrupts the dev server's runtime and every route starts 500ing or 404ing, including `/`, with no code actually being broken. Fix: stop the dev server first, `rm -rf .next`, then restart `npm run dev` (or run the build) — don't debug app code in response to this failure mode, just restart cleanly. This has bitten this project twice already.

## ✅ Conventions to follow when extending this project

1. **All data access goes through `useApp()` (`lib/AppProvider.jsx`).** Don't `fetch('/api/...')` directly from a page/component, and don't import `lib/serverDb.js`/`lib/ticketActions.js` into anything client-side (they use `fs` and will break the build if bundled for the browser) — only API routes call those.
2. **Ticket status changes go through a named `AppProvider` action** (`assignRiderForPickup`, `scanBag`, `markPacked`, etc.), which itself just calls the matching server action via the `PATCH /api/tickets/[id]` dispatcher — never invent a generic "update this ticket" client call. The point is that every transition is an explicit, named action, matching the real operational workflow, all the way down to the server.
3. **All ticket actions live in `components/TicketDetail.jsx`**, not in list cards (`TicketCard.jsx` is a summary + link only). Keep it that way — with 12 statuses and a multi-step pickup flow, per-card action buttons stopped being maintainable.
4. **Update `CONTEXT.md`** with any non-obvious decision (why, not just what) as you go — it's the project's memory across sessions/agents.
5. **Route unresolved product decisions to `OPEN_QUESTIONS.md`** rather than guessing silently — append new numbered questions, keep old ones (with answers filled in) for history.
6. **Match the illustrative, minimal-text visual style** on the marketing site (inline SVG line art in brand colors) — avoid stock photography there unless the brand direction changes.
7. **Don't hardcode fake data as if real** without flagging it — everything in `data/*.json` is a placeholder; if you add more, note it in `OPEN_QUESTIONS.md` so it doesn't ship silently.
8. **One change per PR** if you're processing a `change-requests/` entry — see the `apply-change-requests` skill for the full workflow.
9. **Don't add TypeScript or a CSS framework** to this POC without the project owner asking — it's deliberately minimal so it stays fast to iterate on.
