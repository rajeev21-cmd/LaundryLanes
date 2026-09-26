import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildSeedState } from '@/lib/seedData';

// Server-only. Never import this from a 'use client' component.
//
// On Vercel the deployed bundle's own directory is read-only, so we write to
// /tmp instead — which IS writable there, but ephemeral per-instance and wiped
// on cold start/redeploy. Locally we write into .data/ (gitignored) so the
// mock "database" actually persists across `npm run dev` restarts.
const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), 'laundrylanes-db.json')
  : path.join(process.cwd(), '.data', 'db.json');

function readFromDisk() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function writeToDisk(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db), 'utf-8');
}

export function loadDb() {
  const existing = readFromDisk();
  if (existing) return existing;
  const seeded = buildSeedState();
  writeToDisk(seeded);
  return seeded;
}

export function saveDb(db) {
  writeToDisk(db);
  return db;
}

export function resetDb() {
  const seeded = buildSeedState();
  writeToDisk(seeded);
  return seeded;
}
