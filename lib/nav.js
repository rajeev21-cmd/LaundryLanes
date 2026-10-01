export const NAV_ITEMS = {
  customer: [
    { href: '/customer', label: 'Home', icon: '🏠' },
    { href: '/customer/book', label: 'Book a Pickup', icon: '🧺' },
    { href: '/customer/tickets', label: 'My Tickets', icon: '🎫' },
  ],
  store: [
    { href: '/store', label: 'Pickup Requests', icon: '📋' },
    { href: '/store/create-order', label: 'Create Order', icon: '➕' },
    { href: '/store/tickets', label: 'All Tickets', icon: '🎫' },
    { href: '/store/riders', label: 'Riders', icon: '🚚' },
    { href: '/store/lookup', label: 'Lookup', icon: '🔍' },
  ],
  rider: [{ href: '/rider', label: 'My Schedule', icon: '🚚' }],
  owner: [
    { href: '/owner', label: 'Overview', icon: '📊' },
    { href: '/owner/stores', label: 'Stores', icon: '🏬' },
    { href: '/owner/tickets', label: 'All Tickets', icon: '🎫' },
    { href: '/owner/riders', label: 'Riders', icon: '🚚' },
    { href: '/owner/bags', label: 'Bags', icon: '📦' },
    { href: '/owner/tags', label: 'Tags', icon: '🏷️' },
    { href: '/owner/lookup', label: 'Lookup', icon: '🔍' },
    { href: '/owner/employees', label: 'Employees', icon: '👷' },
    { href: '/owner/customers', label: 'Customers', icon: '🧺' },
  ],
};
