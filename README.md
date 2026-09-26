<p align="center">
  <img src="assets/images/logo.webp" width="160" alt="Laundrylanes logo" />
</p>

<h1 align="center">Laundrylanes</h1>
<p align="center"><strong>Dry cleaning &amp; laundry, delivered.</strong><br/>Book in a tap. We pick up, we clean, we bring it back.</p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-in%20development-E07A3E?style=flat-square" />
  <img alt="stack" src="https://img.shields.io/badge/stack-HTML%20%C2%B7%20CSS%20%C2%B7%20JS-0B2545?style=flat-square" />
  <img alt="hosting" src="https://img.shields.io/badge/hosting-static%20%2F%20local-0B2545?style=flat-square" />
  <img alt="license" src="https://img.shields.io/badge/license-proprietary-lightgrey?style=flat-square" />
</p>

<p align="center">
  <a href="#-running-locally">Running locally</a> ·
  <a href="#-project-docs">Docs</a> ·
  <a href="#-how-to-request-a-change">Request a change</a> ·
  <a href="#-repo-layout">Repo layout</a>
</p>

---

## 🧺 What this is

The marketing site for **Laundrylanes** — dry cleaning, wash & fold, wash & iron, ironing, and shoe cleaning — with a store locator and interactive map. Built as a plain static HTML/CSS/JS site: no framework, no build step, nothing to install.

A backend (customer bookings, store/worker dashboards, an owner console) is planned but not yet built — see [`BACKEND_PLAN.md`](BACKEND_PLAN.md).

## 🚀 Running locally

```bash
python3 -m http.server 8080
```

Then open **http://localhost:8080**. That's the whole setup — no dependencies to install.

## 📚 Project docs

| Doc | What's in it |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | Running decision log — what was built, and *why* |
| [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) | Unresolved product questions waiting on the site owner |
| [`SKILLS.md`](SKILLS.md) | Condensed onboarding doc for any AI agent picking up this project |
| [`BACKEND_PLAN.md`](BACKEND_PLAN.md) | Implementation plan for customer/store/worker/owner logins & bookings |

## 🙋 How to request a change

Anyone can propose a change — a copy edit, a color tweak, a new section, an API integration — without touching code directly:

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
├── index.html
├── assets/
│   ├── style.css
│   ├── script.js
│   └── images/
├── change-requests/          # inbox for proposed changes (see above)
│   ├── TEMPLATE.md
│   └── processed/            # requests already turned into a landed PR
├── CONTEXT.md
├── OPEN_QUESTIONS.md
├── SKILLS.md
├── BACKEND_PLAN.md
└── README.md
```

---

<p align="center"><sub>Fresh · Fast · Folded</sub></p>
