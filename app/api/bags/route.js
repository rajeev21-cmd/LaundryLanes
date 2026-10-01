import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { generateBags } from '@/lib/bagActions';

export async function POST(request) {
  const payload = await request.json();
  const db = loadDb();
  const { db: nextDb, created } = generateBags(db, payload);
  saveDb(nextDb);
  return NextResponse.json({ ...nextDb, created });
}
