'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppProvider';
import { ROLE_LABELS, EMPLOYEE_ROLES } from '@/lib/constants';

// Read-only row — edits happen in EditEmployeeModal (one submit for
// role+store+email together), not inline per-field auto-save, so a change
// can be reviewed/cancelled before it's applied.
function EmployeeRow({ user, stores, isSelf, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const needsStore = user.role !== 'owner';
  const store = stores.find((s) => s.id === user.storeId);

  async function handleDelete() {
    if (!window.confirm(`Remove ${user.name}? They won't be able to log in anymore.`)) return;
    setDeleting(true);
    await onDelete(user.id);
  }

  return (
    <tr>
      <td>{user.name}</td>
      <td>{ROLE_LABELS[user.role]}</td>
      <td>{needsStore ? store?.name || '—' : '—'}</td>
      <td>{user.email}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onEdit}>
            ✏️ Edit
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={isSelf || deleting}
            title={isSelf ? "You can't remove your own account while logged in as it" : undefined}
            onClick={handleDelete}
          >
            🗑️ {deleting ? 'Removing…' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}

// Rendered once at the page level (not per-row) so it never ends up nested
// inside the <tbody> — a <div> there would be invalid table markup.
function EditEmployeeModal({ user, stores, onSave, onClose }) {
  const [role, setRole] = useState(user.role);
  const [storeId, setStoreId] = useState(user.storeId || '');
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const needsStore = role !== 'owner';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || (needsStore && !storeId)) return;
    setSaving(true);
    setError('');
    const result = await onSave(user.id, { role, email: email.trim(), storeId: needsStore ? storeId : undefined });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>✏️ Edit {user.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-role">Role</label>
            <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value)}>
              {EMPLOYEE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          {needsStore && (
            <div className="form-field">
              <label htmlFor="edit-store">Store</label>
              <select id="edit-store" value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
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
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="edit-email">Email</label>
            <input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn-outline btn-block" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={saving || !email.trim() || (needsStore && !storeId)}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [editingUser, setEditingUser] = useState(null);

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
                onEdit={() => setEditingUser(u)}
                onDelete={deleteEmployee}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditEmployeeModal user={editingUser} stores={stores} onSave={updateEmployee} onClose={() => setEditingUser(null)} />
      )}
    </>
  );
}
