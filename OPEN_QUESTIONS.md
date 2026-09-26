# Open Questions — Laundrylanes Website

Answer inline (below each question) whenever you get a chance; I'll pick up the answers and implement them.

## 1. Store locations
The store locator currently uses **placeholder** store names/addresses/coordinates in Bengaluru (`assets/script.js`, `STORES` array), copied loosely from the bumbledry.com reference.
- What are the real store addresses (and how many stores)?
- Do you have exact lat/lng, or should I geocode the addresses?
- Answer:

## 2. Service area / city
- Which city/cities does Laundrylanes operate in? (affects default map center + footer "service areas" list)
- Answer:

## 3. Contact details
- Real phone number, WhatsApp number, and email address to replace placeholders (`+91 00000 00000`, `hello@laundrylanes.com`).
- Answer:

## 4. Booking flow
- The "Schedule a Pickup" button currently links to a `#booking` anchor / `tel:` link (no real booking flow).
- Do you want an actual booking form on this site, a link to an external booking app, or is a phone/WhatsApp CTA sufficient for v1?
- Answer:

## 5. Pricing
- Do you want a price list section/page for the 5 services (Dry Cleaning, Wash & Fold, Wash & Iron, Iron, Shoe Cleaning)?
- Answer:

## 6. Photography vs. illustration
- Site currently uses minimal line-art SVG illustrations (no photos), per "minimal text with illustrative images."
- Do you have brand photography you'd like incorporated (e.g., real store fronts, delivery staff), or should it stay fully illustrated?
- Answer:

## 7. App presence
- The bumbledry.com reference has App Store / Google Play links. Does Laundrylanes have (or plan) a mobile app?
- Answer:

## 8. Social/reviews
- Instagram handle, follower count, review platform (Google reviews?) to feature real numbers instead of placeholder "4.9★".
- Answer:

## 9. Subscription plans
- bumbledry.com has "Subscription Plans." Does Laundrylanes want a subscription/membership offering on the site?
- Answer:

## 10. Domain & hosting
- Where should this eventually be deployed (Vercel, Netlify, existing hosting)? Any domain already purchased?
- Answer:

## 11. Backend rollout — account provisioning
See [BACKEND_PLAN.md](BACKEND_PLAN.md). Plan assumes store and worker accounts are created manually by the owner (no public signup for those roles) — customers are the only self-signup role.
- Confirm that's right, or do you want store owners/workers to be able to self-register (e.g. with an invite code)?
- Answer:

## 12. Backend rollout — booking slots
- Should pickup slots have a capacity limit per store (e.g. max 10 bookings per morning slot), or is unlimited fine for launch?
- What are the actual slot windows (morning/afternoon/evening, or specific hour ranges)?
- Answer:

## 13. Backend rollout — payments
- Is any payment collection in scope (pay online at booking, pay on pickup/delivery, invoice later), or purely operational (booking + fulfillment tracking) for now?
- Answer:

## 14. Backend rollout — notifications
- Email confirmations only (free tier), or do you want SMS/WhatsApp too? SMS/WhatsApp cost money per message (e.g. Twilio) — flagging before it's built in.
- Answer:
