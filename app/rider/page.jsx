'use client';

import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';

const PICKUP_STATUSES = ['pickup_request_accepted', 'driver_arriving_for_pickup', 'pickup_in_progress'];
const DELIVERY_STATUSES = ['ready_for_delivery', 'out_for_delivery'];

export default function RiderSchedulePage() {
  const { tickets, currentUser } = useApp();
  const mine = tickets.filter((t) => t.assignedRiderId === currentUser.id);

  const pickupJobs = mine.filter((t) => PICKUP_STATUSES.includes(t.status));
  const deliveryJobs = mine.filter((t) => DELIVERY_STATUSES.includes(t.status));
  const otherJobs = mine.filter((t) => !PICKUP_STATUSES.includes(t.status) && !DELIVERY_STATUSES.includes(t.status));

  return (
    <>
      <div className="app-page-head">
        <h1>My Schedule</h1>
        <p>
          {pickupJobs.length} pickup(s) · {deliveryJobs.length} delivery(ies)
        </p>
      </div>

      {pickupJobs.length > 0 && (
        <>
          <div className="app-page-head" style={{ marginTop: 8 }}>
            <h1 style={{ fontSize: 17 }}>Pickups</h1>
          </div>
          <div className="order-list">
            {pickupJobs.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} href={`/rider/tickets/${ticket.id}`} />
            ))}
          </div>
        </>
      )}

      {deliveryJobs.length > 0 && (
        <>
          <div className="app-page-head" style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 17 }}>Deliveries</h1>
          </div>
          <div className="order-list">
            {deliveryJobs.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} href={`/rider/tickets/${ticket.id}`} />
            ))}
          </div>
        </>
      )}

      {pickupJobs.length === 0 && deliveryJobs.length === 0 && (
        <div className="empty-state">Nothing active assigned to you right now.</div>
      )}

      {otherJobs.length > 0 && (
        <>
          <div className="app-page-head" style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 17 }}>History</h1>
          </div>
          <div className="order-list">
            {otherJobs.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} href={`/rider/tickets/${ticket.id}`} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
