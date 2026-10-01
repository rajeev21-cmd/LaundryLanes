import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/serverDb';
import { updateEmployee, deleteEmployee } from '@/lib/userActions';

export async function PATCH(request, { params }) {
  const payload = await request.json();
  const db = loadDb();
  const result = updateEmployee(db, params.id, payload);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  saveDb(result.db);
  return NextResponse.json(result.db);
}

export async function DELETE(request, { params }) {
  const db = loadDb();
  const result = deleteEmployee(db, params.id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  saveDb(result.db);
  return NextResponse.json(result.db);
}
