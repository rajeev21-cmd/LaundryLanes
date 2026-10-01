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

// 2-hour windows. Keys are zero-padded 24h ranges so plain string sort
// (localeCompare) already puts them in chronological order — don't switch
// back to word keys like 'morning'/'afternoon', that's what this avoids.
export const SLOT_LABELS = {
  '08-10': '8am – 10am',
  '10-12': '10am – 12pm',
  '12-14': '12pm – 2pm',
  '14-16': '2pm – 4pm',
  '16-18': '4pm – 6pm',
  '18-20': '6pm – 8pm',
};

// Customers see a simplified 6-step status instead of the full 12-stage
// internal lifecycle — the operational detail (which rider, which store
// sub-step) isn't their concern. toCustomerStatus() collapses any internal
// status down to one of these; STATUS_LABELS (internal) stays the source of
// truth everywhere else (store/owner/rider views, and the raw `status` field).
export const CUSTOMER_STATUS_ORDER = ['pickup_scheduled', 'picked_up', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered'];

export const CUSTOMER_STATUS_LABELS = {
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Picked Up',
  processing: 'Processing',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const CUSTOMER_STATUS_MAP = {
  pickup_scheduled: 'pickup_scheduled',
  pickup_request_accepted: 'pickup_scheduled',
  driver_arriving_for_pickup: 'pickup_scheduled',
  pickup_in_progress: 'pickup_scheduled',
  picked_up: 'picked_up',
  arrived_at_store: 'processing',
  washing: 'processing',
  ironing: 'processing',
  packed: 'processing',
  ready_for_delivery: 'ready_for_delivery',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export function toCustomerStatus(internalStatus) {
  return CUSTOMER_STATUS_MAP[internalStatus] || internalStatus;
}

// Preset garment categories for the qty breakdown shown on a ticket's bag.
// A rider or a store user can tag an item with one of these (or 'Other'); the
// breakdown is just a groupBy over whatever's been tagged so far.
export const CLOTH_CATEGORIES = ['Shirt', 'Trousers', 'Kurta', 'Saree', 'Shoe', 'Bedsheet', 'Other'];

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
