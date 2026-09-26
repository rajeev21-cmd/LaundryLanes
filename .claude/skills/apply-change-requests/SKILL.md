---
name: apply-change-requests
description: Process pending markdown change requests under change-requests/ into implemented code changes, one PR per request. Use when the user asks to "update the website", "process change requests", "reconcile requests", or run this skill by name.
---

# Apply Change Requests

Turns pending files in `change-requests/` into landed code changes, each as its own reviewed PR. This is the automation described in the root [README.md](../../../README.md)'s "How requests get turned into code" section — read that section for the user-facing contract before changing this skill's behavior.

## Step 1 — Find pending requests

Pending requests are every `*.md` file directly under `change-requests/`, **excluding**:
- `change-requests/TEMPLATE.md`
- anything already under `change-requests/processed/`

```bash
find change-requests -maxdepth 1 -name '*.md' ! -name 'TEMPLATE.md'
```

If there are none, report that the backlog is empty and stop. Do not touch `change-requests/processed/` files — they're history, not work.

## Step 2 — Process each request independently

For **each** pending file, in isolation (finish and land or explicitly defer one before starting the next — never mix two requests' changes into one branch/commit/PR):

1. **Read the whole file.** It should roughly follow `TEMPLATE.md`'s shape (title, requester, type, description, context, acceptance criteria), but treat that as a guide, not a hard schema — some requests will be terse, some will paste in a full API contract. Work with what's there.
2. **Judge whether it's implementable as-is.** If it's missing information you'd have to guess at to implement safely (e.g. "add an API integration" with no endpoint/auth/contract, or a design change with no concrete color/target), do **not** guess at business specifics:
   - Add a numbered question to [OPEN_QUESTIONS.md](../../../OPEN_QUESTIONS.md) describing exactly what's missing, referencing the request file by name.
   - Still make whatever partial, low-risk progress is reasonable (e.g. scaffold the integration point, or leave the change unimplemented) — use judgment.
   - Note in the PR description (or, if nothing was implementable at all, skip opening a PR entirely and just leave the OPEN_QUESTIONS.md entry + a short note in your final summary) what's blocked and why.
3. **Create a dedicated branch**: `change-request/<slug>`, where `<slug>` is the request's filename without the date prefix and `.md` extension (e.g. `2026-09-26-brand-font-color.md` → `change-request/brand-font-color`).
4. **Implement the change** in that branch, following this repo's existing conventions (plain HTML/CSS/JS, brand colors as CSS variables in `assets/style.css`, no new frameworks/build steps unless the request explicitly requires a backend). Test it — start the local server and check the change in a browser before considering it done, per this project's usual verification bar.
5. **Update [CONTEXT.md](../../../CONTEXT.md)** with a short entry if the change involved a non-obvious decision (why, not just what) — same bar as any other change to this project. Skip it for trivial changes (e.g. a one-line color swap) where there's nothing non-obvious to record.
6. **Move the request file**: `git mv change-requests/<file>.md change-requests/processed/<file>.md`. This is what makes it disappear from "pending" for the next run — don't skip it, and don't do it for requests you decided not to implement (leave those in the root so they're still pending).
7. **Commit** everything for this request together (code changes + CONTEXT.md update + the file move), with a message describing the change and referencing the request filename.
8. **Push the branch and open a PR** (`gh pr create`) whose body:
   - Summarizes what changed and why.
   - Links back to the original request content (quote the title/description).
   - Notes any OPEN_QUESTIONS.md entries added and what's still blocked, if applicable.
   - Ends with the standard PR attribution footer used elsewhere in this project.
9. **Return to the base branch** (`main`) before starting the next pending request, so requests never leak into each other's branches.

## Rules

- **Never merge a PR you opened**, and never enable auto-merge — these land via normal human review, same as any other contributor's PR.
- **Never force-push or rewrite history** on shared branches.
- **Never push directly to `main`** — every request lands via a PR, even trivial ones, so there's a review point and a clean audit trail back to the request file.
- **One request, one branch, one PR.** If a request turns out to actually be several unrelated changes, either implement the smallest coherent piece and leave the rest as a new OPEN_QUESTIONS.md note, or ask the user how to split it — don't silently bundle.
- If `gh` isn't authenticated or there's no remote configured, stop and tell the user what's missing rather than leaving local commits stranded on unpushed branches.

## Step 3 — Report back

After processing all pending requests (or stopping early on a blocker), summarize: which requests became PRs (with links), which were partially blocked (and what OPEN_QUESTIONS.md entries were added), and which were skipped entirely and why.
