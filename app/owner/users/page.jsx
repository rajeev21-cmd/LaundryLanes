'use client';

import { useApp } from '@/lib/AppProvider';
import { ROLE_LABELS } from '@/lib/constants';

export default function OwnerUsersPage() {
  const { users, stores } = useApp();
  const sorted = [...users].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));

  return (
    <>
      <div className="app-page-head">
        <h1>Users</h1>
        <p>{users.length} account(s) — demo data, see data/users.json</p>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Store</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>{stores.find((s) => s.id === u.storeId)?.name || '—'}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
