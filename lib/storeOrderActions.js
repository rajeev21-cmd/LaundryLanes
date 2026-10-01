import STORES from '@/data/stores.json';

// Server-only. Lets a store create a ticket directly, for a walk-in/phone
// customer who isn't booking through the app themselves — separate from
// bookPickup (lib/ticketActions.js), which is the customer's own self-serve
// flow and auto-assigns a store by pincode. Here the store IS already known
// (the creator), so there's no pincode-matching step, and the order is
// pre-accepted (storeAcceptedAt set immediately) — a store creating its own
// order has, definitionally, already accepted it; see CONTEXT.md for why
// "accepted" is a timestamp, not a status.
//
// pickupMethod is always 'self_dropoff' here, not a choice — a store
// creating this order already has the customer and their clothes at the
// counter, so there's no pickup address to collect and no rider to send.
// deliveryMethod is a real choice (self_pickup vs delivery), made by the
// store on the walk-in customer's behalf.

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function nextTicketId(db) {
  const seq = db.nextTicketSeq || 2020;
  return { id: `tk-${seq}`, nextTicketSeq: seq + 1 };
}

function formatAddress({ line1, landmark, city, pincode }) {
  return `${line1}${landmark ? `, near ${landmark}` : ''}, ${city} - ${pincode}`;
}

export function createStoreOrder(
  db,
  { storeId, customerId, newCustomer, serviceId, deliveryMethod, deliveryAddressId, newDeliveryAddress, pickupDate, slot, notes },
  actingUserId
) {
  const store = STORES.find((s) => s.id === storeId);
  if (!store) return { error: `No store found with id "${storeId}"` };
  if (deliveryMethod !== 'self_pickup' && deliveryMethod !== 'delivery') {
    return { error: 'Choose how the customer wants their order back: self pickup or delivery' };
  }

  let nextDb = db;
  let finalCustomerId = customerId;

  if (!finalCustomerId && newCustomer) {
    if (!newCustomer.name || !newCustomer.email) {
      return { error: 'New customer needs at least a name and email' };
    }
    // No password yet — a store creating this account on someone's behalf
    // has no way to hand them a password securely anyway. They set their
    // own the first time they try to log in (see claimAccount() and
    // AppProvider.jsx's login()).
    const customer = {
      id: nextId('u'),
      name: newCustomer.name,
      email: newCustomer.email,
      password: null,
      role: 'customer',
      phone: newCustomer.phone || '',
    };
    nextDb = { ...nextDb, users: [...nextDb.users, customer] };
    finalCustomerId = customer.id;
  }

  if (!finalCustomerId) {
    return { error: 'Pick an existing customer or fill in the new-customer fields' };
  }

  // Resolves to a formatted string on the ticket, same as pickupAddress
  // always has been — not a foreign key — but a real addresses row gets
  // created/reused either way, so it shows up in the customer's own address
  // book next time too (existing or brand-new customer alike).
  let deliveryAddress = '';
  if (deliveryMethod === 'delivery') {
    if (deliveryAddressId) {
      const existing = nextDb.addresses.find((a) => a.id === deliveryAddressId && a.customerId === finalCustomerId);
      if (!existing) return { error: `No saved address "${deliveryAddressId}" found for this customer` };
      deliveryAddress = formatAddress(existing);
    } else if (newDeliveryAddress?.line1 && newDeliveryAddress?.pincode) {
      const address = {
        id: nextId('addr'),
        customerId: finalCustomerId,
        label: newDeliveryAddress.label || 'Address',
        line1: newDeliveryAddress.line1,
        line2: '',
        landmark: newDeliveryAddress.landmark || '',
        city: newDeliveryAddress.city || 'Bengaluru',
        pincode: newDeliveryAddress.pincode,
      };
      nextDb = { ...nextDb, addresses: [...nextDb.addresses, address] };
      deliveryAddress = formatAddress(address);
    } else {
      return { error: 'Delivery needs either a saved address or a new one' };
    }
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
    pickupMethod: 'self_dropoff',
    pickupAddress: '',
    pincode: '',
    deliveryMethod,
    deliveryAddress,
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
