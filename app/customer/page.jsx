'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import OrderCard from '@/components/OrderCard';

export default function CustomerHomePage() {
  const { orders, currentUser, today } = useApp();
  const myOrders = orders.filter((o) => o.customerId === currentUser.id);
  const upcoming = myOrders
    .filter((o) => o.pickupDate >= today && o.status !== 'cancelled' && o.status !== 'delivered')
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
  const activeCount = myOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const deliveredCount = myOrders.filter((o) => o.status === 'delivered').length;

  return (
    <>
      <div className="app-page-head">
        <h1>Hi, {currentUser.name.split(' ')[0]} 👋</h1>
        <p>Here&apos;s what&apos;s going on with your laundry.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>Active orders</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Completed orders</span>
        </div>
      </div>

      <div className="card-section">
        <Link href="/customer/book" className="btn btn-primary btn-block btn-lg">
          🧺 Book a Pickup
        </Link>
      </div>

      <div className="app-page-head" style={{ marginTop: 8 }}>
        <h1 style={{ fontSize: 17 }}>Upcoming pickups</h1>
      </div>
      {upcoming.length === 0 ? (
        <div className="empty-state">No upcoming pickups yet. Book one to get started!</div>
      ) : (
        <div className="order-list">
          {upcoming.map((order) => (
            <OrderCard key={order.id} order={order} showCustomer={false} />
          ))}
        </div>
      )}
    </>
  );
}
