'use client';

import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';

const PICKUP_PHASE_STATUSES = ['pickup_scheduled', 'pickup_request_accepted', 'driver_arriving_for_pickup', 'pickup_in_progress'];

export default function StorePickupRequestsPage() {
  const { tickets, currentUser, today } = useApp();
  const todaysPickups = tickets
    .filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && PICKUP_PHASE_STATUSES.includes(t.status))
    .sort((a, b) => a.slot.localeCompare(b.slot));

  const needsRiderCount = todaysPickups.filter((t) => t.status === 'pickup_scheduled').length;

  return (
    <>
      <div className="app-page-head">
        <h1>Pickup Requests</h1>
        <p>
          {todaysPickups.length} in the pickup pipeline today · {needsRiderCount} awaiting a rider
        </p>
      </div>

      {todaysPickups.length === 0 ? (
        <div className="empty-state">No pickups in progress today.</div>
      ) : (
        <div className="order-list">
          {todaysPickups.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/store/tickets/${ticket.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
