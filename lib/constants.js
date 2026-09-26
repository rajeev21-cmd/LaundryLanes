export const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_ORDER = ['pending', 'assigned', 'picked_up', 'in_progress', 'delivered', 'cancelled'];

export const SLOT_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–4pm)',
  evening: 'Evening (4pm–8pm)',
};

export const ROLE_LABELS = {
  customer: 'Customer',
  store: 'Store',
  worker: 'Worker',
  owner: 'Owner',
};

export const ROLE_HOME = {
  customer: '/customer',
  store: '/store',
  worker: '/worker',
  owner: '/owner',
};
