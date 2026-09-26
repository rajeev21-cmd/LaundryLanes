'use client';

import { useApp } from '@/lib/AppProvider';
import OrderCard from '@/components/OrderCard';

export default function CustomerOrdersPage() {
  const { orders, currentUser, cancelOrder } = useApp();
  const myOrders = [...orders]
    .filter((o) => o.customerId === currentUser.id)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  return (
    <>
      <div className="app-page-head">
        <h1>My Orders</h1>
        <p>{myOrders.length} order(s) total</p>
      </div>

      {myOrders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        <div className="order-list">
          {myOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showCustomer={false}
              showStore
              actions={
                order.status === 'pending' ? (
                  <button className="btn btn-outline btn-sm" onClick={() => cancelOrder(order.id)}>
                    Cancel order
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
