<p align="center">
  <img src="public/images/logo.webp" width="160" alt="Laundrylanes logo" />
</p>

<h1 align="center">Laundrylanes</h1>
<p align="center"><strong>Dry cleaning &amp; laundry, delivered.</strong><br/>Book in a tap. We pick up, we clean, we bring it back.</p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-POC-E07A3E?style=flat-square" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Next.js%20%C2%B7%20React-0B2545?style=flat-square" />
  <img alt="data" src="https://img.shields.io/badge/data-mock%20%2F%20localStorage-0B2545?style=flat-square" />
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

## 🧺 What this is

**Laundrylanes** — dry cleaning, wash & fold, wash & iron, ironing, and shoe cleaning, with doorstep pickup & drop. This repo is a **Next.js proof-of-concept** covering the public marketing site *and* four role-based workflows end to end:

- 🧺 **Customer** — book a pickup, track orders, cancel a pending one
- 🏬 **Store** — see today's pickups, assign each to a worker
- 🚚 **Worker** — see your own schedule, move a job through pickup → in progress → delivered
- 👑 **Owner** — cross-store overview, stores, all orders, all users

There's no real backend yet — auth and data are **mocked**: seeded from JSON files under [`data/`](data) into `localStorage` on first load, so the app is fully interactive (assign a worker, book an order, mark something delivered) without any server. See [`BACKEND_PLAN.md`](BACKEND_PLAN.md) for the real backend this POC is standing in for, and [`CONTEXT.md`](CONTEXT.md) for why it's built this way.

## 🚀 Running locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

## 🔑 Demo logins

The [`/login`](http://localhost:3000/login) page has one-click "Demo as…" buttons for each role. To sign in manually, credentials live in [`data/users.json`](data/users.json), e.g.:

| Role | Email | Password |
|---|---|---|
| Owner | `owner@laundrylanes.com` | `owner123` |
| Store | `koramangala@laundrylanes.com` | `store123` |
| Worker | `arjun@laundrylanes.com` | `worker123` |
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
│   ├── customer/  store/  worker/  owner/   # one folder per role
│   │   └── layout.jsx            # role guard + hamburger app shell
├── components/                # AppShell, RoleGuard, OrderCard, StatusBadge, StoreLocator, ...
├── lib/                        # AppProvider (mock auth + orders context), nav, constants, haversine
├── data/                       # dummy users.json / stores.json / services.json / orders.json
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
