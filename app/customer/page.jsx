'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import TicketCard from '@/components/TicketCard';
import { calcOrderValue } from '@/lib/constants';

export default function CustomerHomePage() {
  const { tickets, clothes, currentUser, today } = useApp();
  const myTickets = tickets.filter((t) => t.customerId === currentUser.id);
  const upcoming = myTickets
    .filter((t) => t.pickupDate >= today && !['delivered', 'cancelled'].includes(t.status))
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
  const activeCount = myTickets.filter((t) => !['delivered', 'cancelled'].includes(t.status)).length;
  const deliveredTickets = myTickets.filter((t) => t.status === 'delivered');
  const deliveredCount = deliveredTickets.length;
  const cancelledCount = myTickets.filter((t) => t.status === 'cancelled').length;
  const totalSpent = deliveredTickets.reduce((sum, t) => sum + calcOrderValue(clothes.filter((c) => c.ticketId === t.id)), 0);

  return (
    <>
      <div className="app-page-head">
        <h1>Hi, {currentUser.name.split(' ')[0]} 👋</h1>
        <p>Here&apos;s what&apos;s going on with your laundry.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{myTickets.length}</strong>
          <span>Services availed</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>Active</span>
        </div>
        <div className="stat-tile">
          <strong>{deliveredCount}</strong>
          <span>Completed</span>
        </div>
        <div className="stat-tile">
          <strong>{cancelledCount}</strong>
          <span>Cancelled</span>
        </div>
        <div className="stat-tile">
          <strong>₹{totalSpent}</strong>
          <span>Total spent</span>
        </div>
      </div>

      <div className="card-section">
        <Link href="/customer/book" className="btn btn-primary btn-block btn-lg">
          🧺 Book a Pickup
        </Link>
      </div>

      <div className="app-page-head" style={{ marginTop: 8 }}>
        <h1 style={{ fontSize: 17 }}>Upcoming pickups</h1>
      </div>
      {upcoming.length === 0 ? (
        <div className="empty-state">No upcoming pickups yet. Book one to get started!</div>
      ) : (
        <div className="order-list">
          {upcoming.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} href={`/customer/tickets/${ticket.id}`} showCustomer={false} simplified />
          ))}
        </div>
      )}
    </>
  );
}
