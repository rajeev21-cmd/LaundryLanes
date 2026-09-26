import { NextResponse } from 'next/server';
import { loadDb } from '@/lib/serverDb';

// Without this, Next can statically optimize this GET at build time (it takes
// no dynamic input) and would then always serve the build-time snapshot of
// the "database" instead of reading it fresh on every request.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(loadDb());
}
