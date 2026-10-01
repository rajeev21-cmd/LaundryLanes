// Shared sort options for every ticket list view (customer/rider/store/owner)
// so "soonest pickup" and "newest booked" mean the same thing everywhere,
// instead of each page reinventing its own comparator.
export const TICKET_SORT_OPTIONS = [
  { value: 'pickup-asc', label: 'Pickup: soonest first' },
  { value: 'pickup-desc', label: 'Pickup: latest first' },
  { value: 'id-desc', label: 'Newest booked' },
  { value: 'id-asc', label: 'Oldest booked' },
];

function ticketSeq(ticket) {
  return parseInt(ticket.id.replace('tk-', ''), 10) || 0;
}

// pickupDate (YYYY-MM-DD) + slot (zero-padded 24h range, e.g. "08-10")
// concatenate into a single lexicographically-sortable chronological key.
function pickupKey(ticket) {
  return `${ticket.pickupDate}_${ticket.slot}`;
}

export function sortTickets(tickets, sortKey) {
  const arr = [...tickets];
  switch (sortKey) {
    case 'pickup-desc':
      return arr.sort((a, b) => pickupKey(b).localeCompare(pickupKey(a)));
    case 'id-asc':
      return arr.sort((a, b) => ticketSeq(a) - ticketSeq(b));
    case 'id-desc':
      return arr.sort((a, b) => ticketSeq(b) - ticketSeq(a));
    case 'pickup-asc':
    default:
      return arr.sort((a, b) => pickupKey(a).localeCompare(pickupKey(b)));
  }
}
