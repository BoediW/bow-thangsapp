/**
 * Blueprint Adapter SQLite
 * Menyediakan implementasi kontrak adapter yang sama dengan JsonAdapter.
 * Dapat diaktifkan dengan menginstal better-sqlite3 atau sqlite3.
 */
import { defaultSchema } from '../schema.js';
import logger from '../../utils/logger.js';

export class SqliteAdapter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.data = JSON.parse(JSON.stringify(defaultSchema));
  }

  async init() {
    logger.info(`[SqliteAdapter] Siap diintegrasikan dengan better-sqlite3 di: ${this.dbPath}`);
    // Blueprint:
    // this.db = new Database(this.dbPath);
    // this.db.exec(`CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)`);
  }

  getData() {
    return this.data;
  }

  setData(data) {
    this.data = data;
  }

  async flush() {
    // Sinkronisasi data ke tabel SQLite
  }
}

export default SqliteAdapter;
