'use client';

import { useApp } from '@/lib/AppProvider';
import OrderCard from '@/components/OrderCard';

export default function StoreTodayPage() {
  const { orders, users, currentUser, today, assignWorker } = useApp();
  const todaysOrders = orders
    .filter((o) => o.storeId === currentUser.storeId && o.pickupDate === today)
    .sort((a, b) => a.slot.localeCompare(b.slot));
  const workers = users.filter((u) => u.role === 'worker' && u.storeId === currentUser.storeId);

  const pendingCount = todaysOrders.filter((o) => o.status === 'pending').length;

  return (
    <>
      <div className="app-page-head">
        <h1>Today&apos;s Pickups</h1>
        <p>
          {todaysOrders.length} pickup(s) today · {pendingCount} unassigned
        </p>
      </div>

      {todaysOrders.length === 0 ? (
        <div className="empty-state">No pickups scheduled for today.</div>
      ) : (
        <div className="order-list">
          {todaysOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                order.status === 'pending' || order.status === 'assigned' ? (
                  <div className="select-inline">
                    <select
                      value={order.assignedWorkerId || ''}
                      onChange={(e) => assignWorker(order.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Assign a worker…
                      </option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
