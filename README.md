<p align="center">
  <img src="public/images/logo.webp" width="160" alt="Laundrylanes logo" />
</p>

<h1 align="center">Laundrylanes</h1>
<p align="center"><strong>Dry cleaning &amp; laundry, delivered.</strong><br/>Book in a tap. We pick up, we clean, we bring it back.</p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-POC-E07A3E?style=flat-square" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Next.js%20%C2%B7%20React-0B2545?style=flat-square" />
  <img alt="data" src="https://img.shields.io/badge/data-shared%20JSON%20file%2C%20no%20DB-0B2545?style=flat-square" />
  <img alt="license" src="https://img.shields.io/badge/license-proprietary-lightgrey?style=flat-square" />
</p>

<p align="center">
  <a href="#-running-locally">Running locally</a> ·
  <a href="#-demo-logins">Demo logins</a> ·
  <a href="#-project-docs">Docs</a> ·
  <a href="#-how-to-request-a-change">Request a change</a> ·
  <a href="#-repo-layout">Repo layout</a>
</p>

---

**Live demo:** [laundry-lanes.vercel.app](https://laundry-lanes.vercel.app)

## 🧺 What this is

**Laundrylanes** — dry cleaning, wash & fold, wash & iron, ironing, and shoe cleaning, with doorstep pickup & drop. This repo is a **Next.js proof-of-concept** covering the public marketing site *and* four role-based workflows end to end, built around a **ticket** lifecycle (12 stages, from `pickup_scheduled` to `delivered`) with real **Bag** and **Cloth** tracking:

- 🧺 **Customer** — book a pickup, track tickets by their full timeline, cancel a not-yet-accepted one, rate the rider and overall service once delivered, and see their own spend/availed/completed/cancelled stats
- 🏬 **Store Manager** — pickups land in its queue automatically (by pincode match) or via owner assignment, then it assigns a rider, walks a ticket manually through arrived → washing → ironing → packed (optionally recounting items), then assigns a rider for delivery; a live "Riders" dashboard shows which of its riders are on a task right now vs. idle
- 🚚 **Rider** — collect an accepted pickup, scan the bag (a real id from the owner's bag pool, entered by hand or scanned with the device camera), tag & scan each garment the same way (which is what actually moves the ticket to "Picked Up"), and later start/complete the delivery leg
- 👑 **Owner** — cross-store overview (now with revenue + average ratings), stores, every ticket's full timeline (including its bag & garment contents and ₹ order value), a cross-store rider-status dashboard, all users with per-customer stats, an "Add Employee" form (rider / store manager / owner, one role per account), and a bag/tag inventory system — generate bags & tags, assign bags to stores, export either as CSV, print QR-code labels, and look up any bag/tag by id

Every ticket list (customer/store/rider/owner) has filter chips plus a sort dropdown (soonest/latest pickup, newest/oldest booked) — consistent across all four roles. Bag/garment-tag ids can be entered by hand or scanned with a real camera-based QR reader (not simulated, unlike other "scan" buttons in this app) anywhere an id is needed.

There's still no real database — but ticket/bag/cloth data lives **server-side**, in a JSON file behind a handful of API routes, seeded from [`data/`](data). That means every browser/device hitting the same running server sees the same live tickets: assign a rider from a laptop and a rider on a different phone/browser sees it appear. Only login identity is per-device (pick any demo account, on any device, independently). See [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the real (Postgres-backed) backend this is standing in for, and [`CONTEXT.md`](CONTEXT.md) for why it's built this way — including which lifecycle stages are automatic vs. manual, and the one caveat with this approach on Vercel specifically (data resets on cold starts there — a real database is still the fix for that, not this JSON file).

## 🚀 Running locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

## 🔑 Demo logins

The [`/login`](http://localhost:3000/login) page has one-click "Demo as…" buttons, which always log into the *first* account of that role (Koramangala's store/riders, `meera@example.com`, the one owner). Bookings auto-assign to whichever store's pincode matches the pickup address; if none match, the ticket waits for the **owner** to assign a store by hand — sign in manually as a different store (or as the owner) to see those paths. All 5 stores have a store + rider login. Full list in [`data/users.json`](data/users.json); a few:

| Role | Email | Password |
|---|---|---|
| Owner | `owner@laundrylanes.com` | `owner123` |
| Store — Koramangala | `koramangala@laundrylanes.com` | `store123` |
| Store — Indiranagar | `indiranagar@laundrylanes.com` | `store123` |
| Store — HSR / Whitefield / Jayanagar | `hsr@` / `whitefield@` / `jayanagar@laundrylanes.com` | `store123` |
| Rider | `arjun@laundrylanes.com` (Koramangala) | `rider123` |
| Customer | `meera@example.com` | `customer123` |

> ⚠️ These are fake demo accounts over fake data — fine to keep in a public repo, but this is **not** real authentication. Don't reuse this pattern once a real backend is built (see `BACKEND_PLAN.md`).

Use the **🔄 Reset demo data** option in the hamburger menu to wipe any bookings/assignments you made and reseed the original mock data.

## 📚 Project docs

| Doc | What's in it |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | Running decision log — what was built, and *why* |
| [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) | Unresolved product questions waiting on the site owner |
| [`SKILLS.md`](SKILLS.md) | Condensed onboarding doc for any AI agent picking up this project |
| [`BACKEND_PLAN.md`](BACKEND_PLAN.md) | Implementation plan for the *real* backend this POC's mock data stands in for |

## 🙋 How to request a change

Anyone can propose a change — a copy edit, a color tweak, a new view, an API integration — without touching code directly:

1. Copy [`change-requests/TEMPLATE.md`](change-requests/TEMPLATE.md) into a new file directly under `change-requests/`, named `YYYY-MM-DD-short-slug.md` (e.g. `2026-09-26-brand-font-color.md`).
2. Fill it in: what you want changed, why, and any context an implementer would need (design references, an API contract, acceptance criteria). The more concrete, the better the resulting PR.
3. Commit it to a branch and open a PR — or, if you have write access, just commit it to `main` directly. It's a plain markdown file, so normal git review applies to the request itself too.

> That's the entire submission process — no forms, no ticketing tool, just a markdown file in a known place.

## 🤖 How requests get turned into code

Run the `apply-change-requests` skill (see [`.claude/skills/apply-change-requests/SKILL.md`](.claude/skills/apply-change-requests/SKILL.md)) whenever you want the backlog processed:

- It looks at every `.md` file directly under `change-requests/` (ignoring `TEMPLATE.md` and anything already under `change-requests/processed/`) — that set *is* "everything added since the last reconciliation," since processed requests get moved out of the root folder as part of landing them.
- For each pending request, it implements the change on its own branch, updates [`CONTEXT.md`](CONTEXT.md)/[`SKILLS.md`](SKILLS.md) if the change is non-obvious, moves the request file into `change-requests/processed/`, and opens a PR referencing the original request.
- Requests are handled **one PR per file** — unrelated changes never share a PR.
- If a request is too ambiguous to implement safely (missing business detail, no acceptance criteria), the skill adds a question to [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) instead of guessing, and says so in the PR description.
- The skill never merges its own PRs and never force-pushes — it opens PRs for human review, same as any other contributor.

## 🗂️ Repo layout

```
laundry/
├── app/                       # Next.js App Router
│   ├── page.jsx                 # public marketing home
│   ├── login/                   # login + demo-role buttons
│   ├── customer/  store/  rider/  owner/    # one folder per role
│   │   ├── layout.jsx             # role guard + hamburger app shell
│   │   └── tickets/[id]/          # shared ticket detail (customer/store/owner; rider too)
├── components/                # AppShell, RoleGuard, TicketCard, TicketDetail, TicketTimeline, StoreLocator, ...
├── lib/                        # AppProvider (mock auth + tickets/bags/clothes), nav, constants, haversine
├── data/                       # dummy users.json / stores.json / services.json / tickets.json / bags.json / clothes.json
├── styles/globals.css          # brand system + app-shell + marketing styles
├── public/images/logo.webp
├── change-requests/            # inbox for proposed changes (see above)
│   ├── TEMPLATE.md
│   └── processed/               # requests already turned into a landed PR
├── CONTEXT.md
├── OPEN_QUESTIONS.md
├── SKILLS.md
├── BACKEND_PLAN.md
└── README.md
```

---

<p align="center"><sub>Fresh · Fast · Folded</sub></p>
