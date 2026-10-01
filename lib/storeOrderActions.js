import STORES from '@/data/stores.json';

// Server-only. Lets a store create a ticket directly, for a walk-in/phone
// customer who isn't booking through the app themselves — separate from
// bookPickup (lib/ticketActions.js), which is the customer's own self-serve
// flow and auto-assigns a store by pincode. Here the store IS already known
// (the creator), so there's no pincode-matching step, and the order is
// pre-accepted (storeAcceptedAt set immediately) — a store creating its own
// order has, definitionally, already accepted it; see CONTEXT.md for why
// "accepted" is a timestamp, not a status.

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function nextTicketId(db) {
  const seq = db.nextTicketSeq || 2020;
  return { id: `tk-${seq}`, nextTicketSeq: seq + 1 };
}

export function createStoreOrder(
  db,
  { storeId, customerId, newCustomer, serviceId, pickupAddress, pincode, pickupDate, slot, notes },
  actingUserId
) {
  const store = STORES.find((s) => s.id === storeId);
  if (!store) return { error: `No store found with id "${storeId}"` };

  let nextDb = db;
  let finalCustomerId = customerId;

  if (!finalCustomerId && newCustomer) {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.password) {
      return { error: 'New customer needs at least a name, email, and password' };
    }
    const customer = {
      id: nextId('u'),
      name: newCustomer.name,
      email: newCustomer.email,
      password: newCustomer.password,
      role: 'customer',
      phone: newCustomer.phone || '',
    };
    nextDb = { ...nextDb, users: [...nextDb.users, customer] };
    finalCustomerId = customer.id;
  }

  if (!finalCustomerId) {
    return { error: 'Pick an existing customer or fill in the new-customer fields' };
  }

  const customer = nextDb.users.find((u) => u.id === finalCustomerId);
  const { id, nextTicketSeq } = nextTicketId(nextDb);
  const now = new Date().toISOString();
  const ticket = {
    id,
    customerId: finalCustomerId,
    serviceId,
    storeId,
    assignedRiderId: null,
    pickupDate,
    slot,
    status: 'pickup_scheduled',
    pickupAddress,
    pincode: pincode || '',
    notes: notes || '',
    storeAcceptedAt: now,
    riderRating: null,
    serviceRating: null,
    ratedAt: null,
    history: [
      {
        at: now,
        status: 'pickup_scheduled',
        byUserId: actingUserId,
        byName: store.name,
        byRole: 'store',
        note: `Order created by ${store.name} for ${customer?.name || 'customer'} (walk-in/phone)`,
      },
    ],
  };

  return { db: { ...nextDb, tickets: [ticket, ...nextDb.tickets], nextTicketSeq }, ticket };
}
