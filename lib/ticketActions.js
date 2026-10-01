import USERS from '@/data/users.json';
import STORES from '@/data/stores.json';

// Server-only. Mirrors what used to be lib/AppProvider.jsx's client-side
// reducer logic, but operates on a plain { tickets, bags, clothes } object
// and returns a new one — the API routes are the only callers.

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

function resolveActor(actingUserId) {
  const user = USERS.find((u) => u.id === actingUserId);
  return {
    byUserId: user?.id || null,
    byName: user?.name || 'System',
    byRole: user?.role || null,
  };
}

// Applies `patch` to a ticket and appends a history entry — every ticket
// mutation goes through this, so the log can never fall out of sync with
// what actually happened. Returns a new tickets array.
function logAndPatch(tickets, ticketId, patch, note, actingUserId) {
  return tickets.map((t) => {
    if (t.id !== ticketId) return t;
    const merged = { ...t, ...patch };
    const entry = { at: new Date().toISOString(), status: merged.status, note, ...resolveActor(actingUserId) };
    merged.history = [...(t.history || []), entry];
    return merged;
  });
}

// Store assignment is pincode-based, not claimed by stores and not geo-routed
// by distance (both tried, both explicitly rejected). If the pickup pincode
// matches a store, that store is assigned automatically; otherwise the ticket
// stays unassigned for the owner to assign by hand (see assignStoreToTicket).
export function bookPickup(db, { customerId, serviceId, pickupAddress, pincode, pickupDate, slot, notes }) {
  const customer = USERS.find((u) => u.id === customerId);
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

export function cancelTicket(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'cancelled' }, 'Cancelled by customer', actingUserId) };
}

// Owner-only in the UI (not enforced server-side, same as every other action
// here) — stores can no longer self-claim a ticket. Doesn't advance status;
// same as the old claim, this just sets whose queue it's in.
export function assignStoreToTicket(db, ticketId, { storeId }, actingUserId) {
  const store = STORES.find((s) => s.id === storeId);
  return {
    ...db,
    tickets: logAndPatch(db.tickets, ticketId, { storeId }, `Assigned to ${store?.name || storeId} by admin`, actingUserId),
  };
}

export function assignRiderForPickup(db, ticketId, { riderId }, actingUserId) {
  const rider = USERS.find((u) => u.id === riderId);
  return {
    ...db,
    tickets: logAndPatch(
      db.tickets,
      ticketId,
      { assignedRiderId: riderId, status: 'pickup_request_accepted' },
      `Rider assigned for pickup: ${rider?.name || riderId}`,
      actingUserId
    ),
  };
}

export function riderCollect(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'driver_arriving_for_pickup' }, 'Rider en route to pickup', actingUserId) };
}

export function scanBag(db, ticketId, payload, actingUserId) {
  const code = `BAG-${ticketId.split('-').pop().slice(-6).toUpperCase()}`;
  const existing = db.bags.find((b) => b.ticketId === ticketId);
  const bags = existing
    ? db.bags.map((b) => (b.ticketId === ticketId ? { ...b, scanned: true } : b))
    : [...db.bags, { id: nextId('bag'), code, ticketId, scanned: true }];
  return {
    ...db,
    bags,
    tickets: logAndPatch(db.tickets, ticketId, { status: 'pickup_in_progress' }, `Bag ${code} scanned`, actingUserId),
  };
}

// Callable by a rider (during pickup) or a store user (e.g. recounting on
// arrival) — not role-restricted here, same as everything else; the UI only
// shows the control to whoever should see it. `category` drives the qty
// breakdown shown on the ticket (see lib/constants.js's CLOTH_CATEGORIES).
export function addCloth(db, ticketId, { label, category }, actingUserId) {
  const id = nextId('cloth');
  const tag = `TAG-${id.split('-').pop()}`;
  return {
    ...db,
    clothes: [...db.clothes, { id, ticketId, tag, label, category: category || 'Other' }],
    tickets: logAndPatch(db.tickets, ticketId, {}, `Item tagged & scanned: ${label} (${tag})`, actingUserId),
  };
}

export function finishPickup(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'picked_up' }, 'Pickup completed by rider', actingUserId) };
}

export function markArrivedAtStore(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'arrived_at_store' }, 'Arrived at store', actingUserId) };
}

export function startWashing(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'washing' }, 'Washing started', actingUserId) };
}

export function startIroning(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'ironing' }, 'Ironing started', actingUserId) };
}

export function markPacked(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'packed' }, 'Packed and ready to assign for delivery', actingUserId) };
}

export function assignRiderForDelivery(db, ticketId, { riderId }, actingUserId) {
  const rider = USERS.find((u) => u.id === riderId);
  return {
    ...db,
    tickets: logAndPatch(
      db.tickets,
      ticketId,
      { assignedRiderId: riderId, status: 'ready_for_delivery' },
      `Rider assigned for delivery: ${rider?.name || riderId}`,
      actingUserId
    ),
  };
}

export function startDelivery(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'out_for_delivery' }, 'Rider started delivery', actingUserId) };
}

export function markDelivered(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'delivered' }, 'Delivered to customer', actingUserId) };
}

export const TICKET_ACTIONS = {
  cancelTicket,
  assignStoreToTicket,
  assignRiderForPickup,
  riderCollect,
  scanBag,
  addCloth,
  finishPickup,
  markArrivedAtStore,
  startWashing,
  startIroning,
  markPacked,
  assignRiderForDelivery,
  startDelivery,
  markDelivered,
};
