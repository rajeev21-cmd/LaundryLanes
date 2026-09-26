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
  const nextDb = fn(db, params.id, payload || {}, actingUserId);
  saveDb(nextDb);
  return NextResponse.json(nextDb);
}
