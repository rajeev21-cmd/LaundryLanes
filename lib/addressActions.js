// Server-only. Address book — separate from ticketActions.js since it's not
// about mutating a ticket; POST /api/addresses is the only caller.

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function addAddress(db, { customerId, label, line1, line2, landmark, city, pincode }) {
  const address = {
    id: nextId('addr'),
    customerId,
    label: label || 'Address',
    line1,
    line2: line2 || '',
    landmark: landmark || '',
    city: city || 'Bengaluru',
    pincode,
  };
  return { db: { ...db, addresses: [...(db.addresses || []), address] }, address };
}
