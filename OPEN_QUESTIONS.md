<p align="center"><img src="assets/images/logo.webp" width="64" alt="Laundrylanes" /></p>
<h1 align="center">Open Questions</h1>
<p align="center"><sub><a href="README.md">← Back to README</a> · <a href="CONTEXT.md">CONTEXT.md</a> · <a href="BACKEND_PLAN.md">BACKEND_PLAN.md</a></sub></p>

---

Answer inline (below each question, replacing `_Not yet answered._`) whenever you get a chance — answers get picked up and implemented from here.

| # | Question | Status |
|---|---|---|
| [1](#1-store-locations) | Store locations | ❓ open |
| [2](#2-service-area--city) | Service area / city | ❓ open |
| [3](#3-contact-details) | Contact details | ❓ open |
| [4](#4-booking-flow) | Booking flow | ❓ open |
| [5](#5-pricing) | Pricing | ❓ open |
| [6](#6-photography-vs-illustration) | Photography vs. illustration | ❓ open |
| [7](#7-app-presence) | App presence | ❓ open |
| [8](#8-socialreviews) | Social / reviews | ❓ open |
| [9](#9-subscription-plans) | Subscription plans | ❓ open |
| [10](#10-domain--hosting) | Domain & hosting | ❓ open |
| [11](#11-backend-rollout--account-provisioning) | Backend — account provisioning | ❓ open |
| [12](#12-backend-rollout--booking-slots) | Backend — booking slots | ❓ open |
| [13](#13-backend-rollout--payments) | Backend — payments | ❓ open |
| [14](#14-backend-rollout--notifications) | Backend — notifications | ❓ open |

---

### 1. Store locations

The store locator currently uses **placeholder** store names/addresses/coordinates in Bengaluru (`assets/script.js`, `STORES` array), copied loosely from the bumbledry.com reference.
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

- The "Schedule a Pickup" button currently links to a `#booking` anchor / `tel:` link (no real booking flow).
- Do you want an actual booking form on this site, a link to an external booking app, or is a phone/WhatsApp CTA sufficient for v1?

**Answer:** _Not yet answered._

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

- Where should this eventually be deployed (Vercel, Netlify, existing hosting)? Any domain already purchased?

**Answer:** _Not yet answered._

### 11. Backend rollout — account provisioning

See [`BACKEND_PLAN.md`](BACKEND_PLAN.md). Plan assumes store and worker accounts are created manually by the owner (no public signup for those roles) — customers are the only self-signup role.
- Confirm that's right, or do you want store owners/workers to be able to self-register (e.g. with an invite code)?

**Answer:** _Not yet answered._

### 12. Backend rollout — booking slots

- Should pickup slots have a capacity limit per store (e.g. max 10 bookings per morning slot), or is unlimited fine for launch?
- What are the actual slot windows (morning/afternoon/evening, or specific hour ranges)?

**Answer:** _Not yet answered._

### 13. Backend rollout — payments

- Is any payment collection in scope (pay online at booking, pay on pickup/delivery, invoice later), or purely operational (booking + fulfillment tracking) for now?

**Answer:** _Not yet answered._

### 14. Backend rollout — notifications

- Email confirmations only (free tier), or do you want SMS/WhatsApp too? SMS/WhatsApp cost money per message (e.g. Twilio) — flagging before it's built in.

**Answer:** _Not yet answered._
