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
