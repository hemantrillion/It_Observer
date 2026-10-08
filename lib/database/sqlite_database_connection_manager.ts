import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Singleton instance to prevent multiple connections in Next.js hot reload
let databaseInstance: DatabaseSync | null = null;

export function getDatabaseConnection(): DatabaseSync {
  if (!databaseInstance) {
    const dbFilePath = path.join(process.cwd(), 'observatory_storage.db');
    databaseInstance = new DatabaseSync(dbFilePath);
  }
  return databaseInstance;
}
