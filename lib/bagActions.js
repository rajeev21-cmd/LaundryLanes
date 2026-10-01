// Server-only. Bag inventory — owner-provisioned pool, assigned to a store,
// then to whichever ticket a rider currently has it on. Separate from
// ticketActions.js since generating/assigning bags isn't a ticket mutation;
// POST /api/bags and PATCH /api/bags/[id] are the only callers.

export function generateBags(db, { count }) {
  const n = Math.max(1, Math.min(200, Number(count) || 0));
  let seq = db.nextBagSeq || 1000;
  const created = [];
  for (let i = 0; i < n; i += 1) {
    created.push({ id: `BAG-${String(seq).padStart(4, '0')}`, storeId: null, ticketId: null });
    seq += 1;
  }
  return { db: { ...db, bags: [...db.bags, ...created], nextBagSeq: seq }, created };
}

// A bag can only be reassigned while it's sitting available (not currently
// tied to a ticket) — moving a bag that's mid-pickup to a different store
// would orphan the ticket holding it.
export function assignBagToStore(db, bagId, { storeId }) {
  const bag = db.bags.find((b) => b.id === bagId);
  if (!bag) return { error: `No bag found with id "${bagId}"` };
  if (bag.ticketId) return { error: `Bag ${bagId} is currently in use on a ticket — wait until it's returned to reassign it` };
  return { db: { ...db, bags: db.bags.map((b) => (b.id === bagId ? { ...b, storeId } : b)) } };
}
