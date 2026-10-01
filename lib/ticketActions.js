import STORES from '@/data/stores.json';

// Server-only. Mirrors what used to be lib/AppProvider.jsx's client-side
// reducer logic, but operates on a plain db object ({ tickets, bags,
// clothes, users, ... }) and returns a new one — the API routes are the
// only callers.

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

// Tickets get a short, sequential, human-friendly number (continuing from the
// seed range) instead of a raw timestamp — "#1790441365616-1" is not
// "easily identifiable." db.nextTicketSeq is seeded at 2020 in seedData.js.
function nextTicketId(db) {
  const seq = db.nextTicketSeq || 2020;
  return { id: `tk-${seq}`, nextTicketSeq: seq + 1 };
}

function resolveActor(db, actingUserId) {
  const user = db.users.find((u) => u.id === actingUserId);
  return {
    byUserId: user?.id || null,
    byName: user?.name || 'System',
    byRole: user?.role || null,
  };
}

// Applies `patch` to a ticket and appends a history entry — every ticket
// mutation goes through this, so the log can never fall out of sync with
// what actually happened. Takes the whole db (not just db.tickets) because
// resolveActor needs db.users to look up who's acting. Returns a new
// tickets array.
function logAndPatch(db, ticketId, patch, note, actingUserId) {
  return db.tickets.map((t) => {
    if (t.id !== ticketId) return t;
    const merged = { ...t, ...patch };
    const entry = { at: new Date().toISOString(), status: merged.status, note, ...resolveActor(db, actingUserId) };
    merged.history = [...(t.history || []), entry];
    return merged;
  });
}

// Store assignment is pincode-based, not claimed by stores and not geo-routed
// by distance (both tried, both explicitly rejected). If the pickup pincode
// matches a store, that store is assigned automatically; otherwise the ticket
// stays unassigned for the owner to assign by hand (see assignStoreToTicket).
export function bookPickup(db, { customerId, serviceId, pickupAddress, pincode, pickupDate, slot, notes }) {
  const customer = db.users.find((u) => u.id === customerId);
  const matchedStore = STORES.find((s) => s.pincode === pincode);
  const { id, nextTicketSeq } = nextTicketId(db);
  const ticket = {
    id,
    customerId,
    serviceId,
    storeId: matchedStore?.id || null,
    assignedRiderId: null,
    pickupDate,
    slot,
    status: 'pickup_scheduled',
    pickupAddress,
    pincode,
    notes: notes || '',
    riderRating: null,
    serviceRating: null,
    ratedAt: null,
    history: [
      {
        at: new Date().toISOString(),
        status: 'pickup_scheduled',
        byUserId: customerId,
        byName: customer?.name || 'Customer',
        byRole: 'customer',
        note: matchedStore
          ? `Ticket created, auto-assigned to ${matchedStore.name} (pincode ${pincode})`
          : `Ticket created — no store services pincode ${pincode}; awaiting admin assignment`,
      },
    ],
  };
  return { db: { ...db, tickets: [ticket, ...db.tickets], nextTicketSeq }, ticket };
}

// Releases this ticket's bag back to its store's available pool, if it had
// one — bags are reusable, so a cancelled ticket shouldn't permanently tie
// one up. No-op (unchanged map) if no bag was ever scanned.
function releaseBag(db, ticketId) {
  return db.bags.map((b) => (b.ticketId === ticketId ? { ...b, ticketId: null } : b));
}

export function cancelTicket(db, ticketId, payload, actingUserId) {
  return {
    ...db,
    bags: releaseBag(db, ticketId),
    tickets: logAndPatch(db, ticketId, { status: 'cancelled' }, 'Cancelled by customer', actingUserId),
  };
}

// Owner-only in the UI (not enforced server-side, same as every other action
// here) — stores can no longer self-claim a ticket. Doesn't advance status;
// same as the old claim, this just sets whose queue it's in.
export function assignStoreToTicket(db, ticketId, { storeId }, actingUserId) {
  const store = STORES.find((s) => s.id === storeId);
  return {
    ...db,
    tickets: logAndPatch(db, ticketId, { storeId }, `Assigned to ${store?.name || storeId} by admin`, actingUserId),
  };
}

// Explicit store-level "we'll take this order" step — deliberately does
// NOT advance `status` (stays pickup_scheduled), it just records that the
// store has reviewed and accepted it. Doesn't reuse/repurpose the
// pickup_request_accepted status, which already means something different
// (a rider has been assigned) — adding a boolean timestamp here instead of
// a new status avoids reshuffling the whole 12-stage STATUS_ORDER for what
// is really a sub-state of pickup_scheduled. TicketDetail.jsx gates the
// "assign a rider" control behind this being set.
export function acceptOrder(db, ticketId, payload, actingUserId) {
  return {
    ...db,
    tickets: logAndPatch(db, ticketId, { storeAcceptedAt: new Date().toISOString() }, 'Order accepted by store', actingUserId),
  };
}

export function assignRiderForPickup(db, ticketId, { riderId }, actingUserId) {
  const rider = db.users.find((u) => u.id === riderId);
  return {
    ...db,
    tickets: logAndPatch(
      db,
      ticketId,
      { assignedRiderId: riderId, status: 'pickup_request_accepted' },
      `Rider assigned for pickup: ${rider?.name || riderId}`,
      actingUserId
    ),
  };
}

export function riderCollect(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'driver_arriving_for_pickup' }, 'Rider en route to pickup', actingUserId) };
}

