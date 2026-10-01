'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { ROLE_LABELS, EMPLOYEE_ROLES, calcOrderValue } from '@/lib/constants';

export default function OwnerUsersPage() {
  const { users, stores, tickets, clothes, addEmployee } = useApp();
  const sorted = [...users].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');
  const [storeId, setStoreId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addedName, setAddedName] = useState('');

  const needsStore = role === 'rider' || role === 'store';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const user = await addEmployee({ name, email, password, role, storeId: needsStore ? storeId : undefined });
    setSubmitting(false);
    setAddedName(user.name);
    setName('');
    setEmail('');
    setPassword('');
    setRole('rider');
    setStoreId('');
  }

  function customerStats(customerId) {
    const theirTickets = tickets.filter((t) => t.customerId === customerId);
    const delivered = theirTickets.filter((t) => t.status === 'delivered');
    const cancelled = theirTickets.filter((t) => t.status === 'cancelled').length;
    const spent = delivered.reduce((sum, t) => sum + calcOrderValue(clothes.filter((c) => c.ticketId === t.id)), 0);
    return { spent, availed: theirTickets.length, completed: delivered.length, cancelled };
  }

  return (
    <>
      <div className="app-page-head">
        <h1>Users</h1>
        <p>{users.length} account(s)</p>
      </div>

      <div className="card-section">
        <h3>Add Employee</h3>
        {addedName && <p className="form-success" style={{ marginBottom: 14 }}>✅ {addedName} added — they can log in with the email/password you set.</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="emp-name">Name</label>
            <input id="emp-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="emp-email">Email</label>
            <input id="emp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="emp-password">Password</label>
            <input id="emp-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="form-hint">Plaintext demo auth, same as every other account in this app — not real security.</p>
          </div>
          <div className="form-field">
            <label htmlFor="emp-role">Role</label>
            <select id="emp-role" value={role} onChange={(e) => setRole(e.target.value)}>
              {EMPLOYEE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          {needsStore && (
            <div className="form-field">
              <label htmlFor="emp-store">Store</label>
              <select id="emp-store" value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
                <option value="" disabled>
                  Choose a store…
                </option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || (needsStore && !storeId)}>
            {submitting ? 'Adding…' : 'Add Employee'}
          </button>
        </form>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Store</th>
              <th>Email</th>
              <th>Spent</th>
              <th>Availed</th>
              <th>Completed</th>
              <th>Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => {
              const isCustomer = u.role === 'customer';
              const stats = isCustomer ? customerStats(u.id) : null;
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>{stores.find((s) => s.id === u.storeId)?.name || '—'}</td>
                  <td>{u.email}</td>
                  <td>{isCustomer ? `₹${stats.spent}` : '—'}</td>
                  <td>{isCustomer ? stats.availed : '—'}</td>
                  <td>{isCustomer ? stats.completed : '—'}</td>
                  <td>{isCustomer ? stats.cancelled : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
