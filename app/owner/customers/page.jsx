'use client';

import { useApp } from '@/lib/AppProvider';
import { calcOrderValue } from '@/lib/constants';

export default function OwnerCustomersPage() {
  const { users, tickets, clothes } = useApp();
  const customers = [...users].filter((u) => u.role === 'customer').sort((a, b) => a.name.localeCompare(b.name));

  function statsFor(customerId) {
    const theirTickets = tickets.filter((t) => t.customerId === customerId);
    const delivered = theirTickets.filter((t) => t.status === 'delivered');
    const cancelled = theirTickets.filter((t) => t.status === 'cancelled').length;
    const spent = delivered.reduce((sum, t) => sum + calcOrderValue(clothes.filter((c) => c.ticketId === t.id)), 0);
    const rated = theirTickets.filter((t) => t.ratedAt);
    const avgRiderGiven = rated.length ? rated.reduce((s, t) => s + (t.riderRating || 0), 0) / rated.length : null;
    const avgServiceGiven = rated.length ? rated.reduce((s, t) => s + (t.serviceRating || 0), 0) / rated.length : null;
    return { spent, availed: theirTickets.length, completed: delivered.length, cancelled, avgRiderGiven, avgServiceGiven };
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Customers</h1>
        <p>{customers.length} account(s)</p>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Spent</th>
              <th>Availed</th>
              <th>Completed</th>
              <th>Cancelled</th>
              <th>Avg Rider Rating Given</th>
              <th>Avg Service Rating Given</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u) => {
              const stats = statsFor(u.id);
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>₹{stats.spent}</td>
                  <td>{stats.availed}</td>
                  <td>{stats.completed}</td>
                  <td>{stats.cancelled}</td>
                  <td>{stats.avgRiderGiven != null ? `${stats.avgRiderGiven.toFixed(1)} ★` : '—'}</td>
                  <td>{stats.avgServiceGiven != null ? `${stats.avgServiceGiven.toFixed(1)} ★` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
