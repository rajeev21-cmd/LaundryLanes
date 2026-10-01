import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { TICKET_ACTIONS } from '@/lib/ticketActions';

export async function PATCH(request, { params }) {
  const { action, payload, actingUserId } = await request.json();
  const fn = TICKET_ACTIONS[action];
  if (!fn) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
  const db = loadDb();
  const result = fn(db, params.id, payload || {}, actingUserId);
  // Most actions always succeed and return the next db directly. A few
  // (scanBag, addCloth) can fail validation against the bag/tag pool and
  // return { error } instead — in that case nothing changed, so don't save.
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  saveDb(result);
  return NextResponse.json(result);
}
