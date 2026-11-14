import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// Store the SQLite file at DB_PATH. Docker Compose mounts /data as a
// persistent volume so the database survives container replacement.

// better-sqlite3 docs: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
// volumes docs: https://docs.docker.com/engine/storage/volumes/
const dbPath = process.env.DB_PATH ?? 'app.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

// WAL mode improves concurrency between readers and writers.
db.pragma('journal_mode = WAL');

// Initialize the schema for a new database; leave existing tables intact.
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