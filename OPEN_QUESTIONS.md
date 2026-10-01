<p align="center"><img src="public/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Open Questions</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="BACKEND_PLAN.md">BACKEND_PLAN.md</a></sub></p>

---

Answer inline (below each question, replacing `_Not yet answered._`) whenever you get a chance — answers get picked up and implemented from here.

| # | Question | Status |
|---|---|---|
| [1](#1-store-locations) | Store locations | ❓ open |
| [2](#2-service-area--city) | Service area / city | ❓ open |
| [3](#3-contact-details) | Contact details | ❓ open |
| [4](#4-booking-flow) | Booking flow | ✅ resolved |
| [5](#5-pricing) | Pricing | ❓ open |
| [6](#6-photography-vs-illustration) | Photography vs. illustration | ❓ open |
| [7](#7-app-presence) | App presence | ❓ open |
| [8](#8-socialreviews) | Social / reviews | ❓ open |
| [9](#9-subscription-plans) | Subscription plans | ❓ open |
| [10](#10-domain--hosting) | Domain & hosting | ✅ resolved |
| [11](#11-backend-rollout--account-provisioning) | Backend — account provisioning | ❓ open |
| [12](#12-backend-rollout--booking-slots) | Backend — booking slots | 🟡 partially resolved |
| [13](#13-backend-rollout--payments) | Backend — payments | ❓ open |
| [14](#14-backend-rollout--notifications) | Backend — notifications | ❓ open |
| [15](#15-store-manager-sub-role) | Store manager sub-role | ❓ open |
| [16](#16-real-scanning-hardware) | Real scanning hardware | 🟡 built, needs device verification |
| [17](#17-rider-reassignment-mid-ticket) | Rider reassignment mid-ticket | ❓ open |

---

### 1. Store locations

The store locator (and every ticket) currently uses **placeholder** store names/addresses/coordinates in Bengaluru (`data/stores.json`), copied loosely from the bumbledry.com reference.
- What are the real store addresses (and how many stores)?
- Do you have exact lat/lng, or should I geocode the addresses?

**Answer:** _Not yet answered._

### 2. Service area / city

- Which city/cities does Laundrylanes operate in? (affects default map center + footer "service areas" list)

**Answer:** _Not yet answered._

### 3. Contact details

- Real phone number, WhatsApp number, and email address to replace placeholders (`+91 00000 00000`, `hello@laundrylanes.com`).

**Answer:** _Not yet answered._

### 4. Booking flow

~~The "Schedule a Pickup" button currently links to a `#booking` anchor / `tel:` link (no real booking flow).~~ **Resolved** — the Next.js rebuild added a real in-app booking form (`app/customer/book/page.jsx`) as part of the full ticket lifecycle. Still using mock data/no real backend; see `BACKEND_PLAN.md`.

**Answer:** Built an in-app booking flow rather than a phone/WhatsApp CTA.

### 5. Pricing

- Do you want a price list section/page for the 5 services (Dry Cleaning, Wash & Fold, Wash & Iron, Iron, Shoe Cleaning)?

**Answer:** _Not yet answered._

### 6. Photography vs. illustration

- Site currently uses minimal line-art SVG illustrations (no photos), per "minimal text with illustrative images."
- Do you have brand photography you'd like incorporated (e.g., real store fronts, delivery staff), or should it stay fully illustrated?

**Answer:** _Not yet answered._

### 7. App presence

- The bumbledry.com reference has App Store / Google Play links. Does Laundrylanes have (or plan) a mobile app?

**Answer:** _Not yet answered._

### 8. Social/reviews

- Instagram handle, follower count, review platform (Google reviews?) to feature real numbers instead of placeholder "4.9★".

**Answer:** _Not yet answered._

### 9. Subscription plans

- bumbledry.com has "Subscription Plans." Does Laundrylanes want a subscription/membership offering on the site?

**Answer:** _Not yet answered._

### 10. Domain & hosting

~~Where should this eventually be deployed?~~ **Resolved** — deployed to Vercel at [laundry-lanes.vercel.app](https://laundry-lanes.vercel.app).
- Still open: a custom domain, if wanted, and whether the repo/deployment should move from public to private before real store/contact data goes in.

**Answer:** Vercel, no custom domain yet.

### 11. Backend rollout — account provisioning

See [`BACKEND_PLAN.md`](BACKEND_PLAN.md). Plan assumes store and rider accounts are created manually by the owner (no public signup for those roles) — customers are the only self-signup role.
- Confirm that's right, or do you want stores/riders to be able to self-register (e.g. with an invite code)?

**Answer:** _Not yet answered._

### 12. Backend rollout — booking slots

- ~~What are the actual slot windows~~ **Resolved** — fixed 2-hour windows: `8–10am, 10am–12pm, 12–2pm, 2–4pm, 4–6pm, 6–8pm` (`SLOT_LABELS` in `lib/constants.js`).
- Still open: should pickup slots have a capacity limit per store (e.g. max 10 bookings per slot), or is unlimited fine for launch?

**Answer:** Slot windows are 2 hours each, fixed. Capacity limits still undecided.

### 13. Backend rollout — payments

- Is any payment collection in scope (pay online at booking, pay on pickup/delivery, invoice later), or purely operational (booking + fulfillment tracking) for now?

**Answer:** _Not yet answered._

### 14. Backend rollout — notifications

- Email confirmations only (free tier), or do you want SMS/WhatsApp too? SMS/WhatsApp cost money per message (e.g. Twilio) — flagging before it's built in.

**Answer:** _Not yet answered._

### 15. Store manager sub-role

The brief said "anyone with store role or store manager role picks up the ticket," which reads like two distinct roles. The current build has a single `store` role covering everything a store does (accept pickups, assign riders, advance processing stages).
- Do you actually need a separate "store manager" role with different permissions than regular store staff (e.g. only a manager can assign riders, or only a manager can see pricing), or was that just descriptive phrasing for "whoever's working the store"?

**Answer:** _Not yet answered._

### 16. Real scanning hardware

~~Is simulated scanning fine, or do you want real QR camera scanning built?~~ **Resolved** — real camera-based QR scanning is now built (`jsqr` + `getUserMedia`, see `components/QrScannerModal.jsx`) for bag/tag id entry specifically (rider pickup flow + the owner/store lookup pages). Printable QR labels are generated for owner-provisioned bags/tags (`components/QrPrintSheet.jsx` + `qrcode`), meant to be printed and stuck on the physical item. Not yet verified with a real device/camera — only the no-camera graceful-failure path could be tested in this build environment.
- Still open: the rider's bag-scan **button press** itself (as opposed to the bag *id* entry) is still simulated in the sense that there's no physical barcode reader hardware involved — the camera reads a printed QR code's text, same as typing the id by hand would. If literal barcode-scanner hardware (not a phone camera) is wanted instead, that's a different, not-yet-built integration.

**Answer:** Real QR camera scanning is built for bag/garment tag ids. Needs on-device verification with an actual camera.

### 17. Rider reassignment mid-ticket

A ticket has a single `assignedRiderId`, reused for whichever phase is currently active — the rider who picks something up isn't tracked separately from the rider who later delivers it (the store just re-assigns the same field when the ticket reaches `packed`). This was simplest for the POC and matches "the store can assign the bag to the rider" reading as a fresh assignment each time.
- Is it fine for the pickup rider and delivery rider to be different people with no record kept of who did the pickup once a different rider is assigned for delivery, or do you want the pickup rider tracked separately (e.g. `pickupRiderId` / `deliveryRiderId`) for accountability?

**Answer:** _Not yet answered._
