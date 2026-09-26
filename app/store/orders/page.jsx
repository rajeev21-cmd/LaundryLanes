'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import OrderCard from '@/components/OrderCard';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';

export default function StoreOrdersPage() {
  const { orders, currentUser } = useApp();
  const [filter, setFilter] = useState('all');

  const storeOrders = [...orders]
    .filter((o) => o.storeId === currentUser.storeId)
    .filter((o) => filter === 'all' || o.status === filter)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  return (
    <>
      <div className="app-page-head">
        <h1>All Orders</h1>
        <p>Every pickup ever assigned to this store</p>
      </div>

      <div className="filter-row">
        <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {storeOrders.length === 0 ? (
        <div className="empty-state">No orders match this filter.</div>
      ) : (
        <div className="order-list">
          {storeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}
