'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { ROLE_LABELS, EMPLOYEE_ROLES } from '@/lib/constants';

// Each cell saves itself immediately (role/store on change, email on blur) —
// same auto-save pattern as the bag-assign-to-store dropdown elsewhere in
// this app, no separate "Save" button. Kept as its own component so each
// row's in-progress email edit has its own isolated local state.
function EmployeeRow({ user, stores, isSelf, onUpdate, onDelete }) {
  const [email, setEmail] = useState(user.email);
  const [deleting, setDeleting] = useState(false);
  const needsStore = user.role !== 'owner';

  function handleRoleChange(e) {
    const role = e.target.value;
    onUpdate(user.id, { role, storeId: role === 'owner' ? undefined : user.storeId });
  }

  function handleStoreChange(e) {
    onUpdate(user.id, { storeId: e.target.value });
  }

  function handleEmailBlur() {
    if (email.trim() && email !== user.email) onUpdate(user.id, { email: email.trim() });
  }

  async function handleDelete() {
    if (!window.confirm(`Remove ${user.name}? They won't be able to log in anymore.`)) return;
    setDeleting(true);
    await onDelete(user.id);
  }

  return (
    <tr>
      <td>{user.name}</td>
      <td>
        <select value={user.role} onChange={handleRoleChange}>
          {EMPLOYEE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </td>
      <td>
        {needsStore ? (
          <select value={user.storeId || ''} onChange={handleStoreChange}>
            <option value="" disabled>
              Choose a store…
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          '—'
        )}
      </td>
      <td>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleEmailBlur} />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={isSelf || deleting}
          title={isSelf ? "You can't remove your own account while logged in as it" : undefined}
          onClick={handleDelete}
        >
          🗑️ {deleting ? 'Removing…' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

export default function OwnerEmployeesPage() {
  const { users, stores, currentUser, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const employees = [...users]
    .filter((u) => u.role !== 'customer')
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));

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

  return (
    <>
      <div className="app-page-head">
        <h1>Employees</h1>
        <p>{employees.length} account(s)</p>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <EmployeeRow
                key={u.id}
                user={u}
                stores={stores}
                isSelf={u.id === currentUser.id}
                onUpdate={updateEmployee}
                onDelete={deleteEmployee}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
