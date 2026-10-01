import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { claimAccount } from '@/lib/userActions';

export async function POST(request, { params }) {
  const payload = await request.json();
  const db = loadDb();
  const result = claimAccount(db, params.id, payload);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  saveDb(result.db);
  return NextResponse.json(result.db);
}
