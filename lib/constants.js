// Full ticket lifecycle. Order matters — it's the canonical progression used by
// TicketTimeline. 'cancelled' is off-path (reachable only from pickup_scheduled /
// pickup_request_accepted) and deliberately not in this array.
export const STATUS_ORDER = [
  'pickup_scheduled',
  'pickup_request_accepted',
  'driver_arriving_for_pickup',
  'pickup_in_progress',
  'picked_up',
  'arrived_at_store',
  'washing',
  'ironing',
  'packed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
];

export const STATUS_LABELS = {
  pickup_scheduled: 'Pickup Scheduled',
  pickup_request_accepted: 'Pickup Accepted by Store',
  driver_arriving_for_pickup: 'Rider Arriving for Pickup',
  pickup_in_progress: 'Pickup In Progress',
  picked_up: 'Picked Up',
  arrived_at_store: 'Arrived at Store',
  washing: 'Washing',
  ironing: 'Ironing',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Who/what moves a ticket out of each status — documentation only (surfaced in the
// ticket detail view), doesn't gate anything. See CONTEXT.md for the full rationale.
export const STATUS_DRIVER = {
  pickup_scheduled: 'Automatic — created when the customer books',
  pickup_request_accepted: 'Manual — store assigns the ticket to a rider',
  driver_arriving_for_pickup: 'Manual — rider taps "Collect Ticket"',
  pickup_in_progress: 'Manual — rider scans the bag',
  picked_up: 'Manual — rider confirms after tagging & scanning every item',
  arrived_at_store: 'Manual — store',
  washing: 'Manual — store',
  ironing: 'Manual — store',
  packed: 'Manual — store',
  ready_for_delivery: 'Manual — store assigns the ticket to a rider',
  out_for_delivery: 'Manual — rider taps "Start Delivery"',
  delivered: 'Manual — rider taps "Mark Delivered"',
  cancelled: 'Manual — customer cancels a not-yet-accepted ticket',
};

export const SLOT_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–4pm)',
  evening: 'Evening (4pm–8pm)',
};

export const ROLE_LABELS = {
  customer: 'Customer',
  store: 'Store',
  rider: 'Rider',
  owner: 'Owner',
};

export const ROLE_HOME = {
  customer: '/customer',
  store: '/store',
  rider: '/rider',
  owner: '/owner',
};
