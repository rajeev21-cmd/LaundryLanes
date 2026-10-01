// Server-only. Employee account creation — separate from ticketActions.js
// since it's not about mutating a ticket; POST /api/users is the only caller.

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function addEmployee(db, { name, email, password, role, storeId }) {
  const user = {
    id: nextId('u'),
    name,
    email,
    password,
    role,
    ...(role === 'owner' ? {} : { storeId }),
  };
  return { db: { ...db, users: [...db.users, user] }, user };
}

// role/storeId/email are all optional — only the fields actually passed get
// changed. Switching role to 'owner' drops storeId (owners don't have one);
// switching away from 'owner' leaves storeId as whatever was passed (the UI
// is expected to send one), since there's no "previous store" to fall back to.
export function updateEmployee(db, userId, { role, storeId, email }) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { error: `No user found with id "${userId}"` };
  const updated = { ...user };
  if (role !== undefined) updated.role = role;
  if (email !== undefined) updated.email = email;
  if (storeId !== undefined) updated.storeId = storeId || undefined;
  if (updated.role === 'owner') delete updated.storeId;
  return { db: { ...db, users: db.users.map((u) => (u.id === userId ? updated : u)) } };
}

export function deleteEmployee(db, userId) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { error: `No user found with id "${userId}"` };
  return { db: { ...db, users: db.users.filter((u) => u.id !== userId) } };
}

// A customer created by a store (walk-in/phone order) has no password
// until they first try to log in — this is how they set one themselves.
// Deliberately separate from updateEmployee (which is the owner editing
// someone else's role/store/email) — this is self-service, password-only,
// and refuses to run if a password is already set.
export function claimAccount(db, userId, { password }) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { error: `No user found with id "${userId}"` };
  if (user.password) return { error: 'This account already has a password set' };
  if (!password) return { error: 'A password is required' };
  return { db: { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, password } : u)) } };
}
