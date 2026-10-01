import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { generateClothTags } from '@/lib/tagActions';

export async function POST(request) {
  const payload = await request.json();
  const db = loadDb();
  const { db: nextDb, created } = generateClothTags(db, payload);
  saveDb(nextDb);
  return NextResponse.json({ ...nextDb, created });
}
