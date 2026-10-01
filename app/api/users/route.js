import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { addEmployee } from '@/lib/userActions';

export async function POST(request) {
  const payload = await request.json();
  const db = loadDb();
  const { db: nextDb, user } = addEmployee(db, payload);
  saveDb(nextDb);
  return NextResponse.json({ ...nextDb, user });
}
