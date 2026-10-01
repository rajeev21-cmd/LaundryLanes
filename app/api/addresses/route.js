import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { addAddress } from '@/lib/addressActions';

export async function POST(request) {
  const payload = await request.json();
  const db = loadDb();
  const { db: nextDb, address } = addAddress(db, payload);
  saveDb(nextDb);
  return NextResponse.json({ ...nextDb, address });
}
