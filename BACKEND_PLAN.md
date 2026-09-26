<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Backend Implementation Plan</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="OPEN_QUESTIONS.md">Open Questions</a> · <a href="CONTEXT.md">CONTEXT.md</a></sub></p>

---

Plan for turning the current mock-data POC into a full booking/operations system with a real backend, for four roles: **Customer**, **Store**, **Rider**, **Owner/Admin**. This is a design document — **the workflows themselves are already built and clickable** as a Next.js app with mock data (see [`README.md`](README.md) → "What this is" and [`CONTEXT.md`](CONTEXT.md)); what's described below is what it takes to make that real, with `lib/AppProvider.jsx` as the intended seam to swap mock functions for real API calls. See [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) for the decisions that need your input before or during that build.

## 👥 1. Roles & what each one needs

| Role | Logs in as | Core need |
|---|---|---|
| Customer | self-signup | Book a pickup (service, address, date, time slot), see booking status/history |
| Store | provisioned by owner | Each morning, see today's pickups for their store; assign each to a rider |
| Rider | provisioned by store/owner | See their own assigned pickups for the day; update status as they complete them |
| Owner | provisioned manually (you) | See everything across all stores/riders/customers; manage stores, riders, services |

## 💰 2. Recommended stack (optimized for lowest infra cost)

This does **not** need a custom backend server you host and maintain. A "Backend-as-a-Service" gives you auth, database, and role-based access out of the box, which is both cheaper and much less code than hand-rolling Express + Postgres + JWT auth.

| Layer | Choice | Why | Cost |
|---|---|---|---|
| Frontend + API routes | **Next.js** (replaces the current static site) | Lets marketing pages, customer booking, and the 3 dashboards live in one codebase; server components/API routes for anything that shouldn't run in the browser | Free |
| Hosting | **Vercel** (Hobby tier) | Already the natural pairing with Next.js; auto-deploys from the GitHub repo already set up | Free at this scale |
| Database + Auth + Realtime | **Supabase** (Free tier) | Managed Postgres, built-in email/password auth, **Row Level Security (RLS)** does role-based access control for you at the database layer instead of writing it by hand, and Realtime push means a store dashboard can update live when a new booking comes in | Free (500MB DB, 50k monthly active users) |
| Email (booking confirmations) | **Resend** free tier | 3,000 emails/month free — enough for confirmations/notifications at small scale | Free |
| Maps/geocoding | Leaflet + OpenStreetMap (already in use) | No change needed | Free |

**Total to launch: $0/month.** You only start paying if you outgrow free tiers (see §7).

Why Supabase over Firebase here: Postgres + SQL is a better fit for relational data like "store → riders → pickups" than Firestore's document model, and RLS maps cleanly onto "a store can only see its own pickups, a rider can only see pickups assigned to them" without writing that logic in every API route yourself.

## 🗄️ 3. Data model

```
profiles                 -- one row per authenticated user, extends Supabase auth.users
  id (uuid, = auth.users.id)
  role            enum: 'customer' | 'store' | 'rider' | 'owner'
  full_name
  phone
  store_id        (nullable fk -> stores.id; set for 'store' and 'rider' roles)
  created_at

stores
  id
  name
  address
  lat, lng
  phone

services
  id
  name            -- Dry Cleaning, Wash & Fold, Wash & Iron, Ironing, Shoe Cleaning
  price           -- nullable until pricing is decided (see OPEN_QUESTIONS.md #5)

tickets                  -- one row per collection request (called "bookings" in early drafts of this plan)
  id
  customer_id       fk -> profiles.id
  service_id        fk -> services.id
  pickup_address
  pickup_lat, pickup_lng
  pickup_date       date
  pickup_slot       enum: 'morning' | 'afternoon' | 'evening'   -- start simple, see §4
  store_id          fk -> stores.id            -- which store owns this ticket
  assigned_rider_id  fk -> profiles.id, nullable  -- reused for whichever phase (pickup/delivery) is active — see OPEN_QUESTIONS.md #17
  status            enum: 'pickup_scheduled' | 'pickup_request_accepted' | 'driver_arriving_for_pickup'
                        | 'pickup_in_progress' | 'picked_up' | 'arrived_at_store' | 'washing' | 'ironing'
                        | 'packed' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled'
  notes
  created_at, updated_at

bags                      -- one per ticket, created when the rider scans it during pickup
  id
  code              -- e.g. "BAG-2001"
  ticket_id         fk -> tickets.id
  scanned           boolean
  created_at

clothes                    -- one per garment, created as the rider tags & scans each item
  id
  ticket_id         fk -> tickets.id
  tag               -- e.g. "TAG-4821"
  label             -- e.g. "Blue Shirt"
  created_at
```

This is deliberately minimal — no payments table, no per-store service catalog/pricing variance, no delivery-address-different-from-pickup — because those weren't mentioned as requirements. Easy to add later without restructuring what's here.

> This maps almost directly onto the POC's `data/*.json`: `users.json` → `profiles`, `stores.json` → `stores`, `services.json` → `services`, `tickets.json` → `tickets`, `bags.json` → `bags`, `clothes.json` → `clothes` (status enum values already match the full 12-stage lifecycle implemented in `lib/constants.js`). Migrating means standing up these tables in Supabase, then replacing `lib/AppProvider.jsx`'s localStorage read/write with real queries and its simulated `scanBag`/`addCloth` with whatever real scanning integration is decided in OPEN_QUESTIONS.md #16 — the pages and components shouldn't need to change.

## 🔐 4. Access control (Row Level Security policies)

Instead of writing "if role == store, filter by store_id" in every API call, Postgres enforces it at the database level:

- **Customers** can `SELECT`/`INSERT` only their own rows in `tickets` (`customer_id = auth.uid()`).
- **Store** accounts can `SELECT`/`UPDATE` only `tickets` where `store_id = profiles.store_id` (looked up for the logged-in user).
- **Riders** can `SELECT`/`UPDATE` only `tickets` where `assigned_rider_id = auth.uid()`, and only the `status` field plus inserting rows into `bags`/`clothes` for their own ticket (they shouldn't be able to reassign themselves or edit the address).
- **Owner** bypasses filters entirely (a policy that just checks `role = 'owner'`).

This means even if there's a bug in the frontend, the database itself won't leak one store's tickets to another.

## 🔄 5. Flow by role

This flow is already fully built and clickable in the POC (`components/TicketDetail.jsx` + `lib/AppProvider.jsx`) — what's described here is the same flow, just backed by real tables/auth instead of mock data. See `SKILLS.md` → "The ticket lifecycle" for the complete 12-stage version; summarized:

**Customer:** sign up/log in → pick service → pick address (typed, or "use my location") → app finds nearest store automatically (haversine) → pick date + slot → confirm → ticket created at `pickup_scheduled`.

**Store:** accepts the request by assigning a rider (→ `pickup_request_accepted`); later, once the rider has it `picked_up`, manually advances it through `arrived_at_store` → `washing` → `ironing` → `packed`, then assigns a (possibly different) rider for delivery (→ `ready_for_delivery`).

**Rider:** collects an accepted ticket (→ `driver_arriving_for_pickup`), scans the bag (→ `pickup_in_progress`, creates a `bags` row), tags & scans each garment (creates `clothes` rows), confirms pickup (→ `picked_up`); later starts (→ `out_for_delivery`) and completes (→ `delivered`) the delivery leg.

**Owner:** sees every ticket across every store, each with its full timeline and bag/garment contents, read-only; can create/edit stores and rider/store accounts; basic counts (tickets today, per store, by status) as a starting point for analytics.

## 🏗️ 6. Build phases

Phases 2–6 below are **already built** in the current POC — they're listed here for reference on what specifically needs re-plumbing onto real infra, not as remaining work.

1. **Foundation**: Supabase project, `profiles`/`stores`/`services`/`tickets`/`bags`/`clothes` tables + RLS policies. Next.js app already exists — this phase is "stand up Supabase," not "build the app."
2. **Auth**: signup/login pages per role (or one login page that redirects based on `profiles.role` after auth) — already built with mock auth in `lib/AppProvider.jsx`; swap for real Supabase Auth calls. Owner creates the first store + rider accounts manually (no public store/rider signup — see OPEN_QUESTIONS.md).
3. **Customer booking flow**: service picker → address/location → nearest-store assignment → date/slot picker → confirmation — already built; add an email via Resend on confirmation.
4. **Store dashboard**: pickup requests list, assign-to-rider action, manual processing-stage buttons — already built.
5. **Rider dashboard**: schedule, collect/scan-bag/tag-items/finish-pickup flow, delivery actions — already built.
6. **Owner dashboard**: cross-store view, filters, store/rider management (CRUD), basic counts.
7. **Polish**: email notifications on status changes, loading/error states, mobile pass on all three dashboards.

Each phase is a natural place to file a `change-requests/` entry once this is live, so the existing request-inbox workflow keeps working the same way for backend features.

## 📈 7. Cost as you grow

| Scale | Vercel | Supabase | Total |
|---|---|---|---|
| Launch (a few stores, low booking volume) | Free (Hobby) | Free tier | **$0/mo** |
| Growing (steady daily bookings, DB should never pause, more storage) | Free, or Pro $20/mo only if you need commercial/team features | Pro ($25/mo) | **~$25–45/mo** |
| Adding SMS notifications (Twilio) | — | — | + usage-based, ~$0.0079/SMS |

> ⚠️ A free Supabase project **pauses after 1 week with zero traffic**. That's a non-issue once real customers are booking daily, but worth knowing if the project sits idle during development.

There's no cheaper *managed* option that still gives you real auth + a real relational database + row-level security for free — this is close to the floor for a system with four distinct login roles and per-row access rules.

## 🚫 8. What's out of scope for now (flag if you want these)

- Payments/invoicing
- Native mobile apps (the plan assumes mobile-friendly web pages, not app-store apps)
- Slot capacity limits (e.g. "only 10 pickups per store per morning slot") — currently unlimited bookings per slot
- SMS notifications (email only, to stay in the free tier)
