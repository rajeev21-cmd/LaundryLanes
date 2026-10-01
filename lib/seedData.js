import TICKETS_SEED from '@/data/tickets.json';
import CLOTHES_SEED from '@/data/clothes.json';
import USERS_SEED from '@/data/users.json';
import STORES from '@/data/stores.json';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/constants';

function offsetToDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function seedHistoryFor(ticket) {
  const baseDate = offsetToDateStr(ticket.dayOffset);
  if (ticket.status === 'cancelled') {
    return [
      { at: `${baseDate}T09:00:00.000Z`, status: 'pickup_scheduled', byUserId: null, byName: 'Seed data', byRole: null, note: 'Ticket created' },
      { at: `${baseDate}T09:05:00.000Z`, status: 'cancelled', byUserId: null, byName: 'Seed data', byRole: null, note: 'Cancelled' },
    ];
  }
  const idx = STATUS_ORDER.indexOf(ticket.status);
  return STATUS_ORDER.slice(0, idx + 1).map((status, i) => ({
    at: `${baseDate}T${String(8 + i).padStart(2, '0')}:00:00.000Z`,
    status,
    byUserId: null,
    byName: 'Seed data',
    byRole: null,
    note: STATUS_LABELS[status],
  }));
}

// One saved address per demo customer, matching their seed tickets' pickup
// address so the two stay consistent in the demo.
const ADDRESSES_SEED = [
  { id: 'addr-1', customerId: 'u-customer-1', label: 'Home', line1: '12, 80 Feet Road, Koramangala 4th Block', line2: '', landmark: '', city: 'Bengaluru', pincode: '560034' },
  { id: 'addr-2', customerId: 'u-customer-2', label: 'Home', line1: '45, Koramangala 5th Block', line2: '', landmark: '', city: 'Bengaluru', pincode: '560034' },
  { id: 'addr-3', customerId: 'u-customer-3', label: 'Home', line1: '7, Jyoti Nivas College Road, Koramangala', line2: '', landmark: '', city: 'Bengaluru', pincode: '560034' },
];

// Bags used to be auto-generated per ticket the moment a rider scanned one
// (see CONTEXT.md's history). Now bags are owner-provisioned inventory that
// gets assigned to a store, then to whichever ticket a rider currently has
// it on — so the seed data needs to reconstruct the same 10 seed tickets'
// bags under the new { id, storeId, ticketId } shape. A bag whose ticket is
// already delivered/cancelled is seeded back in the pool (ticketId: null)
// since bags are reusable (tags, below, are not — see CONTEXT.md).
const TICKETS_WITH_SEED_BAGS = ['tk-2004', 'tk-2005', 'tk-2006', 'tk-2007', 'tk-2008', 'tk-2009', 'tk-2010', 'tk-2011', 'tk-2012', 'tk-2015'];

function buildBagsSeed() {
  const inUse = TICKETS_WITH_SEED_BAGS.map((ticketId, i) => {
    const ticket = TICKETS_SEED.find((t) => t.id === ticketId);
    const stillActive = ticket && !['delivered', 'cancelled'].includes(ticket.status);
    return { id: `BAG-${String(i + 1).padStart(4, '0')}`, storeId: ticket?.storeId || null, ticketId: stillActive ? ticketId : null };
  });
  // A couple of spare, already-assigned-but-available bags per store, plus a
  // few the owner hasn't handed to any store yet — so a fresh seed shows all
  // three states (in use / available at a store / unassigned) immediately.
  const extraAvailable = STORES.flatMap((s, si) =>
    [1, 2].map((n) => ({ id: `BAG-${String(100 + si * 10 + n).padStart(4, '0')}`, storeId: s.id, ticketId: null }))
  );
  const unassigned = [1, 2, 3].map((n) => ({ id: `BAG-${String(900 + n).padStart(4, '0')}`, storeId: null, ticketId: null }));
  return [...inUse, ...extraAvailable, ...unassigned];
}

// A pool of fresh, unused tag ids for riders to draw from during pickup.
// Deliberately separate from CLOTHES_SEED's existing tag strings (old
// per-ticket-generated format, e.g. "TAG-2004-1") — those are historical and
// never re-validated against this pool; only newly-added clothes need their
// tag to exist here and be unused (see addCloth in lib/ticketActions.js).
function buildClothTagsSeed() {
  return Array.from({ length: 30 }, (_, i) => ({ id: `TAG-${String(i + 1).padStart(5, '0')}` }));
}

// Continues from the highest seed ticket number (tk-2019) so freshly-booked
// tickets get clean sequential numbers instead of a raw timestamp.
const FIRST_DYNAMIC_TICKET_SEQ = 2020;
const FIRST_DYNAMIC_BAG_SEQ = 1000;
const FIRST_DYNAMIC_TAG_SEQ = 31;

// The one source of truth for "what does a freshly-seeded database look like."
// Used both by the server (first boot / reset) — never imported by client code directly.
export function buildSeedState() {
  const tickets = TICKETS_SEED.map((t) => {
    const withDate = { ...t, pickupDate: offsetToDateStr(t.dayOffset) };
    return { ...withDate, history: seedHistoryFor(withDate) };
  });
  return {
    tickets,
    bags: buildBagsSeed(),
    clothes: CLOTHES_SEED,
    clothTags: buildClothTagsSeed(),
    addresses: ADDRESSES_SEED,
    users: USERS_SEED,
    nextTicketSeq: FIRST_DYNAMIC_TICKET_SEQ,
    nextBagSeq: FIRST_DYNAMIC_BAG_SEQ,
    nextTagSeq: FIRST_DYNAMIC_TAG_SEQ,
  };
}
