import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { createStoreOrder } from '@/lib/storeOrderActions';

export async function POST(request) {
  const { actingUserId, ...payload } = await request.json();
  const db = loadDb();
  const result = createStoreOrder(db, payload, actingUserId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  saveDb(result.db);
  return NextResponse.json({ ...result.db, ticket: result.ticket });
}
