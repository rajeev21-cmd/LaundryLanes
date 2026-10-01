import TICKETS_SEED from '@/data/tickets.json';
import BAGS_SEED from '@/data/bags.json';
import CLOTHES_SEED from '@/data/clothes.json';
import USERS_SEED from '@/data/users.json';
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

// Continues from the highest seed ticket number (tk-2019) so freshly-booked
// tickets get clean sequential numbers instead of a raw timestamp.
const FIRST_DYNAMIC_TICKET_SEQ = 2020;

// The one source of truth for "what does a freshly-seeded database look like."
// Used both by the server (first boot / reset) — never imported by client code directly.
export function buildSeedState() {
  const tickets = TICKETS_SEED.map((t) => {
    const withDate = { ...t, pickupDate: offsetToDateStr(t.dayOffset) };
    return { ...withDate, history: seedHistoryFor(withDate) };
  });
  return {
    tickets,
    bags: BAGS_SEED,
    clothes: CLOTHES_SEED,
    addresses: ADDRESSES_SEED,
    users: USERS_SEED,
    nextTicketSeq: FIRST_DYNAMIC_TICKET_SEQ,
  };
}
