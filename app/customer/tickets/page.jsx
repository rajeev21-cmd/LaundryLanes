'use client';

import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';

export default function CustomerTicketsPage() {
  const { tickets, currentUser } = useApp();
  const myTickets = [...tickets]
    .filter((t) => t.customerId === currentUser.id)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  return (
    <>
      <div className="app-page-head">
        <h1>My Tickets</h1>
        <p>{myTickets.length} ticket(s) total</p>
      </div>

      {myTickets.length === 0 ? (
        <div className="empty-state">No tickets yet.</div>
      ) : (
        <div className="order-list">
          {myTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer={false} showStore href={`/customer/tickets/${ticket.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
