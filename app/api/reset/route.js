import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/serverDb';

export async function POST() {
  return NextResponse.json(resetDb());
}
