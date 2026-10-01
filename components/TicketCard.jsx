'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { SLOT_LABELS } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';

export default function TicketCard({ ticket, href, showCustomer = true, showStore = false, dense = false, simplified = false }) {
  const { services, users, stores } = useApp();
  const service = services.find((s) => s.id === ticket.serviceId);
  const customer = users.find((u) => u.id === ticket.customerId);
  const rider = users.find((u) => u.id === ticket.assignedRiderId);
  const store = stores.find((s) => s.id === ticket.storeId);

  const content = (
    <div className={`ticket-card ${dense ? 'dense' : ''}`}>
      <div className="ticket-card-top">
        <div>
          <div className="ticket-card-service">
            {service?.name || ticket.serviceId} <span className="ticket-card-id">#{ticket.id.replace('tk-', '')}</span>
          </div>
          <div className="ticket-card-meta">
            {ticket.pickupDate} · {SLOT_LABELS[ticket.slot] || ticket.slot}
          </div>
        </div>
        <StatusBadge status={ticket.status} simplified={simplified} />
      </div>

      {!dense && <div className="ticket-card-address">📍 {ticket.pickupAddress}</div>}

      <div className="ticket-card-tags">
        {showCustomer && customer && <span className="ticket-card-tag">👤 {customer.name}</span>}
        {showStore && (store ? (
          <span className="ticket-card-tag">🏬 {store.name}</span>
        ) : (
          ticket.status !== 'cancelled' && <span className="ticket-card-tag unclaimed">🏬 Unclaimed</span>
        ))}
        {rider && <span className="ticket-card-tag">🚚 {rider.name}</span>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="ticket-card-link">{content}</Link> : content;
}
