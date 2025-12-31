import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../plant_diagnosis.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export const getDb = () => db;

export const query = (sql: string, params: any[] = []) => {
    return db.prepare(sql).all(params);
};

export const run = (sql: string, params: any[] = []) => {
    return db.prepare(sql).run(params);
};

export const get = (sql: string, params: any[] = []) => {
    return db.prepare(sql).get(params);
};
