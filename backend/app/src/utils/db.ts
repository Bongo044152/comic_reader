import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH ?? 'app.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

export function run(sql: string, params: unknown[] | object = []) {
  return db.prepare(sql).run(params);
}

export function get<T = unknown>(sql: string, params: unknown[] | object = []): T | undefined {
  return db.prepare(sql).get(params) as T | undefined;
}

export { db };