import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/index.js';

const db = new DatabaseSync(config.dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export default db;
