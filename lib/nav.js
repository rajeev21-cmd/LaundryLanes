export const NAV_ITEMS = {
  customer: [
    { href: '/customer', label: 'Home', icon: '🏠' },
    { href: '/customer/book', label: 'Book a Pickup', icon: '🧺' },
    { href: '/customer/orders', label: 'My Orders', icon: '📦' },
  ],
  store: [
    { href: '/store', label: "Today's Pickups", icon: '📋' },
    { href: '/store/orders', label: 'All Orders', icon: '🗂️' },
  ],
  worker: [{ href: '/worker', label: 'My Schedule', icon: '🚚' }],
  owner: [
    { href: '/owner', label: 'Overview', icon: '📊' },
    { href: '/owner/stores', label: 'Stores', icon: '🏬' },
    { href: '/owner/orders', label: 'All Orders', icon: '🗂️' },
    { href: '/owner/users', label: 'Users', icon: '👥' },
  ],
};
