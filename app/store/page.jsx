'use client';

import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';

const PICKUP_PHASE_STATUSES = ['pickup_scheduled', 'pickup_request_accepted', 'driver_arriving_for_pickup', 'pickup_in_progress'];

export default function StorePickupRequestsPage() {
  const { tickets, currentUser, today } = useApp();
  const todaysPickups = tickets
    .filter((t) => t.storeId === currentUser.storeId && t.pickupDate === today && PICKUP_PHASE_STATUSES.includes(t.status))
    .sort((a, b) => a.slot.localeCompare(b.slot));

  const scheduledCount = todaysPickups.filter((t) => t.status === 'pickup_scheduled').length;
  const acceptedCount = todaysPickups.filter((t) => t.status === 'pickup_request_accepted').length;
  const arrivingCount = todaysPickups.filter((t) => t.status === 'driver_arriving_for_pickup').length;
  const inProgressCount = todaysPickups.filter((t) => t.status === 'pickup_in_progress').length;

  return (
    <>
      <div className="app-page-head">
        <h1>Pickup Requests</h1>
        <p>{todaysPickups.length} in the pickup pipeline today</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{scheduledCount}</strong>
          <span>Awaiting rider</span>
        </div>
        <div className="stat-tile">
          <strong>{acceptedCount}</strong>
          <span>Accepted</span>
        </div>
        <div className="stat-tile">
          <strong>{arrivingCount}</strong>
          <span>Rider arriving</span>
        </div>
        <div className="stat-tile">
          <strong>{inProgressCount}</strong>
          <span>Pickup in progress</span>
        </div>
      </div>

      {todaysPickups.length === 0 ? (
        <div className="empty-state">No pickups in progress today.</div>
      ) : (
        <div className="order-list dense">
          {todaysPickups.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/store/tickets/${ticket.id}`} dense />
          ))}
        </div>
      )}
    </>
  );
}