// The bag must be an id the owner actually generated (db.bags), assigned to
// this ticket's store, and not already in use on a different ticket — bags
// are owner-provisioned inventory now, not auto-created per pickup (see
// CONTEXT.md). Re-scanning the same bag already on this ticket is allowed
// (idempotent), so a double-submit doesn't error.
export function scanBag(db, ticketId, { bagId }, actingUserId) {
  const ticket = db.tickets.find((t) => t.id === ticketId);
  const bag = db.bags.find((b) => b.id === bagId);
  if (!bag) return { error: `No bag found with id "${bagId}"` };
  if (bag.storeId !== ticket.storeId) return { error: `Bag ${bagId} isn't assigned to this store` };
  if (bag.ticketId && bag.ticketId !== ticketId) return { error: `Bag ${bagId} is already in use on another ticket` };
  return {
    ...db,
    bags: db.bags.map((b) => (b.id === bagId ? { ...b, ticketId } : b)),
    tickets: logAndPatch(db, ticketId, { status: 'pickup_in_progress' }, `Bag ${bagId} scanned`, actingUserId),
  };
}

// Callable by a rider (during pickup) or a store user (e.g. recounting on
// arrival) — not role-restricted here, same as everything else; the UI only
// shows the control to whoever should see it. `category` drives the qty
// breakdown and the order-value calc (see lib/constants.js's
// CLOTH_CATEGORIES / CLOTH_CATEGORY_PRICES). `tagId` must be an id the owner
// actually generated (db.clothTags) and not already used on any other
// garment, ever — tags are single-use, unlike bags.
export function addCloth(db, ticketId, { label, category, tagId }, actingUserId) {
  if (!db.clothTags.some((t) => t.id === tagId)) return { error: `No tag found with id "${tagId}"` };
  if (db.clothes.some((c) => c.tag === tagId)) return { error: `Tag ${tagId} has already been used` };
  const id = nextId('cloth');
  return {
    ...db,
    clothes: [...db.clothes, { id, ticketId, tag: tagId, label, category: category || 'Other' }],
    tickets: logAndPatch(db, ticketId, {}, `Item tagged & scanned: ${label} (${tagId})`, actingUserId),
  };
}

export function finishPickup(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'picked_up' }, 'Pickup completed by rider', actingUserId) };
}

export function markArrivedAtStore(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'arrived_at_store' }, 'Arrived at store', actingUserId) };
}

// A walk-in/phone-order customer's items are already physically at the store
// the moment the store finishes bagging & tagging them at the counter —
// there's no separate "picked up" moment distinct from "arrived at store"
// the way there is for a rider traveling back from a real pickup, so this
// jumps straight to arrived_at_store instead of going through picked_up
// first. Used by TicketDetail.jsx's store-side bag/tag flow, gated on
// !assignedRiderId so a ticket with a real rider pickup in progress never
// shows this control instead of the rider's own finishPickup.
export function finishWalkInIntake(db, ticketId, payload, actingUserId) {
  return {
    ...db,
    tickets: logAndPatch(
      db,
      ticketId,
      { status: 'arrived_at_store' },
      'Walk-in order bagged & tagged at the counter — already at store, no pickup needed',
      actingUserId
    ),
  };
}

export function startWashing(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'washing' }, 'Washing started', actingUserId) };
}

export function startIroning(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'ironing' }, 'Ironing started', actingUserId) };
}

export function markPacked(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'packed' }, 'Packed and ready to assign for delivery', actingUserId) };
}

export function assignRiderForDelivery(db, ticketId, { riderId }, actingUserId) {
  const rider = db.users.find((u) => u.id === riderId);
  return {
    ...db,
    tickets: logAndPatch(
      db,
      ticketId,
      { assignedRiderId: riderId, status: 'ready_for_delivery' },
      `Rider assigned for delivery: ${rider?.name || riderId}`,
      actingUserId
    ),
  };
}

export function startDelivery(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db, ticketId, { status: 'out_for_delivery' }, 'Rider started delivery', actingUserId) };
}

export function markDelivered(db, ticketId, payload, actingUserId) {
  return {
    ...db,
    bags: releaseBag(db, ticketId),
    tickets: logAndPatch(db, ticketId, { status: 'delivered' }, 'Delivered to customer', actingUserId),
  };
}

// Customer-only in the UI, only once a ticket is delivered, only once (the
// form hides itself once ratedAt is set — see TicketDetail.jsx). Both
// ratings are 1-5; either can be omitted (null) if the UI only collects one,
// though today's form always submits both together.
export function rateTicket(db, ticketId, { riderRating, serviceRating }, actingUserId) {
  return {
    ...db,
    tickets: logAndPatch(
      db,
      ticketId,
      { riderRating: riderRating ?? null, serviceRating: serviceRating ?? null, ratedAt: new Date().toISOString() },
      `Customer rated: rider ${riderRating ?? '—'}/5, service ${serviceRating ?? '—'}/5`,
      actingUserId
    ),
  };
}

export const TICKET_ACTIONS = {
  cancelTicket,
  assignStoreToTicket,
  acceptOrder,
  assignRiderForPickup,
  riderCollect,
  scanBag,
  addCloth,
  finishPickup,
  markArrivedAtStore,
  finishWalkInIntake,
  startWashing,
  startIroning,
  markPacked,
  assignRiderForDelivery,
  startDelivery,
  markDelivered,
  rateTicket,
};
