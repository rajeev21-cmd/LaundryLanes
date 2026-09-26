# Laundrylanes Backend Implementation Plan

Plan for turning the current static marketing site into a full booking/operations system with four roles: **Customer**, **Store**, **Worker**, **Owner/Admin**. This is a design document, not yet implemented — see [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for the decisions that need your input before or during the build.

## 1. Roles & what each one needs

| Role | Logs in as | Core need |
|---|---|---|
| Customer | self-signup | Book a pickup (service, address, date, time slot), see booking status/history |
| Store | provisioned by owner | Each morning, see today's pickups for their store; assign each to a worker |
| Worker | provisioned by store/owner | See their own assigned pickups for the day; update status as they complete them |
| Owner | provisioned manually (you) | See everything across all stores/workers/customers; manage stores, workers, services |

## 2. Recommended stack (optimized for lowest infra cost)

This does **not** need a custom backend server you host and maintain. A "Backend-as-a-Service" gives you auth, database, and role-based access out of the box, which is both cheaper and much less code than hand-rolling Express + Postgres + JWT auth.

| Layer | Choice | Why | Cost |
|---|---|---|---|
| Frontend + API routes | **Next.js** (replaces the current static site) | Lets marketing pages, customer booking, and the 3 dashboards live in one codebase; server components/API routes for anything that shouldn't run in the browser | Free |
| Hosting | **Vercel** (Hobby tier) | Already the natural pairing with Next.js; auto-deploys from the GitHub repo already set up | Free at this scale |
| Database + Auth + Realtime | **Supabase** (Free tier) | Managed Postgres, built-in email/password auth, **Row Level Security (RLS)** does role-based access control for you at the database layer instead of writing it by hand, and Realtime push means a store dashboard can update live when a new booking comes in | Free (500MB DB, 50k monthly active users) |
| Email (booking confirmations) | **Resend** free tier | 3,000 emails/month free — enough for confirmations/notifications at small scale | Free |
| Maps/geocoding | Leaflet + OpenStreetMap (already in use) | No change needed | Free |

**Total to launch: $0/month.** You only start paying if you outgrow free tiers (see §7).

Why Supabase over Firebase here: Postgres + SQL is a better fit for relational data like "store → workers → pickups" than Firestore's document model, and RLS maps cleanly onto "a store can only see its own pickups, a worker can only see pickups assigned to them" without writing that logic in every API route yourself.

## 3. Data model

```
profiles                 -- one row per authenticated user, extends Supabase auth.users
  id (uuid, = auth.users.id)
  role            enum: 'customer' | 'store' | 'worker' | 'owner'
  full_name
  phone
  store_id        (nullable fk -> stores.id; set for 'store' and 'worker' roles)
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

bookings
  id
  customer_id       fk -> profiles.id
  service_id        fk -> services.id
  pickup_address
  pickup_lat, pickup_lng
  pickup_date       date
  pickup_slot       enum: 'morning' | 'afternoon' | 'evening'   -- start simple, see §4
  store_id          fk -> stores.id            -- which store owns this pickup
  assigned_worker_id  fk -> profiles.id, nullable  -- set by the store
  status            enum: 'pending' | 'assigned' | 'picked_up' | 'in_progress' | 'delivered' | 'cancelled'
  notes
  created_at, updated_at
```

This is deliberately minimal — no payments table, no per-store service catalog/pricing variance, no delivery-address-different-from-pickup — because those weren't mentioned as requirements. Easy to add later without restructuring what's here.

## 4. Access control (Row Level Security policies)

Instead of writing "if role == store, filter by store_id" in every API call, Postgres enforces it at the database level:

- **Customers** can `SELECT`/`INSERT` only their own rows in `bookings` (`customer_id = auth.uid()`).
- **Store** accounts can `SELECT`/`UPDATE` only `bookings` where `store_id = profiles.store_id` (looked up for the logged-in user).
- **Workers** can `SELECT`/`UPDATE` only `bookings` where `assigned_worker_id = auth.uid()`, and only the `status` field (they shouldn't be able to reassign themselves or edit the address).
- **Owner** bypasses filters entirely (a policy that just checks `role = 'owner'`).

This means even if there's a bug in the frontend, the database itself won't leak one store's bookings to another.

## 5. Flow by role

**Customer:** sign up/log in → pick service → pick address (typed, or "use my location" like the existing store locator) → app finds nearest store automatically (haversine, same logic already in `assets/script.js`) → pick date + slot → confirm → booking created with `status='pending'`, `store_id` set, `assigned_worker_id` null.

**Store:** logs in each morning → dashboard queries `bookings WHERE store_id = mine AND pickup_date = today` → sees list, picks a worker from a dropdown (workers where `store_id = mine`) per booking → `status` moves to `'assigned'`.

**Worker:** logs in → dashboard queries `bookings WHERE assigned_worker_id = me AND pickup_date = today` → simple list, tap to mark `'picked_up'` → later `'delivered'`. Should work well on a phone browser — no need for a native app.

**Owner:** logs in → sees all bookings across all stores/workers, with filters (by store, by date range, by status) → can create/edit stores and worker/store accounts → basic counts (bookings today, per store, by status) as a starting point for analytics.

## 6. Build phases

1. **Foundation**: Supabase project, `profiles`/`stores`/`services`/`bookings` tables + RLS policies. Next.js project scaffolded, existing static site's HTML/CSS ported into it as the public marketing pages.
2. **Auth**: signup/login pages per role (or one login page that redirects based on `profiles.role` after auth). Owner creates the first store + worker accounts manually (no public store/worker signup — see OPEN_QUESTIONS.md).
3. **Customer booking flow**: service picker → address/location → nearest-store assignment → date/slot picker → confirmation (+ email via Resend).
4. **Store dashboard**: today's pickups list, assign-to-worker action.
5. **Worker dashboard**: today's assigned pickups, status updates.
6. **Owner dashboard**: cross-store view, filters, store/worker management (CRUD), basic counts.
7. **Polish**: email notifications on status changes, loading/error states, mobile pass on all three dashboards.

Each phase is a natural place to file a `change-requests/` entry once this is live, so the existing request-inbox workflow keeps working the same way for backend features.

## 7. Cost as you grow

| Scale | Vercel | Supabase | Total |
|---|---|---|---|
| Launch (a few stores, low booking volume) | Free (Hobby) | Free tier | **$0/mo** |
| Free Supabase project pauses after 1 week with zero traffic — fine once real customers are booking, but note this if it sits idle during development | | | |
| Growing (steady daily bookings, need the DB to never pause, more storage) | Free or Pro ($20/mo, only needed for commercial/team use) | Pro ($25/mo) | **~$25–45/mo** |
| Adding SMS notifications (Twilio) | — | — | +usage-based, ~$0.0079/SMS |

There's no cheaper *managed* option that still gives you real auth + a real relational database + row-level security for free — this is close to the floor for a system with four distinct login roles and per-row access rules.

## 8. What's out of scope for now (flag if you want these)

- Payments/invoicing
- Native mobile apps (the plan assumes mobile-friendly web pages, not app-store apps)
- Slot capacity limits (e.g. "only 10 pickups per store per morning slot") — currently unlimited bookings per slot
- SMS notifications (email only, to stay in the free tier)
