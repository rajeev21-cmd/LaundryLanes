import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { bookPickup } from '@/lib/ticketActions';

export async function POST(request) {
  const payload = await request.json();
  const db = loadDb();
  const { db: nextDb, ticket } = bookPickup(db, payload);
  saveDb(nextDb);
  return NextResponse.json({ ...nextDb, ticket });
}
