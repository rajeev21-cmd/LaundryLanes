// Server-only. Garment-tag inventory — owner-provisioned pool of ids, not
// store-scoped (unlike bags, any rider can use any unused tag). A tag is
// "used" the moment some cloth record references it (see lib/clothes
// lookups in ticketActions.js's addCloth) and never goes back in the pool —
// single-use, unlike reusable bags. POST /api/tags is the only caller.

export function generateClothTags(db, { count }) {
  const n = Math.max(1, Math.min(500, Number(count) || 0));
  let seq = db.nextTagSeq || 31;
  const created = [];
  for (let i = 0; i < n; i += 1) {
    created.push({ id: `TAG-${String(seq).padStart(5, '0')}` });
    seq += 1;
  }
  return { db: { ...db, clothTags: [...db.clothTags, ...created], nextTagSeq: seq }, created };
}
