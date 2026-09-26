import USERS from '@/data/users.json';
import STORES from '@/data/stores.json';
import { nearestStore } from '@/lib/haversine';

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

export function bookPickup(db, { customerId, serviceId, pickupAddress, lat, lng, pickupDate, slot, notes }) {
  const store = lat != null && lng != null ? nearestStore(STORES, lat, lng) : STORES[0];
  const customer = USERS.find((u) => u.id === customerId);
  const ticket = {
    id: nextId('tk'),
    customerId,
    serviceId,
    storeId: store.id,
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
        note: `Ticket created, assigned to ${store.name}`,
      },
    ],
  };
  return { db: { ...db, tickets: [ticket, ...db.tickets] }, ticket };
}

export function cancelTicket(db, ticketId, payload, actingUserId) {
  return { ...db, tickets: logAndPatch(db.tickets, ticketId, { status: 'cancelled' }, 'Cancelled by customer', actingUserId) };
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
