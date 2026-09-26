'use client';

import { useApp } from '@/lib/AppProvider';
import OrderCard from '@/components/OrderCard';

const NEXT_STATUS = {
  assigned: { next: 'picked_up', label: 'Mark Picked Up' },
  picked_up: { next: 'in_progress', label: 'Mark In Progress' },
  in_progress: { next: 'delivered', label: 'Mark Delivered' },
};

export default function WorkerSchedulePage() {
  const { orders, currentUser, today, updateOrderStatus } = useApp();
  const mine = orders
    .filter((o) => o.assignedWorkerId === currentUser.id)
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate) || a.slot.localeCompare(b.slot));

  const todaysJobs = mine.filter((o) => o.pickupDate === today && !['delivered', 'cancelled'].includes(o.status));
  const otherJobs = mine.filter((o) => !todaysJobs.includes(o));

  return (
    <>
      <div className="app-page-head">
        <h1>My Schedule</h1>
        <p>{todaysJobs.length} job(s) today</p>
      </div>

      {todaysJobs.length === 0 ? (
        <div className="empty-state">Nothing assigned to you for today.</div>
      ) : (
        <div className="order-list">
          {todaysJobs.map((order) => {
            const step = NEXT_STATUS[order.status];
            return (
              <OrderCard
                key={order.id}
                order={order}
                actions={
                  step ? (
                    <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(order.id, step.next)}>
                      {step.label}
                    </button>
                  ) : null
                }
              />
            );
          })}
        </div>
      )}

      {otherJobs.length > 0 && (
        <>
          <div className="app-page-head" style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 17 }}>Other jobs</h1>
          </div>
          <div className="order-list">
            {otherJobs.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
