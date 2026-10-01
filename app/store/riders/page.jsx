'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppProvider';
import { STATUS_LABELS, RIDER_ACTIVE_STATUSES } from '@/lib/constants';

export default function StoreRidersPage() {
  const { users, tickets, currentUser } = useApp();
  const riders = [...users.filter((u) => u.role === 'rider' && u.storeId === currentUser.storeId)].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const ridersWithTasks = riders.map((rider) => ({
    rider,
    activeTickets: tickets.filter((t) => t.assignedRiderId === rider.id && RIDER_ACTIVE_STATUSES.includes(t.status)),
  }));
  const activeCount = ridersWithTasks.filter((r) => r.activeTickets.length > 0).length;

  return (
    <>
      <div className="app-page-head">
        <h1>Riders</h1>
        <p>Live status for every rider at this store</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <strong>{riders.length}</strong>
          <span>Riders</span>
        </div>
        <div className="stat-tile">
          <strong>{activeCount}</strong>
          <span>On a task</span>
        </div>
        <div className="stat-tile">
          <strong>{riders.length - activeCount}</strong>
          <span>Idle</span>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className="empty-state">No riders at this store yet.</div>
      ) : (
        <div className="order-list">
          {ridersWithTasks.map(({ rider, activeTickets }) => (
            <div key={rider.id} className="card-section">
              <div className="ticket-card-top">
                <h3 style={{ margin: 0 }}>{rider.name}</h3>
                <span className={`status-badge ${activeTickets.length ? 'rider-active' : 'rider-idle'}`}>
                  {activeTickets.length ? `🟢 On ${activeTickets.length} task${activeTickets.length === 1 ? '' : 's'}` : '⚪ Idle'}
                </span>
              </div>
              {activeTickets.length > 0 && (
                <ul className="rider-task-list">
                  {activeTickets.map((t) => (
                    <li key={t.id}>
                      <Link href={`/store/tickets/${t.id}`}>#{t.id.replace('tk-', '')}</Link> — {STATUS_LABELS[t.status]}
                      <span style={{ color: 'var(--text-muted)' }}> · 📍 {t.pickupAddress}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
