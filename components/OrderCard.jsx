'use client';

import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';

export default function OrderCard({ order, actions, showCustomer = true, showStore = false }) {
  const { services, users, stores } = useApp();
  const service = services.find((s) => s.id === order.serviceId);
  const customer = users.find((u) => u.id === order.customerId);
  const worker = users.find((u) => u.id === order.assignedWorkerId);
  const store = stores.find((s) => s.id === order.storeId);

  return (
    <div className="order-card">
      <div className="order-card-top">
        <div>
          <div className="order-card-service">{service?.name || order.serviceId}</div>
          <div className="order-card-meta">
            {order.pickupDate} · {SLOT_LABELS[order.slot] || order.slot}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-card-address">📍 {order.pickupAddress}</div>

      <div className="order-card-tags">
        {showCustomer && customer && <span className="order-card-tag">👤 {customer.name}</span>}
        {showStore && store && <span className="order-card-tag">🏬 {store.name}</span>}
        {worker && <span className="order-card-tag">🚚 {worker.name}</span>}
      </div>

      {actions && <div className="order-card-actions">{actions}</div>}
    </div>
  );
}
