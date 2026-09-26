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

// No auto-assignment — a ticket is created unclaimed (storeId: null) and sits
// in a shared pool. Any store can claim it; see claimTicket() below. This was
// an explicit product decision: it used to auto-assign the geographically
// nearest of the 5 seed stores, which doesn't reflect how the business
// actually wants pickups distributed (first-come claiming, not geo-routing).
export function bookPickup(db, { customerId, serviceId, pickupAddress, pickupDate, slot, notes }) {
  const customer = USERS.find((u) => u.id === customerId);
  const ticket = {
    id: nextId('tk'),
    customerId,
    serviceId,
    storeId: null,
    assignedRiderId: null,
    pickupDate,
    slot,
    status: 'pickup_scheduled',
    pickupAddress,
    notes: notes || '',
    history: [
      {
        at: new Date().toISOString(),
        status: 'pickup_scheduled',
        byUserId: customerId,
        byName: customer?.name || 'Customer',
        byRole: 'customer',
        note: 'Ticket created — awaiting a store to claim it',
      },
    ],
  };
  return { db: { ...db, tickets: [ticket, ...db.tickets] }, ticket };
}

export function cancelTicket(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'cancelled' }, 'Cancelled by customer', actingUserId) };
}

// Any store can claim any unclaimed ticket — sets storeId but deliberately
// does NOT advance status; the ticket stays 'pickup_scheduled' until that
// store also assigns a rider (assignRiderForPickup), same as before. Claiming
// is just "this is now in my queue," a separate step from acting on it.
export function claimTicket(db, ticketId, payload, actingUserId) {
  const actor = USERS.find((u) => u.id === actingUserId);
  const store = STORES.find((s) => s.id === actor?.storeId);
  return {
    ...db,
    tickets: logAndPatch(db.tickets, ticketId, { storeId: actor?.storeId || null }, `Claimed by ${store?.name || 'a store'}`, actingUserId),
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

export function addCloth(db, ticketId, { label }, actingUserId) {
  const id = nextId('cloth');
  const tag = `TAG-${id.split('-').pop()}`;
  return {
    ...db,
    clothes: [...db.clothes, { id, ticketId, tag, label }],
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
  claimTicket,
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
